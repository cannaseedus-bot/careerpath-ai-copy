import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Save, Copy, Download, Bug, Zap } from "lucide-react";
import { toast } from "sonner";
import CodeLinter from "@/components/runtime/CodeLinter";
import DebuggerPanel from "@/components/runtime/DebuggerPanel";
import TestGenerator from "@/components/runtime/TestGenerator";

export default function RuntimeEditor({ onRun, onSave, code: externalCode, onChange }) {
  const [showDebugger, setShowDebugger] = useState(false);
  const [showLinter, setShowLinter] = useState(true);
  const [showTests, setShowTests] = useState(false);
  const [code, setCode] = useState(externalCode || `# Bot Script Editor
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

  const displayCode = externalCode || code;

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    onChange?.(newCode);
  };

  const handleRun = () => {
    onRun(displayCode);
  };

  const handleSave = () => {
    onSave(displayCode);
    toast.success("Script saved");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(displayCode));
    element.setAttribute("download", "bot_script.py");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full flex flex-col bg-black border border-cyan-400">
      {/* Toolbar */}
      <div className="border-b border-cyan-400 p-3 flex items-center justify-between bg-slate-900 flex-wrap gap-2">
        <h3 className="text-cyan-400 font-bold text-sm">Script Editor</h3>
        <div className="flex gap-1 flex-wrap">
          <Button
            size="sm"
            variant={showLinter ? "default" : "outline"}
            onClick={() => setShowLinter(!showLinter)}
            className={showLinter ? "bg-yellow-600 text-white" : "border-slate-600 text-slate-300"}
            title="Toggle linter"
          >
            <Zap className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant={showDebugger ? "default" : "outline"}
            onClick={() => setShowDebugger(!showDebugger)}
            className={showDebugger ? "bg-red-600 text-white" : "border-slate-600 text-slate-300"}
            title="Toggle debugger"
          >
            <Bug className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant={showTests ? "default" : "outline"}
            onClick={() => setShowTests(!showTests)}
            className={showTests ? "bg-green-600 text-white" : "border-slate-600 text-slate-300"}
            title="Toggle test generator"
          >
            ✓
          </Button>
          <div className="border-l border-slate-600 mx-1" />
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="border-slate-600 text-slate-300"
            title="Copy code"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="border-slate-600 text-slate-300"
            title="Download script"
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            className="border-slate-600 text-slate-300"
            title="Save script"
          >
            <Save className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
            title="Run script"
          >
            <Play className="w-3 h-3 mr-1" />
            RUN
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor */}
        <Textarea
          value={displayCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="flex-1 bg-black border-0 text-cyan-400 font-mono text-sm resize-none focus:ring-0"
          placeholder="Write your Python script here..."
        />

        {/* Bottom Panels */}
        <div className="border-t border-slate-700 flex gap-2 overflow-x-auto p-2 bg-slate-900 max-h-64 overflow-y-auto">
          {showLinter && <div className="flex-1 min-w-max"><CodeLinter code={displayCode} /></div>}
          {showDebugger && <div className="flex-1 min-w-max"><DebuggerPanel code={displayCode} onStepExecute={() => {}} /></div>}
          {showTests && <div className="flex-1 min-w-max"><TestGenerator code={displayCode} /></div>}
        </div>
      </div>
    </div>
  );
}