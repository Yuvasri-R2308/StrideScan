import base64
import numpy as np
import cv2
from scipy.interpolate import griddata

# Mandatory pressure columns
PRESSURE_COLS = [
    'MTK1.P', 'MTK2.P', 'MTK3.P', 'MTK4.P',
    'MTK5.P', 'D1.P', 'L.P', 'C.P'
]

# Anatomical 2D coordinates (normalized [0, 1] for x and y)
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

# Foot contour zero-pressure boundary anchors for realistic anatomical shape
BOUNDARY_ANCHORS = [
    (0.38, 0.05), (0.28, 0.10), (0.48, 0.08), (0.60, 0.12), (0.72, 0.16),  # Toe tips
    (0.26, 0.25), (0.24, 0.40), (0.28, 0.55), (0.34, 0.70),                 # Medial arch
    (0.80, 0.28), (0.80, 0.45), (0.76, 0.60), (0.70, 0.75),                 # Lateral contour
    (0.38, 0.92), (0.50, 0.95), (0.62, 0.92)                               # Heel base
]


def generate_plantar_heatmap(sensor_values: dict, img_size: int = 256) -> np.ndarray:
    """
    Generates an anatomically realistic 256x256 plantar pressure heatmap PNG image.

    Args:
        sensor_values (dict): Mapping of sensor names to peak pressure values.
        img_size (int): Dimensions of square output image in pixels (default 256).

    Returns:
        np.ndarray: BGR heatmap image array of shape (img_size, img_size, 3).
    """
    points = []
    values = []

    # 1. Active sensor readings
    for sensor, val in sensor_values.items():
        if sensor in SENSOR_COORDS:
            points.append(SENSOR_COORDS[sensor])
            values.append(float(val))

    # 2. Boundary zero-pressure anchors
    for anchor in BOUNDARY_ANCHORS:
        points.append(anchor)
        values.append(0.0)

    points = np.array(points)
    values = np.array(values)

    # Normalize sensor values for smooth interpolation
    max_val = np.max(values) if np.max(values) > 0 else 1.0
    norm_values = values / max_val

    # 3. Create 2D pixel grid
    grid_x, grid_y = np.mgrid[0:1:complex(0, img_size), 0:1:complex(0, img_size)]

    # 4. Interpolate pressure using cubic griddata
    try:
        grid_z = griddata(points, norm_values, (grid_x, grid_y), method='cubic', fill_value=0.0)
    except Exception:
        grid_z = griddata(points, norm_values, (grid_x, grid_y), method='linear', fill_value=0.0)

    grid_z = np.nan_to_num(grid_z, nan=0.0)
    grid_z = np.clip(grid_z, 0.0, 1.0)
    grid_z = grid_z.T

    # 5. Apply Gaussian blur for continuous pressure visualization
    blurred = cv2.GaussianBlur(grid_z, (31, 31), sigmaX=0)
    if np.max(blurred) > 0:
        blurred = blurred / np.max(blurred)

    img_uint8 = (blurred * 255).astype(np.uint8)

    # 6. Apply JET colormap
    heatmap_bgr = cv2.applyColorMap(img_uint8, cv2.COLORMAP_JET)

    # 7. Mask background outside foot contour to black
    background_mask = img_uint8 < 5
    heatmap_bgr[background_mask] = [0, 0, 0]

    return heatmap_bgr


def heatmap_to_base64(heatmap_bgr: np.ndarray) -> str:
    """
    Encodes a BGR image array to a Base64 PNG data URL string for JSON responses.
    """
    success, buffer = cv2.imencode('.png', heatmap_bgr)
    if not success:
        raise ValueError("Failed to encode image to PNG format.")
    b64_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/png;base64,{b64_str}"
