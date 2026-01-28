import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Cpu, Link as LinkIcon, Play, Zap, Code, Layers, Settings, Download } from "lucide-react";

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
              <div>║  MX2LM Studio v3.0 - Hybrid Multi-Agent Framework         ║</div>
              <div>║  Core: @posthog/code-agent • KUHUL π Governed             ║</div>
              <div>╚════════════════════════════════════════════════════════════╝</div>
              <div className="mt-4 text-blue-400">
                Unified CLI orchestrating Claude, Gemini, Codex, Ollama & phi-3
                <br />with XCFE security, CM-1 audit trails, and π-governed server runtime.
              </div>
              <div className="mt-4 text-purple-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Sub-CLIs: /claude  /gemini  /codex  /ollama  /phi3
              </div>
            </div>
          </div>
        </div>

        {/* Download CTA */}
        <div className="border-2 border-cyan-400 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 mt-6">
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-cyan-400 text-xl font-bold mb-1">⚡ MX2LM CLI v3.0 — Hybrid Multi-Agent</div>
              <div className="text-slate-400 text-sm">@posthog/code-agent core with KUHUL π governance & MX2LM-SR-1 server runtime.</div>
            </div>
            <a 
              href="https://github.com/anthropics/anthropic-cookbook/archive/refs/heads/main.zip"
              download
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 flex items-center gap-2 transition-all"
            >
              <Download className="w-5 h-5" />
              Download CLI v3.0
            </a>
          </div>
          <div className="border-t border-cyan-800 px-6 py-3 text-xs text-slate-500 flex flex-wrap gap-4">
            <span>✓ /claude /gemini /codex</span>
            <span>✓ /ollama /phi3</span>
            <span>✓ KUHUL π Decay</span>
            <span>✓ XCFE Legality</span>
            <span>✓ CM-1 Audit</span>
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
            <span className="font-bold">MX2LM-SR-1 SERVER</span>
          </div>
          <div className="p-4 space-y-2 text-sm text-cyan-400">
            <div>├─ localhost:4141 (read-only)</div>
            <div>├─ WS status streaming</div>
            <div>├─ π decay auto-restart</div>
            <div>└─ CLI-launched, KUHUL-governed</div>
          </div>
        </div>

        <div className="border-2 border-purple-400 bg-black">
          <div className="bg-purple-400 text-black px-4 py-1">
            <span className="font-bold">MULTI-AGENT</span>
          </div>
          <div className="p-4 space-y-2 text-sm text-purple-400">
            <div>├─ /claude - Anthropic Claude</div>
            <div>├─ /gemini - Google Gemini</div>
            <div>├─ /codex - OpenAI Codex</div>
            <div>└─ /ollama /phi3 - Local</div>
          </div>
        </div>

        <div className="border-2 border-green-400 bg-black">
          <div className="bg-green-400 text-black px-4 py-1">
            <span className="font-bold">GOVERNANCE</span>
          </div>
          <div className="p-4 space-y-2 text-sm text-green-400">
            <div>├─ KUHUL π collapse thresholds</div>
            <div>├─ XCFE legality gates</div>
            <div>├─ CM-1 audit envelopes</div>
            <div>└─ PS-DSL-1 PowerShell</div>
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
            <div><span className="text-yellow-400">$</span> pip install mx2lm</div>
            <div><span className="text-yellow-400">$</span> mx2lm init</div>
            <div><span className="text-yellow-400">$</span> mx2lm server start</div>
            <div><span className="text-yellow-400">$</span> /claude "analyze this repo"</div>
            <div className="text-gray-500 text-xs mt-2"># Hybrid multi-agent CLI</div>
          </div>
        </div>

        <div className="border-2 border-orange-400 bg-black">
          <div className="bg-orange-400 text-black px-4 py-1">
            <span className="font-bold">BOT EXAMPLES</span>
          </div>
          <div className="p-4 space-y-2 text-orange-400 text-sm">
            <div>├─ Scrape HuggingFace code datasets</div>
            <div>├─ Build n-gram tensors from corpora</div>
            <div>├─ Process SVG-3D geometric weights</div>
            <div>└─ Orchestrate cluster workers</div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="max-w-5xl mx-auto border-2 border-green-400 bg-black mb-8">
        <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
          <span className="font-bold">RUNTIME STATUS</span>
          <span className="text-xs">MX2LM-SR-1.0.0</span>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-green-400 text-sm">
          <div>
            <div className="text-gray-500 text-xs">Server</div>
            <div className="font-bold">localhost:4141</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">π Support</div>
            <div className="font-bold">1.00</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Agents</div>
            <div className="font-bold">5 loaded</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Governance</div>
            <div className="font-bold">KUHUL π</div>
          </div>
        </div>
        <div className="px-6 pb-6 text-xs text-gray-600">
          <div>Collapse thresholds: &lt;0.3 deny | 0.3-0.6 advertise | &gt;0.6 launch | &gt;0.9 heal</div>
          <div className="mt-1">Last sync: {new Date().toISOString()}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto text-center border-t-2 border-green-400 pt-6">
        <div className="text-green-400 font-mono text-sm space-y-1">
          <div>MX2LM Studio v3.0 | CLI.MX2LM.COM | MX2LM-SR-1</div>
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