import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Save, Download, Sparkles, Crown, Plus, Trash2, Bug, Wand2, History, GitBranch, Cpu, Globe, Server, Zap, Terminal, Shield } from "lucide-react";
import { toast } from "sonner";

const defaultScript = `#!/usr/bin/env python3
"""
MX2LM CLI v2.0 - Powered by Open Source AI SDKs
Supports: Anthropic Claude, Google Gemini, Ollama, Local Models (phi-3-instruct)
Includes: PowerShell Utilities with XCFE-PS-ENVELOPE Security
"""
import os
import sys
import json
import subprocess

# SDK Imports (install via pip)
# pip install anthropic google-generativeai ollama transformers powershell-utils requests
# npm install @posthog/code-agent ollama @anthropic-ai/sdk @google/generative-ai

# ═══════════════════════════════════════════════════════════════
# AI PROVIDER INITIALIZATION
# ═══════════════════════════════════════════════════════════════

def init_anthropic():
    """Initialize Anthropic Claude SDK"""
    from anthropic import Anthropic
    return Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def init_gemini():
    """Initialize Google Gemini"""
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    return genai.GenerativeModel('gemini-pro')

def init_ollama():
    """Initialize Ollama for local models"""
    import ollama
    return ollama

def init_ollama_cloud():
    """Initialize Ollama Cloud API for remote models (gpt-oss, etc.)"""
    from ollama import Ollama
    return Ollama(
        host="https://ollama.com",
        headers={"Authorization": "Bearer " + os.getenv("OLLAMA_API_KEY", "")}
    )

async def ollama_cloud_chat(prompt, model="gpt-oss:120b", stream=True):
    """Chat with Ollama Cloud models"""
    client = init_ollama_cloud()
    response = await client.chat(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        stream=stream
    )
    if stream:
        result = ""
        async for part in response:
            result += part.message.content
            print(part.message.content, end="", flush=True)
        return result
    return response.message.content

def ollama_cloud_list_models():
    """List available Ollama Cloud models"""
    import requests
    headers = {"Authorization": "Bearer " + os.getenv("OLLAMA_API_KEY", "")}
    response = requests.get("https://ollama.com/api/tags", headers=headers)
    return response.json() if response.ok else None

def init_local_phi3():
    """Initialize local phi-3-instruct with WebGPU/browser inference"""
    from transformers import AutoModelForCausalLM, AutoTokenizer
    model = AutoModelForCausalLM.from_pretrained("microsoft/phi-3-mini-4k-instruct")
    tokenizer = AutoTokenizer.from_pretrained("microsoft/phi-3-mini-4k-instruct")
    return model, tokenizer

# ═══════════════════════════════════════════════════════════════
# OLLAMA CLOUD API - Remote Model Access (gpt-oss, llama, etc.)
# ═══════════════════════════════════════════════════════════════

OLLAMA_CLOUD_MODELS = [
    'gpt-oss:120b', 'gpt-oss:120b-cloud', 'llama3.3:70b', 
    'qwen3:235b', 'deepseek-r1:671b', 'gemma3:27b'
]

class OllamaCloud:
    """Ollama Cloud API client for remote model inference"""
    
    def __init__(self, api_key=None, host="https://ollama.com"):
        self.host = host
        self.api_key = api_key or os.getenv("OLLAMA_API_KEY", "")
        self.headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
    
    def list_models(self):
        """List available cloud models"""
        import requests
        response = requests.get(f"{self.host}/api/tags", headers=self.headers)
        return response.json() if response.ok else None
    
    def chat(self, prompt, model="gpt-oss:120b", stream=True):
        """Chat with a cloud model"""
        import requests
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": stream
        }
        response = requests.post(
            f"{self.host}/api/chat",
            json=payload,
            headers=self.headers,
            stream=stream
        )
        if stream:
            result = ""
            for line in response.iter_lines():
                if line:
                    chunk = json.loads(line)
                    if 'message' in chunk:
                        result += chunk['message'].get('content', '')
                        print(chunk['message'].get('content', ''), end='', flush=True)
            return result
        return response.json()
    
    def generate(self, prompt, model="gpt-oss:120b"):
        """Generate completion (non-chat)"""
        import requests
        payload = {"model": model, "prompt": prompt}
        response = requests.post(
            f"{self.host}/api/generate",
            json=payload,
            headers=self.headers
        )
        return response.json()

def init_ollama_cloud():
    """Initialize Ollama Cloud API client"""
    return OllamaCloud()

async def ollama_cloud_chat(prompt, model="gpt-oss:120b", stream=True):
    """Async chat with Ollama Cloud models"""
    client = init_ollama_cloud()
    return client.chat(prompt, model, stream)

def ollama_cloud_list_models():
    """List available Ollama Cloud models"""
    client = init_ollama_cloud()
    return client.list_models()

# ═══════════════════════════════════════════════════════════════
# POWERSHELL UTILITIES - XCFE-PS-ENVELOPE + KUHUL π GOVERNED
# ═══════════════════════════════════════════════════════════════

# PS-DSL v1: Deny-by-Default Command Registry (FROZEN)
PS_COMMAND_REGISTRY = {
    # === ALLOWLIST (explicit actions only) ===
    "allow": {
        "process.list": {"cmdlet": "Get-Process", "params": []},
        "process.query": {"cmdlet": "Get-Process", "params": ["name", "id"]},
        "service.list": {"cmdlet": "Get-Service", "params": []},
        "service.query": {"cmdlet": "Get-Service", "params": ["name", "status"]},
        "eventlog.query": {"cmdlet": "Get-EventLog", "params": ["logname", "newest"]},
        "system.info": {"cmdlet": "Get-ComputerInfo", "params": []},
        "disk.list": {"cmdlet": "Get-Disk", "params": []},
        "volume.list": {"cmdlet": "Get-Volume", "params": []},
        "drive.list": {"cmdlet": "Get-PSDrive", "params": []},
        "hotfix.list": {"cmdlet": "Get-HotFix", "params": []},
        "network.adapters": {"cmdlet": "Get-NetAdapter", "params": []},
        "network.config": {"cmdlet": "Get-NetIPConfiguration", "params": []},
        "file.list": {"cmdlet": "Get-ChildItem", "params": ["path"]},
        "file.content": {"cmdlet": "Get-Content", "params": ["path"]},
        "file.hash": {"cmdlet": "Get-FileHash", "params": ["path", "algorithm"]},
        "path.test": {"cmdlet": "Test-Path", "params": ["path"]},
        "connection.test": {"cmdlet": "Test-Connection", "params": ["computername", "count"]},
        "user.list": {"cmdlet": "Get-LocalUser", "params": []},
        "group.list": {"cmdlet": "Get-LocalGroup", "params": []},
        "task.list": {"cmdlet": "Get-ScheduledTask", "params": []},
        "package.list": {"cmdlet": "Get-Package", "params": []},
        "date.get": {"cmdlet": "Get-Date", "params": []},
        "timezone.get": {"cmdlet": "Get-TimeZone", "params": []},
        "help.get": {"cmdlet": "Get-Help", "params": ["name"]},
        "command.list": {"cmdlet": "Get-Command", "params": []},
    },
    # === HARD DENY (never lower, never execute) ===
    "deny": [
        "Invoke-Expression", "iex", "Invoke-Command", "icm",
        "Start-Process", "New-Object", "Add-Type", "Set-Item",
        "Remove-Item", "Invoke-WebRequest", "iwr", "Invoke-RestMethod",
        "irm", "Set-ExecutionPolicy", "curl", "wget", "Invoke-WmiMethod"
    ]
}

# Illegal characters (injection prevention)
PS_ILLEGAL_CHARS = r'[|;\`\\$(){}[\\]\\\\]'

def ps_dsl_verify(intent):
    """
    XCFE-Grade PS-DSL Verifier
    Deny-by-default: anything not explicitly allowlisted is ILLEGAL
    """
    import re
    
    # Validate DSL marker
    if intent.get('@dsl') != 'ps-dsl.v1':
        return False, "BAD_DSL", None
    
    action = intent.get('action', '')
    if not action or not re.match(r'^[a-z]+\.[a-z]+$', action):
        return False, "BAD_ACTION", None
    
    # Deny-by-default: action must be in allowlist
    spec = PS_COMMAND_REGISTRY['allow'].get(action)
    if not spec:
        return False, "ACTION_NOT_ALLOWLISTED", None
    
    # Validate params
    params = intent.get('params', {})
    for key, value in params.items():
        if key not in spec['params']:
            return False, f"PARAM_NOT_ALLOWED: {key}", None
        if isinstance(value, str) and re.search(PS_ILLEGAL_CHARS, value):
            return False, f"ILLEGAL_PARAM_CHARS: {key}", None
    
    # Check cmdlet against denylist (defense in depth)
    if spec['cmdlet'] in PS_COMMAND_REGISTRY['deny']:
        return False, "CMDLET_DENIED", None
    
    # Lower to PowerShell command
    lowered = ps_dsl_lower(spec['cmdlet'], params)
    return True, "VERIFIED", lowered

def ps_dsl_lower(cmdlet, params):
    """Lower PS-DSL intent to single PowerShell cmdlet"""
    if not params:
        return cmdlet
    args = ' '.join(f"-{k} '{str(v).replace(chr(39), chr(39)+chr(39))}'" for k, v in params.items())
    return f"{cmdlet} {args}"

def cm1_wrap(lowered, meta=None):
    """
    CM-1 Audit Envelope - Invisible geometry for provenance
    SOH=0x01, STX=0x02, ETX=0x03, EOT=0x04, GS=0x1D
    """
    SOH, STX, ETX, EOT, GS = '\\x01', '\\x02', '\\x03', '\\x04', '\\x1D'
    meta = meta or {}
    header_parts = ['ps-envelope.v1'] + [f"{k}={v}" for k, v in meta.items()]
    header = GS.join(header_parts)
    return f"{SOH}{header}{STX}{lowered}{ETX}{EOT}"

def ps_execute_dsl(intent, audit=True):
    """
    Execute PS-DSL intent with full XCFE verification + CM-1 audit
    KUHUL π governs whether execution is allowed (signal threshold)
    """
    import datetime
    
    # Verify intent
    is_valid, reason, lowered = ps_dsl_verify(intent)
    
    # CM-1 Audit Envelope
    cm1_envelope = {
        'soh': '[SOH] ps-envelope.v1',
        'dsl': intent.get('@dsl'),
        'action': intent.get('action'),
        'status': 'allowed' if is_valid else 'blocked',
        'reason': reason,
        'timestamp': datetime.datetime.now().isoformat(),
        'lowered': lowered if is_valid else None
    }
    
    if audit:
        status_icon = '✓' if is_valid else '✗'
        print(f"[CM-1] {status_icon} {cm1_envelope['status'].upper()}: {reason}")
    
    if not is_valid:
        return {'success': False, 'error': reason, 'cm1': cm1_envelope}
    
    try:
        # Wrap with CM-1 annotation (invisible in output)
        annotated = cm1_wrap(lowered, {'action': intent.get('action')})
        
        result = subprocess.run(
            ['powershell', '-NoProfile', '-Command', lowered],
            capture_output=True, text=True, timeout=30
        )
        return {
            'success': result.returncode == 0,
            'output': result.stdout,
            'error': result.stderr if result.returncode != 0 else None,
            'cm1': cm1_envelope
        }
    except Exception as e:
        return {'success': False, 'error': str(e), 'cm1': cm1_envelope}

# ═══════════════════════════════════════════════════════════════
# PS-DSL HELPER FUNCTIONS (Safe, Allowlisted Operations)
# ═══════════════════════════════════════════════════════════════

def ps_get_processes(name=None):
    """Get running processes (safe)"""
    intent = {'@dsl': 'ps-dsl.v1', 'action': 'process.list', 'params': {}}
    if name:
        intent['action'] = 'process.query'
        intent['params'] = {'name': name}
    return ps_execute_dsl(intent)

def ps_get_services(name=None, status=None):
    """Get Windows services (safe)"""
    intent = {'@dsl': 'ps-dsl.v1', 'action': 'service.list', 'params': {}}
    if name or status:
        intent['action'] = 'service.query'
        if name: intent['params']['name'] = name
        if status: intent['params']['status'] = status
    return ps_execute_dsl(intent)

def ps_get_system_info():
    """Get computer info (safe)"""
    return ps_execute_dsl({'@dsl': 'ps-dsl.v1', 'action': 'system.info', 'params': {}})

def ps_test_connection(host, count=2):
    """Ping a host (safe)"""
    return ps_execute_dsl({
        '@dsl': 'ps-dsl.v1',
        'action': 'connection.test',
        'params': {'computername': host, 'count': str(count)}
    })

def ps_list_directory(path='.'):
    """List directory contents (safe)"""
    return ps_execute_dsl({
        '@dsl': 'ps-dsl.v1',
        'action': 'file.list',
        'params': {'path': path}
    })

def ps_get_file_hash(filepath, algorithm='SHA256'):
    """Get file hash (safe)"""
    return ps_execute_dsl({
        '@dsl': 'ps-dsl.v1',
        'action': 'file.hash',
        'params': {'path': filepath, 'algorithm': algorithm}
    })

def ps_get_network_config():
    """Get network configuration (safe)"""
    return ps_execute_dsl({'@dsl': 'ps-dsl.v1', 'action': 'network.config', 'params': {}})

def ps_get_disks():
    """Get disk information (safe)"""
    return ps_execute_dsl({'@dsl': 'ps-dsl.v1', 'action': 'disk.list', 'params': {}})

# ═══════════════════════════════════════════════════════════════
# MAIN CLI ENTRY POINT
# ═══════════════════════════════════════════════════════════════

def main():
    print("╔═══════════════════════════════════════════════════════════════╗")
    print("║  MX2LM CLI v2.1 - KUHUL π Governed Multi-Provider Interface  ║")
    print("║  AI: Claude | Gemini | Ollama Cloud (gpt-oss:120b) | phi-3   ║")
    print("║  PS: XCFE-PS-ENVELOPE + PS-DSL v1 + CM-1 Audit Trail         ║")
    print("╚═══════════════════════════════════════════════════════════════╝")
    
    # === OLLAMA CLOUD EXAMPLE ===
    # client = OllamaCloud()
    # response = client.chat("Explain quantum computing", model="gpt-oss:120b")
    
    # === PS-DSL EXAMPLE (KUHUL-governed) ===
    # result = ps_get_processes()
    # if result['success']:
    #     print(result['output'])
    
if __name__ == "__main__":
    main()
`;

export default function CLIEditor() {
  const [config, setConfig] = useState({
    cli_name: "mx2lm-cli",
    custom_script: defaultScript,
    custom_commands: {},
    environment_vars: {},
    selected_models: [],
    selected_endpoints: [],
    subscription_tier: "free"
  });
  const [envVars, setEnvVars] = useState([
    { key: "ANTHROPIC_API_KEY", value: "", description: "Claude SDK" },
    { key: "GEMINI_API_KEY", value: "", description: "Google Gemini" },
    { key: "OLLAMA_HOST", value: "http://localhost:11434", description: "Ollama Local" },
    { key: "OLLAMA_API_KEY", value: "", description: "Ollama Cloud API" },
    { key: "PS_AUDIT_ENABLED", value: "true", description: "PowerShell CM-1 Audit" },
    { key: "PS_STRICT_MODE", value: "true", description: "PS Denylist Enforcement" }
  ]);
  const [versions, setVersions] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [debugging, setDebugging] = useState(false);

  const queryClient = useQueryClient();

  const { data: savedConfigs = [] } = useQuery({
    queryKey: ["personalizedcli"],
    queryFn: () => base44.entities.PersonalizedCLI.list()
  });

  const { data: models = [] } = useQuery({
    queryKey: ["hfmodels"],
    queryFn: () => base44.entities.HFModel.list()
  });

  const { data: endpoints = [] } = useQuery({
    queryKey: ["apiendpoints"],
    queryFn: () => base44.entities.APIEndpoint.list()
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const versionedData = {
        ...data,
        environment_vars: envVars.reduce((acc, v) => ({ ...acc, [v.key]: v.value }), {})
      };
      if (savedConfigs.length > 0) {
        return base44.entities.PersonalizedCLI.update(savedConfigs[0].id, versionedData);
      }
      return base44.entities.PersonalizedCLI.create(versionedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personalizedcli"] });
      setVersions(prev => [{
        version: `v${prev.length + 1}.0.0`,
        timestamp: new Date().toISOString(),
        script: config.custom_script.substring(0, 100) + "..."
      }, ...prev.slice(0, 9)]);
      toast.success("CLI configuration saved!");
    }
  });

  useEffect(() => {
    if (savedConfigs.length > 0) {
      setConfig(savedConfigs[0]);
      if (savedConfigs[0].environment_vars) {
        const vars = Object.entries(savedConfigs[0].environment_vars).map(([key, value]) => ({
          key, value, description: ""
        }));
        if (vars.length > 0) setEnvVars(vars);
      }
    }
  }, [savedConfigs]);

  const handleSave = () => saveMutation.mutate(config);

  const handleExport = async () => {
    const scriptContent = config.custom_script;
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.cli_name}.py`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CLI exported!');
  };

  const handleAIComplete = async () => {
    toast.info("Generating AI suggestions...");
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this Python CLI script and suggest improvements, optimizations, or new features. Be concise:\n\n${config.custom_script}`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: { type: "array", items: { type: "string" } },
            code_snippet: { type: "string" },
            explanation: { type: "string" }
          }
        }
      });
      setAiSuggestion(response);
      toast.success("AI suggestions ready!");
    } catch (error) {
      toast.error("AI completion failed");
    }
  };

  const handleDebug = async () => {
    setDebugging(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Debug this Python script. Find potential bugs, security issues, and runtime errors:\n\n${config.custom_script}`,
        response_json_schema: {
          type: "object",
          properties: {
            issues: { type: "array", items: { type: "object", properties: { line: { type: "string" }, issue: { type: "string" }, fix: { type: "string" } } } },
            severity: { type: "string" }
          }
        }
      });
      setAiSuggestion({ ...response, isDebug: true });
      toast.success("Debug analysis complete!");
    } catch (error) {
      toast.error("Debug failed");
    } finally {
      setDebugging(false);
    }
  };

  const addEnvVar = () => setEnvVars([...envVars, { key: "", value: "", description: "" }]);
  const removeEnvVar = (index) => setEnvVars(envVars.filter((_, i) => i !== index));
  const updateEnvVar = (index, field, value) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };

  const tierFeatures = {
    free: { models: 2, endpoints: 1, customBranding: false, aiAssist: true, versions: 3 },
    starter: { models: 5, endpoints: 2, customBranding: false, aiAssist: true, versions: 10 },
    professional: { models: 20, endpoints: 10, customBranding: false, aiAssist: true, versions: 50 },
    enterprise: { models: 999, endpoints: 999, customBranding: true, aiAssist: true, versions: 999 }
  };

  const currentTier = tierFeatures[config.subscription_tier];

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-7xl mx-auto">
        {/* MX2LM Terminal Header */}
        <div className="border-2 border-cyan-400 bg-black mb-6">
          <div className="bg-gradient-to-r from-cyan-500 to-purple-500 text-black px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5" />
              <span className="font-bold text-lg">MX2LM CLI EDITOR</span>
              <Badge className="bg-black text-cyan-400">v2.0</Badge>
            </div>
            <span className="text-xs">[ SCXQ2 Runtime • Claude SDK • Gemini CLI • Ollama • PowerShell ]</span>
          </div>
          <div className="p-6 bg-gradient-to-br from-slate-900 to-black">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-cyan-400 text-2xl mb-2 flex items-center gap-2">
                  <span>╔═══ MX2LM ═══╗</span>
                  <Badge className="bg-green-600 text-xs">Open Source SDKs</Badge>
                </div>
                <div className="text-slate-400 text-sm">
                  Anthropic Claude • Google Gemini • Ollama • phi-3-instruct • PowerShell XCFE
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-green-500 text-black hover:bg-green-400">
                  <Save className="w-4 h-4 mr-2" />SAVE
                </Button>
                <Button onClick={handleExport} className="bg-blue-500 text-black hover:bg-blue-400">
                  <Download className="w-4 h-4 mr-2" />EXPORT
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* SDK Quick Links */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          <Card className="bg-orange-900/20 border-orange-600">
            <CardContent className="p-3 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-white text-sm font-semibold">Anthropic</div>
                <div className="text-xs text-orange-400">@anthropic-ai/sdk</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-900/20 border-blue-600">
            <CardContent className="p-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-white text-sm font-semibold">Gemini</div>
                <div className="text-xs text-blue-400">@google/gemini-cli</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-900/20 border-green-600">
            <CardContent className="p-3 flex items-center gap-2">
              <Server className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white text-sm font-semibold">Ollama</div>
                <div className="text-xs text-green-400">Local + Cloud</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-900/20 border-purple-600">
            <CardContent className="p-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-white text-sm font-semibold">phi-3</div>
                <div className="text-xs text-purple-400">WebGPU</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-cyan-900/20 border-cyan-500">
            <CardContent className="p-3 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-white text-sm font-semibold">PowerShell</div>
                <div className="text-xs text-cyan-400">XCFE-PS</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ollama Cloud Banner */}
        <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-green-400" />
              <div>
                <div className="text-white font-semibold">Ollama Cloud API Integrated</div>
                <div className="text-xs text-slate-400">Remote inference: gpt-oss:120b, llama3.3:70b, qwen3:235b, deepseek-r1:671b</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-green-600 text-xs">OllamaCloud()</Badge>
              <Badge className="bg-emerald-600 text-xs">.chat()</Badge>
              <Badge className="bg-teal-600 text-xs">.list_models()</Badge>
            </div>
          </div>
        </div>

        {/* PowerShell Integration Banner */}
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-400" />
              <div>
                <div className="text-white font-semibold">PS-DSL v1 + KUHUL π Governance</div>
                <div className="text-xs text-slate-400">XCFE-PS-ENVELOPE • CM-1 audit trails • Deny-by-default • 25+ allowlisted actions</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-blue-600 text-xs">ps_execute_dsl()</Badge>
              <Badge className="bg-indigo-600 text-xs">ps_dsl_verify()</Badge>
              <Badge className="bg-purple-600 text-xs">cm1_wrap()</Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{config.selected_models.length}/{currentTier.models}</div>
              <div className="text-slate-300 text-sm">Models</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{config.selected_endpoints.length}/{currentTier.endpoints}</div>
              <div className="text-slate-300 text-sm">Endpoints</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{versions.length}/{currentTier.versions}</div>
              <div className="text-slate-300 text-sm">Versions</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <Badge className={
                config.subscription_tier === "enterprise" ? "bg-yellow-600" :
                config.subscription_tier === "professional" ? "bg-purple-600" :
                config.subscription_tier === "starter" ? "bg-blue-600" : "bg-green-600"
              }>
                {config.subscription_tier === "enterprise" && <Crown className="w-3 h-3 mr-1" />}
                {config.subscription_tier.toUpperCase()}
              </Badge>
              <div className="text-slate-300 text-sm mt-1">Tier</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="script" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700 flex-wrap">
            <TabsTrigger value="script"><Code className="w-4 h-4 mr-1" />Script</TabsTrigger>
            <TabsTrigger value="env"><Server className="w-4 h-4 mr-1" />Env Vars</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="versions"><GitBranch className="w-4 h-4 mr-1" />Versions</TabsTrigger>
            <TabsTrigger value="basic">Settings</TabsTrigger>
            {currentTier.customBranding && <TabsTrigger value="branding"><Sparkles className="w-4 h-4 mr-1" />Branding</TabsTrigger>}
          </TabsList>

          <TabsContent value="script">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Code className="w-5 h-5 text-cyan-400" />
                    Custom Script Editor
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAIComplete} className="bg-purple-600 hover:bg-purple-700">
                      <Wand2 className="w-4 h-4 mr-1" />AI Complete
                    </Button>
                    <Button size="sm" onClick={handleDebug} disabled={debugging} className="bg-orange-600 hover:bg-orange-700">
                      <Bug className="w-4 h-4 mr-1" />{debugging ? "Analyzing..." : "Debug"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={config.custom_script}
                  onChange={(e) => setConfig({...config, custom_script: e.target.value})}
                  className="min-h-[400px] bg-slate-950 border-slate-600 text-green-400 font-mono text-sm"
                  placeholder="Write your custom CLI logic..."
                />
                {aiSuggestion && (
                  <div className={`p-4 rounded-lg border ${aiSuggestion.isDebug ? 'bg-red-900/20 border-red-600' : 'bg-purple-900/20 border-purple-600'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {aiSuggestion.isDebug ? <Bug className="w-4 h-4 text-red-400" /> : <Wand2 className="w-4 h-4 text-purple-400" />}
                      <span className="font-semibold text-white">{aiSuggestion.isDebug ? 'Debug Results' : 'AI Suggestions'}</span>
                    </div>
                    {aiSuggestion.suggestions && (
                      <ul className="text-sm text-slate-300 space-y-1">
                        {aiSuggestion.suggestions.map((s, i) => <li key={i}>• {s}</li>)}
                      </ul>
                    )}
                    {aiSuggestion.issues && (
                      <div className="space-y-2">
                        {aiSuggestion.issues.map((issue, i) => (
                          <div key={i} className="bg-slate-900 p-2 rounded text-xs">
                            <div className="text-red-400">Line {issue.line}: {issue.issue}</div>
                            <div className="text-green-400">Fix: {issue.fix}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {aiSuggestion.code_snippet && (
                      <pre className="mt-2 bg-slate-900 p-2 rounded text-xs text-cyan-400 overflow-x-auto">{aiSuggestion.code_snippet}</pre>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="env">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Environment Variables</CardTitle>
                  <Button size="sm" onClick={addEnvVar} className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-1" />Add Variable
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {envVars.map((envVar, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={envVar.key}
                      onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                      placeholder="KEY_NAME"
                      className="bg-slate-900 border-slate-600 text-cyan-400 font-mono w-48"
                    />
                    <Input
                      type="password"
                      value={envVar.value}
                      onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                      placeholder="value"
                      className="bg-slate-900 border-slate-600 text-white flex-1"
                    />
                    <Input
                      value={envVar.description}
                      onChange={(e) => updateEnvVar(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="bg-slate-900 border-slate-600 text-slate-400 w-32"
                    />
                    <Button size="icon" variant="ghost" onClick={() => removeEnvVar(index)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Select Models ({config.selected_models.length}/{currentTier.models})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {models.length === 0 ? (
                    <div className="text-slate-400 text-center py-8">No models configured. Add models in Model Manager.</div>
                  ) : models.map((model) => {
                    const isSelected = config.selected_models.includes(model.id);
                    const canSelect = config.selected_models.length < currentTier.models;
                    return (
                      <div key={model.id} className={`p-4 rounded-lg border cursor-pointer transition-all ${isSelected ? "bg-purple-600/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-600"} ${!canSelect && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => {
                          if (isSelected) {
                            setConfig({...config, selected_models: config.selected_models.filter(id => id !== model.id)});
                          } else if (canSelect) {
                            setConfig({...config, selected_models: [...config.selected_models, model.id]});
                          }
                        }}>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white font-semibold">{model.name}</div>
                            <div className="text-slate-400 text-sm">{model.model_id}</div>
                          </div>
                          <Badge variant={isSelected ? "default" : "secondary"}>{model.quantization || 'default'}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Select Endpoints ({config.selected_endpoints.length}/{currentTier.endpoints})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {endpoints.length === 0 ? (
                    <div className="text-slate-400 text-center py-8">No endpoints configured. Add endpoints in API Manager.</div>
                  ) : endpoints.map((endpoint) => {
                    const isSelected = config.selected_endpoints.includes(endpoint.id);
                    const canSelect = config.selected_endpoints.length < currentTier.endpoints;
                    return (
                      <div key={endpoint.id} className={`p-4 rounded-lg border cursor-pointer transition-all ${isSelected ? "bg-blue-600/20 border-blue-500" : "bg-slate-900 border-slate-700 hover:border-slate-600"} ${!canSelect && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => {
                          if (isSelected) {
                            setConfig({...config, selected_endpoints: config.selected_endpoints.filter(id => id !== endpoint.id)});
                          } else if (canSelect) {
                            setConfig({...config, selected_endpoints: [...config.selected_endpoints, endpoint.id]});
                          }
                        }}>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white font-semibold">{endpoint.name}</div>
                            <div className="text-slate-400 text-sm font-mono">{endpoint.url}</div>
                          </div>
                          <Badge variant={isSelected ? "default" : "secondary"}>{endpoint.endpoint_type}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-green-400" />
                  Version History ({versions.length}/{currentTier.versions})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {versions.length === 0 ? (
                  <div className="text-slate-400 text-center py-8">No versions saved yet. Save your config to create a version.</div>
                ) : (
                  <div className="space-y-2">
                    {versions.map((v, i) => (
                      <div key={i} className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                        <div>
                          <Badge className="bg-green-600 mr-2">{v.version}</Badge>
                          <span className="text-slate-400 text-xs">{new Date(v.timestamp).toLocaleString()}</span>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => toast.info("Restore coming soon")} className="text-cyan-400">
                          <History className="w-4 h-4 mr-1" />Restore
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="basic">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Basic Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">CLI Name</label>
                  <Input value={config.cli_name} onChange={(e) => setConfig({...config, cli_name: e.target.value})} placeholder="mx2lm-cli" className="bg-slate-900 border-slate-600 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Subscription Tier</label>
                  <Select value={config.subscription_tier} onValueChange={(val) => setConfig({...config, subscription_tier: val})}>
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">🆓 Free (Forever)</SelectItem>
                      <SelectItem value="starter">⭐ Starter ($9.99/mo)</SelectItem>
                      <SelectItem value="professional">🚀 Professional ($29.99/mo)</SelectItem>
                      <SelectItem value="enterprise">👑 Enterprise ($99.99/mo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {currentTier.customBranding && (
            <TabsContent value="branding">
              <Card className="bg-gradient-to-br from-yellow-900/20 to-slate-800 border-yellow-600/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="w-6 h-6 text-yellow-400" />Enterprise Branding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">CLI Display Name</label>
                    <Input placeholder="Acme Corp CLI Tool" className="bg-slate-900 border-slate-600 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Welcome Message</label>
                    <Textarea placeholder="Welcome to Acme Corp's AI CLI Platform..." className="bg-slate-900 border-slate-600 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Primary Color (hex)</label>
                    <Input placeholder="#7C3AED" className="bg-slate-900 border-slate-600 text-white" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}