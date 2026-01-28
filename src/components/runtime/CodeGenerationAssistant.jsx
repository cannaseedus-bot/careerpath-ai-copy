import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Code, TestTube, Zap, Copy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CodeGenerationAssistant({ onCodeGenerated, currentCode = '' }) {
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [includeTests, setIncludeTests] = useState(true);
  const [includeMicronaut, setIncludeMicronaut] = useState(true);
  const [generationType, setGenerationType] = useState('standard');

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.functions.invoke('code-generator', {
        description,
        codeContext: currentCode,
        includeTests,
        includeMicronaut,
        generationType
      });

      if (response.success) {
        setResult(response);
        toast.success('Code generated successfully');
      } else {
        toast.error('Generation failed');
      }
    } catch (error) {
      toast.error('Failed to generate code');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const applyToEditor = (code) => {
    if (onCodeGenerated) {
      onCodeGenerated(code);
      toast.success('Code applied to editor');
    }
  };

  const getQualityColor = (score) => {
    if (score >= 8) return 'text-green-400 bg-green-900/20';
    if (score >= 6) return 'text-yellow-400 bg-yellow-900/20';
    return 'text-red-400 bg-red-900/20';
  };

  return (
    <div className="h-full flex flex-col bg-black border-l border-cyan-400">
      {/* Header */}
      <div className="border-b border-slate-700 p-4 bg-slate-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="text-cyan-400 font-bold">AI Code Generator</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">Generate complete modules from descriptions</p>
      </div>

      {/* Input Section */}
      <div className="p-4 border-b border-slate-700 space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Generation Type</label>
          <select
            value={generationType}
            onChange={(e) => setGenerationType(e.target.value)}
            className="w-full bg-black border border-slate-700 rounded px-2 py-2 text-sm text-cyan-400"
          >
            <option value="standard">Standard Module</option>
            <option value="micronaut_service">Micronaut Service</option>
            <option value="micronaut_entity">Micronaut Entity</option>
            <option value="api_documentation">API Documentation</option>
            <option value="data_model">Data Model/Schema</option>
          </select>
        </div>

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            generationType === 'micronaut_service' ? "Describe the Micronaut service...&#10;&#10;Example: 'Create a μ-vector-ctrl service that manages CSS control vectors for runtime optimization.'" :
            generationType === 'micronaut_entity' ? "Describe the entity...&#10;&#10;Example: 'Create an entity for tracking bot deployments with version, status, and cluster info.'" :
            generationType === 'api_documentation' ? "Describe the API or paste controller code...&#10;&#10;Example: 'Generate OpenAPI docs for a bot orchestration API with endpoints for create, list, execute.'" :
            generationType === 'data_model' ? "Describe the data model...&#10;&#10;Example: 'Create a User model with profile info, roles, and audit fields.'" :
            "Describe what you want to build...&#10;&#10;Example: 'Create a data validation module that checks CSV files for missing values, duplicates, and type mismatches.'"
          }
          className="min-h-32 bg-black border-slate-700 text-cyan-400 placeholder:text-gray-600"
          disabled={generating}
        />

        {generationType === 'standard' && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTests}
                onChange={(e) => setIncludeTests(e.target.checked)}
                className="rounded"
              />
              Include Tests
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMicronaut}
                onChange={(e) => setIncludeMicronaut(e.target.checked)}
                className="rounded"
              />
              Include Micronaut
            </label>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={generating || !description.trim()}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-black font-bold"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Code
            </>
          )}
        </Button>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-y-auto p-4">
        {result && (
          <div className="space-y-4">
            {/* Quality Score */}
            {result.quality && (
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="text-gray-400">Code Quality</span>
                    <Badge className={getQualityColor(result.quality.quality_score)}>
                      {result.quality.quality_score}/10
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.quality.security_issues?.length > 0 && (
                    <div>
                      <p className="text-xs text-red-400 font-semibold mb-1">Security Issues:</p>
                      <ul className="space-y-1">
                        {result.quality.security_issues.map((issue, idx) => (
                          <li key={idx} className="text-xs text-red-300 flex items-start gap-2">
                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.quality.improvements?.length > 0 && (
                    <div>
                      <p className="text-xs text-yellow-400 font-semibold mb-1">Improvements:</p>
                      <ul className="space-y-1">
                        {result.quality.improvements.map((imp, idx) => (
                          <li key={idx} className="text-xs text-gray-400">• {imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Metadata Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Dependencies */}
              {result.dependencies?.length > 0 && (
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Dependencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.dependencies.map((dep, idx) => (
                        <Badge key={idx} className="bg-slate-800 text-cyan-400">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Control Vectors */}
              {result.control_vectors && (
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Control Vectors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 text-xs">
                      {Object.entries(result.control_vectors).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-400">{key}:</span>
                          <span className="text-cyan-400">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Relationships */}
              {result.relationships?.length > 0 && (
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Relationships</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {result.relationships.map((rel, idx) => (
                        <li key={idx}>• {rel}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Assigned Folds */}
              {result.assigned_folds?.length > 0 && (
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Assigned Folds</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.assigned_folds.map((fold, idx) => (
                        <Badge key={idx} className="bg-purple-900/30 text-purple-400">
                          Fold {fold}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Code Tabs */}
            <Tabs defaultValue="main" className="w-full">
              <TabsList className="bg-slate-800 w-full flex flex-wrap">
                <TabsTrigger value="main" className="flex-1 min-w-[80px]">
                  <Code className="w-3 h-3 mr-1" />
                  {result.type === 'micronaut_entity' ? 'Schema' : 
                   result.type === 'data_model' ? 'Dataclass' : 'Code'}
                </TabsTrigger>
                {(result.tests || result.entity_schema || result.pydantic_model) && (
                  <TabsTrigger value="secondary" className="flex-1 min-w-[80px]">
                    <TestTube className="w-3 h-3 mr-1" />
                    {result.type === 'micronaut_service' ? 'Entity' : 
                     result.type === 'data_model' ? 'Pydantic' : 'Tests'}
                  </TabsTrigger>
                )}
                {(result.micronaut || result.openapi || result.json_schema) && (
                  <TabsTrigger value="tertiary" className="flex-1 min-w-[80px]">
                    {result.type === 'api_documentation' ? 'OpenAPI' :
                     result.type === 'data_model' ? 'JSON' : 'Micronaut'}
                  </TabsTrigger>
                )}
                {(result.usage_example || result.markdown || result.sql_schema) && (
                  <TabsTrigger value="fourth" className="flex-1 min-w-[80px]">
                    {result.type === 'api_documentation' ? 'Markdown' :
                     result.type === 'data_model' ? 'SQL' : 'Usage'}
                  </TabsTrigger>
                )}
                {(result.postman || result.typescript_interface || result.orm_model) && (
                  <TabsTrigger value="fifth" className="flex-1 min-w-[80px]">
                    {result.type === 'api_documentation' ? 'Postman' :
                     result.type === 'data_model' ? 'TypeScript' : 'Extra'}
                  </TabsTrigger>
                )}
                {(result.migration_script || result.error_guide) && (
                  <TabsTrigger value="sixth" className="flex-1 min-w-[80px]">
                    {result.type === 'data_model' ? 'Migration' : 'Errors'}
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="main" className="mt-2">
                <Card className="bg-slate-900 border-slate-700">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-end gap-2 p-2 border-b border-slate-700">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(result.code || result.schema)}
                        className="border-slate-600 text-cyan-400"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      {result.code && (
                        <Button
                          size="sm"
                          onClick={() => applyToEditor(result.code)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Apply to Editor
                        </Button>
                      )}
                    </div>
                    <pre className="p-4 overflow-x-auto text-xs text-cyan-300 max-h-96">
                      {result.code || result.schema || result.openapi}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              {(result.entity_schema || result.tests || result.pydantic_model) && (
                <TabsContent value="secondary" className="mt-2">
                  <Card className="bg-slate-900 border-slate-700">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-end gap-2 p-2 border-b border-slate-700">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(result.entity_schema || result.tests || result.pydantic_model)}
                          className="border-slate-600 text-cyan-400"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="p-4 overflow-x-auto text-xs text-cyan-300 max-h-96">
                        {result.entity_schema || result.tests || result.pydantic_model}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {(result.micronaut || result.openapi || result.json_schema) && (
                <TabsContent value="tertiary" className="mt-2">
                  <Card className="bg-slate-900 border-slate-700">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-end gap-2 p-2 border-b border-slate-700">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(result.micronaut || result.openapi || result.json_schema)}
                          className="border-slate-600 text-cyan-400"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="p-4 overflow-x-auto text-xs text-cyan-300 max-h-96">
                        {result.micronaut || result.openapi || result.json_schema}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {(result.usage_example || result.markdown || result.sql_schema) && (
                <TabsContent value="fourth" className="mt-2">
                  <Card className="bg-slate-900 border-slate-700">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-end gap-2 p-2 border-b border-slate-700">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(result.usage_example || result.markdown || result.sql_schema)}
                          className="border-slate-600 text-cyan-400"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="p-4 overflow-x-auto text-xs text-cyan-300 max-h-96 whitespace-pre-wrap">
                        {result.usage_example || result.markdown || result.sql_schema}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {(result.postman || result.typescript_interface || result.orm_model) && (
                <TabsContent value="fifth" className="mt-2">
                  <Card className="bg-slate-900 border-slate-700">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-end gap-2 p-2 border-b border-slate-700">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(result.postman || result.typescript_interface || result.orm_model)}
                          className="border-slate-600 text-cyan-400"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="p-4 overflow-x-auto text-xs text-cyan-300 max-h-96">
                        {result.postman || result.typescript_interface || result.orm_model}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {(result.migration_script || result.error_guide) && (
                <TabsContent value="sixth" className="mt-2">
                  <Card className="bg-slate-900 border-slate-700">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-end gap-2 p-2 border-b border-slate-700">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(result.migration_script || result.error_guide)}
                          className="border-slate-600 text-cyan-400"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="p-4 overflow-x-auto text-xs text-cyan-300 max-h-96 whitespace-pre-wrap">
                        {result.migration_script || result.error_guide}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}

        {!result && !generating && (
          <div className="text-center text-gray-500 mt-12">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Describe what you want to build</p>
            <p className="text-xs mt-2">AI will generate complete modules with tests and Micronaut integration</p>
          </div>
        )}
      </div>
    </div>
  );
}