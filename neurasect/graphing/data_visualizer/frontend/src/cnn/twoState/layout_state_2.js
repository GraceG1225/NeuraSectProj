export function buildConvFilter(layer, filterIndex) {
    const activation = layer.activations[filterIndex];   // 2D array (H_out × W_out)
    const [kh, kw, inCh, outCh] = layer.kernel_shape;
    const [H_out, W_out] = layer.output_shape;

    return {
        filterIndex,
        type: "conv2d",

        // spatial shape of the output feature map
        shape: [H_out, W_out],


        // kernel size
        kernelSize: [kh, kw],

        // number of output neurons
        numNeurons: H_out * W_out,

        // actual activation values from model.json
        values: activation
    };
}


export function buildPoolFilter(layer, filterIndex) {
    const activation = layer.activations[filterIndex];   // 2D array (H_out × W_out)

    const [pH, pW] = layer.pool_size;
    const [sH, sW] = layer.stride;
    const [H_in, W_in] = layer.input_shape;
    const [H_out, W_out] = layer.output_shape;

    return {
        filterIndex,
        type: "maxpool2d",

        // input spatial shape
        inputShape: [H_in, W_in],

        // output spatial shape
        shape: [H_out, W_out],

        // pooling window
        poolSize: [pH, pW],

        // stride
        stride: [sH, sW],

        // number of output neurons
        numNeurons: H_out * W_out,

        // actual activation values from model.json
        values: activation
    };
}

