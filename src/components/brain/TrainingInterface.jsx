import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Play, Save, Database, Activity } from "lucide-react";
import { toast } from "sonner";
import TrainingProgressChart from "./TrainingProgressChart";

export default function TrainingInterface() {
  const queryClient = useQueryClient();
  const [modelName, setModelName] = useState('scxq2-model-' + Date.now());
  const [epochs, setEpochs] = useState(10);
  const [batchSize, setBatchSize] = useState(16);
  const [learningRate, setLearningRate] = useState(0.01);
  const [dataset, setDataset] = useState('');
  const [datasetType, setDatasetType] = useState('text');
  const [trainingProgress, setTrainingProgress] = useState(null);

  const { data: models } = useQuery({
    queryKey: ['compression-models'],
    queryFn: async () => {
      const data = await base44.entities.CompressionModel.list();
      return data;
    }
  });

  const trainMutation = useMutation({
    mutationFn: async ({ samples, config }) => {
      const { data: result } = await base44.functions.invoke('compression-inference-engine', {
        operation: 'train',
        data: samples,
        parameters: {
          ...config,
          save_model: true
        }
      });
      return result;
    },
    onSuccess: (data) => {
      setTrainingProgress(data);
      queryClient.invalidateQueries({ queryKey: ['compression-models'] });
      toast.success(`Training complete: ${data.final_efficiency.toFixed(1)}% efficiency`);
    }
  });

  const handleStartTraining = () => {
    if (!dataset.trim()) {
      toast.error('Please provide training data');
      return;
    }

    let samples = [];
    if (datasetType === 'text') {
      samples = dataset.split('\n').filter(line => line.trim().length > 0);
    } else {
      try {
        samples = JSON.parse(dataset);
        if (!Array.isArray(samples)) {
          samples = [samples];
        }
      } catch (e) {
        toast.error('Invalid JSON format');
        return;
      }
    }

    if (samples.length === 0) {
      toast.error('No valid samples found');
      return;
    }

    trainMutation.mutate({
      samples,
      config: {
        model_name: modelName,
        epochs: parseInt(epochs),
        batch_size: parseInt(batchSize),
        learning_rate: parseFloat(learningRate)
      }
    });
  };

  const setActiveModelMutation = useMutation({
    mutationFn: async (modelId) => {
      // Deactivate all models first
      const allModels = await base44.entities.CompressionModel.list();
      await Promise.all(
        allModels.map(m => base44.entities.CompressionModel.update(m.id, { is_active: false }))
      );
      // Activate selected model
      await base44.entities.CompressionModel.update(modelId, { is_active: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compression-models'] });
      toast.success('Active model updated');
    }
  });

  const loadSampleDataset = (type) => {
    const samples = {
      text: [
        'The quick brown fox jumps over the lazy dog',
        'A journey of a thousand miles begins with a single step',
        'To be or not to be, that is the question',
        'All that glitters is not gold',
        'The early bird catches the worm'
      ].join('\n'),
      json: JSON.stringify([
        { text: 'Sample data 1', value: 100 },
        { text: 'Sample data 2', value: 200 },
        { text: 'Sample data 3', value: 300 }
      ], null, 2),
      code: [
        'function compress(data) { return data.reduce(); }',
        'const pattern = /[a-z]+/gi;',
        'for (let i = 0; i < n; i++) { process(i); }'
      ].join('\n')
    };
    
    setDataset(samples[type] || samples.text);
    setDatasetType(type === 'json' ? 'json' : 'text');
  };

  return (
    <div className="space-y-6">
      {/* Training Configuration */}
      <Card className="bg-slate-900 border-2 border-orange-400">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-bold text-orange-400">TRAINING CONFIGURATION</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Model Name</label>
              <Input
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="bg-black border-orange-400 text-orange-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Dataset Type</label>
              <Select value={datasetType} onValueChange={setDatasetType}>
                <SelectTrigger className="bg-black border-orange-400 text-orange-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Epochs</label>
              <Input
                type="number"
                value={epochs}
                onChange={(e) => setEpochs(e.target.value)}
                min="1"
                max="100"
                className="bg-black border-orange-400 text-orange-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Batch Size</label>
              <Input
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                min="1"
                max="128"
                className="bg-black border-orange-400 text-orange-400"
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm text-gray-400 mb-2 block">Learning Rate</label>
              <Input
                type="number"
                value={learningRate}
                onChange={(e) => setLearningRate(e.target.value)}
                step="0.001"
                min="0.001"
                max="0.1"
                className="bg-black border-orange-400 text-orange-400"
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-400">Training Dataset</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadSampleDataset('text')}
                  className="border-green-400 text-green-400 text-xs"
                >
                  Load Text
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadSampleDataset('json')}
                  className="border-cyan-400 text-cyan-400 text-xs"
                >
                  Load JSON
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadSampleDataset('code')}
                  className="border-purple-400 text-purple-400 text-xs"
                >
                  Load Code
                </Button>
              </div>
            </div>
            <Textarea
              value={dataset}
              onChange={(e) => setDataset(e.target.value)}
              placeholder="Enter training data (one sample per line for text, or JSON array)"
              className="font-mono text-sm min-h-[120px] bg-black border-orange-400 text-orange-400"
            />
          </div>

          <Button
            onClick={handleStartTraining}
            disabled={trainMutation.isPending}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {trainMutation.isPending ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-spin" />
                Training in Progress...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Training
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Training Progress */}
      {trainingProgress && (
        <TrainingProgressChart trainingData={trainingProgress} />
      )}

      {/* Saved Models */}
      <Card className="bg-slate-900 border-2 border-green-400">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Save className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-bold text-green-400">TRAINED MODELS</h3>
            <Badge className="bg-green-600">{models?.length || 0}</Badge>
          </div>

          <div className="space-y-3">
            {models && models.length > 0 ? (
              models.map((model) => (
                <div
                  key={model.id}
                  className="bg-black p-4 rounded border border-green-400"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-green-400 font-bold">{model.name}</div>
                      <div className="text-xs text-gray-400">{model.version}</div>
                    </div>
                    <div className="flex gap-2">
                      {model.is_active && (
                        <Badge className="bg-green-600">ACTIVE</Badge>
                      )}
                      {!model.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveModelMutation.mutate(model.id)}
                          className="border-green-400 text-green-400 text-xs"
                        >
                          Set Active
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Efficiency:</span>
                      <span className="text-green-400 ml-2">
                        {model.final_efficiency?.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Convergence:</span>
                      <span className="text-cyan-400 ml-2">
                        {model.convergence_score?.toFixed(3)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Epochs:</span>
                      <span className="text-yellow-400 ml-2">
                        {model.training_config?.epochs}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm text-center py-8">
                No trained models yet. Train your first model above.
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}