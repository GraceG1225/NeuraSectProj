"use client";

import { useEffect, useRef } from "react";

interface Node {
  id: string;
  layer: number;
  index: number;
  cx: number;
  cy: number;
  r: number;
  fill: string;
  activation: number;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
}

interface NeuralNetworkGraphProps {
  numLayers: number;
  numNeurons: number;
  inputFeatures?: number;
  outputClasses?: number;
  trainingProgress?: { accuracy?: number; val_accuracy?: number }[];
  Layers?: number[];
  Weights?: number[][][];
}

//from nodeGen
function formatNodes(layers: number[], width = 900, height = 380): Node[] {
  const nodes: Node[] = []; // Stores formatted nodes to be returned.
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
        fill: "#3b82f6",
        activation: 0,
      });
    }
  }

  // Return formatted nodes
  return nodes;
}

//from edgeGen
function makeEdgesFromWeights(layers: number[], weights: number[][][]): Edge[] {
  // Stores generated edges
  const edges: Edge[] = [];

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
          weight: weightMatrix[src][dst],
        });
      }
    }
  }

  // Returns list of edges
  return edges;
}

function createViz(
  svg: SVGSVGElement,
  { nodes, edges }: { nodes: Node[]; edges: Edge[] }
) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const NS = "http://www.w3.org/2000/svg";
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  let selectedId: string | null = null;

  const defs = document.createElementNS(NS, "defs");
  const marker = document.createElementNS(NS, "marker");
  marker.setAttribute("id", "arrowhead");
  marker.setAttribute("viewBox", "0 -5 10 10");
  marker.setAttribute("refX", "9");
  marker.setAttribute("refY", "0");
  marker.setAttribute("markerWidth", "6");
  marker.setAttribute("markerHeight", "6");
  marker.setAttribute("orient", "auto");
  const arrowPath = document.createElementNS(NS, "path");
  arrowPath.setAttribute("d", "M0,-5L10,0L0,5");
  arrowPath.setAttribute("fill", "#94a3b8");
  marker.appendChild(arrowPath);
  defs.appendChild(marker);
  svg.appendChild(defs);

  const linkG = document.createElementNS(NS, "g");
  linkG.setAttribute("class", "edges");
  svg.appendChild(linkG);

  const nodeG = document.createElementNS(NS, "g");
  nodeG.setAttribute("class", "nodes");
  svg.appendChild(nodeG);

  const tooltip = document.createElementNS(NS, "text");
  tooltip.setAttribute("font-size", "11");
  tooltip.setAttribute("fill", "#111827");
  tooltip.setAttribute("font-weight", "600");
  tooltip.setAttribute("opacity", "0");
  tooltip.setAttribute("pointer-events", "none");
  svg.appendChild(tooltip);

  function setSelectedId(id: string | null) {
    selectedId = id;
    nodeG.querySelectorAll("circle").forEach((circle) => {
      const nodeId = circle.getAttribute("data-id");
      if (nodeId === selectedId) {
        circle.setAttribute("stroke", "#60a5fa");
        circle.setAttribute("stroke-width", "3");
      } else {
        circle.setAttribute("stroke", "none");
        circle.setAttribute("stroke-width", "0");
      }
    });
  }

  for (const d of edges) {
    const src = nodeById.get(d.source);
    const tgt = nodeById.get(d.target);
    if (!src || !tgt) continue;

    const dx = tgt.cx - src.cx;
    const dy = tgt.cy - src.cy;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    const line = document.createElementNS(NS, "line");
    line.setAttribute("x1", String(src.cx));
    line.setAttribute("y1", String(src.cy));
    line.setAttribute("x2", String(tgt.cx - ux * (tgt.r || 8)));
    line.setAttribute("y2", String(tgt.cy - uy * (tgt.r || 8)));
    line.setAttribute("stroke", d.weight >= 0 ? "#60a5fa" : "#f87171");
    line.setAttribute("stroke-width", String(Math.max(0.5, Math.abs(d.weight) * 3)));
    line.setAttribute("opacity", "0.5");
    line.setAttribute("marker-end", "url(#arrowhead)");
    line.setAttribute("stroke-linecap", "round");
    line.style.cursor = "pointer";

    const dCopy = d;
    line.addEventListener("mouseover", (event: MouseEvent) => {
      line.setAttribute("stroke-width", String(Math.max(1.5, Math.abs(dCopy.weight) * 5)));
      line.setAttribute("opacity", "1");
      tooltip.textContent = `w = ${dCopy.weight.toFixed(3)}`;
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
      tooltip.setAttribute("x", String(svgPt.x + 10));
      tooltip.setAttribute("y", String(svgPt.y - 10));
      tooltip.setAttribute("opacity", "1");
    });
    line.addEventListener("mousemove", (event: MouseEvent) => {
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse());
      tooltip.setAttribute("x", String(svgPt.x + 10));
      tooltip.setAttribute("y", String(svgPt.y - 10));
    });
    line.addEventListener("mouseout", () => {
      line.setAttribute("stroke-width", String(Math.max(0.5, Math.abs(dCopy.weight) * 3)));
      line.setAttribute("opacity", "0.5");
      tooltip.setAttribute("opacity", "0");
    });
    line.addEventListener("click", () => {
      setSelectedId(dCopy.source === selectedId ? null : dCopy.source);
    });

    linkG.appendChild(line);
  }

  for (const d of nodes) {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "node");
    g.setAttribute("transform", `translate(${d.cx}, ${d.cy})`);
    g.style.cursor = "pointer";

    const circle = document.createElementNS(NS, "circle");
    circle.setAttribute("r", String(d.r));
    circle.setAttribute("fill", d.fill || "steelblue");
    circle.setAttribute("stroke", "none");
    circle.setAttribute("data-id", d.id);

    const label = document.createElementNS(NS, "text");
    label.setAttribute("y", String(-(d.r || 8) - 6));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "9");
    label.setAttribute("fill", "#111827");
    label.textContent = d.id;

    g.appendChild(circle);
    g.appendChild(label);
    g.addEventListener("click", () => {
      setSelectedId(d.id === selectedId ? null : d.id);
    });
    nodeG.appendChild(g);
  }
}

//synthetic weights shown before first real weights arrive so user can see arch before training
function makeSyntheticWeights(layers: number[]): number[][][] {
  const weights: number[][][] = [];
  for (let i = 0; i < layers.length - 1; i++) {
    const matrix: number[][] = [];
    for (let src = 0; src < layers[i]; src++) {
      const row: number[] = [];
      for (let dst = 0; dst < layers[i + 1]; dst++) {
        row.push(parseFloat((Math.random() * 2 - 1).toFixed(3)));
      }
      matrix.push(row);
    }
    weights.push(matrix);
  }
  return weights;
}

export default function NeuralNetworkGraph({
  numLayers,
  numNeurons,
  inputFeatures = 4,
  outputClasses = 3,
  trainingProgress = [],
  Layers,
  Weights,
}: NeuralNetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasRealData = Layers && Weights && Layers.length > 0 && Weights.length > 0;

  useEffect(() => {
    if (!svgRef.current) return;

    let layers: number[];
    let weights: number[][][];

    if (hasRealData) {
      layers = Layers!;
      weights = Weights!;
    } else {
      const hiddenLayers = Array.from({ length: Math.max(0, numLayers - 1) }, () =>
        Math.min(numNeurons, 8)
      );
      layers = [Math.min(inputFeatures, 6), ...hiddenLayers, Math.min(outputClasses, 6)];
      weights = makeSyntheticWeights(layers);
    }

    const nodes = formatNodes(layers, 900, 360);
    const edges = makeEdgesFromWeights(layers, weights);
    createViz(svgRef.current, { nodes, edges });
  }, [numLayers, numNeurons, inputFeatures, outputClasses, Layers, Weights]);

  const latest = trainingProgress[trainingProgress.length - 1];

  return (
    <div className="h-96 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Network Architecture
          {hasRealData}
        </span>

        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-blue-500" /> positive weight
          </span>

          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-red-500" /> negative weight
          </span>

          {latest?.accuracy != null && (
            <span className="text-green-600 font-semibold">
              acc: {(latest.accuracy * 100).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 900 360"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
}