import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import Model

# Returns array of nodes in a layer
def extract_nodes(model: Model):
    nodes = []

    for layer in model.layers:
        if hasattr(layer, 'units'):
            nodes.append(layer.units)

    print("Nodes:")
    print(nodes)
    print("\n")
    return np.array(nodes, dtype=int)

def extract_weights(model: Model, nodes):
    weights = []

    for i in range(len(nodes) - 1):

        kernel = model.layers[i + 1].get_weights()[0]  # kernel matrix
        print(f"Layer {i+1} weight:")
        print(kernel)
        print("\n")
        weights.append(kernel.tolist())

    return weights

def create_data(nodes, weights):
    data = {
        "nodes": nodes.tolist(),   # ← convert here
        "weights": weights
    }
    return data

def vizualize(model: Model):

    nodes = [] 
    weights = []

    nodes = extract_nodes(model)
    weights = extract_weights(model, nodes)

    data = create_data(nodes, weights)

    with open("public/data/model.json", "w") as f:
        json.dump(data, f, indent=4)
    
