import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Save, Copy, Download } from "lucide-react";
import { toast } from "sonner";

export default function RuntimeEditor({ onRun, onSave }) {
  const [code, setCode] = useState(`# Bot Script Editor
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

  const handleRun = () => {
    onRun(code);
  };

  const handleSave = () => {
    onSave(code);
    toast.success("Script saved");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(code));
    element.setAttribute("download", "bot_script.py");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full flex flex-col bg-black border border-cyan-400">
      {/* Toolbar */}
      <div className="border-b border-cyan-400 p-3 flex items-center justify-between bg-slate-900">
        <h3 className="text-cyan-400 font-bold text-sm">Script Editor</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-900/20"
            title="Copy code"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-900/20"
            title="Download script"
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-900/20"
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

      {/* Editor */}
      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 bg-black border-0 text-cyan-400 font-mono text-sm resize-none focus:ring-0"
        placeholder="Write your Python script here..."
      />
    </div>
  );
}