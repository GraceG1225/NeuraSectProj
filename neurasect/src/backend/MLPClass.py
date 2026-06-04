import numpy as np
import tensorflow as tf
from sklearn.datasets import load_iris
from tensorflow.python.keras.layers import Input, Dense
from tensorflow.keras import layers

class Layer:
    def __init__(self, input_shape=None, neurons=2, activation="relu"):
        self.input_shape = input_shape
        self.neurons = neurons
        self.activation = activation
        self.prev = None
        self.next = None

    def Dense(self):
        return layers.Dense(self.neurons, activation=self.activation)

class headers:
    def __init__(self):
        self.next = None
        self.prev = None

class MLP:
    def __init__(self, input_shape=None, output_shape=None, num_of_classes=None,
                 num_of_layers=1, num_of_neurons_per_layer=2, activation='relu',
                 output_activation=None):
        self.input_shape = input_shape
        self.output_shape = output_shape
        self.num_of_classes = num_of_classes
        self.num_of_layers = num_of_layers
        self.activation = activation
        self.output_activation = output_activation
    # Might need to add regularizers - either here or in each layers(class: Layer)

        # handle default incremental hidden layers or use provided list
        if isinstance(num_of_neurons_per_layer, int):
            self.num_of_neurons_per_layer = list(range(num_of_neurons_per_layer, num_of_neurons_per_layer + self.num_of_layers - 1))
        else:
            self.num_of_neurons_per_layer = num_of_neurons_per_layer

        assert len(self.num_of_neurons_per_layer) == self.num_of_layers - 1, \
            "len(num_of_neurons_per_layer) must equal num_of_layers-1"

        self.head = headers()
        self.tail = headers()
        self.model = tf.keras.Sequential([])
        self.init_layer = None
        self.output_layer = None
        self._built = False # stop it from rebuilding over and over
        self._compiled = False
        self.input_dim = None

    def build_network(self):
        if self._built:
            return # once it's built it won't rebuild

        #if self.num_of_classes is None and self.model_output is not None:
        #    self.num_of_classes = np.unique(self.model_output).shape[0]
        self.num_of_classes = self.output_shape

        if self.output_activation is None:
            if self.num_of_classes == 1:
                out_activation = 'linear'
            else:
                out_activation = 'softmax'
        else:
            out_activation = self.output_activation

        init_layer = Layer(
            neurons=self.num_of_neurons_per_layer[0],
            activation=self.activation,
            input_shape=self.input_shape
        )
        init_layer.prev = self.head
        self.head.next = init_layer
        init_layer.next = self.tail
        self.tail.prev = init_layer
        self.init_layer = init_layer

        for i in range(1, self.num_of_layers - 1):
            temp_layer = Layer(neurons=self.num_of_neurons_per_layer[i], activation=self.activation)
            self.tail.prev.next = temp_layer
            temp_layer.prev = self.tail.prev
            self.tail.prev = temp_layer
            temp_layer.next = self.tail

        if self.num_of_classes is not None:
            output_layer = Layer(neurons=self.num_of_classes, activation=out_activation)
            last_hidden = self.tail.prev
            last_hidden.next = output_layer
            output_layer.prev = last_hidden
            output_layer.next = self.tail
            self.tail.prev = output_layer
            self.output_layer = output_layer # reference

        self._built = True

    def add_layer(self, neurons, activation):
        temp_layer = Layer(neurons=neurons, activation=activation)
        self.output_layer.prev.next = temp_layer
        temp_layer.layer.prev = self.output_layer.prev
        self.output_layer.prev = temp_layer
        temp_layer.next = self.output_layer

    def hop(self, steps):
        temp = self.head
        for i in range(steps):
            temp = temp.next
        return temp

    def edit_layer(self, layer_number, neurons=2, activation='relu'):
        temp_layer = self.hop(layer_number)
        new_layer = Layer(neurons=neurons, activation=activation)
        temp_layer.prev.next = new_layer
        temp_layer.next.prev = new_layer

    def tf_build(self):
        if self.model.layers:
            return self.model

        self.build_network()
        model = tf.keras.Sequential([])
        temp = self.init_layer
        first = True

        while temp is not self.tail:
            if first:
                model.add(tf.keras.layers.Dense(
                    temp.neurons,
                    activation=temp.activation,
                    input_shape=(self.input_shape,)
                ))
                first = False
            else:
                model.add(tf.keras.layers.Dense(
                    temp.neurons,
                    activation=temp.activation
                ))
            temp = temp.next

        self.model = model
        return self.model

    def compile(self, optimizer="adam", loss=None, metrics=None):

        if self._compiled:
            return # compile() can no longer be called multiple times

    # build model (tf_build sets self.model)
        self.tf_build()

    # choose correct default loss
        if loss is None:
            if self.output_activation == 'linear' or (self.output_shape == 1):
                loss = "mse"
            else:
                loss = "categorical_crossentropy"

        self.model.compile(optimizer=optimizer, loss=loss, metrics=metrics or [])
        self._compiled = True

    def fit(self, X, y, epochs=10, **kwargs):
        if not self._compiled:
            raise RuntimeError("Call compile() before fit()") # ERR: can't call fit before compiled now

        #model  = self.tf_build()
        #model.compile(self.model.fit(X, y, **kwargs))
        return self.model.fit(X, y, epochs=epochs, **kwargs)

    def predict(self, X, **kwargs):
        model = self.tf_build()
        return self.model.predict(X, **kwargs)

    def summary(self):
        model = self.tf_build()
        return self.model.summary()

    def evaluate(self, X, y, **kwargs):
        if not self._compiled:
            raise RuntimeError("Call compile() before evaluate()")
        return self.model.evaluate(X, y, **kwargs)

    def save_weights(self, filepath="mlp_weights.weights.h5"):
        self.model.save_weights(filepath)
        print(f"Weights to be saved to {filepath}")

    def save_weights_per_each_epoch(self, filepath="weights_epoch_{epoch}.weights.h5"):
        checkpoint = tf.keras.callbacks.ModelCheckpoint(
            filepath=filepath, save_weights_only=True, save_freq='epoch'
        )
        return checkpoint