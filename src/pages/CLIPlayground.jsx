import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, Play, Copy, Download, Settings, FileArchive, Zap, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { exportCliConfig } from "@/functions/export-cli-config";
import { toast } from "sonner";

export default function CLIPlayground() {
  const [selectedModel, setSelectedModel] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [logs, setLogs] = useState([]);
  const [parameters, setParameters] = useState({
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 0.9,
    frequency_penalty: 0,
    presence_penalty: 0
  });
  const outputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const { data: models = [] } = useQuery({
    queryKey: ["hfmodels"],
    queryFn: () => base44.entities.HFModel.list()
  });

  const activeModels = models.filter(m => m.is_active);

  const addLog = (type, message, duration = null) => {
    const newLog = {
      id: Date.now(),
      type,
      message,
      duration,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleRun = async () => {
    if (!input.trim() || !selectedModel) return;
    
    const model = models.find(m => m.id === selectedModel);
    setLoading(true);
    setStreaming(true);
    setOutput("");
    
    const startTime = Date.now();
    addLog("info", `Starting request to ${model?.name}`, null);
    addLog("info", `Parameters: temp=${parameters.temperature}, max_tokens=${parameters.max_tokens}`, null);
    
    abortControllerRef.current = new AbortController();

    try {
      // Simulate streaming response
      const response = `Based on your prompt: "${input}"

This is a simulated streaming response from ${model?.name} (${model?.quantization}).

Key Information:
- Model ID: ${model?.model_id}
- Context Length: ${model?.context_length}
- Quantization: ${model?.quantization}
- Parameters: ${model?.parameters}

The model would process your request and generate a contextual response here. Connect your actual API endpoint to see real inference results.

To integrate:
1. Set API endpoint in Model Manager
2. Configure authentication
3. Map request/response formats
4. Deploy and test

Ready to deploy your quantized models!`;

      // Stream character by character
      let currentOutput = "";
      for (let i = 0; i < response.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          addLog("warning", "Request cancelled by user", Date.now() - startTime);
          break;
        }
        currentOutput += response[i];
        setOutput(currentOutput);
        
        // Scroll to bottom
        if (outputRef.current) {
          outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
        
        await new Promise(resolve => setTimeout(resolve, 20));
      }
      
      const duration = Date.now() - startTime;
      addLog("success", `Request completed successfully`, duration);
      addLog("info", `Tokens: ~${Math.floor(response.length / 4)} | Latency: ${duration}ms`, null);
      
    } catch (error) {
      addLog("error", `Error: ${error.message}`, Date.now() - startTime);
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStreaming(false);
      setLoading(false);
      addLog("warning", "Request stopped by user", null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Output copied to clipboard");
  };

  const handleCopyCommand = () => {
    const model = models.find(m => m.id === selectedModel);
    const command = `mx2lm run --model "${model?.model_id}" --quantization ${model?.quantization} --temp ${parameters.temperature} --max-tokens ${parameters.max_tokens} --prompt "${input}"`;
    navigator.clipboard.writeText(command);
    toast.success("Command copied to clipboard");
  };

  const handleClearLogs = () => {
    setLogs([]);
    toast.success("Logs cleared");
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

  const handleExportAll = async () => {
    try {
      const { data } = await exportCliConfig();
      const blob = new Blob([data], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cli-config-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export configurations');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Terminal className="w-10 h-10 text-purple-400" />
              CLI Playground
            </h1>
            <p className="text-slate-400 mt-2">Test your models and generate CLI configurations</p>
          </div>
          <Button onClick={handleExportAll} className="bg-blue-600 hover:bg-blue-700">
            <FileArchive className="w-5 h-5 mr-2" />
            Export All CLI Files
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Input Panel */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Input</span>
                <div className="flex gap-2">
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-48 bg-slate-900 border-slate-600 text-white">
                      <SelectValue placeholder="Select model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {activeModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your prompt or command here..."
                className="min-h-[300px] bg-slate-900 border-slate-600 text-white font-mono text-sm"
              />
              
              {/* Model Parameters */}
              {selectedModel && (
                <div className="space-y-3 p-4 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="text-sm text-slate-300 font-semibold mb-2">Model Parameters</div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Temperature</span>
                        <span>{parameters.temperature}</span>
                      </div>
                      <Slider
                        value={[parameters.temperature]}
                        onValueChange={(val) => setParameters({...parameters, temperature: val[0]})}
                        min={0}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Max Tokens</span>
                        <span>{parameters.max_tokens}</span>
                      </div>
                      <Slider
                        value={[parameters.max_tokens]}
                        onValueChange={(val) => setParameters({...parameters, max_tokens: val[0]})}
                        min={128}
                        max={4096}
                        step={128}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Top P</span>
                        <span>{parameters.top_p}</span>
                      </div>
                      <Slider
                        value={[parameters.top_p]}
                        onValueChange={(val) => setParameters({...parameters, top_p: val[0]})}
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                {streaming ? (
                  <Button
                    onClick={handleStop}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Stop
                  </Button>
                ) : (
                  <Button
                    onClick={handleRun}
                    disabled={!selectedModel || !input.trim() || loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Run
                  </Button>
                )}
                {selectedModel && input.trim() && (
                  <Button
                    onClick={handleCopyCommand}
                    variant="outline"
                    className="border-slate-600 text-slate-300"
                    title="Copy CLI command"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  Output
                  {streaming && <Badge className="bg-green-600 animate-pulse">Streaming</Badge>}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCopy}
                    disabled={!output}
                    className="text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {selectedModel && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleDownloadConfig}
                      className="text-slate-400 hover:text-white"
                      title="Download config"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                ref={outputRef}
                className="min-h-[500px] max-h-[500px] bg-slate-900 border border-slate-600 rounded-lg p-4 text-slate-300 font-mono text-sm whitespace-pre-wrap overflow-auto"
              >
                {output || "Output will appear here..."}
              </div>
              {output && (
                <div className="mt-3 text-xs text-slate-500">
                  {output.length} characters | ~{Math.floor(output.length / 4)} tokens
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs & Config Panel */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Request Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="logs" className="w-full">
                <TabsList className="bg-slate-900 w-full">
                  <TabsTrigger value="logs" className="flex-1">Logs</TabsTrigger>
                  <TabsTrigger value="config" className="flex-1">Config</TabsTrigger>
                </TabsList>
                
                <TabsContent value="logs" className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs text-slate-400">{logs.length} events</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleClearLogs}
                      className="text-xs text-slate-400"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto space-y-1">
                    {logs.length === 0 ? (
                      <div className="text-center text-slate-500 text-sm py-8">
                        No logs yet. Run a request to see logs.
                      </div>
                    ) : (
                      logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-2 p-2 rounded bg-slate-900 text-xs"
                        >
                          {log.type === "success" && <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />}
                          {log.type === "error" && <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />}
                          {log.type === "warning" && <AlertCircle className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />}
                          {log.type === "info" && <Zap className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className={`${
                              log.type === "error" ? "text-red-300" :
                              log.type === "warning" ? "text-yellow-300" :
                              log.type === "success" ? "text-green-300" :
                              "text-slate-300"
                            }`}>
                              {log.message}
                            </div>
                            <div className="text-slate-500 text-xs mt-1">
                              {new Date(log.timestamp).toLocaleTimeString()}
                              {log.duration && ` • ${log.duration}ms`}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="config">
                  {selectedModel ? (
                    <div className="bg-slate-900 rounded-lg p-3 font-mono text-xs text-slate-300 max-h-[450px] overflow-auto">
                      <pre>{JSON.stringify({
                        model: models.find(m => m.id === selectedModel)?.model_id,
                        quantization: models.find(m => m.id === selectedModel)?.quantization,
                        parameters: parameters,
                        context_length: models.find(m => m.id === selectedModel)?.context_length,
                        api_endpoint: models.find(m => m.id === selectedModel)?.api_endpoint || "Not configured"
                      }, null, 2)}</pre>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 text-sm py-8">
                      Select a model to view configuration
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-slate-800 border-slate-700 lg:col-span-2 xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-400" />
              Quick Setup Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                <div className="text-slate-400 mb-2"># Install MX2LM CLI from npm:</div>
                <div className="text-green-400 mb-4">npm install -g @mx2lm/cli</div>
                
                <div className="text-slate-400 mb-2"># Initialize configuration:</div>
                <div className="text-green-400 mb-4">mx2lm init --config</div>
                
                <div className="text-slate-400 mb-2"># Run with parameters:</div>
                <div className="text-green-400">mx2lm run --model phi-3-mini \</div>
                <div className="text-green-400 ml-4">--quantization int4 \</div>
                <div className="text-green-400 ml-4">--temp 0.7 --max-tokens 2048</div>
              </div>
              
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                <div className="text-slate-400 mb-2"># Clone from GitHub:</div>
                <div className="text-green-400 mb-4">git clone https://github.com/cannaseedus-bot/MX2LM.git</div>
                
                <div className="text-slate-400 mb-2"># Batch quantize models:</div>
                <div className="text-green-400 mb-4">mx2lm quantize --batch --method awq --bits 4</div>
                
                <div className="text-slate-400 mb-2"># Export configuration:</div>
                <div className="text-green-400">mx2lm config export --format json</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}