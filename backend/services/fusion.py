"""
backend/services/fusion.py

Rule-Based Fusion Layer — StrideScan Ulcer Risk Pipeline.

Combines the CNN branch output (raw ulcer probability) with the
biomechanical feature vector to produce a unified continuous risk score.

Design:
  - Base risk score = raw_ulcer_probability from CNN (0=low risk, 1=high risk)
  - Each biomechanical rule adds a signed delta based on feature thresholds
  - Final risk score is clipped to [0.0, 1.0]
  - Blended confidence = weighted average of CNN certainty and biomechanical context

No Healthy/Diabetic labels. Purely numerical, deterministic, and explainable.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Tuple

from backend.models.report import FeatureVector, FusedResult


# ---------------------------------------------------------------------------
# Configurable threshold configuration
# ---------------------------------------------------------------------------

@dataclass
class FusionThresholds:
    """
    All threshold parameters for biomechanical fusion rules.
    Adjust here to recalibrate sensitivity without touching logic.
    Defaults are grounded in published plantar pressure literature.
    """

    # Peak pressure thresholds (kPa)
    # Reference: Bus et al. (2016) — >700 kPa is elevated plantar pressure in diabetic neuropathy
    peak_pressure_high_kpa:      float = 700.0
    peak_pressure_moderate_kpa:  float = 500.0
    peak_pressure_delta_high:    float = 0.18
    peak_pressure_delta_moderate: float = 0.10

    # Arch Index thresholds
    # Reference: Cavanagh & Rodgers (1987) — <0.21 or >0.26 is abnormal
    arch_index_cavus_threshold:  float = 0.21   # < this → pes cavus
    arch_index_planus_threshold: float = 0.26   # > this → pes planus
    arch_index_delta:            float = 0.08

    # Forefoot overload
    # >60% forefoot load → metatarsal head ulceration risk
    forefoot_ratio_high:   float = 0.60
    forefoot_ratio_delta:  float = 0.10

    # Heel dominance
    # >50% heel load → calcaneal ulceration risk
    heel_ratio_high:  float = 0.50
    heel_ratio_delta: float = 0.07

    # Mediolateral asymmetry
    # >25% imbalance → compensatory gait / load redistribution
    asymmetry_high:  float = 0.25
    asymmetry_delta: float = 0.08

    # Weighting for blended confidence
    cnn_weight: float = 0.60
    bio_weight: float = 0.40


# ---------------------------------------------------------------------------
# Individual biomechanical fusion rules
# ---------------------------------------------------------------------------

def _rule_peak_pressure(
    features: FeatureVector,
    thresholds: FusionThresholds,
) -> Tuple[float, str]:
    """
    Elevate risk when peak plantar pressure exceeds clinical thresholds.
    High peak pressure is the primary risk factor for plantar ulceration.
    """
    peak = features.peak_plantar_pressure_kpa
    if peak >= thresholds.peak_pressure_high_kpa:
        return (
            thresholds.peak_pressure_delta_high,
            f"Peak plantar pressure ({peak:.1f} kPa) exceeds the high-risk threshold "
            f"(≥{thresholds.peak_pressure_high_kpa:.0f} kPa) — significantly elevated ulceration risk.",
        )
    if peak >= thresholds.peak_pressure_moderate_kpa:
        return (
            thresholds.peak_pressure_delta_moderate,
            f"Peak plantar pressure ({peak:.1f} kPa) is in the elevated range "
            f"(≥{thresholds.peak_pressure_moderate_kpa:.0f} kPa) — moderate ulceration risk.",
        )
    return 0.0, ""


def _rule_arch_index(
    features: FeatureVector,
    thresholds: FusionThresholds,
) -> Tuple[float, str]:
    """
    Elevate risk when the Arch Index indicates pes planus or pes cavus.
    Both morphologies are associated with abnormal loading and ulceration risk.
    """
    ai = features.arch_index
    if ai is None:
        return 0.0, ""

    if ai < thresholds.arch_index_cavus_threshold:
        return (
            thresholds.arch_index_delta,
            f"Arch Index ({ai:.3f}) indicates pes cavus (high arch) — "
            f"concentrates pressure on forefoot and heel.",
        )
    if ai > thresholds.arch_index_planus_threshold:
        return (
            thresholds.arch_index_delta,
            f"Arch Index ({ai:.3f}) indicates pes planus (flat foot) — "
            f"transfers excess load to medial midfoot and forefoot.",
        )
    return 0.0, ""


def _rule_forefoot_overload(
    features: FeatureVector,
    thresholds: FusionThresholds,
) -> Tuple[float, str]:
    """
    Elevate risk when the forefoot carries a disproportionate load fraction.
    Forefoot overloading is a key predictor of metatarsal ulceration.
    """
    ratio = features.forefoot_pressure_ratio
    if ratio >= thresholds.forefoot_ratio_high:
        return (
            thresholds.forefoot_ratio_delta,
            f"Forefoot carries {ratio:.1%} of total plantar load "
            f"(≥{thresholds.forefoot_ratio_high:.0%} threshold) — metatarsal head overloading.",
        )
    return 0.0, ""


def _rule_heel_dominance(
    features: FeatureVector,
    thresholds: FusionThresholds,
) -> Tuple[float, str]:
    """
    Elevate risk when the heel carries a disproportionate load fraction.
    Calcaneal dominance risks calcaneal ulceration or antalgic gait.
    """
    ratio = features.heel_pressure_ratio
    if ratio >= thresholds.heel_ratio_high:
        return (
            thresholds.heel_ratio_delta,
            f"Heel carries {ratio:.1%} of total plantar load "
            f"(≥{thresholds.heel_ratio_high:.0%} threshold) — calcaneal dominance.",
        )
    return 0.0, ""


def _rule_mediolateral_asymmetry(
    features: FeatureVector,
    thresholds: FusionThresholds,
) -> Tuple[float, str]:
    """
    Elevate risk when mediolateral asymmetry exceeds the clinical threshold.
    Imbalance >25% suggests pronation, supination, or compensatory offloading.
    """
    score = features.mediolateral_asymmetry_score
    if score >= thresholds.asymmetry_high:
        return (
            thresholds.asymmetry_delta,
            f"Mediolateral asymmetry ({score:.2f}) exceeds the "
            f"{thresholds.asymmetry_high:.2f} threshold — possible pronation or supination.",
        )
    return 0.0, ""


# ---------------------------------------------------------------------------
# Main fusion function
# ---------------------------------------------------------------------------

_DEFAULT_THRESHOLDS = FusionThresholds()

_RULES = [
    _rule_peak_pressure,
    _rule_arch_index,
    _rule_forefoot_overload,
    _rule_heel_dominance,
    _rule_mediolateral_asymmetry,
]


def fuse(
    raw_ulcer_probability: float,
    model_confidence: float,
    features: FeatureVector,
    thresholds: FusionThresholds = _DEFAULT_THRESHOLDS,
) -> FusedResult:
    """
    Fuse CNN ulcer probability with biomechanical features into a unified risk score.

    Algorithm:
      1. Base risk score = raw CNN ulcer probability (0=low risk, 1=high risk)
      2. For each biomechanical rule that fires, add its delta to the risk score
      3. Clip risk_score to [0.0, 1.0]
      4. Blended confidence = weighted average of CNN confidence and
         (1 − delta_magnitude), clamped to [0, 1]

    Args:
        raw_ulcer_probability: CNN-derived ulcer risk probability [0-1].
        model_confidence:      CNN model certainty [0-1].
        features:              Extracted biomechanical FeatureVector.
        thresholds:            FusionThresholds (defaults if omitted).

    Returns:
        FusedResult with fused risk_score, blended_confidence, and factors.
    """
    risk_score    = float(raw_ulcer_probability)
    total_delta   = 0.0
    factors: List[str] = []

    for rule in _RULES:
        delta, reason = rule(features, thresholds)
        if delta > 0.0:
            total_delta += delta
            factors.append(reason)

    risk_score = float(min(1.0, max(0.0, risk_score + total_delta)))

    # Blended confidence
    bio_conf = 1.0 - (total_delta / max(len(_RULES) * 0.15, 0.01))
    bio_conf = float(min(1.0, max(0.0, bio_conf)))

    blended = (
        thresholds.cnn_weight * model_confidence
        + thresholds.bio_weight * bio_conf
    )
    blended = float(min(1.0, max(0.0, blended)))

    return FusedResult(
        ulcer_probability=round(raw_ulcer_probability, 6),
        model_confidence=round(model_confidence, 6),
        risk_score=round(risk_score, 6),
        blended_confidence=round(blended, 6),
        risk_delta=round(total_delta, 6),
        contributing_factors=factors,
    )
