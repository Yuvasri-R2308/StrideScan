"""
backend/routers/inference.py

Ulcer Risk Inference Router — StrideScan Ulcer Risk Assessment Pipeline.

Primary endpoint:  POST /predict-ulcer-risk
Alias endpoint:    POST /api/v2/analyze   (backward-compatible)
Health check:      GET  /api/v2/health

Pipeline:
  1. Preprocess CSV/Excel — validate, impute, normalise
  2. Heatmap generation  — 256×256 plantar pressure BGR image
  3. CNN inference       — raw ulcer risk probability via run_ulcer_risk_inference()
  4. Feature extraction  — 10+ biomechanical features
  5. Fusion              — CNN probability + biomechanical rule deltas
  6. Risk engine         — ulcer risk category (Low / Moderate / High)
  7. Explainer           — structured clinical explanation + XAI summary
  8. Assemble report     — UlcerRiskReport JSON

Response schema: UlcerRiskReport (backend/models/report.py)
"""

from __future__ import annotations

import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from backend.preprocess import preprocess_file
from backend.heatmap import generate_plantar_heatmap, heatmap_to_base64
from backend.predict import run_ulcer_risk_inference
from backend.services.feature_extraction import extract_features
from backend.services.fusion import fuse
from backend.services.risk_engine import classify
from backend.services.explainer import explain
from backend.models.report import (
    ReportMetadata,
    UlcerRiskReport,
    PressureAnalytics,
)

router = APIRouter(tags=["Ulcer Risk Assessment"])

_ALLOWED_EXTENSIONS = {".xlsx", ".xls", ".csv"}


def _ext(filename: str) -> str:
    return Path(filename).suffix.lower()


def _build_pressure_analytics(features, highest_region: str) -> PressureAnalytics:
    """Derive the flat PressureAnalytics summary from a FeatureVector."""
    ff_ratio   = features.forefoot_pressure_ratio
    heel_ratio = features.heel_pressure_ratio
    mid_ratio  = features.midfoot_pressure_ratio
    mean_p     = features.mean_plantar_pressure_kpa

    # Qualitative distribution label
    ff_pct   = ff_ratio * 100
    heel_pct = heel_ratio * 100
    if ff_pct > 65:
        dist_status = "High Forefoot Loading"
    elif ff_pct > 55:
        dist_status = "Moderate Forefoot Loading"
    elif heel_pct > 45:
        dist_status = "High Heel Loading"
    else:
        dist_status = "Balanced Loading"

    # Qualitative symmetry label
    asym = features.mediolateral_asymmetry_score * 100
    if asym > 35:
        sym_status = "Significant Imbalance"
    elif asym > 20:
        sym_status = "Moderate Imbalance"
    else:
        sym_status = "Balanced Symmetry"

    # Zone mean pressures
    ff_kpa   = mean_p * ff_ratio * 1.4
    mid_kpa  = mean_p * mid_ratio * 0.9
    heel_kpa = mean_p * heel_ratio * 0.95

    # Forefoot-to-heel ratio
    ff_to_heel = round(ff_kpa / heel_kpa, 2) if heel_kpa > 0 else 1.0

    # Variance (approximate from peak and mean)
    peak = features.peak_plantar_pressure_kpa
    variance = round(((peak - mean_p) ** 2) * 0.25, 2)  # proxy

    return PressureAnalytics(
        peak_pressure_kpa=features.peak_plantar_pressure_kpa,
        mean_pressure_kpa=mean_p,
        pressure_variance_kpa2=variance,
        highest_pressure_region=highest_region,
        contact_area_cm2=features.contact_area_proxy,
        pressure_distribution_status=dist_status,
        pressure_symmetry_status=sym_status,
        forefoot_to_heel_ratio=ff_to_heel,
        forefoot_pressure_kpa=round(ff_kpa, 2),
        midfoot_pressure_kpa=round(mid_kpa, 2),
        heel_pressure_kpa=round(heel_kpa, 2),
    )


async def _run_pipeline(file: UploadFile) -> JSONResponse:
    """
    Core pipeline — shared by both /predict-ulcer-risk and /api/v2/analyze.
    Runs all 8 steps and returns a UlcerRiskReport JSON response.
    """
    pipeline_start = time.perf_counter()

    filename = file.filename or "unknown"
    ext      = _ext(filename)

    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Upload one of: {sorted(_ALLOWED_EXTENSIONS)}.",
        )

    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {e}")

    # ── 1. Preprocessing ────────────────────────────────────────────────────
    try:
        preprocessed = preprocess_file(file_bytes, file_extension=ext)
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preprocessing error: {e}")

    # ── 2. Heatmap generation ────────────────────────────────────────────────
    try:
        heatmap_bgr = generate_plantar_heatmap(preprocessed.peak_sensor_values, img_size=256)
        heatmap_b64 = heatmap_to_base64(heatmap_bgr)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Heatmap generation error: {e}")

    # ── 3. CNN Inference → raw ulcer risk probability ───────────────────────
    try:
        inference_result = run_ulcer_risk_inference(heatmap_bgr)
    except FileNotFoundError as fnf:
        raise HTTPException(
            status_code=503,
            detail=(
                f"Model not found: {fnf}. "
                "Ensure the trained model is present at model/stridescan_efficientnet.keras."
            ),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model inference error: {e}")

    raw_ulcer_prob   = inference_result["raw_ulcer_probability"]
    model_confidence = inference_result["model_confidence"]
    gradcam_b64      = inference_result["gradcam_base64"]

    # ── 4. Biomechanical Feature Extraction ─────────────────────────────────
    try:
        feature_vector = extract_features(
            sensor_values=preprocessed.peak_sensor_values,
            df_clean=preprocessed.df_clean,
            sensor_cols=preprocessed.sensor_columns,
            temporal_available=preprocessed.temporal_data_available,
            time_delta_s=preprocessed.time_delta_s,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Feature extraction error: {e}")

    # ── 5. Fusion Layer ──────────────────────────────────────────────────────
    try:
        fused_result = fuse(
            raw_ulcer_probability=raw_ulcer_prob,
            model_confidence=model_confidence,
            features=feature_vector,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fusion layer error: {e}")

    # ── 6. Risk Engine ───────────────────────────────────────────────────────
    try:
        risk_assessment = classify(fused_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk engine error: {e}")

    # ── 7. Clinical Explanation ──────────────────────────────────────────────
    try:
        explanation = explain(features=feature_vector, risk=risk_assessment)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Explanation engine error: {e}")

    # ── 8. Assemble Report ───────────────────────────────────────────────────
    pipeline_end  = time.perf_counter()
    processing_ms = round((pipeline_end - pipeline_start) * 1000, 2)

    # Identify the highest pressure region from regional distribution
    regional = feature_vector.regional_distribution
    highest_region = (
        max(regional, key=lambda r: r.mean_kpa).region
        if regional else "Forefoot"
    )

    pressure_analytics = _build_pressure_analytics(feature_vector, highest_region)

    metadata = ReportMetadata(
        processing_time_ms=processing_ms,
        model_version="2.0.0",
        pipeline_version="3.0.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
        sensor_count=len(preprocessed.sensor_columns),
        temporal_data_available=preprocessed.temporal_data_available,
    )

    report = UlcerRiskReport(
        ulcer_risk_score=risk_assessment.ulcer_risk_score_pct,
        ulcer_risk_level=risk_assessment.category.value,
        confidence=round(fused_result.blended_confidence * 100, 2),
        pressure_analytics=pressure_analytics,
        biomechanical_features=feature_vector,
        heatmap=heatmap_b64,
        gradcam=gradcam_b64,
        findings=explanation,
        recommendations=explanation.recommendations,
        metadata=metadata,
    )

    return JSONResponse(
        status_code=200,
        content={
            "status":   "success",
            "filename": filename,
            **report.model_dump(),
        },
    )


# ---------------------------------------------------------------------------
# Primary endpoint: POST /predict-ulcer-risk
# ---------------------------------------------------------------------------

@router.post(
    "/predict-ulcer-risk",
    summary="Diabetic Foot Ulcer Risk Assessment",
    description=(
        "Upload a plantar pressure CSV or Excel file to receive a full Diabetic Foot "
        "Ulcer Risk Assessment. Returns risk score (0–100), risk level, pressure analytics, "
        "Grad-CAM explainability, biomechanical features, and clinical recommendations."
    ),
)
async def predict_ulcer_risk(
    file: UploadFile = File(
        ...,
        description=(
            "Plantar pressure data file (.xlsx, .xls, or .csv). "
            "Must contain columns: MTK1.P, MTK2.P, MTK3.P, MTK4.P, MTK5.P, D1.P, L.P, C.P."
        ),
    ),
) -> JSONResponse:
    """POST /predict-ulcer-risk — primary ulcer risk assessment endpoint."""
    return await _run_pipeline(file)


# ---------------------------------------------------------------------------
# Alias endpoint: POST /api/v2/analyze  (backward-compatible)
# ---------------------------------------------------------------------------

@router.post(
    "/api/v2/analyze",
    summary="Ulcer Risk Assessment (v2 alias)",
    description="Alias for POST /predict-ulcer-risk. Returns identical response.",
    include_in_schema=False,  # hide from Swagger to avoid duplication
)
async def analyze_plantar_file_alias(
    file: UploadFile = File(...),
) -> JSONResponse:
    """Backward-compatible alias — delegates to the primary pipeline."""
    return await _run_pipeline(file)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@router.get(
    "/api/v2/health",
    summary="Ulcer Risk Pipeline Health Check",
)
async def pipeline_health() -> Dict[str, Any]:
    """Returns health status for the ulcer risk assessment pipeline."""
    return {
        "status":           "online",
        "pipeline_version": "3.0.0",
        "endpoints": {
            "primary": "POST /predict-ulcer-risk",
            "alias":   "POST /api/v2/analyze",
            "health":  "GET /api/v2/health",
        },
    }
