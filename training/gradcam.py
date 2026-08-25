import os
import warnings
warnings.filterwarnings('ignore')

from pathlib import Path
import numpy as np
import cv2
import tensorflow as tf

MODEL_PATH = Path("model/stridescan_efficientnet.keras")
FALLBACK_MODEL_PATH = Path("model/stridescan_efficientnet.h5")
OUTPUTS_DIR = Path("outputs")


def find_last_conv_layer(model: tf.keras.Model) -> str:
    """
    Finds the name of the last Conv2D layer in a model or nested base model.
    """
    # 1. Search top-level model
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name
        # Search nested Functional/Model (e.g., base EfficientNetB0)
        if isinstance(layer, tf.keras.Model):
            for sub_layer in reversed(layer.layers):
                if isinstance(sub_layer, tf.keras.layers.Conv2D) or sub_layer.name == 'top_conv':
                    return sub_layer.name
                    
    # Default fallback for EfficientNetB0
    return 'top_conv'


def compute_gradcam(model: tf.keras.Model, 
                     img_array: np.ndarray, 
                     layer_name: str = None) -> np.ndarray:
    """
    Computes Grad-CAM heatmap for a given input image array.

    Args:
        model (tf.keras.Model): Loaded StrideScan Keras model.
        img_array (np.ndarray): Preprocessed image array of shape (1, 256, 256, 3) or (256, 256, 3).
        layer_name (str, optional): Name of the target Conv2D layer. If None, auto-detects.

    Returns:
        np.ndarray: Normalized 2D Grad-CAM heatmap (256, 256) with values in range [0, 1].
    """
    if len(img_array.shape) == 3:
        img_array = np.expand_dims(img_array, axis=0)

    # Auto-detect target layer if not provided
    if layer_name is None:
        layer_name = find_last_conv_layer(model)

    # Extract base EfficientNet layer if nested inside Model
    base_model = None
    for layer in model.layers:
        if isinstance(layer, tf.keras.Model):
            base_model = layer
            break

    if base_model is not None:
        # Construct gradient model tapping into base_model inner conv layer
        grad_model = tf.keras.Model(
            inputs=base_model.inputs,
            outputs=[base_model.get_layer(layer_name).output, base_model.output]
        )
        
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            # Pass predictions through classifier top layers
            x = predictions
            for top_layer in model.layers:
                if not isinstance(top_layer, tf.keras.Model) and not isinstance(top_layer, tf.keras.layers.InputLayer):
                    x = top_layer(x)
            loss = x[:, 0]

        grads = tape.gradient(loss, conv_outputs)
    else:
        grad_model = tf.keras.Model(
            inputs=model.inputs,
            outputs=[model.get_layer(layer_name).output, model.output]
        )
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            loss = predictions[:, 0]

        grads = tape.gradient(loss, conv_outputs)

    # Compute channel importance weights via global average pooling of gradients
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    # Multiply feature maps by importance weights
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # Apply ReLU to retain positive influence only
    heatmap = tf.maximum(heatmap, 0) / (tf.reduce_max(heatmap) + 1e-10)
    return heatmap.numpy()


def overlay_gradcam(original_img: np.ndarray, heatmap: np.ndarray, alpha: float = 0.5) -> np.ndarray:
    """
    Overlays Grad-CAM heatmap onto the original RGB/BGR image.

    Args:
        original_img (np.ndarray): Original image array (256, 256, 3), uint8.
        heatmap (np.ndarray): 2D float heatmap in range [0, 1].
        alpha (float): Opacity ratio of the heatmap overlay.

    Returns:
        np.ndarray: Blended BGR image array (256, 256, 3).
    """
    # Resize heatmap to match image size
    heatmap_resized = cv2.resize(heatmap, (original_img.shape[1], original_img.shape[0]))
    
    # Convert heatmap to uint8 and apply JET colormap
    heatmap_uint8 = np.uint8(255 * heatmap_resized)
    heatmap_bgr = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)

    # Blend heatmap with original image
    if original_img.dtype != np.uint8:
        original_img = original_img.astype(np.uint8)

    overlay = cv2.addWeighted(original_img, 1.0 - alpha, heatmap_bgr, alpha, 0)
    return overlay


def run_gradcam_demo():
    """
    Test script to run Grad-CAM explanation on a sample dataset image and save output.
    """
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Load model
    if MODEL_PATH.exists():
        model = tf.keras.models.load_model(str(MODEL_PATH))
    elif FALLBACK_MODEL_PATH.exists():
        model = tf.keras.models.load_model(str(FALLBACK_MODEL_PATH))
    else:
        raise FileNotFoundError("Trained model not found. Run train.py first.")

    # Find sample heatmap image
    sample_images = list(Path("dataset/heatmaps").rglob("*.png"))
    if not sample_images:
        raise FileNotFoundError("No sample heatmaps found in dataset/heatmaps directory.")

    sample_path = sample_images[0]
    print(f"--> Computing Grad-CAM for sample image: {sample_path.name}")

    # Load and preprocess image
    img = cv2.imread(str(sample_path))
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_tensor = np.expand_dims(img_rgb, axis=0).astype(np.float32)

    # Predict
    pred_prob = float(model.predict(img_tensor, verbose=0)[0][0])
    pred_class = "Diabetic" if pred_prob >= 0.5 else "Healthy"
    confidence = pred_prob if pred_class == "Diabetic" else (1.0 - pred_prob)

    # Compute Grad-CAM
    heatmap = compute_gradcam(model, img_tensor)
    gradcam_overlay = overlay_gradcam(img, heatmap, alpha=0.5)

    # Save visualization output
    output_path = OUTPUTS_DIR / "sample_gradcam.png"
    cv2.imwrite(str(output_path), gradcam_overlay)

    print("==================================================")
    print("           Grad-CAM Execution Summary             ")
    print("==================================================")
    print(f" Sample File:   {sample_path.name}")
    print(f" Predicted:     {pred_class} (Confidence: {confidence * 100:.2f}%)")
    print(f" Grad-CAM saved: {output_path.resolve()}")
    print("==================================================")


if __name__ == "__main__":
    run_gradcam_demo()
