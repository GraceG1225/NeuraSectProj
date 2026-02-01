import tensorflow as tf
from tensorflow.keras import Sequential, layers, models
import numpy as np
from typing import Optional, List


class MLP:
    
    def __init__(self, input_dim: int):
        self.input_dim = input_dim
        self.model = Sequential()
        self._has_input = False
        self._layers = [] 
        
    def __repr__(self):
        return f"MLP(input_dim={self.input_dim}, layers={len(self._layers)})"
    
    def add_layer(self, neurons: int, activation: str = "relu", **kwargs):
        if not self._has_input:
            self.model.add(layers.Dense(
                neurons,
                activation=activation,
                input_shape=(self.input_dim,),
                **kwargs
            ))
            self._has_input = True
        else:
            self.model.add(layers.Dense(neurons, activation=activation, **kwargs))
        
        self._layers.append({
            'neurons': neurons,
            'activation': activation,
            'kwargs': kwargs
        })
    
    def add_dropout(self, rate: float = 0.5):
        self.model.add(layers.Dropout(rate))
    
    def add_batch_norm(self):
        self.model.add(layers.BatchNormalization())
    
    def rebuild_with_new_layer(self, layer_index: int, neurons: int, activation: str = "relu"):
        if layer_index >= len(self._layers):
            raise ValueError(f"Layer index {layer_index} out of range")
        
        self._layers[layer_index]['neurons'] = neurons
        self._layers[layer_index]['activation'] = activation
        
        old_weights = self.get_weights() if self._has_input else None
        self.model = Sequential()
        self._has_input = False
        
        for i, layer_config in enumerate(self._layers):
            self.add_layer(
                layer_config['neurons'],
                layer_config['activation'],
                **layer_config['kwargs']
            )
        
        if old_weights:
            try:
                self.set_weights(old_weights)
            except:
                print("Warning: Could not restore all weights after layer modification")
    
    def get_weights(self):
        if self._has_input:
            return self.model.get_weights()
        return None
    
    def set_weights(self, weights):
        if self._has_input and weights:
            self.model.set_weights(weights)
    
    def compile(self, optimizer="adam", loss="mse", metrics=None):
        self.model.compile(optimizer=optimizer, loss=loss, metrics=metrics or [])
    
    def fit(self, X, y, **kwargs):
        return self.model.fit(X, y, **kwargs)
    
    def predict(self, X, **kwargs):
        return self.model.predict(X, **kwargs)
    
    def evaluate(self, X, y, **kwargs):
        return self.model.evaluate(X, y, **kwargs)
    
    def summary(self):
        return self.model.summary()
    
    def get_config(self):
        return {
            'input_dim': self.input_dim,
            'layers': self._layers
        }
    
    def save(self, filepath: str):
        self.model.save(filepath)
    
    @classmethod
    def from_config(cls, config):
        mlp = cls(config['input_dim'])
        for layer_config in config['layers']:
            mlp.add_layer(
                layer_config['neurons'],
                layer_config['activation'],
                **layer_config.get('kwargs', {})
            )
        return mlp


def build_mlp_from_config(
    input_dim: int,
    num_layers: int,
    neurons_per_layer: int,
    activation: str = "relu",
    output_neurons: int = 1,
    output_activation: str = "linear",
    dropout_rate: Optional[float] = None,
    use_batch_norm: bool = False
) -> MLP:
    mlp = MLP(input_dim)
    
    for i in range(num_layers):
        mlp.add_layer(neurons_per_layer, activation)
        
        if use_batch_norm:
            mlp.add_batch_norm()
        
        if dropout_rate is not None:
            mlp.add_dropout(dropout_rate)
    
    mlp.add_layer(output_neurons, output_activation)
    
    return mlp

if __name__ == "__main__":
    mlp = MLP(input_dim=4)
    mlp.add_layer(10, "relu")
    mlp.add_layer(5, "relu")
    mlp.add_layer(3, "softmax")
    
    mlp.summary()
    
    mlp2 = build_mlp_from_config(
        input_dim=4,
        num_layers=2,
        neurons_per_layer=8,
        activation="relu",
        output_neurons=3,
        output_activation="softmax",
        dropout_rate=0.2
    )
    
    mlp2.summary()