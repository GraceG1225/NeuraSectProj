
import tensorflow as tf
from tensorflow.keras import datasets, layers, models
import numpy as np

from model_to_json import export_model_json

# -----------------------------
# 1. Load and preprocess data
# -----------------------------
(x_train, y_train), (x_test, y_test) = datasets.cifar10.load_data()

# Normalize pixel values to [0, 1]
x_train, x_test = x_train / 255.0, x_test / 255.0

# Convert labels to 1D array
y_train = y_train.flatten()
y_test = y_test.flatten()

# -----------------------------
# 2. Build the CNN model
# -----------------------------
model = models.Sequential([
    # First convolutional block
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(32, 32, 3)),
    layers.MaxPooling2D((2, 2)),

    # Second convolutional block
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),

    # Third convolutional block
    layers.Conv2D(64, (3, 3), activation='relu'),

    # Flatten and dense layers
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')  # 10 classes in CIFAR-10
])

# -----------------------------
# 3. Compile the model
# -----------------------------
model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

# -----------------------------
# 4. Train the model
# -----------------------------
history = model.fit(
    x_train, y_train,
    epochs=2,
    validation_data=(x_test, y_test),
    batch_size=64
)

# -----------------------------
# 5. Evaluate the model
# -----------------------------
test_loss, test_acc = model.evaluate(x_test, y_test, verbose=2)
print(f"\nTest accuracy: {test_acc:.4f}")

# -----------------------------
# 6. Create json of file
# -----------------------------
export_model_json(model)




