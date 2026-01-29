import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, Search, Star, GitFork, Download, Filter, Cpu, HardDrive,
  Tag, Loader2, Globe, TrendingUp, Clock, User, Package, Zap
} from 'lucide-react';
import { toast } from 'sonner';

const tapeManager = async (payload) => base44.functions.invoke('tapeManager', payload);

const ARCHITECTURES = ['phi-3', 'llama', 'deepseek', 'gemma', 'mistral', 'qwen', 'other'];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArch, setFilterArch] = useState('all');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedBrain, setSelectedBrain] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const queryClient = useQueryClient();

  // Fetch public brains
  const { data: brainsData, isLoading } = useQuery({
    queryKey: ['marketplaceBrains'],
    queryFn: async () => {
      const res = await tapeManager({ action: 'listBrains', publicOnly: true });
      return res.data;
    }
  });

  // Fetch ratings
  const { data: ratingsData } = useQuery({
    queryKey: ['brainRatings'],
    queryFn: () => base44.entities.BrainRating.list()
  });

  // Fork brain
  const forkMutation = useMutation({
    mutationFn: async (brainId) => {
      const res = await tapeManager({ action: 'forkBrain', brainId, entityType: 'Project', entityId: 'marketplace-fork' });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['marketplaceBrains'] });
    },
    onError: (err) => toast.error(err.message)
  });

  // Submit rating
  const rateMutation = useMutation({
    mutationFn: async ({ brainId, rating, review }) => {
      return base44.entities.BrainRating.create({ brain_id: brainId, rating, review });
    },
    onSuccess: () => {
      toast.success('Rating submitted!');
      setRatingValue(5);
      setReviewText('');
      queryClient.invalidateQueries({ queryKey: ['brainRatings'] });
    }
  });

  // Calculate average rating for a brain
  const getAverageRating = (brainId) => {
    const brainRatings = ratingsData?.filter(r => r.brain_id === brainId) || [];
    if (brainRatings.length === 0) return { avg: 0, count: 0 };
    const avg = brainRatings.reduce((sum, r) => sum + r.rating, 0) / brainRatings.length;
    return { avg: avg.toFixed(1), count: brainRatings.length };
  };

  // Filter and sort brains
  const filteredBrains = (brainsData?.brains || [])
    .filter(brain => {
      if (searchQuery && !brain.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !brain.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterArch !== 'all' && brain.model_architecture !== filterArch) return false;
      if (filterTag && !brain.tags?.includes(filterTag)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.fork_count + b.pull_count) - (a.fork_count + a.pull_count);
      if (sortBy === 'rating') return getAverageRating(b.id).avg - getAverageRating(a.id).avg;
      if (sortBy === 'newest') return new Date(b.created_date) - new Date(a.created_date);
      return 0;
    });

  // Get all unique tags
  const allTags = [...new Set((brainsData?.brains || []).flatMap(b => b.tags || []))];

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const StarRating = ({ rating, interactive = false, onChange }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
          onClick={() => interactive && onChange?.(star)}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Globe className="w-8 h-8 text-pink-400" />
              Brain Marketplace
            </h1>
            <p className="text-slate-400 mt-1">Discover and share AI brains</p>
          </div>
          <Badge className="bg-pink-600 text-lg px-4 py-2">
            {brainsData?.brains?.length || 0} Public Brains
          </Badge>
        </div>

        {/* Search & Filters */}
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search brains..."
                  className="pl-10 bg-slate-800 border-slate-600 text-white"
                />
              </div>
              <Select value={filterArch} onValueChange={setFilterArch}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                  <Cpu className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Architectures</SelectItem>
                  {ARCHITECTURES.map(arch => (
                    <SelectItem key={arch} value={arch}>{arch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTag} onValueChange={setFilterTag}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                  <Tag className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All Tags</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Brain Grid */}
        {isLoading ? (
          <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-pink-400" /></div>
        ) : filteredBrains.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No brains found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBrains.map(brain => {
              const rating = getAverageRating(brain.id);
              return (
                <Card 
                  key={brain.id} 
                  className="bg-slate-900 border-slate-700 hover:border-pink-500/50 transition-all cursor-pointer"
                  onClick={() => setSelectedBrain(brain)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white flex items-center gap-2">
                          <Brain className="w-5 h-5 text-pink-400" />
                          {brain.name}
                        </CardTitle>
                        <Badge className="bg-slate-700 mt-1">v{brain.version}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <StarRating rating={Math.round(rating.avg)} />
                        <span className="text-xs text-slate-400 ml-1">({rating.count})</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-slate-400 line-clamp-2">{brain.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {brain.model_architecture && (
                        <Badge variant="outline" className="text-xs"><Cpu className="w-3 h-3 mr-1" />{brain.model_architecture}</Badge>
                      )}
                      <Badge variant="outline" className="text-xs"><HardDrive className="w-3 h-3 mr-1" />{formatBytes(brain.size_bytes)}</Badge>
                    </div>
                    
                    <div className="flex gap-1 flex-wrap">
                      {brain.tags?.slice(0, 3).map(tag => (
                        <Badge key={tag} className="bg-slate-800 text-xs">{tag}</Badge>
                      ))}
                      {brain.tags?.length > 3 && <Badge className="bg-slate-800 text-xs">+{brain.tags.length - 3}</Badge>}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                      <div className="flex gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><GitFork className="w-3 h-3" />{brain.fork_count || 0}</span>
                        <span className="flex items-center gap-1"><Download className="w-3 h-3" />{brain.pull_count || 0}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); forkMutation.mutate(brain.id); }}
                        disabled={forkMutation.isPending}
                        className="bg-pink-600 hover:bg-pink-700 h-7"
                      >
                        <GitFork className="w-3 h-3 mr-1" /> Fork
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Brain Detail Modal */}
        <Dialog open={!!selectedBrain} onOpenChange={() => setSelectedBrain(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
            {selectedBrain && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Brain className="w-6 h-6 text-pink-400" />
                    {selectedBrain.name}
                    <Badge className="bg-pink-600 ml-2">v{selectedBrain.version}</Badge>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <p className="text-slate-300">{selectedBrain.description}</p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-800 p-3 rounded-lg text-center">
                      <GitFork className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                      <div className="text-lg font-bold">{selectedBrain.fork_count || 0}</div>
                      <div className="text-xs text-slate-400">Forks</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-lg text-center">
                      <Download className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                      <div className="text-lg font-bold">{selectedBrain.pull_count || 0}</div>
                      <div className="text-xs text-slate-400">Pulls</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-lg text-center">
                      <HardDrive className="w-5 h-5 mx-auto text-green-400 mb-1" />
                      <div className="text-lg font-bold">{formatBytes(selectedBrain.size_bytes)}</div>
                      <div className="text-xs text-slate-400">Size</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-lg text-center">
                      <Zap className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
                      <div className="text-lg font-bold">{selectedBrain.compression_ratio?.toFixed(1) || '-'}x</div>
                      <div className="text-xs text-slate-400">Compression</div>
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-slate-400">Architecture:</span> <span className="text-white ml-2">{selectedBrain.model_architecture || 'N/A'}</span></div>
                    <div><span className="text-slate-400">Quantization:</span> <span className="text-white ml-2">{selectedBrain.quantization || 'N/A'}</span></div>
                    <div><span className="text-slate-400">Type:</span> <span className="text-white ml-2">{selectedBrain.brain_type}</span></div>
                    <div><span className="text-slate-400">Created:</span> <span className="text-white ml-2">{new Date(selectedBrain.created_date).toLocaleDateString()}</span></div>
                  </div>
                  
                  {/* Tags */}
                  {selectedBrain.tags?.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {selectedBrain.tags.map(tag => (
                        <Badge key={tag} className="bg-slate-800">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Rating Section */}
                  <div className="border-t border-slate-700 pt-4">
                    <h4 className="text-sm font-medium mb-2">Rate this Brain</h4>
                    <div className="flex items-center gap-3">
                      <StarRating rating={ratingValue} interactive onChange={setRatingValue} />
                      <Input
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Optional review..."
                        className="flex-1 bg-slate-800 border-slate-600 text-white h-8"
                      />
                      <Button
                        size="sm"
                        onClick={() => rateMutation.mutate({ brainId: selectedBrain.id, rating: ratingValue, review: reviewText })}
                        disabled={rateMutation.isPending}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => { forkMutation.mutate(selectedBrain.id); setSelectedBrain(null); }}
                      disabled={forkMutation.isPending}
                      className="flex-1 bg-pink-600 hover:bg-pink-700"
                    >
                      <GitFork className="w-4 h-4 mr-2" /> Fork to Workspace
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}