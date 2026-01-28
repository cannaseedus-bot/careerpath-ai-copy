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
              <div>║  XJSON Cluster OS 2.1 - 100% FREE AI Research System      ║</div>
              <div>║  MX2LM v3.0 • KUHUL π Governed • Zero API Costs           ║</div>
              <div>╚════════════════════════════════════════════════════════════╝</div>
              <div className="mt-4 text-blue-400">
                Autonomous AI research with real PyTorch models, WebGPU visualization,
                <br />and FREE search via Google CSE + DuckDuckGo + Brave fallbacks.
              </div>
              <div className="mt-4 text-purple-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="text-green-400 font-bold">$0/month</span> • Real ML • WebGPU Tensors • Unlimited Research
              </div>
            </div>
          </div>
        </div>

        {/* Download CTA */}
        <div className="border-2 border-cyan-400 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 mt-6">
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-cyan-400 text-xl font-bold mb-1">🆓 XJSON Cluster OS 2.1 — 100% FREE</div>
              <div className="text-slate-400 text-sm">Real PyTorch + WebGPU + Free Search. No API keys. No monthly fees. Run anywhere.</div>
            </div>
            <a 
              href="https://github.com/anthropics/anthropic-cookbook/archive/refs/heads/main.zip"
              download
              className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 flex items-center gap-2 transition-all"
            >
              <Download className="w-5 h-5" />
              Download FREE
            </a>
          </div>
          <div className="border-t border-cyan-800 px-6 py-3 text-xs text-slate-500 flex flex-wrap gap-4">
            <span>✓ Google CSE (100/day FREE)</span>
            <span>✓ DuckDuckGo (unlimited)</span>
            <span>✓ PyTorch Models</span>
            <span>✓ WebGPU Tensors</span>
            <span>✓ Raspberry Pi Ready</span>
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
            <span className="font-bold">🔍 FREE SEARCH</span>
          </div>
          <div className="p-4 space-y-2 text-sm text-cyan-400">
            <div>├─ Google CSE (100/day FREE)</div>
            <div>├─ DuckDuckGo (unlimited)</div>
            <div>├─ Brave Search fallback</div>
            <div>└─ Multi-engine parallel</div>
          </div>
        </div>

        <div className="border-2 border-purple-400 bg-black">
          <div className="bg-purple-400 text-black px-4 py-1">
            <span className="font-bold">🧠 FREE ML</span>
          </div>
          <div className="p-4 space-y-2 text-sm text-purple-400">
            <div>├─ Real PyTorch inference</div>
            <div>├─ ResNet18 vision</div>
            <div>├─ RNN text analysis</div>
            <div>└─ Binary tensor streaming</div>
          </div>
        </div>

        <div className="border-2 border-green-400 bg-black">
          <div className="bg-green-400 text-black px-4 py-1">
            <span className="font-bold">🎮 WEBGPU</span>
          </div>
          <div className="p-4 space-y-2 text-sm text-green-400">
            <div>├─ Three.js visualization</div>
            <div>├─ Real-time tensors</div>
            <div>├─ Point cloud rendering</div>
            <div>└─ Interactive 3D</div>
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
            <div><span className="text-yellow-400">$</span> pip install torch numpy beautifulsoup4</div>
            <div><span className="text-yellow-400">$</span> python cluster-free.py --port 8081</div>
            <div><span className="text-yellow-400">$</span> curl localhost:8081/api/search</div>
            <div className="text-gray-500 text-xs mt-2"># 100% FREE - No API keys needed</div>
          </div>
        </div>

        <div className="border-2 border-orange-400 bg-black">
          <div className="bg-orange-400 text-black px-4 py-1">
            <span className="font-bold">API ENDPOINTS (FREE)</span>
          </div>
          <div className="p-4 space-y-2 text-orange-400 text-sm">
            <div>├─ POST /api/search - Web search</div>
            <div>├─ POST /api/research - Deep research</div>
            <div>├─ POST /api/inference - ML inference</div>
            <div>└─ POST /api/tensor - Tensor gen</div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="max-w-5xl mx-auto border-2 border-green-400 bg-black mb-8">
        <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
          <span className="font-bold">CLUSTER STATUS</span>
          <span className="text-xs">XJSON Cluster OS 2.1 FREE</span>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-green-400 text-sm">
          <div>
            <div className="text-gray-500 text-xs">Monthly Cost</div>
            <div className="font-bold text-green-400">$0.00</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Search Engines</div>
            <div className="font-bold">3 FREE</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">ML Models</div>
            <div className="font-bold">PyTorch</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Visualization</div>
            <div className="font-bold">WebGPU</div>
          </div>
        </div>
        <div className="px-6 pb-6 text-xs text-gray-600">
          <div>Search: Google CSE (100/day) → DuckDuckGo → Brave (unlimited fallback)</div>
          <div className="mt-1">KUHUL π governance: &lt;0.3 deny | 0.3-0.6 advertise | &gt;0.6 launch | &gt;0.9 heal</div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto text-center border-t-2 border-green-400 pt-6">
        <div className="text-green-400 font-mono text-sm space-y-1">
          <div>XJSON Cluster OS 2.1 FREE | MX2LM v3.0 | $0/month Forever</div>
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