import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cpu, Zap, Activity, TrendingUp, Binary } from "lucide-react";
import { toast } from "sonner";

export default function CompressionInferenceEngine() {
  const [inputData, setInputData] = useState('The quick brown fox jumps over the lazy dog');
  const [compressionResult, setCompressionResult] = useState(null);
  const [trainingResult, setTrainingResult] = useState(null);

  const compressMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result } = await base44.functions.invoke('compression-inference-engine', {
        operation: 'compress',
        data,
        parameters: { ngram_size: 3, intensity: 0.941 }
      });
      return result;
    },
    onSuccess: (data) => {
      setCompressionResult(data);
      toast.success('Data compressed via inference engine');
    }
  });

  const inferenceMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result } = await base44.functions.invoke('compression-inference-engine', {
        operation: 'inference',
        data,
        parameters: {}
      });
      return result;
    },
    onSuccess: (data) => {
      setCompressionResult(data.result);
      toast.success(`Inference: ${data.latency} latency`);
    }
  });

  const trainMutation = useMutation({
    mutationFn: async (samples) => {
      const { data: result } = await base44.functions.invoke('compression-inference-engine', {
        operation: 'train',
        data: samples,
        parameters: { epochs: 5, batch_size: 16 }
      });
      return result;
    },
    onSuccess: (data) => {
      setTrainingResult(data);
      toast.success(`Training complete: ${data.final_efficiency.toFixed(1)}% efficiency`);
    }
  });

  const handleTrain = () => {
    const samples = [
      'The quick brown fox jumps over the lazy dog',
      'A journey of a thousand miles begins with a single step',
      'To be or not to be, that is the question',
      'All that glitters is not gold',
      'The early bird catches the worm'
    ];
    trainMutation.mutate(samples);
  };

  return (
    <div className="space-y-6">
      {/* Engine Header */}
      <div className="border-2 border-orange-400 bg-black">
        <div className="bg-orange-400 text-black px-4 py-2 font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            COMPRESSION CALCULUS INFERENCE ENGINE
          </div>
          <Badge className="bg-green-600">OPERATIONAL</Badge>
        </div>
        
        <div className="p-4 grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-gray-400 text-xs">OPERATIONS</div>
            <div className="text-orange-400 text-2xl font-bold">COMPRESS</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">CALCULUS</div>
            <div className="text-cyan-400 text-2xl font-bold">FOLD</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">TENSOR</div>
            <div className="text-purple-400 text-2xl font-bold">BINARY</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">N-GRAM</div>
            <div className="text-green-400 text-2xl font-bold">EXTRACT</div>
          </div>
        </div>
      </div>

      {/* Inference Interface */}
      <Card className="bg-slate-900 border-2 border-orange-400">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Binary className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-bold text-orange-400">INFERENCE OPERATIONS</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Input Data
              </label>
              <Textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder='Enter text or data to compress...'
                className="font-mono text-sm min-h-[80px] bg-black border-orange-400"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => compressMutation.mutate(inputData)}
                disabled={compressMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {compressMutation.isPending ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Compressing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Compress
                  </>
                )}
              </Button>

              <Button
                onClick={() => inferenceMutation.mutate(inputData)}
                disabled={inferenceMutation.isPending}
                variant="outline"
                className="border-cyan-400 text-cyan-400"
              >
                <Cpu className="w-4 h-4 mr-2" />
                Run Inference
              </Button>

              <Button
                onClick={handleTrain}
                disabled={trainMutation.isPending}
                variant="outline"
                className="border-green-400 text-green-400"
              >
                {trainMutation.isPending ? (
                  <>
                    <Activity className="w-4 h-4 mr-2 animate-spin" />
                    Training...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Train Model
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Display */}
      {compressionResult && (
        <Tabs defaultValue="metrics" className="bg-slate-900 border-2 border-orange-400">
          <TabsList className="bg-black border-b border-orange-400 w-full">
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="tensor">Binary Tensor</TabsTrigger>
            <TabsTrigger value="ngrams">N-Grams</TabsTrigger>
            <TabsTrigger value="css">CSS Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black p-3 rounded border border-orange-400">
                <div className="text-xs text-gray-400">Compression Ratio</div>
                <div className="text-orange-400 font-bold text-xl">
                  {compressionResult.metrics.compression_ratio}
                </div>
              </div>
              <div className="bg-black p-3 rounded border border-cyan-400">
                <div className="text-xs text-gray-400">Efficiency</div>
                <div className="text-cyan-400 font-bold text-xl">
                  {compressionResult.metrics.efficiency.toFixed(1)}%
                </div>
              </div>
              <div className="bg-black p-3 rounded border border-green-400">
                <div className="text-xs text-gray-400">Ops/Second</div>
                <div className="text-green-400 font-bold text-xl">
                  {compressionResult.metrics.operations_per_second}
                </div>
              </div>
            </div>

            <div className="mt-4 bg-black p-4 rounded border border-orange-400">
              <div className="text-sm text-gray-400 mb-2">Execution Metrics</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-orange-400">{compressionResult.metrics.execution_time}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Entropy:</span>
                  <span className="text-yellow-400">{compressionResult.metrics.entropy.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Patterns Found:</span>
                  <span className="text-cyan-400">{compressionResult.metrics.patterns_found}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tensor" className="p-4">
            <div className="bg-black p-4 rounded border border-purple-400">
              <div className="text-sm font-bold text-purple-400 mb-2">
                Binary Tensor Properties
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400">Shape:</span>
                  <span className="text-purple-400 ml-2">{compressionResult.tensor.shape.join(' × ')}</span>
                </div>
                <div>
                  <span className="text-gray-400">Rank:</span>
                  <span className="text-purple-400 ml-2">{compressionResult.tensor.rank}D</span>
                </div>
                <div>
                  <span className="text-gray-400">Type:</span>
                  <Badge className="bg-purple-600 text-xs ml-2">BINARY</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ngrams" className="p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black p-3 rounded border border-green-400 text-center">
                  <div className="text-xs text-gray-400">Unigrams</div>
                  <div className="text-green-400 font-bold text-xl">
                    {compressionResult.ngrams.unigrams}
                  </div>
                </div>
                <div className="bg-black p-3 rounded border border-yellow-400 text-center">
                  <div className="text-xs text-gray-400">Bigrams</div>
                  <div className="text-yellow-400 font-bold text-xl">
                    {compressionResult.ngrams.bigrams}
                  </div>
                </div>
                <div className="bg-black p-3 rounded border border-cyan-400 text-center">
                  <div className="text-xs text-gray-400">Trigrams</div>
                  <div className="text-cyan-400 font-bold text-xl">
                    {compressionResult.ngrams.trigrams}
                  </div>
                </div>
              </div>
              
              <div className="bg-black p-4 rounded border border-green-400">
                <div className="text-sm text-gray-400 mb-2">Total N-Grams</div>
                <div className="text-green-400 font-bold text-2xl">
                  {compressionResult.ngrams.total}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="css" className="p-4">
            <div className="space-y-3">
              <div className="bg-black p-4 rounded border border-cyan-400">
                <div className="text-sm font-bold text-cyan-400 mb-2">CSS Variables</div>
                <pre className="text-xs text-cyan-400">
                  {Object.entries(compressionResult.css_controls.variables)
                    .map(([key, value]) => `${key}: ${value};`)
                    .join('\n')}
                </pre>
              </div>

              <div className="bg-black p-4 rounded border border-cyan-400">
                <div className="text-sm font-bold text-cyan-400 mb-2">Generated Rules</div>
                <pre className="text-xs text-cyan-400">
                  {compressionResult.css_controls.rules.join('\n\n')}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Training Results */}
      {trainingResult && (
        <Card className="bg-slate-900 border-2 border-green-400">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold text-green-400">TRAINING RESULTS</h3>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-black p-3 rounded border border-green-400 text-center">
                <div className="text-xs text-gray-400">Final Efficiency</div>
                <div className="text-green-400 font-bold text-2xl">
                  {trainingResult.final_efficiency.toFixed(1)}%
                </div>
              </div>
              <div className="bg-black p-3 rounded border border-cyan-400 text-center">
                <div className="text-xs text-gray-400">Convergence</div>
                <div className="text-cyan-400 font-bold text-2xl">
                  {trainingResult.convergence.toFixed(3)}
                </div>
              </div>
              <div className="bg-black p-3 rounded border border-purple-400 text-center">
                <div className="text-xs text-gray-400">Model</div>
                <Badge className="bg-purple-600 mt-1">
                  {trainingResult.model}
                </Badge>
              </div>
            </div>

            <div className="bg-black p-4 rounded border border-green-400">
              <div className="text-sm text-gray-400 mb-2">Training Progress</div>
              <div className="space-y-2">
                {trainingResult.training_metrics.epochs.map((epoch, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-gray-400">Epoch {epoch}:</span>
                    <span className="text-green-400">
                      Loss: {trainingResult.training_metrics.loss[i].toFixed(3)} | 
                      Efficiency: {trainingResult.training_metrics.efficiency[i].toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}