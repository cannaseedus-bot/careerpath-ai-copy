import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Workflow, Play, Plus, Trash2, Link2, Brain, Archive, 
  Router, Zap, Loader2, ArrowRight, Check, Clock, Bell, GitCommit, Tag, Upload, Calendar, Power
} from 'lucide-react';
import { toast } from 'sonner';

const tapeManager = async (payload) => base44.functions.invoke('tapeManager', payload);

const NODE_TYPES = [
  { value: 'brain', label: 'Brain', icon: Brain, color: 'bg-pink-600' },
  { value: 'tape', label: 'Tape', icon: Archive, color: 'bg-purple-600' },
  { value: 'router', label: 'Router', icon: Router, color: 'bg-cyan-600' },
  { value: 'trigger', label: 'Trigger', icon: Zap, color: 'bg-yellow-600' },
];

const TRIGGER_EVENTS = [
  { value: 'tape_commit', label: 'Tape Commit', icon: GitCommit },
  { value: 'release', label: 'New Release', icon: Tag },
  { value: 'brain_push', label: 'Brain Push', icon: Upload },
  { value: 'schedule', label: 'Schedule', icon: Calendar },
];

export default function PipelineBuilder() {
  const [pipelineName, setPipelineName] = useState('');
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [showTriggerForm, setShowTriggerForm] = useState(null);
  const [triggerConfig, setTriggerConfig] = useState({ event: 'tape_commit', conditions: {} });
  const queryClient = useQueryClient();

  // Fetch brains and tapes for node sources
  const { data: brainsData } = useQuery({
    queryKey: ['brains'],
    queryFn: async () => {
      const res = await tapeManager({ action: 'listBrains' });
      return res.data;
    }
  });

  // Fetch pipelines
  const { data: pipelinesData, isLoading } = useQuery({
    queryKey: ['pipelines'],
    queryFn: async () => {
      const res = await tapeManager({ action: 'listPipelines' });
      return res.data;
    }
  });

  // Create pipeline
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await tapeManager({
        action: 'createPipeline',
        name: pipelineName,
        nodes,
        connections
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setPipelineName('');
      setNodes([]);
      setConnections([]);
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
    onError: (err) => toast.error(err.message)
  });

  // Execute pipeline
  const executeMutation = useMutation({
    mutationFn: async (pipelineId) => {
      const res = await tapeManager({ action: 'executePipeline', pipelineId });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setExecutionResult(data);
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
    onError: (err) => toast.error(err.message)
  });

  // Add trigger
  const addTriggerMutation = useMutation({
    mutationFn: async ({ pipelineId, event, conditions }) => {
      const res = await tapeManager({ action: 'addTrigger', pipelineId, event, conditions });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setShowTriggerForm(null);
      setTriggerConfig({ event: 'tape_commit', conditions: {} });
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
    onError: (err) => toast.error(err.message)
  });

  // Toggle trigger
  const toggleTriggerMutation = useMutation({
    mutationFn: async ({ pipelineId, triggerId }) => {
      const res = await tapeManager({ action: 'toggleTrigger', pipelineId, triggerId });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    }
  });

  // Remove trigger
  const removeTriggerMutation = useMutation({
    mutationFn: async ({ pipelineId, triggerId }) => {
      const res = await tapeManager({ action: 'removeTrigger', pipelineId, triggerId });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Trigger removed');
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    }
  });

  const addNode = (type) => {
    const newNode = {
      id: `node_${Date.now()}`,
      type,
      source_id: '',
      config: {},
      position: { x: nodes.length * 150, y: 100 }
    };
    setNodes([...nodes, newNode]);
  };

  const updateNodeSource = (nodeId, sourceId) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, source_id: sourceId } : n));
  };

  const removeNode = (nodeId) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from_node !== nodeId && c.to_node !== nodeId));
  };

  const addConnection = (fromId, toId) => {
    if (fromId && toId && fromId !== toId) {
      setConnections([...connections, { from_node: fromId, to_node: toId, data_key: 'input' }]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Pipeline Builder */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Workflow className="w-5 h-5 text-cyan-400" />
            Pipeline Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            placeholder="Pipeline name"
            className="bg-slate-800 border-slate-600 text-white"
          />
          
          {/* Add Node Buttons */}
          <div className="flex gap-2 flex-wrap">
            {NODE_TYPES.map(type => (
              <Button
                key={type.value}
                size="sm"
                variant="outline"
                onClick={() => addNode(type.value)}
                className="border-slate-600"
              >
                <type.icon className="w-3 h-3 mr-1" />
                Add {type.label}
              </Button>
            ))}
          </div>

          {/* Nodes List */}
          {nodes.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-slate-400">Nodes ({nodes.length})</div>
              {nodes.map((node, i) => {
                const typeConfig = NODE_TYPES.find(t => t.value === node.type);
                return (
                  <div key={node.id} className="p-3 bg-slate-800 rounded-lg flex items-center gap-3">
                    <Badge className={typeConfig?.color}>{node.type}</Badge>
                    <span className="text-xs text-slate-500 font-mono">{node.id}</span>
                    
                    {(node.type === 'brain' || node.type === 'tape') && (
                      <Select value={node.source_id} onValueChange={(v) => updateNodeSource(node.id, v)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-40 h-8 text-xs">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          {node.type === 'brain' && brainsData?.brains?.map(b => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {i > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => addConnection(nodes[i-1].id, node.id)}
                        className="text-cyan-400 h-6 px-2"
                      >
                        <Link2 className="w-3 h-3 mr-1" /> Link from prev
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeNode(node.id)}
                      className="text-red-400 ml-auto h-6 px-2"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Connections */}
          {connections.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-slate-400">Connections</div>
              {connections.map((conn, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <code>{conn.from_node.slice(-6)}</code>
                  <ArrowRight className="w-3 h-3" />
                  <code>{conn.to_node.slice(-6)}</code>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={() => createMutation.mutate()}
            disabled={!pipelineName || nodes.length === 0 || createMutation.isPending}
            className="w-full bg-cyan-600 hover:bg-cyan-700"
          >
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            Create Pipeline
          </Button>
        </CardContent>
      </Card>

      {/* Existing Pipelines */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">Pipelines</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-cyan-400" /></div>
          ) : !pipelinesData?.pipelines?.length ? (
            <div className="text-center py-4 text-slate-400">No pipelines yet</div>
          ) : (
            <div className="space-y-2">
              {pipelinesData.pipelines.map(pipeline => (
                <div key={pipeline.id} className="p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{pipeline.name}</span>
                      <Badge className={pipeline.status === 'active' ? 'bg-green-600' : 'bg-slate-600'}>{pipeline.status}</Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => executeMutation.mutate(pipeline.id)}
                      disabled={executeMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 h-7"
                    >
                      <Play className="w-3 h-3 mr-1" /> Run
                    </Button>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-400">
                    <span>{pipeline.nodes_count} nodes</span>
                    <span>{pipeline.connections_count} connections</span>
                    {pipeline.run_count > 0 && <span><Clock className="w-3 h-3 inline mr-1" />{pipeline.run_count} runs</span>}
                  </div>
                  {/* Triggers Section */}
                  <div className="mt-2 border-t border-slate-700 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Bell className="w-3 h-3" /> Triggers
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowTriggerForm(showTriggerForm === pipeline.id ? null : pipeline.id)}
                        className="h-5 px-2 text-xs text-cyan-400"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Trigger Form */}
                    {showTriggerForm === pipeline.id && (
                      <div className="p-2 bg-slate-900 rounded mb-2 space-y-2">
                        <Select value={triggerConfig.event} onValueChange={(v) => setTriggerConfig({ ...triggerConfig, event: v })}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-7 text-xs">
                            <SelectValue placeholder="Event type" />
                          </SelectTrigger>
                          <SelectContent>
                            {TRIGGER_EVENTS.map(e => (
                              <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Input
                          placeholder="Branch pattern (regex)"
                          value={triggerConfig.conditions.branch_pattern || ''}
                          onChange={(e) => setTriggerConfig({ 
                            ...triggerConfig, 
                            conditions: { ...triggerConfig.conditions, branch_pattern: e.target.value } 
                          })}
                          className="bg-slate-700 border-slate-600 text-white h-7 text-xs"
                        />
                        
                        <Input
                          placeholder="Tag pattern (e.g., ^v1\\.)"
                          value={triggerConfig.conditions.tag_pattern || ''}
                          onChange={(e) => setTriggerConfig({ 
                            ...triggerConfig, 
                            conditions: { ...triggerConfig.conditions, tag_pattern: e.target.value } 
                          })}
                          className="bg-slate-700 border-slate-600 text-white h-7 text-xs"
                        />
                        
                        {triggerConfig.event === 'release' && (
                          <Select 
                            value={triggerConfig.conditions.release_type || 'any'} 
                            onValueChange={(v) => setTriggerConfig({ 
                              ...triggerConfig, 
                              conditions: { ...triggerConfig.conditions, release_type: v } 
                            })}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-7 text-xs">
                              <SelectValue placeholder="Release type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              <SelectItem value="stable">Stable</SelectItem>
                              <SelectItem value="rc">RC</SelectItem>
                              <SelectItem value="beta">Beta</SelectItem>
                              <SelectItem value="alpha">Alpha</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        
                        <Button
                          size="sm"
                          onClick={() => addTriggerMutation.mutate({ 
                            pipelineId: pipeline.id, 
                            event: triggerConfig.event, 
                            conditions: triggerConfig.conditions 
                          })}
                          disabled={addTriggerMutation.isPending}
                          className="w-full h-7 bg-cyan-600 hover:bg-cyan-700"
                        >
                          Add Trigger
                        </Button>
                      </div>
                    )}

                    {/* Existing Triggers */}
                    {pipeline.triggers?.map(trigger => (
                      <div key={trigger.id} className="flex items-center gap-2 text-xs py-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleTriggerMutation.mutate({ pipelineId: pipeline.id, triggerId: trigger.id })}
                          className={`h-5 w-5 p-0 ${trigger.enabled ? 'text-green-400' : 'text-slate-500'}`}
                        >
                          <Power className="w-3 h-3" />
                        </Button>
                        <Badge className={trigger.enabled ? 'bg-green-600/50' : 'bg-slate-600'}>{trigger.event}</Badge>
                        {trigger.conditions?.tag_pattern && (
                          <code className="text-slate-400">tag:{trigger.conditions.tag_pattern}</code>
                        )}
                        {trigger.conditions?.branch_pattern && (
                          <code className="text-slate-400">branch:{trigger.conditions.branch_pattern}</code>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTriggerMutation.mutate({ pipelineId: pipeline.id, triggerId: trigger.id })}
                          className="h-5 w-5 p-0 text-red-400 ml-auto"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {pipeline.api_routes?.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="text-slate-500">API Routes:</span>
                      {pipeline.api_routes.slice(0, 2).map((route, i) => (
                        <code key={i} className="ml-2 text-cyan-400">{route.path}</code>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution Result */}
      {executionResult && (
        <Card className="bg-slate-900 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400 text-lg flex items-center gap-2">
              <Check className="w-5 h-5" /> Execution Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {executionResult.executionLog?.map((log, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <Badge className={log.status === 'success' ? 'bg-green-600' : 'bg-red-600'}>{log.status}</Badge>
                  <code className="text-slate-400">{log.node}</code>
                  <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
            <pre className="mt-3 p-2 bg-black rounded text-xs text-slate-300 overflow-auto max-h-32">
              {JSON.stringify(executionResult.results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}