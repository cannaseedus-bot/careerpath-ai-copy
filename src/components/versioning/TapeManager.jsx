import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GitBranch, GitCommit, History, RotateCcw, Plus, 
  Diff, Archive, Tag, Check, Loader2, ChevronRight, Rocket, GitCompare
} from 'lucide-react';
import { toast } from 'sonner';
import ReleaseManager from './ReleaseManager';
import BranchCompare from './BranchCompare';
import BrainManager from './BrainManager';

// Wrapper for backend function
const tapeManager = async (payload) => {
  return await base44.functions.invoke('tapeManager', payload);
};

export default function TapeManager({ entityType, entityId, entityName }) {
  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [selectedTapes, setSelectedTapes] = useState([]);
  const [showDiff, setShowDiff] = useState(false);
  const [diffResult, setDiffResult] = useState(null);
  const queryClient = useQueryClient();

  // Get registry status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['tapeStatus', entityType, entityId],
    queryFn: async () => {
      const res = await tapeManager({ action: 'status', entityType, entityId });
      return res.data;
    },
    enabled: !!entityType && !!entityId
  });

  // Get tape history
  const { data: logData, isLoading: logLoading } = useQuery({
    queryKey: ['tapeLog', entityType, entityId],
    queryFn: async () => {
      const res = await tapeManager({ action: 'log', entityType, entityId, limit: 50 });
      return res.data;
    },
    enabled: !!entityType && !!entityId
  });

  // Commit mutation
  const commitMutation = useMutation({
    mutationFn: async ({ message, versionType }) => {
      const res = await tapeManager({ 
        action: 'commit', 
        entityType, 
        entityId, 
        message,
        versionType
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setCommitMessage('');
      queryClient.invalidateQueries({ queryKey: ['tapeStatus'] });
      queryClient.invalidateQueries({ queryKey: ['tapeLog'] });
    },
    onError: (err) => toast.error(err.message)
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async (tapeId) => {
      const res = await tapeManager({ action: 'checkout', tapeId });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['tapeStatus'] });
    },
    onError: (err) => toast.error(err.message)
  });

  // Branch mutation
  const branchMutation = useMutation({
    mutationFn: async (branchName) => {
      const res = await tapeManager({ 
        action: 'branch', 
        entityType, 
        entityId, 
        branchName 
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setNewBranchName('');
      queryClient.invalidateQueries({ queryKey: ['tapeStatus'] });
    },
    onError: (err) => toast.error(err.message)
  });

  // Diff handler
  const handleDiff = async () => {
    if (selectedTapes.length !== 2) {
      toast.error('Select exactly 2 tapes to compare');
      return;
    }
    try {
      const res = await tapeManager({ 
        action: 'diff', 
        tapeId1: selectedTapes[0], 
        tapeId2: selectedTapes[1] 
      });
      setDiffResult(res.data);
      setShowDiff(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleTapeSelection = (tapeId) => {
    setSelectedTapes(prev => 
      prev.includes(tapeId) 
        ? prev.filter(id => id !== tapeId)
        : prev.length < 2 ? [...prev, tapeId] : [prev[1], tapeId]
    );
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!entityType || !entityId) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-6 text-center text-slate-400">
          Select an entity to manage versions
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-purple-500/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Archive className="w-6 h-6 text-purple-400" />
              <div>
                <div className="text-white font-semibold">{entityName || `${entityType}/${entityId.substring(0, 8)}`}</div>
                <div className="text-xs text-slate-400 font-mono">
                  {status?.initialized 
                    ? `v${status.registry.current_version} • ${status.registry.total_tapes} tapes • ${formatBytes(status.registry.total_size_bytes)}`
                    : 'Not initialized'
                  }
                </div>
              </div>
            </div>
            {status?.initialized && (
              <Badge className="bg-green-600">
                <GitBranch className="w-3 h-3 mr-1" />
                {status.registry.head_branch}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="commit" className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700 flex-wrap">
          <TabsTrigger value="commit"><GitCommit className="w-4 h-4 mr-1" />Commit</TabsTrigger>
          <TabsTrigger value="history"><History className="w-4 h-4 mr-1" />History</TabsTrigger>
          <TabsTrigger value="releases"><Rocket className="w-4 h-4 mr-1" />Releases</TabsTrigger>
          <TabsTrigger value="branches"><GitBranch className="w-4 h-4 mr-1" />Branches</TabsTrigger>
          <TabsTrigger value="compare"><GitCompare className="w-4 h-4 mr-1" />Compare</TabsTrigger>
          <TabsTrigger value="brains" className="text-pink-400"><svg className="w-4 h-4 mr-1 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5V12h4V9.5c1.2-.7 2-2 2-3.5a4 4 0 0 0-4-4z"/><path d="M8 12v2a4 4 0 0 0 8 0v-2"/><path d="M12 18v4"/></svg>Brains</TabsTrigger>
        </TabsList>

        {/* Commit Tab */}
        <TabsContent value="commit">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Create Tape (Commit)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Describe changes..."
                className="bg-slate-800 border-slate-600 text-white"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={() => commitMutation.mutate({ message: commitMessage, versionType: 'patch' })}
                  disabled={commitMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {commitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <GitCommit className="w-4 h-4 mr-1" />}
                  Patch
                </Button>
                <Button 
                  onClick={() => commitMutation.mutate({ message: commitMessage, versionType: 'minor' })}
                  disabled={commitMutation.isPending}
                  variant="outline"
                  className="border-blue-600 text-blue-400"
                >
                  Minor
                </Button>
                <Button 
                  onClick={() => commitMutation.mutate({ message: commitMessage, versionType: 'major' })}
                  disabled={commitMutation.isPending}
                  variant="outline"
                  className="border-orange-600 text-orange-400"
                >
                  Major
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white text-lg">Tape History</CardTitle>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDiff}
                  disabled={selectedTapes.length !== 2}
                  className="border-cyan-600 text-cyan-400"
                >
                  <Diff className="w-4 h-4 mr-1" /> Compare ({selectedTapes.length}/2)
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {logLoading ? (
                <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400" /></div>
              ) : !logData?.tapes?.length ? (
                <div className="text-center py-8 text-slate-400">No tapes yet. Create your first commit!</div>
              ) : (
                <div className="space-y-2">
                  {logData.tapes.map((tape, i) => (
                    <div 
                      key={tape.id} 
                      className={`p-3 rounded-lg border transition-all cursor-pointer ${
                        selectedTapes.includes(tape.id) 
                          ? 'bg-purple-900/30 border-purple-500' 
                          : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                      }`}
                      onClick={() => toggleTapeSelection(tape.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-green-500' : 'bg-slate-600'}`} />
                          <div>
                            <div className="text-white font-medium flex items-center gap-2">
                              <span className="font-mono text-cyan-400">v{tape.version}</span>
                              <span className="text-slate-300">{tape.name}</span>
                              {tape.tags?.map(tag => (
                                <Badge key={tag} className="bg-purple-600 text-xs">{tag}</Badge>
                              ))}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                              <code>{tape.checksum}</code>
                              <span>•</span>
                              <span>{formatBytes(tape.size_bytes)}</span>
                              <span>•</span>
                              <span>{new Date(tape.created_date).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={(e) => {
                            e.stopPropagation();
                            checkoutMutation.mutate(tape.id);
                          }}
                          disabled={i === 0 || checkoutMutation.isPending}
                          className="text-orange-400 hover:text-orange-300"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diff Modal */}
          {showDiff && diffResult && (
            <Card className="bg-slate-900 border-cyan-500/50 mt-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-cyan-400 text-lg flex items-center gap-2">
                    <Diff className="w-5 h-5" />
                    Diff: v{diffResult.from.version} → v{diffResult.to.version}
                  </CardTitle>
                  <Button size="sm" variant="ghost" onClick={() => setShowDiff(false)}>×</Button>
                </div>
              </CardHeader>
              <CardContent className="font-mono text-sm space-y-3">
                {Object.keys(diffResult.diff.added).length > 0 && (
                  <div>
                    <div className="text-green-400 mb-1">+ Added</div>
                    {Object.entries(diffResult.diff.added).map(([key, val]) => (
                      <div key={key} className="text-green-300 pl-4">+ {key}: {JSON.stringify(val)}</div>
                    ))}
                  </div>
                )}
                {Object.keys(diffResult.diff.removed).length > 0 && (
                  <div>
                    <div className="text-red-400 mb-1">- Removed</div>
                    {Object.entries(diffResult.diff.removed).map(([key, val]) => (
                      <div key={key} className="text-red-300 pl-4">- {key}: {JSON.stringify(val)}</div>
                    ))}
                  </div>
                )}
                {Object.keys(diffResult.diff.changed).length > 0 && (
                  <div>
                    <div className="text-yellow-400 mb-1">~ Changed</div>
                    {Object.entries(diffResult.diff.changed).map(([key, { from, to }]) => (
                      <div key={key} className="pl-4">
                        <div className="text-red-300">- {key}: {JSON.stringify(from)}</div>
                        <div className="text-green-300">+ {key}: {JSON.stringify(to)}</div>
                      </div>
                    ))}
                  </div>
                )}
                {Object.keys(diffResult.diff.added).length === 0 && 
                 Object.keys(diffResult.diff.removed).length === 0 && 
                 Object.keys(diffResult.diff.changed).length === 0 && (
                  <div className="text-slate-400">No differences found</div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Releases Tab */}
        <TabsContent value="releases">
          <ReleaseManager 
            entityType={entityType} 
            entityId={entityId} 
            tapes={logData?.tapes || []}
          />
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Branches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="New branch name..."
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <Button 
                  onClick={() => branchMutation.mutate(newBranchName)}
                  disabled={!newBranchName || branchMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-1" /> Create
                </Button>
              </div>
              
              <div className="space-y-2">
                {status?.registry?.branches?.map(branch => (
                  <div key={branch.name} className="p-3 bg-slate-800 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-purple-400" />
                      <span className="text-white">{branch.name}</span>
                      {branch.name === status.registry.head_branch && (
                        <Badge className="bg-green-600 text-xs">HEAD</Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(branch.created_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compare Tab */}
        <TabsContent value="compare">
          <BranchCompare 
            entityType={entityType} 
            entityId={entityId} 
            branches={status?.registry?.branches || []}
          />
        </TabsContent>

        {/* Brains Tab */}
        <TabsContent value="brains">
          <BrainManager 
            entityType={entityType}
            entityId={entityId}
            tapes={logData?.tapes || []}
            currentTapeId={status?.registry?.current_tape_id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}