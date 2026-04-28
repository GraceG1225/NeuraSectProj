import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import Model

# Returns array of layers in a layer
def extract_layers(model: Model):
    layers = []

    for layer in model.layers:
        if hasattr(layer, 'units'):
            layers.append(layer.units)

    print("layers:")
    print(layers)
    print("\n")
    return np.array(layers, dtype=int)

def extract_weights(model: Model, layers):
    weights = []

    for i in range(len(layers) - 1):

        kernel = model.layers[i + 1].get_weights()[0]  # kernel matrix
        print(f"Layer {i+1} weight:")
        print(kernel)
        print("\n")
        weights.append(kernel.tolist())

    return weights

def create_data(name, layers, weights):
    data = {
        "model_name": name,
        "layers": layers.tolist(),   # ← convert here
        "weights": weights
    }
    return data

def vizualize(model: Model):

    layers = [] 
    weights = []

    name = "dense"
    layers = extract_layers(model)
    weights = extract_weights(model, layers)

    data = create_data(name, layers, weights)

    with open("frontend/public/data/model.json", "w") as f:
        json.dump(data, f, indent=4)