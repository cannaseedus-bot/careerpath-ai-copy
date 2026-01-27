import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Book, Code, Zap, Layers, GitBranch, Sparkles } from "lucide-react";

export default function CompressionDocs() {
  const [activeExample, setActiveExample] = useState(null);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-2 border-cyan-400 bg-black mb-6">
          <div className="bg-cyan-400 text-black px-4 py-1">
            <span className="font-bold">$ mx2lm docs --scxq2</span>
          </div>
          <div className="p-6">
            <div className="text-cyan-400 text-3xl mb-2">SCXQ2 REFERENCE</div>
            <div className="text-green-400">W3Schools-style documentation for CSS Micronaut & Universal Compression</div>
            <div className="text-gray-500 text-sm mt-2 italic">Simplified as "Compression Calculus"</div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-900 border-2 border-cyan-400 flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="grammar">Grammar</TabsTrigger>
            <TabsTrigger value="folds">Folds</TabsTrigger>
            <TabsTrigger value="micronauts">Micronauts</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="brains">Brains</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-slate-900 border-2 border-cyan-400 p-6">
              <h2 className="text-2xl text-cyan-400 mb-4 flex items-center gap-2">
                <Book className="w-6 h-6" />
                What is SCXQ2?
              </h2>
              <div className="space-y-3 text-gray-300">
                <p>SCXQ2 is a formal mathematical system for expressing and reasoning about universal data compression across multiple domains.</p>
                <p className="text-sm text-gray-500 italic">Note: "Compression Calculus" is a simplified definition of SCXQ2 for easier understanding.</p>
                
                <div className="bg-black p-4 rounded border border-gray-700">
                  <div className="text-yellow-400 mb-2">Key Concepts:</div>
                  <ul className="space-y-2 list-disc list-inside">
                    <li><span className="text-cyan-400">Folds</span> - Symbolic compression domains (⟁DATA_FOLD⟁, ⟁CODE_FOLD⟁, etc.)</li>
                    <li><span className="text-cyan-400">Micronauts</span> - Autonomous compression agents</li>
                    <li><span className="text-cyan-400">Patterns</span> - Reusable compression templates</li>
                    <li><span className="text-cyan-400">Entanglement</span> - Cross-domain correlation</li>
                    <li><span className="text-cyan-400">Superposition</span> - Multiple compression states simultaneously</li>
                  </ul>
                </div>

                <div className="bg-black p-4 rounded border border-green-700 mt-4">
                  <div className="text-green-400 mb-2">Compression Ratios Achieved:</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>CSS Controls: <span className="text-yellow-400">99.63%</span></div>
                    <div>SVG Data: <span className="text-yellow-400">99.6%</span></div>
                    <div>N-gram Tensors: <span className="text-yellow-400">99.8%</span></div>
                    <div>Language Data: <span className="text-yellow-400">99.85%</span></div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Grammar */}
          <TabsContent value="grammar" className="space-y-4">
            <Card className="bg-slate-900 border-2 border-purple-400 p-6">
              <h2 className="text-2xl text-purple-400 mb-4 flex items-center gap-2">
                <Code className="w-6 h-6" />
                EBNF Grammar Reference
              </h2>
              
              <div className="space-y-4">
                <div className="bg-black p-4 rounded border border-purple-400">
                  <div className="text-yellow-400 mb-2">Core Structure:</div>
                  <pre className="text-xs text-green-400 overflow-auto">
{`@micronaut MicronautName {
  control: { ControlVector+ }
  folds: { FoldBinding+ }
  rules: { CompressionRule+ }
}`}</pre>
                </div>

                <div className="bg-black p-4 rounded border border-purple-400">
                  <div className="text-yellow-400 mb-2">Control Vectors:</div>
                  <pre className="text-xs text-green-400 overflow-auto">
{`control: {
  flow: range(0.1, 0.9)
  intensity: dynamic(@micronaut, operation)
  entropy: 0.15
  stability: 0.85
  innovation: 0.18
  meta-dominance: 0.7
}`}</pre>
                </div>

                <div className="bg-black p-4 rounded border border-purple-400">
                  <div className="text-yellow-400 mb-2">Fold Operations:</div>
                  <pre className="text-xs text-green-400 overflow-auto">
{`folds: {
  ⟁DATA_FOLD⟁: compress(input)
  ⟁CODE_FOLD⟁: transform(⟁DATA_FOLD⟁, ⟁CODE_FOLD⟁)
  ⟁UI_FOLD⟁ ↔ ⟁CODE_FOLD⟁: entangle(bidirectional)
  ⟁DATA⟁ → ⟁CODE⟁ → ⟁UI⟁: pipeline(...)
}`}</pre>
                </div>

                <div className="bg-black p-4 rounded border border-purple-400">
                  <div className="text-yellow-400 mb-2">Compression Rules:</div>
                  <pre className="text-xs text-green-400 overflow-auto">
{`rules: {
  pattern PatternName: {
    match: PatternExpression
    apply: CompressionOperation
    efficiency: EfficiencyTarget
  }
  
  efficiency MetricName: {
    measure: Measurement
    threshold: ThresholdValue
    adjust: AdjustmentOperation
  }
}`}</pre>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Folds */}
          <TabsContent value="folds" className="space-y-4">
            <Card className="bg-slate-900 border-2 border-orange-400 p-6">
              <h2 className="text-2xl text-orange-400 mb-4 flex items-center gap-2">
                <Layers className="w-6 h-6" />
                Compression Folds
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: '⟁DATA_FOLD⟁', desc: 'Data compression domain', color: 'cyan' },
                  { name: '⟁CODE_FOLD⟁', desc: 'Code compression domain', color: 'purple' },
                  { name: '⟁STORAGE_FOLD⟁', desc: 'Storage optimization', color: 'blue' },
                  { name: '⟁NETWORK_FOLD⟁', desc: 'Network transmission', color: 'green' },
                  { name: '⟁UI_FOLD⟁', desc: 'UI/CSS compression', color: 'yellow' },
                  { name: '⟁AUTH_FOLD⟁', desc: 'Authentication data', color: 'red' },
                  { name: '⟁DB_FOLD⟁', desc: 'Database compression', color: 'pink' },
                  { name: '⟁COMPUTE_FOLD⟁', desc: 'Compute optimization', color: 'orange' }
                ].map((fold) => (
                  <div key={fold.name} className={`bg-black p-4 rounded border-2 border-${fold.color}-400`}>
                    <div className={`text-${fold.color}-400 font-bold mb-2`}>{fold.name}</div>
                    <div className="text-gray-400 text-sm">{fold.desc}</div>
                    <div className="mt-2 text-xs">
                      <div className="text-gray-500">Operations:</div>
                      <ul className="list-disc list-inside text-gray-400">
                        <li>compress(input)</li>
                        <li>decompress(symbol)</li>
                        <li>transform(source, target)</li>
                        <li>entangle(fold_a, fold_b)</li>
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Micronauts */}
          <TabsContent value="micronauts" className="space-y-4">
            <Card className="bg-slate-900 border-2 border-purple-400 p-6">
              <h2 className="text-2xl text-purple-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                CSS Micronauts
              </h2>

              <div className="space-y-4">
                {[
                  { name: 'µ-vector-ctrl', role: 'Compression flow control', folds: ['ALL'] },
                  { name: 'µ-code-exec', role: 'Code fold execution', folds: ['CODE', 'COMPUTE'] },
                  { name: 'µ-db-master', role: 'Data fold management', folds: ['DATA', 'DB', 'STORAGE'] },
                  { name: 'µ-lang-parse', role: 'Language processing', folds: ['DATA', 'CODE'] },
                  { name: 'µ-pattern-match', role: 'Pattern recognition', folds: ['ALL'] },
                  { name: 'µ-ast-gen', role: 'AST generation', folds: ['CODE'] }
                ].map((agent) => (
                  <div key={agent.name} className="bg-black p-4 rounded border border-purple-400">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-purple-400 font-bold">{agent.name}</div>
                        <div className="text-gray-400 text-sm">{agent.role}</div>
                      </div>
                      <div className="flex gap-1">
                        {agent.folds.map(f => (
                          <Badge key={f} className="bg-purple-600 text-xs">{f}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Brains */}
          <TabsContent value="brains" className="space-y-4">
            <Card className="bg-slate-900 border-2 border-orange-400 p-6">
              <h2 className="text-2xl text-orange-400 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Brains: N-Gram Data Execution
              </h2>

              <div className="space-y-4">
                <div className="bg-black p-4 rounded border border-orange-400">
                  <div className="text-yellow-400 mb-2">Paradigm Shift:</div>
                  <div className="text-gray-300 space-y-2">
                    <p>Brains (Brain Constellation Access Nodes) replace traditional databases with compressed n-gram execution.</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Data compressed to n-grams for AI recall</li>
                      <li>GraphQL-style mapping delivers compressed data</li>
                      <li>Execution-ready without separate DB system</li>
                      <li>Session-based or persistent compression modes</li>
                      <li>Network and database replaced by compression folds</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-black p-4 rounded border border-orange-400">
                  <div className="text-yellow-400 mb-2">Brain Query Example:</div>
                  <pre className="text-xs text-green-400 overflow-auto">
{`{
  Bot {
    name
    bot_type
    status
  }
  Micronaut {
    name
    type
    assigned_folds
  }
}`}</pre>
                  <div className="text-gray-400 text-xs mt-2">
                    → Mapped to n-gram compressed data<br/>
                    → Executed via compression folds<br/>
                    → No traditional database queries
                  </div>
                </div>

                <div className="bg-black p-4 rounded border border-orange-400">
                  <div className="text-yellow-400 mb-2">Execution Modes:</div>
                  <div className="space-y-2 text-xs">
                    <div className="text-gray-300">
                      <span className="text-cyan-400">session-based:</span> Ephemeral data for current session
                    </div>
                    <div className="text-gray-300">
                      <span className="text-purple-400">persistent-compressed:</span> Recalled across sessions via n-grams
                    </div>
                    <div className="text-gray-300">
                      <span className="text-green-400">ephemeral-execution:</span> Decompress, execute, discard
                    </div>
                  </div>
                </div>

                <div className="bg-black p-4 rounded border border-orange-400">
                  <div className="text-yellow-400 mb-2">Compression Folds:</div>
                  <pre className="text-xs text-green-400 overflow-auto">
{`⟁NGRAM_DATA_FOLD⟁ - N-gram compressed data
⟁BRAIN_EXECUTION_FOLD⟁ - Execution context
⟁DATA_FOLD⟁ - Entity compression
⟁TENSOR_FOLD⟁ - Tensor n-grams`}</pre>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Patterns */}
          <TabsContent value="patterns" className="space-y-4">
            <Card className="bg-slate-900 border-2 border-green-400 p-6">
              <h2 className="text-2xl text-green-400 mb-4 flex items-center gap-2">
                <GitBranch className="w-6 h-6" />
                Compression Patterns
              </h2>

              <div className="space-y-4">
                <div className="bg-black p-4 rounded border border-green-400">
                  <div className="text-yellow-400 mb-2">Pattern-Based Compression:</div>
                  <pre className="text-xs text-green-400 overflow-auto">
{`pattern json-data: {
  match: data: json { format: application/json }
  apply: compress(input, { 
    intensity: 0.8, 
    window-size: 1024 
  })
  efficiency: 94.1%
}`}</pre>
                </div>

                <div className="bg-black p-4 rounded border border-green-400">
                  <div className="text-yellow-400 mb-2">N-gram Pattern:</div>
                  <pre className="text-xs text-green-400 overflow-auto">
{`pattern n-gram-detection: {
  match: data: text { entropy-range: [0.3, 0.7] }
  apply: compress(input, { 
    method: pattern-based,
    lookahead: 5,
    threshold: 0.87
  })
  efficiency: entropy-reduction > 0.4
}`}</pre>
                </div>

                <div className="bg-black p-4 rounded border border-green-400">
                  <div className="text-yellow-400 mb-2">CSS Atomic Pattern:</div>
                  <pre className="text-xs text-green-400 overflow-auto">
{`pattern atomic-css: {
  match: css(.c-m0a-p20 { ⟁m⟁0a⟁p⟁20⟁Xul })
  apply: superpose([
    compress(css, { depth: 3 }),
    entangle(⟁UI_FOLD⟁, ⟁CODE_FOLD⟁)
  ])
  efficiency: pattern-reuse > 0.8
}`}</pre>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Examples */}
          <TabsContent value="examples" className="space-y-4">
            <Card className="bg-slate-900 border-2 border-yellow-400 p-6">
              <h2 className="text-2xl text-yellow-400 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Live Examples
              </h2>

              <div className="space-y-4">
                <div className="bg-black p-4 rounded border border-yellow-400">
                  <div className="text-yellow-400 mb-2">Example 1: Data Compression</div>
                  <pre className="text-xs text-green-400 overflow-auto mb-2">
{`@micronaut µ-db-master {
  control: {
    flow: range(0.1, 0.9)
    entropy: 0.15
  }
  folds: {
    ⟁DATA_FOLD⟁: compress(structured-data)
  }
  rules: {
    pattern json: {
      match: data: json
      apply: compress(input, { intensity: 0.8 })
      efficiency: 94.1%
    }
  }
}`}</pre>
                  <Badge className="bg-green-600">Efficiency: 94.1%</Badge>
                </div>

                <div className="bg-black p-4 rounded border border-yellow-400">
                  <div className="text-yellow-400 mb-2">Example 2: Cross-Fold Pipeline</div>
                  <pre className="text-xs text-green-400 overflow-auto mb-2">
{`folds: {
  ⟁DATA⟁ → ⟁CODE⟁ → ⟁UI⟁: pipeline(
    input 
    ⊳ extract-patterns 
    ⊳ compress 
    ⊳ render
  )
}`}</pre>
                  <Badge className="bg-purple-600">Pipeline Compression</Badge>
                </div>

                <div className="bg-black p-4 rounded border border-yellow-400">
                  <div className="text-yellow-400 mb-2">Example 3: Entanglement</div>
                  <pre className="text-xs text-green-400 overflow-auto mb-2">
{`folds: {
  ⟁NETWORK⟁ ↔ ⟁STORAGE⟁ ↔ ⟁COMPUTE⟁:
    entangle(triple-fold, adaptive)
}`}</pre>
                  <Badge className="bg-cyan-600">Quantum Entanglement</Badge>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}