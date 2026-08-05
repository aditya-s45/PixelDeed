#############################
# TODO:
# Remove small polygon filtering
# Instead merge smaller polygons into larger ones
#############################

import os
#import leafmap  # Re-enable if needed to patch torch before SamGeo imports
from samgeo.hq_sam import SamGeo
import matplotlib.pyplot as plt
import rasterio
import cv2
import numpy as np
import urllib.request  # Use urllib
import geopandas as gpd
from rasterio import features
from shapely.geometry import shape, Polygon
import torch


# --- START OF MONKEY-PATCH ---
# Force all model loading to CPU (important for systems without GPU)
original_torch_load = torch.load

def cpu_torch_load(path, map_location=None, **kwargs):
    print("Intercepted torch.load: Forcing map_location='cpu'...")
    return original_torch_load(path, map_location=torch.device('cpu'), **kwargs)

torch.load = cpu_torch_load
# --- END OF MONKEY-PATCH ---


def setup_model():
    """Setup HQ-SAM model and return the path to the checkpoint."""
    cache_dir = os.path.expanduser("~/.cache/torch/hub/checkpoints")
    os.makedirs(cache_dir, exist_ok=True)
    
    # Use vit_b (375MB) instead of vit_h (2.5GB) for cloud deployment
    pth_path = os.path.join(cache_dir, "sam_hq_vit_b.pth")

    # Ensure model exists
    if not os.path.exists(pth_path):
        print("Downloading HQ-SAM ViT-B model file (375MB)...")
        url = "https://huggingface.co/lkeab/hq-sam/resolve/main/sam_hq_vit_b.pth"
        urllib.request.urlretrieve(url, pth_path)
        print("Download complete!")

    return pth_path


def plot_results(image_path, annotations_path, output_dir, filename):
    """Create visualization plot showing original, mask, and overlay"""
    with rasterio.open(image_path) as src:
        image = src.read()
        image = ((image - image.min()) * (255 / (image.max() - image.min()))).astype(np.uint8)
        image = np.transpose(image, (1, 2, 0))
        if image.shape[2] == 4:
            image = image[:, :, :3]
    
    with rasterio.open(annotations_path) as src:
        annotations = src.read()
        annotations = np.transpose(annotations, (1, 2, 0))
        if annotations.shape[2] == 4:
            annotations = annotations[:, :, :3]
    
    overlay = cv2.addWeighted(image, 0.7, annotations, 0.3, 0)
    
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(15, 5))
    ax1.imshow(image); ax1.set_title('Original Image'); ax1.axis('off')
    ax2.imshow(annotations); ax2.set_title('Segmentation'); ax2.axis('off')
    ax3.imshow(overlay); ax3.set_title('Overlay'); ax3.axis('off')
    
    plt.tight_layout()
    viz_filename = f'visualization_{os.path.splitext(filename)[0]}.png'
    plt.savefig(os.path.join(output_dir, viz_filename))
    plt.close()


def masks_to_shapefile(mask_path, output_shp_path, threshold_percentile=5):
    """Convert mask TIFF to shapefile with each segment as a polygon."""
    with rasterio.open(mask_path) as src:
        mask = src.read(1)
        transform = src.transform
        crs = src.crs
    
    unique_values = np.unique(mask[mask > 0])
    if len(unique_values) == 0:
        print(f"No valid masks found in {mask_path}")
        return
        
    threshold_value = np.percentile(unique_values, threshold_percentile)
    print(f"Filtering out masks with values below {threshold_value}")
    
    filtered_mask = mask.copy()
    filtered_mask[filtered_mask < threshold_value] = 0
    
    shapes = list(features.shapes(filtered_mask.astype(np.int32), filtered_mask > 0, transform=transform))
    if not shapes:
        print(f"No shapes remain after filtering for {mask_path}")
        return
    
    geometries = [shape(geom) for geom, val in shapes]
    values = [val for geom, val in shapes]
    
    gdf = gpd.GeoDataFrame({
        'geometry': geometries,
        'segment_id': values,
        'area': [geom.area for geom in geometries]
    }, crs=crs)
    
    gdf = gdf.sort_values('segment_id', ascending=False)
    output_pkl_path = output_shp_path.replace('.shp', '.pkl')
    import pandas as pd
    pd.to_pickle(gdf, output_pkl_path)
    print(f"Saved {len(gdf)} polygons to {output_pkl_path}")


def segment_satellite_image():
    """Segment the temporary satellite image."""
    terabound_dir = os.path.dirname(os.path.abspath(__file__))
    input_image = os.path.join(terabound_dir, "temp", "imagery", "temp_satellite.tif")
    output_dir = os.path.join(terabound_dir, "temp", "segmentation")
    os.makedirs(output_dir, exist_ok=True)
    
    if not os.path.exists(input_image):
        print(f"Error: Satellite image not found at {input_image}")
        return False
        
    pth_path = setup_model() 
    if not pth_path:
        print("Error: Failed to setup HQ-SAM model")
        return False
    
    try:
        print("\nStarting segmentation process...")
        print(f"Input image: {input_image}")

        # Convert TIF to PNG if not present
        png_path = input_image + "_temp.png"
        if not os.path.exists(png_path):
            with rasterio.open(input_image) as src:
                img = src.read([1, 2, 3])
                img = np.moveaxis(img, 0, -1)
                img = ((img - img.min()) * (255 / (img.max() - img.min()))).astype(np.uint8)
                cv2.imwrite(png_path, cv2.cvtColor(img, cv2.COLOR_RGB2BGR))
            print(f"Created PNG version for segmentation: {png_path}")

        torch_device = torch.device("cpu")
        print("Forcing HQ-SAM model to load on CPU...")

        sam_kwargs = {
            "points_per_side": 24,
            "pred_iou_thresh": 0.90,
            "stability_score_thresh": 0.95,
            "crop_n_layers": 0,
            "min_mask_region_area": 5000,
            "box_nms_thresh": 0.7,
            "crop_nms_thresh": 0.7,
            "crop_overlap_ratio": 0.34,
            "output_mode": "binary_mask"
        }
        
        # SamGeo will now call our hijacked torch.load function
        sam = SamGeo(
            model_type="vit_b",
            checkpoint=pth_path,
            device=torch_device,
            sam_kwargs=sam_kwargs,
        )
        print("HQ-SAM model initialized successfully on CPU ✅")

        masks_path = os.path.join(output_dir, "temp_masks.tif")
        annotations_path = os.path.join(output_dir, "temp_annotations.tif")
        shapefile_path = os.path.join(output_dir, "temp_polygons.shp")
        
        print("Generating segmentation masks...")
        sam.generate(input_image, output=masks_path, foreground=True, unique=True)
        
        print("Creating annotations...")
        sam.show_anns(axis="off", alpha=1, output=annotations_path)
        
        print("Converting to shapefile...")
        masks_to_shapefile(masks_path, shapefile_path)
        
        print("\nSegmentation complete!")
        print(f"✓ Masks saved: {masks_path}")
        print(f"✓ Annotations saved: {annotations_path}")
        print(f"✓ Shapefile saved: {shapefile_path}")
        
        # Restore the original torch.load function
        torch.load = original_torch_load
        
        return True
        
    except Exception as e:
        print(f"Error during segmentation: {str(e)}")
        # Restore original function even if it fails
        torch.load = original_torch_load
        return False


if __name__ == "__main__":
    segment_satellite_image()
