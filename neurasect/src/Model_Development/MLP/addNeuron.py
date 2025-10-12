import tensorflow as tf
from tensorflow.keras import layers, models

def safety_check(model):
  if not isinstance(model, models.Sequential):
        raise ValueError("add_neuron currently only supports Sequential models")
    
def add_neuron(model, activation="relu", name=None,layer_number):
     
    return

def add_layers(model,neuron=2,activaton='relu'):
    safety_check(model)
    model.add(layers.Dense(neurons,activation=activation))
    return model
    
# Example usage
model = models.Sequential([
    layers.Input(shape=(4,)),
    layers.Dense(3, activation="relu")
])

# Add one more neuron (a Dense layer with 1 unit)
model = add_neuron(model, activation="sigmoid", name="extra_neuron")
model.summary()

import numpy as np

class MLP:
    def __init__(self, input_, target_values, num_of_layers, num_of_neurons_per_layer):
        self.input = input_
        self.target_values = target_values
        self.num_of_layers = num_of_layers
        self.num_of_neurons_per_layer = np.array(num_of_neurons_per_layer)
    
    def add_layer(self,layer_number,neurons,activation='relu'):
        self.num_of_neurons_per_layer[layer_number-1] = neurons
        model.add(layers.Dense(neurons,activation)))
    def edit_layer(self,layer_number,neurons,activation='relu'):
        if layer_number !=1:
            new_model = model.Sequential([
                old_model.layers[:layer_number],
                layers.Dense(neurons,activation),
                old_model.layers[layer_number:]
            ])    
    def add_Neurons(self,nuerons=1,layer_number):    
        l_i = layer_number-1 # layer index
        total_nuerons = self.num_of_neurons_per_layer[l_i] + neurons
        editlayer(total_neurons)
     

