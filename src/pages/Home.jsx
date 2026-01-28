import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Cpu, Link as LinkIcon, Play, Zap, Code, Layers, Settings, Download, Search, Brain, Globe, Server, DollarSign } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Terminal Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="border-2 border-green-400 bg-black">
          <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
            <span className="font-bold">CLI.MX2LM.COM</span>
            <span className="text-xs">[ root@mx2lm ~ ]</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="text-green-400">
              <span className="text-yellow-400">$</span> ./welcome.sh
            </div>
            <div className="ml-4 space-y-2">
              <div>╔════════════════════════════════════════════════════════════╗</div>
              <div>║  MX2LM + XJSON Cluster OS 2.1 - Unified AI Platform       ║</div>
              <div>║  Multi-Agent CLI • FREE Search • KUHUL π Governed         ║</div>
              <div>╚════════════════════════════════════════════════════════════╝</div>
              <div className="mt-4 text-blue-400">
                Hybrid multi-agent CLI (/claude /gemini /codex /ollama) + FREE AI research
                <br />with PyTorch ML, WebGPU tensors, and π-governed server runtime.
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <span className="text-purple-400 flex items-center gap-1"><Zap className="w-3 h-3" /> Multi-Agent</span>
                <span className="text-green-400 flex items-center gap-1"><DollarSign className="w-3 h-3" /> $0/month</span>
                <span className="text-cyan-400 flex items-center gap-1"><Search className="w-3 h-3" /> FREE Search</span>
                <span className="text-orange-400 flex items-center gap-1"><Brain className="w-3 h-3" /> PyTorch ML</span>
              </div>
            </div>
          </div>
        </div>

        {/* Download CTA */}
        <div className="border-2 border-cyan-400 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 mt-6">
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-cyan-400 text-xl font-bold mb-1">⚡ MX2LM + XJSON Cluster — Unified Platform</div>
              <div className="text-slate-400 text-sm">Multi-agent CLI + FREE AI research. KUHUL π governed. Zero API costs.</div>
            </div>
            <div className="flex gap-2">
              <a 
                href="https://github.com/anthropics/anthropic-cookbook/archive/refs/heads/main.zip"
                download
                className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-400 hover:to-green-400 text-black font-bold px-4 py-3 flex items-center gap-2 transition-all"
              >
                <Download className="w-5 h-5" />
                Installer
              </a>
              <button 
                onClick={() => {
                  const packageJson = {
                    name: "mx2lm-cli",
                    version: "3.1.0",
                    description: "MX2LM + XJSON Cluster OS - Unified AI Platform",
                    scripts: {
                      start: "python -m mx2lm.cli",
                      server: "python -m mx2lm.server",
                      tui: "python -m mx2lm.deepseek_tui"
                    },
                    dependencies: {
                      rich: "^13.0.0",
                      "prompt-toolkit": "^3.0.0",
                      pygments: "^2.0.0",
                      anthropic: "^0.18.0",
                      "google-generativeai": "^0.4.0",
                      openai: "^1.12.0",
                      ollama: "^0.1.0",
                      transformers: "^4.38.0",
                      torch: "^2.2.0",
                      requests: "^2.31.0",
                      websockets: "^12.0",
                      beautifulsoup4: "^4.12.0",
                      numpy: "^1.26.0"
                    },
                    python: ">=3.10",
                    keywords: ["cli", "ai", "multi-agent", "deepseek", "claude", "gemini"]
                  };
                  const blob = new Blob([JSON.stringify(packageJson, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'package.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="bg-purple-500 hover:bg-purple-400 text-black font-bold px-4 py-3 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Code className="w-5 h-5" />
                package.json
              </button>
            </div>
          </div>
          <div className="border-t border-cyan-800 px-6 py-3 text-xs text-slate-500 flex flex-wrap gap-4">
            <span>✓ /claude /gemini /codex /deepseek</span>
            <span>✓ FREE Search (Google+DDG+Brave)</span>
            <span>✓ PyTorch + WebGPU</span>
            <span>✓ MX2LM-SR-1 Server</span>
            <span>✓ KUHUL π + CM-1</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-5xl mx-auto space-y-4 mb-8">
        <div className="border-2 border-green-400 bg-black">
          <div className="bg-green-400 text-black px-4 py-1">
            <span className="font-bold">QUICK COMMANDS</span>
          </div>
          <div className="p-6 space-y-3">
            <Link to={createPageUrl("ModelManager")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ mx2lm models --list</div>
              <div className="text-green-400 text-sm ml-4">Manage Hugging Face models and quantization settings</div>
            </Link>
            <Link to={createPageUrl("APIManager")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ mx2lm endpoints --configure</div>
              <div className="text-green-400 text-sm ml-4">Set up API endpoints and runtime connections</div>
            </Link>
            <Link to={createPageUrl("CLIPlayground")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ mx2lm playground --test</div>
              <div className="text-green-400 text-sm ml-4">Test models and generate CLI configurations</div>
            </Link>
            <Link to={createPageUrl("IDEIntegrations")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ mx2lm ide --setup vscode</div>
              <div className="text-green-400 text-sm ml-4">Integrate with VS Code, Visual Studio, and more</div>
            </Link>
            <Link to={createPageUrl("CIPipelines")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ mx2lm ci --deploy</div>
              <div className="text-green-400 text-sm ml-4">Automate with GitHub Actions, GitLab CI, CircleCI</div>
            </Link>
            <Link to={createPageUrl("Extensions")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ mx2lm extensions --browse</div>
              <div className="text-green-400 text-sm ml-4">Discover and install community extensions</div>
            </Link>
            <Link to={createPageUrl("Commands")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ mx2lm commands --custom</div>
              <div className="text-green-400 text-sm ml-4">Create and manage custom CLI commands</div>
            </Link>
            <Link to={createPageUrl("ShellAssistant")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ mx2lm assistant --ai --claude</div>
              <div className="text-green-400 text-sm ml-4">Claude 3.5 Sonnet shell assistant with file analysis & XCFE-PS security</div>
            </Link>
            <Link to={createPageUrl("BotOrchestrator")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ mx2lm bots --orchestrate</div>
              <div className="text-green-400 text-sm ml-4">XJSON Runtime Cluster with SVG-3D tensors & SCXQ2 compression</div>
            </Link>
            <Link to={createPageUrl("Monitoring")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ mx2lm monitor --cluster</div>
              <div className="text-green-400 text-sm ml-4">Real-time cluster health and bot performance metrics</div>
            </Link>
            <Link to={createPageUrl("CompressionDocs")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ mx2lm docs --compression-calculus</div>
              <div className="text-green-400 text-sm ml-4">W3Schools-style compression calculus reference</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="border-2 border-cyan-400 bg-black">
          <div className="bg-cyan-400 text-black px-4 py-1">
            <span className="font-bold">🤖 MULTI-AGENT CLI</span>
          </div>
          <div className="p-4 space-y-2 text-sm text-cyan-400">
            <div>├─ /claude - Anthropic</div>
            <div>├─ /gemini - Google</div>
            <div>├─ /codex - OpenAI</div>
            <div>├─ /deepseek - DeepSeek T-UI</div>
            <div>└─ /ollama /phi3 - Local</div>
          </div>
        </div>

        <div className="border-2 border-purple-400 bg-black">
          <div className="bg-purple-400 text-black px-4 py-1">
            <span className="font-bold">🔍 FREE SEARCH + ML</span>
          </div>
          <div className="p-4 space-y-2 text-sm text-purple-400">
            <div>├─ Google CSE + DuckDuckGo</div>
            <div>├─ PyTorch inference</div>
            <div>├─ Multi-topic research</div>
            <div>└─ Binary tensor streaming</div>
          </div>
        </div>

        <div className="border-2 border-green-400 bg-black">
          <div className="bg-green-400 text-black px-4 py-1">
            <span className="font-bold">👥 COLLABORATION</span>
          </div>
          <div className="p-4 space-y-2 text-sm text-green-400">
            <div>├─ Multi-agent sessions</div>
            <div>├─ Role-based review</div>
            <div>├─ Real-time code sync</div>
            <div>└─ WebSocket comms</div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border-2 border-pink-400 bg-black">
          <div className="bg-pink-400 text-black px-4 py-1">
            <span className="font-bold">QUICK START</span>
          </div>
          <div className="p-4 space-y-2 text-pink-400 text-sm">
            <div><span className="text-yellow-400">$</span> pip install mx2lm torch beautifulsoup4</div>
            <div><span className="text-yellow-400">$</span> mx2lm server start</div>
            <div><span className="text-yellow-400">$</span> /claude "research AI trends"</div>
            <div><span className="text-yellow-400">$</span> /search "free ML models"</div>
            <div className="text-gray-500 text-xs mt-2"># Unified CLI + FREE research</div>
          </div>
        </div>

        <div className="border-2 border-orange-400 bg-black">
          <div className="bg-orange-400 text-black px-4 py-1">
            <span className="font-bold">UNIFIED COMMANDS</span>
          </div>
          <div className="p-4 space-y-2 text-orange-400 text-sm">
            <div>├─ /agents - List sub-CLIs</div>
            <div>├─ /search - FREE web search</div>
            <div>├─ /research - Deep research</div>
            <div>├─ /infer - ML inference</div>
            <div>└─ server start|stop|status</div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="max-w-5xl mx-auto border-2 border-green-400 bg-black mb-8">
        <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
          <span className="font-bold">UNIFIED PLATFORM STATUS</span>
          <span className="text-xs">MX2LM v3.1 + XJSON OS 2.1</span>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4 text-green-400 text-sm">
          <div>
            <div className="text-gray-500 text-xs">Cost</div>
            <div className="font-bold text-green-400">$0/mo</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Agents</div>
            <div className="font-bold">6 loaded</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Search</div>
            <div className="font-bold">3 FREE</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Server</div>
            <div className="font-bold">SR-1</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">π Support</div>
            <div className="font-bold">1.00</div>
          </div>
        </div>
        <div className="px-6 pb-6 text-xs text-gray-600">
        <div>Agents: /claude /gemini /codex /deepseek /ollama /phi3 | Search: Google CSE → DDG → Brave</div>
        <div className="mt-1">π thresholds: &lt;0.3 deny | 0.3-0.6 advertise | &gt;0.6 launch | &gt;0.9 heal</div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto text-center border-t-2 border-green-400 pt-6">
        <div className="text-green-400 font-mono text-sm space-y-1">
          <div>MX2LM v3.1 + XJSON Cluster OS 2.1 | Unified AI Platform | $0/month</div>
          <div className="text-gray-600">
            <Link to={createPageUrl("Pricing")} className="text-cyan-400 hover:underline">
              View Pricing
            </Link>
            {' '} • {' '}
            <Link to={createPageUrl("Career")} className="text-cyan-400 hover:underline">
              About
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}