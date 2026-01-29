import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Archive, Database, User, FolderKanban, Settings, 
  GitBranch, HardDrive, Layers
} from 'lucide-react';
import TapeManager from '@/components/versioning/TapeManager';

const ENTITY_TYPES = [
  { value: 'UserProfile', label: 'User Profiles', icon: User },
  { value: 'Project', label: 'Projects', icon: FolderKanban },
  { value: 'PersonalizedCLI', label: 'CLI Configs', icon: Settings },
];

export default function VersionControlPage() {
  const [selectedType, setSelectedType] = useState('UserProfile');
  const [selectedEntityId, setSelectedEntityId] = useState(null);

  // Fetch entities of selected type
  const { data: entities = [], isLoading } = useQuery({
    queryKey: ['entities', selectedType],
    queryFn: () => base44.entities[selectedType].list('-created_date', 50),
    enabled: !!selectedType
  });

  // Fetch all registries for stats
  const { data: registries = [] } = useQuery({
    queryKey: ['allRegistries'],
    queryFn: () => base44.entities.TapeRegistry.list()
  });

  const totalTapes = registries.reduce((sum, r) => sum + (r.total_tapes || 0), 0);
  const totalSize = registries.reduce((sum, r) => sum + (r.total_size_bytes || 0), 0);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const selectedEntity = entities.find(e => e.id === selectedEntityId);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-2 border-purple-500 bg-black mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Archive className="w-5 h-5" />
              <span className="font-bold text-lg">TAPE REGISTRY</span>
              <Badge className="bg-black/30">SCXQ2</Badge>
            </div>
            <span className="text-xs">MX2LM Version Control System</span>
          </div>
          <div className="p-6 bg-gradient-to-br from-slate-900 to-black">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <Database className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-white">{registries.length}</div>
                <div className="text-xs text-slate-400">Registries</div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <Layers className="w-8 h-8 mx-auto text-cyan-400 mb-2" />
                <div className="text-2xl font-bold text-white">{totalTapes}</div>
                <div className="text-xs text-slate-400">Total Tapes</div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <HardDrive className="w-8 h-8 mx-auto text-green-400 mb-2" />
                <div className="text-2xl font-bold text-white">{formatBytes(totalSize)}</div>
                <div className="text-xs text-slate-400">Storage Used</div>
              </div>
              <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <GitBranch className="w-8 h-8 mx-auto text-orange-400 mb-2" />
                <div className="text-2xl font-bold text-white">{registries.reduce((sum, r) => sum + (r.branches?.length || 0), 0)}</div>
                <div className="text-xs text-slate-400">Branches</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entity Selector */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Select Entity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedType} onValueChange={(v) => { setSelectedType(v); setSelectedEntityId(null); }}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Entity Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="w-4 h-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="text-center py-4 text-slate-400">Loading...</div>
                  ) : entities.length === 0 ? (
                    <div className="text-center py-4 text-slate-400">No {selectedType} found</div>
                  ) : (
                    entities.map(entity => {
                      const registry = registries.find(r => r.entity_type === selectedType && r.entity_id === entity.id);
                      return (
                        <div
                          key={entity.id}
                          onClick={() => setSelectedEntityId(entity.id)}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${
                            selectedEntityId === entity.id
                              ? 'bg-purple-600/30 border border-purple-500'
                              : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-white font-medium truncate">
                                {entity.name || entity.full_name || entity.cli_name || entity.id.substring(0, 12)}
                              </div>
                              <div className="text-xs text-slate-500">
                                {new Date(entity.created_date).toLocaleDateString()}
                              </div>
                            </div>
                            {registry && (
                              <Badge className="bg-green-600 text-xs">
                                v{registry.current_version}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tape Manager */}
          <div className="lg:col-span-2">
            <TapeManager 
              entityType={selectedType}
              entityId={selectedEntityId}
              entityName={selectedEntity?.name || selectedEntity?.full_name || selectedEntity?.cli_name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}