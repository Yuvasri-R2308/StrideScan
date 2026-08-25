"""
backend/models/report.py

Pydantic data-model definitions for the StrideScan Ulcer Risk Assessment
Pipeline.

Pipeline outputs:
  FeatureVector     — biomechanical features extracted from the pressure CSV
  FusedResult       — combined CNN probability + biomechanical score
  RiskAssessment    — categorical ulcer risk tier + score
  ClinicalExplanation — structured XAI explanation text
  ReportMetadata    — pipeline provenance
  UlcerRiskReport   — top-level response returned to the frontend

Design: models carry no business logic. Logic lives in the service layer.
"""

from __future__ import annotations

from typing import Dict, List, Optional
from enum import Enum

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------

class UlcerRiskCategory(str, Enum):
    """Three-tier ulcer risk classification aligned with IWGDF guidelines."""

    LOW      = "Low Risk"
    MODERATE = "Moderate Risk"
    HIGH     = "High Risk"


# ---------------------------------------------------------------------------
# Pressure Feature Sub-models
# ---------------------------------------------------------------------------

class RegionalPressure(BaseModel):
    """Pressure statistics for a single anatomical foot region."""

    region:            str   = Field(..., description="Anatomical region (Forefoot / Midfoot / Heel).")
    total_kpa:         float = Field(..., description="Sum of all sensor readings in the region (kPa).")
    mean_kpa:          float = Field(..., description="Mean sensor reading in the region (kPa).")
    relative_fraction: float = Field(..., ge=0.0, le=1.0, description="Fraction of total foot pressure [0-1].")
    sensor_count:      int   = Field(..., description="Number of sensors contributing to this region.")


class PressureCentroid(BaseModel):
    """2-D centre-of-pressure in normalised foot-space [0,1]."""

    x: float = Field(..., ge=0.0, le=1.0, description="Medial-lateral axis (0=medial, 1=lateral).")
    y: float = Field(..., ge=0.0, le=1.0, description="Anterior-posterior axis (0=toes, 1=heel).")


class PressureAnalytics(BaseModel):
    """High-level pressure analytics derived from the feature vector."""

    peak_pressure_kpa:            float = Field(..., description="Maximum plantar pressure (kPa).")
    mean_pressure_kpa:            float = Field(..., description="Mean plantar pressure (kPa).")
    pressure_variance_kpa2:       float = Field(..., description="Variance of sensor readings (kPa²).")
    highest_pressure_region:      str   = Field(..., description="Anatomical region with highest mean pressure.")
    contact_area_cm2:             float = Field(..., description="Estimated loaded contact area (cm²).")
    pressure_distribution_status: str   = Field(..., description="Qualitative distribution label (e.g. 'High Forefoot Loading').")
    pressure_symmetry_status:     str   = Field(..., description="Qualitative symmetry label (e.g. 'Moderate Imbalance').")
    forefoot_to_heel_ratio:       float = Field(..., description="Ratio of forefoot mean pressure to heel mean pressure.")
    forefoot_pressure_kpa:        float = Field(..., description="Mean forefoot zone pressure (kPa).")
    midfoot_pressure_kpa:         float = Field(..., description="Mean midfoot zone pressure (kPa).")
    heel_pressure_kpa:            float = Field(..., description="Mean heel zone pressure (kPa).")


# ---------------------------------------------------------------------------
# Biomechanical Feature Vector
# ---------------------------------------------------------------------------

class FeatureVector(BaseModel):
    """
    Full biomechanical feature set extracted from peak plantar pressure frame.
    Temporal features are null when no time column exists in the source file.
    """

    # Core pressure
    peak_plantar_pressure_kpa:  float = Field(..., description="Peak pressure across all sensors (kPa).")
    mean_plantar_pressure_kpa:  float = Field(..., description="Mean pressure across all sensors (kPa).")

    # Spatial
    contact_area_proxy: float = Field(..., description="Proxy contact area estimate from loaded sensors.")

    # Temporal (optional)
    pressure_time_integral_kpa_s: Optional[float] = Field(None, description="Pressure-time integral (kPa·s).")
    pressure_time_integral_note:  Optional[str]   = Field(None, description="Why PTI is null, if applicable.")

    # Arch
    arch_index: Optional[float] = Field(
        None, ge=0.0, le=1.0,
        description="Cavanagh Arch Index. Normal 0.21–0.26. <0.21=pes cavus, >0.26=pes planus."
    )

    # Asymmetry
    mediolateral_asymmetry_score: float = Field(
        ..., ge=0.0, le=1.0,
        description="Within-foot mediolateral asymmetry [0-1]. 0=symmetric, 1=fully one-sided."
    )

    # Zone ratios
    forefoot_pressure_ratio: float = Field(..., ge=0.0, le=1.0, description="Forefoot fraction of total load [0-1].")
    midfoot_pressure_ratio:  float = Field(..., ge=0.0, le=1.0, description="Midfoot fraction of total load [0-1].")
    heel_pressure_ratio:     float = Field(..., ge=0.0, le=1.0, description="Heel fraction of total load [0-1].")

    # Spatial position
    pressure_centroid: PressureCentroid = Field(..., description="Weighted centre-of-pressure.")

    # Regional breakdown
    regional_distribution: List[RegionalPressure] = Field(
        ..., description="Per-region pressure breakdown (Forefoot / Midfoot / Heel)."
    )

    # Raw sensor values at peak frame
    peak_frame_sensor_values: Dict[str, float] = Field(
        ..., description="Raw sensor readings (kPa) at the peak pressure frame."
    )


# ---------------------------------------------------------------------------
# Fusion Result (internal — not exposed in final JSON)
# ---------------------------------------------------------------------------

class FusedResult(BaseModel):
    """Output of the Fusion Layer — blends CNN ulcer probability with biomechanics."""

    ulcer_probability:   float = Field(..., ge=0.0, le=1.0, description="Raw CNN ulcer risk probability [0-1].")
    model_confidence:    float = Field(..., ge=0.0, le=1.0, description="CNN model certainty [0-1].")
    risk_score:          float = Field(..., ge=0.0, le=1.0, description="Fused continuous risk score [0-1].")
    blended_confidence:  float = Field(..., ge=0.0, le=1.0, description="Blended CNN + biomechanical confidence [0-1].")
    risk_delta:          float = Field(..., description="Cumulative biomechanical adjustment to base risk score.")
    contributing_factors: List[str] = Field(..., description="Biomechanical factors that elevated the risk.")


# ---------------------------------------------------------------------------
# Risk Assessment
# ---------------------------------------------------------------------------

class RiskAssessment(BaseModel):
    """Output of the Clinical Risk Engine."""

    category:    UlcerRiskCategory = Field(..., description="Categorical ulcer risk tier.")
    risk_score:  float             = Field(..., ge=0.0, le=1.0, description="Continuous risk score [0-1].")
    ulcer_risk_score_pct: float    = Field(..., ge=0.0, le=100.0, description="Ulcer risk score as percentage (0–100).")
    contributing_factors: List[str] = Field(..., description="Factors contributing to risk elevation.")


# ---------------------------------------------------------------------------
# Clinical Explanation
# ---------------------------------------------------------------------------

class ClinicalExplanation(BaseModel):
    """Structured rule-based clinical explanation."""

    summary:             str        = Field(..., description="One-sentence clinical summary.")
    findings:            List[str]  = Field(..., description="Specific clinical findings.")
    affected_regions:    List[str]  = Field(..., description="Anatomical regions flagged as significant.")
    possible_reason:     str        = Field(..., description="Plausible biomechanical explanation.")
    recommendations:     List[str]  = Field(..., description="Clinical action recommendations.")
    ai_attention_summary: str       = Field(..., description="Plain-language description of Grad-CAM attention focus.")
    highlight_tags:      List[str]  = Field(..., description="Short pressure-hotspot tags for UI display.")


# ---------------------------------------------------------------------------
# Report Metadata
# ---------------------------------------------------------------------------

class ReportMetadata(BaseModel):
    """Pipeline provenance and runtime metadata."""

    processing_time_ms:      float = Field(..., description="End-to-end inference time (ms).")
    model_version:           str   = Field(default="2.0.0", description="Model version.")
    pipeline_version:        str   = Field(default="3.0.0", description="Pipeline version.")
    timestamp:               str   = Field(..., description="ISO-8601 UTC timestamp.")
    sensor_count:            int   = Field(default=8, description="Pressure sensor count.")
    temporal_data_available: bool  = Field(..., description="True if time column present in source file.")


# ---------------------------------------------------------------------------
# Top-level Ulcer Risk Report  (returned to the frontend)
# ---------------------------------------------------------------------------

class UlcerRiskReport(BaseModel):
    """
    Complete structured output of the StrideScan Ulcer Risk Assessment Pipeline.
    Returned by POST /predict-ulcer-risk and POST /api/v2/analyze.
    """

    # ── Core result ──────────────────────────────────────────────────────────
    ulcer_risk_score: float = Field(
        ..., ge=0.0, le=100.0,
        description="Ulcer risk score as a percentage (0 = no risk, 100 = maximum risk)."
    )
    ulcer_risk_level: str = Field(
        ..., description="Categorical risk tier: 'Low Risk', 'Moderate Risk', or 'High Risk'."
    )
    confidence: float = Field(
        ..., ge=0.0, le=100.0,
        description="Overall pipeline confidence percentage (0–100)."
    )

    # ── Pressure analytics summary (flat, easy for UI) ───────────────────────
    pressure_analytics: PressureAnalytics = Field(
        ..., description="High-level pressure analytics derived from biomechanical features."
    )

    # ── Full biomechanical feature vector ────────────────────────────────────
    biomechanical_features: FeatureVector = Field(..., description="Full biomechanical feature vector.")

    # ── Visual artifacts ─────────────────────────────────────────────────────
    heatmap:  str = Field(..., description="Base64 PNG data-URL of plantar pressure heatmap.")
    gradcam:  str = Field(..., description="Base64 PNG data-URL of Grad-CAM explainability overlay.")

    # ── Clinical explanation ─────────────────────────────────────────────────
    findings:         ClinicalExplanation = Field(..., description="Structured clinical explanation.")
    recommendations:  List[str]           = Field(..., description="Top-level recommendation list.")

    # ── Pipeline metadata ─────────────────────────────────────────────────────
    metadata: ReportMetadata = Field(..., description="Pipeline provenance and runtime info.")


# ---------------------------------------------------------------------------
# Backward-compatibility alias (so any legacy import of ClinicalReport works)
# ---------------------------------------------------------------------------
ClinicalReport = UlcerRiskReport
