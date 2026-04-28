import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model

# ============================================================
# 2. Convert layer to JSON (kernels + activations)
# ============================================================
def layer_to_json(layer, model, sample_input):
    cfg = {"name": layer.name, "class": layer.__class__.__name__}

    # Dense
    if isinstance(layer, tf.keras.layers.Dense):
        W, b = layer.get_weights()
        cfg.update({
            "type": "dense",
            "weights": W.tolist(),
            "bias": b.tolist(),
            "activation": tf.keras.activations.serialize(layer.activation)
        })
        return cfg

    # Conv2D
    if isinstance(layer, tf.keras.layers.Conv2D):
        K, b = layer.get_weights()
        kh, kw, in_ch, out_ch = K.shape

        kernels = [K[:, :, :, i].tolist() for i in range(out_ch)]

        sub = Model(inputs=model.input, outputs=layer.output)
        act = sub.predict(sample_input)[0]
        activations = [act[:, :, i].tolist() for i in range(out_ch)]

        cfg.update({
            "type": "conv2d",
            "stride": list(layer.strides),
            "kernel_shape": [kh, kw, in_ch, out_ch],
            "kernels": kernels,
            "bias": b.tolist(),
            "activation": tf.keras.activations.serialize(layer.activation),
            "input_shape": list(layer.input.shape[1:3]),
            "output_shape": list(layer.output.shape[1:3]),
            "activations": activations
        })
        return cfg

    # MaxPool2D
    if isinstance(layer, tf.keras.layers.MaxPooling2D):
        sub = Model(inputs=model.input, outputs=layer.output)
        act = sub.predict(sample_input)[0]
        activations = [act[:, :, i].tolist() for i in range(act.shape[-1])]

        cfg.update({
            "type": "maxpool2d",
            "pool_size": list(layer.pool_size),
            "stride": list(layer.strides),
            "padding": layer.padding,
            "input_shape": list(layer.input.shape[1:3]),
            "output_shape": list(layer.output.shape[1:3]),
            "activations": activations
        })
        return cfg

    # Flatten
    if isinstance(layer, tf.keras.layers.Flatten):
        cfg.update({"type": "flatten"})
        return cfg

    cfg.update({"type": "other"})
    return cfg


# ============================================================
# 3. Export model JSON
# ============================================================
def export_model_json(model, sample_input, path="frontend/public/data/model.json"):
    data = {
        "model_name": "convolution",
        "layers": [layer_to_json(layer, model, sample_input) for layer in model.layers]
    }

    with open(path, "w") as f:
        json.dump(data, f, indent=4)

    print(f"Saved model JSON to {path}")