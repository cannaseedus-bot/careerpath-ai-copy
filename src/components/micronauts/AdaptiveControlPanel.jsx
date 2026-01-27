import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, Zap } from "lucide-react";

export default function AdaptiveControlPanel() {
  const { data: micronauts = [] } = useQuery({
    queryKey: ['micronauts'],
    queryFn: () => base44.entities.Micronaut.list(),
    refetchInterval: 3000
  });

  const getVectorColor = (value) => {
    if (value > 0.8) return 'text-green-400';
    if (value > 0.5) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="border-2 border-yellow-400 bg-black">
      <div className="bg-yellow-400 text-black px-4 py-1 font-bold flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        ADAPTIVE CONTROL VECTORS
      </div>
      <div className="p-4">
        {micronauts.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-2">
            No micronauts active
          </div>
        ) : (
          <div className="space-y-3">
            {micronauts.map((m) => (
              <div key={m.id} className="bg-slate-900 p-3 rounded border border-yellow-400">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-yellow-400 text-sm">{m.name}</div>
                  {m.metrics?.last_optimization && (
                    <Badge className="bg-green-600 text-xs">
                      <Zap className="w-3 h-3 inline mr-1" />
                      OPTIMIZED
                    </Badge>
                  )}
                </div>
                
                {m.control_vectors && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(m.control_vectors).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400">{key}:</span>
                        <span className={getVectorColor(value)}>
                          {typeof value === 'number' ? value.toFixed(2) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {m.metrics && (
                  <div className="mt-2 pt-2 border-t border-gray-700 text-xs space-y-1">
                    <div className="flex justify-between text-gray-400">
                      <span>Operations:</span>
                      <span className="text-cyan-400">{m.metrics.operations || 0}</span>
                    </div>
                    {m.metrics.avg_execution_time && (
                      <div className="flex justify-between text-gray-400">
                        <span>Avg Time:</span>
                        <span className="text-green-400">
                          {m.metrics.avg_execution_time.toFixed(0)}ms
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}