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
import { Code, Save, Download, Sparkles, Crown } from "lucide-react";
import { exportCliConfig } from "@/functions/export-cli-config";

const defaultScript = `#!/usr/bin/env python3
# Custom CLI Script
import os
import sys
import json
import requests

def main():
    print("🚀 Your Custom CLI")
    # Add your custom logic here
    
if __name__ == "__main__":
    main()
`;

export default function CLIEditor() {
  const [config, setConfig] = useState({
    cli_name: "my-cli",
    custom_script: defaultScript,
    custom_commands: {},
    environment_vars: {},
    selected_models: [],
    selected_endpoints: [],
    subscription_tier: "starter"
  });

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
      if (savedConfigs.length > 0) {
        return base44.entities.PersonalizedCLI.update(savedConfigs[0].id, data);
      }
      return base44.entities.PersonalizedCLI.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personalizedcli"] });
      alert("✅ CLI configuration saved!");
    }
  });

  useEffect(() => {
    if (savedConfigs.length > 0) {
      setConfig(savedConfigs[0]);
    }
  }, [savedConfigs]);

  const handleSave = () => {
    saveMutation.mutate(config);
  };

  const handleExport = async () => {
    try {
      const { data } = await exportCliConfig();
      const blob = new Blob([data], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.cli_name}-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export CLI');
    }
  };

  const tierFeatures = {
    starter: { models: 5, endpoints: 2, customBranding: false },
    professional: { models: 20, endpoints: 10, customBranding: false },
    enterprise: { models: 999, endpoints: 999, customBranding: true }
  };

  const currentTier = tierFeatures[config.subscription_tier];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Code className="w-10 h-10 text-purple-400" />
              CLI Editor
            </h1>
            <p className="text-slate-400 mt-2">Customize your personalized CLI experience</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-5 h-5 mr-2" />
              Save Config
            </Button>
            <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-5 h-5 mr-2" />
              Export CLI
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {config.selected_models.length}/{currentTier.models}
                </div>
                <div className="text-slate-300 mt-1">Models Selected</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {config.selected_endpoints.length}/{currentTier.endpoints}
                </div>
                <div className="text-slate-300 mt-1">Endpoints Selected</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="text-center">
                <Badge className={
                  config.subscription_tier === "enterprise" ? "bg-yellow-600" :
                  config.subscription_tier === "professional" ? "bg-purple-600" :
                  "bg-blue-600"
                }>
                  {config.subscription_tier === "enterprise" && <Crown className="w-4 h-4 mr-1" />}
                  {config.subscription_tier.toUpperCase()}
                </Badge>
                <div className="text-slate-300 mt-2 text-sm">Subscription Tier</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="script">Custom Script</TabsTrigger>
            <TabsTrigger value="models">Select Models</TabsTrigger>
            <TabsTrigger value="endpoints">Select Endpoints</TabsTrigger>
            {currentTier.customBranding && (
              <TabsTrigger value="branding">
                <Sparkles className="w-4 h-4 mr-2" />
                Branding
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="basic">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Basic Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">CLI Name</label>
                  <Input
                    value={config.cli_name}
                    onChange={(e) => setConfig({...config, cli_name: e.target.value})}
                    placeholder="my-awesome-cli"
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Subscription Tier</label>
                  <Select 
                    value={config.subscription_tier} 
                    onValueChange={(val) => setConfig({...config, subscription_tier: val})}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Starter ($9.99/mo)</SelectItem>
                      <SelectItem value="professional">Professional ($29.99/mo)</SelectItem>
                      <SelectItem value="enterprise">Enterprise ($99.99/mo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="script">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Custom Python Script</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={config.custom_script}
                  onChange={(e) => setConfig({...config, custom_script: e.target.value})}
                  className="min-h-[500px] bg-slate-900 border-slate-600 text-white font-mono text-sm"
                  placeholder="Write your custom CLI logic..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Select Models ({config.selected_models.length}/{currentTier.models})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {models.map((model) => {
                    const isSelected = config.selected_models.includes(model.id);
                    const canSelect = config.selected_models.length < currentTier.models;
                    
                    return (
                      <div
                        key={model.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-purple-600/20 border-purple-500" 
                            : "bg-slate-900 border-slate-700 hover:border-slate-600"
                        } ${!canSelect && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => {
                          if (isSelected) {
                            setConfig({
                              ...config,
                              selected_models: config.selected_models.filter(id => id !== model.id)
                            });
                          } else if (canSelect) {
                            setConfig({
                              ...config,
                              selected_models: [...config.selected_models, model.id]
                            });
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white font-semibold">{model.name}</div>
                            <div className="text-slate-400 text-sm">{model.model_id}</div>
                          </div>
                          <Badge variant={isSelected ? "default" : "secondary"}>
                            {model.quantization}
                          </Badge>
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
                <CardTitle className="text-white">
                  Select Endpoints ({config.selected_endpoints.length}/{currentTier.endpoints})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {endpoints.map((endpoint) => {
                    const isSelected = config.selected_endpoints.includes(endpoint.id);
                    const canSelect = config.selected_endpoints.length < currentTier.endpoints;
                    
                    return (
                      <div
                        key={endpoint.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-blue-600/20 border-blue-500" 
                            : "bg-slate-900 border-slate-700 hover:border-slate-600"
                        } ${!canSelect && !isSelected ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={() => {
                          if (isSelected) {
                            setConfig({
                              ...config,
                              selected_endpoints: config.selected_endpoints.filter(id => id !== endpoint.id)
                            });
                          } else if (canSelect) {
                            setConfig({
                              ...config,
                              selected_endpoints: [...config.selected_endpoints, endpoint.id]
                            });
                          }
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white font-semibold">{endpoint.name}</div>
                            <div className="text-slate-400 text-sm font-mono">{endpoint.url}</div>
                          </div>
                          <Badge variant={isSelected ? "default" : "secondary"}>
                            {endpoint.endpoint_type}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {currentTier.customBranding && (
            <TabsContent value="branding">
              <Card className="bg-gradient-to-br from-yellow-900/20 to-slate-800 border-yellow-600/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="w-6 h-6 text-yellow-400" />
                    Enterprise Branding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">CLI Display Name</label>
                    <Input
                      placeholder="Acme Corp CLI Tool"
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Welcome Message</label>
                    <Textarea
                      placeholder="Welcome to Acme Corp's AI CLI Platform..."
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Primary Color (hex)</label>
                    <Input
                      placeholder="#7C3AED"
                      className="bg-slate-900 border-slate-600 text-white"
                    />
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