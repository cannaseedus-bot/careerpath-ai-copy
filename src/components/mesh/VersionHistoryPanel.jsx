import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitCommit, GitMerge, Brain, Database, Globe, User, Clock } from 'lucide-react';

export default function VersionHistoryPanel({ nodeId }) {
  const { data: versions } = useQuery({
    queryKey: ['versionHistory'],
    queryFn: () => base44.entities.MeshVersionHistory.list('-created_date', 50)
  });

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const myVersions = versions?.filter(v => v.node_id === nodeId) || [];
  const networkVersions = versions?.filter(v => v.is_network_version) || [];

  return (
    <div className="space-y-4">
      {/* Network Versions */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-green-400" /> Network Versions ({networkVersions.length})
        </h3>
        <div className="space-y-2">
          {networkVersions.map(version => (
            <Card key={version.id} className="bg-slate-800/50 border-slate-700 border-l-2 border-l-green-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitMerge className="w-4 h-4 text-green-400" />
                    <span className="font-mono text-sm text-green-300">{version.version_tag}</span>
                  </div>
                  <Badge className="bg-green-600">Network</Badge>
                </div>
                {version.changelog && (
                  <p className="text-xs text-slate-400 mt-1">{version.changelog}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  <span><Brain className="w-3 h-3 inline mr-1" />{version.brain_snapshot_ids?.length || 0}</span>
                  <span><Database className="w-3 h-3 inline mr-1" />{version.tape_snapshot_ids?.length || 0}</span>
                  <span><Clock className="w-3 h-3 inline mr-1" />{formatDate(version.created_date)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* My Versions */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-cyan-400" /> My Versions ({myVersions.length})
        </h3>
        <div className="space-y-2">
          {myVersions.map(version => (
            <Card key={version.id} className="bg-slate-800/50 border-slate-700 border-l-2 border-l-cyan-500">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitCommit className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-sm text-cyan-300">{version.version_tag}</span>
                  </div>
                  {version.merge_proposal_id && <Badge className="bg-purple-600">From Merge</Badge>}
                </div>
                {version.changelog && (
                  <p className="text-xs text-slate-400 mt-1">{version.changelog}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                  <span><Brain className="w-3 h-3 inline mr-1" />{version.brain_snapshot_ids?.length || 0}</span>
                  <span><Database className="w-3 h-3 inline mr-1" />{version.tape_snapshot_ids?.length || 0}</span>
                  <span><Clock className="w-3 h-3 inline mr-1" />{formatDate(version.created_date)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Versions Timeline */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-3">
          <GitCommit className="w-4 h-4" /> All Network Activity
        </h3>
        <div className="relative pl-4 border-l border-slate-700 space-y-3">
          {versions?.slice(0, 20).map(version => (
            <div key={version.id} className="relative">
              <div className={`absolute -left-[21px] w-3 h-3 rounded-full ${version.is_network_version ? 'bg-green-500' : 'bg-slate-500'}`} />
              <div className="text-xs">
                <span className="font-mono text-slate-300">{version.version_tag}</span>
                <span className="text-slate-500 ml-2">by {version.node_id?.slice(0, 12)}...</span>
                <span className="text-slate-600 ml-2">{formatDate(version.created_date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(!versions || versions.length === 0) && (
        <div className="text-center py-8 text-slate-500">
          <GitCommit className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No version history yet</p>
        </div>
      )}
    </div>
  );
}