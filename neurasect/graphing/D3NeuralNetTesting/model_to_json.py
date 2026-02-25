import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import Model

def layer_to_json(layer):
    cfg = {"name": layer.name, "class": layer.__class__.__name__}

    # ---- Dense ----
    if isinstance(layer, tf.keras.layers.Dense):
        W, b = layer.get_weights()  # W: (in, out), b: (out,)
        cfg.update({
            "type": "dense",
            "in_features": int(W.shape[0]),
            "out_features": int(W.shape[1]),
            "weights": W.tolist(),
            "bias": b.tolist(),
        })
        return cfg

    # ---- Conv2D ----
    if isinstance(layer, tf.keras.layers.Conv2D):
        K, b = layer.get_weights()  # K: (kh, kw, in_ch, out_ch), b: (out_ch,)
        kh, kw, in_ch, out_ch = K.shape

        # Store per-filter kernels: list length = out_ch
        # each item shape = (kh, kw, in_ch)
        kernels = [K[:, :, :, i].tolist() for i in range(out_ch)]

        cfg.update({
            "type": "conv2d",
            "kernel_shape": [int(kh), int(kw), int(in_ch), int(out_ch)],
            "strides": list(layer.strides),
            "padding": layer.padding,
            "dilation_rate": list(layer.dilation_rate),
            "use_bias": bool(layer.use_bias),
            "activation": tf.keras.activations.serialize(layer.activation),
            "kernels": kernels,
            "bias": b.tolist() if layer.use_bias else None,
        })
        return cfg

    # ---- Other layers (optional) ----
    if isinstance(layer, tf.keras.layers.MaxPooling2D):
        cfg.update({
            "type": "maxpool2d",
            "pool_size": list(layer.pool_size),
            "strides": list(layer.strides) if layer.strides is not None else None,
            "padding": layer.padding,
        })
        return cfg

    if isinstance(layer, tf.keras.layers.Flatten):
        cfg.update({"type": "flatten"})
        return cfg

    # Default: just store config (no weights)
    cfg.update({"type": "other", "config": layer.get_config()})
    return cfg


def export_model_json(model: Model, path="public/data/model_new.json"):
    # Ensure weights exist (model built)
    if not model.built:
        # If you know your input shape, set it here
        # model.build((None, 28, 28, 1))
        raise ValueError("Model is not built yet. Call model.build(...) or run a forward pass first.")

    data = {
        "model_name": model.name,
        "layers": [layer_to_json(layer) for layer in model.layers],
    }

    with open(path, "w") as f:
        json.dump(data, f, indent=2)

    return data

# To use this we could replace the last line in modelGen.py with export_model_json(model)

