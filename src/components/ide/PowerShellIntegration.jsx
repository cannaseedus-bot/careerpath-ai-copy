import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Copy, Check, Download, Eye, Code, Terminal } from 'lucide-react';
import { toast } from 'sonner';

export default function PowerShellIntegration({ ide = 'vscode' }) {
    const [copied, setCopied] = useState(null);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(null), 2000);
    };

    const vscodeExtension = `{
  "name": "mx2lm-powershell-xcfe",
  "displayName": "MX2LM PowerShell XCFE",
  "description": "Governed PowerShell execution with CM-1 audit trails",
  "version": "1.0.0",
  "publisher": "mx2lm",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": ["Other"],
  "activationEvents": ["onCommand:mx2lm.executePowerShell"],
  "main": "./extension.js",
  "contributes": {
    "commands": [
      {
        "command": "mx2lm.executePowerShell",
        "title": "MX2LM: Execute PowerShell (XCFE)"
      },
      {
        "command": "mx2lm.viewAuditLog",
        "title": "MX2LM: View CM-1 Audit Log"
      }
    ],
    "configuration": {
      "title": "MX2LM PowerShell XCFE",
      "properties": {
        "mx2lm.apiEndpoint": {
          "type": "string",
          "default": "https://your-app.base44.run",
          "description": "MX2LM API endpoint"
        }
      }
    }
  }
}`;

    const vscodeScript = `const vscode = require('vscode');
const axios = require('axios');

let auditLog = [];

function activate(context) {
    // Execute PowerShell command
    let disposable = vscode.commands.registerCommand(
        'mx2lm.executePowerShell',
        async () => {
            const input = await vscode.window.showInputBox({
                prompt: 'Enter PowerShell query (read-only)',
                placeHolder: 'e.g., list running processes'
            });

            if (!input) return;

            const config = vscode.workspace.getConfiguration('mx2lm');
            const endpoint = config.get('apiEndpoint');

            try {
                const response = await axios.post(
                    \`\${endpoint}/functions/shell-assistant\`,
                    { prompt: input, action: 'powershell' }
                );

                const result = response.data;

                // Add to audit log
                auditLog.push({
                    timestamp: new Date().toISOString(),
                    input,
                    legal: result.legal,
                    command: result.command,
                    cm1: result.cm1
                });

                // Show result in output channel
                const outputChannel = vscode.window.createOutputChannel(
                    'MX2LM PowerShell XCFE'
                );
                outputChannel.clear();
                outputChannel.appendLine(result.result);
                outputChannel.show();

                // Show notification
                if (result.legal) {
                    vscode.window.showInformationMessage(
                        \`✅ Command approved: \${result.command}\`
                    );
                } else {
                    vscode.window.showWarningMessage(
                        '⚠️ Command rejected by XCFE governance'
                    );
                }
            } catch (error) {
                vscode.window.showErrorMessage(
                    \`Error: \${error.message}\`
                );
            }
        }
    );

    // View audit log
    let auditCommand = vscode.commands.registerCommand(
        'mx2lm.viewAuditLog',
        () => {
            const panel = vscode.window.createWebviewPanel(
                'mx2lmAuditLog',
                'CM-1 Audit Log',
                vscode.ViewColumn.One,
                {}
            );

            panel.webview.html = getAuditLogHtml(auditLog);
        }
    );

    context.subscriptions.push(disposable, auditCommand);
}

function getAuditLogHtml(log) {
    const entries = log.map((entry, idx) => \`
        <div class="entry \${entry.legal ? 'legal' : 'blocked'}">
            <div class="timestamp">\${entry.timestamp}</div>
            <div class="input">\${entry.input}</div>
            <div class="command">\${entry.command || 'N/A'}</div>
            <div class="status">\${entry.legal ? '✅ Legal' : '❌ Blocked'}</div>
            <details>
                <summary>CM-1 Metadata</summary>
                <pre>\${JSON.stringify(entry.cm1, null, 2)}</pre>
            </details>
        </div>
    \`).join('');

    return \`<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: monospace; padding: 20px; }
            .entry { 
                border: 1px solid #ccc; 
                padding: 10px; 
                margin: 10px 0; 
                border-radius: 5px;
            }
            .entry.legal { border-color: green; }
            .entry.blocked { border-color: red; }
            .timestamp { color: #666; font-size: 0.9em; }
            .command { font-weight: bold; margin: 5px 0; }
            .status { margin: 5px 0; }
        </style>
    </head>
    <body>
        <h1>CM-1 Audit Log</h1>
        \${entries || '<p>No entries yet</p>'}
    </body>
    </html>\`;
}

module.exports = { activate };`;

    const jetbrainsPlugin = `// plugin.xml
<idea-plugin>
  <id>com.mx2lm.powershell-xcfe</id>
  <name>MX2LM PowerShell XCFE</name>
  <description>Governed PowerShell execution with CM-1 audit trails</description>
  <version>1.0.0</version>
  <vendor>MX2LM</vendor>

  <depends>com.intellij.modules.platform</depends>

  <actions>
    <action id="mx2lm.ExecutePowerShell" 
            class="com.mx2lm.ExecutePowerShellAction"
            text="Execute PowerShell (XCFE)"
            description="Execute governed PowerShell command">
      <add-to-group group-id="ToolsMenu" anchor="last"/>
    </action>
    <action id="mx2lm.ViewAuditLog"
            class="com.mx2lm.ViewAuditLogAction"
            text="View CM-1 Audit Log"
            description="View PowerShell execution audit log">
      <add-to-group group-id="ToolsMenu" anchor="last"/>
    </action>
  </actions>
</idea-plugin>

// ExecutePowerShellAction.kt
package com.mx2lm

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.ui.InputValidator
import kotlinx.coroutines.*
import java.net.HttpURLConnection
import java.net.URL

class ExecutePowerShellAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val input = Messages.showInputDialog(
            e.project,
            "Enter PowerShell query (read-only):",
            "MX2LM PowerShell XCFE",
            null
        ) ?: return

        GlobalScope.launch(Dispatchers.IO) {
            try {
                val endpoint = "https://your-app.base44.run"
                val result = executePowerShell(endpoint, input)
                
                withContext(Dispatchers.Main) {
                    if (result.legal) {
                        Messages.showInfoMessage(
                            e.project,
                            result.output,
                            "✅ Command Approved"
                        )
                    } else {
                        Messages.showWarningDialog(
                            e.project,
                            result.output,
                            "⚠️ Command Rejected"
                        )
                    }
                }
            } catch (ex: Exception) {
                withContext(Dispatchers.Main) {
                    Messages.showErrorDialog(
                        e.project,
                        "Error: \${ex.message}",
                        "Error"
                    )
                }
            }
        }
    }

    private fun executePowerShell(endpoint: String, input: String): PSResult {
        val url = URL("\$endpoint/functions/shell-assistant")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.setRequestProperty("Content-Type", "application/json")
        connection.doOutput = true

        val jsonInput = """{"prompt":"$input","action":"powershell"}"""
        connection.outputStream.write(jsonInput.toByteArray())

        val response = connection.inputStream.bufferedReader().readText()
        // Parse JSON response
        return PSResult(legal = true, output = response)
    }

    data class PSResult(val legal: Boolean, val output: String)
}`;

    const usageGuide = `# XCFE PowerShell IDE Integration Guide

## Installation

### VS Code
1. Copy the extension files to: \`.vscode/extensions/mx2lm-powershell-xcfe/\`
2. Install dependencies: \`npm install axios\`
3. Reload VS Code
4. Configure API endpoint: Settings → MX2LM → API Endpoint

### JetBrains IDEs
1. Build plugin: \`gradle buildPlugin\`
2. Install from disk: Settings → Plugins → ⚙️ → Install from Disk
3. Restart IDE
4. Configure endpoint in plugin settings

## Usage

### Executing Commands
1. Press \`Ctrl+Shift+P\` (VS Code) or open Tools menu (JetBrains)
2. Select "MX2LM: Execute PowerShell (XCFE)"
3. Enter read-only query (e.g., "list running processes")
4. View result in output panel

### Viewing Audit Log
- **VS Code**: Command Palette → "MX2LM: View CM-1 Audit Log"
- **JetBrains**: Tools → View CM-1 Audit Log

### Allowed Commands
✅ Get-Process - List processes
✅ Get-Service - Query services  
✅ Get-EventLog - Event logs
✅ Get-ComputerInfo - System info
✅ Get-WmiObject - WMI queries
✅ Get-ItemProperty - Registry reads
✅ Get-ChildItem - Directory listing
✅ Get-Content - File reading

### Blocked Operations
❌ Invoke-Expression
❌ Start-Process
❌ Set-* cmdlets
❌ Remove-* cmdlets
❌ Network operations

## CM-1 Audit Trail

Every command execution generates:
- Timestamp
- User intent
- Lowered command
- Legal status
- Execution metadata

View full provenance in the audit log panel.

## API Integration

Endpoint: \`POST /functions/shell-assistant\`
Payload: \`{ "prompt": "...", "action": "powershell" }\`

Response includes:
- \`legal\`: boolean
- \`command\`: generated PowerShell
- \`cm1\`: audit metadata
- \`result\`: formatted output`;

    return (
        <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-blue-400" />
                        <CardTitle className="text-white">
                            XCFE PowerShell Integration
                        </CardTitle>
                    </div>
                    <Badge className="bg-blue-600">Governed Execution</Badge>
                </div>
                <p className="text-sm text-slate-400 mt-2">
                    Secure PowerShell execution with CM-1 audit trails directly in your IDE
                </p>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="vscode" className="w-full">
                    <TabsList className="bg-slate-800 mb-4">
                        <TabsTrigger value="vscode">VS Code Extension</TabsTrigger>
                        <TabsTrigger value="jetbrains">JetBrains Plugin</TabsTrigger>
                        <TabsTrigger value="usage">Usage Guide</TabsTrigger>
                    </TabsList>

                    <TabsContent value="vscode" className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-slate-300">package.json</h4>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(vscodeExtension, 'vscode-package')}
                                    className="border-slate-600"
                                >
                                    {copied === 'vscode-package' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                            </div>
                            <pre className="bg-slate-950 p-4 rounded text-xs text-cyan-300 overflow-x-auto max-h-64">
                                {vscodeExtension}
                            </pre>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-slate-300">extension.js</h4>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(vscodeScript, 'vscode-script')}
                                    className="border-slate-600"
                                >
                                    {copied === 'vscode-script' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                            </div>
                            <pre className="bg-slate-950 p-4 rounded text-xs text-cyan-300 overflow-x-auto max-h-96">
                                {vscodeScript}
                            </pre>
                        </div>

                        <div className="flex gap-2">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Download className="w-4 h-4 mr-2" />
                                Download Extension Template
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="jetbrains" className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-slate-300">Plugin Configuration</h4>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(jetbrainsPlugin, 'jetbrains-plugin')}
                                    className="border-slate-600"
                                >
                                    {copied === 'jetbrains-plugin' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                            </div>
                            <pre className="bg-slate-950 p-4 rounded text-xs text-cyan-300 overflow-x-auto max-h-96">
                                {jetbrainsPlugin}
                            </pre>
                        </div>

                        <div className="flex gap-2">
                            <Button className="bg-orange-600 hover:bg-orange-700">
                                <Download className="w-4 h-4 mr-2" />
                                Download Plugin Template
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="usage" className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-slate-300">Integration Guide</h4>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(usageGuide, 'usage-guide')}
                                    className="border-slate-600"
                                >
                                    {copied === 'usage-guide' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                </Button>
                            </div>
                            <pre className="bg-slate-950 p-4 rounded text-xs text-slate-300 overflow-x-auto max-h-96 whitespace-pre-wrap">
                                {usageGuide}
                            </pre>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="text-sm font-semibold text-slate-300">Security</span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Deny-by-default allowlist. Only safe, read-only PowerShell commands.
                        </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-semibold text-slate-300">Audit</span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Full CM-1 provenance for every execution. Replayable and explainable.
                        </p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded border border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Terminal className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm font-semibold text-slate-300">Integration</span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Direct IDE access. No context switching. Commands at your fingertips.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}