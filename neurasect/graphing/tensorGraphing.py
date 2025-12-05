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

def weight_to_color(weight, min_w=-1.0, max_w=1.0):
    """
    Map weight to a color between red (negative) and black (positive).
    min_w and max_w define the expected range of weights.
    """
    # Normalize weight to [0,1]
    norm = (weight - min_w) / (max_w - min_w)
    norm = max(0.0, min(1.0, norm))  # clamp

    # Reverse behavior:
    # - Positive weights → black (#000000)
    # - Negative weights → red (#FF0000)
    red = int(255 * (1 - norm))  # more negative → more red
    green = 0
    blue = 0

    return f"#{red:02x}{green:02x}{blue:02x}"

def weight_to_thickness(weight, min_w=-1.0, max_w=1.0, min_thick=0.8, max_thick=3):
    """
    Map weight to an edge thickness between min_thick (for negative) and max_thick (for positive).
    min_w and max_w define the expected range of weights.
    """
    # Normalize weight to [0,1]
    norm = (weight - min_w) / (max_w - min_w)
    norm = max(0.0, min(1.0, norm))  # clamp
    
    # Interpolate between min_thick and max_thick
    thickness = min_thick + norm * (max_thick - min_thick)
    return thickness

def visualize_model_graph(model: Model, output_filename='tensorTransGraph'):
    """
    Creates a Graphviz diagram of a neural network given a list of units per layer.
    """
    dot = Digraph()
    dot.attr(splines='false', rankdir='LR')
    dot.attr('edge', minlen='1')

    nodes = extract_nodes_per_layer(model)

    ascii_value = 65  # Start with 'A'
    for i in range(len(nodes) - 1):
        layer_from = [f"{chr(ascii_value)}{j+1}" for j in range(nodes[i])]
        layer_to   = [f"{chr(ascii_value + 1)}{k+1}" for k in range(nodes[i + 1])]

        kernel = model.layers[i + 1].get_weights()[0]  # kernel matrix
        print(kernel)

        for j, src in enumerate(layer_from):
            for k, dst in enumerate(layer_to):
                weight = kernel[j][k]
                colorValue = weight_to_color(weight)
                thickness = weight_to_thickness(weight)
                dot.edge(src, dst, color=colorValue, penwidth=str(thickness))

        ascii_value += 1

    dot.render(output_filename, format='png', cleanup=False, view=True)

    ##dot.attr('edge', penwidth = '3')


