"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useMemo } from "react";
import type { EpochUpdate } from "../api/trainingApi";

interface AccuracyChartProps {
  trainingProgress: EpochUpdate[];
  isTraining?: boolean;
}

export function AccuracyChart({
  trainingProgress,
  isTraining = false,
}: AccuracyChartProps) {
  const { chartData, metricLabel, metricType, hasValidationData } = useMemo(() => {
    if (trainingProgress.length === 0) {
      return { chartData: [], metricLabel: "Accuracy (%)", metricType: "accuracy", hasValidationData: false };
    }

    const firstUpdate = trainingProgress[0];
    const isClassification =
      firstUpdate.accuracy !== undefined && firstUpdate.accuracy !== null;

    const type = isClassification ? "accuracy" : "mae";
    const label = isClassification ? "Accuracy (%)" : "MAE";

    const data = trainingProgress.map((update) => {
      if (isClassification) {
        return {
          epoch: update.epoch ?? 0,
          trainingMetric:
            update.accuracy !== undefined && update.accuracy !== null
              ? Math.round(update.accuracy * 10000) / 100
              : undefined,
          validationMetric:
            update.val_accuracy !== undefined && update.val_accuracy !== null
              ? Math.round(update.val_accuracy * 10000) / 100
              : undefined,
        };
      } else {
        return {
          epoch: update.epoch ?? 0,
          trainingMetric:
            update.mae !== undefined && update.mae !== null
              ? Math.round(update.mae * 10000) / 10000
              : undefined,
          validationMetric:
            update.val_mae !== undefined && update.val_mae !== null
              ? Math.round(update.val_mae * 10000) / 10000
              : undefined,
        };
      }
    });

    const hasVal = data.some((d) => d.validationMetric !== undefined);

    return { chartData: data, metricLabel: label, metricType: type, hasValidationData: hasVal };
  }, [trainingProgress]);

  if (isTraining && trainingProgress.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">
          Waiting for first epoch
        </p>
      </div>
    );
  }

  if (!isTraining && trainingProgress.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">
          Start training to see live accuracy progress
        </p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-87.5 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Live Training Progress — {metricLabel} — {trainingProgress.length} epochs
      </h3>
      <div className="flex-1 min-h-62.5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="epoch"
              interval="preserveStartEnd"
            />
            <YAxis
              domain={metricType === "accuracy" ? [0, 100] : ["auto", "auto"]}
            />
            <Tooltip
              formatter={(value: any) => {
                if (typeof value !== "number") return value;
                return metricType === "accuracy"
                  ? `${value.toFixed(2)}%`
                  : value.toFixed(4);
              }}
              labelFormatter={(label) => `Epoch ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="trainingMetric"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
              name={`Training ${metricLabel}`}
              connectNulls
            />
            {hasValidationData && (
              <Line
                type="monotone"
                dataKey="validationMetric"
                stroke="#ef4444"
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
                name={`Validation ${metricLabel}`}
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}