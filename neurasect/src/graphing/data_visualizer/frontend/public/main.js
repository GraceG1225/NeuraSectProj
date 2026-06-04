import { create_data_viz, add_neuron_dense } from "./index.js";
import { edge_layout } from "../src/dnn/data_format/edgeGen.js";
import { render_dense } from "../src/dnn/render_dense.js";

function randomWeights(length) {
    const arr = new Array(length);
    for (let i = 0; i < length; i++) {
        // Math.random() → [0,1)
        // scale to (-1,1) by:  (Math.random() * 2 - 1)
        let w = Math.random() * 2 - 1;

        // Ensure NOT inclusive of -1 or 1
        if (w === -1) w = -0.999999;
        if (w === 1)  w = 0.999999;

        arr[i] = w;
    }
    return arr;
}

function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}

export async function runDenseAnimation(model, container, palette, d3) {

    const denseRender = create_data_viz(
        model,
        palette,
        container.clientWidth,
        container.clientHeight,
        container,
        d3
    );

    await delay(800);

    const layerIndex = Math.min(3, model.layers.length - 2);

    const prevSize = model.layers[layerIndex - 1] ?? 0;
    const nextSize = model.layers[layerIndex + 1] ?? 0;

    const incoming = randomWeights(prevSize);
    const outgoing = randomWeights(nextSize);

    await add_neuron_dense(denseRender, layerIndex, { incoming, outgoing });
}

export function createDense(model, container, palette, d3) {
    return create_data_viz(
        model,
        palette,
        container.clientWidth,
        container.clientHeight,
        container,
        d3
    );
}

export function updateDenseWeights(denseRender, newWeights) {
    if (!denseRender) return;

    const newEdges = edge_layout(newWeights, denseRender.edges);

    const nodeByKey = new Map(
        denseRender.nodes.map(n => [`${n.layer}-${n.index}`, n.id])
    );
    for (const e of newEdges) {
        e.source = nodeByKey.get(`${e.layer}-${e.src}`);
        e.target = nodeByKey.get(`${e.layer + 1}-${e.dst}`);
    }

    render_dense(denseRender.handles, denseRender.nodes, newEdges, denseRender.palette);

    denseRender.edges = newEdges;
    denseRender.weights = newWeights;
}