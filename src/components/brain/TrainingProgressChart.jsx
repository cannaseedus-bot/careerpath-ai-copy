import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function TrainingProgressChart({ trainingData }) {
  if (!trainingData?.training_metrics) return null;

  const { training_metrics, final_efficiency, convergence } = trainingData;
  const maxLoss = Math.max(...training_metrics.loss);
  const maxEfficiency = Math.max(...training_metrics.efficiency);

  return (
    <Card className="bg-slate-900 border-2 border-cyan-400">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-cyan-400">TRAINING PROGRESS</h3>
          <Badge className="bg-green-600">COMPLETED</Badge>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-black p-3 rounded border border-green-400 text-center">
            <div className="text-xs text-gray-400">Final Efficiency</div>
            <div className="text-green-400 font-bold text-2xl">
              {final_efficiency.toFixed(1)}%
            </div>
          </div>
          <div className="bg-black p-3 rounded border border-cyan-400 text-center">
            <div className="text-xs text-gray-400">Convergence</div>
            <div className="text-cyan-400 font-bold text-2xl">
              {convergence.toFixed(3)}
            </div>
          </div>
          <div className="bg-black p-3 rounded border border-purple-400 text-center">
            <div className="text-xs text-gray-400">Epochs</div>
            <div className="text-purple-400 font-bold text-2xl">
              {training_metrics.epochs.length}
            </div>
          </div>
        </div>

        {/* Loss Chart */}
        <div className="bg-black p-4 rounded border border-red-400 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <div className="text-sm font-bold text-red-400">Loss Curve</div>
          </div>
          <div className="relative h-32">
            <div className="absolute inset-0 flex items-end gap-1">
              {training_metrics.loss.map((loss, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div
                    className="bg-red-600 border border-red-400 transition-all"
                    style={{
                      height: `${(loss / maxLoss) * 100}%`,
                      opacity: 0.7 + (i / training_metrics.loss.length) * 0.3
                    }}
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400 text-center">
            Initial: {training_metrics.loss[0].toFixed(3)} → 
            Final: {training_metrics.loss[training_metrics.loss.length - 1].toFixed(3)}
          </div>
        </div>

        {/* Efficiency Chart */}
        <div className="bg-black p-4 rounded border border-green-400 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <div className="text-sm font-bold text-green-400">Efficiency Curve</div>
          </div>
          <div className="relative h-32">
            <div className="absolute inset-0 flex items-end gap-1">
              {training_metrics.efficiency.map((eff, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div
                    className="bg-green-600 border border-green-400 transition-all"
                    style={{
                      height: `${(eff / maxEfficiency) * 100}%`,
                      opacity: 0.7 + (i / training_metrics.efficiency.length) * 0.3
                    }}
                  />
                  <div className="text-xs text-gray-500 text-center mt-1">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400 text-center">
            Initial: {training_metrics.efficiency[0].toFixed(1)}% → 
            Final: {training_metrics.efficiency[training_metrics.efficiency.length - 1].toFixed(1)}%
          </div>
        </div>

        {/* Epoch Details */}
        <div className="bg-black p-4 rounded border border-cyan-400">
          <div className="text-sm font-bold text-cyan-400 mb-2">Epoch-by-Epoch Metrics</div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {training_metrics.epochs.map((epoch, i) => (
              <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-800">
                <span className="text-gray-400">Epoch {epoch}</span>
                <div className="flex gap-4">
                  <span className="text-red-400">
                    Loss: {training_metrics.loss[i].toFixed(3)}
                  </span>
                  <span className="text-green-400">
                    Eff: {training_metrics.efficiency[i].toFixed(1)}%
                  </span>
                  {training_metrics.compression_ratios && (
                    <span className="text-cyan-400">
                      Ratio: {training_metrics.compression_ratios[i].toFixed(3)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}