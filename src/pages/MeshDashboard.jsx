import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Network, Globe, Brain, Database, Users, Activity, Wifi, WifiOff,
  Share2, Download, Upload, Zap, Server, HardDrive, Clock, RefreshCw,
  Radio, Satellite, Link2, GitBranch, Package, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useMeshNetwork } from '@/components/mesh/MeshServiceWorker';
import MergeProposalManager from '@/components/mesh/MergeProposalManager';
import VersionHistoryPanel from '@/components/mesh/VersionHistoryPanel';

const tapeManager = async (payload) => base44.functions.invoke('tapeManager', payload);

export default function MeshDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const queryClient = useQueryClient();
  
  // Local mesh state
  const [localNodeId] = useState(() => localStorage.getItem('mesh_node_id') || `node_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`);
  const [sharedBrains, setSharedBrains] = useState(() => JSON.parse(localStorage.getItem('mesh_shared_brains') || '[]'));
  const [sharedTapes, setSharedTapes] = useState(() => JSON.parse(localStorage.getItem('mesh_shared_tapes') || '[]'));

  // Save node ID
  useEffect(() => {
    localStorage.setItem('mesh_node_id', localNodeId);
  }, [localNodeId]);

  // Fetch all mesh nodes
  const { data: nodesData, isLoading: nodesLoading } = useQuery({
    queryKey: ['meshNodes'],
    queryFn: () => base44.entities.MeshNode.list('-last_heartbeat', 100),
    refetchInterval: 10000
  });

  // Fetch public brains
  const { data: brainsData } = useQuery({
    queryKey: ['allBrains'],
    queryFn: async () => {
      const res = await tapeManager({ action: 'listBrains', publicOnly: false });
      return res.data;
    }
  });

  // Fetch tapes
  const { data: tapesData } = useQuery({
    queryKey: ['allTapes'],
    queryFn: () => base44.entities.Tape.filter({ status: 'active' }, '-created_date', 50)
  });

  // Fetch marketplace brains
  const { data: marketplaceBrains } = useQuery({
    queryKey: ['marketplaceBrains'],
    queryFn: async () => {
      const res = await tapeManager({ action: 'listBrains', publicOnly: true });
      return res.data;
    }
  });

  // Register/update node
  const registerMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const existingNodes = await base44.entities.MeshNode.filter({ node_id: localNodeId });
      
      const nodeData = {
        node_id: localNodeId,
        user_email: user?.email || 'anonymous',
        display_name: user?.full_name || `Node ${localNodeId.slice(-6)}`,
        status: isOnline ? 'online' : 'offline',
        shared_brains: sharedBrains,
        shared_tapes: sharedTapes,
        last_heartbeat: new Date().toISOString(),
        peer_connections: nodesData?.filter(n => n.status === 'online').length || 0,
        version: '1.0.0'
      };

      if (existingNodes.length > 0) {
        return base44.entities.MeshNode.update(existingNodes[0].id, nodeData);
      }
      return base44.entities.MeshNode.create(nodeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meshNodes'] });
      toast.success('Node registered to mesh network');
    }
  });

  // Auto-register on mount and interval
  useEffect(() => {
    registerMutation.mutate();
    const interval = setInterval(() => {
      if (autoSync) registerMutation.mutate();
    }, 30000);
    return () => clearInterval(interval);
  }, [isOnline, sharedBrains, sharedTapes, autoSync]);

  // Toggle brain sharing
  const toggleBrainShare = (brainId) => {
    const updated = sharedBrains.includes(brainId) 
      ? sharedBrains.filter(id => id !== brainId)
      : [...sharedBrains, brainId];
    setSharedBrains(updated);
    localStorage.setItem('mesh_shared_brains', JSON.stringify(updated));
  };

  // Toggle tape sharing
  const toggleTapeShare = (tapeId) => {
    const updated = sharedTapes.includes(tapeId)
      ? sharedTapes.filter(id => id !== tapeId)
      : [...sharedTapes, tapeId];
    setSharedTapes(updated);
    localStorage.setItem('mesh_shared_tapes', JSON.stringify(updated));
  };

  const onlineNodes = nodesData?.filter(n => n.status === 'online') || [];
  const totalSharedBrains = [...new Set(nodesData?.flatMap(n => n.shared_brains || []) || [])];
  const totalSharedTapes = [...new Set(nodesData?.flatMap(n => n.shared_tapes || []) || [])];

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Network className="w-8 h-8 text-cyan-400" />
              Mesh Network Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Decentralized Brain & Tape Sharing Network</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Auto Sync</span>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
              <Switch checked={isOnline} onCheckedChange={setIsOnline} />
              <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <Button onClick={() => registerMutation.mutate()} disabled={registerMutation.isPending} size="sm" className="bg-cyan-600 hover:bg-cyan-700">
              <RefreshCw className={`w-4 h-4 mr-1 ${registerMutation.isPending ? 'animate-spin' : ''}`} /> Sync
            </Button>
          </div>
        </div>

        {/* Node Status Card */}
        <Card className="bg-gradient-to-r from-cyan-900/50 to-purple-900/50 border-cyan-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Radio className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm text-slate-400">Your Node ID</div>
                  <div className="text-xl font-mono text-cyan-300">{localNodeId}</div>
                  <Badge className={isOnline ? 'bg-green-600' : 'bg-red-600'}>{isOnline ? 'Broadcasting' : 'Offline'}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-cyan-400">{sharedBrains.length}</div>
                  <div className="text-sm text-slate-400">Brains Shared</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400">{sharedTapes.length}</div>
                  <div className="text-sm text-slate-400">Tapes Shared</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-pink-400">{onlineNodes.length}</div>
                  <div className="text-sm text-slate-400">Connected Peers</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-4 text-center">
              <Server className="w-8 h-8 mx-auto text-cyan-400 mb-2" />
              <div className="text-2xl font-bold">{nodesData?.length || 0}</div>
              <div className="text-xs text-slate-400">Total Nodes</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-4 text-center">
              <Brain className="w-8 h-8 mx-auto text-pink-400 mb-2" />
              <div className="text-2xl font-bold">{totalSharedBrains.length}</div>
              <div className="text-xs text-slate-400">Network Brains</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-4 text-center">
              <Database className="w-8 h-8 mx-auto text-purple-400 mb-2" />
              <div className="text-2xl font-bold">{totalSharedTapes.length}</div>
              <div className="text-xs text-slate-400">Network Tapes</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-4 text-center">
              <Globe className="w-8 h-8 mx-auto text-green-400 mb-2" />
              <div className="text-2xl font-bold">{marketplaceBrains?.brains?.length || 0}</div>
              <div className="text-xs text-slate-400">Marketplace Items</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="nodes" className="space-y-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="nodes"><Users className="w-4 h-4 mr-1" /> Network Nodes</TabsTrigger>
            <TabsTrigger value="merges"><GitBranch className="w-4 h-4 mr-1" /> Merge Proposals</TabsTrigger>
            <TabsTrigger value="versions"><Clock className="w-4 h-4 mr-1" /> Version History</TabsTrigger>
            <TabsTrigger value="brains"><Brain className="w-4 h-4 mr-1" /> Brains</TabsTrigger>
            <TabsTrigger value="tapes"><Database className="w-4 h-4 mr-1" /> Tapes</TabsTrigger>
            <TabsTrigger value="marketplace"><Globe className="w-4 h-4 mr-1" /> Marketplace</TabsTrigger>
          </TabsList>

          {/* Merge Proposals Tab */}
          <TabsContent value="merges">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-purple-400" /> Network Merge Proposals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MergeProposalManager nodeId={localNodeId} sharedBrains={sharedBrains} sharedTapes={sharedTapes} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Version History Tab */}
          <TabsContent value="versions">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" /> Mesh Version History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VersionHistoryPanel nodeId={localNodeId} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nodes Tab */}
          <TabsContent value="nodes">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-cyan-400" /> Connected Nodes ({onlineNodes.length} online)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {nodesLoading ? (
                  <div className="text-center py-8 text-slate-400">Loading nodes...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {nodesData?.map(node => (
                      <div key={node.id} className={`p-4 rounded-lg border ${node.status === 'online' ? 'bg-slate-800 border-cyan-700' : 'bg-slate-800/50 border-slate-700'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${node.status === 'online' ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
                            <span className="font-medium text-sm">{node.display_name}</span>
                          </div>
                          <Badge className={node.status === 'online' ? 'bg-green-600' : 'bg-slate-600'}>{node.status}</Badge>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mb-2">{node.node_id}</div>
                        <div className="flex gap-3 text-xs text-slate-400">
                          <span><Brain className="w-3 h-3 inline mr-1" />{node.shared_brains?.length || 0}</span>
                          <span><Database className="w-3 h-3 inline mr-1" />{node.shared_tapes?.length || 0}</span>
                          <span><Link2 className="w-3 h-3 inline mr-1" />{node.peer_connections || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brains Tab */}
          <TabsContent value="brains">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-pink-400" /> Your Brains - Toggle Sharing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {brainsData?.brains?.map(brain => (
                    <div key={brain.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5 text-pink-400" />
                        <div>
                          <div className="font-medium">{brain.name}</div>
                          <div className="text-xs text-slate-400">v{brain.version} • {formatBytes(brain.size_bytes)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {sharedBrains.includes(brain.id) && <Badge className="bg-cyan-600">Shared</Badge>}
                        <Switch 
                          checked={sharedBrains.includes(brain.id)} 
                          onCheckedChange={() => toggleBrainShare(brain.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tapes Tab */}
          <TabsContent value="tapes">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-400" /> Your Tapes - Toggle Sharing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tapesData?.map(tape => (
                    <div key={tape.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="font-medium">{tape.name}</div>
                          <div className="text-xs text-slate-400">v{tape.version} • {tape.branch}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {sharedTapes.includes(tape.id) && <Badge className="bg-purple-600">Shared</Badge>}
                        <Switch 
                          checked={sharedTapes.includes(tape.id)} 
                          onCheckedChange={() => toggleTapeShare(tape.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-400" /> Network Marketplace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {marketplaceBrains?.brains?.map(brain => (
                    <div key={brain.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-pink-500/50 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-5 h-5 text-pink-400" />
                        <span className="font-medium">{brain.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2 line-clamp-2">{brain.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 text-xs text-slate-400">
                          <span><Download className="w-3 h-3 inline" /> {brain.pull_count || 0}</span>
                          <span><GitBranch className="w-3 h-3 inline" /> {brain.fork_count || 0}</span>
                        </div>
                        <Badge className="bg-pink-600">{brain.model_architecture || 'N/A'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}