/**
 * Generate node objects dynamically from a layers array.
 * Example: layers = [4, 3, 2]
 */
export function formatNodes(layers, width = 960, height = 500) {

  const nodes = []; // Stores formatted nodes to be returned.
  const numLayers = layers.length; // Saves number of layers based off length of layers array

  const LAYER_SPACING = 123; // fixed horizontal distance between layers
  const totalWidth = (numLayers - 1) * LAYER_SPACING;
  const xOffset = (width - totalWidth) / 2;

  for (let layer = 0; layer < numLayers; layer++) {
    const count = layers[layer];

    // Fixed horizontal position
    const cx = xOffset + layer * LAYER_SPACING;

    for (let i = 0; i < count; i++) {
      const ySpacing = height / (count + 1);
      const cy = (i + 1) * ySpacing;

      nodes.push({
        id: `L${layer}-N${i}`,
        layer,
        index: i,
        cx,
        cy,
        r: 15,
        fill: '#7ba9ea',
        activation: 0
      });
    }
  }

  // Return formatted nodes
  return nodes;
}