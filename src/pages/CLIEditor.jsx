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
MX2LM CLI v3.0 - Hybrid Multi-Agent CLI Framework
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Core: @posthog/code-agent (unified agent framework)
Sub-CLIs: /claude, /gemini, /codex → spawn dedicated terminals
Includes: PowerShell XCFE-PS-ENVELOPE Security

ARCHITECTURE:
┌─────────────────────────────────────────────────┐
│           @posthog/code-agent (Core)            │
├─────────┬─────────┬─────────┬──────────────────┤
│ /claude │ /gemini │ /codex  │ /ollama /phi3    │
│ Claude  │ Gemini  │ OpenAI  │ Local + Cloud    │
│  Code   │  CLI    │ Codex   │ Models           │
└─────────┴─────────┴─────────┴──────────────────┘
"""
import os
import sys
import json
import subprocess
import shutil
from typing import Optional, Dict, Any

# ═══════════════════════════════════════════════════════════════
# PACKAGE DEPENDENCIES
# ═══════════════════════════════════════════════════════════════
# pip install anthropic google-generativeai ollama transformers powershell-utils requests
# npm install @posthog/code-agent @anthropic-ai/claude-code @anthropic-ai/sdk 
# npm install @google/generative-ai gemini-cli openai ollama

# ═══════════════════════════════════════════════════════════════
# HYBRID AGENT ROUTER - Sub-CLI Dispatcher
# ═══════════════════════════════════════════════════════════════

class AgentRouter:
    """
    Routes /command prefixes to dedicated CLI sub-terminals.
    Each agent has its own interactive mode when spawned.
    """
    
    AGENT_REGISTRY = {
        '/claude': {
            'name': 'Claude Code',
            'package': '@anthropic-ai/claude-code',
            'cmd': 'npx @anthropic-ai/claude-code',
            'env_key': 'ANTHROPIC_API_KEY',
            'description': 'Anthropic Claude Code CLI - agentic coding assistant'
        },
        '/gemini': {
            'name': 'Gemini CLI',
            'package': 'gemini-cli',
            'cmd': 'npx gemini-cli',
            'env_key': 'GEMINI_API_KEY',
            'description': 'Google Gemini CLI - multimodal AI assistant'
        },
        '/codex': {
            'name': 'OpenAI Codex',
            'package': 'openai',
            'cmd': 'npx openai',
            'env_key': 'OPENAI_API_KEY',
            'description': 'OpenAI CLI - GPT-4 and Codex models'
        },
        '/ollama': {
            'name': 'Ollama',
            'package': 'ollama',
            'cmd': 'ollama run',
            'env_key': 'OLLAMA_HOST',
            'description': 'Ollama local/cloud model runner'
        },
        '/phi3': {
            'name': 'Phi-3 Local',
            'package': 'transformers',
            'cmd': 'python -m mx2lm.phi3_runner',
            'env_key': None,
            'description': 'Microsoft Phi-3 local inference'
        },
        '/posthog': {
            'name': 'PostHog Code Agent',
            'package': '@posthog/code-agent',
            'cmd': 'npx @posthog/code-agent',
            'env_key': 'POSTHOG_API_KEY',
            'description': 'PostHog unified code agent framework'
        }
    }
    
    @classmethod
    def parse_command(cls, input_str: str) -> tuple:
        """Parse input for /agent prefix"""
        input_str = input_str.strip()
        for prefix, config in cls.AGENT_REGISTRY.items():
            if input_str.startswith(prefix):
                remaining = input_str[len(prefix):].strip()
                return prefix, config, remaining
        return None, None, input_str
    
    @classmethod
    def spawn_agent(cls, prefix: str, args: str = '', interactive: bool = True):
        """
        Spawn a dedicated sub-terminal for the selected agent.
        Returns control to parent CLI when agent exits.
        """
        config = cls.AGENT_REGISTRY.get(prefix)
        if not config:
            print(f"[MX2LM] Unknown agent: {prefix}")
            return False
        
        # Check API key requirement
        if config['env_key'] and not os.getenv(config['env_key']):
            print(f"[MX2LM] ⚠️  Missing env: {config['env_key']}")
            print(f"[MX2LM] Set it with: export {config['env_key']}=your_key")
            return False
        
        cmd = config['cmd']
        if args:
            cmd = f"{cmd} {args}"
        
        print(f"")
        print(f"╔═══════════════════════════════════════════════════════════════╗")
        print(f"║  Launching: {config['name']:<49}║")
        print(f"║  {config['description']:<59}║")
        print(f"║  Exit with: Ctrl+C or 'exit' to return to MX2LM              ║")
        print(f"╚═══════════════════════════════════════════════════════════════╝")
        print(f"")
        
        try:
            if interactive:
                # Spawn interactive sub-terminal
                subprocess.run(cmd, shell=True, env=os.environ.copy())
            else:
                # Run single command and return output
                result = subprocess.run(
                    cmd, shell=True, capture_output=True, text=True, 
                    env=os.environ.copy(), timeout=120
                )
                return result.stdout
        except KeyboardInterrupt:
            print(f"\\n[MX2LM] Returning to main CLI...")
        except subprocess.TimeoutExpired:
            print(f"[MX2LM] Agent timeout (120s)")
        except Exception as e:
            print(f"[MX2LM] Agent error: {e}")
        
        return True
    
    @classmethod
    def list_agents(cls):
        """List all available agent sub-commands"""
        print("\\n╔═══════════════════════════════════════════════════════════════╗")
        print("║               MX2LM Available Agent Sub-CLIs                  ║")
        print("╠═══════════════════════════════════════════════════════════════╣")
        for prefix, config in cls.AGENT_REGISTRY.items():
            status = "✓" if not config['env_key'] or os.getenv(config['env_key']) else "○"
            print(f"║  {status} {prefix:<10} │ {config['name']:<15} │ {config['package']:<20}║")
        print("╚═══════════════════════════════════════════════════════════════╝")
        print("\\nUsage: /claude [prompt]  or  /gemini  or  /codex chat 'question'")
        print("       Type just the prefix (e.g., /claude) to enter interactive mode\\n")


# ═══════════════════════════════════════════════════════════════
# @posthog/code-agent CORE INTEGRATION
# ═══════════════════════════════════════════════════════════════

class PostHogCodeAgent:
    """
    Core agent framework wrapper - all sub-CLIs can be orchestrated through this.
    Provides unified context, memory, and tool access across agents.
    """
    
    def __init__(self):
        self.context = {}
        self.memory = []
        self.active_agent = None
    
    def set_context(self, key: str, value: Any):
        """Set shared context accessible by all sub-agents"""
        self.context[key] = value
    
    def run(self, prompt: str, agent: str = 'auto'):
        """
        Run a prompt through the selected agent or auto-detect.
        Auto-detection routes based on prompt patterns.
        """
        # Check for explicit agent prefix
        prefix, config, remaining = AgentRouter.parse_command(prompt)
        
        if prefix:
            return AgentRouter.spawn_agent(prefix, remaining, interactive=False)
        
        # Auto-routing based on prompt analysis
        if agent == 'auto':
            if any(kw in prompt.lower() for kw in ['code', 'function', 'debug', 'refactor']):
                return self._run_with_agent('/claude', prompt)
            elif any(kw in prompt.lower() for kw in ['image', 'vision', 'describe', 'analyze']):
                return self._run_with_agent('/gemini', prompt)
            else:
                return self._run_with_agent('/codex', prompt)
        
        return self._run_with_agent(f'/{agent}', prompt)
    
    def _run_with_agent(self, prefix: str, prompt: str):
        """Internal agent execution"""
        self.active_agent = prefix
        return AgentRouter.spawn_agent(prefix, prompt, interactive=False)


# ═══════════════════════════════════════════════════════════════
# DIRECT SDK FALLBACKS (when CLI not available)
# ═══════════════════════════════════════════════════════════════

def init_anthropic():
    """Initialize Anthropic Claude SDK (direct API)"""
    from anthropic import Anthropic
    return Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def init_gemini():
    """Initialize Google Gemini (direct API)"""
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    return genai.GenerativeModel('gemini-pro')

def init_ollama():
    """Initialize Ollama for local models"""
    import ollama
    return ollama

def init_openai():
    """Initialize OpenAI SDK"""
    from openai import OpenAI
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ═══════════════════════════════════════════════════════════════
# OLLAMA CLOUD API - Remote Model Access
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
# MX2LM SERVER RUNTIME (MX2LM-SR-1)
# ═══════════════════════════════════════════════════════════════

class ServerRuntime:
    """
    MX2LM Server Runtime - KUHUL π governed, XCFE legal, CM-1 auditable
    Localhost-only, read-only, CLI-launched loop
    """
    
    DEFAULT_PORT = 4141
    
    def __init__(self, port=None):
        self.port = port or self.DEFAULT_PORT
        self.host = "127.0.0.1"
        self.state = {
            'uptime': 0,
            'requests': 0,
            'healthy': True,
            'last_tick': None
        }
        self.ws_clients = []
    
    def start(self):
        """Start the server runtime (called by CLI, not KUHUL)"""
        import http.server
        import socketserver
        import threading
        import time
        
        class Handler(http.server.SimpleHTTPRequestHandler):
            runtime = self
            
            def do_GET(self):
                self.runtime.state['requests'] += 1
                
                if self.path == '/':
                    self._json_response({
                        'service': 'MX2LM Server Runtime',
                        'version': '1.1.0',
                        'ws': '/ws/status',
                        'status': 'ok'
                    })
                elif self.path == '/status':
                    self._json_response(self.runtime.state)
                elif self.path == '/health':
                    self._json_response({'healthy': self.runtime.state['healthy']})
                else:
                    self.send_error(404)
            
            def _json_response(self, data):
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(data).encode())
        
        def tick_loop():
            while True:
                self.state['uptime'] += 1
                self.state['last_tick'] = time.time()
                time.sleep(1)
        
        threading.Thread(target=tick_loop, daemon=True).start()
        
        with socketserver.TCPServer((self.host, self.port), Handler) as httpd:
            print(f"[MX2LM-SR] Server running at http://{self.host}:{self.port}")
            httpd.serve_forever()


# π Decay Engine (CLI-owned, not KUHUL-owned)
class PiDecayEngine:
    """
    π-driven restart stabilization
    CLI owns authority; π governs existence
    """
    
    def __init__(self):
        self.pi_support = 1.0
        self.crash_count = 0
        self.decay_factor = 0.6
    
    def on_crash(self):
        """Record crash and decay π support"""
        self.crash_count += 1
        self.pi_support *= self.decay_factor
        return self.pi_support
    
    def allow_restart(self):
        """Determine restart mode based on π support"""
        if self.pi_support < 0.4:
            return "SUPPRESS"
        if self.pi_support < 0.7:
            return "ONCE"
        if self.pi_support < 0.9:
            return "BACKOFF"
        return "IMMEDIATE"
    
    def reset(self):
        """Reset π support (manual intervention)"""
        self.pi_support = 1.0
        self.crash_count = 0


# Server Lifecycle Controller
class ServerLifecycle:
    """
    CLI lifecycle control for MX2LM Server
    All restarts are π-governed
    """
    
    def __init__(self):
        self.proc = None
        self.decay = PiDecayEngine()
    
    def start(self):
        """Spawn server in new terminal"""
        if self.proc:
            return False
        
        if sys.platform == 'win32':
            self.proc = subprocess.Popen(
                ['cmd', '/c', 'start', 'MX2LM Server', 'python', '-c', 
                 'from mx2lm import ServerRuntime; ServerRuntime().start()'],
                creationflags=subprocess.CREATE_NEW_CONSOLE
            )
        else:
            self.proc = subprocess.Popen(
                ['python', '-c', 'from mx2lm import ServerRuntime; ServerRuntime().start()'],
                start_new_session=True
            )
        return True
    
    def stop(self):
        """Stop server"""
        if not self.proc:
            return False
        try:
            self.proc.terminate()
            self.proc = None
            return True
        except:
            return False
    
    def crashed(self):
        """Handle crash with π-governed restart"""
        pi = self.decay.on_crash()
        mode = self.decay.allow_restart()
        
        print(f"[MX2LM-SR] Crash detected. π={pi:.2f}, mode={mode}")
        
        if mode == "SUPPRESS":
            print("[MX2LM-SR] Restart suppressed (π too low)")
            return False
        if mode == "ONCE":
            return self.start()
        if mode == "BACKOFF":
            import time
            time.sleep(3)
            return self.start()
        if mode == "IMMEDIATE":
            return self.start()
        return False
    
    def status(self):
        """Get server status"""
        import requests
        try:
            r = requests.get(f"http://127.0.0.1:{ServerRuntime.DEFAULT_PORT}/status", timeout=2)
            return r.json()
        except:
            return {'healthy': False, 'error': 'Server not responding'}


# ═══════════════════════════════════════════════════════════════
# MAIN CLI ENTRY POINT
# ═══════════════════════════════════════════════════════════════

def main():
    print("╔═══════════════════════════════════════════════════════════════╗")
    print("║  MX2LM CLI v3.0 - Hybrid Multi-Agent Framework               ║")
    print("║  Core: @posthog/code-agent                                    ║")
    print("║  Sub-CLIs: /claude  /gemini  /codex  /ollama  /phi3          ║")
    print("║  PS: XCFE-PS-ENVELOPE + PS-DSL v1 + CM-1 Audit Trail         ║")
    print("╚═══════════════════════════════════════════════════════════════╝")
    print("")
    print("  Type /agents to list available sub-CLIs")
    print("  Type /claude, /gemini, /codex to spawn dedicated terminals")
    print("  Type 'help' for commands, 'exit' to quit")
    print("")
    
    agent = PostHogCodeAgent()
    
    while True:
        try:
            user_input = input("mx2lm> ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['exit', 'quit', 'q']:
                print("[MX2LM] Goodbye!")
                break
            
            if user_input.lower() in ['help', '?']:
                print("\\nCommands:")
                print("  /agents        - List available agent sub-CLIs")
                print("  /claude [msg]  - Launch Claude Code CLI")
                print("  /gemini [msg]  - Launch Gemini CLI")
                print("  /codex [msg]   - Launch OpenAI CLI")
                print("  /ollama [msg]  - Launch Ollama")
                print("  /phi3 [msg]    - Run Phi-3 locally")
                print("  /posthog       - Launch PostHog Code Agent")
                print("  ps:[action]    - Run PowerShell (ps:process.list)")
                print("  server start   - Start MX2LM Server Runtime")
                print("  server stop    - Stop server")
                print("  server status  - Check server health")
                print("  exit           - Quit MX2LM CLI")
                print("")
                continue
            
            if user_input.lower() == '/agents':
                AgentRouter.list_agents()
                continue
            
            # Check for agent prefix commands
            prefix, config, remaining = AgentRouter.parse_command(user_input)
            if prefix:
                AgentRouter.spawn_agent(prefix, remaining)
                continue
            
            # Check for PS-DSL commands
            if user_input.startswith('ps:'):
                action = user_input[3:].strip()
                intent = {'@dsl': 'ps-dsl.v1', 'action': action, 'params': {}}
                result = ps_execute_dsl(intent)
                if result['success']:
                    print(result['output'])
                else:
                    print(f"[PS-DSL] Error: {result['error']}")
                continue
            
            # Check for server commands
            if user_input.startswith('server '):
                server_cmd = user_input[7:].strip()
                lifecycle = ServerLifecycle()
                
                if server_cmd == 'start':
                    if lifecycle.start():
                        print("[MX2LM-SR] Server started")
                    else:
                        print("[MX2LM-SR] Server already running")
                elif server_cmd == 'stop':
                    if lifecycle.stop():
                        print("[MX2LM-SR] Server stopped")
                    else:
                        print("[MX2LM-SR] Server not running")
                elif server_cmd == 'status':
                    status = lifecycle.status()
                    print(f"[MX2LM-SR] {json.dumps(status, indent=2)}")
                elif server_cmd == 'restart':
                    lifecycle.stop()
                    lifecycle.start()
                    print("[MX2LM-SR] Server restarted")
                else:
                    print("[MX2LM-SR] Unknown server command")
                continue
            
            # Default: run through PostHog agent with auto-routing
            agent.run(user_input)
            
        except KeyboardInterrupt:
            print("\\n[MX2LM] Use 'exit' to quit")
        except Exception as e:
            print(f"[MX2LM] Error: {e}")

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
              <Badge className="bg-black text-cyan-400">v3.0</Badge>
            </div>
            <span className="text-xs">[ @posthog/code-agent • /claude • /gemini • /codex • /ollama ]</span>
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