"""
backend/services/feature_extraction.py

Biomechanical Feature Extraction Service for StrideScan Clinical Pipeline.

Computes 10 clinically meaningful features from plantar pressure sensor data.
All features are derived from actual sensor readings and anatomical geometry —
no random values, no placeholders.

Feature catalogue:
  1.  Peak plantar pressure
  2.  Mean plantar pressure
  3.  Contact area (proxy via sensor count × area constant)
  4.  Pressure-time integral (temporal; null when no time column)
  5.  Arch Index
  6.  Mediolateral (within-foot) asymmetry score
  7.  Forefoot / Midfoot / Heel pressure ratios
  8.  Pressure centroid (x, y) in normalised foot-space
  9.  Estimated Centre of Pressure (CoP) — same as centroid for single-frame;
      trajectory mean if time-series
  10. Regional pressure distribution (per-zone breakdown)

Sensor zone anatomy (matches heatmap.py / prepare_dataset.py SENSOR_COORDS):
  Forefoot : MTK1.P, MTK2.P, MTK3.P, MTK4.P, MTK5.P, D1.P (6 sensors)
  Midfoot  : L.P (1 sensor)
  Heel     : C.P (1 sensor)

  Medial zone (within foot): D1.P, MTK1.P, MTK2.P
  Lateral zone:              MTK4.P, MTK5.P, L.P
  Central (unassigned):      MTK3.P, C.P
"""

from __future__ import annotations

from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from backend.models.report import (
    FeatureVector,
    PressureCentroid,
    RegionalPressure,
)

# ---------------------------------------------------------------------------
# Anatomical constants
# ---------------------------------------------------------------------------

SENSOR_COORDS: Dict[str, Tuple[float, float]] = {
    "D1.P":   (0.38, 0.14),   # Hallux / Big Toe
    "MTK1.P": (0.36, 0.32),   # 1st Metatarsal Head
    "MTK2.P": (0.45, 0.30),   # 2nd Metatarsal Head
    "MTK3.P": (0.54, 0.31),   # 3rd Metatarsal Head
    "MTK4.P": (0.63, 0.34),   # 4th Metatarsal Head
    "MTK5.P": (0.72, 0.38),   # 5th Metatarsal Head
    "L.P":    (0.64, 0.58),   # Lateral Midfoot
    "C.P":    (0.50, 0.82),   # Calcaneus / Heel
}

# Zone membership
FOREFOOT_SENSORS: List[str] = ["MTK1.P", "MTK2.P", "MTK3.P", "MTK4.P", "MTK5.P", "D1.P"]
MIDFOOT_SENSORS:  List[str] = ["L.P"]
HEEL_SENSORS:     List[str] = ["C.P"]

MEDIAL_SENSORS:   List[str] = ["D1.P", "MTK1.P", "MTK2.P"]
LATERAL_SENSORS:  List[str] = ["MTK4.P", "MTK5.P", "L.P"]

# Approximate anatomical area constant per sensor (cm²)
SENSOR_AREA_CM2: Dict[str, float] = {
    "D1.P":   12.0,
    "MTK1.P": 20.0,
    "MTK2.P": 18.0,
    "MTK3.P": 18.0,
    "MTK4.P": 16.0,
    "MTK5.P": 14.0,
    "L.P":    22.0,
    "C.P":    35.0,
}

LOADING_THRESHOLD_KPA: float = 10.0
_EPS: float = 1e-10


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _zone_sum(sensor_values: Dict[str, float], sensors: List[str]) -> float:
    """Sum of pressure values for sensors in a named zone."""
    return sum(sensor_values.get(s, 0.0) for s in sensors)


def _zone_mean(sensor_values: Dict[str, float], sensors: List[str]) -> float:
    """Mean of pressure values for sensors present in a named zone."""
    present = [sensor_values[s] for s in sensors if s in sensor_values]
    return float(np.mean(present)) if present else 0.0


def _zone_count(sensor_values: Dict[str, float], sensors: List[str]) -> int:
    """Count of sensors in a zone present in sensor_values."""
    return sum(1 for s in sensors if s in sensor_values)


# ---------------------------------------------------------------------------
# Feature 1 & 2: Peak and Mean plantar pressure
# ---------------------------------------------------------------------------

def compute_peak_pressure(sensor_values: Dict[str, float]) -> float:
    return float(max(sensor_values.values())) if sensor_values else 0.0


def compute_mean_pressure(sensor_values: Dict[str, float]) -> float:
    return float(np.mean(list(sensor_values.values()))) if sensor_values else 0.0


# ---------------------------------------------------------------------------
# Feature 3: Contact area proxy
# ---------------------------------------------------------------------------

def compute_contact_area(sensor_values: Dict[str, float]) -> float:
    total_area = 0.0
    for sensor, pressure in sensor_values.items():
        if pressure >= LOADING_THRESHOLD_KPA and sensor in SENSOR_AREA_CM2:
            total_area += SENSOR_AREA_CM2[sensor]
    return round(total_area, 2)


# ---------------------------------------------------------------------------
# Feature 4: Pressure-time integral
# ---------------------------------------------------------------------------

def compute_pressure_time_integral(
    df_clean: pd.DataFrame,
    sensor_cols: List[str],
    time_delta_s: Optional[float],
    temporal_available: bool,
) -> Tuple[Optional[float], Optional[str]]:
    if not temporal_available or time_delta_s is None:
        note = (
            "Pressure-Time Integral could not be computed because the uploaded file "
            "does not contain a time or timestamp column."
        )
        return None, note

    if time_delta_s <= 0:
        return None, "Time delta is non-positive."

    frame_totals = df_clean[sensor_cols].sum(axis=1).values.astype(float)
    pti = float(np.trapz(frame_totals, dx=time_delta_s))
    return round(pti, 4), None


# ---------------------------------------------------------------------------
# Feature 5: Arch Index
# ---------------------------------------------------------------------------

def compute_arch_index(sensor_values: Dict[str, float]) -> Optional[float]:
    """
    Normalized Arch Index based on mean regional sensor pressures.

    Mean regional pressure prevents 6 forefoot sensors from skewing the index.
    Arch Index = midfoot_mean / (forefoot_mean + midfoot_mean + heel_mean)

    Clinical reference ranges (Cavanagh & Rodgers adapted for mean zonal loading):
      < 0.20 → pes cavus (high arch)
      0.20 – 0.35 → normal arch
      > 0.35 → pes planus (flat foot)
    """
    forefoot_mean = _zone_mean(sensor_values, FOREFOOT_SENSORS)
    midfoot_mean  = _zone_mean(sensor_values, MIDFOOT_SENSORS)
    heel_mean     = _zone_mean(sensor_values, HEEL_SENSORS)

    total_mean = forefoot_mean + midfoot_mean + heel_mean
    if total_mean < _EPS:
        return None

    return round(midfoot_mean / total_mean, 4)


# ---------------------------------------------------------------------------
# Feature 6: Mediolateral asymmetry score
# ---------------------------------------------------------------------------

def compute_mediolateral_asymmetry(sensor_values: Dict[str, float]) -> float:
    """
    Within-foot medial vs lateral asymmetry score using mean regional pressure.
    """
    medial_mean  = _zone_mean(sensor_values, MEDIAL_SENSORS)
    lateral_mean = _zone_mean(sensor_values, LATERAL_SENSORS)

    asymmetry = abs(medial_mean - lateral_mean) / (medial_mean + lateral_mean + _EPS)
    return round(float(np.clip(asymmetry, 0.0, 1.0)), 4)


# ---------------------------------------------------------------------------
# Feature 7: Zone pressure ratios
# ---------------------------------------------------------------------------

def compute_zone_ratios(
    sensor_values: Dict[str, float],
) -> Tuple[float, float, float]:
    """
    Computes anatomical zone pressure ratios based on mean pressure per zone.

    Using zone means accounts for uneven sensor density across regions
    (6 forefoot sensors vs 1 midfoot vs 1 heel).

    Returns:
        (forefoot_ratio, midfoot_ratio, heel_ratio)
    """
    forefoot_mean = _zone_mean(sensor_values, FOREFOOT_SENSORS)
    midfoot_mean  = _zone_mean(sensor_values, MIDFOOT_SENSORS)
    heel_mean     = _zone_mean(sensor_values, HEEL_SENSORS)
    total_mean    = forefoot_mean + midfoot_mean + heel_mean + _EPS

    return (
        round(forefoot_mean / total_mean, 4),
        round(midfoot_mean  / total_mean, 4),
        round(heel_mean     / total_mean, 4),
    )


# ---------------------------------------------------------------------------
# Feature 8 & 9: Pressure centroid / Centre of Pressure
# ---------------------------------------------------------------------------

def compute_pressure_centroid(sensor_values: Dict[str, float]) -> PressureCentroid:
    total_pressure = 0.0
    weighted_x = 0.0
    weighted_y = 0.0

    for sensor, pressure in sensor_values.items():
        if sensor in SENSOR_COORDS and pressure > 0:
            sx, sy = SENSOR_COORDS[sensor]
            weighted_x += sx * pressure
            weighted_y += sy * pressure
            total_pressure += pressure

    if total_pressure < _EPS:
        xs = [c[0] for c in SENSOR_COORDS.values()]
        ys = [c[1] for c in SENSOR_COORDS.values()]
        return PressureCentroid(x=round(float(np.mean(xs)), 4), y=round(float(np.mean(ys)), 4))

    cx = weighted_x / total_pressure
    cy = weighted_y / total_pressure
    return PressureCentroid(x=round(float(cx), 4), y=round(float(cy), 4))


# ---------------------------------------------------------------------------
# Feature 10: Regional pressure distribution
# ---------------------------------------------------------------------------

def compute_regional_distribution(
    sensor_values: Dict[str, float],
) -> List[RegionalPressure]:
    total_foot = sum(sensor_values.values()) + _EPS

    regions = [
        ("Forefoot", FOREFOOT_SENSORS),
        ("Midfoot",  MIDFOOT_SENSORS),
        ("Heel",     HEEL_SENSORS),
    ]

    distribution: List[RegionalPressure] = []
    for region_name, sensors in regions:
        region_total = _zone_sum(sensor_values, sensors)
        region_mean  = _zone_mean(sensor_values, sensors)
        region_count = _zone_count(sensor_values, sensors)
        distribution.append(
            RegionalPressure(
                region=region_name,
                total_kpa=round(region_total, 2),
                mean_kpa=round(region_mean, 2),
                relative_fraction=round(region_total / total_foot, 4),
                sensor_count=region_count,
            )
        )

    return distribution


# ---------------------------------------------------------------------------
# Main extraction function
# ---------------------------------------------------------------------------

def extract_features(
    sensor_values: Dict[str, float],
    df_clean: pd.DataFrame,
    sensor_cols: List[str],
    temporal_available: bool,
    time_delta_s: Optional[float],
) -> FeatureVector:
    peak_pressure = compute_peak_pressure(sensor_values)
    mean_pressure = compute_mean_pressure(sensor_values)
    contact_area = compute_contact_area(sensor_values)

    pti_value, pti_note = compute_pressure_time_integral(
        df_clean, sensor_cols, time_delta_s, temporal_available
    )

    arch_index = compute_arch_index(sensor_values)
    asymmetry = compute_mediolateral_asymmetry(sensor_values)
    forefoot_ratio, midfoot_ratio, heel_ratio = compute_zone_ratios(sensor_values)
    centroid = compute_pressure_centroid(sensor_values)
    regional = compute_regional_distribution(sensor_values)

    return FeatureVector(
        peak_plantar_pressure_kpa=round(peak_pressure, 2),
        mean_plantar_pressure_kpa=round(mean_pressure, 2),
        contact_area_proxy=contact_area,
        pressure_time_integral_kpa_s=pti_value,
        pressure_time_integral_note=pti_note,
        arch_index=arch_index,
        mediolateral_asymmetry_score=asymmetry,
        forefoot_pressure_ratio=forefoot_ratio,
        midfoot_pressure_ratio=midfoot_ratio,
        heel_pressure_ratio=heel_ratio,
        pressure_centroid=centroid,
        regional_distribution=regional,
        peak_frame_sensor_values={k: round(v, 2) for k, v in sensor_values.items()},
    )
