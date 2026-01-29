import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, GitCompare, ArrowRight, Loader2, Check, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

const tapeManager = async (payload) => base44.functions.invoke('tapeManager', payload);

export default function BranchCompare({ entityType, entityId, branches = [] }) {
  const [branch1, setBranch1] = useState('');
  const [branch2, setBranch2] = useState('');
  const [comparison, setComparison] = useState(null);

  const compareMutation = useMutation({
    mutationFn: async () => {
      const res = await tapeManager({ 
        action: 'compareBranches', 
        entityType, 
        entityId, 
        branch1, 
        branch2 
      });
      return res.data;
    },
    onSuccess: (data) => {
      setComparison(data);
    },
    onError: (err) => toast.error(err.message)
  });

  const handleCompare = () => {
    if (branch1 && branch2 && branch1 !== branch2) {
      compareMutation.mutate();
    }
  };

  return (
    <div className="space-y-4">
      {/* Branch Selector */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-cyan-400" />
            Compare Branches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Select value={branch1} onValueChange={setBranch1}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white flex-1">
                <SelectValue placeholder="Base branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map(b => (
                  <SelectItem key={b.name} value={b.name}>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-3 h-3" />
                      {b.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <ArrowRight className="w-5 h-5 text-slate-500" />
            
            <Select value={branch2} onValueChange={setBranch2}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white flex-1">
                <SelectValue placeholder="Compare branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.filter(b => b.name !== branch1).map(b => (
                  <SelectItem key={b.name} value={b.name}>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-3 h-3" />
                      {b.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleCompare}
              disabled={!branch1 || !branch2 || branch1 === branch2 || compareMutation.isPending}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {compareMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Compare'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparison && (
        <Card className="bg-slate-900 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400 text-lg">
              {comparison.branch1.name} vs {comparison.branch2.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                <div className="text-2xl font-bold text-green-400">+{comparison.ahead}</div>
                <div className="text-xs text-slate-400">ahead</div>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg">
                {comparison.commonAncestor ? (
                  <>
                    <div className="text-sm font-mono text-white">{comparison.commonAncestor.checksum}</div>
                    <div className="text-xs text-slate-400">common ancestor</div>
                  </>
                ) : (
                  <div className="text-xs text-slate-400">no common ancestor</div>
                )}
              </div>
              <div className="p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                <div className="text-2xl font-bold text-red-400">-{comparison.behind}</div>
                <div className="text-xs text-slate-400">behind</div>
              </div>
            </div>

            {/* Branch Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-white">{comparison.branch1.name}</span>
                  <Badge className="bg-purple-600 text-xs">v{comparison.branch1.latestVersion}</Badge>
                </div>
                <div className="text-xs text-slate-400 mb-2">{comparison.branch1.totalTapes} total tapes</div>
                {comparison.branch1.uniqueTapes.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {comparison.branch1.uniqueTapes.map(t => (
                      <div key={t.id} className="flex items-center gap-2 text-xs p-1 bg-green-900/20 rounded">
                        <Plus className="w-3 h-3 text-green-400" />
                        <span className="text-green-300">v{t.version}</span>
                        <span className="text-slate-400 truncate">{t.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  <span className="font-medium text-white">{comparison.branch2.name}</span>
                  <Badge className="bg-cyan-600 text-xs">v{comparison.branch2.latestVersion}</Badge>
                </div>
                <div className="text-xs text-slate-400 mb-2">{comparison.branch2.totalTapes} total tapes</div>
                {comparison.branch2.uniqueTapes.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {comparison.branch2.uniqueTapes.map(t => (
                      <div key={t.id} className="flex items-center gap-2 text-xs p-1 bg-cyan-900/20 rounded">
                        <Plus className="w-3 h-3 text-cyan-400" />
                        <span className="text-cyan-300">v{t.version}</span>
                        <span className="text-slate-400 truncate">{t.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content Diff */}
            {comparison.contentDiff && (
              <div className="p-4 bg-black rounded-lg border border-slate-700">
                <div className="text-sm font-medium text-white mb-3">Content Differences (Latest)</div>
                <div className="font-mono text-xs space-y-2 max-h-48 overflow-y-auto">
                  {Object.keys(comparison.contentDiff.added).length > 0 && (
                    <div>
                      {Object.entries(comparison.contentDiff.added).map(([key]) => (
                        <div key={key} className="text-green-400">+ {key}</div>
                      ))}
                    </div>
                  )}
                  {Object.keys(comparison.contentDiff.removed).length > 0 && (
                    <div>
                      {Object.entries(comparison.contentDiff.removed).map(([key]) => (
                        <div key={key} className="text-red-400">- {key}</div>
                      ))}
                    </div>
                  )}
                  {Object.keys(comparison.contentDiff.changed).length > 0 && (
                    <div>
                      {Object.entries(comparison.contentDiff.changed).map(([key]) => (
                        <div key={key} className="text-yellow-400">~ {key}</div>
                      ))}
                    </div>
                  )}
                  {Object.keys(comparison.contentDiff.added).length === 0 && 
                   Object.keys(comparison.contentDiff.removed).length === 0 && 
                   Object.keys(comparison.contentDiff.changed).length === 0 && (
                    <div className="text-slate-500">No content differences</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}