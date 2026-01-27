import React, { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, Lightbulb, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function CodeLinter({ code }) {
  const [issues, setIssues] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!code) return;
    
    const lintCode = async () => {
      setIsAnalyzing(true);
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this Python bot script for code quality, potential errors, and optimizations. Return a JSON array with issues.
          
Script:
\`\`\`python
${code}
\`\`\`

Return format: [{"type": "error|warning|suggestion", "line": number, "message": "...", "fix": "..."}]
Only return the JSON array, no other text.`,
          response_json_schema: {
            type: "object",
            properties: {
              issues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string", enum: ["error", "warning", "suggestion"] },
                    line: { type: "number" },
                    message: { type: "string" },
                    fix: { type: "string" }
                  }
                }
              }
            }
          }
        });
        
        setIssues(response.issues || []);
      } catch (error) {
        console.error("Linting error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const timer = setTimeout(lintCode, 800);
    return () => clearTimeout(timer);
  }, [code]);

  const getIcon = (type) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case "suggestion":
        return <Lightbulb className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case "error":
        return "border-l-red-400 bg-red-900/20";
      case "warning":
        return "border-l-yellow-400 bg-yellow-900/20";
      case "suggestion":
        return "border-l-blue-400 bg-blue-900/20";
      default:
        return "";
    }
  };

  return (
    <div className="bg-black border border-slate-700 rounded p-3">
      <div className="flex items-center gap-2 mb-3">
        {isAnalyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Analyzing code...</span>
          </>
        ) : issues.length === 0 ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">No issues found</span>
          </>
        ) : (
          <span className="text-sm text-yellow-400">{issues.length} issue(s) found</span>
        )}
      </div>

      {issues.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {issues.map((issue, idx) => (
            <div
              key={idx}
              className={`border-l-2 p-2 rounded text-xs ${getColor(issue.type)}`}
            >
              <div className="flex items-start gap-2">
                {getIcon(issue.type)}
                <div className="flex-1">
                  <p className="text-gray-300 font-mono">
                    Line {issue.line}: {issue.message}
                  </p>
                  {issue.fix && (
                    <p className="text-gray-400 mt-1 text-xs">
                      💡 Fix: <code className="bg-black/50 px-1">{issue.fix}</code>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}