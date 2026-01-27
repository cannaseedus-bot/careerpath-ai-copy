import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Activity, Cpu, Database, Code } from "lucide-react";
import { toast } from "sonner";
import NGramDataVisualizer from "./NGramDataVisualizer";
import AdaptiveControlPanel from "./AdaptiveControlPanel";
import QuantumEntanglementVisualizer from "./QuantumEntanglementVisualizer";

export default function MicronautDashboard() {
  const [command, setCommand] = useState('');
  const queryClient = useQueryClient();

  const { data: micronauts = [], isLoading } = useQuery({
    queryKey: ['micronauts'],
    queryFn: () => base44.entities.Micronaut.list(),
    refetchInterval: 5000
  });

  const orchestrateMutation = useMutation({
    mutationFn: async (cmd) => {
      const { data } = await base44.functions.invoke('llm-agent-orchestrator', {
        command: cmd,
        context: { existing_micronauts: micronauts.length }
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['micronauts'] });
      toast.success(`Spawned ${data.spawned?.micronauts?.length || 0} micronauts`);
      setCommand('');
    }
  });

  const getMicronautIcon = (type) => {
    switch (type) {
      case 'vector-ctrl': return Zap;
      case 'db-master': return Database;
      case 'code-exec': return Code;
      default: return Cpu;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'border-green-400 text-green-400';
      case 'processing': return 'border-yellow-400 text-yellow-400';
      case 'error': return 'border-red-400 text-red-400';
      default: return 'border-gray-400 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* N-Gram Data Visualizer */}
      <NGramDataVisualizer />

      {/* Adaptive Control Panel */}
      <AdaptiveControlPanel />

      {/* Quantum Entanglement Visualizer */}
      <QuantumEntanglementVisualizer />

      {/* LLM Command Interface */}
      <div className="border-2 border-purple-400 bg-black">
        <div className="bg-purple-400 text-black px-4 py-1 font-bold">
          <Sparkles className="w-4 h-4 inline mr-2" />
          LLM ORCHESTRATOR
        </div>
        <div className="p-4 space-y-3">
          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command for LLM to orchestrate agents and micronauts..."
            className="w-full bg-slate-900 text-green-400 p-3 border border-purple-400 font-mono text-sm h-24"
          />
          <Button
            onClick={() => orchestrateMutation.mutate(command)}
            disabled={!command || orchestrateMutation.isPending}
            className="w-full bg-purple-400 text-black hover:bg-purple-300"
          >
            {orchestrateMutation.isPending ? 'ORCHESTRATING...' : 'ORCHESTRATE'}
          </Button>
          <div className="text-xs text-gray-500">
            Example: "Optimize all bot deployments with compression and create monitoring micronauts"
          </div>
        </div>
      </div>

      {/* Active Micronauts */}
      <div className="border-2 border-cyan-400 bg-black">
        <div className="bg-cyan-400 text-black px-4 py-1 flex justify-between items-center">
          <span className="font-bold">ACTIVE MICRONAUTS</span>
          <Badge className="bg-black text-cyan-400">{micronauts.length}</Badge>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="text-center text-gray-500 py-4">Loading micronauts...</div>
          ) : micronauts.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No micronauts spawned. Use LLM orchestrator to spawn.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {micronauts.map((m) => {
                const Icon = getMicronautIcon(m.type);
                return (
                  <div
                    key={m.id}
                    className={`bg-slate-900 p-3 rounded border-2 ${getStatusColor(m.status)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="font-bold text-sm">{m.name}</span>
                      </div>
                      <Badge className={`text-xs ${getStatusColor(m.status)}`}>
                        {m.status}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-gray-400">
                        Type: <span className="text-cyan-400">{m.type}</span>
                      </div>
                      {m.assigned_folds && m.assigned_folds.length > 0 && (
                        <div className="text-gray-400">
                          Folds: {m.assigned_folds.map(f => (
                            <Badge key={f} className="bg-purple-600 text-xs ml-1">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {m.metrics && (
                        <div className="text-gray-400">
                          Operations: <span className="text-green-400">{m.metrics.operations || 0}</span>
                        </div>
                      )}
                      {(m.contacts?.length > 0 || m.policies?.length > 0 || m.tools?.length > 0) && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <div className="text-yellow-400">N-gram Operational Data:</div>
                          {m.contacts?.length > 0 && (
                            <div className="text-gray-500">• {m.contacts.length} contacts</div>
                          )}
                          {m.policies?.length > 0 && (
                            <div className="text-gray-500">• {m.policies.length} policies</div>
                          )}
                          {m.tools?.length > 0 && (
                            <div className="text-gray-500">• {m.tools.length} tools</div>
                          )}
                          {m.build_steps?.length > 0 && (
                            <div className="text-gray-500">• {m.build_steps.length} build steps</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}