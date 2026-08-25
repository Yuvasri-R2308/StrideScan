"""
backend/services/explainer.py

Rule-Based Clinical Explanation Engine — StrideScan Ulcer Risk Pipeline.

Generates structured, clinically grounded natural-language explanations from:
  - Biomechanical FeatureVector
  - RiskAssessment (category + score)

No LLM. No generative AI. All explanations are deterministic rule-based
mappings from feature thresholds to text — auditable and reproducible.

No "Healthy" or "Diabetic" labels appear anywhere in this module.
All language is framed around plantar pressure and ulcer risk.
"""

from __future__ import annotations

from typing import List, Set

from backend.models.report import (
    ClinicalExplanation,
    FeatureVector,
    RiskAssessment,
    UlcerRiskCategory,
)


# ---------------------------------------------------------------------------
# Internal finding helpers
# ---------------------------------------------------------------------------

def _explain_peak_pressure(
    features: FeatureVector,
    findings: List[str],
    regions: Set[str],
    recommendations: List[str],
) -> str:
    """
    Evaluates peak plantar pressure against ulcer-risk thresholds.

    Thresholds (kPa):
      > 700 → critically elevated (plantar ulceration risk)
      > 500 → elevated (metatarsal stress risk)
      > 300 → mildly elevated (monitoring warranted)
      ≤ 300 → within normal range
    """
    peak = features.peak_plantar_pressure_kpa
    if peak > 700:
        findings.append(
            f"Critically elevated peak plantar pressure detected ({peak:.1f} kPa). "
            "Values above 700 kPa are strongly associated with plantar ulceration risk."
        )
        regions.add("High-Pressure Zone")
        recommendations.append(
            "Urgent clinical assessment required. Custom total-contact insoles or "
            "offloading footwear should be prescribed to redistribute plantar load."
        )
        return f"Critically elevated plantar pressure ({peak:.1f} kPa) detected."
    elif peak > 500:
        findings.append(
            f"Elevated peak plantar pressure ({peak:.1f} kPa) — above the 500 kPa "
            "moderate-risk threshold. Prolonged exposure may risk soft-tissue injury."
        )
        regions.add("High-Pressure Zone")
        recommendations.append(
            "Pressure-redistributing footwear or orthotic insoles should be evaluated. "
            "Follow-up pressure analysis in 4–6 weeks is advised."
        )
        return f"Elevated peak plantar pressure ({peak:.1f} kPa) detected."
    elif peak > 300:
        findings.append(
            f"Mildly elevated peak plantar pressure ({peak:.1f} kPa). "
            "Regular monitoring and footwear review are advisable."
        )
        recommendations.append(
            "Review current footwear for adequate cushioning. Monitor pressure trends over time."
        )
        return f"Mildly elevated plantar pressure ({peak:.1f} kPa) noted."
    else:
        findings.append(
            f"Peak plantar pressure ({peak:.1f} kPa) is within the normal range (≤300 kPa)."
        )
        return f"Peak plantar pressure ({peak:.1f} kPa) within normal limits."


def _explain_arch_index(
    features: FeatureVector,
    findings: List[str],
    regions: Set[str],
    recommendations: List[str],
) -> None:
    ai = features.arch_index
    if ai is None:
        findings.append("Arch Index could not be computed (insufficient midfoot sensor data).")
        return

    if ai < 0.21:
        findings.append(
            f"Arch Index ({ai:.3f}) indicates pes cavus (high-arched foot). "
            "High arches concentrate plantar loading on the forefoot and heel, "
            "increasing focal pressure and ulceration risk."
        )
        regions.add("Forefoot")
        regions.add("Heel")
        recommendations.append(
            "Custom arch supports or semi-rigid orthoses recommended to distribute "
            "load across the midfoot in high-arched feet."
        )
    elif ai > 0.26:
        findings.append(
            f"Arch Index ({ai:.3f}) indicates pes planus (flat foot). "
            "Flat arches transfer excess load to the medial midfoot and forefoot, "
            "which can lead to overpronation and plantar soft-tissue stress."
        )
        regions.add("Midfoot")
        regions.add("Forefoot")
        recommendations.append(
            "Medial arch support orthoses are recommended to correct overpronation."
        )
    else:
        findings.append(f"Arch Index ({ai:.3f}) is within normal parameters (0.21–0.26).")


def _explain_forefoot(
    features: FeatureVector,
    findings: List[str],
    regions: Set[str],
    recommendations: List[str],
) -> None:
    ratio = features.forefoot_pressure_ratio
    if ratio > 0.60:
        findings.append(
            f"Forefoot carries {ratio:.1%} of total plantar load — a forefoot-dominant "
            "pressure pattern. Metatarsal head overloading increases the risk of "
            "callus formation and ulceration under the metatarsal heads."
        )
        regions.add("Forefoot")
        recommendations.append(
            "Metatarsal padding or a rocker-bottom sole can offload the metatarsal heads. "
            "Avoid footwear with narrow toe boxes or high heels."
        )
    elif ratio > 0.40:
        findings.append(f"Forefoot load fraction ({ratio:.1%}) is moderately elevated.")
        regions.add("Forefoot")
    else:
        findings.append(f"Forefoot load fraction ({ratio:.1%}) is within acceptable limits.")


def _explain_heel(
    features: FeatureVector,
    findings: List[str],
    regions: Set[str],
    recommendations: List[str],
) -> None:
    ratio = features.heel_pressure_ratio
    if ratio > 0.50:
        findings.append(
            f"Heel carries {ratio:.1%} of total plantar load — a heel-dominant loading "
            "pattern. This may indicate heavy heel strike or antalgic forefoot offloading. "
            "High heel pressures risk calcaneal ulceration."
        )
        regions.add("Heel")
        recommendations.append("Heel-cushioning insoles or shock-absorbing footwear are recommended.")
    else:
        findings.append(f"Heel load fraction ({ratio:.1%}) is within normal limits.")


def _explain_asymmetry(
    features: FeatureVector,
    findings: List[str],
    regions: Set[str],
    recommendations: List[str],
) -> None:
    score = features.mediolateral_asymmetry_score
    if score > 0.35:
        findings.append(
            f"Significant mediolateral pressure asymmetry detected (score: {score:.2f}). "
            "This strongly suggests pronation, supination, or compensatory weight-shifting "
            "in response to pain or structural deformity."
        )
        regions.add("Medial Foot")
        regions.add("Lateral Foot")
        recommendations.append("A full biomechanical gait assessment is recommended.")
    elif score > 0.25:
        findings.append(
            f"Mild mediolateral pressure asymmetry noted (score: {score:.2f}). "
            "This may indicate early-stage pronation or supination."
        )
        regions.add("Medial Foot")
    else:
        findings.append(
            f"Mediolateral pressure distribution is balanced (asymmetry score: {score:.2f})."
        )


def _explain_pti(features: FeatureVector, findings: List[str]) -> None:
    if features.pressure_time_integral_kpa_s is not None:
        pti = features.pressure_time_integral_kpa_s
        findings.append(
            f"Pressure-Time Integral: {pti:.2f} kPa·s — total plantar loading impulse over stance phase."
        )
    elif features.pressure_time_integral_note:
        findings.append("Pressure-Time Integral: Not available — no time column in uploaded data.")


def _explain_contact_area(features: FeatureVector, findings: List[str]) -> None:
    area = features.contact_area_proxy
    findings.append(
        f"Estimated contact area (proxy): {area:.1f} cm² derived from loaded point sensors."
    )


def _explain_centroid(
    features: FeatureVector,
    findings: List[str],
    regions: Set[str],
) -> None:
    cx = features.pressure_centroid.x
    cy = features.pressure_centroid.y

    if cx < 0.40:
        lateral_note = "medially biased"
        regions.add("Medial Foot")
    elif cx > 0.60:
        lateral_note = "laterally biased"
        regions.add("Lateral Foot")
    else:
        lateral_note = "centrally positioned"

    if cy < 0.35:
        ap_note = "forefoot-dominant"
        regions.add("Forefoot")
    elif cy > 0.65:
        ap_note = "heel-dominant"
        regions.add("Heel")
    else:
        ap_note = "midfoot-centred"

    findings.append(
        f"Pressure centroid is {lateral_note} and {ap_note} "
        f"(normalised position: x={cx:.2f}, y={cy:.2f})."
    )


# ---------------------------------------------------------------------------
# Summary, possible reason, recommendations, and XAI helpers
# ---------------------------------------------------------------------------

def _build_summary(risk: RiskAssessment, primary_finding: str) -> str:
    tier_phrase = {
        UlcerRiskCategory.LOW:      "within safe limits; routine preventive care is appropriate",
        UlcerRiskCategory.MODERATE: "elevated; enhanced monitoring and footwear intervention advisable",
        UlcerRiskCategory.HIGH:     "significantly elevated; immediate clinical assessment required",
    }
    phrase = tier_phrase.get(risk.category, "under assessment")
    return (
        f"Plantar pressure analysis indicates {risk.category.value} for diabetic foot ulceration. "
        f"Ulcer risk score: {risk.ulcer_risk_score_pct:.1f}/100 — {phrase}. "
        f"{primary_finding}"
    )


def _build_possible_reason(features: FeatureVector) -> str:
    reasons: List[str] = []

    if features.arch_index is not None:
        if features.arch_index < 0.21:
            reasons.append("high-arched foot morphology (pes cavus) concentrating forefoot/heel load")
        elif features.arch_index > 0.26:
            reasons.append("flat-foot morphology (pes planus) redistributing load to the medial arch")

    if features.forefoot_pressure_ratio > 0.60:
        reasons.append("metatarsal overloading from forefoot-dominant gait pattern")

    if features.heel_pressure_ratio > 0.50:
        reasons.append("heavy heel-strike pattern or antalgic forefoot offloading")

    if features.mediolateral_asymmetry_score > 0.25:
        reasons.append("pronation or supination causing mediolateral load imbalance")

    if not reasons:
        return "Plantar loading pattern is within expected physiological range."

    return (
        "The plantar pressure distribution demonstrates elevated loading in key regions. "
        "Contributing biomechanical factors include: " + "; ".join(reasons) + ". "
        "Such pressure concentration is associated with increased ulceration risk."
    )


def _build_recommendations(risk: RiskAssessment) -> List[str]:
    base = {
        UlcerRiskCategory.LOW: [
            "Maintain current footwear and activity levels.",
            "Conduct annual plantar pressure screening for at-risk populations.",
            "Inspect feet regularly for callus, redness, or skin changes.",
        ],
        UlcerRiskCategory.MODERATE: [
            "Review and upgrade to pressure-redistributing footwear.",
            "Consult a podiatrist for preventive foot care assessment.",
            "Inspect feet daily for early signs of callus or skin breakdown.",
            "Repeat plantar pressure analysis in 6–8 weeks.",
        ],
        UlcerRiskCategory.HIGH: [
            "Schedule urgent podiatric evaluation within 1–2 weeks.",
            "Prescribe custom orthotic insoles or therapeutic offloading footwear immediately.",
            "Inspect feet daily for hyperkeratosis, erythema, or early ulceration signs.",
            "Repeat plantar pressure screening in 2–4 weeks post-intervention.",
            "Involve multidisciplinary diabetic foot care team.",
        ],
    }
    return base.get(risk.category, [])


def _build_ai_attention_summary(features: FeatureVector, risk: RiskAssessment) -> str:
    """
    Generates a plain-language description of what the Grad-CAM attention
    map is likely highlighting, based on biomechanical features.
    """
    peak    = features.peak_plantar_pressure_kpa
    ff      = features.forefoot_pressure_ratio
    heel    = features.heel_pressure_ratio
    highest = _identify_highest_region(features)

    if risk.category == UlcerRiskCategory.HIGH:
        return (
            f"The model focused primarily on the {highest} region where the highest "
            f"pressure concentration ({peak:.1f} kPa) was detected. Warm/red areas in "
            "the Grad-CAM overlay indicate zones the AI associated with elevated ulceration risk."
        )
    elif risk.category == UlcerRiskCategory.MODERATE:
        return (
            f"The model identified moderate pressure concentration in the {highest} region "
            f"({peak:.1f} kPa). Grad-CAM highlights indicate areas of pressure asymmetry "
            "that warrant monitoring."
        )
    else:
        return (
            f"The model detected a broadly distributed pressure pattern with peak pressure "
            f"of {peak:.1f} kPa. Grad-CAM highlights show no dominant high-risk concentration zone."
        )


def _build_highlight_tags(features: FeatureVector, risk: RiskAssessment) -> List[str]:
    """Generates short UI tags based on detected pressure patterns."""
    tags: List[str] = []
    peak = features.peak_plantar_pressure_kpa

    if peak > 700:
        tags.append("Critical Pressure Zone")
    elif peak > 500:
        tags.append("High Pressure Zone")

    if features.forefoot_pressure_ratio > 0.60:
        tags.append("Forefoot Overload")

    if features.heel_pressure_ratio > 0.50:
        tags.append("Heel Dominance")

    if features.mediolateral_asymmetry_score > 0.25:
        tags.append("Asymmetric Loading")

    if features.arch_index is not None and (features.arch_index < 0.21 or features.arch_index > 0.26):
        tags.append("Abnormal Arch Index")

    if risk.category == UlcerRiskCategory.HIGH:
        tags.append("Immediate Clinical Action Required")
    elif risk.category == UlcerRiskCategory.MODERATE:
        tags.append("Enhanced Monitoring Advised")

    if not tags:
        tags.append("Normal Pressure Distribution")

    return tags


def _identify_highest_region(features: FeatureVector) -> str:
    """Returns the name of the region with the highest mean pressure."""
    regional = features.regional_distribution
    if not regional:
        return "Forefoot"
    return max(regional, key=lambda r: r.mean_kpa).region


# ---------------------------------------------------------------------------
# Main explanation function
# ---------------------------------------------------------------------------

def explain(
    features: FeatureVector,
    risk: RiskAssessment,
) -> ClinicalExplanation:
    """
    Generates a structured ClinicalExplanation from biomechanical features and risk.

    Args:
        features: Extracted biomechanical FeatureVector.
        risk:     Output of risk_engine.classify().

    Returns:
        ClinicalExplanation with all fields populated.
    """
    findings:        List[str] = []
    regions:         Set[str]  = set()
    recommendations: List[str] = []

    primary_finding = _explain_peak_pressure(features, findings, regions, recommendations)
    _explain_arch_index(features, findings, regions, recommendations)
    _explain_forefoot(features, findings, regions, recommendations)
    _explain_heel(features, findings, regions, recommendations)
    _explain_asymmetry(features, findings, regions, recommendations)
    _explain_pti(features, findings)
    _explain_contact_area(features, findings)
    _explain_centroid(features, findings, regions)

    # Append tier-specific recommendations (deduplicated)
    tier_recs        = _build_recommendations(risk)
    existing_text    = " ".join(recommendations).lower()
    for rec in tier_recs:
        if not any(word in existing_text for word in rec.lower().split()[:3]):
            recommendations.append(rec)

    summary          = _build_summary(risk, primary_finding)
    possible_reason  = _build_possible_reason(features)
    sorted_regions   = sorted(regions) if regions else ["No specific region flagged"]
    ai_summary       = _build_ai_attention_summary(features, risk)
    tags             = _build_highlight_tags(features, risk)

    return ClinicalExplanation(
        summary=summary,
        findings=findings,
        affected_regions=sorted_regions,
        possible_reason=possible_reason,
        recommendations=recommendations,
        ai_attention_summary=ai_summary,
        highlight_tags=tags,
    )
