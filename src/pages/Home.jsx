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
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border-2 border-cyan-400 bg-black">
          <div className="bg-cyan-400 text-black px-4 py-1">
            <span className="font-bold">MODEL REGISTRY</span>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div>├─ Phi-3 Mini/Lite variants</div>
            <div>├─ Gemma code models</div>
            <div>├─ DeepSeek Coder series</div>
            <div>└─ Quantization: INT4/INT8/GGUF</div>
          </div>
        </div>

        <div className="border-2 border-yellow-400 bg-black">
          <div className="bg-yellow-400 text-black px-4 py-1">
            <span className="font-bold">API ENDPOINTS</span>
          </div>
          <div className="p-4 space-y-2 text-sm text-yellow-400">
            <div>├─ Hugging Face Inference</div>
            <div>├─ Custom runtimes</div>
            <div>├─ cPanel storage</div>
            <div>└─ Secure key management</div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="max-w-5xl mx-auto border-2 border-magenta-400 bg-black mb-8">
        <div className="bg-magenta-400 text-black px-4 py-1">
          <span className="font-bold">INSTALLATION</span>
        </div>
        <div className="p-6 space-y-3 text-magenta-400">
          <div><span className="text-yellow-400">$</span> npm install -g @mx2lm/cli</div>
          <div><span className="text-yellow-400">$</span> mx2lm init --config</div>
          <div><span className="text-yellow-400">$</span> mx2lm models --add phi-3-mini</div>
          <div><span className="text-yellow-400">$</span> mx2lm quantize --method awq --bits 4</div>
          <div className="text-gray-500 text-sm mt-2"># Ready to deploy your first model</div>
        </div>
      </div>

      {/* System Status */}
      <div className="max-w-5xl mx-auto border-2 border-green-400 bg-black mb-8">
        <div className="bg-green-400 text-black px-4 py-1">
          <span className="font-bold">SYSTEM STATUS</span>
        </div>
        <div className="p-6 space-y-2 text-green-400 text-sm">
          <div>Status: <span className="text-green-400 font-bold">ONLINE</span></div>
          <div>Models: <span className="text-green-400">3 available</span></div>
          <div>Endpoints: <span className="text-green-400">5 configured</span></div>
          <div>Storage: <span className="text-green-400">cPanel integrated</span></div>
          <div className="mt-4 text-gray-600">Last updated: {new Date().toISOString()}</div>
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