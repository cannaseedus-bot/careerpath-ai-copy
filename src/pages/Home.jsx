import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Cpu, Link as LinkIcon, Play, Zap, Code, Layers, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-3 bg-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-6 py-3">
              <Terminal className="w-6 h-6 text-purple-400" />
              <span className="text-purple-200 font-semibold">CLI.MX2LM.COM</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Hugging Face Model
            <br />Management Playground
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
            Configure, manage, and test <span className="text-purple-400 font-semibold">Phi-3</span>, <span className="text-blue-400 font-semibold">Gemma</span>, and <span className="text-green-400 font-semibold">DeepSeek</span> models with quantization support for your CLI tools
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl("ModelManager")}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                <Cpu className="w-6 h-6 mr-3" />
                Manage Models
              </Button>
            </Link>
            <Link to={createPageUrl("CLIPlayground")}>
              <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-600/20 px-8 py-6 text-lg">
                <Play className="w-6 h-6 mr-3" />
                Test Playground
              </Button>
            </Link>
          </div>
        </div>
      </section>

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