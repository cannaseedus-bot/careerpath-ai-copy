import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Code, Lightbulb, AlertCircle, CheckCircle, Zap, Copy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIAssistant({ botType, currentScript, currentConfig, onApplySuggestion }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [boilerplate, setBoilerplate] = useState(null);
  const [diagnostics, setDiagnostics] = useState([]);
  const [customPrompt, setCustomPrompt] = useState("");

  const generateBoilerplate = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate boilerplate code for a ${botType} bot with the following config:
${JSON.stringify(currentConfig, null, 2)}

Requirements:
- Follow XJSON envelope structure with @phase: ["@Pop", "@Wo", "@Sek", "@Collapse"]
- Use proper SVG-3D tensor schema (NGT-SVG-3D v1) if applicable
- Include SCXQ2 delta compression logic
- Add proper error handling and invariant checks
- Include comments explaining each phase
- Use HuggingFace dataset patterns from config

Return only the JavaScript/XJSON code, no explanations.`,
        response_json_schema: {
          type: "object",
          properties: {
            code: { type: "string" },
            xjson: { type: "object" },
            explanation: { type: "string" }
          }
        }
      });

      setBoilerplate(response);
      toast.success("Boilerplate generated");
    } catch (error) {
      toast.error("Failed to generate boilerplate");
    } finally {
      setLoading(false);
    }
  };

  const analyzeScript = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this ${botType} bot script for issues, optimizations, and edge cases:

\`\`\`javascript
${currentScript}
\`\`\`

Provide:
1. Performance optimizations (e.g., reducing allocations, efficient loops)
2. Edge case handling (e.g., empty data, network failures, invalid tensors)
3. XJSON compliance issues
4. SVG-3D tensor schema violations
5. SCXQ2 compression opportunities
6. Invariant enforcement suggestions

Return as structured diagnostics.`,
        response_json_schema: {
          type: "object",
          properties: {
            diagnostics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["error", "warning", "info", "optimization"] },
                  message: { type: "string" },
                  suggestion: { type: "string" },
                  line: { type: "number" }
                }
              }
            }
          }
        }
      });

      setDiagnostics(response.diagnostics || []);
      toast.success("Analysis complete");
    } catch (error) {
      toast.error("Failed to analyze script");
    } finally {
      setLoading(false);
    }
  };

  const getAutocompletions = async (context) => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide autocomplete suggestions for this ${botType} bot context:

\`\`\`
${context}
\`\`\`

Suggest:
- XJSON phase operators: @Pop, @Wo, @Sek, @Collapse
- SVG-3D tensor attributes: data-src, data-dst, data-weight, data-count
- SCXQ2 lane operations: DICT, FIELD, EDGE, META
- HuggingFace dataset methods
- Common patterns for ${botType} bots

Return 5-10 relevant completions.`,
        response_json_schema: {
          type: "object",
          properties: {
            completions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  insertText: { type: "string" },
                  detail: { type: "string" },
                  kind: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(response.completions || []);
    } catch (error) {
      toast.error("Failed to get completions");
    } finally {
      setLoading(false);
    }
  };

  const customAssist = async () => {
    if (!customPrompt.trim()) return;
    
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Context: ${botType} bot with this script:
\`\`\`javascript
${currentScript}
\`\`\`

User request: ${customPrompt}

Provide code suggestions, XJSON patterns, or tensor schema fixes. Follow XJSON law, SVG-3D tensor schema, and SCXQ2 compression principles.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestion: { type: "string" },
            code: { type: "string" },
            explanation: { type: "string" }
          }
        }
      });

      setSuggestions([{
        label: "Custom Suggestion",
        insertText: response.code || response.suggestion,
        detail: response.explanation,
        kind: "custom"
      }]);
      toast.success("Suggestion ready");
    } catch (error) {
      toast.error("Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="border-2 border-purple-400 bg-black">
      <div className="bg-purple-400 text-black px-4 py-1 flex justify-between items-center">
        <span className="font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          AI AUTHORING ASSISTANT
        </span>
        <Badge className="bg-black text-purple-400 text-xs">
          DRAFT MODE
        </Badge>
      </div>

      <div className="p-4">
        <Tabs defaultValue="boilerplate" className="space-y-4">
          <TabsList className="bg-slate-900 border-2 border-purple-400">
            <TabsTrigger value="boilerplate" className="data-[state=active]:bg-purple-400 data-[state=active]:text-black">
              <Code className="w-3 h-3 mr-2" />
              Boilerplate
            </TabsTrigger>
            <TabsTrigger value="analyze" className="data-[state=active]:bg-purple-400 data-[state=active]:text-black">
              <Lightbulb className="w-3 h-3 mr-2" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-purple-400 data-[state=active]:text-black">
              <Zap className="w-3 h-3 mr-2" />
              Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="boilerplate" className="space-y-3">
            <div className="text-sm text-gray-400">
              Generate lawful boilerplate code for {botType} bots with XJSON envelopes, SVG-3D tensors, and SCXQ2 compression.
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={generateBoilerplate}
                disabled={loading}
                className="bg-purple-400 text-black hover:bg-purple-300"
              >
                {loading ? "GENERATING..." : "GENERATE_BOILERPLATE"}
              </Button>
              <Button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const response = await base44.functions.invoke('generate-tensor-schema', {
                      bot_config: currentConfig || {},
                      bot_type: botType,
                      sample_data: currentConfig?.sample_data || null,
                      script_analysis: currentScript?.slice(0, 1000)
                    });
                    setBoilerplate({
                      code: JSON.stringify(response.schema, null, 2),
                      explanation: `Generated SVG-3D tensor schema (rank ${response.schema?.tensor_rank || 'N/A'}, shape ${JSON.stringify(response.schema?.tensor_shape || [])}). Includes ${response.ngrams?.length || 0} n-grams and optimized SCXQ2 compression config.`
                    });
                    toast.success("Tensor schema generated");
                  } catch (error) {
                    toast.error("Failed to generate schema");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="bg-cyan-400 text-black hover:bg-cyan-300"
              >
                <Zap className="w-4 h-4 mr-2" />
                {loading ? "GENERATING..." : "TENSOR_SCHEMA"}
              </Button>
            </div>

            {boilerplate && (
              <div className="space-y-3">
                <div className="bg-slate-900 p-3 rounded border border-purple-400">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-purple-400">GENERATED CODE:</span>
                    <button
                      onClick={() => copyToClipboard(boilerplate.code)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <pre className="text-xs text-green-400 overflow-auto max-h-64">
                    {boilerplate.code}
                  </pre>
                </div>

                {boilerplate.explanation && (
                  <div className="text-xs text-gray-400 p-2 bg-slate-900 rounded">
                    {boilerplate.explanation}
                  </div>
                )}

                <Button
                  onClick={() => onApplySuggestion(boilerplate.code)}
                  className="border-2 border-green-400 text-green-400 bg-transparent hover:bg-green-900/30 w-full"
                >
                  APPLY_TO_EDITOR
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analyze" className="space-y-3">
            <div className="text-sm text-gray-400">
              Analyze for performance issues, edge cases, and XJSON/tensor compliance violations.
            </div>
            <Button
              onClick={analyzeScript}
              disabled={loading || !currentScript}
              className="bg-purple-400 text-black hover:bg-purple-300 w-full"
            >
              {loading ? "ANALYZING..." : "ANALYZE_SCRIPT"}
            </Button>

            {diagnostics.length > 0 && (
              <div className="space-y-2">
                {diagnostics.map((diag, idx) => {
                  const icons = {
                    error: <AlertCircle className="w-4 h-4 text-red-400" />,
                    warning: <AlertCircle className="w-4 h-4 text-yellow-400" />,
                    info: <CheckCircle className="w-4 h-4 text-blue-400" />,
                    optimization: <Zap className="w-4 h-4 text-green-400" />
                  };

                  return (
                    <div key={idx} className="bg-slate-900 p-3 rounded border border-gray-700">
                      <div className="flex items-start gap-2">
                        {icons[diag.type]}
                        <div className="flex-1">
                          <div className="text-sm text-white font-bold">
                            {diag.message}
                          </div>
                          {diag.suggestion && (
                            <div className="text-xs text-gray-400 mt-1">
                              💡 {diag.suggestion}
                            </div>
                          )}
                          {diag.line && (
                            <div className="text-xs text-purple-400 mt-1">
                              Line {diag.line}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-3">
            <div className="text-sm text-gray-400">
              Ask for custom code patterns, XJSON fixes, or tensor schema help.
            </div>
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., 'Add error handling for network failures' or 'Optimize n-gram counting loop' or 'Generate SCXQ2 compression logic'"
              className="bg-black border-2 border-purple-400 text-green-400 font-mono min-h-[100px]"
            />
            <Button
              onClick={customAssist}
              disabled={loading || !customPrompt.trim()}
              className="bg-purple-400 text-black hover:bg-purple-300 w-full"
            >
              {loading ? "PROCESSING..." : "GET_SUGGESTION"}
            </Button>

            {suggestions.length > 0 && (
              <div className="space-y-2">
                {suggestions.map((sug, idx) => (
                  <div key={idx} className="bg-slate-900 p-3 rounded border border-purple-400">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-purple-400 font-bold">
                        {sug.label}
                      </span>
                      <button
                        onClick={() => copyToClipboard(sug.insertText)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    {sug.detail && (
                      <div className="text-xs text-gray-400 mb-2">
                        {sug.detail}
                      </div>
                    )}
                    <pre className="text-xs text-green-400 overflow-auto max-h-32 bg-black p-2 rounded">
                      {sug.insertText}
                    </pre>
                    <Button
                      onClick={() => onApplySuggestion(sug.insertText)}
                      className="border border-green-400 text-green-400 bg-transparent hover:bg-green-900/30 w-full mt-2 text-xs"
                    >
                      APPLY
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-4 p-3 bg-slate-900 rounded border border-gray-700">
          <div className="text-xs text-gray-500 space-y-1">
            <div>⚠️ AI assists authoring, never execution</div>
            <div>✓ All outputs must pass XJSON + tensor legality</div>
            <div>✓ Suggestions are drafts requiring user acceptance</div>
          </div>
        </div>
      </div>
    </div>
  );
}