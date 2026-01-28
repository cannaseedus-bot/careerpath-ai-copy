import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Plus, Download, Copy, Terminal, CheckCircle2, Package, Shield } from "lucide-react";
import { toast } from "sonner";
import PowerShellIntegration from "@/components/ide/PowerShellIntegration";
import IDECard from "@/components/ide/IDECard";

const ideTemplates = {
  "vscode": {
    name: "Visual Studio Code",
    icon: "📘",
    extension_id: "mx2lm.mx2lm-vscode",
    installCommand: "code --install-extension mx2lm.mx2lm-vscode",
    settings: {
      "mx2lm.apiEndpoint": "",
      "mx2lm.defaultModel": "phi-3-mini",
      "mx2lm.autoComplete": true,
      "mx2lm.inlineCompletion": true
    }
  },
  "visual-studio": {
    name: "Visual Studio",
    icon: "🎨",
    extension_id: "MX2LM.MX2LMExtension",
    installCommand: "Install-Package MX2LM.Extension",
    settings: {
      "MX2LM.ApiKey": "",
      "MX2LM.ModelPreference": "phi-3-mini"
    }
  },
  "jetbrains": {
    name: "JetBrains IDEs",
    icon: "🚀",
    extension_id: "com.mx2lm.plugin",
    installCommand: "Settings > Plugins > Search 'MX2LM'",
    settings: {
      "mx2lm.endpoint": "",
      "mx2lm.quantization": "int4"
    }
  }
};

export default function IDEIntegrations() {
  const [showForm, setShowForm] = useState(false);
  const [selectedIDE, setSelectedIDE] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    ide_type: "vscode",
    extension_id: "",
    version: "1.0.0",
    settings: {},
    keybindings: {},
    snippets: [],
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: integrations = [] } = useQuery({
    queryKey: ["ideintegrations"],
    queryFn: () => base44.entities.IDEIntegration.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.IDEIntegration.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideintegrations"] });
      setShowForm(false);
      toast.success("IDE integration created");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.IDEIntegration.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ideintegrations"] });
      toast.success("Integration deleted");
    }
  });

  const handleQuickSetup = (ideType) => {
    const template = ideTemplates[ideType];
    setFormData({
      name: template.name,
      ide_type: ideType,
      extension_id: template.extension_id,
      version: "1.0.0",
      settings: template.settings,
      keybindings: {},
      snippets: [],
      is_active: true
    });
    setShowForm(true);
  };

  const handleCopyCommand = (command) => {
    navigator.clipboard.writeText(command);
    toast.success("Command copied to clipboard");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-7xl mx-auto">
        {/* Terminal Header */}
        <div className="border-2 border-green-400 bg-black mb-6">
          <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
            <span className="font-bold">$ mx2lm ide --setup vscode</span>
            <span className="text-xs">[ IDE Integrations ]</span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-cyan-400 text-2xl mb-2">╔═══ IDE INTEGRATIONS ═══╗</div>
                <div className="text-green-400">Connect MX2LM with your favorite development environment</div>
              </div>
              <button onClick={() => setShowForm(!showForm)} className="bg-green-400 text-black px-4 py-2 hover:bg-green-300 transition font-bold">
                <Plus className="w-4 h-4 inline mr-2" />
                ADD_INTEGRATION
              </button>
            </div>
          </div>
        </div>

        {/* XCFE PowerShell Integration */}
        <div className="mb-8">
          <PowerShellIntegration />
        </div>

        {/* Quick Setup Templates */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Quick Setup Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(ideTemplates).map(([key, template]) => (
              <IDECard
                key={key}
                integration={{
                  name: template.name,
                  description: `MX2LM extension for ${template.name}`,
                  status: 'available',
                  icon: <span className="text-3xl">{template.icon}</span>,
                  features: [
                    'AI code completion',
                    'Inline suggestions',
                    'Model management',
                    'XCFE PowerShell (read-only)'
                  ],
                  docs: '#'
                }}
                onDownload={() => handleQuickSetup(key)}
              />
            ))}
          </div>
        </div>

        {showForm && (
          <Card className="mb-8 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Configure IDE Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="My VSCode Setup"
                      className="bg-slate-900 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">IDE Type</label>
                    <Select value={formData.ide_type} onValueChange={(val) => setFormData({ ...formData, ide_type: val })}>
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vscode">VS Code</SelectItem>
                        <SelectItem value="visual-studio">Visual Studio</SelectItem>
                        <SelectItem value="jetbrains">JetBrains</SelectItem>
                        <SelectItem value="sublime">Sublime Text</SelectItem>
                        <SelectItem value="vim">Vim</SelectItem>
                        <SelectItem value="emacs">Emacs</SelectItem>
                        <SelectItem value="atom">Atom</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Extension ID</label>
                    <Input
                      value={formData.extension_id}
                      onChange={(e) => setFormData({ ...formData, extension_id: e.target.value })}
                      placeholder="mx2lm.mx2lm-vscode"
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Version</label>
                    <Input
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="1.0.0"
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Settings (JSON)</label>
                  <Textarea
                    value={JSON.stringify(formData.settings, null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({ ...formData, settings: JSON.parse(e.target.value) });
                      } catch (err) {}
                    }}
                    className="min-h-[200px] bg-slate-900 border-slate-600 text-white font-mono text-sm"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Create Integration
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Existing Integrations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg">{integration.name}</CardTitle>
                    <p className="text-slate-400 text-sm mt-1">{integration.extension_id}</p>
                  </div>
                  <Badge className="bg-blue-600">{integration.ide_type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-900 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-2">Installation Command:</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-green-400 font-mono">
                      {ideTemplates[integration.ide_type]?.installCommand || "See documentation"}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleCopyCommand(ideTemplates[integration.ide_type]?.installCommand)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Version: <span className="text-white">{integration.version}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                      onClick={() => {
                        const config = JSON.stringify(integration.settings, null, 2);
                        navigator.clipboard.writeText(config);
                        toast.success("Settings copied");
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(integration.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {integrations.length === 0 && !showForm && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No IDE integrations yet</h3>
            <p className="text-slate-500 mb-4">Get started with quick setup templates above</p>
          </div>
        )}
      </div>
    </div>
  );
}