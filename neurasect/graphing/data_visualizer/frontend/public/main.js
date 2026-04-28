import { create_data_viz, add_neuron_dense } from "./index.js";

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

async function main() {

    // Load model.json
    const model = await fetch("./data/model.json").then(r => r.json());

    const palette = {
        primary: "#0092a5",
        secondary: "#fb3600"
    };

    // Create renderer state
    const denseRender = create_data_viz(
        model,
        palette,
        window.screen.width - 100,
        window.screen.height - 100
    );

    // ⭐ 2. Wait a moment so the user SEES the initial state
    await delay(2000);

    // Prepare new weights
    const layerIndex = 3;
    const incoming = randomWeights(model.layers[layerIndex - 1]);
    const outgoing = randomWeights(model.layers[layerIndex + 1]);
    const newWeights = { incoming, outgoing };

    // ⭐ 3. Add neuron + animate transition
    await add_neuron_dense(denseRender, layerIndex, newWeights);

    console.log("Neuron added + transitions complete");
}

function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
}


main();