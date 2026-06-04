/**
 * Creates the logical layout for neuron (node) elements
 * @param {*} layers Array of integers. Communicates number of neurons per layer
 * @param {*} palette Color values
 * @param {*} width Width of svg
 * @param {*} height Height of svg
 * @param {*} oldNodes Old node layout. Array. Importance is TBD
 * @returns neuron layout array. Each element is a neuron and its attributes that will be used when rendering
 */
export function neuron_layout(
    layers,
    palette,
    width = 960,
    height = 500,
    oldNodes = []
) {
    const nodes = []; // Neuron array
    const numLayers = layers.length; // Number of layers in model

    const MIN_SPACING = 100; // Minimum horizontal spacing
    const MAX_SPACING = 250; // Maximum horiz spacing

    // Calculate horizontal layer spacing
    let LAYER_SPACING = width / (numLayers + 1);
    LAYER_SPACING = Math.max(MIN_SPACING, Math.min(MAX_SPACING, LAYER_SPACING));

    const totalWidth = (numLayers - 1) * LAYER_SPACING; // Width of entire layout
    const xOffset = (width - totalWidth) / 2; // Offset between viz and edge of svg

    // MAP: Built-in object that stores key-value pairs
    //      Remembers insertion order.
    //      Can use any type of key
    // Build lookup table for old nodes (array)
    // Key = "layer-index"
    const oldByKey = new Map(
        oldNodes.map(n => [`${n.layer}-${n.index}`, n])
    );

    console.log(oldByKey);
    
    // For loop iterates over each layer
    for (let layer = 0; layer < numLayers; layer++) {
        const count = layers[layer]; // Number of neurons in layer
        const cx = xOffset + layer * LAYER_SPACING; // Calculates the x position of the layer

        // For loop iterates over each node
        for (let i = 0; i < count; i++) {
            const ySpacing = height / (count + 1); // Calculates vertical spacing between neurons
            const cy = (i + 1) * ySpacing; // Calculates y position of the node

            const key = `${layer}-${i}`; // Creates key using layer index and neuron index
            const old = oldByKey.get(key); // Save the neuron object from old neuron map if it exists

            // Push neuron onto node array
            nodes.push({
                // Reuse old ID if it exists, otherwise create a new stable ID
                id: old ? old.id : crypto.randomUUID(),

                layer,                 // Layer index
                index: i,              // Node index
                cx,                    // Horizontal position
                cy,                    // Vertical position
                r: 15,                 // Radius
                fill: palette.primary, // Color (primary)
                activation: 0          // Activation value (may be implemented later)
            });
        }
    }

    return nodes; // Return node layout array
}
