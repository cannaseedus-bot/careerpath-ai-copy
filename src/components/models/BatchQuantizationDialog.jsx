import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Zap, X } from "lucide-react";

const quantizationOptions = [
  { value: "fp16", label: "FP16", category: "Float" },
  { value: "fp8", label: "FP8", category: "Float" },
  { value: "int8", label: "INT8", category: "Integer" },
  { value: "int4", label: "INT4", category: "Integer" },
  { value: "int2", label: "INT2", category: "Integer" },
  { value: "awq-4bit", label: "AWQ 4-bit", category: "AWQ" },
  { value: "awq-8bit", label: "AWQ 8-bit", category: "AWQ" },
  { value: "gptq-4bit", label: "GPTQ 4-bit", category: "GPTQ" },
  { value: "gptq-8bit", label: "GPTQ 8-bit", category: "GPTQ" },
  { value: "gguf-q2", label: "GGUF Q2", category: "GGUF" },
  { value: "gguf-q4", label: "GGUF Q4", category: "GGUF" },
  { value: "gguf-q5", label: "GGUF Q5", category: "GGUF" },
  { value: "gguf-q8", label: "GGUF Q8", category: "GGUF" },
  { value: "bitsandbytes-4bit", label: "BitsAndBytes 4-bit", category: "BnB" },
  { value: "bitsandbytes-8bit", label: "BitsAndBytes 8-bit", category: "BnB" }
];

export default function BatchQuantizationDialog({ open, onClose, models, onQuantize }) {
  const [selectedModels, setSelectedModels] = useState([]);
  const [quantization, setQuantization] = useState("int4");
  const [advancedConfig, setAdvancedConfig] = useState({
    group_size: "128",
    desc_act: false,
    sym: true,
    bits: "4"
  });

  const handleModelToggle = (modelId) => {
    setSelectedModels(prev =>
      prev.includes(modelId) ? prev.filter(id => id !== modelId) : [...prev, modelId]
    );
  };

  const handleSelectAll = () => {
    if (selectedModels.length === models.length) {
      setSelectedModels([]);
    } else {
      setSelectedModels(models.map(m => m.id));
    }
  };

  const handleQuantize = () => {
    if (selectedModels.length === 0) return;
    
    const config = {};
    if (quantization.includes("gptq") || quantization.includes("awq")) {
      config.group_size = parseInt(advancedConfig.group_size);
      config.desc_act = advancedConfig.desc_act;
      config.sym = advancedConfig.sym;
      config.bits = parseInt(advancedConfig.bits);
    }

    onQuantize(selectedModels, quantization, config);
    setSelectedModels([]);
    onClose();
  };

  const selectedCategory = quantizationOptions.find(opt => opt.value === quantization)?.category;
  const showAdvanced = ["GPTQ", "AWQ"].includes(selectedCategory);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="w-6 h-6 text-yellow-400" />
            Batch Quantization
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Model Selection */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm text-slate-300 font-medium">
                Select Models ({selectedModels.length}/{models.length})
              </label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                className="border-slate-600 text-slate-300"
              >
                {selectedModels.length === models.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="max-h-48 overflow-y-auto border border-slate-600 rounded-lg p-3 space-y-2">
              {models.map((model) => (
                <div key={model.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedModels.includes(model.id)}
                    onCheckedChange={() => handleModelToggle(model.id)}
                  />
                  <label className="text-sm text-slate-300 flex-1 cursor-pointer">
                    {model.name}
                    <span className="text-slate-500 ml-2">({model.model_type})</span>
                  </label>
                  <Badge variant="secondary" className="bg-purple-900 text-purple-200 text-xs">
                    {model.quantization}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Quantization Method */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block font-medium">
              Quantization Method
            </label>
            <Select value={quantization} onValueChange={setQuantization}>
              <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Float", "Integer", "AWQ", "GPTQ", "GGUF", "BnB"].map(category => (
                  <React.Fragment key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-slate-400">
                      {category}
                    </div>
                    {quantizationOptions
                      .filter(opt => opt.category === category)
                      .map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Configuration */}
          {showAdvanced && (
            <div className="border border-slate-600 rounded-lg p-4 space-y-4">
              <div className="text-sm text-slate-300 font-medium mb-3">
                Advanced Parameters
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Group Size</label>
                  <Input
                    type="number"
                    value={advancedConfig.group_size}
                    onChange={(e) => setAdvancedConfig({ ...advancedConfig, group_size: e.target.value })}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Bits</label>
                  <Select
                    value={advancedConfig.bits}
                    onValueChange={(val) => setAdvancedConfig({ ...advancedConfig, bits: val })}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 bits</SelectItem>
                      <SelectItem value="4">4 bits</SelectItem>
                      <SelectItem value="8">8 bits</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={advancedConfig.desc_act}
                    onCheckedChange={(checked) => setAdvancedConfig({ ...advancedConfig, desc_act: checked })}
                  />
                  <label className="text-xs text-slate-300">Desc Act</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={advancedConfig.sym}
                    onCheckedChange={(checked) => setAdvancedConfig({ ...advancedConfig, sym: checked })}
                  />
                  <label className="text-xs text-slate-300">Symmetric</label>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} className="border-slate-600">
              Cancel
            </Button>
            <Button
              onClick={handleQuantize}
              disabled={selectedModels.length === 0}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Quantize {selectedModels.length} Model{selectedModels.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}