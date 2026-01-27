import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import RuntimeChat from "@/components/runtime/RuntimeChat";
import RuntimeEditor from "@/components/runtime/RuntimeEditor";
import EnhancedOutputTerminal from "@/components/runtime/EnhancedOutputTerminal";
import EnvironmentVariablesPanel from "@/components/runtime/EnvironmentVariablesPanel";
import RemoteRuntimeConfig from "@/components/runtime/RemoteRuntimeConfig";
import HFModelsPanel from "@/components/runtime/HFModelsPanel";
import ClusterSelector from "@/components/shared/ClusterSelector";
import { Zap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RuntimeStudio() {
  const navigate = useNavigate();
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [scriptCode, setScriptCode] = useState(`"""
Bot Script for Runtime Studio
Demonstrates data processing and model integration capabilities.
"""

import json
from datetime import datetime


def main() -> dict:
    """
    Main execution function that processes bot tasks.
    
    Returns:
        dict: Status and timestamp information in ISO format.
    """
    try:
        result = {
            "status": "success",
            "timestamp": datetime.now().isoformat()
        }
        return result
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    result = main()
    try:
        print(json.dumps(result, indent=2))
    except json.JSONDecodeError as e:
        print(f"JSON serialization error: {e}")
`);
  const [pythonVersion, setPythonVersion] = useState("3.12");
  const [scriptArgs, setScriptArgs] = useState("");
  const [envVars, setEnvVars] = useState({});
  const [remoteApiUrl, setRemoteApiUrl] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);

  const handleRunScript = async (code) => {
    setIsRunning(true);
    setOutput([]);
    
    try {
      const args = scriptArgs
        .split(/\s+/)
        .filter(arg => arg.trim());

      const response = await base44.functions.invoke("scriptExecutor", {
        script: code,
        pythonVersion,
        args,
        envVars,
        remoteApiUrl,
        clusterId: selectedCluster?.id,
        clusterType: selectedCluster?.cluster_type
      });

      if (response.data.output) {
        setOutput(response.data.output);
      }

      if (!response.data.success) {
        toast.error("Script execution failed");
      } else {
        toast.success("Script executed successfully");
      }
    } catch (error) {
      setOutput([
        { type: "error", text: `Error: ${error.message}` }
      ]);
      toast.error("Execution error: " + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveScript = async (code) => {
    try {
      localStorage.setItem("runtime-script", code);
      toast.success("Script saved locally");
    } catch (error) {
      toast.error("Save failed: " + error.message);
    }
  };

  const handleSelectHFModel = (modelId) => {
    const importCode = `# Import HuggingFace model\nfrom transformers import AutoTokenizer, AutoModelForCausalLM\n\nmodel_id = "${modelId}"\ntokenizer = AutoTokenizer.from_pretrained(model_id)\nmodel = AutoModelForCausalLM.from_pretrained(model_id)\n\nprint(f"Loaded {model_id} successfully")\n`;
    setScriptCode(prev => prev + "\n" + importCode);
    toast.success(`Added import for ${modelId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
      <div className="border-b-2 border-cyan-400 bg-slate-900 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Runtime Studio
            </h1>
            <p className="text-gray-400 text-sm mt-1">AI-Powered Development Environment</p>
          </div>
          <div className="text-right space-y-2">
            {selectedCluster && (
              <p className="text-cyan-400 text-sm">
                🎯 Cluster: <span className="font-bold">{selectedCluster.name}</span>
              </p>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(createPageUrl("ClusterManagement"))}
                className="border-cyan-400 text-cyan-400 h-7 text-xs"
              >
                <Settings className="w-3 h-3 mr-1" />
                Manage Clusters
              </Button>
              <p className="text-gray-400 text-xs">Connected to: AI Agent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Bar */}
       <div className="border-b border-slate-700 bg-slate-900 px-4 py-3 space-y-3 overflow-y-auto max-h-40">
         <div className="max-w-7xl mx-auto grid grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Python Version</label>
            <select
              value={pythonVersion}
              onChange={(e) => setPythonVersion(e.target.value)}
              className="w-full bg-black border border-slate-700 rounded px-2 py-1 text-sm text-cyan-400"
            >
              <option>3.8</option>
              <option>3.9</option>
              <option>3.10</option>
              <option>3.11</option>
              <option selected>3.12</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Script Arguments</label>
            <input
              value={scriptArgs}
              onChange={(e) => setScriptArgs(e.target.value)}
              placeholder="arg1 arg2 arg3"
              className="w-full bg-black border border-slate-700 rounded px-2 py-1 text-sm text-cyan-400 placeholder:text-gray-600"
            />
          </div>
          <div className="flex items-end col-span-2">
            <span className="text-xs text-gray-400">
              {remoteApiUrl ? `✓ Remote: ${remoteApiUrl}` : "Local execution"}
            </span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto">
          <label className="text-xs text-gray-400 mb-2 block">Execution Cluster</label>
          <div className="max-w-xs">
            <ClusterSelector 
              value={selectedCluster}
              onChange={setSelectedCluster}
              label="Select cluster (optional)"
            />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-0 h-[calc(100vh-220px)] overflow-y-auto">
        {/* Editor + Env Vars */}
        <div className="col-span-4 border-r border-cyan-400 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <RuntimeEditor
              onRun={handleRunScript}
              onSave={handleSaveScript}
              code={scriptCode}
              onChange={setScriptCode}
            />
          </div>
          <div className="border-t border-slate-700 p-3 h-32 overflow-y-auto">
            <EnvironmentVariablesPanel envVars={envVars} onChange={setEnvVars} />
          </div>
        </div>

        {/* Chat + HF Models */}
        <div className="col-span-4 border-r border-cyan-400 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <RuntimeChat 
              onCodeGenerated={setScriptCode}
              code={scriptCode}
            />
          </div>
          <div className="border-t border-slate-700 p-3 h-32 overflow-y-auto">
            <HFModelsPanel onSelect={handleSelectHFModel} />
          </div>
        </div>

        {/* Output + Remote Config */}
        <div className="col-span-4 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <EnhancedOutputTerminal
              output={output}
              isRunning={isRunning}
              onClear={() => setOutput([])}
            />
          </div>
          <div className="border-t border-slate-700 p-3 h-32 overflow-y-auto">
            <RemoteRuntimeConfig onConnect={setRemoteApiUrl} />
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="border-t border-cyan-400 bg-slate-900 p-3 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-cyan-400">Agent Status:</span> Connected • 
            <span className="text-cyan-400 ml-2">Python:</span> {pythonVersion} •
            <span className="text-cyan-400 ml-2">Runtime:</span> {remoteApiUrl ? "Remote" : "Local"} •
            {selectedCluster && (
              <>
                <span className="text-cyan-400 ml-2">Cluster:</span> {selectedCluster.cluster_type} •
                <span className="text-cyan-400 ml-2">GPU:</span> {selectedCluster.gpu_support ? "✓" : "—"}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}