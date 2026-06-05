from __future__ import annotations

import base64
from typing import Optional, Tuple

import numpy as np
import tensorflow as tf


def _strip_data_url_prefix(data: str) -> str:
    # Accept both raw base64 and data URLs like "data:image/png;base64,...."
    if "," in data and data.lstrip().lower().startswith("data:"):
        return data.split(",", 1)[1]
    return data


def decode_image_base64_to_tensor(image_base64: str) -> tf.Tensor:
    raw_b64 = _strip_data_url_prefix(image_base64)
    img_bytes = base64.b64decode(raw_b64)
    img = tf.io.decode_image(img_bytes, channels=3, expand_animations=False)
    img = tf.image.convert_image_dtype(img, tf.float32)  # [0,1]
    return img


def integrated_gradients_image(
    model: tf.keras.Model,
    preprocessed_batch: tf.Tensor,
    target_class_idx: int,
    m_steps: int = 32,
) -> tf.Tensor:
    """
    Integrated gradients for a single image.

    preprocessed_batch: shape (1, H, W, 3) float32 in the model's input space.
    Returns: attribution tensor shape (H, W, 3).
    """
    sample = tf.cast(preprocessed_batch[0], tf.float32)
    baseline = tf.zeros_like(sample)

    alphas = tf.linspace(0.0, 1.0, m_steps + 1)
    alphas_x = tf.reshape(alphas, [-1, 1, 1, 1])
    interpolated = baseline + alphas_x * (sample - baseline)  # (m_steps+1,H,W,3)

    with tf.GradientTape() as tape:
        tape.watch(interpolated)
        logits = model(interpolated, training=False)  # (m_steps+1,num_classes)
        # Use logits directly (more stable than softmax for gradients)
        target = logits[:, target_class_idx]

    grads = tape.gradient(target, interpolated)  # (m_steps+1,H,W,3)
    if grads is None:
        raise RuntimeError("Gradients are None; cannot compute attributions.")

    avg_grads = (grads[:-1] + grads[1:]) / 2.0
    avg_grads = tf.reduce_mean(avg_grads, axis=0)  # (H,W,3)
    return (sample - baseline) * avg_grads


def _jet_colormap(x: tf.Tensor) -> tf.Tensor:
    """
    Approximate 'jet' colormap. x in [0,1], returns RGB in [0,1].
    """
    x = tf.clip_by_value(x, 0.0, 1.0)
    r = tf.clip_by_value(1.5 - tf.abs(4.0 * x - 3.0), 0.0, 1.0)
    g = tf.clip_by_value(1.5 - tf.abs(4.0 * x - 2.0), 0.0, 1.0)
    b = tf.clip_by_value(1.5 - tf.abs(4.0 * x - 1.0), 0.0, 1.0)
    return tf.stack([r, g, b], axis=-1)


def build_overlay_png_base64(
    original_rgb_01: tf.Tensor,
    attributions: tf.Tensor,
    alpha: float = 0.45,
) -> str:
    """
    original_rgb_01: (H,W,3) float in [0,1] (for display)
    attributions: (H,W,3) float (can be +/-)
    Returns base64 PNG (no data URL prefix).
    """
    # Reduce attributions to heatmap magnitude
    heat = tf.reduce_mean(tf.abs(attributions), axis=-1)  # (H,W)
    heat = heat - tf.reduce_min(heat)
    denom = tf.reduce_max(heat)
    heat = tf.where(denom > 0, heat / denom, tf.zeros_like(heat))

    heat_rgb = _jet_colormap(heat)  # (H,W,3)
    overlay = (1.0 - alpha) * original_rgb_01 + alpha * heat_rgb
    overlay_u8 = tf.image.convert_image_dtype(overlay, tf.uint8, saturate=True)
    png_bytes = tf.io.encode_png(overlay_u8).numpy()
    return base64.b64encode(png_bytes).decode("ascii")


def build_heatmap_png_base64(
    attributions: tf.Tensor,
) -> str:
    """
    attributions: (H,W,3) float (can be +/-)
    Returns base64 PNG for a standalone 'jet' heatmap (no data URL prefix).
    """
    heat = tf.reduce_mean(tf.abs(attributions), axis=-1)  # (H,W)
    heat = heat - tf.reduce_min(heat)
    denom = tf.reduce_max(heat)
    heat = tf.where(denom > 0, heat / denom, tf.zeros_like(heat))

    heat_rgb = _jet_colormap(heat)  # (H,W,3) in [0,1]
    heat_u8 = tf.image.convert_image_dtype(heat_rgb, tf.uint8, saturate=True)
    png_bytes = tf.io.encode_png(heat_u8).numpy()
    return base64.b64encode(png_bytes).decode("ascii")


def default_imagenet_model_and_preprocess(
    input_size: int = 224,
) -> Tuple[tf.keras.Model, callable]:
    """
    Uses a lightweight pretrained model for demo purposes.
    Replace with your own trained CNN later.
    """
    model = tf.keras.applications.MobileNetV2(weights="imagenet", include_top=True)

    def preprocess(img_rgb_01: tf.Tensor) -> tf.Tensor:
        img = tf.image.resize(img_rgb_01, [input_size, input_size], method="bilinear")
        img = tf.clip_by_value(img, 0.0, 1.0)
        img255 = img * 255.0
        batch = tf.expand_dims(img255, axis=0)
        return tf.keras.applications.mobilenet_v2.preprocess_input(batch)

    return model, preprocess

