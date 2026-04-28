/**
 * Generate edges using the real weight matrices from JSON.
 * layers = [4,3,2]
 * weights = [ [4x3], [3x2] ]
 * Returns edges layout array
 */
export function edge_layout(weights, oldEdges = []) {

    const edges = []; // Edges array

    // Build lookup table for old edges if they exist
    const oldByKey = new Map(
        oldEdges.map(e => [`${e.layer}-${e.src}-${e.dst}`, e])
    );

    // Iterates for each pair of source-destination layers
    for (let layer = 0; layer < weights.length; layer++) {
        const weightMatrix = weights[layer]; // Saves matrix of weights for a source-destination layer pair

        // Iterates for each neuron in source layer
        for (let src = 0; src < weightMatrix.length; src++) {
            // Iterates for each neuron in destination layer
            for (let dst = 0; dst < weightMatrix[src].length; dst++) {

                const key = `${layer}-${src}-${dst}`; // Key for edge map.
                const old = oldByKey.get(key); // Save old edge from old edge layout array

                // Push edge into edge layout array
                edges.push({
                    // Stable edge ID. If exist, use old one.
                    id: old ? old.id : crypto.randomUUID(),

                    // Logical identity (used for lookup)
                    layer,
                    src,
                    dst,

                    // Node IDs (already stable)
                    source: old ? old.source : null, // we will fill this later
                    target: old ? old.target : null,

                    weight: weightMatrix[src][dst] // Weight value
                });
            }
        }
    }

    return edges; // Edge layout array
}


export function applyProvidedWeights(layers, weights, layerIndex, newWeights) {
    const { incoming, outgoing } = newWeights;

    // Clone layers so we don't mutate the original
    const newLayers = layers.slice();

    // Increase neuron count in the target layer
    newLayers[layerIndex] += 1;

    // Clone weights deeply (no shared references)
    const newWeightsArr = weights.map(matrix =>
        matrix.map(row => row.slice())
    );

    // -------------------------------------------------------
    // 1. UPDATE INCOMING WEIGHTS (layerIndex - 1 → layerIndex)
    // -------------------------------------------------------
    if (layerIndex > 0) {
        const incomingMatrix = newWeightsArr[layerIndex - 1];

        if (incoming.length !== incomingMatrix.length) {
            throw new Error(
                `Incoming weights length mismatch. Expected ${incomingMatrix.length}, got ${incoming.length}`
            );
        }

        // Add one new weight to each row (each neuron in previous layer)
        incomingMatrix.forEach((row, i) => {
            row.push(incoming[i]);
        });
    }

    // -------------------------------------------------------
    // 2. UPDATE OUTGOING WEIGHTS (layerIndex → layerIndex + 1)
    // -------------------------------------------------------
    if (layerIndex < layers.length - 1) {
        const outgoingMatrix = newWeightsArr[layerIndex];

        if (outgoing.length !== outgoingMatrix[0].length) {
            throw new Error(
                `Outgoing weights length mismatch. Expected ${outgoingMatrix[0].length}, got ${outgoing.length}`
            );
        }

        // Add a new row for the new neuron
        outgoingMatrix.push(outgoing.slice());
    }

    return {
        layers: newLayers,
        weights: newWeightsArr
    };
}

