"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { createDense, updateDenseWeights } from "@/graphing/data_visualizer/frontend/public/main.js";

interface NeuralNetworkGraphProps {
  numLayers: number;
  numNeurons: number;
  inputFeatures?: number;
  outputClasses?: number;
  trainingProgress?: { accuracy?: number; val_accuracy?: number }[];
  Layers?: number[];
  Weights?: number[][][];
  weightEpoch?: number;
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
  weightEpoch = 0,
}: NeuralNetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const denseRef = useRef<any>(null);
  const layersRef = useRef(Layers);
  const weightsRef = useRef(Weights);

  const latest = trainingProgress[trainingProgress.length - 1];
  const layersKey = Layers ? Layers.join(",") : `${numLayers}x${numNeurons}`;

  useEffect(() => {
    layersRef.current = Layers;
    weightsRef.current = Weights;
  });

  useEffect(() => {
    const container = svgRef.current?.parentElement;
    if (!container) return;

    const render = () => {
      const svg = svgRef.current;
      if (!svg) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width < 10 || height < 10) return;

      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

      d3.select(svg).selectAll("*").remove();
      denseRef.current = null;

      const layers = layersRef.current ?? [ inputFeatures, ...Array.from({ length: Math.max(0, numLayers - 1) }, () => Math.min(numNeurons, 8)), outputClasses,];

      const weights = weightsRef.current ?? makeSyntheticWeights(layers);

      const model = {
        model_name: "dense",
        layers,
        weights,
      };

      denseRef.current = createDense(
        model,
        container,
        { primary: "#0092a5", secondary: "#fb3600" },
        d3
      );
    };

    const init = requestAnimationFrame(render);
    const observer = new ResizeObserver(render);
    observer.observe(container);

    return () => {
      cancelAnimationFrame(init);
      observer.disconnect();
      denseRef.current = null;
    };
  }, [layersKey, inputFeatures, outputClasses, numLayers, numNeurons]);

  useEffect(() => {
    if (weightEpoch === 0) return;

    const weights = weightsRef.current;
    if (!weights || !denseRef.current) return;

    updateDenseWeights(denseRef.current, weights);
  }, [weightEpoch]);

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
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
}