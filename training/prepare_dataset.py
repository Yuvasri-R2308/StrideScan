import os
import glob
import warnings
warnings.filterwarnings('ignore')
from pathlib import Path
import numpy as np
import pandas as pd
import cv2
from scipy.interpolate import griddata

# Mandatory pressure columns
PRESSURE_COLS = [
    'MTK1.P', 'MTK2.P', 'MTK3.P', 'MTK4.P',
    'MTK5.P', 'D1.P', 'L.P', 'C.P'
]

# Anatomical 2D coordinates (normalized [0, 1] for x and y)
# x: medial (left) to lateral (right), y: anterior (toes) to posterior (heel)
SENSOR_COORDS = {
    'D1.P':   (0.38, 0.14),  # Hallux / Big Toe
    'MTK1.P': (0.36, 0.32),  # 1st Metatarsal Head
    'MTK2.P': (0.45, 0.30),  # 2nd Metatarsal Head
    'MTK3.P': (0.54, 0.31),  # 3rd Metatarsal Head
    'MTK4.P': (0.63, 0.34),  # 4th Metatarsal Head
    'MTK5.P': (0.72, 0.38),  # 5th Metatarsal Head
    'L.P':    (0.64, 0.58),  # Lateral Midfoot
    'C.P':    (0.50, 0.82)   # Calcaneus / Heel
}

# Foot contour zero-pressure boundary anchors for realistic anatomical masking & shape
BOUNDARY_ANCHORS = [
    (0.38, 0.05), (0.28, 0.10), (0.48, 0.08), (0.60, 0.12), (0.72, 0.16),  # Toe tip contour
    (0.26, 0.25), (0.24, 0.40), (0.28, 0.55), (0.34, 0.70),                 # Medial arch contour
    (0.80, 0.28), (0.80, 0.45), (0.76, 0.60), (0.70, 0.75),                 # Lateral contour
    (0.38, 0.92), (0.50, 0.95), (0.62, 0.92)                               # Heel base contour
]


def generate_plantar_heatmap(sensor_values: dict, img_size: int = 256) -> np.ndarray:
    """
    Generates a realistic 256x256 plantar pressure heatmap PNG image from sensor readings.
    
    Args:
        sensor_values (dict): Mapping of sensor column names to peak pressure values.
        img_size (int): Image size in pixels (default 256).
        
    Returns:
        np.ndarray: BGR image array of size (img_size, img_size, 3).
    """
    points = []
    values = []

    # 1. Add active sensor readings
    for sensor, val in sensor_values.items():
        if sensor in SENSOR_COORDS:
            points.append(SENSOR_COORDS[sensor])
            values.append(float(val))

    # 2. Add boundary anchors with 0 pressure
    for anchor in BOUNDARY_ANCHORS:
        points.append(anchor)
        values.append(0.0)

    points = np.array(points)
    values = np.array(values)

    # Normalize sensor values for consistent interpolation dynamics
    max_val = np.max(values) if np.max(values) > 0 else 1.0
    norm_values = values / max_val

    # 3. Create fine 2D grid
    grid_x, grid_y = np.mgrid[0:1:complex(0, img_size), 0:1:complex(0, img_size)]

    # 4. Interpolate using cubic griddata (fallback to linear)
    try:
        grid_z = griddata(points, norm_values, (grid_x, grid_y), method='cubic', fill_value=0.0)
    except Exception:
        grid_z = griddata(points, norm_values, (grid_x, grid_y), method='linear', fill_value=0.0)

    grid_z = np.nan_to_num(grid_z, nan=0.0)
    grid_z = np.clip(grid_z, 0.0, 1.0)

    # Transpose so grid_y is vertical (rows) and grid_x is horizontal (cols)
    grid_z = grid_z.T

    # 5. Apply Gaussian Blur for realistic smooth thermal/pressure distribution
    blurred = cv2.GaussianBlur(grid_z, (31, 31), sigmaX=0)
    
    # Re-normalize to [0, 255]
    if np.max(blurred) > 0:
        blurred = blurred / np.max(blurred)
    img_uint8 = (blurred * 255).astype(np.uint8)

    # 6. Apply JET Colormap
    heatmap_bgr = cv2.applyColorMap(img_uint8, cv2.COLORMAP_JET)

    # 7. Mask out zero-pressure ambient background to clean black
    background_mask = img_uint8 < 5
    heatmap_bgr[background_mask] = [0, 0, 0]

    return heatmap_bgr


def process_excel_file(file_path: Path) -> np.ndarray:
    """
    Reads an Excel file, extracts time-series pressure values, 
    identifies the Peak Pressure Frame (highest sum across pressure sensors),
    and generates the corresponding heatmap.
    """
    df = pd.read_excel(file_path)

    # Check for missing pressure columns
    missing = [col for col in PRESSURE_COLS if col not in df.columns]
    if missing:
        raise ValueError(f"File {file_path.name} is missing pressure columns: {missing}")

    # Extract pressure sub-dataframe and drop invalid rows
    df_pressure = df[PRESSURE_COLS].dropna()
    if df_pressure.empty:
        raise ValueError(f"File {file_path.name} contains no valid pressure data rows.")

    # Calculate sum of all pressure sensors for each time frame
    frame_sums = df_pressure.sum(axis=1)

    # Locate peak pressure frame index
    peak_idx = frame_sums.idxmax()
    peak_row = df_pressure.loc[peak_idx].to_dict()

    # Generate 256x256 heatmap
    heatmap = generate_plantar_heatmap(peak_row, img_size=256)
    return heatmap


def prepare_dataset(raw_dir: str = "dataset/raw", output_dir: str = "dataset/heatmaps"):
    """
    Recursively scans raw Excel dataset folders, processes peak pressure frames,
    and writes 256x256 heatmap PNG images into Healthy/ and Diabetic/ directories.
    """
    raw_path = Path(raw_dir)
    output_path = Path(output_dir)

    classes = {
        'Healthy': raw_path / 'ContrGr',
        'Diabetic': raw_path / 'DiabGr'
    }

    total_stats = {'Healthy': 0, 'Diabetic': 0}

    print("==================================================")
    print("      StrideScan Dataset Preparation Started      ")
    print("==================================================")

    for class_name, folder_path in classes.items():
        dest_dir = output_path / class_name
        dest_dir.mkdir(parents=True, exist_ok=True)

        if not folder_path.exists():
            print(f"[WARNING] Raw directory not found: {folder_path}")
            continue

        # Recursively find all .xlsx files, skipping hidden files starting with . or ~$
        excel_files = [f for f in folder_path.rglob("*.xlsx") if not f.name.startswith("~$") and not f.name.startswith(".")]
        print(f"--> Processing {class_name} files: Found {len(excel_files)} Excel files.")

        saved_count = 0
        for idx, file_path in enumerate(excel_files, 1):
            try:
                heatmap_img = process_excel_file(file_path)
                out_filename = f"{file_path.stem}_heatmap.png"
                out_filepath = dest_dir / out_filename
                
                # Save as clean 256x256 PNG
                cv2.imwrite(str(out_filepath), heatmap_img)
                saved_count += 1
            except Exception as e:
                print(f"  [ERROR] Failed to process {file_path.name}: {e}")

        total_stats[class_name] = saved_count
        print(f"[SUCCESS] Saved {saved_count} heatmaps for class '{class_name}'.\n")

    print("==================================================")
    print("        Dataset Preparation Summary               ")
    print("==================================================")
    print(f" Healthy images generated:  {total_stats['Healthy']}")
    print(f" Diabetic images generated: {total_stats['Diabetic']}")
    print(f" Heatmaps saved to:        {output_path.resolve()}")
    print("==================================================")


if __name__ == "__main__":
    prepare_dataset()
