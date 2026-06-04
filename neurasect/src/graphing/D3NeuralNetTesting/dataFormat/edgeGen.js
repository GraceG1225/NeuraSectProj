/**
 * Generate edges using the real weight matrices from JSON.
 * layers = [4,3,2]
 * weights = [ [4x3], [3x2] ]
 */
export function makeEdgesFromWeights(layers, weights) {
  // Stores generated edges
  const edges = [];

  // Generate edges between layers. Ex: If three layers, run twice
  for (let layer = 0; layer < weights.length; layer++) {
    // Saves weights of edges between two layers.
    const weightMatrix = weights[layer];

    // Processes each weight along with their corresponding source node and destination node.
    // Creates an edge and saves it in a list of edges.
    // Each edge object contains a weight, a source node ID, and a destination node ID
    for (let src = 0; src < weightMatrix.length; src++) {
      for (let dst = 0; dst < weightMatrix[src].length; dst++) {
        edges.push({
          source: `L${layer}-N${src}`,
          target: `L${layer + 1}-N${dst}`,
          weight: weightMatrix[src][dst]
        });
      }
    }
  }

  // Returns list of edges
  return edges;
}