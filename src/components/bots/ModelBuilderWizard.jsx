import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Zap } from "lucide-react";
import { toast } from "sonner";
import ClusterSelector from "@/components/shared/ClusterSelector";

const steps = [
  {
    id: "select-source",
    title: "Select Model Source",
    subtitle: "Choose where your model comes from",
    info: "Pick from Hugging Face models, OpenAI endpoints, or upload custom models"
  },
  {
    id: "configure-model",
    title: "Configure Model",
    subtitle: "Set up model parameters",
    info: "Choose quantization, context length, and capabilities"
  },
  {
    id: "compression",
    title: "Compression Settings",
    subtitle: "Optimize for performance",
    info: "Configure SCXQ2 compression and tensor sharding"
  },
  {
    id: "select-cluster",
    title: "Select Cluster",
    subtitle: "Choose deployment cluster",
    info: "Select which bot cluster system to deploy this model to"
  },
  {
    id: "review",
    title: "Review & Create",
    subtitle: "Finalize your model configuration",
    info: "Review all settings and create the model"
  }
];

export default function ModelBuilderWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [modelData, setModelData] = useState({
    name: "",
    model_id: "",
    model_type: "phi-3",
    source: "huggingface",
    quantization: "none",
    context_length: 4096,
    parameters: "3.8B",
    capabilities: [],
    compression_enabled: false,
    tensor_sharding: false,
    dataset_source: "",
    cluster_id: ""
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      if (modelData.name && modelData.model_id) {
        onComplete(modelData);
        toast.success("Model created successfully");
      } else {
        toast.error("Please fill in all required fields");
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: dir > 0 ? 45 : -45
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: dir < 0 ? 45 : -45
    })
  };

  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <Card className="bg-black border-2 border-cyan-400 overflow-hidden">
      <CardHeader className="bg-cyan-400 text-black">
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
            <p className="text-sm text-black/70 mt-1">{steps[currentStep].subtitle}</p>
          </div>
          <Badge className="bg-black text-cyan-400">Step {currentStep + 1}/{steps.length}</Badge>
        </div>
        <div className="w-full bg-black/20 rounded-full h-2">
          <div
            className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Wizard Content */}
        <div className="min-h-[400px] relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-4"
            >
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="bg-cyan-900/20 border border-cyan-400 rounded p-4 text-sm text-cyan-200">
                    {steps[currentStep].info}
                  </div>
                  <div>
                    <label className="text-cyan-400 text-sm font-semibold block mb-2">SOURCE</label>
                    <Select value={modelData.source} onValueChange={(val) => setModelData({...modelData, source: val})}>
                      <SelectTrigger className="border-cyan-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="huggingface">Hugging Face</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="ollama">Ollama</SelectItem>
                        <SelectItem value="custom">Custom Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-cyan-400 text-sm font-semibold block mb-2">MODEL ID or URL</label>
                    <Input
                      placeholder="e.g., microsoft/phi-3-mini or direct GGUF URL"
                      value={modelData.model_id}
                      onChange={(e) => setModelData({...modelData, model_id: e.target.value})}
                      className="border-cyan-400"
                    />
                  </div>
                  
                  {/* Preset Models */}
                  {modelData.source === 'huggingface' && (
                    <div className="bg-slate-900 rounded p-4">
                      <div className="text-cyan-400 text-xs font-semibold mb-3 uppercase">PRESET MODELS</div>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setModelData({...modelData, model_id: 'https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q2_K.gguf?download=true', name: 'Phi-2 Q2_K (1GB)'})}
                          className="w-full text-left text-xs border border-cyan-400 p-2 hover:bg-cyan-900/20 rounded text-cyan-300"
                        >
                          <div className="font-semibold">Phi-2 Q2_K (1GB)</div>
                          <div className="text-gray-400 text-xs mt-1">Lightweight, fast inference</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setModelData({...modelData, model_id: 'https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q8_0.gguf?download=true', name: 'Phi-2 Q8_0 (3GB)'})}
                          className="w-full text-left text-xs border border-cyan-400 p-2 hover:bg-cyan-900/20 rounded text-cyan-300"
                        >
                          <div className="font-semibold">Phi-2 Q8_0 (3GB)</div>
                          <div className="text-gray-400 text-xs mt-1">Higher quality, more VRAM needed</div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-cyan-900/20 border border-cyan-400 rounded p-4 text-sm text-cyan-200">
                    {steps[currentStep].info}
                  </div>
                  <div>
                    <label className="text-cyan-400 text-sm font-semibold block mb-2">MODEL NAME</label>
                    <Input
                      placeholder="My Custom Model"
                      value={modelData.name}
                      onChange={(e) => setModelData({...modelData, name: e.target.value})}
                      className="border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-cyan-400 text-sm font-semibold block mb-2">MODEL TYPE</label>
                    <Select value={modelData.model_type} onValueChange={(val) => setModelData({...modelData, model_type: val})}>
                      <SelectTrigger className="border-cyan-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phi-3">Phi-3</SelectItem>
                        <SelectItem value="gemma">Gemma</SelectItem>
                        <SelectItem value="llama">Llama</SelectItem>
                        <SelectItem value="mistral">Mistral</SelectItem>
                        <SelectItem value="deepseek">DeepSeek</SelectItem>
                        <SelectItem value="qwen">Qwen</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-cyan-400 text-sm font-semibold block mb-2">PARAMETERS</label>
                    <Select value={modelData.parameters} onValueChange={(val) => setModelData({...modelData, parameters: val})}>
                      <SelectTrigger className="border-cyan-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3.8B">3.8B</SelectItem>
                        <SelectItem value="7B">7B</SelectItem>
                        <SelectItem value="14B">14B</SelectItem>
                        <SelectItem value="70B">70B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-cyan-900/20 border border-cyan-400 rounded p-4 text-sm text-cyan-200">
                    {steps[currentStep].info}
                  </div>
                  <div>
                    <label className="text-cyan-400 text-sm font-semibold block mb-2">QUANTIZATION</label>
                    <Select value={modelData.quantization} onValueChange={(val) => setModelData({...modelData, quantization: val})}>
                      <SelectTrigger className="border-cyan-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Full Precision)</SelectItem>
                        <SelectItem value="fp16">FP16</SelectItem>
                        <SelectItem value="int8">INT8</SelectItem>
                        <SelectItem value="int4">INT4</SelectItem>
                        <SelectItem value="awq-4bit">AWQ 4-bit</SelectItem>
                        <SelectItem value="gptq-4bit">GPTQ 4-bit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-cyan-400 text-sm font-semibold block mb-2">CONTEXT LENGTH</label>
                    <Select value={modelData.context_length.toString()} onValueChange={(val) => setModelData({...modelData, context_length: parseInt(val)})}>
                      <SelectTrigger className="border-cyan-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2048">2048</SelectItem>
                        <SelectItem value="4096">4096</SelectItem>
                        <SelectItem value="8192">8192</SelectItem>
                        <SelectItem value="16384">16384</SelectItem>
                        <SelectItem value="32768">32768</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-cyan-400 text-sm font-semibold flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={modelData.compression_enabled}
                        onChange={(e) => setModelData({...modelData, compression_enabled: e.target.checked})}
                        className="w-4 h-4"
                      />
                      Enable SCXQ2 Compression
                    </label>
                    <label className="text-cyan-400 text-sm font-semibold flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={modelData.tensor_sharding}
                        onChange={(e) => setModelData({...modelData, tensor_sharding: e.target.checked})}
                        className="w-4 h-4"
                      />
                      Enable Tensor Sharding
                    </label>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <label className="text-cyan-400 text-sm font-semibold block mb-2">TRAINING DATASET (OPTIONAL)</label>
                    <Select value={modelData.dataset_source} onValueChange={(val) => setModelData({...modelData, dataset_source: val})}>
                      <SelectTrigger className="border-cyan-400">
                        <SelectValue placeholder="Select or skip" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>None</SelectItem>
                        <SelectItem value="ultrachat_200k">UltraChat 200K</SelectItem>
                        <SelectItem value="llama3.2-1b">Llama 3.2 1B (1.5GB)</SelectItem>
                        <SelectItem value="llama3.2-3b">Llama 3.2 3B (766MB)</SelectItem>
                        <SelectItem value="magpie-dpo">Magpie Pro DPO (171MB)</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-gray-400 mt-2 space-y-1">
                      {modelData.dataset_source === 'ultrachat_200k' && (
                        <div>📦 HuggingFaceH4/ultrachat_200k</div>
                      )}
                      {modelData.dataset_source === 'llama3.2-1b' && (
                        <div>📦 HuggingFaceH4/Llama-3.2-1B-Instruct-best-of-N-completions</div>
                      )}
                      {modelData.dataset_source === 'llama3.2-3b' && (
                        <div>📦 HuggingFaceH4/Llama-3.2-3B-Instruct-best-of-N-completions</div>
                      )}
                      {modelData.dataset_source === 'magpie-dpo' && (
                        <div>📦 HuggingFaceH4/Magpie-Pro-DPO-100K-v0.1-Prompts</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-cyan-900/20 border border-cyan-400 rounded p-4 text-sm text-cyan-200">
                    {steps[currentStep].info}
                  </div>
                  <ClusterSelector 
                    value={modelData.cluster_id} 
                    onChange={(id) => setModelData({ ...modelData, cluster_id: id })}
                    label="Select a cluster"
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-cyan-900/20 border border-cyan-400 rounded p-4 text-sm text-cyan-200">
                    {steps[currentStep].info}
                  </div>
                  <div className="bg-slate-900 rounded p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-cyan-400 font-semibold">{modelData.name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Model ID:</span>
                      <span className="text-cyan-400 font-semibold">{modelData.model_id || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Source:</span>
                      <span className="text-cyan-400 font-semibold uppercase">{modelData.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-cyan-400 font-semibold uppercase">{modelData.model_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantization:</span>
                      <span className="text-cyan-400 font-semibold">{modelData.quantization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Context:</span>
                      <span className="text-cyan-400 font-semibold">{modelData.context_length.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Compression:</span>
                      <span className="text-cyan-400 font-semibold">{modelData.compression_enabled ? "Enabled" : "Disabled"}</span>
                    </div>
                    {modelData.dataset_source && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dataset:</span>
                        <span className="text-cyan-400 font-semibold">{modelData.dataset_source}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cluster:</span>
                      <span className="text-cyan-400 font-semibold">{modelData.cluster_id ? "Selected" : "Not selected"}</span>
                    </div>
                    </div>
                    </div>
                    )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between mt-8 border-t border-gray-700 pt-4">
          <div className="flex gap-2">
            <Button
              onClick={handleBack}
              disabled={currentStep === 0}
              variant="outline"
              className="border-gray-600 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              BACK
            </Button>
            <Button
              onClick={onCancel}
              variant="outline"
              className="border-red-400 text-red-400 hover:bg-red-900/30"
            >
              CANCEL
            </Button>
          </div>
          <Button
            onClick={handleNext}
            className="bg-cyan-400 text-black hover:bg-cyan-300"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                CREATE_MODEL
              </>
            ) : (
              <>
                NEXT
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}