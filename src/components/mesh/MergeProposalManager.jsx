import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  GitMerge, Brain, Database, Send, Check, X, Clock, Users,
  Loader2, ChevronRight, Zap, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const tapeManager = async (payload) => base44.functions.invoke('tapeManager', payload);

export default function MergeProposalManager({ nodeId, sharedBrains, sharedTapes }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    selectedBrains: [],
    selectedTapes: [],
    targetNode: 'network',
    strategy: 'smart'
  });
  const queryClient = useQueryClient();

  // Fetch proposals
  const { data: proposals } = useQuery({
    queryKey: ['mergeProposals'],
    queryFn: () => base44.entities.MeshMergeProposal.filter({ status: 'pending' }, '-created_date', 50)
  });

  // Fetch my brains
  const { data: myBrains } = useQuery({
    queryKey: ['myBrains'],
    queryFn: async () => {
      const res = await tapeManager({ action: 'listBrains' });
      return res.data?.brains || [];
    }
  });

  // Fetch my tapes
  const { data: myTapes } = useQuery({
    queryKey: ['myTapes'],
    queryFn: () => base44.entities.Tape.filter({ status: 'active' }, '-created_date', 50)
  });

  // Fetch nodes for targeting
  const { data: nodes } = useQuery({
    queryKey: ['meshNodes'],
    queryFn: () => base44.entities.MeshNode.filter({ status: 'online' })
  });

  // Create proposal
  const createMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry
      
      return base44.entities.MeshMergeProposal.create({
        title: form.title,
        description: form.description,
        proposer_node_id: nodeId,
        proposer_email: user?.email,
        source_brain_ids: form.selectedBrains,
        source_tape_ids: form.selectedTapes,
        target_node_id: form.targetNode,
        merge_strategy: form.strategy,
        status: 'pending',
        votes_accept: [],
        votes_reject: [],
        expires_at: expiresAt.toISOString()
      });
    },
    onSuccess: () => {
      toast.success('Merge proposal submitted to network');
      setShowCreate(false);
      setForm({ title: '', description: '', selectedBrains: [], selectedTapes: [], targetNode: 'network', strategy: 'smart' });
      queryClient.invalidateQueries({ queryKey: ['mergeProposals'] });
    }
  });

  // Vote on proposal
  const voteMutation = useMutation({
    mutationFn: async ({ proposalId, accept }) => {
      const proposal = await base44.entities.MeshMergeProposal.get(proposalId);
      const accepts = proposal.votes_accept || [];
      const rejects = proposal.votes_reject || [];
      
      if (accept) {
        if (!accepts.includes(nodeId)) accepts.push(nodeId);
      } else {
        if (!rejects.includes(nodeId)) rejects.push(nodeId);
      }
      
      return base44.entities.MeshMergeProposal.update(proposalId, {
        votes_accept: accepts,
        votes_reject: rejects
      });
    },
    onSuccess: () => {
      toast.success('Vote recorded');
      queryClient.invalidateQueries({ queryKey: ['mergeProposals'] });
    }
  });

  // Execute merge
  const executeMutation = useMutation({
    mutationFn: async (proposal) => {
      // Merge brains
      if (proposal.source_brain_ids?.length >= 2) {
        const res = await tapeManager({
          action: 'mergeBrains',
          sourceBrainIds: proposal.source_brain_ids,
          targetName: `Network Merge: ${proposal.title}`,
          description: proposal.description,
          strategy: proposal.merge_strategy
        });
        
        // Update proposal with result
        await base44.entities.MeshMergeProposal.update(proposal.id, {
          status: 'merged',
          result_brain_id: res.data?.brain?.id
        });
        
        // Create version history entry
        await base44.entities.MeshVersionHistory.create({
          node_id: 'network',
          version_tag: `merge-${Date.now()}`,
          brain_snapshot_ids: [res.data?.brain?.id],
          tape_snapshot_ids: proposal.source_tape_ids || [],
          merge_proposal_id: proposal.id,
          changelog: `Merged from proposal: ${proposal.title}`,
          is_network_version: true
        });
        
        return res.data;
      }
      throw new Error('Need at least 2 brains to merge');
    },
    onSuccess: (data) => {
      toast.success(`Merge complete! Created: ${data.brain?.name}`);
      queryClient.invalidateQueries({ queryKey: ['mergeProposals'] });
      queryClient.invalidateQueries({ queryKey: ['versionHistory'] });
    }
  });

  const toggleBrain = (id) => {
    setForm(f => ({
      ...f,
      selectedBrains: f.selectedBrains.includes(id) 
        ? f.selectedBrains.filter(b => b !== id)
        : [...f.selectedBrains, id]
    }));
  };

  const toggleTape = (id) => {
    setForm(f => ({
      ...f,
      selectedTapes: f.selectedTapes.includes(id)
        ? f.selectedTapes.filter(t => t !== id)
        : [...f.selectedTapes, id]
    }));
  };

  const canExecute = (proposal) => {
    const acceptCount = proposal.votes_accept?.length || 0;
    const totalNodes = nodes?.length || 1;
    return acceptCount >= Math.ceil(totalNodes / 2); // Majority vote
  };

  return (
    <div className="space-y-4">
      {/* Create Proposal Button */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700">
            <GitMerge className="w-4 h-4 mr-2" /> Propose Network Merge
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-cyan-400" /> Create Merge Proposal
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Proposal title..."
              className="bg-slate-800 border-slate-600"
            />
            <Textarea
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Describe what this merge includes and why..."
              className="bg-slate-800 border-slate-600"
            />
            
            {/* Select Brains */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Select Brains to Merge</label>
              <div className="max-h-32 overflow-y-auto space-y-1 bg-slate-800 rounded p-2">
                {myBrains?.map(brain => (
                  <div key={brain.id} className="flex items-center gap-2 p-1 hover:bg-slate-700 rounded">
                    <Checkbox 
                      checked={form.selectedBrains.includes(brain.id)}
                      onCheckedChange={() => toggleBrain(brain.id)}
                    />
                    <Brain className="w-4 h-4 text-pink-400" />
                    <span className="text-sm">{brain.name}</span>
                    <Badge className="bg-slate-600 text-xs ml-auto">v{brain.version}</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Select Tapes */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Select Tapes to Include</label>
              <div className="max-h-32 overflow-y-auto space-y-1 bg-slate-800 rounded p-2">
                {myTapes?.map(tape => (
                  <div key={tape.id} className="flex items-center gap-2 p-1 hover:bg-slate-700 rounded">
                    <Checkbox 
                      checked={form.selectedTapes.includes(tape.id)}
                      onCheckedChange={() => toggleTape(tape.id)}
                    />
                    <Database className="w-4 h-4 text-purple-400" />
                    <span className="text-sm">{tape.name}</span>
                    <Badge className="bg-slate-600 text-xs ml-auto">v{tape.version}</Badge>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Target & Strategy */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Target</label>
                <Select value={form.targetNode} onValueChange={(v) => setForm(f => ({ ...f, targetNode: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="network">Entire Network</SelectItem>
                    {nodes?.filter(n => n.node_id !== nodeId).map(n => (
                      <SelectItem key={n.node_id} value={n.node_id}>{n.display_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Merge Strategy</label>
                <Select value={form.strategy} onValueChange={(v) => setForm(f => ({ ...f, strategy: v }))}>
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smart">Smart (Recommended)</SelectItem>
                    <SelectItem value="latest">Latest Wins</SelectItem>
                    <SelectItem value="combine">Combine All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !form.title || form.selectedBrains.length < 1}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Submit Proposal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pending Proposals */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Pending Proposals ({proposals?.length || 0})
        </h3>
        
        {proposals?.map(proposal => {
          const isMyProposal = proposal.proposer_node_id === nodeId;
          const hasVoted = proposal.votes_accept?.includes(nodeId) || proposal.votes_reject?.includes(nodeId);
          const acceptCount = proposal.votes_accept?.length || 0;
          const rejectCount = proposal.votes_reject?.length || 0;
          
          return (
            <Card key={proposal.id} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      <GitMerge className="w-4 h-4 text-cyan-400" />
                      {proposal.title}
                      {isMyProposal && <Badge className="bg-cyan-600 text-xs">Your Proposal</Badge>}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{proposal.description}</p>
                  </div>
                  <Badge className={proposal.merge_strategy === 'smart' ? 'bg-green-600' : 'bg-slate-600'}>
                    {proposal.merge_strategy}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                  <span><Brain className="w-3 h-3 inline mr-1" />{proposal.source_brain_ids?.length || 0} brains</span>
                  <span><Database className="w-3 h-3 inline mr-1" />{proposal.source_tape_ids?.length || 0} tapes</span>
                  <span><Users className="w-3 h-3 inline mr-1" />{acceptCount} accepts / {rejectCount} rejects</span>
                </div>
                
                <div className="flex gap-2">
                  {!isMyProposal && !hasVoted && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => voteMutation.mutate({ proposalId: proposal.id, accept: true })}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-3 h-3 mr-1" /> Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => voteMutation.mutate({ proposalId: proposal.id, accept: false })}
                      >
                        <X className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {hasVoted && <Badge className="bg-slate-600">Voted</Badge>}
                  {canExecute(proposal) && (
                    <Button 
                      size="sm"
                      onClick={() => executeMutation.mutate(proposal)}
                      disabled={executeMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700 ml-auto"
                    >
                      {executeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
                      Execute Merge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {(!proposals || proposals.length === 0) && (
          <div className="text-center py-6 text-slate-500">
            <GitMerge className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending merge proposals</p>
          </div>
        )}
      </div>
    </div>
  );
}