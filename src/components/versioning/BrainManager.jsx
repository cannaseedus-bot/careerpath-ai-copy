import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, GitFork, Upload, Download, Share2, Loader2, 
  Globe, Lock, Package, Cpu, HardDrive, Users, Tag, GitMerge, Check, Workflow
} from 'lucide-react';
import PipelineBuilder from './PipelineBuilder';
import { toast } from 'sonner';

const tapeManager = async (payload) => base44.functions.invoke('tapeManager', payload);

export default function BrainManager({ entityType, entityId, tapes = [], currentTapeId }) {
  const [createForm, setCreateForm] = useState({
    name: '', description: '', isPublic: false, tags: '', modelArchitecture: '', quantization: ''
  });
  const [selectedBrainId, setSelectedBrainId] = useState('');
  const [pullMessage, setPullMessage] = useState('');
  const [mergeSelection, setMergeSelection] = useState([]);
  const [mergeForm, setMergeForm] = useState({ name: '', description: '', strategy: 'latest' });
  const queryClient = useQueryClient();

  // List brains
  const { data: brainsData, isLoading } = useQuery({
    queryKey: ['brains'],
    queryFn: async () => {
      const res = await tapeManager({ action: 'listBrains' });
      return res.data;
    }
  });

  // Create brain from tape
  const createBrainMutation = useMutation({
    mutationFn: async (tapeId) => {
      const res = await tapeManager({
        action: 'createBrain',
        tapeId,
        name: createForm.name,
        description: createForm.description,
        isPublic: createForm.isPublic,
        tags: createForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        modelArchitecture: createForm.modelArchitecture,
        quantization: createForm.quantization
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setCreateForm({ name: '', description: '', isPublic: false, tags: '', modelArchitecture: '', quantization: '' });
      queryClient.invalidateQueries({ queryKey: ['brains'] });
    },
    onError: (err) => toast.error(err.message)
  });

  // Fork brain into tape
  const forkMutation = useMutation({
    mutationFn: async (brainId) => {
      const res = await tapeManager({
        action: 'forkBrain',
        brainId,
        entityType,
        entityId
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['tapeLog'] });
      queryClient.invalidateQueries({ queryKey: ['brains'] });
    },
    onError: (err) => toast.error(err.message)
  });

  // Push tape to brain
  const pushMutation = useMutation({
    mutationFn: async ({ tapeId, brainId }) => {
      const res = await tapeManager({ action: 'push', tapeId, brainId });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['brains'] });
    },
    onError: (err) => toast.error(err.message)
  });

  // Merge brains
  const mergeMutation = useMutation({
    mutationFn: async () => {
      const res = await tapeManager({
        action: 'mergeBrains',
        sourceBrainIds: mergeSelection,
        targetName: mergeForm.name,
        description: mergeForm.description,
        strategy: mergeForm.strategy
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setMergeSelection([]);
      setMergeForm({ name: '', description: '', strategy: 'latest' });
      queryClient.invalidateQueries({ queryKey: ['brains'] });
    },
    onError: (err) => toast.error(err.message)
  });

  const toggleMergeSelection = (brainId) => {
    setMergeSelection(prev => 
      prev.includes(brainId) 
        ? prev.filter(id => id !== brainId)
        : [...prev, brainId]
    );
  };

  // Pull brain into tape
  const pullMutation = useMutation({
    mutationFn: async (brainId) => {
      const res = await tapeManager({
        action: 'pull',
        brainId,
        entityType,
        entityId,
        message: pullMessage || undefined
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setPullMessage('');
      queryClient.invalidateQueries({ queryKey: ['tapeLog'] });
      queryClient.invalidateQueries({ queryKey: ['brains'] });
    },
    onError: (err) => toast.error(err.message)
  });

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700 flex-wrap">
          <TabsTrigger value="browse"><Brain className="w-4 h-4 mr-1" />Browse</TabsTrigger>
          <TabsTrigger value="create"><Package className="w-4 h-4 mr-1" />Create</TabsTrigger>
          <TabsTrigger value="merge"><GitMerge className="w-4 h-4 mr-1" />Merge</TabsTrigger>
          <TabsTrigger value="pipelines"><Workflow className="w-4 h-4 mr-1" />Pipelines</TabsTrigger>
          <TabsTrigger value="sync"><Upload className="w-4 h-4 mr-1" />Push/Pull</TabsTrigger>
        </TabsList>

        {/* Browse Brains */}
        <TabsContent value="browse">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-pink-400" />
                Available Brains
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-6"><Loader2 className="w-6 h-6 animate-spin mx-auto text-pink-400" /></div>
              ) : !brainsData?.brains?.length ? (
                <div className="text-center py-6 text-slate-400">No brains yet. Create one from a tape!</div>
              ) : (
                <div className="space-y-3">
                  {brainsData.brains.map(brain => (
                    <div key={brain.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-pink-500/50 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{brain.name}</span>
                            <Badge className="bg-pink-600 text-xs">v{brain.version}</Badge>
                            {brain.is_public ? (
                              <Globe className="w-3 h-3 text-green-400" />
                            ) : (
                              <Lock className="w-3 h-3 text-yellow-400" />
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mt-1">{brain.description}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => forkMutation.mutate(brain.id)}
                          disabled={forkMutation.isPending || !entityId}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <GitFork className="w-3 h-3 mr-1" /> Fork
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {brain.model_architecture && (
                          <Badge variant="outline" className="text-xs"><Cpu className="w-3 h-3 mr-1" />{brain.model_architecture}</Badge>
                        )}
                        {brain.quantization && (
                          <Badge variant="outline" className="text-xs">{brain.quantization}</Badge>
                        )}
                        <Badge variant="outline" className="text-xs"><HardDrive className="w-3 h-3 mr-1" />{formatBytes(brain.size_bytes)}</Badge>
                        <Badge variant="outline" className="text-xs"><GitFork className="w-3 h-3 mr-1" />{brain.fork_count} forks</Badge>
                        <Badge variant="outline" className="text-xs"><Download className="w-3 h-3 mr-1" />{brain.pull_count} pulls</Badge>
                      </div>
                      {brain.tags?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {brain.tags.map(tag => (
                            <Badge key={tag} className="bg-slate-700 text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Brain */}
        <TabsContent value="create">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Create Brain from Tape</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Source Tape</label>
                <Select onValueChange={(v) => setCreateForm(f => ({ ...f, sourceTapeId: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select tape..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tapes.map(tape => (
                      <SelectItem key={tape.id} value={tape.id}>
                        v{tape.version} - {tape.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Brain name"
                className="bg-slate-800 border-slate-600 text-white"
              />
              
              <Textarea
                value={createForm.description}
                onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description"
                className="bg-slate-800 border-slate-600 text-white"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={createForm.modelArchitecture}
                  onChange={(e) => setCreateForm(f => ({ ...f, modelArchitecture: e.target.value }))}
                  placeholder="Architecture (phi-3, llama...)"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Input
                  value={createForm.quantization}
                  onChange={(e) => setCreateForm(f => ({ ...f, quantization: e.target.value }))}
                  placeholder="Quantization (int4, fp16...)"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
              
              <Input
                value={createForm.tags}
                onChange={(e) => setCreateForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="Tags (comma-separated)"
                className="bg-slate-800 border-slate-600 text-white"
              />
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={createForm.isPublic}
                  onCheckedChange={(v) => setCreateForm(f => ({ ...f, isPublic: v }))}
                />
                <span className="text-sm text-slate-400">Make publicly shareable</span>
              </div>
              
              <Button
                onClick={() => createBrainMutation.mutate(createForm.sourceTapeId)}
                disabled={!createForm.sourceTapeId || !createForm.name || createBrainMutation.isPending}
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                {createBrainMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Brain className="w-4 h-4 mr-1" />}
                Create Brain
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Merge Brains */}
        <TabsContent value="merge">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-orange-400" />
                Merge Brains
                {mergeSelection.length > 0 && (
                  <Badge className="bg-orange-600">{mergeSelection.length} selected</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">Select 2+ brains to merge into a new combined brain.</p>
              
              {/* Selection List */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brainsData?.brains?.map(brain => (
                  <div 
                    key={brain.id}
                    onClick={() => toggleMergeSelection(brain.id)}
                    className={`p-3 rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                      mergeSelection.includes(brain.id)
                        ? 'bg-orange-900/30 border border-orange-500'
                        : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {mergeSelection.includes(brain.id) && <Check className="w-4 h-4 text-orange-400" />}
                      <span className="text-white">{brain.name}</span>
                      <Badge className="bg-slate-700 text-xs">v{brain.version}</Badge>
                    </div>
                    <span className="text-xs text-slate-500">{formatBytes(brain.size_bytes)}</span>
                  </div>
                ))}
              </div>
              
              {mergeSelection.length >= 2 && (
                <div className="space-y-3 pt-3 border-t border-slate-700">
                  <Input
                    value={mergeForm.name}
                    onChange={(e) => setMergeForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Merged brain name"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Textarea
                    value={mergeForm.description}
                    onChange={(e) => setMergeForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Description (optional)"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                  <Select value={mergeForm.strategy} onValueChange={(v) => setMergeForm(f => ({ ...f, strategy: v }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest Wins (override)</SelectItem>
                      <SelectItem value="combine">Combine (merge arrays/objects)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => mergeMutation.mutate()}
                    disabled={mergeMutation.isPending || !mergeForm.name}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {mergeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <GitMerge className="w-4 h-4 mr-1" />}
                    Merge {mergeSelection.length} Brains
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pipelines */}
        <TabsContent value="pipelines">
          <PipelineBuilder />
        </TabsContent>

        {/* Push/Pull */}
        <TabsContent value="sync">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Push */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-green-400" />
                  Push to Brain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={setSelectedBrainId}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select target brain..." />
                  </SelectTrigger>
                  <SelectContent>
                    {brainsData?.brains?.map(brain => (
                      <SelectItem key={brain.id} value={brain.id}>
                        {brain.name} (v{brain.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => pushMutation.mutate({ tapeId: currentTapeId, brainId: selectedBrainId })}
                  disabled={!currentTapeId || !selectedBrainId || pushMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {pushMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                  Push Current Tape
                </Button>
              </CardContent>
            </Card>

            {/* Pull */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-400" />
                  Pull from Brain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select onValueChange={setSelectedBrainId}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Select source brain..." />
                  </SelectTrigger>
                  <SelectContent>
                    {brainsData?.brains?.map(brain => (
                      <SelectItem key={brain.id} value={brain.id}>
                        {brain.name} (v{brain.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={pullMessage}
                  onChange={(e) => setPullMessage(e.target.value)}
                  placeholder="Pull message (optional)"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Button
                  onClick={() => pullMutation.mutate(selectedBrainId)}
                  disabled={!selectedBrainId || !entityId || pullMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {pullMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Download className="w-4 h-4 mr-1" />}
                  Pull into New Tape
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}