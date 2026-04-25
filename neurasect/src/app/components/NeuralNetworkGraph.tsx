"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { formatNodes } from "@/graphing/D3NeuralNetTesting/dataFormat/nodeGen";
import { makeEdgesFromWeights } from "@/graphing/D3NeuralNetTesting/dataFormat/edgeGen";
import { createViz, type NeuronNode, type NeuronEdge } from "@/graphing/D3NeuralNetTesting/vizualize/viz";

interface NeuralNetworkGraphProps {
  numLayers: number;
  numNeurons: number;
  inputFeatures?: number;
  outputClasses?: number;
  trainingProgress?: { accuracy?: number; val_accuracy?: number }[];
  Layers?: number[];
  Weights?: number[][][];
}

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

  const hasRealData =
    Layers != null &&
    Weights != null &&
    Layers.length > 1 &&
    Weights.length === Layers.length - 1;

  useEffect(() => {
    if (!svgRef.current) return;

    let layers: number[];
    let weights: number[][][];

    if (hasRealData) {
      layers = Layers!;
      weights = Weights!;
    } else {
      const hiddenLayers = Array.from(
        { length: Math.max(0, numLayers - 1) },
        () => Math.min(numNeurons, 8)
      );
      layers = [
        Math.min(inputFeatures, 6),
        ...hiddenLayers,
        Math.min(outputClasses, 6),
      ];
      weights = makeSyntheticWeights(layers);
    }

    const nodes: NeuronNode[] = formatNodes(layers);
    const edges: NeuronEdge[] = makeEdgesFromWeights(layers, weights);

    createViz(d3.select(svgRef.current), { nodes, edges }, d3);
  }, [numLayers, numNeurons, inputFeatures, outputClasses, Layers, Weights, hasRealData]);

  const latest = trainingProgress[trainingProgress.length - 1];

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden"
      style={{ height: 384 }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 shrink-0">
        <span className="text-xs font-semibold text-gray-700 tracking-wider">
          Network Architecture
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

      <div style={{ flex: 1, minHeight: 0 }} className="overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 960 500"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
}