import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RuntimeOutput({ output, isRunning, onClear }) {
  return (
    <div className="h-full flex flex-col bg-black border border-cyan-400">
      {/* Header */}
      <div className="border-b border-cyan-400 p-3 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`} />
          <h3 className="text-cyan-400 font-bold text-sm">Output Terminal</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onClear}
          className="border-cyan-400 text-cyan-400 hover:bg-cyan-900/20"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {output.length === 0 ? (
          <div className="text-gray-500 text-center mt-8">
            <p>Run a script to see output here</p>
            <p className="text-xs mt-2">Click the RUN button in the editor</p>
          </div>
        ) : (
          output.map((line, idx) => (
            <div key={idx} className={`${line.type === "error" ? "text-red-400" : "text-cyan-400"} whitespace-pre-wrap break-words`}>
              {line.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}