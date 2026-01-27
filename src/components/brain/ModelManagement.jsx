import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Trash2, Download, CheckCircle, GitCompare } from "lucide-react";
import { toast } from "sonner";
import ModelComparison from "./ModelComparison";

export default function ModelManagement() {
  const queryClient = useQueryClient();
  const [selectedModels, setSelectedModels] = useState([]);

  const { data: models } = useQuery({
    queryKey: ['compression-models'],
    queryFn: async () => {
      const data = await base44.entities.CompressionModel.list('-created_date');
      return data;
    }
  });

  const deleteModelMutation = useMutation({
    mutationFn: async (modelId) => {
      const { data } = await base44.functions.invoke('compression-inference-engine', {
        operation: 'delete_model',
        parameters: { model_id: modelId }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compression-models'] });
      toast.success('Model deleted');
    }
  });

  const setActiveModelMutation = useMutation({
    mutationFn: async (modelId) => {
      const allModels = await base44.entities.CompressionModel.list();
      await Promise.all(
        allModels.map(m => base44.entities.CompressionModel.update(m.id, { is_active: false }))
      );
      await base44.entities.CompressionModel.update(modelId, { is_active: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compression-models'] });
      toast.success('Active model updated');
    }
  });

  const exportModelMutation = useMutation({
    mutationFn: async (modelId) => {
      const { data } = await base44.functions.invoke('compression-inference-engine', {
        operation: 'export_model',
        parameters: { model_id: modelId }
      });
      return data;
    },
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data.export_package, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.download_name;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Model exported');
    }
  });

  const toggleModelSelection = (modelId) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  return (
    <Card className="bg-slate-900 border-2 border-green-400">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-green-400">MODEL MANAGEMENT</h3>
            <Badge className="bg-green-600">{models?.length || 0} MODELS</Badge>
          </div>
          {selectedModels.length >= 2 && (
            <Badge className="bg-cyan-600">
              {selectedModels.length} SELECTED FOR COMPARISON
            </Badge>
          )}
        </div>

        <Tabs defaultValue="list">
          <TabsList className="bg-black border border-green-400 mb-4">
            <TabsTrigger value="list">Model List</TabsTrigger>
            <TabsTrigger value="compare" disabled={selectedModels.length < 2}>
              Compare ({selectedModels.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <div className="space-y-3">
              {models && models.length > 0 ? (
                models.map((model) => (
                  <div
                    key={model.id}
                    className={`bg-black p-4 rounded border-2 transition-all ${
                      selectedModels.includes(model.id) 
                        ? 'border-cyan-400 bg-cyan-950' 
                        : 'border-green-400'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedModels.includes(model.id)}
                          onChange={() => toggleModelSelection(model.id)}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="text-green-400 font-bold">{model.name}</div>
                          <div className="text-xs text-gray-400">{model.version}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {model.is_active && (
                          <Badge className="bg-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            ACTIVE
                          </Badge>
                        )}
                        <Badge className="bg-purple-600">{model.model_type}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-3 text-xs">
                      <div className="bg-slate-900 p-2 rounded border border-green-400">
                        <div className="text-gray-400">Efficiency</div>
                        <div className="text-green-400 font-bold">
                          {model.final_efficiency?.toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded border border-cyan-400">
                        <div className="text-gray-400">Convergence</div>
                        <div className="text-cyan-400 font-bold">
                          {model.convergence_score?.toFixed(3)}
                        </div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded border border-yellow-400">
                        <div className="text-gray-400">Epochs</div>
                        <div className="text-yellow-400 font-bold">
                          {model.training_config?.epochs}
                        </div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded border border-purple-400">
                        <div className="text-gray-400">Dataset</div>
                        <div className="text-purple-400 font-bold">
                          {model.training_config?.dataset_size}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!model.is_active && (
                        <Button
                          size="sm"
                          onClick={() => setActiveModelMutation.mutate(model.id)}
                          className="bg-green-600 hover:bg-green-700 text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Set Active
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => exportModelMutation.mutate(model.id)}
                        className="border-cyan-400 text-cyan-400 text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Delete this model?')) {
                            deleteModelMutation.mutate(model.id);
                          }
                        }}
                        className="border-red-400 text-red-400 text-xs"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm text-center py-8">
                  No trained models yet. Train your first model in the Training Interface.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="compare">
            {selectedModels.length >= 2 && (
              <ModelComparison modelIds={selectedModels} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}