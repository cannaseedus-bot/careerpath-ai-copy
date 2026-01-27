import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Cpu, Link as LinkIcon, Play, Zap, Code, Layers, Settings } from "lucide-react";

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
              <div>║  MX2LM Studio - Hugging Face Model Management Playground  ║</div>
              <div>║  v2.0 | Powered by Phi-3, Gemma, DeepSeek                ║</div>
              <div>╚════════════════════════════════════════════════════════════╝</div>
              <div className="mt-4 text-blue-400">
                Welcome to MX2LM Studio. Configure, manage, and deploy 
                <br />quantized AI models with a unified command-line interface.
              </div>
            </div>
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
              <div className="text-cyan-400">$ mx2lm assistant --ai</div>
              <div className="text-green-400 text-sm ml-4">AI-powered shell assistant for natural language commands</div>
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
            <span className="font-bold">XJSON RUNTIME</span>
          </div>
          <div className="p-4 space-y-2 text-sm text-cyan-400">
            <div>├─ Phase law: @Pop → @Wo → @Sek → @Collapse</div>
            <div>├─ SVG-3D tensor schemas</div>
            <div>├─ SCXQ2 delta compression</div>
            <div>└─ Distributed cluster nodes</div>
          </div>
        </div>

        <div className="border-2 border-purple-400 bg-black">
          <div className="bg-purple-400 text-black px-4 py-1">
            <span className="font-bold">BOT ORCHESTRATION</span>
          </div>
          <div className="p-4 space-y-2 text-sm text-purple-400">
            <div>├─ Web scrapers (HuggingFace datasets)</div>
            <div>├─ N-gram builders</div>
            <div>├─ Tensor processors (three.js)</div>
            <div>└─ AI authoring assistant</div>
          </div>
        </div>

        <div className="border-2 border-green-400 bg-black">
          <div className="bg-green-400 text-black px-4 py-1">
            <span className="font-bold">DEPLOYMENT</span>
          </div>
          <div className="p-4 space-y-2 text-sm text-green-400">
            <div>├─ Version control & rollback</div>
            <div>├─ Multi-environment (local/staging/prod)</div>
            <div>├─ Cluster health monitoring</div>
            <div>└─ Invariant enforcement</div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border-2 border-magenta-400 bg-black">
          <div className="bg-magenta-400 text-black px-4 py-1">
            <span className="font-bold">QUICK START</span>
          </div>
          <div className="p-4 space-y-2 text-magenta-400 text-sm">
            <div><span className="text-yellow-400">$</span> npm install -g @mx2lm/cli</div>
            <div><span className="text-yellow-400">$</span> mx2lm init --config</div>
            <div><span className="text-yellow-400">$</span> mx2lm models --add phi-3-mini</div>
            <div><span className="text-yellow-400">$</span> mx2lm bots create --type scraper</div>
            <div className="text-gray-500 text-xs mt-2"># Deploy to cluster in minutes</div>
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
          <span className="font-bold">CLUSTER STATUS</span>
          <span className="text-xs">XJSON Runtime v2.0</span>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-green-400 text-sm">
          <div>
            <div className="text-gray-500 text-xs">Runtime</div>
            <div className="font-bold">ONLINE</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Active Bots</div>
            <div className="font-bold">0</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Tensor Schemas</div>
            <div className="font-bold">NGT-SVG-3D v1</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">Compression</div>
            <div className="font-bold">SCXQ2</div>
          </div>
        </div>
        <div className="px-6 pb-6 text-xs text-gray-600">
          <div>Phase pipeline: @Pop → @Wo → @Sek → @Collapse</div>
          <div className="mt-1">Last sync: {new Date().toISOString()}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-5xl mx-auto text-center border-t-2 border-green-400 pt-6">
        <div className="text-green-400 font-mono text-sm space-y-1">
          <div>MX2LM Studio v2.0 | CLI.MX2LM.COM</div>
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