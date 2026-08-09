import os
import math
import requests
from io import BytesIO
from PIL import Image
import rasterio
from rasterio.transform import from_bounds
import numpy as np
import concurrent.futures

def deg2num(lat_deg, lon_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (xtile, ytile)

def num2deg(xtile, ytile, zoom):
    n = 2.0 ** zoom
    lon_deg = xtile / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * ytile / n)))
    lat_deg = math.degrees(lat_rad)
    return (lat_deg, lon_deg)

def download_tile(x, y, z, url_template="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"):
    url = url_template.format(x=x, y=y, z=z)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return Image.open(BytesIO(response.content)).convert('RGB')
    except Exception as e:
        print(f"Failed to download tile {x},{y},{z}: {e}")
        return Image.new('RGB', (256, 256), color='black')

def download_satellite_imagery_direct(min_lon, min_lat, max_lon, max_lat, output_path, zoom=18):
    """
    Downloads satellite tiles and stitches them into a GeoTIFF using rasterio.
    Avoids QGIS dependencies entirely.
    """
    try:
        print(f"Downloading tiles for bbox: {min_lon}, {min_lat}, {max_lon}, {max_lat} at zoom {zoom}")
        
        # Calculate tile ranges
        x_min, y_max = deg2num(min_lat, min_lon, zoom)
        x_max, y_min = deg2num(max_lat, max_lon, zoom)
        
        # Number of tiles
        num_x = x_max - x_min + 1
        num_y = y_max - y_min + 1
        
        # Max out at 50 tiles to prevent huge memory/ban issues
        if num_x * num_y > 100:
            print(f"Requested region too large ({num_x * num_y} tiles). Reducing zoom.")
            return download_satellite_imagery_direct(min_lon, min_lat, max_lon, max_lat, output_path, zoom - 1)
            
        print(f"Fetching {num_x * num_y} tiles ({num_x}x{num_y})...")
        
        # Create blank image
        stitched_image = Image.new('RGB', (num_x * 256, num_y * 256))
        
        # Download tiles concurrently
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            future_to_coords = {
                executor.submit(download_tile, x, y, zoom): (x, y)
                for x in range(x_min, x_max + 1)
                for y in range(y_min, y_max + 1)
            }
            
            for future in concurrent.futures.as_completed(future_to_coords):
                x, y = future_to_coords[future]
                img = future.result()
                
                # Paste into stitched image
                paste_x = (x - x_min) * 256
                paste_y = (y - y_min) * 256
                stitched_image.paste(img, (paste_x, paste_y))

        print("Stitching complete. Saving as GeoTIFF...")
        
        # Calculate bounds of the stitched image
        top_left_lat, top_left_lon = num2deg(x_min, y_min, zoom)
        bottom_right_lat, bottom_right_lon = num2deg(x_max + 1, y_max + 1, zoom)
        
        # Convert to arrays for rasterio
        img_array = np.array(stitched_image)
        # Reshape to (bands, height, width) for rasterio
        img_array = np.transpose(img_array, (2, 0, 1))
        
        # Create transform based on full tile bounds, not just the requested bbox
        transform = from_bounds(top_left_lon, bottom_right_lat, bottom_right_lon, top_left_lat, 
                              img_array.shape[2], img_array.shape[1])
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save as GeoTIFF using rasterio (in WGS84 EPSG:4326)
        with rasterio.open(
            output_path,
            'w',
            driver='GTiff',
            height=img_array.shape[1],
            width=img_array.shape[2],
            count=3,
            dtype=img_array.dtype,
            crs='+proj=latlong +datum=WGS84 +no_defs', # EPSG:4326
            transform=transform,
        ) as dst:
            dst.write(img_array)
            
        print(f"Successfully saved GeoTIFF to {output_path}")
        return {
            'success': True,
            'image_path': output_path
        }
        
    except Exception as e:
        print(f"Error in download_satellite_imagery_direct: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
