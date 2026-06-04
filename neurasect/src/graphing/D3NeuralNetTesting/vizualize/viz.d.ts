import type * as d3 from "d3";

export interface NeuronNode {
  id: string;
  layer: number;
  index: number;
  cx: number;
  cy: number;
  r: number;
  fill: string;
  activation: number;
}

export interface NeuronEdge {
  source: string;
  target: string;
  weight: number;
}

export function createViz(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  data: { nodes?: NeuronNode[]; edges?: NeuronEdge[] },
  d3: typeof import("d3")
): void;