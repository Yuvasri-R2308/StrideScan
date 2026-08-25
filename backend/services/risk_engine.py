"""
backend/services/risk_engine.py

Clinical Risk Engine — StrideScan Ulcer Risk Assessment Pipeline.

Converts the continuous [0, 1] fused risk score into a discrete, clinically
actionable ulcer risk category aligned with IWGDF risk stratification.

Three-tier taxonomy:
  Low Risk      — No current ulcer; standard preventive foot care
  Moderate Risk — Elevated pressure detected; enhanced monitoring warranted
  High Risk     — Significantly elevated pressure; immediate clinical action required

Thresholds are configurable via RiskThresholds and are consistent with
the International Working Group on the Diabetic Foot (IWGDF) guidelines.

Architecture: stateless, pure function — safe for concurrent async use.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List

from backend.models.report import FusedResult, RiskAssessment, UlcerRiskCategory


# ---------------------------------------------------------------------------
# Configurable threshold configuration
# ---------------------------------------------------------------------------

@dataclass
class RiskThresholds:
    """
    Continuous risk score boundaries for each ulcer risk tier.

      [0.00, low_upper)         → Low Risk
      [low_upper, high_upper)   → Moderate Risk
      [high_upper, 1.00]        → High Risk

    Adjust these to recalibrate sensitivity without touching classification logic.
    """

    low_upper:  float = 0.35
    high_upper: float = 0.60


# ---------------------------------------------------------------------------
# Contributing factor analysis
# ---------------------------------------------------------------------------

def _analyse_contributing_factors(fused: FusedResult) -> List[str]:
    """
    Composes a human-readable contributing-factor list from the fusion result.
    No Healthy/Diabetic labels — purely pressure-based language.
    """
    factors: List[str] = []

    prob_pct = fused.ulcer_probability * 100
    conf_pct = fused.model_confidence * 100

    factors.append(
        f"Pressure heatmap analysis yielded an ulcer risk probability of "
        f"{prob_pct:.1f}% (model certainty: {conf_pct:.1f}%)."
    )

    # Append biomechanical factors from fusion layer
    factors.extend(fused.contributing_factors)

    return factors


# ---------------------------------------------------------------------------
# Main classification function
# ---------------------------------------------------------------------------

_DEFAULT_THRESHOLDS = RiskThresholds()


def classify(
    fused: FusedResult,
    thresholds: RiskThresholds = _DEFAULT_THRESHOLDS,
) -> RiskAssessment:
    """
    Converts a FusedResult into a categorical RiskAssessment.

    Args:
        fused:      Output of fusion.fuse().
        thresholds: RiskThresholds configuration (defaults if omitted).

    Returns:
        RiskAssessment with category, numeric score, and contributing factors.
    """
    score = fused.risk_score

    if score < thresholds.low_upper:
        category = UlcerRiskCategory.LOW
    elif score < thresholds.high_upper:
        category = UlcerRiskCategory.MODERATE
    else:
        category = UlcerRiskCategory.HIGH

    contributing = _analyse_contributing_factors(fused)
    ulcer_pct    = round(score * 100, 1)

    return RiskAssessment(
        category=category,
        risk_score=round(score, 6),
        ulcer_risk_score_pct=ulcer_pct,
        contributing_factors=contributing,
    )
