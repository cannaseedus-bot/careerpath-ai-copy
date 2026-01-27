import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitCompare, TrendingUp, Award } from "lucide-react";

export default function ModelComparison({ modelIds }) {
  const { data: comparison, isLoading } = useQuery({
    queryKey: ['model-comparison', modelIds],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('compression-inference-engine', {
        operation: 'compare_models',
        parameters: { model_ids: modelIds }
      });
      return data.comparison;
    },
    enabled: modelIds.length >= 2
  });

  if (isLoading) {
    return <div className="text-gray-400">Loading comparison...</div>;
  }

  if (!comparison) return null;

  const bestEfficiencyModel = comparison.models.reduce((best, model) => 
    model.final_efficiency > (best?.final_efficiency || 0) ? model : best
  , null);

  const bestConvergenceModel = comparison.models.reduce((best, model) => 
    model.convergence_score > (best?.convergence_score || 0) ? model : best
  , null);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-black p-4 border-2 border-green-400">
          <div className="text-sm text-gray-400 mb-2">Best Efficiency</div>
          <div className="text-green-400 font-bold text-2xl">
            {comparison.best_efficiency.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {bestEfficiencyModel?.name}
          </div>
        </Card>

        <Card className="bg-black p-4 border-2 border-cyan-400">
          <div className="text-sm text-gray-400 mb-2">Best Convergence</div>
          <div className="text-cyan-400 font-bold text-2xl">
            {comparison.best_convergence.toFixed(3)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {bestConvergenceModel?.name}
          </div>
        </Card>

        <Card className="bg-black p-4 border-2 border-purple-400">
          <div className="text-sm text-gray-400 mb-2">Avg Efficiency</div>
          <div className="text-purple-400 font-bold text-2xl">
            {comparison.avg_efficiency.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Across {comparison.models.length} models
          </div>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card className="bg-black border-2 border-cyan-400 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <GitCompare className="w-5 h-5 text-cyan-400" />
            <h4 className="text-lg font-bold text-cyan-400">MODEL COMPARISON</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-400">
                  <th className="text-left py-2 text-gray-400">Model</th>
                  <th className="text-center py-2 text-gray-400">Efficiency</th>
                  <th className="text-center py-2 text-gray-400">Convergence</th>
                  <th className="text-center py-2 text-gray-400">Epochs</th>
                  <th className="text-center py-2 text-gray-400">Batch Size</th>
                  <th className="text-center py-2 text-gray-400">Dataset</th>
                </tr>
              </thead>
              <tbody>
                {comparison.models.map((model) => (
                  <tr key={model.id} className="border-b border-gray-800">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {model.id === bestEfficiencyModel?.id && (
                          <Award className="w-4 h-4 text-yellow-400" />
                        )}
                        <div>
                          <div className="text-cyan-400 font-bold">{model.name}</div>
                          <div className="text-xs text-gray-500">{model.version}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={`font-bold ${
                        model.id === bestEfficiencyModel?.id 
                          ? 'text-green-400' 
                          : 'text-gray-400'
                      }`}>
                        {model.final_efficiency?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`font-bold ${
                        model.id === bestConvergenceModel?.id 
                          ? 'text-cyan-400' 
                          : 'text-gray-400'
                      }`}>
                        {model.convergence_score?.toFixed(3)}
                      </span>
                    </td>
                    <td className="text-center text-gray-400">{model.epochs}</td>
                    <td className="text-center text-gray-400">{model.batch_size}</td>
                    <td className="text-center text-gray-400">{model.dataset_size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Performance Chart */}
      <Card className="bg-black border-2 border-purple-400">
        <div className="p-4">
          <div className="text-sm font-bold text-purple-400 mb-4">Efficiency Comparison</div>
          <div className="space-y-3">
            {comparison.models.map((model) => (
              <div key={model.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{model.name}</span>
                  <span className="text-purple-400">{model.final_efficiency?.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      model.id === bestEfficiencyModel?.id
                        ? 'bg-green-400'
                        : 'bg-purple-600'
                    }`}
                    style={{ 
                      width: `${(model.final_efficiency / comparison.best_efficiency) * 100}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}