import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TestGenerator({ code }) {
  const [generatedTests, setGeneratedTests] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTests = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate comprehensive unit tests for this Python bot script using pytest framework.
        
Script:
\`\`\`python
${code}
\`\`\`

Generate tests that cover:
1. Main function execution
2. Error handling
3. Edge cases
4. Output validation

Return only the test code, no explanations.`,
      });

      setGeneratedTests(response);
      toast.success("Tests generated successfully");
    } catch (error) {
      toast.error("Failed to generate tests");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyTests = () => {
    navigator.clipboard.writeText(generatedTests);
    toast.success("Tests copied to clipboard");
  };

  return (
    <div className="bg-black border border-slate-700 rounded p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-cyan-400">Unit Test Generator</h4>
        <Button
          size="sm"
          onClick={generateTests}
          disabled={isGenerating}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Tests"
          )}
        </Button>
      </div>

      {generatedTests && (
        <div className="space-y-2">
          <div className="relative">
            <pre className="bg-slate-900 border border-slate-600 rounded p-2 text-xs text-cyan-300 overflow-x-auto max-h-64 overflow-y-auto font-mono">
              {generatedTests}
            </pre>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyTests}
              className="absolute top-2 right-2 h-6 w-6 bg-slate-800 hover:bg-slate-700"
            >
              <Copy className="w-3 h-3 text-gray-400" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}