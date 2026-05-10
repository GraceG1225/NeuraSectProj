import { neuron_layout } from "./data_format/nodeGen.js";
import { edge_layout, applyProvidedWeights } from "./data_format/edgeGen.js";
import { 
    init_render, 
    render_dense
} from "./render_dense.js";

/**
 * Creates the visualization for fully-connected (dense) neural networks.
 * @param {*} svg SVG selection
 * @param {*} model JSON representation of model
 * @param {*} palette Colors
 * @returns SVG selection and related information
 */
export function create_dense(svg, model, palette) {

    // SVG Dimensions
    const width = +svg.attr("width"); // width
    const height = +svg.attr("height"); // height

    const layers = model.layers; // Array of numbers. Correspond to number of neurons per layer.
    // 2D array. 
    // FIRST LEVEL: Array of arrays, with each element corresponding to pair of adjacent layers. 
    // SECOND LEVEL: Array of arrays. Each array corresponds to a neuron within the source layer
    // THIRD LEVEL: Array of weight values. Each array corresponds to a neurons edges that connect to edges in the destination layer.
    const weights = model.weights; 
    console.log(layers, weights);
    
    // 1. Compute initial layout of neurons
    const nodes = neuron_layout(layers, palette, width, height);

    // 2. Compute initial layout of edges
    const edges = edge_layout(weights, []);
    
    // Build lookup table for node IDs
    const nodeByKey = new Map(
        nodes.map(n => [`${n.layer}-${n.index}`, n.id])
    );

    // 4. Fill in source/target IDs for edges
    for (const e of edges) {
        e.source = nodeByKey.get(`${e.layer}-${e.src}`);
        e.target = nodeByKey.get(`${e.layer+1}-${e.dst}`);
    }

    // 5. Initialize renderer
    const handles = init_render(svg);

    // 6. First render
    render_dense(handles, nodes, edges, palette);

    // 7. Return everything needed for updates
    return {
        svg,
        layers,
        weights,
        palette,
        width,
        height,
        nodes,
        edges,
        handles
    };
}

export function validateEdges(nodes, edges) {
    const nodeIds = new Set(nodes.map(n => n.id));

    for (const e of edges) {
        if (!nodeIds.has(e.source)) {
            console.error("❌ INVALID SOURCE", {
                edge: e,
                missingSource: e.source
            });
        }
        if (!nodeIds.has(e.target)) {
            console.error("❌ INVALID TARGET", {
                edge: e,
                missingTarget: e.target
            });
        }
    }
}


export function addNeuron(denseRender, layerIndex, newWeights) {
    console.log(denseRender);
    console.log(layerIndex);
    console.log(newWeights);

    const nodes = denseRender.nodes;
    const edges = denseRender.edges;
    const layers = denseRender.layers;
    const weights = denseRender.weights;

    console.log(nodes, edges, layers, weights);
    
    // 1. Mutate model
    const { layers: newLayers, weights: newWeightsArr } =
        applyProvidedWeights(layers, weights, layerIndex, newWeights);
    
    console.log(newLayers, newWeightsArr);

    // 2. Recompute layout
    const newNodes = neuron_layout(
        newLayers,
        denseRender.palette, 
        denseRender.width, 
        denseRender.height,
        denseRender.nodes
    );

    console.log("🟦 newNodes:", newNodes.map(n => ({
        id: n.id,
        layer: n.layer,
        index: n.index
    })));

    console.log("Node layer/index check:", newNodes.map(n => `${n.layer}-${n.index}`));

    const newEdges = edge_layout(
        newWeightsArr,
        denseRender.edges // ⭐ old edges
    );

    console.log("🟥 newEdges:", newEdges.map(e => ({
        id: e.id,
        layer: e.layer,
        src: e.src,
        dst: e.dst,
        source: e.source,
        target: e.target
    })));


    // Fill in stable source/target IDs
    const nodeByKey = new Map(
        newNodes.map(n => [`${n.layer}-${n.index}`, n.id])
    );

    for (const e of newEdges) {
        e.source = nodeByKey.get(`${e.layer}-${e.src}`);
        e.target = nodeByKey.get(`${e.layer+1}-${e.dst}`);
    }

    validateEdges(newNodes, newEdges);

    console.log(newLayers);
    

    // 3. Animate update
    render_dense(
        denseRender.handles, 
        newNodes, 
        newEdges, 
        denseRender.palette
    );

    // 4. Update stored layout
    denseRender.nodes = newNodes;
    denseRender.edges = newEdges;
}


