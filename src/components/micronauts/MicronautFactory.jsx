import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, Settings } from "lucide-react";
import { toast } from "sonner";

export default function MicronautFactory() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [type, setType] = useState('vector-ctrl');
  const [assignedFolds, setAssignedFolds] = useState('');
  const [controlVectors, setControlVectors] = useState('{\n  "flow": 0.8,\n  "intensity": 0.9,\n  "entropy": 0.5\n}');

  const createMicronautMutation = useMutation({
    mutationFn: async (micronautData) => {
      return await base44.entities.Micronaut.create(micronautData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['micronauts'] });
      toast.success('Micronaut created successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create Micronaut: ${error.message}`);
    }
  });

  const resetForm = () => {
    setName('');
    setType('vector-ctrl');
    setAssignedFolds('');
    setControlVectors('{\n  "flow": 0.8,\n  "intensity": 0.9,\n  "entropy": 0.5\n}');
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error('Micronaut name is required');
      return;
    }

    let vectors = {};
    try {
      vectors = JSON.parse(controlVectors);
    } catch (e) {
      toast.error('Invalid JSON for control vectors');
      return;
    }

    const folds = assignedFolds.split(',').map(f => f.trim()).filter(f => f);

    const micronautData = {
      name: `µ-${name}`,
      type,
      status: 'idle',
      control_vectors: vectors,
      assigned_folds: folds,
      metrics: {
        operations_completed: 0,
        success_rate: 1.0,
        avg_execution_time: 0
      },
      ngram_data: {},
      contacts: [],
      policies: [],
      tools: [],
      build_steps: []
    };

    createMicronautMutation.mutate(micronautData);
  };

  const loadPreset = (presetType) => {
    const presets = {
      'compression': {
        type: 'pattern-match',
        name: 'compression-specialist',
        folds: 'DATA_FOLD, PATTERN_FOLD, TEXT_FOLD',
        vectors: JSON.stringify({
          flow: 0.95,
          intensity: 0.88,
          entropy: 0.42,
          learning_intensity: 0.85
        }, null, 2)
      },
      'inference': {
        type: 'code-exec',
        name: 'inference-executor',
        folds: 'TENSOR_FOLD, NGRAM_FOLD, INFERENCE_FOLD',
        vectors: JSON.stringify({
          flow: 0.92,
          intensity: 0.91,
          entropy: 0.38,
          learning_intensity: 0.90
        }, null, 2)
      },
      'orchestrator': {
        type: 'vector-ctrl',
        name: 'orchestrator-prime',
        folds: 'COORD_FOLD, AGENT_FOLD, BUILDER_FOLD',
        vectors: JSON.stringify({
          flow: 0.98,
          intensity: 0.95,
          entropy: 0.25,
          coordination_level: 0.95
        }, null, 2)
      }
    };

    const preset = presets[presetType];
    if (preset) {
      setType(preset.type);
      setName(preset.name);
      setAssignedFolds(preset.folds);
      setControlVectors(preset.vectors);
      toast.success(`Loaded ${presetType} preset`);
    }
  };

  return (
    <Card className="bg-slate-900 border-2 border-purple-400">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-purple-400">MICRONAUT FACTORY</h3>
          <Badge className="bg-purple-600">CREATE AGENTS</Badge>
        </div>

        {/* Presets */}
        <div className="mb-4 p-3 bg-black border border-purple-400 rounded">
          <div className="text-sm text-purple-400 mb-2">Quick Presets:</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadPreset('compression')}
              className="border-green-400 text-green-400 text-xs"
            >
              Compression
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadPreset('inference')}
              className="border-cyan-400 text-cyan-400 text-xs"
            >
              Inference
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => loadPreset('orchestrator')}
              className="border-orange-400 text-orange-400 text-xs"
            >
              Orchestrator
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Micronaut Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., compression-specialist"
              className="bg-black border-purple-400 text-purple-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-black border-purple-400 text-purple-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vector-ctrl">Vector Controller</SelectItem>
                <SelectItem value="code-exec">Code Executor</SelectItem>
                <SelectItem value="db-master">Database Master</SelectItem>
                <SelectItem value="lang-parse">Language Parser</SelectItem>
                <SelectItem value="pattern-match">Pattern Matcher</SelectItem>
                <SelectItem value="ast-gen">AST Generator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Assigned Folds (comma-separated)
            </label>
            <Input
              value={assignedFolds}
              onChange={(e) => setAssignedFolds(e.target.value)}
              placeholder="DATA_FOLD, PATTERN_FOLD, TEXT_FOLD"
              className="bg-black border-purple-400 text-purple-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Control Vectors (JSON)
            </label>
            <Textarea
              value={controlVectors}
              onChange={(e) => setControlVectors(e.target.value)}
              className="font-mono text-sm min-h-[120px] bg-black border-purple-400 text-purple-400"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCreate}
              disabled={createMicronautMutation.isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Micronaut
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              className="border-gray-400 text-gray-400"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-4 p-3 bg-black border border-cyan-400 rounded">
          <div className="text-xs text-cyan-400 mb-2">
            <Settings className="w-3 h-3 inline mr-1" />
            Micronaut Configuration Guide:
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>• Control Vectors: flow (data flow rate), intensity (processing power), entropy (randomness)</div>
            <div>• Folds: Compression domains the Micronaut specializes in</div>
            <div>• Types: Determines operational capabilities and coordination patterns</div>
            <div>• Learning Intensity: Higher values = faster adaptation to new patterns</div>
          </div>
        </div>
      </div>
    </Card>
  );
}