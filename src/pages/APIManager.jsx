import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, Link as LinkIcon, Key } from "lucide-react";

export default function APIManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    api_key: "",
    endpoint_type: "huggingface",
    is_active: true,
    headers: {}
  });

  const queryClient = useQueryClient();

  const { data: endpoints = [] } = useQuery({
    queryKey: ["apiendpoints"],
    queryFn: () => base44.entities.APIEndpoint.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.APIEndpoint.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiendpoints"] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.APIEndpoint.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiendpoints"] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.APIEndpoint.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apiendpoints"] })
  });

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      api_key: "",
      endpoint_type: "huggingface",
      is_active: true,
      headers: {}
    });
    setEditingEndpoint(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEndpoint) {
      updateMutation.mutate({ id: editingEndpoint.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (endpoint) => {
    setEditingEndpoint(endpoint);
    setFormData(endpoint);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <LinkIcon className="w-10 h-10 text-green-400" />
              API Endpoints
            </h1>
            <p className="text-slate-400 mt-2">Configure API connections for your models</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-5 h-5 mr-2" />
            Add Endpoint
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                {editingEndpoint ? "Edit Endpoint" : "Add New Endpoint"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.endpoint_type === "ollama" && (
                <div className="mb-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <div className="text-sm text-blue-300 font-semibold mb-2">Ollama Integration Example:</div>
                  <pre className="text-xs text-slate-300 font-mono bg-slate-900 p-3 rounded overflow-x-auto">
{`import { Ollama } from "ollama";

const ollama = new Ollama();

const response = await ollama.chat({
  model: "gpt-oss:120b-cloud",
  messages: [{ role: "user", content: "Explain quantum computing" }],
  stream: true,
});

for await (const part of response) {
  process.stdout.write(part.message.content);
}`}
                  </pre>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Hugging Face API"
                      className="bg-slate-900 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Type</label>
                    <Select value={formData.endpoint_type} onValueChange={(val) => setFormData({ ...formData, endpoint_type: val })}>
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="huggingface">Hugging Face</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="ollama">Ollama</SelectItem>
                        <SelectItem value="cpanel">cPanel</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">URL</label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://api-inference.huggingface.co"
                    className="bg-slate-900 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">API Key</label>
                  <Input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    placeholder="hf_..."
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {editingEndpoint ? "Update" : "Create"} Endpoint
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <Card key={endpoint.id} className="bg-slate-800 border-slate-700 hover:border-green-500 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Key className="w-5 h-5 text-green-400" />
                      <h3 className="text-xl font-semibold text-white">{endpoint.name}</h3>
                      <Badge variant={endpoint.is_active ? "default" : "secondary"} className={endpoint.is_active ? "bg-green-600" : "bg-slate-600"}>
                        {endpoint.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-900 text-blue-200">
                        {endpoint.endpoint_type}
                      </Badge>
                    </div>
                    <p className="text-slate-400 font-mono text-sm">{endpoint.url}</p>
                    {endpoint.api_key && (
                      <p className="text-slate-500 text-sm mt-2">
                        API Key: {endpoint.api_key.substring(0, 10)}...
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(endpoint)}
                      className="border-slate-600 text-slate-300 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(endpoint.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {endpoints.length === 0 && !showForm && (
          <div className="text-center py-16">
            <LinkIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No endpoints configured</h3>
            <p className="text-slate-500 mb-4">Add your first API endpoint to connect models</p>
            <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-5 h-5 mr-2" />
              Add Endpoint
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}