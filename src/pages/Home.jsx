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
            <span className="text-xs">[ root@nexus ~ ]</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="text-green-400">
              <span className="text-yellow-400">$</span> ./welcome.sh
            </div>
            <div className="ml-4 space-y-2">
              <div>╔════════════════════════════════════════════════════════════╗</div>
              <div>║  Nexus Studio - Hugging Face Model Management Playground  ║</div>
              <div>║  v2.0 | Powered by Phi-3, Gemma, DeepSeek                ║</div>
              <div>╚════════════════════════════════════════════════════════════╝</div>
              <div className="mt-4 text-blue-400">
                Welcome to Nexus Studio. Configure, manage, and deploy 
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
              <div className="text-cyan-400">$ nexus models --list</div>
              <div className="text-green-400 text-sm ml-4">Manage Hugging Face models and quantization settings</div>
            </Link>
            <Link to={createPageUrl("APIManager")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ nexus endpoints --configure</div>
              <div className="text-green-400 text-sm ml-4">Set up API endpoints and runtime connections</div>
            </Link>
            <Link to={createPageUrl("CLIPlayground")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ nexus playground --test</div>
              <div className="text-green-400 text-sm ml-4">Test models and generate CLI configurations</div>
            </Link>
            <Link to={createPageUrl("CLIEditor")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ nexus cli --personalize</div>
              <div className="text-green-400 text-sm ml-4">Create custom CLI with your preferred models</div>
            </Link>
            <Link to={createPageUrl("Monitoring")} className="block hover:bg-green-900/30 p-3 transition">
              <div className="text-cyan-400">$ nexus monitor --dashboard</div>
              <div className="text-green-400 text-sm ml-4">Track performance metrics and system health</div>
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

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Everything You Need for CLI Model Management
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-purple-500 transition-all">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Cpu className="w-8 h-8 text-purple-400" />
                  Model Registry
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <p className="mb-4">Manage Hugging Face models with full quantization support:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    Phi-3 Mini & Lite variants
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-400" />
                    Gemma code models
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-400" />
                    DeepSeek Coder series
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    INT4/INT8/GGUF quantization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-green-500 transition-all">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <LinkIcon className="w-8 h-8 text-green-400" />
                  API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <p className="mb-4">Configure connections to your model infrastructure:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-green-400" />
                    Hugging Face Inference API
                  </li>
                  <li className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-orange-400" />
                    Custom runtime endpoints
                  </li>
                  <li className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-blue-400" />
                    cPanel file storage integration
                  </li>
                  <li className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-purple-400" />
                    Secure API key management
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-blue-500 transition-all">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Terminal className="w-8 h-8 text-blue-400" />
                  CLI Playground
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <p className="mb-4">Test and validate your model configurations:</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-blue-400" />
                    Interactive testing interface
                  </li>
                  <li className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-purple-400" />
                    Generate CLI configs
                  </li>
                  <li className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-green-400" />
                    Export model settings
                  </li>
                  <li className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-yellow-400" />
                    Real-time output preview
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-2xl">
                <Settings className="w-8 h-8 text-purple-400" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 rounded-lg p-6 font-mono text-sm space-y-4">
                <div>
                  <div className="text-slate-400 mb-2"># Step 1: Add your Hugging Face models</div>
                  <div className="text-purple-400">→ Navigate to Model Manager</div>
                </div>
                
                <div>
                  <div className="text-slate-400 mb-2"># Step 2: Configure API endpoints</div>
                  <div className="text-green-400">→ Set up your HF tokens and runtime URLs</div>
                </div>
                
                <div>
                  <div className="text-slate-400 mb-2"># Step 3: Test in the playground</div>
                  <div className="text-blue-400">→ Validate your configurations</div>
                </div>
                
                <div>
                  <div className="text-slate-400 mb-2"># Step 4: Export and integrate</div>
                  <div className="text-yellow-400">→ Download configs for your CLI tool</div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <Link to={createPageUrl("ModelManager")} className="flex-1">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Get Started
                  </Button>
                </Link>
                <Link to={createPageUrl("APIManager")} className="flex-1">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                    Configure APIs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-purple-300">CLI.MX2LM.COM</span>
          </div>
          <p className="text-sm">
            Hugging Face model management playground for quantized coding models
          </p>
        </div>
      </footer>
    </div>
  );
}