import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { toast } from "sonner";

export default function ClusterForm({ cluster, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cluster_type: "hybrid",
    status: "active",
    total_cpu_cores: "",
    total_gpu_count: "",
    total_memory_gb: "",
    max_parallel_jobs: "4",
    gpu_support: false,
    is_default: false,
    config: {
      runtime: "xjson",
      compression: "scxq2",
    },
  });

  useEffect(() => {
    if (cluster) {
      setFormData(cluster);
    }
  }, [cluster]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Cluster name is required");
      return;
    }
    onSave(formData);
  };

  return (
    <Card className="bg-black border-cyan-400">
      <CardHeader className="bg-cyan-400 text-black flex flex-row items-center justify-between pb-3">
        <CardTitle>{cluster ? "Edit Cluster" : "Create Cluster"}</CardTitle>
        <button
          onClick={onCancel}
          className="hover:bg-black/20 p-1 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-cyan-400 font-semibold block mb-1">
              CLUSTER NAME *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Cluster"
              className="border-cyan-400 bg-black text-cyan-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-cyan-400 font-semibold block mb-1">
              DESCRIPTION
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description..."
              className="border-cyan-400 bg-black text-cyan-400 h-20"
            />
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-cyan-400 font-semibold block mb-1">
                CLUSTER TYPE
              </label>
              <Select
                value={formData.cluster_type}
                onValueChange={(val) =>
                  setFormData({ ...formData, cluster_type: val })
                }
              >
                <SelectTrigger className="border-cyan-400 bg-black text-cyan-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="distributed">Distributed</SelectItem>
                  <SelectItem value="kubernetes">Kubernetes</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                  <SelectItem value="hybrid">Hybrid (xJSON + SCXQ2)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-cyan-400 font-semibold block mb-1">
                STATUS
              </label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger className="border-cyan-400 bg-black text-cyan-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resource Specs */}
          <div>
            <label className="text-xs text-cyan-400 font-semibold block mb-2">
              RESOURCE SPECIFICATIONS
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">CPU Cores</label>
                <Input
                  type="number"
                  value={formData.total_cpu_cores}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_cpu_cores: parseInt(e.target.value) || "",
                    })
                  }
                  placeholder="64"
                  className="border-slate-700 bg-black text-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">GPU Units</label>
                <Input
                  type="number"
                  value={formData.total_gpu_count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_gpu_count: parseInt(e.target.value) || "",
                    })
                  }
                  placeholder="8"
                  className="border-slate-700 bg-black text-cyan-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Memory (GB)</label>
                <Input
                  type="number"
                  value={formData.total_memory_gb}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_memory_gb: parseInt(e.target.value) || "",
                    })
                  }
                  placeholder="512"
                  className="border-slate-700 bg-black text-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Runtime Config */}
          <div>
            <label className="text-xs text-cyan-400 font-semibold block mb-2">
              RUNTIME CONFIGURATION
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Runtime</label>
                <Select
                  value={formData.config?.runtime || "xjson"}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, runtime: val },
                    })
                  }
                >
                  <SelectTrigger className="border-slate-700 bg-black text-cyan-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xjson">xJSON</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="node">Node.js</SelectItem>
                    <SelectItem value="vllm">vLLM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Compression</label>
                <Select
                  value={formData.config?.compression || "scxq2"}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      config: { ...formData.config, compression: val },
                    })
                  }
                >
                  <SelectTrigger className="border-slate-700 bg-black text-cyan-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scxq2">SCXQ2</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="int8">INT8</SelectItem>
                    <SelectItem value="int4">INT4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Parallel Jobs */}
          <div>
            <label className="text-xs text-cyan-400 font-semibold block mb-1">
              MAX PARALLEL JOBS
            </label>
            <Input
              type="number"
              value={formData.max_parallel_jobs}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  max_parallel_jobs: parseInt(e.target.value) || 1,
                })
              }
              placeholder="4"
              className="border-cyan-400 bg-black text-cyan-400"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <label className="flex items-center gap-2 text-sm text-cyan-400 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.gpu_support}
                onChange={(e) =>
                  setFormData({ ...formData, gpu_support: e.target.checked })
                }
                className="w-4 h-4 rounded"
              />
              GPU Support Enabled
            </label>
            <label className="flex items-center gap-2 text-sm text-cyan-400 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) =>
                  setFormData({ ...formData, is_default: e.target.checked })
                }
                className="w-4 h-4 rounded"
              />
              Set as Default Cluster
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-700">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-600"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-cyan-400 text-black hover:bg-cyan-300 font-bold"
            >
              {cluster ? "UPDATE" : "CREATE"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}