import { createDense } from "../src/dnn/denseGen.js";
import { create_conv } from "../src/cnn/conv_gen.js";

/* 
 * Data vizualizer function
 * Returns an svg with interactive elements
 * Support for convolution and dense neural networks
 * model: json array
 * palette: UI color pallette (implement later)
 * width: svg width
 * height: svg height
 */
export async function create_data_viz(model, palette, width = 700, height = 600) {

    // d3 svg selection
    const svg = d3.select('body').append('svg')
        .attr("width", width)
        .attr("height", height);

    // Conditional statement. 
    // If model is a dense network, call dense network renderer
    // If model is convolution, call conv network renderer
    if (model.model_name === "dense") createDense(svg, model); 
    else if (model.model_name === "convolution") create_conv(svg, model, palette);

    // Return the svg selection
    return svg;

}
