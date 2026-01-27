import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Zap, TrendingUp, Layers, GitBranch, CheckCircle, XCircle, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function OptimizationInsights({ bot, deployment }) {
  const [analyzing, setAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const { data: optimizations = [] } = useQuery({
    queryKey: ["optimizations", bot.id],
    queryFn: () => base44.entities.BotOptimization.filter({ bot_id: bot.id }),
    enabled: !!bot.id
  });

  const analyzeMutation = useMutation({
    mutationFn: async (autoApply) => {
      const { data } = await base44.functions.invoke('bot-optimization-agent', {
        bot_id: bot.id,
        deployment_id: deployment?.id,
        auto_apply: autoApply
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["optimizations"] });
      toast.success(`Analysis complete. ${data.auto_applied || 0} critical optimizations auto-applied.`);
    }
  });

  const applyMutation = useMutation({
    mutationFn: async (optimization) => {
      // Apply the optimization
      const updatedConfig = {
        ...bot.config,
        ...optimization.config_changes
      };
      
      await base44.entities.Bot.update(bot.id, { config: updatedConfig });
      await base44.entities.BotOptimization.update(optimization.id, {
        status: 'applied',
        applied_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optimizations"] });
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Optimization applied");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (optimizationId) => {
      await base44.entities.BotOptimization.update(optimizationId, {
        status: 'rejected'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["optimizations"] });
      toast.success("Optimization rejected");
    }
  });

  const getOptimizationIcon = (type) => {
    switch (type) {
      case 'tensor_sharding': return Layers;
      case 'weight_pruning': return GitBranch;
      case 'compression_tuning': return Zap;
      case 'phase_optimization': return TrendingUp;
      case 'cluster_rebalancing': return Sparkles;
      default: return Zap;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const pendingOpts = optimizations.filter(o => o.status === 'pending');
  const appliedOpts = optimizations.filter(o => o.status === 'applied' || o.status === 'auto_applied');

  return (
    <div className="border-2 border-orange-400 bg-black">
      <div className="bg-orange-400 text-black px-4 py-1 flex justify-between items-center">
        <span className="font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI OPTIMIZATION AGENT
        </span>
        <Badge className="bg-black text-orange-400 text-xs">
          {pendingOpts.length} PENDING
        </Badge>
      </div>

      <div className="p-4 space-y-4">
        {/* Analysis Trigger */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => analyzeMutation.mutate(false)}
            disabled={analyzeMutation.isPending}
            className="bg-orange-400 text-black hover:bg-orange-300"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {analyzeMutation.isPending ? "ANALYZING..." : "ANALYZE_PERFORMANCE"}
          </Button>
          <Button
            onClick={() => analyzeMutation.mutate(true)}
            disabled={analyzeMutation.isPending}
            className="bg-red-400 text-black hover:bg-red-300"
          >
            <Zap className="w-4 h-4 mr-2" />
            AUTO_APPLY_CRITICAL
          </Button>
        </div>

        {/* Pending Optimizations */}
        {pendingOpts.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-orange-400 font-bold">PENDING SUGGESTIONS:</div>
            {pendingOpts.map((opt) => {
              const Icon = getOptimizationIcon(opt.optimization_type);
              return (
                <div key={opt.id} className="bg-slate-900 p-3 rounded border border-orange-400">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 text-orange-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-white font-bold">
                          {opt.optimization_type.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        <Badge className={`${getPriorityColor(opt.priority)} text-xs mt-1`}>
                          {opt.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-300 mb-2">
                    {opt.suggestion}
                  </div>

                  {opt.expected_improvement && (
                    <div className="bg-black p-2 rounded text-xs space-y-1 mb-2">
                      {opt.expected_improvement.execution_time_reduction && (
                        <div className="text-green-400">
                          ⚡ Execution: {opt.expected_improvement.execution_time_reduction}
                        </div>
                      )}
                      {opt.expected_improvement.memory_reduction && (
                        <div className="text-green-400">
                          💾 Memory: {opt.expected_improvement.memory_reduction}
                        </div>
                      )}
                      {opt.expected_improvement.throughput_increase && (
                        <div className="text-green-400">
                          📈 Throughput: {opt.expected_improvement.throughput_increase}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => applyMutation.mutate(opt)}
                      disabled={applyMutation.isPending}
                      className="flex-1 border border-green-400 text-green-400 px-2 py-1 hover:bg-green-900/30 transition text-xs"
                    >
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      APPLY
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(opt.id)}
                      disabled={rejectMutation.isPending}
                      className="border border-red-400 text-red-400 px-2 py-1 hover:bg-red-900/30 transition text-xs"
                    >
                      <XCircle className="w-3 h-3 inline mr-1" />
                      REJECT
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Applied Optimizations */}
        {appliedOpts.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-green-400 font-bold">APPLIED OPTIMIZATIONS:</div>
            {appliedOpts.slice(0, 3).map((opt) => {
              const Icon = getOptimizationIcon(opt.optimization_type);
              return (
                <div key={opt.id} className="bg-slate-900 p-2 rounded border border-green-600 text-xs">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3 h-3 text-green-400" />
                    <div className="flex-1">
                      <span className="text-green-400">
                        {opt.optimization_type.replace(/_/g, ' ')}
                      </span>
                      {opt.status === 'auto_applied' && (
                        <Badge className="bg-purple-600 text-xs ml-2">AUTO</Badge>
                      )}
                    </div>
                    <span className="text-gray-500">
                      {opt.applied_at ? new Date(opt.applied_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {optimizations.length === 0 && (
          <div className="text-center text-gray-500 py-4 text-sm">
            No optimization analysis yet. Click "Analyze Performance" to start.
          </div>
        )}

        {/* Info Footer */}
        <div className="text-xs text-gray-600 border-t border-gray-800 pt-2 space-y-1">
          <div>✓ AI analyzes tensor schemas, XJSON phases, and cluster metrics</div>
          <div>✓ Suggests sharding, pruning, and compression optimizations</div>
          <div>✓ Critical optimizations can be auto-applied</div>
        </div>
      </div>
    </div>
  );
}