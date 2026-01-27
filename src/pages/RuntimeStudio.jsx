import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import RuntimeChat from "@/components/runtime/RuntimeChat";
import RuntimeEditor from "@/components/runtime/RuntimeEditor";
import RuntimeOutput from "@/components/runtime/RuntimeOutput";
import { Zap } from "lucide-react";

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

  const handleRunScript = async (code) => {
    setIsRunning(true);
    setOutput([]);
    
    try {
      // Add UI feedback
      setOutput([{ type: "info", text: "$ Executing script...\n" }]);
      
      // In a real implementation, this would call a backend function
      // to execute the Python code in a sandbox
      setOutput((prev) => [
        ...prev,
        { type: "success", text: "Script execution started\n" },
        { type: "info", text: "(Note: Full execution requires backend integration)\n" }
      ]);
    } catch (error) {
      setOutput([{ type: "error", text: `Error: ${error.message}\n` }]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveScript = async (code) => {
    try {
      // This would save the script to a Bot entity or file storage
      // Implementation depends on your backend setup
    } catch (error) {
      console.error("Save failed:", error);
    }
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

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-0 h-[calc(100vh-120px)]">
        {/* Editor (left) */}
        <div className="col-span-7 lg:col-span-5 border-r border-cyan-400">
          <RuntimeEditor
            onRun={handleRunScript}
            onSave={handleSaveScript}
            code={scriptCode}
            onChange={setScriptCode}
          />
        </div>

        {/* Chat (middle-right) */}
        <div className="col-span-5 lg:col-span-3.5 border-r border-cyan-400">
          <RuntimeChat 
            onCodeGenerated={(code) => setOutput([{ type: "info", text: code }])} 
            code={scriptCode}
          />
        </div>

        {/* Output (right) */}
        <div className="col-span-12 lg:col-span-3.5">
          <RuntimeOutput
            output={output}
            isRunning={isRunning}
            onClear={() => setOutput([])}
          />
        </div>
      </div>

      {/* Info Bar */}
      <div className="border-t border-cyan-400 bg-slate-900 p-3 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto">
          <span className="text-cyan-400">Agent Status:</span> Connected • 
          <span className="text-cyan-400 ml-2">Tools:</span> Bot Orchestrator, Model Manager, Dataset Manager, Optimization Engine •
          <span className="text-cyan-400 ml-2">Framework Support:</span> Transformers, vLLM, TGI, Ollama
        </div>
      </div>
    </div>
  );
}