"""
backend/predict.py

Ulcer Risk Inference Module — StrideScan.

Runs the EfficientNetB0 CNN on a plantar pressure heatmap image and
returns a raw ulcer risk probability instead of a Healthy/Diabetic label.

The CNN was originally trained on Healthy vs Diabetic heatmaps.
  - Class 0 (Diabetic) → high ulcer risk
  - Class 1 (Healthy)  → low ulcer risk

The raw sigmoid output is therefore directly usable as an ulcer risk
probability: P(ulcer risk) = 1 - P(Healthy) = P(Diabetic class activations).

This module intentionally exposes NO Healthy/Diabetic labels to callers.
All classification language is internal to this file only.
"""

import sys
from pathlib import Path
from typing import Dict, Any

import numpy as np
import cv2
import tensorflow as tf

# Ensure project root importable
sys.path.append(str(Path(__file__).resolve().parent.parent))
from training.gradcam import compute_gradcam, overlay_gradcam
from backend.heatmap import heatmap_to_base64

MODEL_PATH          = Path("model/stridescan_efficientnet.keras")
FALLBACK_MODEL_PATH = Path("model/stridescan_efficientnet.h5")

_MODEL_INSTANCE = None


def get_model() -> tf.keras.Model:
    """Loads and caches the trained StrideScan Keras model."""
    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is None:
        if MODEL_PATH.exists():
            print(f"--> [BACKEND] Loading model from {MODEL_PATH}")
            _MODEL_INSTANCE = tf.keras.models.load_model(str(MODEL_PATH))
        elif FALLBACK_MODEL_PATH.exists():
            print(f"--> [BACKEND] Loading fallback model from {FALLBACK_MODEL_PATH}")
            _MODEL_INSTANCE = tf.keras.models.load_model(str(FALLBACK_MODEL_PATH))
        else:
            raise FileNotFoundError(
                f"Trained model not found at {MODEL_PATH} or {FALLBACK_MODEL_PATH}. "
                "Run training/train.py to generate the model file."
            )
    return _MODEL_INSTANCE


def run_ulcer_risk_inference(heatmap_bgr: np.ndarray) -> Dict[str, Any]:
    """
    Run CNN inference on a plantar pressure heatmap and return an ulcer
    risk probability plus a Grad-CAM explainability overlay.

    The CNN output is treated as a continuous ulcer risk signal:
      raw_ulcer_probability = 1 - P(Healthy class)

    This value flows into the fusion layer as the base risk score.
    No "Healthy" or "Diabetic" label is returned to callers.

    Args:
        heatmap_bgr: 256×256 BGR plantar pressure heatmap (numpy array).

    Returns:
        Dict with:
            "raw_ulcer_probability" : float in [0, 1] — higher = more risk
            "model_confidence"      : float in [0, 1] — certainty of the output
            "gradcam_base64"        : str — base64 PNG of Grad-CAM overlay
    """
    model = get_model()

    # Convert BGR → RGB, add batch dimension, cast to float32
    img_rgb    = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)
    img_tensor = np.expand_dims(img_rgb, axis=0).astype(np.float32)

    # Keras alphabetical dataset order: index 0 = Diabetic, index 1 = Healthy
    # prob_healthy is the model's raw sigmoid output
    prob_healthy  = float(model.predict(img_tensor, verbose=0)[0][0])
    prob_diabetic = 1.0 - prob_healthy  # directly maps to ulcer risk

    # Model confidence = how far from 0.5 the output is (certainty of either class)
    model_confidence = max(prob_healthy, prob_diabetic)

    # Grad-CAM highlights regions driving high activation
    gradcam_heatmap    = compute_gradcam(model, img_tensor)
    gradcam_overlay    = overlay_gradcam(heatmap_bgr, gradcam_heatmap, alpha=0.5)
    gradcam_b64        = heatmap_to_base64(gradcam_overlay)

    return {
        "raw_ulcer_probability": round(prob_diabetic, 6),   # 0=low risk, 1=high risk
        "model_confidence":      round(model_confidence, 6),
        "gradcam_base64":        gradcam_b64,
    }


# ---------------------------------------------------------------------------
# Legacy compatibility shim (used by nothing new — will be removed in v3)
# ---------------------------------------------------------------------------

def predict_and_explain(heatmap_bgr: np.ndarray) -> Dict[str, Any]:
    """
    Deprecated shim — kept only so any surviving legacy call sites do not
    crash with AttributeError. Internally delegates to run_ulcer_risk_inference()
    and reconstructs a minimal dict that matches the old key names.

    DO NOT use this function in new code.
    """
    result = run_ulcer_risk_inference(heatmap_bgr)
    prob   = result["raw_ulcer_probability"]
    conf   = result["model_confidence"]
    return {
        "prediction":          "High Risk" if prob >= 0.5 else "Low Risk",
        "confidence":          conf,
        "raw_probability":     prob,
        "gradcam_base64":      result["gradcam_base64"],
    }
