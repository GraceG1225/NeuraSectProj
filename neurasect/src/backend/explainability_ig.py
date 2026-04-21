"""
Tabular integrated gradients (same math as integratedGradients(2).ipynb).
Expects a Keras model and one scaled feature row as shape (1, n_features).
"""

from __future__ import annotations

import numpy as np
import tensorflow as tf


def integrated_gradients_tabular(
    model: tf.keras.Model,
    sample_batch: tf.Tensor,
    target_class_idx: int,
    m_steps: int = 50,
    regression: bool = False,
) -> np.ndarray:
    """
    Integrated gradients for one tabular sample.

    sample_batch: float tensor (1, n_features), already scaled like training data.
    target_class_idx: class index for softmax output (ignored when regression=True).
    """
    sample = tf.squeeze(tf.cast(sample_batch, tf.float32), axis=0)
    baseline = tf.zeros_like(sample)
    alphas = tf.linspace(0.0, 1.0, m_steps + 1)
    broadcast = tf.reshape(alphas, [-1] + [1] * len(sample.shape))
    interpolated = baseline + broadcast * (sample - baseline)

    with tf.GradientTape() as tape:
        tape.watch(interpolated)
        preds = model(interpolated, training=False)
        if regression:
            target = preds[:, 0]
        else:
            target = tf.nn.softmax(preds, axis=-1)[:, target_class_idx]

    grads = tape.gradient(target, interpolated)
    if grads is None:
        raise RuntimeError("Gradients are None; the model output may not depend on the inputs.")

    avg_grads = (grads[:-1] + grads[1:]) / 2.0
    avg_grads = tf.reduce_mean(avg_grads, axis=0)
    attributions = (sample - baseline) * avg_grads
    return attributions.numpy()
