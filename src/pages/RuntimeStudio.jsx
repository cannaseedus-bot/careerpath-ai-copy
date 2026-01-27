import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import RuntimeChat from "@/components/runtime/RuntimeChat";
import RuntimeEditor from "@/components/runtime/RuntimeEditor";
import EnhancedOutputTerminal from "@/components/runtime/EnhancedOutputTerminal";
import EnvironmentVariablesPanel from "@/components/runtime/EnvironmentVariablesPanel";
import RemoteRuntimeConfig from "@/components/runtime/RemoteRuntimeConfig";
import HFModelsPanel from "@/components/runtime/HFModelsPanel";
import { Zap } from "lucide-react";
import { toast } from "sonner";

export default function RuntimeStudio() {
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [scriptCode, setScriptCode] = useState(`# Bot Script Editor
# Write your bot script here

import json
from datetime import datetime

def main():
    print("Hello from Runtime Studio!")
    return {"status": "success", "timestamp": str(datetime.now())}

if __name__ == "__main__":
    result = main()
    print(json.dumps(result, indent=2))
`);
  const [pythonVersion, setPythonVersion] = useState("3.12");
  const [scriptArgs, setScriptArgs] = useState("");
  const [envVars, setEnvVars] = useState({});
  const [remoteApiUrl, setRemoteApiUrl] = useState(null);

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
        remoteApiUrl
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
          <div className="text-right">
            <p className="text-cyan-400 text-sm">Connected to: AI Agent</p>
            <p className="text-gray-400 text-xs">All tools enabled</p>
          </div>
        </div>
      </div>

      {/* Configuration Bar */}
      <div className="border-b border-slate-700 bg-slate-900 px-4 py-3">
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
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-0 h-[calc(100vh-220px)]">
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
          <div className="border-t border-slate-700 p-3 h-32 overflow-hidden">
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
          <div className="border-t border-slate-700 p-3 h-32 overflow-hidden">
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
          <div className="border-t border-slate-700 p-3 h-32 overflow-hidden">
            <RemoteRuntimeConfig onConnect={setRemoteApiUrl} />
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="border-t border-cyan-400 bg-slate-900 p-3 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto">
          <span className="text-cyan-400">Agent Status:</span> Connected • 
          <span className="text-cyan-400 ml-2">Python:</span> {pythonVersion} •
          <span className="text-cyan-400 ml-2">Runtime:</span> {remoteApiUrl ? "Remote" : "Local"}
        </div>
      </div>
    </div>
  );
}