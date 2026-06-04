import { create_dense, addNeuron} from "../src/dnn/denseGen.js";
import { create_conv } from "../src/cnn/conv_gen.js";

/**
 * Root data visualization function
 * @param {*} model JSON representation of model
 * @param {*} palette Color theme. Can contain two hexcodes {primary, secondary}
 * @param {*} width SVG width
 * @param {*} height SVG height
 * @returns SVG selection + related specifications
 */
export function create_data_viz(model, palette, width, height, container, d3) {
    const svg = d3.select(container.querySelector("svg"));

    let render = null;

    if (model.model_name === "dense") render = create_dense(svg, model, palette); 
    else if (model.model_name === "convolution") render = create_conv(svg, model, palette);

  return render;
}

export function add_neuron_dense(denseRender, layerIndex, weights) {

    const layersR = denseRender.layers;
    const weightsR = denseRender.weights;

    addNeuron(denseRender, layerIndex, weights);
}
