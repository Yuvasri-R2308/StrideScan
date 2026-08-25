import os
import sys
import warnings
warnings.filterwarnings('ignore')

from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
# pyrefly: ignore [missing-import]
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau

# Set random seed for reproducibility
SEED = 42
tf.random.set_seed(SEED)
np.random.seed(SEED)

IMG_SIZE = (256, 256)
BATCH_SIZE = 16
EPOCHS = 25
LEARNING_RATE = 1e-4

DATASET_DIR = Path("dataset/heatmaps")
MODEL_DIR = Path("model")
OUTPUTS_DIR = Path("outputs")


def create_datasets(dataset_path: Path):
    """
    Loads heatmaps from Healthy/ and Diabetic/ subdirectories and creates
    train and validation TensorFlow datasets with data augmentation.
    """
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset directory not found at {dataset_path}. Run prepare_dataset.py first.")

    train_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_path,
        validation_split=0.2,
        subset="training",
        seed=SEED,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="binary"
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_path,
        validation_split=0.2,
        subset="validation",
        seed=SEED,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="binary"
    )

    class_names = train_ds.class_names
    print(f"Detected Classes: {class_names} (0: {class_names[0]}, 1: {class_names[1]})")

    # Lightweight data augmentation for pressure heatmaps
    data_augmentation = tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal"),
        tf.keras.layers.RandomRotation(0.05),
        tf.keras.layers.RandomZoom(0.05),
    ], name="data_augmentation")

    # Apply data augmentation only to training dataset
    train_ds = train_ds.map(lambda x, y: (data_augmentation(x, training=True), y),
                            num_parallel_calls=tf.data.AUTOTUNE)

    # Prefetch datasets for maximum performance
    train_ds = train_ds.prefetch(buffer_size=tf.data.AUTOTUNE)
    val_ds = val_ds.prefetch(buffer_size=tf.data.AUTOTUNE)

    return train_ds, val_ds, class_names


def build_model(input_shape=(256, 256, 3)):
    """
    Builds a binary classification CNN model based on transfer learning with EfficientNetB0.
    """
    # Load base EfficientNetB0 with pre-trained ImageNet weights
    base_model = EfficientNetB0(
        weights='imagenet',
        include_top=False,
        input_shape=input_shape
    )
    
    # Freeze initial layers for transfer learning stability
    base_model.trainable = False

    inputs = tf.keras.Input(shape=input_shape)
    
    # EfficientNet has built-in normalization layer, pass raw BGR/RGB images [0, 255]
    x = base_model(inputs, training=False)
    x = GlobalAveragePooling2D()(x)
    x = BatchNormalization()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.4)(x)
    outputs = Dense(1, activation='sigmoid')(x)

    model = Model(inputs, outputs, name="StrideScan_EfficientNetB0")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC(name='auc')]
    )
    return model, base_model


def plot_training_history(history, save_path: Path):
    """
    Plots and saves loss, accuracy, and AUC training/validation metrics.
    """
    save_path.parent.mkdir(parents=True, exist_ok=True)
    
    acc = history.history.get('accuracy', [])
    val_acc = history.history.get('val_accuracy', [])
    loss = history.history.get('loss', [])
    val_loss = history.history.get('val_loss', [])
    auc = history.history.get('auc', [])
    val_auc = history.history.get('val_auc', [])

    epochs_range = range(1, len(acc) + 1)

    plt.figure(figsize=(14, 4))

    # Plot Accuracy
    plt.subplot(1, 3, 1)
    plt.plot(epochs_range, acc, label='Training Accuracy', color='#2b5c8f', linewidth=2)
    plt.plot(epochs_range, val_acc, label='Validation Accuracy', color='#e74c3c', linewidth=2)
    plt.title('Training & Validation Accuracy')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.legend(loc='lower right')
    plt.grid(True, linestyle='--', alpha=0.5)

    # Plot Loss
    plt.subplot(1, 3, 2)
    plt.plot(epochs_range, loss, label='Training Loss', color='#2b5c8f', linewidth=2)
    plt.plot(epochs_range, val_loss, label='Validation Loss', color='#e74c3c', linewidth=2)
    plt.title('Training & Validation Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend(loc='upper right')
    plt.grid(True, linestyle='--', alpha=0.5)

    # Plot AUC
    plt.subplot(1, 3, 3)
    plt.plot(epochs_range, auc, label='Training AUC', color='#2b5c8f', linewidth=2)
    plt.plot(epochs_range, val_auc, label='Validation AUC', color='#e74c3c', linewidth=2)
    plt.title('Training & Validation AUC')
    plt.xlabel('Epochs')
    plt.ylabel('AUC')
    plt.legend(loc='lower right')
    plt.grid(True, linestyle='--', alpha=0.5)

    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"[SUCCESS] Training history plot saved to {save_path.resolve()}")


def train():
    """
    Main training pipeline: loads data, builds model, trains transfer learning model,
    fine-tunes base layers, saves model artifacts.
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

    print("==================================================")
    print("      StrideScan EfficientNetB0 Training          ")
    print("==================================================")

    # 1. Load Data
    train_ds, val_ds, class_names = create_datasets(DATASET_DIR)

    # 2. Build Model
    model, base_model = build_model(input_shape=(*IMG_SIZE, 3))
    model.summary()

    # 3. Callbacks
    best_model_path = MODEL_DIR / "stridescan_efficientnet.keras"
    checkpoint = ModelCheckpoint(
        filepath=str(best_model_path),
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    )
    early_stop = EarlyStopping(
        monitor='val_loss',
        patience=6,
        restore_best_weights=True,
        verbose=1
    )
    reduce_lr = ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=3,
        min_lr=1e-6,
        verbose=1
    )

    callbacks = [checkpoint, early_stop, reduce_lr]

    # 4. Phase 1: Feature Extraction Training
    print("\n--> Phase 1: Training top classification layers...")
    history_phase1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=12,
        callbacks=callbacks
    )

    # 5. Phase 2: Fine-Tuning Top Layers of EfficientNetB0
    print("\n--> Phase 2: Unfreezing top EfficientNet layers for fine-tuning...")
    base_model.trainable = True
    
    # Freeze lower layers, unfreeze top 40 layers for fine-tuning
    for layer in base_model.layers[:-40]:
        layer.trainable = False

    # Recompile model with lower learning rate for fine-tuning
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss='binary_crossentropy',
        metrics=['accuracy', tf.keras.metrics.AUC(name='auc')]
    )

    history_phase2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=13,
        callbacks=callbacks
    )

    # Combine history metrics for visualization
    combined_history = {'history': {}}
    for key in history_phase1.history.keys():
        combined_history['history'][key] = (
            history_phase1.history[key] + history_phase2.history[key]
        )

    # 6. Save final model & plot history
    final_model_h5_path = MODEL_DIR / "stridescan_efficientnet.h5"
    model.save(str(final_model_h5_path))
    print(f"[SUCCESS] Saved final trained model to {final_model_h5_path.resolve()}")

    plot_training_history(type('History', (object,), combined_history)(), OUTPUTS_DIR / "training_history.png")

    print("==================================================")
    print("          Training Completed Successfully         ")
    print("==================================================")


if __name__ == "__main__":
    train()
