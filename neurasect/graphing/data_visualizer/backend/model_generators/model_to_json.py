import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import Model

print(">>> USING model_to_json.py FROM:", __file__)


def layer_to_json(layer, model=None, sample_input=None):
    cfg = {"name": layer.name, "class": layer.__class__.__name__}

    # ---- Dense ----
    if isinstance(layer, tf.keras.layers.Dense):
        W, b = layer.get_weights()
        cfg.update({
            "type": "dense",
            "in_features": int(W.shape[0]),
            "out_features": int(W.shape[1]),
            "weights": W.tolist(),
            "bias": b.tolist()
        })
        return cfg

    # ---- Conv2D ----
    if isinstance(layer, tf.keras.layers.Conv2D):
        K, b = layer.get_weights()
        kh, kw, in_ch, out_ch = K.shape

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
            "input_shape": list(layer.input.shape[1:3]),
            "output_shape": list(layer.output.shape[1:3])
        })

        # ---- Export activations ----
        if model is not None and sample_input is not None:
            submodel = Model(inputs=model.input, outputs=layer.output)
            act = submodel.predict(sample_input)[0]  # (H_out, W_out, out_ch)
            cfg["activations"] = [act[:, :, i].tolist() for i in range(out_ch)]
        else:
            cfg["activations"] = None

        return cfg

    # ---- MaxPool2D ----
    if isinstance(layer, tf.keras.layers.MaxPooling2D):
        cfg.update({
            "type": "maxpool2d",
            "pool_size": list(layer.pool_size),
            "strides": list(layer.strides),
            "padding": layer.padding,
            "input_shape": list(layer.input.shape[1:3]),
            "output_shape": list(layer.output.shape[1:3])
        })

        if model is not None and sample_input is not None:
            submodel = Model(inputs=model.input, outputs=layer.output)
            act = submodel.predict(sample_input)[0]
            cfg["activations"] = [act[:, :, i].tolist() for i in range(act.shape[-1])]
        else:
            cfg["activations"] = None

        return cfg

    # ---- Flatten ----
    if isinstance(layer, tf.keras.layers.Flatten):
        cfg.update({"type": "flatten"})
        return cfg

    # ---- Default ----
    cfg.update({"type": "other", "config": layer.get_config()})
    return cfg


def export_model_json(model: Model, sample_input, path="frontend/public/data/model.json"):
    if not model.built:
        raise ValueError("Model is not built yet.")

    data = {
        "model_name": "convolution",
        "layers": [layer_to_json(layer, model, sample_input) for layer in model.layers],
    }

    with open(path, "w") as f:
        json.dump(data, f, indent=4)

    return data
