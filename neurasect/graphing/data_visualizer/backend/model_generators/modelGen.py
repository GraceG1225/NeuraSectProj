import tensorflow as tf
import numpy as np
import random

from graphDataGen import vizualize
from model_to_json import export_model_json
# -----------------------------
# 1. Choose random layer sizes
# -----------------------------
# You can adjust these ranges however you want
num_layers = random.randint(2, 5)          # between 2 and 5 layers
layer_sizes = [random.randint(2, 10) for _ in range(num_layers)]

print("Random layer sizes:", layer_sizes)

# -----------------------------
# 2. Build the model
# -----------------------------
model = tf.keras.Sequential()

# First layer needs input_shape
model.add(tf.keras.layers.Dense(layer_sizes[0],
                                activation='relu',
                                input_shape=(layer_sizes[0],)))

# Hidden + output layers
for size in layer_sizes[1:]:
    model.add(tf.keras.layers.Dense(size, activation='relu'))

# -----------------------------
# 3. Assign random weights
# -----------------------------
for layer in model.layers:
    if hasattr(layer, "kernel"):
        shape = layer.kernel.shape
        random_kernel = np.random.uniform(-1, 1, size=shape)
        random_bias = np.random.uniform(-1, 1, size=layer.bias.shape)
        layer.set_weights([random_kernel, random_bias])

# -----------------------------
# 4. Show summary
# -----------------------------
print("SUMMARY STATEMENT")
model.summary()
print("\n")

vizualize(model)
