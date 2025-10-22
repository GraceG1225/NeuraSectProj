from graphviz import Digraph
import numpy as np

# Needs a number of layers and array of nodes per layer
# Layers = 3, Nodes = [4, 3, 3] 
# Collect number of layers
layers = int(input("Enter the number of layers: "))

# Initialize the NODES array
nodes = []

# Collect node count for each layer
for i in range(layers):
    node_count = int(input(f"Enter number of nodes in layer {i + 1}: "))
    nodes.append(node_count)

# Display the result
print(f"LAYERS: {layers}")
print(f"NODES: {nodes}")


dot = Digraph()

dot.attr(splines='false')
dot.attr(rankdir='LR')
dot.attr('edge',minlen='1')

ascii_value = 65
for i in range(0,layers - 1):
    arr1 = np.array([f"{chr(ascii_value)}{x}" for x in range(1, nodes[i] + 1)])
    arr2 = np.array([f"{chr(ascii_value + 1)}{y}" for y in range(1, nodes[i] + 1)])
    for j in range (nodes[i]):
        for k in range(nodes[i + 1]):
            dot.edge(arr1[j], arr2[k])
    ascii_value += 1


dot.render('neural_net_gr', format='png', cleanup=True, view=True)