import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Play, Copy, Download, Settings } from "lucide-react";

export default function CLIPlayground() {
  const [selectedModel, setSelectedModel] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: models = [] } = useQuery({
    queryKey: ["hfmodels"],
    queryFn: () => base44.entities.HFModel.list()
  });

  const activeModels = models.filter(m => m.is_active);

  const handleRun = async () => {
    if (!input.trim() || !selectedModel) return;
    
    setLoading(true);
    setOutput("Processing...\n\n");
    
    // Simulate CLI output
    setTimeout(() => {
      const model = models.find(m => m.id === selectedModel);
      setOutput(`> CLI Command Executed
> Model: ${model?.name}
> Model ID: ${model?.model_id}
> Quantization: ${model?.quantization}
> Context Length: ${model?.context_length}

Output:
${input}

[Simulated response - Connect your actual CLI API to see real results]`);
      setLoading(false);
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  const handleDownloadConfig = () => {
    const model = models.find(m => m.id === selectedModel);
    const config = {
      model_id: model?.model_id,
      quantization: model?.quantization,
      tokenizer: model?.tokenizer,
      context_length: model?.context_length,
      api_endpoint: model?.api_endpoint
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${model?.name.replace(/\s+/g, "-")}-config.json`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Terminal className="w-10 h-10 text-purple-400" />
            CLI Playground
          </h1>
          <p className="text-slate-400 mt-2">Test your models and generate CLI configurations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Input</span>
                <div className="flex gap-2">
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-64 bg-slate-900 border-slate-600 text-white">
                      <SelectValue placeholder="Select model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.quantization})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedModel && (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleDownloadConfig}
                      className="border-slate-600 text-slate-300"
                      title="Download config"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your prompt or command here..."
                className="min-h-[400px] bg-slate-900 border-slate-600 text-white font-mono"
              />
              <Button
                onClick={handleRun}
                disabled={!selectedModel || !input.trim() || loading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Play className="w-5 h-5 mr-2" />
                {loading ? "Running..." : "Run"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Output</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopy}
                  disabled={!output}
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] bg-slate-900 border border-slate-600 rounded-lg p-4 text-slate-300 font-mono text-sm whitespace-pre-wrap overflow-auto">
                {output || "Output will appear here..."}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Quick Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300">
              <div className="text-slate-400 mb-2"># Install CLI from npm:</div>
              <div className="text-green-400">npm install -g your-cli-tool</div>
              
              <div className="text-slate-400 mt-4 mb-2"># Or clone from GitHub:</div>
              <div className="text-green-400">git clone https://github.com/your/repo.git</div>
              
              <div className="text-slate-400 mt-4 mb-2"># Configure with generated config:</div>
              <div className="text-green-400">cli-tool config --file model-config.json</div>
              
              <div className="text-slate-400 mt-4 mb-2"># Run with selected model:</div>
              <div className="text-green-400">cli-tool run --model phi-3-mini-q4</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}