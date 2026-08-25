import os
import json
import warnings
warnings.filterwarnings('ignore')

from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_curve,
    auc,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

IMG_SIZE = (256, 256)
BATCH_SIZE = 16
DATASET_DIR = Path("dataset/heatmaps")
MODEL_PATH = Path("model/stridescan_efficientnet.keras")
FALLBACK_MODEL_PATH = Path("model/stridescan_efficientnet.h5")
OUTPUTS_DIR = Path("outputs")


def load_trained_model() -> tf.keras.Model:
    """
    Loads the trained StrideScan EfficientNetB0 model.
    """
    if MODEL_PATH.exists():
        print(f"--> Loading model from {MODEL_PATH}")
        return tf.keras.models.load_model(str(MODEL_PATH))
    elif FALLBACK_MODEL_PATH.exists():
        print(f"--> Loading fallback model from {FALLBACK_MODEL_PATH}")
        return tf.keras.models.load_model(str(FALLBACK_MODEL_PATH))
    else:
        raise FileNotFoundError(f"No trained model found at {MODEL_PATH} or {FALLBACK_MODEL_PATH}. Run train.py first.")


def evaluate():
    """
    Evaluates trained model on validation heatmaps, computes classification metrics,
    and exports confusion matrix and ROC curve plots.
    """
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

    print("==================================================")
    print("      StrideScan Model Evaluation Started         ")
    print("==================================================")

    # 1. Load Model
    model = load_trained_model()

    # 2. Load Evaluation Dataset matching exact train.py split parameters
    val_ds = tf.keras.utils.image_dataset_from_directory(
        DATASET_DIR,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="binary"
    )

    class_names = val_ds.class_names
    print(f"Classes: {class_names}")

    # Collect true labels and predictions across validation set
    y_true = []
    y_pred_probs = []

    for images, labels in val_ds:
        probs = model.predict(images, verbose=0)
        y_true.extend(labels.numpy().flatten())
        y_pred_probs.extend(probs.flatten())

    y_true = np.array(y_true, dtype=int)
    y_pred_probs = np.array(y_pred_probs, dtype=float)
    y_pred = (y_pred_probs >= 0.5).astype(int)

    # 3. Compute Classification Metrics
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    fpr, tpr, _ = roc_curve(y_true, y_pred_probs)
    roc_auc = auc(fpr, tpr)

    metrics_summary = {
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1_score": float(f1),
        "roc_auc": float(roc_auc)
    }

    print("\n---------------- Metrics Summary ----------------")
    print(f" Accuracy:  {acc:.4f}")
    print(f" Precision: {prec:.4f}")
    print(f" Recall:    {rec:.4f}")
    print(f" F1-Score:  {f1:.4f}")
    print(f" ROC-AUC:   {roc_auc:.4f}")
    print("--------------------------------------------------\n")

    print("Detailed Classification Report:")
    report_text = classification_report(y_true, y_pred, target_names=class_names)
    print(report_text)

    # Save metrics JSON
    json_path = OUTPUTS_DIR / "evaluation_metrics.json"
    with open(json_path, "w") as f:
        json.dump(metrics_summary, f, indent=4)
    print(f"[SUCCESS] Metrics exported to {json_path.resolve()}")

    # 4. Plot Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(6, 5))
    cax = ax.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
    ax.set_title('StrideScan Confusion Matrix')
    fig.colorbar(cax)
    tick_marks = np.arange(len(class_names))
    ax.set_xticks(tick_marks)
    ax.set_xticklabels(class_names)
    ax.set_yticks(tick_marks)
    ax.set_yticklabels(class_names)

    # Annotate numbers in confusion matrix cells
    thresh = cm.max() / 2.0
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(j, i, format(cm[i, j], 'd'),
                    ha="center", va="center",
                    color="white" if cm[i, j] > thresh else "black")

    ax.set_xlabel('Predicted Label')
    ax.set_ylabel('True Label')
    plt.tight_layout()
    cm_path = OUTPUTS_DIR / "confusion_matrix.png"
    plt.savefig(cm_path, dpi=300)
    plt.close()
    print(f"[SUCCESS] Confusion matrix saved to {cm_path.resolve()}")

    # 5. Plot ROC Curve
    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, color='#2980b9', lw=2.5, label=f'EfficientNetB0 (AUC = {roc_auc:.3f})')
    plt.plot([0, 1], [0, 1], color='#7f8c8d', lw=1.5, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic (ROC) Curve')
    plt.legend(loc="lower right")
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    roc_path = OUTPUTS_DIR / "roc_curve.png"
    plt.savefig(roc_path, dpi=300)
    plt.close()
    print(f"[SUCCESS] ROC curve saved to {roc_path.resolve()}")

    print("==================================================")
    print("         Evaluation Completed Successfully        ")
    print("==================================================")


if __name__ == "__main__":
    evaluate()
