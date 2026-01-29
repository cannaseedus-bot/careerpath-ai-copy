import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag, Package, Rocket, Loader2, Star, Clock } from 'lucide-react';
import { toast } from 'sonner';

const tapeManager = async (payload) => base44.functions.invoke('tapeManager', payload);

const RELEASE_TYPES = [
  { value: 'stable', label: 'Stable', color: 'bg-green-600' },
  { value: 'rc', label: 'Release Candidate', color: 'bg-blue-600' },
  { value: 'beta', label: 'Beta', color: 'bg-yellow-600' },
  { value: 'alpha', label: 'Alpha', color: 'bg-orange-600' },
  { value: 'nightly', label: 'Nightly', color: 'bg-purple-600' },
];

export default function ReleaseManager({ entityType, entityId, tapes = [] }) {
  const [selectedTapeId, setSelectedTapeId] = useState('');
  const [releaseTag, setReleaseTag] = useState('');
  const [releaseType, setReleaseType] = useState('stable');
  const [releaseNotes, setReleaseNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: releasesData, isLoading } = useQuery({
    queryKey: ['releases', entityType, entityId],
    queryFn: async () => {
      const res = await tapeManager({ action: 'releases', entityType, entityId });
      return res.data;
    },
    enabled: !!entityType && !!entityId
  });

  const releaseMutation = useMutation({
    mutationFn: async () => {
      const res = await tapeManager({ 
        action: 'release', 
        tapeId: selectedTapeId, 
        releaseTag, 
        releaseType, 
        releaseNotes 
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setSelectedTapeId('');
      setReleaseTag('');
      setReleaseNotes('');
      queryClient.invalidateQueries({ queryKey: ['releases'] });
      queryClient.invalidateQueries({ queryKey: ['tapeLog'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || err.message)
  });

  const selectedTape = tapes.find(t => t.id === selectedTapeId);

  const suggestReleaseTag = () => {
    if (!selectedTape) return;
    const prefix = releaseType === 'stable' ? '' : `-${releaseType}`;
    const suffix = releaseType !== 'stable' ? '.1' : '';
    setReleaseTag(`v${selectedTape.version}${prefix}${suffix}`);
  };

  return (
    <div className="space-y-4">
      {/* Create Release */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Rocket className="w-5 h-5 text-green-400" />
            Create Release
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Source Tape</label>
              <Select value={selectedTapeId} onValueChange={(v) => { setSelectedTapeId(v); }}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue placeholder="Select tape..." />
                </SelectTrigger>
                <SelectContent>
                  {tapes.filter(t => !t.is_release).map(tape => (
                    <SelectItem key={tape.id} value={tape.id}>
                      v{tape.version} - {tape.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Release Type</label>
              <Select value={releaseType} onValueChange={setReleaseType}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELEASE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={releaseTag}
              onChange={(e) => setReleaseTag(e.target.value)}
              placeholder="Release tag (e.g., v1.0.0)"
              className="bg-slate-800 border-slate-600 text-white flex-1"
            />
            <Button 
              variant="outline" 
              onClick={suggestReleaseTag}
              disabled={!selectedTapeId}
              className="border-slate-600"
            >
              <Tag className="w-4 h-4" />
            </Button>
          </div>
          
          <Textarea
            value={releaseNotes}
            onChange={(e) => setReleaseNotes(e.target.value)}
            placeholder="Release notes / changelog..."
            className="bg-slate-800 border-slate-600 text-white min-h-[80px]"
          />
          
          <Button 
            onClick={() => releaseMutation.mutate()}
            disabled={!selectedTapeId || !releaseTag || releaseMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {releaseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Package className="w-4 h-4 mr-1" />}
            Create Release
          </Button>
        </CardContent>
      </Card>

      {/* Release List */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Releases
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-cyan-400" /></div>
          ) : !releasesData?.releases?.length ? (
            <div className="text-center py-4 text-slate-400">No releases yet</div>
          ) : (
            <div className="space-y-2">
              {releasesData.releases.map(release => {
                const typeConfig = RELEASE_TYPES.find(t => t.value === release.release_type) || RELEASE_TYPES[0];
                return (
                  <div key={release.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={typeConfig.color}>{release.release_tag}</Badge>
                        <span className="text-white font-medium">v{release.version}</span>
                        <Badge variant="outline" className="text-xs">{release.release_type}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(release.created_date).toLocaleDateString()}
                      </div>
                    </div>
                    {release.release_notes && (
                      <p className="text-sm text-slate-400 mt-2">{release.release_notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}