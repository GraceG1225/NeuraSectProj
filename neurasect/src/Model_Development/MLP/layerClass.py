class Layer:
    def __init__(self,input_shape=None,neurons=2,activation="relu"):
        self.input_shape = input_shape
        self.neurons = neurons
        self.activation = activation
        self.prev = None
        self.next = None

    def dense(self):
        return layers.Dense(self.neurons, activation=self.activation)