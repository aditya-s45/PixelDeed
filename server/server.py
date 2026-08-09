from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import os
import sys
import geopandas as gpd
import pyproj
import threading

# Add parent directory to path to import local modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from download_tiles import download_satellite_imagery_direct
from segment_land_hqsam import segment_satellite_image

app = Flask(__name__)
CORS(app)

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# Global status tracker
status_tracker = {
    'status': 'idle',
    'progress': 0,
    'message': 'Ready'
}

@app.route('/')
def index():
    return jsonify({'status': 'online', 'version': '2.0', 'backend': 'flask-lightweight'})

@app.route('/status')
def get_status():
    return jsonify(status_tracker)

@app.route('/minmax', methods=['POST'])
def minmax():
    try:
        data = request.get_json()
        min_coords = data.get('min')  # [lat, lon]
        max_coords = data.get('max')  # [lat, lon]
        
        print(f'Received Min: {min_coords}, Max: {max_coords}')
        
        # Bbox in lon, lat format
        min_lat, min_lon = min_coords[0], min_coords[1]
        max_lat, max_lon = max_coords[0], max_coords[1]
        
        # Create output directory for imagery
        output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'temp', 'imagery')
        os.makedirs(output_dir, exist_ok=True)
        
        # Download imagery using direct tile stitching
        output_image = os.path.join(output_dir, 'temp_satellite.tif')
        
        status_tracker['status'] = 'downloading'
        status_tracker['message'] = 'Downloading high-resolution satellite imagery...'
        status_tracker['progress'] = 25
        
        result = download_satellite_imagery_direct(min_lon, min_lat, max_lon, max_lat, output_image)
        
        if result['success']:
            status_tracker['status'] = 'segmenting'
            status_tracker['message'] = 'Segmenting land parcels with HQ-SAM AI...'
            status_tracker['progress'] = 50
            
            # Perform segmentation
            seg_result = segment_satellite_image()
            
            if seg_result:
                status_tracker['status'] = 'complete'
                status_tracker['message'] = 'Processing complete.'
                status_tracker['progress'] = 100
                return jsonify({
                    'status': 'success',
                    'imagery': output_image,
                    'message': 'Workflow completed successfully'
                }), 200
            else:
                status_tracker['status'] = 'error'
                status_tracker['message'] = 'Segmentation failed'
                return jsonify({'status': 'error', 'message': 'Segmentation failed'}), 500
        else:
            status_tracker['status'] = 'error'
            status_tracker['message'] = f'Failed to download imagery: {result["error"]}'
            return jsonify({'status': 'error', 'message': result['error']}), 500
            
    except Exception as e:
        status_tracker['status'] = 'error'
        status_tracker['message'] = str(e)
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/get-segments', methods=['GET'])
def get_segments():
    try:
        import rasterio
        import rasterio.mask
        import numpy as np
        
        pkl_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                                    'temp', 'segmentation', 'temp_polygons.pkl')
        tif_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                                    'temp', 'imagery', 'temp_satellite.tif')
        
        if not os.path.exists(pkl_path):
            return jsonify({'status': 'error', 'message': 'Segmentation pickle not found'}), 404
            
        # Read pickle
        import pandas as pd
        gdf = pd.read_pickle(pkl_path)
        
        # Convert to WGS84 if not already
        if gdf.crs is None or gdf.crs.to_string() != 'EPSG:4326':
            gdf = gdf.to_crs('EPSG:4326')
        
        # Calculate areas using geodesic method
        geod = pyproj.Geod(ellps='WGS84')
        
        def calculate_area(geometry):
            try:
                return abs(geod.geometry_area_perimeter(geometry)[0])
            except:
                return 0
        
        gdf['area_m2'] = gdf.geometry.apply(calculate_area)
        
        # AI Valuation Engine
        greenness_scores = []
        qualities = []
        values = []
        
        if os.path.exists(tif_path):
            with rasterio.open(tif_path) as src:
                for geom, area in zip(gdf.geometry, gdf['area_m2']):
                    try:
                        out_image, out_transform = rasterio.mask.mask(src, [geom], crop=True)
                        
                        # Calculate mean R, G, B for non-zero pixels
                        mask = out_image[0] > 0
                        if np.any(mask):
                            r = np.mean(out_image[0][mask])
                            g = np.mean(out_image[1][mask])
                            b = np.mean(out_image[2][mask])
                            
                            # Pseudo-NDVI (Greenness)
                            greenness = (g - r) / (g + r + 0.01)
                        else:
                            greenness = 0
                            
                        # Appraisal logic
                        if greenness > 0.05:
                            quality = "Lush Vegetation"
                            multiplier = 1.5
                        elif greenness < -0.05:
                            quality = "Urban / Developed"
                            multiplier = 2.0
                        else:
                            quality = "Barren / Scrub"
                            multiplier = 0.8
                            
                        # Base rate: 100 GeoTokens per hectare (10,000 m2)
                        base_value = (area / 10000) * 100
                        estimated_value = round(base_value * multiplier)
                        
                        greenness_scores.append(round(float(greenness), 3))
                        qualities.append(quality)
                        values.append(estimated_value)
                        
                    except Exception as e:
                        print(f"Valuation error: {e}")
                        greenness_scores.append(0)
                        qualities.append("Unknown")
                        values.append(0)
        else:
            # Fallback if no TIF
            greenness_scores = [0] * len(gdf)
            qualities = ["Unknown"] * len(gdf)
            values = [round((a / 10000) * 100) for a in gdf['area_m2']]
            
        gdf['greenness'] = greenness_scores
        gdf['quality'] = qualities
        gdf['estimated_value'] = values
        
        geojson_data = gdf.to_json()
        
        return jsonify({'status': 'success', 'data': geojson_data})
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/calculate-areas', methods=['POST'])
def calculate_areas():
    try:
        data = request.get_json()
        selected_ids = data.get('selectedIds', [])
        
        pkl_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                                    'temp', 'segmentation', 'temp_polygons.pkl')
        
        if not os.path.exists(pkl_path):
            return jsonify({'status': 'error', 'message': 'Pickle not found'}), 404
            
        import pandas as pd
        gdf = pd.read_pickle(pkl_path)
        areas = {}
        for idx in selected_ids:
            try:
                segment_id = int(idx) if isinstance(idx, str) else idx
                polygon_row = gdf[gdf['segment_id'] == segment_id]
                
                if not polygon_row.empty:
                    polygon = polygon_row.geometry.iloc[0]
                    geod = pyproj.Geod(ellps='WGS84')
                    area = abs(geod.geometry_area_perimeter(polygon)[0])
                    areas[str(segment_id)] = round(float(area), 2)
                else:
                    areas[str(segment_id)] = 0
            except:
                areas[str(idx)] = 0
        
        return jsonify({'status': 'success', 'areas': areas})
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    return response

if __name__ == '__main__':
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 7860))
    print(f'Server running on http://{host}:{port}')
    app.run(debug=False, host=host, port=port)