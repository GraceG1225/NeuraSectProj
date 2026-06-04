import tensorflow as tf
from tensorflow.keras import datasets, layers, models
import numpy as np

from model_to_json import export_model_json

# -----------------------------
# 1. Load and preprocess data
# -----------------------------
(x_train, y_train), (x_test, y_test) = datasets.cifar10.load_data()

x_train, x_test = x_train / 255.0, x_test / 255.0
y_train, y_test = y_train.flatten(), y_test.flatten()

# -----------------------------
# 2. Build the CNN model
# -----------------------------
model = models.Sequential([
    layers.Input(shape=(32,32,3)),   # <-- THIS is the correct one
    layers.Conv2D(32, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(64, (3, 3), activation='relu'),

    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')
])


# -----------------------------
# 3. Compile the model
# -----------------------------
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

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
# 6. Create sample input for activation export
# -----------------------------
sample_input = np.random.rand(1, 32, 32, 3).astype(np.float32)

# Force model to build its graph so model.input exists
_ = model.predict(sample_input)

# -----------------------------
# 7. Export model JSON with activations
# -----------------------------
export_model_json(model, sample_input)
