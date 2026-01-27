import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Layers, Activity } from "lucide-react";
import { toast } from "sonner";

export default function CompressionMetrics({ bot }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState(null);

  const analyzeCompression = async () => {
    setAnalyzing(true);
    try {
      const data = {
        script: bot.script,
        config: bot.config,
        metrics: bot.metrics
      };

      const { data: compressed } = await base44.functions.invoke('compression-engine', {
        operation: 'compress',
        input: data,
        parameters: {
          method: 'pattern-based',
          intensity: 0.8,
          entropy_target: 0.15,
          create_folds: true
        }
      });

      setMetrics(compressed);
      toast.success("Compression analysis complete");
    } catch (error) {
      toast.error("Analysis failed: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const optimizeCompression = async () => {
    setAnalyzing(true);
    try {
      const { data: optimized } = await base44.functions.invoke('compression-engine', {
        operation: 'optimize',
        input: metrics,
        parameters: {}
      });

      toast.success(`Found ${optimized.optimizations?.length || 0} optimization opportunities`);
    } catch (error) {
      toast.error("Optimization failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="border-2 border-green-400 bg-black">
      <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
        <span className="font-bold flex items-center gap-2">
          <Activity className="w-4 h-4" />
          COMPRESSION METRICS
        </span>
        <Badge className="bg-black text-green-400 text-xs">
          CALCULUS v1.0
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={analyzeCompression}
            disabled={analyzing}
            className="bg-green-400 text-black hover:bg-green-300"
          >
            <Zap className="w-4 h-4 mr-2" />
            {analyzing ? "ANALYZING..." : "ANALYZE"}
          </Button>
          <Button
            onClick={optimizeCompression}
            disabled={!metrics || analyzing}
            className="bg-cyan-400 text-black hover:bg-cyan-300"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            OPTIMIZE
          </Button>
        </div>

        {metrics && (
          <div className="space-y-3">
            <div className="bg-slate-900 p-3 rounded border border-green-400">
              <div className="text-xs text-gray-500 mb-2">COMPRESSION EFFICIENCY:</div>
              <div className="text-2xl text-green-400 font-bold">
                {metrics.metrics.efficiency.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Ratio: {metrics.metrics.compression_ratio.toFixed(4)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900 p-2 rounded text-center">
                <div className="text-xs text-gray-500">Original</div>
                <div className="text-cyan-400 font-bold">{metrics.metrics.original_size}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded text-center">
                <div className="text-xs text-gray-500">Compressed</div>
                <div className="text-green-400 font-bold">{metrics.metrics.compressed_size}</div>
              </div>
              <div className="bg-slate-900 p-2 rounded text-center">
                <div className="text-xs text-gray-500">Entropy</div>
                <div className="text-yellow-400 font-bold">{metrics.metrics.entropy.toFixed(2)}</div>
              </div>
            </div>

            {metrics.compressed.folds && (
              <div className="bg-slate-900 p-3 rounded border border-purple-400">
                <div className="text-xs text-purple-400 mb-2 flex items-center gap-2">
                  <Layers className="w-3 h-3" />
                  COMPRESSION FOLDS:
                </div>
                <div className="space-y-1">
                  {Object.entries(metrics.compressed.folds).map(([fold, patterns]) => (
                    <div key={fold} className="flex justify-between text-xs">
                      <span className="text-gray-400">{fold}:</span>
                      <span className="text-cyan-400">{patterns.length} patterns</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-600">
              <div>✓ {metrics.metrics.patterns_found} patterns found</div>
              <div>✓ Method: {metrics.method}</div>
              <div>✓ Target entropy: 0.15</div>
            </div>
          </div>
        )}

        {!metrics && (
          <div className="text-center text-gray-500 py-4 text-sm">
            Click "Analyze" to run compression calculus analysis
          </div>
        )}
      </div>
    </div>
  );
}