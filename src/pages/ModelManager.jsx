import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Power, PowerOff, Cpu, Code, Zap, Layers } from "lucide-react";
import { toast } from "sonner";
import BatchQuantizationDialog from "@/components/models/BatchQuantizationDialog";
import ModelBuilderWizard from "@/components/bots/ModelBuilderWizard";

export default function ModelManager() {
  const [showForm, setShowForm] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    model_id: "",
    model_type: "phi-3",
    quantization: "none",
    quantization_config: {},
    tokenizer: "",
    context_length: 4096,
    parameters: "",
    capabilities: [],
    api_endpoint: "",
    is_active: true,
    config: {}
  });

  const queryClient = useQueryClient();

  const { data: models = [] } = useQuery({
    queryKey: ["hfmodels"],
    queryFn: () => base44.entities.HFModel.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.HFModel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hfmodels"] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HFModel.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hfmodels"] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HFModel.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hfmodels"] })
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.HFModel.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hfmodels"] })
  });

  const resetForm = () => {
    setFormData({
      name: "",
      model_id: "",
      model_type: "phi-3",
      quantization: "none",
      quantization_config: {},
      tokenizer: "",
      context_length: 4096,
      parameters: "",
      capabilities: [],
      api_endpoint: "",
      is_active: true,
      config: {}
    });
    setEditingModel(null);
    setShowForm(false);
  };

  const handleBatchQuantize = async (modelIds, quantization, config) => {
    for (const id of modelIds) {
      await updateMutation.mutateAsync({
        id,
        data: {
          quantization,
          quantization_config: config
        }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingModel) {
      updateMutation.mutate({ id: editingModel.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setFormData(model);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-7xl mx-auto">
        {/* Terminal Header */}
        <div className="border-2 border-green-400 bg-black mb-6">
          <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
            <span className="font-bold">$ mx2lm models --list</span>
            <span className="text-xs">[ Model Registry ]</span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-cyan-400 text-2xl mb-2">╔═══ HUGGING FACE MODELS ═══╗</div>
                <div className="text-green-400">Manage quantized models for your CLI</div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBatchDialog(true)}
                  className="border-2 border-yellow-400 text-yellow-400 px-4 py-2 hover:bg-yellow-900/30 transition"
                >
                  <Layers className="w-4 h-4 inline mr-2" />
                  BATCH
                </button>
                <button onClick={() => setShowWizard(true)} className="border-2 border-cyan-400 text-cyan-400 px-4 py-2 hover:bg-cyan-900/30 transition font-bold">
                  <Zap className="w-4 h-4 inline mr-2" />
                  BUILD_MODEL
                </button>
                <button onClick={() => setShowForm(!showForm)} className="bg-green-400 text-black px-4 py-2 hover:bg-green-300 transition font-bold">
                  <Plus className="w-4 h-4 inline mr-2" />
                  ADD_MODEL
                </button>
              </div>
            </div>
          </div>
        </div>

        {showWizard && (
          <div className="mb-8">
            <ModelBuilderWizard
              onComplete={(modelData) => {
                createMutation.mutate(modelData);
                setShowWizard(false);
                toast.success("Model created via wizard");
              }}
              onCancel={() => setShowWizard(false)}
            />
          </div>
        )}

        {showForm && (
          <Card className="mb-8 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                {editingModel ? "Edit Model" : "Add New Model"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Display Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="My Phi-3 Model"
                      className="bg-slate-900 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Model ID</label>
                    <Input
                      value={formData.model_id}
                      onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                      placeholder="microsoft/phi-3-mini-4k-instruct"
                      className="bg-slate-900 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Model Type</label>
                    <Select value={formData.model_type} onValueChange={(val) => setFormData({ ...formData, model_type: val })}>
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phi-3">Phi-3</SelectItem>
                        <SelectItem value="gemma">Gemma</SelectItem>
                        <SelectItem value="deepseek">DeepSeek</SelectItem>
                        <SelectItem value="llama">Llama</SelectItem>
                        <SelectItem value="mistral">Mistral</SelectItem>
                        <SelectItem value="qwen">Qwen</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Quantization</label>
                    <Select value={formData.quantization} onValueChange={(val) => setFormData({ ...formData, quantization: val })}>
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">Float</div>
                        <SelectItem value="none">None (FP32)</SelectItem>
                        <SelectItem value="fp16">FP16</SelectItem>
                        <SelectItem value="fp8">FP8</SelectItem>
                        <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">Integer</div>
                        <SelectItem value="int8">INT8</SelectItem>
                        <SelectItem value="int4">INT4</SelectItem>
                        <SelectItem value="int2">INT2</SelectItem>
                        <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">AWQ</div>
                        <SelectItem value="awq-4bit">AWQ 4-bit</SelectItem>
                        <SelectItem value="awq-8bit">AWQ 8-bit</SelectItem>
                        <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">GPTQ</div>
                        <SelectItem value="gptq-4bit">GPTQ 4-bit</SelectItem>
                        <SelectItem value="gptq-8bit">GPTQ 8-bit</SelectItem>
                        <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">GGUF</div>
                        <SelectItem value="gguf-q2">GGUF Q2</SelectItem>
                        <SelectItem value="gguf-q4">GGUF Q4</SelectItem>
                        <SelectItem value="gguf-q5">GGUF Q5</SelectItem>
                        <SelectItem value="gguf-q8">GGUF Q8</SelectItem>
                        <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">BitsAndBytes</div>
                        <SelectItem value="bitsandbytes-4bit">BitsAndBytes 4-bit</SelectItem>
                        <SelectItem value="bitsandbytes-8bit">BitsAndBytes 8-bit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Tokenizer</label>
                    <Input
                      value={formData.tokenizer}
                      onChange={(e) => setFormData({ ...formData, tokenizer: e.target.value })}
                      placeholder="microsoft/phi-3-mini-tokenizer"
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Context Length</label>
                    <Input
                      type="number"
                      value={formData.context_length}
                      onChange={(e) => setFormData({ ...formData, context_length: parseInt(e.target.value) })}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Parameters</label>
                    <Input
                      value={formData.parameters}
                      onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
                      placeholder="3.8B"
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">API Endpoint</label>
                    <Input
                      value={formData.api_endpoint}
                      onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                      placeholder="https://api.example.com/v1/models"
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Capabilities (comma-separated)</label>
                  <Input
                    value={formData.capabilities.join(", ")}
                    onChange={(e) => setFormData({ ...formData, capabilities: e.target.value.split(",").map(s => s.trim()) })}
                    placeholder="code, chat, instruct"
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingModel ? "Update" : "Create"} Model
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <BatchQuantizationDialog
          open={showBatchDialog}
          onClose={() => setShowBatchDialog(false)}
          models={models}
          onQuantize={handleBatchQuantize}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model) => (
            <Card key={model.id} className="bg-slate-800 border-slate-700 hover:border-blue-500 transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Code className="w-5 h-5 text-blue-400" />
                      {model.name}
                    </CardTitle>
                    <p className="text-sm text-slate-400 mt-1">{model.model_id}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => toggleActiveMutation.mutate({ id: model.id, is_active: !model.is_active })}
                    className="text-slate-400 hover:text-white"
                  >
                    {model.is_active ? <Power className="w-4 h-4 text-green-400" /> : <PowerOff className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-900 text-blue-200">
                    {model.model_type}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-900 text-purple-200">
                    {model.quantization}
                  </Badge>
                  {model.parameters && (
                    <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                      {model.parameters}
                    </Badge>
                  )}
                </div>
                {model.capabilities?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.map((cap, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                        {cap}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-sm text-slate-400">
                  Context: {model.context_length?.toLocaleString()}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(model)}
                    className="flex-1 border-slate-600 text-slate-300 hover:text-white"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(model.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {models.length === 0 && !showForm && (
          <div className="text-center py-16">
            <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No models yet</h3>
            <p className="text-slate-500 mb-4">Add your first Hugging Face model to get started</p>
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-5 h-5 mr-2" />
              Add Model
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}