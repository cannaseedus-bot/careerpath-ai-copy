import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function RemoteRuntimeConfig({ onConnect }) {
  const [apiUrl, setApiUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [port, setPort] = useState("8000");
  const [enableGPU, setEnableGPU] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const testConnection = async () => {
    if (!apiUrl.trim()) {
      toast.error("Please enter an API URL");
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch(`${apiUrl}/health`, { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setConnectionStatus({ success: true, data });
        onConnect?.(apiUrl);
        toast.success("Connected to remote runtime!");
      } else {
        setConnectionStatus({ success: false, error: `HTTP ${response.status}` });
        toast.error("Failed to connect");
      }
    } catch (error) {
      setConnectionStatus({ success: false, error: error.message });
      toast.error("Connection failed: " + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const generateScript = async () => {
    setIsGenerating(true);
    try {
      const scriptFile = await base44.functions.invoke("generateWebGPURuntime", {
        port: parseInt(port),
        enableGPU,
        pythonVersion: "3.12"
      });

      // The response should be the script content
      const blob = new Blob([scriptFile], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "webgpu-runtime.py";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Runtime script downloaded!");
    } catch (error) {
      toast.error("Failed to generate script: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded p-4 space-y-4">
      <h3 className="text-sm font-bold text-cyan-400">Runtime Configuration</h3>

      <Tabs defaultValue="local" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
          <TabsTrigger value="local" className="data-[state=active]:bg-cyan-900/30">
            Local Runtime
          </TabsTrigger>
          <TabsTrigger value="remote" className="data-[state=active]:bg-cyan-900/30">
            Remote Runtime
          </TabsTrigger>
        </TabsList>

        {/* Local Runtime Tab */}
        <TabsContent value="local" className="space-y-3 mt-4">
          <div className="bg-black border border-slate-700 rounded p-3 space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Port</label>
              <Input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="8000"
                className="bg-black border-slate-700 text-cyan-400 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="gpu"
                checked={enableGPU}
                onChange={(e) => setEnableGPU(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="gpu" className="text-xs text-gray-300">
                Enable GPU Support
              </label>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded p-2 text-xs text-gray-400">
              <p className="mb-2">📥 Download and run locally:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-500">
                <li>Download the webgpu-runtime.py script</li>
                <li>Run: <code className="bg-black px-1 rounded">python3.12 webgpu-runtime.py</code></li>
                <li>Server will start on http://127.0.0.1:{port}</li>
                <li>Use that URL in the Remote Runtime tab</li>
              </ol>
            </div>

            <Button
              onClick={generateScript}
              disabled={isGenerating}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-black font-bold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Runtime Script
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Remote Runtime Tab */}
        <TabsContent value="remote" className="space-y-3 mt-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">API Endpoint URL</label>
              <Input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000"
                className="bg-black border-slate-700 text-cyan-400 text-sm"
              />
            </div>

            <Button
              onClick={testConnection}
              disabled={isConnecting}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-black font-bold"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>

            {connectionStatus && (
              <div className={`border rounded p-2 text-xs ${
                connectionStatus.success
                  ? "bg-green-900/20 border-green-700 text-green-400"
                  : "bg-red-900/20 border-red-700 text-red-400"
              }`}>
                <div className="flex items-start gap-2">
                  {connectionStatus.success ? (
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-bold">
                      {connectionStatus.success ? "Connected!" : "Connection Failed"}
                    </p>
                    {connectionStatus.data && (
                      <p className="text-xs mt-1">
                        Python {connectionStatus.data.python_version} | GPU:{" "}
                        {connectionStatus.data.gpu_enabled ? "✓" : "✗"}
                      </p>
                    )}
                    {connectionStatus.error && (
                      <p className="text-xs mt-1">{connectionStatus.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}