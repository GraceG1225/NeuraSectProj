from graphviz import Digraph
import numpy as np
from tensorflow.keras import Model

# Returns array of nodes in a layer
def extract_nodes_per_layer(model: Model):
    nodes = []
    for layer in model.layers:
        if hasattr(layer, 'units'):
            nodes.append(layer.units)
    return np.array(nodes, dtype=int)

# Visualizes a model using an array of integers.
# Integers correspond to number of nodes per layer.
def visualize_model_graph(nodes, output_filename='tensorTransGraph'):
    """
    Creates a Graphviz diagram of a neural network given a list of units per layer.
    """
    dot = Digraph()
    dot.attr(splines='false', rankdir='LR')
    dot.attr('edge', minlen='1')

    ascii_value = 65  # Start with 'A'
    for i in range(len(nodes) - 1):
        layer_from = [f"{chr(ascii_value)}{j+1}" for j in range(nodes[i])]
        layer_to = [f"{chr(ascii_value + 1)}{k+1}" for k in range(nodes[i + 1])]
        for src in layer_from:
            for dst in layer_to:
                dot.edge(src, dst)
        ascii_value += 1

    dot.render(output_filename, format='png', cleanup=False, view=True)