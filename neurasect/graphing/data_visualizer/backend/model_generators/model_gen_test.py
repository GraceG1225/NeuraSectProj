import random
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model
from dense_model_json import vizualize
from conv_model_json import export_model_json

def create_test_dense():
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
        
def create_test_conv():
    inputs = layers.Input(shape=(32, 32, 3))

    x = layers.Conv2D(32, (3, 3), activation='relu')(inputs)
    x = layers.MaxPooling2D((2, 2))(x)

    x = layers.Conv2D(64, (3, 3), activation='relu')(x)
    x = layers.MaxPooling2D((2, 2))(x)

    x = layers.Conv2D(64, (3, 3), activation='relu')(x)

    x = layers.Flatten()(x)
    x = layers.Dense(64, activation='relu')(x)
    outputs = layers.Dense(10, activation='softmax')(x)

    model = Model(inputs=inputs, outputs=outputs)

    model.compile(
        optimizer='adam',
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    # Train on random data
    X = np.random.rand(500, 32, 32, 3).astype(np.float32)
    y = np.random.randint(0, 10, size=(500,))

    model.fit(X, y, epochs=2, batch_size=32)

    # Random sample for activations
    sample_input = np.random.rand(1, 32, 32, 3).astype(np.float32)

    # Force graph build
    _ = model.predict(sample_input)

    export_model_json(model, sample_input)

create_test_dense()