"""
backend/preprocess.py

Data preprocessing pipeline for StrideScan plantar pressure Excel/CSV files.

Public API (backward-compatible):
  extract_peak_pressure(file_input) -> Tuple[Dict[str, float], float]
    Unchanged signature. Now internally uses the robust pipeline.

New public functions (v2 pipeline):
  preprocess_file(file_input) -> PreprocessedData
    Returns full preprocessed state including the complete time-series DataFrame,
    peak-frame sensor values, and metadata flags (temporal data available, etc.)

Design notes:
  - All new helpers are pure functions (no side-effects, no global state).
  - Raises ValueError with a descriptive message on any validation failure.
  - Does NOT silently drop >50 % missing data in any pressure column.
"""

from __future__ import annotations

import io
import warnings
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Core pressure sensor columns that must be present in every file.
PRESSURE_COLS: List[str] = [
    "MTK1.P", "MTK2.P", "MTK3.P", "MTK4.P",
    "MTK5.P", "D1.P", "L.P", "C.P",
]

# Maximum tolerated fraction of missing values per pressure column before raising.
MAX_MISSING_FRACTION: float = 0.50

# Minimum number of valid (non-NaN) rows required after cleaning.
MIN_VALID_ROWS: int = 3

# Noise filter: rolling-median window size (samples). Must be odd.
NOISE_FILTER_WINDOW: int = 3

# Candidate column names that indicate time/timestamp data.
TIME_COLUMN_CANDIDATES: List[str] = ["Time", "time", "TIME", "t", "ms", "Timestamp", "timestamp"]


# ---------------------------------------------------------------------------
# Preprocessed data container
# ---------------------------------------------------------------------------

@dataclass
class PreprocessedData:
    """
    Full preprocessing result returned by preprocess_file().

    Attributes:
        df_raw:               Original DataFrame as parsed from the file.
        df_clean:             Cleaned, noise-filtered, NaN-imputed pressure DataFrame.
        df_normalized:        Min-max normalised version of df_clean (pressure cols only).
        peak_sensor_values:   Dict of sensor_name → kPa at the peak pressure frame.
        total_peak_pressure:  Sum of all sensor values at the peak frame (kPa).
        temporal_data_available: True if a time column was detected in the source file.
        time_column_name:     Name of the detected time column (None if absent).
        time_delta_s:         Median sample interval in seconds (None if no time column).
        valid_row_count:      Number of rows after cleaning.
        sensor_columns:       Ordered list of pressure column names found in the file.
    """

    df_raw: pd.DataFrame
    df_clean: pd.DataFrame
    df_normalized: pd.DataFrame
    peak_sensor_values: Dict[str, float]
    total_peak_pressure: float
    temporal_data_available: bool
    time_column_name: Optional[str]
    time_delta_s: Optional[float]
    valid_row_count: int
    sensor_columns: List[str]


# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------

def validate_dataframe(df: pd.DataFrame) -> List[str]:
    """
    Validates that a parsed DataFrame meets the structural requirements for
    StrideScan analysis.

    Args:
        df: Raw DataFrame loaded from the uploaded file.

    Returns:
        List of pressure column names confirmed present (subset of PRESSURE_COLS).

    Raises:
        ValueError: If no required pressure columns are found, or if the DataFrame
                    is entirely empty.
    """
    if df.empty:
        raise ValueError(
            "The uploaded file contains no data rows. "
            "Please upload a file with at least one row of sensor readings."
        )

    # Identify which mandatory columns are present / missing
    present_cols = [c for c in PRESSURE_COLS if c in df.columns]
    missing_cols = [c for c in PRESSURE_COLS if c not in df.columns]

    if not present_cols:
        raise ValueError(
            f"None of the required pressure columns were found. "
            f"Expected: {PRESSURE_COLS}. "
            f"Found columns: {list(df.columns)[:20]}."
        )

    if missing_cols:
        # Partial match: warn but continue with available columns
        warnings.warn(
            f"Missing pressure columns (will be excluded from analysis): {missing_cols}. "
            f"Analysis will proceed with: {present_cols}.",
            stacklevel=3,
        )

    # Check that pressure columns contain at least some numeric data
    df_pressure = df[present_cols]
    numeric_check = df_pressure.apply(pd.to_numeric, errors="coerce")
    if numeric_check.notna().sum().sum() == 0:
        raise ValueError(
            "All pressure column values are non-numeric. "
            "Ensure the file contains numeric pressure readings in kPa."
        )

    return present_cols


# ---------------------------------------------------------------------------
# Missing value handling
# ---------------------------------------------------------------------------

def handle_missing_values(df: pd.DataFrame, sensor_cols: List[str]) -> pd.DataFrame:
    """
    Imputes missing values in pressure sensor columns.

    Strategy (in order):
      1. Convert all pressure columns to numeric (coerce non-numeric to NaN).
      2. Reject any column where > MAX_MISSING_FRACTION of values are NaN.
      3. Forward-fill then backward-fill within each column (temporal continuity).
      4. Fill any remaining NaN with the column median.

    Args:
        df:           DataFrame containing at least the sensor_cols.
        sensor_cols:  Column names to process.

    Returns:
        Copy of df with pressure columns cleaned.

    Raises:
        ValueError: If any pressure column exceeds the missing-value threshold.
    """
    df = df.copy()

    # Step 1: coerce to numeric
    for col in sensor_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Step 2: reject columns with too many missing values
    total_rows = len(df)
    for col in sensor_cols:
        missing_frac = df[col].isna().sum() / max(total_rows, 1)
        if missing_frac > MAX_MISSING_FRACTION:
            raise ValueError(
                f"Column '{col}' has {missing_frac:.1%} missing values "
                f"(threshold: {MAX_MISSING_FRACTION:.0%}). "
                "Please check the uploaded file for data quality issues."
            )

    # Step 3: forward-fill then backward-fill
    df[sensor_cols] = df[sensor_cols].ffill().bfill()

    # Step 4: median imputation for any remaining NaN (e.g. all-NaN column edge case)
    for col in sensor_cols:
        col_median = df[col].median()
        if pd.isna(col_median):
            col_median = 0.0
        df[col] = df[col].fillna(col_median)

    return df


# ---------------------------------------------------------------------------
# Noise filtering
# ---------------------------------------------------------------------------

def filter_noise(df: pd.DataFrame, sensor_cols: List[str]) -> pd.DataFrame:
    """
    Applies a rolling-median filter to remove transient sensor spike artefacts.

    A rolling median with window=NOISE_FILTER_WINDOW is applied along the time
    axis of each pressure column. This preserves genuine pressure gradients while
    eliminating single-sample spikes that are common with capacitive pressure sensors.

    Args:
        df:           DataFrame with numeric pressure columns.
        sensor_cols:  Column names to filter.

    Returns:
        Copy of df with filtered pressure columns.
    """
    df = df.copy()
    for col in sensor_cols:
        smoothed = (
            df[col]
            .rolling(window=NOISE_FILTER_WINDOW, center=True, min_periods=1)
            .median()
        )
        df[col] = smoothed
    return df


# ---------------------------------------------------------------------------
# Normalisation
# ---------------------------------------------------------------------------

def normalize_pressure(df: pd.DataFrame, sensor_cols: List[str]) -> pd.DataFrame:
    """
    Applies per-column min-max normalisation to the pressure sensor columns.

    Each column is independently normalised to [0, 1]. If a column has zero
    range (constant or all-zero values) it is left as-is to avoid division by zero.

    This normalised copy is used for feature-extraction ratio calculations.
    The raw kPa values are preserved in the non-normalised DataFrame.

    Args:
        df:           DataFrame with numeric pressure columns.
        sensor_cols:  Column names to normalise.

    Returns:
        New DataFrame where pressure columns are in [0, 1].
    """
    df_norm = df.copy()
    for col in sensor_cols:
        col_min = df[col].min()
        col_max = df[col].max()
        col_range = col_max - col_min
        if col_range > 0:
            df_norm[col] = (df[col] - col_min) / col_range
        # If range == 0 leave column unchanged (all zeros or constant)
    return df_norm


# ---------------------------------------------------------------------------
# Time column detection
# ---------------------------------------------------------------------------

def _detect_time_column(df: pd.DataFrame) -> Optional[str]:
    """
    Searches for a column that plausibly represents measurement time.

    Checks TIME_COLUMN_CANDIDATES first, then falls back to any column whose
    name contains 'time' or 'ms' (case-insensitive).

    Returns:
        Column name string if found, else None.
    """
    for candidate in TIME_COLUMN_CANDIDATES:
        if candidate in df.columns:
            return candidate

    for col in df.columns:
        if "time" in col.lower() or col.lower() == "ms":
            return col

    return None


def _compute_time_delta(df: pd.DataFrame, time_col: str) -> Optional[float]:
    """
    Estimates the median sample interval (seconds) from a time column.

    Handles both:
      - Millisecond timestamps (values > 1000 are treated as ms and converted)
      - Second timestamps (values ≤ 1000)

    Returns:
        Median Δt in seconds, or None if the column is non-numeric / has <2 rows.
    """
    try:
        t = pd.to_numeric(df[time_col], errors="coerce").dropna()
        if len(t) < 2:
            return None
        diffs = t.diff().dropna()
        median_dt = float(diffs.median())
        # Heuristic: if median interval > 1000 assume milliseconds
        if abs(median_dt) > 1000:
            median_dt /= 1000.0
        return median_dt
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Peak pressure extraction (internal)
# ---------------------------------------------------------------------------

def _extract_peak_frame(df_clean: pd.DataFrame, sensor_cols: List[str]) -> Tuple[Dict[str, float], float]:
    """
    Identifies the row with the maximum summed pressure across all sensor columns
    and returns the sensor values and total sum at that frame.

    Args:
        df_clean:    Cleaned pressure DataFrame (no NaN).
        sensor_cols: Active sensor column names.

    Returns:
        (peak_sensor_values_dict, total_peak_sum)

    Raises:
        ValueError: If df_clean is empty after cleaning.
    """
    if df_clean.empty:
        raise ValueError(
            f"No valid pressure data rows remain after cleaning. "
            f"Minimum required: {MIN_VALID_ROWS} rows."
        )

    frame_sums = df_clean[sensor_cols].sum(axis=1)
    peak_idx = frame_sums.idxmax()
    peak_row = df_clean.loc[peak_idx, sensor_cols].to_dict()
    total_peak_sum = float(frame_sums.loc[peak_idx])

    peak_sensor_values = {k: float(v) for k, v in peak_row.items()}
    return peak_sensor_values, total_peak_sum


# ---------------------------------------------------------------------------
# Main preprocessing orchestrator (v2)
# ---------------------------------------------------------------------------

def preprocess_file(
    file_input: Union[str, bytes, io.BytesIO],
    file_extension: str = ".xlsx",
) -> PreprocessedData:
    """
    Full preprocessing pipeline for plantar pressure data files.

    Orchestrates: load → validate → missing-value handling →
                  noise filtering → normalization → peak extraction.

    Args:
        file_input:      File path string, raw bytes, or BytesIO buffer.
        file_extension:  '.xlsx', '.xls', or '.csv'. Used to select the parser.

    Returns:
        PreprocessedData containing cleaned DataFrames, peak-frame values,
        and metadata flags.

    Raises:
        ValueError: On structural validation failures or data quality issues.
    """
    # ---- 1. Load raw data ----
    try:
        if file_extension.lower() == ".csv":
            if isinstance(file_input, bytes):
                df_raw = pd.read_csv(io.BytesIO(file_input))
            else:
                df_raw = pd.read_csv(file_input)
        else:
            # Default: treat as Excel (.xlsx / .xls)
            if isinstance(file_input, bytes):
                df_raw = pd.read_excel(io.BytesIO(file_input))
            else:
                df_raw = pd.read_excel(file_input)
    except Exception as e:
        raise ValueError(f"Failed to parse uploaded file: {str(e)}") from e

    # ---- 2. Validate structure ----
    sensor_cols = validate_dataframe(df_raw)

    # ---- 3. Detect time column ----
    time_col = _detect_time_column(df_raw)
    temporal_available = time_col is not None
    time_delta_s: Optional[float] = None
    if temporal_available:
        time_delta_s = _compute_time_delta(df_raw, time_col)

    # ---- 4. Handle missing values ----
    df_imputed = handle_missing_values(df_raw, sensor_cols)

    # ---- 5. Filter noise ----
    df_clean = filter_noise(df_imputed, sensor_cols)

    # ---- 6. Enforce minimum rows ----
    df_pressure_only = df_clean[sensor_cols].dropna()
    if len(df_pressure_only) < MIN_VALID_ROWS:
        raise ValueError(
            f"Only {len(df_pressure_only)} valid row(s) remain after cleaning. "
            f"A minimum of {MIN_VALID_ROWS} rows is required for reliable analysis."
        )

    # ---- 7. Clip negative pressure readings (physically impossible) ----
    df_clean[sensor_cols] = df_clean[sensor_cols].clip(lower=0.0)

    # ---- 8. Normalize ----
    df_normalized = normalize_pressure(df_clean, sensor_cols)

    # ---- 9. Extract peak frame ----
    peak_sensor_values, total_peak_pressure = _extract_peak_frame(df_clean, sensor_cols)

    return PreprocessedData(
        df_raw=df_raw,
        df_clean=df_clean,
        df_normalized=df_normalized,
        peak_sensor_values=peak_sensor_values,
        total_peak_pressure=total_peak_pressure,
        temporal_data_available=temporal_available,
        time_column_name=time_col,
        time_delta_s=time_delta_s,
        valid_row_count=len(df_pressure_only),
        sensor_columns=sensor_cols,
    )


# ---------------------------------------------------------------------------
# Backward-compatible public API (v1)
# ---------------------------------------------------------------------------

def extract_peak_pressure(
    file_input: Union[str, bytes, io.BytesIO],
) -> Tuple[Dict[str, float], float]:
    """
    Backward-compatible entry point preserved from v1.

    Parses an uploaded Excel file, extracts time-series plantar pressure
    sensor readings, identifies the Peak Pressure Frame (row with maximum
    pressure sum), and returns the peak sensor values along with the total
    peak sum.

    Args:
        file_input: File path string, bytes, or BytesIO buffer of the uploaded Excel file.

    Returns:
        Tuple[Dict[str, float], float]:
            - Dict mapping sensor names ('MTK1.P', 'D1.P', etc.) to peak pressure values (kPa).
            - Total peak pressure sum across all sensors.

    Raises:
        ValueError: If the Excel file lacks required pressure columns or contains empty data.
    """
    result = preprocess_file(file_input, file_extension=".xlsx")
    return result.peak_sensor_values, result.total_peak_pressure
