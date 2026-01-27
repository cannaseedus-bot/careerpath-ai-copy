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
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-6xl mx-auto">
        {/* Terminal Header */}
        <div className="border-2 border-green-400 bg-black mb-6">
          <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
            <span className="font-bold">$ mx2lm endpoints --configure</span>
            <span className="text-xs">[ API Manager ]</span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-cyan-400 text-2xl mb-2">╔═══ API ENDPOINT MANAGER ═══╗</div>
                <div className="text-green-400">Configure API connections for your models</div>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-green-400 text-black px-4 py-2 hover:bg-green-300 transition font-bold"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                ADD_ENDPOINT
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="mb-6 border-2 border-cyan-400 bg-black">
            <div className="bg-cyan-400 text-black px-4 py-1">
              <span className="font-bold">{editingEndpoint ? "EDIT_ENDPOINT" : "NEW_ENDPOINT"}</span>
            </div>
            <div className="p-6">
              {formData.endpoint_type === "ollama" && (
                <div className="mb-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <div className="text-sm text-blue-300 font-semibold mb-2">Ollama Cloud API Integration:</div>
                  <div className="text-xs text-slate-400 mb-3">
                    Requires account on ollama.com. Sign in: <code className="bg-slate-800 px-1 py-0.5 rounded">ollama signin</code>
                  </div>
                  <pre className="text-xs text-slate-300 font-mono bg-slate-900 p-3 rounded overflow-x-auto">
{`# Setup
ollama signin
ollama pull gpt-oss:120b-cloud

# Set API key for cloud access
export OLLAMA_API_KEY=your_api_key`}
                  </pre>
                  <div className="text-xs text-slate-400 mt-3 mb-2">Available Cloud Models:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-slate-900 p-2 rounded">
                      <div className="text-blue-400 font-semibold mb-1">Frontier</div>
                      <div className="text-slate-300 space-y-0.5">
                        <div>deepseek-v3.1:671b-cloud</div>
                        <div>kimi-k2:1t-cloud</div>
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded">
                      <div className="text-blue-400 font-semibold mb-1">GPT-OSS</div>
                      <div className="text-slate-300 space-y-0.5">
                        <div>gpt-oss:120b-cloud</div>
                        <div>gpt-oss:20b-cloud</div>
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded">
                      <div className="text-blue-400 font-semibold mb-1">Qwen</div>
                      <div className="text-slate-300 space-y-0.5">
                        <div>qwen3-coder:480b-cloud</div>
                        <div>qwen3-vl:235b-cloud</div>
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded">
                      <div className="text-blue-400 font-semibold mb-1">GLM</div>
                      <div className="text-slate-300 space-y-0.5">
                        <div>glm-4.6:cloud</div>
                        <div>glm-4.7:cloud</div>
                      </div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded col-span-2">
                      <div className="text-blue-400 font-semibold mb-1">Other</div>
                      <div className="text-slate-300 space-y-0.5">
                        <div>minimax-m2.1:cloud</div>
                        <div>gemini-3-flash-preview:cloud</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mb-2">JavaScript Usage:</div>
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
                    <label className="text-sm text-cyan-400 mb-2 block">► Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Hugging Face API"
                      className="bg-black border-2 border-green-400 text-green-400 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-cyan-400 mb-2 block">► Type</label>
                    <Select value={formData.endpoint_type} onValueChange={(val) => setFormData({ ...formData, endpoint_type: val })}>
                      <SelectTrigger className="bg-black border-2 border-green-400 text-green-400">
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
                  <label className="text-sm text-cyan-400 mb-2 block">► URL</label>
                  <Input
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://api-inference.huggingface.co"
                    className="bg-black border-2 border-green-400 text-green-400 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-cyan-400 mb-2 block">► API Key</label>
                  <Input
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    placeholder="hf_..."
                    className="bg-black border-2 border-green-400 text-green-400 font-mono"
                  />
                </div>
                <div className="flex gap-3 justify-end mt-4">
                  <button type="button" onClick={resetForm} className="border-2 border-gray-600 text-gray-400 px-4 py-2 hover:bg-gray-900 transition">
                    [CANCEL]
                  </button>
                  <button type="submit" className="bg-green-400 text-black px-4 py-2 hover:bg-green-300 transition font-bold">
                    [{editingEndpoint ? "UPDATE" : "CREATE"}]
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <div key={endpoint.id} className="border-2 border-green-400 bg-black hover:border-cyan-400 transition-all">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Key className="w-5 h-5 text-green-400" />
                      <h3 className="text-xl font-semibold text-cyan-400">{endpoint.name}</h3>
                      <span className={`text-xs px-2 py-1 ${endpoint.is_active ? "bg-green-400 text-black" : "bg-gray-600 text-black"}`}>
                        [{endpoint.is_active ? "ACTIVE" : "INACTIVE"}]
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-400 text-black">
                        [{endpoint.endpoint_type.toUpperCase()}]
                      </span>
                    </div>
                    <p className="text-green-400 font-mono text-sm">→ {endpoint.url}</p>
                    {endpoint.api_key && (
                      <p className="text-gray-500 text-sm mt-2 font-mono">
                        🔑 {endpoint.api_key.substring(0, 10)}...
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(endpoint)}
                      className="border-2 border-cyan-400 text-cyan-400 px-3 py-1 hover:bg-cyan-900/30 transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(endpoint.id)}
                      className="border-2 border-red-400 text-red-400 px-3 py-1 hover:bg-red-900/30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {endpoints.length === 0 && !showForm && (
          <div className="border-2 border-gray-600 bg-black p-16 text-center">
            <LinkIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-500 mb-2">╔════════════════════════╗</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">NO_ENDPOINTS_CONFIGURED</h3>
            <div className="text-gray-500 mb-2">╚════════════════════════╝</div>
            <p className="text-gray-600 mb-4">$ Add your first API endpoint to connect models</p>
            <button onClick={() => setShowForm(true)} className="bg-green-400 text-black px-6 py-2 hover:bg-green-300 transition font-bold">
              [+ ADD_ENDPOINT]
            </button>
          </div>
        )}
      </div>
    </div>
  );
}