import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus, Play, Download, Copy, CheckCircle2, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const pipelineTemplates = {
  "github-actions": `name: MX2LM Model Deployment
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install MX2LM CLI
        run: npm install -g @mx2lm/cli
      - name: Quantize Models
        run: mx2lm quantize --batch --method awq --bits 4
      - name: Deploy
        run: mx2lm deploy --env production`,
  
  "gitlab-ci": `stages:
  - build
  - test
  - deploy

deploy_models:
  stage: deploy
  script:
    - npm install -g @mx2lm/cli
    - mx2lm init --config
    - mx2lm quantize --batch --method gptq --bits 4
    - mx2lm deploy --env production
  only:
    - main`,
  
  "circleci": `version: 2.1
jobs:
  deploy:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - run: npm install -g @mx2lm/cli
      - run: mx2lm quantize --batch --method awq --bits 4
      - run: mx2lm deploy --env production
workflows:
  deploy_models:
    jobs:
      - deploy`
};

export default function CIPipelines() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    platform: "github-actions",
    config_yaml: "",
    triggers: ["push"],
    environment_vars: {},
    steps: [],
    status: "active"
  });

  const queryClient = useQueryClient();

  const { data: pipelines = [] } = useQuery({
    queryKey: ["cipipelines"],
    queryFn: () => base44.entities.CIPipeline.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CIPipeline.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cipipelines"] });
      setShowForm(false);
      toast.success("Pipeline created");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CIPipeline.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cipipelines"] });
      toast.success("Pipeline deleted");
    }
  });

  const handleTemplateSelect = (platform) => {
    setFormData({
      ...formData,
      platform,
      config_yaml: pipelineTemplates[platform] || ""
    });
  };

  const handleCopyConfig = (config) => {
    navigator.clipboard.writeText(config);
    toast.success("Configuration copied");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-400" />;
      case "active": return <Clock className="w-4 h-4 text-blue-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-7xl mx-auto">
        {/* Terminal Header */}
        <div className="border-2 border-green-400 bg-black mb-6">
          <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
            <span className="font-bold">$ mx2lm ci --deploy</span>
            <span className="text-xs">[ CI/CD Manager ]</span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-cyan-400 text-2xl mb-2">╔═══ CI/CD PIPELINES ═══╗</div>
                <div className="text-green-400">Automate model quantization and deployment</div>
              </div>
              <button onClick={() => setShowForm(!showForm)} className="bg-green-400 text-black px-4 py-2 hover:bg-green-300 transition font-bold">
                <Plus className="w-4 h-4 inline mr-2" />
                NEW_PIPELINE
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <Card className="mb-8 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Create CI/CD Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Pipeline Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Deploy Quantized Models"
                      className="bg-slate-900 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Platform</label>
                    <Select value={formData.platform} onValueChange={(val) => handleTemplateSelect(val)}>
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="github-actions">GitHub Actions</SelectItem>
                        <SelectItem value="gitlab-ci">GitLab CI</SelectItem>
                        <SelectItem value="circleci">CircleCI</SelectItem>
                        <SelectItem value="jenkins">Jenkins</SelectItem>
                        <SelectItem value="azure-devops">Azure DevOps</SelectItem>
                        <SelectItem value="travis-ci">Travis CI</SelectItem>
                        <SelectItem value="bitbucket-pipelines">Bitbucket Pipelines</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Pipeline Configuration (YAML)</label>
                  <Textarea
                    value={formData.config_yaml}
                    onChange={(e) => setFormData({ ...formData, config_yaml: e.target.value })}
                    placeholder="Enter pipeline configuration..."
                    className="min-h-[300px] bg-slate-900 border-slate-600 text-white font-mono text-sm"
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Create Pipeline
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pipelines.map((pipeline) => (
            <Card key={pipeline.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      {getStatusIcon(pipeline.status)}
                      {pipeline.name}
                    </CardTitle>
                    <p className="text-slate-400 text-sm mt-1">{pipeline.platform}</p>
                  </div>
                  <Badge className={
                    pipeline.status === "success" ? "bg-green-600" :
                    pipeline.status === "failed" ? "bg-red-600" :
                    "bg-blue-600"
                  }>
                    {pipeline.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-900 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                    {pipeline.config_yaml}
                  </pre>
                </div>
                {pipeline.last_run && (
                  <div className="text-xs text-slate-400">
                    Last run: {new Date(pipeline.last_run).toLocaleString()}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 flex-1"
                    onClick={() => handleCopyConfig(pipeline.config_yaml)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Config
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-600 text-green-400"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Run
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(pipeline.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {pipelines.length === 0 && !showForm && (
          <div className="text-center py-16">
            <GitBranch className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No pipelines configured</h3>
            <p className="text-slate-500">Create your first CI/CD pipeline to automate deployments</p>
          </div>
        )}
      </div>
    </div>
  );
}