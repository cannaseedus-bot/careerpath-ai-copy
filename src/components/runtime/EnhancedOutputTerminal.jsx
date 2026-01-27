import React, { useState, useRef, useEffect } from "react";
import { Trash2, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EnhancedOutputTerminal({ output = [], isRunning, onClear }) {
  const [filterLevel, setFilterLevel] = useState("all");
  const [searchText, setSearchText] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  const filteredOutput = output.filter((line) => {
    const levelMatch = filterLevel === "all" || line.type === filterLevel;
    const searchMatch = !searchText || line.text.toLowerCase().includes(searchText.toLowerCase());
    return levelMatch && searchMatch;
  });

  const handleDownload = () => {
    const text = output.map((line) => line.text).join("\n");
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", "runtime_output.log");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full flex flex-col bg-black border border-cyan-400">
      {/* Header */}
      <div className="border-b border-cyan-400 p-3 flex items-center justify-between gap-2 bg-slate-900 flex-wrap">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`} />
          <h3 className="text-cyan-400 font-bold text-sm">Output Terminal</h3>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-24 h-8 text-xs bg-black border-slate-700 text-cyan-400">
              <Filter className="w-3 h-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="border-slate-600 text-cyan-400 hover:bg-cyan-900/20 h-8"
            title="Download logs"
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onClear}
            className="border-slate-600 text-cyan-400 hover:bg-cyan-900/20 h-8"
            title="Clear output"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-slate-700 px-3 py-2">
        <input
          type="text"
          placeholder="Search output..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full bg-black border border-slate-700 rounded px-2 py-1 text-xs text-cyan-400 placeholder:text-gray-600"
        />
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
        {filteredOutput.length === 0 ? (
          <div className="text-gray-500 text-center mt-8">
            {output.length === 0 ? (
              <>
                <p>Run a script to see output here</p>
                <p className="text-xs mt-2">Click the RUN button in the editor</p>
              </>
            ) : (
              <p>No matches for "{filterLevel !== 'all' ? filterLevel : 'any'}" logs</p>
            )}
          </div>
        ) : (
          <>
            {filteredOutput.map((line, idx) => (
              <div
                key={idx}
                className={`${
                  line.type === "error"
                    ? "text-red-400"
                    : line.type === "warn"
                    ? "text-yellow-400"
                    : "text-cyan-400"
                } whitespace-pre-wrap break-words py-0.5`}
              >
                {line.timestamp && (
                  <span className="text-gray-600">[{new Date(line.timestamp).toLocaleTimeString()}] </span>
                )}
                <span className="text-gray-500">[{line.type.toUpperCase()}]</span> {line.text}
              </div>
            ))}
            <div ref={scrollRef} />
          </>
        )}
      </div>
    </div>
  );
}