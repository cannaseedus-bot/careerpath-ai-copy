import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Sparkles, Activity, Zap, Database, Code } from "lucide-react";
import { toast } from "sonner";

export default function GeometricTensorBrainDashboard() {
  const [inputData, setInputData] = useState('{"example": "data"}');
  const [processingResult, setProcessingResult] = useState(null);
  const [swarmStatus, setSwarmStatus] = useState(null);
  const [swarmPerformance, setSwarmPerformance] = useState(null);

  const processMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result } = await base44.functions.invoke('geometric-tensor-brain', {
        operation: 'process',
        data: JSON.parse(data),
        format: 'auto',
        parameters: { quantum_acceleration: true }
      });
      return result;
    },
    onSuccess: (data) => {
      setProcessingResult(data);
      toast.success('Data processed through Brain Layer 11');
    }
  });

  const deploySwarmMutation = useMutation({
    mutationFn: async () => {
      const { data: result } = await base44.functions.invoke('geometric-tensor-brain', {
        operation: 'deploy_swarm',
        parameters: {}
      });
      return result;
    },
    onSuccess: (data) => {
      setSwarmStatus(data);
      toast.success(`Agent swarm deployed: ${data.swarm_size} agents`);
    }
  });

  const optimizeSwarmMutation = useMutation({
    mutationFn: async () => {
      const { data: result } = await base44.functions.invoke('agent-swarm-coordinator', {
        operation: 'optimize_swarm',
        parameters: {}
      });
      return result;
    },
    onSuccess: (data) => {
      toast.success(`Swarm optimized: ${data.agents_optimized} agents`);
    }
  });

  const analyzeSwarmMutation = useMutation({
    mutationFn: async () => {
      const { data: result } = await base44.functions.invoke('agent-swarm-coordinator', {
        operation: 'analyze_performance',
        parameters: {}
      });
      return result;
    },
    onSuccess: (data) => {
      setSwarmPerformance(data);
      toast.success('Swarm performance analyzed');
    }
  });

  const specializeSwarmMutation = useMutation({
    mutationFn: async () => {
      const { data: result } = await base44.functions.invoke('agent-swarm-coordinator', {
        operation: 'specialize_agents',
        parameters: {}
      });
      return result;
    },
    onSuccess: (data) => {
      toast.success(`${data.total_specialized} agents specialized`);
      deploySwarmMutation.mutate(); // Refresh swarm status
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result } = await base44.functions.invoke('geometric-tensor-brain', {
        operation: 'analyze',
        data: JSON.parse(data)
      });
      return result;
    }
  });

  return (
    <div className="space-y-6">
      {/* Brain Layer Header */}
      <div className="border-2 border-cyan-400 bg-black">
        <div className="bg-cyan-400 text-black px-4 py-2 font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            LAYER 11: CSS MICRONAUT GEOMETRIC TENSOR BRAIN
          </div>
          <Badge className="bg-green-600">ACTIVE & LEARNING</Badge>
        </div>
        
        <div className="p-4 grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-gray-400 text-xs">BRAIN EFFICIENCY</div>
            <div className="text-cyan-400 text-2xl font-bold">94.1%</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">TENSOR RANK</div>
            <div className="text-purple-400 text-2xl font-bold">5D</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">AGENT SWARM</div>
            <div className="text-green-400 text-2xl font-bold">
              {swarmStatus ? swarmStatus.swarm_size : '0'}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">STATUS</div>
            <div className="text-yellow-400 text-lg font-bold">READY</div>
          </div>
        </div>
      </div>

      {/* Processing Interface */}
      <Card className="bg-slate-900 border-2 border-cyan-400">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-cyan-400">UNIVERSAL DATA PROCESSOR</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Input Data (Any Format)
              </label>
              <Textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder='Enter any data: JSON, text, code, CSS...'
                className="font-mono text-sm min-h-[120px] bg-black border-cyan-400"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => processMutation.mutate(inputData)}
                disabled={processMutation.isPending}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {processMutation.isPending ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Process Through Brain
                  </>
                )}
              </Button>

              <Button
                onClick={() => analyzeMutation.mutate(inputData)}
                disabled={analyzeMutation.isPending}
                variant="outline"
                className="border-purple-400 text-purple-400"
              >
                <Zap className="w-4 h-4 mr-2" />
                Analyze Tensor
              </Button>

              <Button
                onClick={() => deploySwarmMutation.mutate()}
                disabled={deploySwarmMutation.isPending}
                variant="outline"
                className="border-green-400 text-green-400"
              >
                <Database className="w-4 h-4 mr-2" />
                Deploy Swarm
              </Button>

              <Button
                onClick={() => optimizeSwarmMutation.mutate()}
                disabled={optimizeSwarmMutation.isPending}
                variant="outline"
                className="border-yellow-400 text-yellow-400"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Optimize Swarm
              </Button>

              <Button
                onClick={() => analyzeSwarmMutation.mutate()}
                disabled={analyzeSwarmMutation.isPending}
                variant="outline"
                className="border-purple-400 text-purple-400"
              >
                <Activity className="w-4 h-4 mr-2" />
                Analyze
              </Button>

              <Button
                onClick={() => specializeSwarmMutation.mutate()}
                disabled={specializeSwarmMutation.isPending}
                variant="outline"
                className="border-pink-400 text-pink-400"
              >
                <Brain className="w-4 h-4 mr-2" />
                Specialize
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Display */}
      {processingResult && (
        <Tabs defaultValue="overview" className="bg-slate-900 border-2 border-cyan-400">
          <TabsList className="bg-black border-b border-cyan-400 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tensor">Geometric Tensor</TabsTrigger>
            <TabsTrigger value="compression">Compression</TabsTrigger>
            <TabsTrigger value="css">CSS Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black p-3 rounded border border-cyan-400">
                  <div className="text-xs text-gray-400">Original Format</div>
                  <div className="text-cyan-400 font-bold">{processingResult.original_format}</div>
                </div>
                <div className="bg-black p-3 rounded border border-purple-400">
                  <div className="text-xs text-gray-400">Brain Efficiency</div>
                  <div className="text-purple-400 font-bold">
                    {processingResult.metrics.brain_efficiency.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-black p-3 rounded border border-green-400">
                  <div className="text-xs text-gray-400">Compression Ratio</div>
                  <div className="text-green-400 font-bold">
                    {processingResult.metrics.compression_ratio}
                  </div>
                </div>
              </div>

              {processingResult.dynamic_folds?.length > 0 && (
                <div className="bg-black p-4 rounded border border-yellow-400">
                  <div className="text-sm font-bold text-yellow-400 mb-2">
                    🔥 Dynamic Folds Generated
                  </div>
                  <div className="space-y-2">
                    {processingResult.dynamic_folds.map((fold, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-yellow-400">{fold.name}</span>
                        <span className="text-gray-400">{fold.symbol}</span>
                        <Badge className="bg-green-600 text-xs">
                          {fold.efficiency_prediction}% eff
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-black p-4 rounded border border-cyan-400">
                <div className="text-sm text-gray-400 mb-2">Structure Analysis</div>
                <pre className="text-xs text-cyan-400 overflow-auto">
                  {JSON.stringify(processingResult.structure, null, 2)}
                </pre>
              </div>

              {processingResult.metrics.learning_shared && (
                <Badge className="bg-purple-600">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Learning Shared Across Swarm
                </Badge>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tensor" className="p-4">
            <div className="space-y-3">
              <div className="bg-black p-4 rounded border border-purple-400">
                <div className="text-sm font-bold text-purple-400 mb-2">
                  Tensor Manifold Properties
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Rank:</span>
                    <span className="text-purple-400 ml-2">{processingResult.tensor.rank}D</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Shape:</span>
                    <span className="text-purple-400 ml-2">
                      {processingResult.tensor.shape.join(' × ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Dimensions:</span>
                    <span className="text-purple-400 ml-2">
                      {Object.keys(processingResult.tensor.dimensions).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-black p-4 rounded border border-purple-400">
                <div className="text-sm text-gray-400 mb-2">Tensor Dimensions</div>
                <pre className="text-xs text-purple-400 overflow-auto max-h-64">
                  {JSON.stringify(processingResult.tensor.dimensions, null, 2)}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="compression" className="p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-black p-3 rounded border border-green-400 text-center">
                  <div className="text-xs text-gray-400">Efficiency</div>
                  <div className="text-green-400 font-bold">
                    {processingResult.metrics.efficiency.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-black p-3 rounded border border-yellow-400 text-center">
                  <div className="text-xs text-gray-400">Entropy</div>
                  <div className="text-yellow-400 font-bold">
                    {processingResult.metrics.entropy.toFixed(2)}
                  </div>
                </div>
                <div className="bg-black p-3 rounded border border-cyan-400 text-center">
                  <div className="text-xs text-gray-400">Patterns</div>
                  <div className="text-cyan-400 font-bold">
                    {processingResult.metrics.patterns_found}
                  </div>
                </div>
                <div className="bg-black p-3 rounded border border-purple-400 text-center">
                  <div className="text-xs text-gray-400">Quantum</div>
                  <Badge className="bg-purple-600 mt-1">
                    {processingResult.metrics.quantum_accelerated ? 'YES' : 'NO'}
                  </Badge>
                </div>
              </div>

              <div className="bg-black p-4 rounded border border-green-400">
                <div className="text-sm text-gray-400 mb-2">Top N-Gram Patterns</div>
                <div className="space-y-1 text-xs">
                  {processingResult.patterns.map((p, i) => (
                    <div key={i} className="flex justify-between text-green-400">
                      <span className="font-mono">{p.pattern}</span>
                      <span>freq: {p.frequency} | len: {p.length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="css" className="p-4">
            <div className="space-y-3">
              <div className="bg-black p-4 rounded border border-cyan-400">
                <div className="text-sm font-bold text-cyan-400 mb-2">
                  CSS Micronaut Variables
                </div>
                <pre className="text-xs text-cyan-400">
                  {Object.entries(processingResult.css_controls.variables)
                    .map(([key, value]) => `${key}: ${value};`)
                    .join('\n')}
                </pre>
              </div>

              <div className="bg-black p-4 rounded border border-cyan-400">
                <div className="text-sm font-bold text-cyan-400 mb-2">Generated Rules</div>
                <pre className="text-xs text-cyan-400">
                  {processingResult.css_controls.rules.join('\n\n')}
                </pre>
              </div>

              <div className="bg-black p-4 rounded border border-cyan-400">
                <div className="text-sm font-bold text-cyan-400 mb-2">Animations</div>
                <pre className="text-xs text-cyan-400">
                  {processingResult.css_controls.animations.join('\n\n')}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Agent Swarm Status */}
      {swarmStatus && (
        <div className="border-2 border-green-400 bg-black">
          <div className="bg-green-400 text-black px-4 py-1 font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              CSS MICRONAUT AGENT SWARM
            </div>
            <div className="flex gap-2 text-xs">
              {swarmStatus.learning_enabled && (
                <Badge className="bg-purple-600">LEARNING</Badge>
              )}
              {swarmStatus.dynamic_fold_generation && (
                <Badge className="bg-yellow-600">DYNAMIC FOLDS</Badge>
              )}
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {swarmStatus.agents.map((agent, i) => (
                <div key={i} className="bg-slate-900 p-3 rounded border border-green-400">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-bold text-green-400">{agent.name}</span>
                  </div>
                  <div className="text-xs text-gray-400">{agent.type}</div>
                  {agent.specialization && (
                    <Badge className="bg-pink-600 text-xs mt-1">
                      {agent.specialization}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Swarm Performance Analysis */}
      {swarmPerformance && (
        <Card className="bg-slate-900 border-2 border-purple-400">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-purple-400">SWARM PERFORMANCE</h3>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="bg-black p-3 rounded border border-purple-400 text-center">
                <div className="text-xs text-gray-400">Swarm Size</div>
                <div className="text-purple-400 font-bold text-xl">
                  {swarmPerformance.swarm_size}
                </div>
              </div>
              <div className="bg-black p-3 rounded border border-green-400 text-center">
                <div className="text-xs text-gray-400">Total Ops</div>
                <div className="text-green-400 font-bold text-xl">
                  {swarmPerformance.performance.total_operations}
                </div>
              </div>
              <div className="bg-black p-3 rounded border border-yellow-400 text-center">
                <div className="text-xs text-gray-400">Avg Efficiency</div>
                <div className="text-yellow-400 font-bold text-xl">
                  {(swarmPerformance.performance.avg_efficiency * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-black p-3 rounded border border-cyan-400 text-center">
                <div className="text-xs text-gray-400">Quantum</div>
                <div className="text-cyan-400 font-bold text-xl">
                  {swarmPerformance.performance.quantum_enabled}
                </div>
              </div>
            </div>

            {swarmPerformance.recommendations && (
              <div className="bg-black p-4 rounded border border-purple-400">
                <div className="text-sm font-bold text-purple-400 mb-2">
                  AI Recommendations
                </div>
                <div className="space-y-2 text-xs">
                  {swarmPerformance.recommendations.immediate_actions?.map((action, i) => (
                    <div key={i} className="text-yellow-400">• {action}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}