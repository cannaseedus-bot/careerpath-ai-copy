import React, { useState } from "react";
import { Play, Pause, StepForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DebuggerPanel({ code, onStepExecute }) {
  const [isDebugging, setIsDebugging] = useState(false);
  const [breakpoints, setBreakpoints] = useState(new Set());
  const [currentLine, setCurrentLine] = useState(null);
  const [variables, setVariables] = useState({});

  const toggleBreakpoint = (lineNum) => {
    const newBreakpoints = new Set(breakpoints);
    if (newBreakpoints.has(lineNum)) {
      newBreakpoints.delete(lineNum);
    } else {
      newBreakpoints.add(lineNum);
    }
    setBreakpoints(newBreakpoints);
  };

  const lines = code.split("\n");

  return (
    <div className="bg-slate-900 border border-slate-700 rounded p-3 space-y-3">
      {/* Controls */}
      <div className="flex gap-2 border-b border-slate-700 pb-3">
        <Button
          size="sm"
          variant={isDebugging ? "default" : "outline"}
          onClick={() => setIsDebugging(!isDebugging)}
          className="bg-green-600 hover:bg-green-700 text-black font-bold"
        >
          {isDebugging ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
          {isDebugging ? "Pause" : "Debug"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onStepExecute?.(currentLine)}
          disabled={!isDebugging}
          className="border-slate-600 text-gray-400 hover:text-gray-300"
        >
          <StepForward className="w-3 h-3 mr-1" />
          Step
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setIsDebugging(false);
            setCurrentLine(null);
            setVariables({});
          }}
          className="border-slate-600 text-gray-400 hover:text-gray-300"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Code with Breakpoints */}
      <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-xs">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={`flex gap-2 cursor-pointer p-1 rounded transition-colors ${
              currentLine === idx
                ? "bg-cyan-900/50 border-l-2 border-cyan-400"
                : breakpoints.has(idx)
                ? "bg-red-900/30 border-l-2 border-red-400"
                : "hover:bg-slate-800"
            }`}
            onClick={() => toggleBreakpoint(idx)}
          >
            <span className="text-slate-500 w-6 text-right">{idx + 1}</span>
            {breakpoints.has(idx) && <span className="text-red-400">●</span>}
            <span className="text-gray-400 flex-1">{line}</span>
          </div>
        ))}
      </div>

      {/* Variables Inspector */}
      {Object.keys(variables).length > 0 && (
        <div className="border-t border-slate-700 pt-3">
          <h4 className="text-xs font-bold text-gray-300 mb-2">Variables</h4>
          <div className="space-y-1 text-xs font-mono max-h-24 overflow-y-auto">
            {Object.entries(variables).map(([key, value]) => (
              <div key={key} className="text-slate-400">
                <span className="text-cyan-400">{key}</span>
                <span className="text-gray-500"> = </span>
                <span className="text-yellow-400">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}