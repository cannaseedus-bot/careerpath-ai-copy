import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const DEFAULT_QUESTIONS = [
  { id: "build", label: "Build a model", icon: "🏗️" },
  { id: "train", label: "Train a model", icon: "📚" },
  { id: "optimize", label: "Optimize a model", icon: "⚡" },
  { id: "debug", label: "Debug script", icon: "🐛" },
  { id: "test", label: "Generate tests", icon: "✅" },
];

export default function PresetQuestions({ onSelect, codingPatterns = {} }) {
  const [suggestions, setSuggestions] = useState(DEFAULT_QUESTIONS);

  useEffect(() => {
    // Add personalized suggestions based on coding patterns
    const patternBased = [];
    
    if (codingPatterns.usesAsync) {
      patternBased.push({
        id: "async",
        label: "Optimize async patterns",
        icon: "🔄",
        custom: true
      });
    }
    
    if (codingPatterns.usesDataProcessing) {
      patternBased.push({
        id: "batch",
        label: "Optimize batch processing",
        icon: "📦",
        custom: true
      });
    }

    if (codingPatterns.complexity === "high") {
      patternBased.push({
        id: "refactor",
        label: "Refactor complex logic",
        icon: "♻️",
        custom: true
      });
    }

    setSuggestions([...DEFAULT_QUESTIONS, ...patternBased]);
  }, [codingPatterns]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded p-3">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-cyan-400" />
        <h4 className="text-sm font-bold text-cyan-400">Quick Actions</h4>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {suggestions.map((q) => (
          <Button
            key={q.id}
            onClick={() => onSelect(q.label)}
            variant="outline"
            className={`text-xs justify-start border-slate-600 hover:border-cyan-400 hover:bg-cyan-900/20 ${
              q.custom ? "border-cyan-600 bg-cyan-900/10" : ""
            }`}
          >
            <span className="mr-1">{q.icon}</span>
            <span className="truncate">{q.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}