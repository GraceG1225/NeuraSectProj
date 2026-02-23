import { createViz } from "../vizualize/viz.js"
import { formatNodes } from "../dataFormat/nodeGen.js";
import { makeEdgesFromWeights } from "../dataFormat/edgeGen.js";

async function main() {

  const model = await fetch("./data/model.json").then(r => r.json());

  const nodes = formatNodes(model.nodes);
  const edges = makeEdgesFromWeights(model.layers, model.weights);

  var svg = d3.select('body').append('svg')
    .attr("width", 1000)
    .attr("height", 1000)

  createViz(svg, { nodes, edges });
}

main();