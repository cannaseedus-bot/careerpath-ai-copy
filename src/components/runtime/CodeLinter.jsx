import React, { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, Lightbulb, CheckCircle, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function CodeLinter({ code, onApplyFix }) {
  const [issues, setIssues] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!code) return;
    
    const lintCode = async () => {
      setIsAnalyzing(true);
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this Python bot script for code quality, potential errors, and optimizations. Return a JSON object with issues array.
          
Script:
\`\`\`python
${code}
\`\`\`

For each issue, provide:
- type: "error", "warning", or "suggestion"
- line: line number where issue occurs
- message: clear description of the problem
- fix: brief explanation of how to fix it
- fix_code: the corrected code snippet (just the fixed lines/function)

Return format: {"issues": [{"type": "error|warning|suggestion", "line": number, "message": "...", "fix": "...", "fix_code": "..."}]}
Only return valid JSON, no other text.`,
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
                    fix: { type: "string" },
                    fix_code: { type: "string" }
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

  const handleAutoFix = (issue) => {
    if (!onApplyFix || !issue.fix_code) {
      toast.error("Fix not available for this issue");
      return;
    }

    try {
      onApplyFix(issue.fix_code);
      toast.success("Fix applied automatically!");
    } catch (error) {
      toast.error("Failed to apply fix");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded p-3">
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
                    <div className="mt-1 space-y-1">
                      <p className="text-gray-400 text-xs">
                        💡 Fix: <code className="bg-black/50 px-1 rounded">{issue.fix}</code>
                      </p>
                      {issue.fix_code && onApplyFix && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAutoFix(issue)}
                          className="h-6 text-xs border-cyan-400/50 text-cyan-400 hover:bg-cyan-900/20"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Auto Fix
                        </Button>
                      )}
                    </div>
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