import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Server, Cpu, HardDrive, Zap } from "lucide-react";

export default function ClusterCard({ cluster, onEdit, onDelete }) {
  const statusColor = {
    active: "bg-green-900/30 text-green-400 border-green-700",
    inactive: "bg-gray-900/30 text-gray-400 border-gray-700",
    maintenance: "bg-yellow-900/30 text-yellow-400 border-yellow-700"
  }[cluster.status];

  const typeColor = {
    local: "bg-blue-900/30 text-blue-400",
    distributed: "bg-purple-900/30 text-purple-400",
    kubernetes: "bg-cyan-900/30 text-cyan-400",
    cloud: "bg-pink-900/30 text-pink-400",
    hybrid: "bg-orange-900/30 text-orange-400"
  }[cluster.cluster_type] || "bg-gray-900/30 text-gray-400";

  return (
    <Card className="bg-black border-slate-700 hover:border-cyan-400/50 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <CardTitle className="text-cyan-400">{cluster.name}</CardTitle>
              {cluster.is_default && (
                <Badge className="bg-cyan-600 text-black text-xs">DEFAULT</Badge>
              )}
            </div>
            {cluster.description && (
              <p className="text-xs text-gray-500 mt-1">{cluster.description}</p>
            )}
          </div>
          <Badge className={`border ${statusColor}`}>
            {cluster.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Type */}
        <div>
          <Badge className={`text-xs ${typeColor}`}>
            {cluster.cluster_type.replace("-", " ").toUpperCase()}
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-900 rounded p-2 border border-slate-700">
            <div className="flex items-center gap-1 text-gray-400 mb-1">
              <Cpu className="w-3 h-3" />
              CPU
            </div>
            <div className="text-cyan-400 font-bold">{cluster.total_cpu_cores || "—"}</div>
            <div className="text-gray-600 text-xs">cores</div>
          </div>

          <div className="bg-slate-900 rounded p-2 border border-slate-700">
            <div className="flex items-center gap-1 text-gray-400 mb-1">
              <Zap className="w-3 h-3" />
              GPU
            </div>
            <div className="text-green-400 font-bold">{cluster.total_gpu_count || "—"}</div>
            <div className="text-gray-600 text-xs">units</div>
          </div>

          <div className="bg-slate-900 rounded p-2 border border-slate-700">
            <div className="flex items-center gap-1 text-gray-400 mb-1">
              <HardDrive className="w-3 h-3" />
              RAM
            </div>
            <div className="text-orange-400 font-bold">{cluster.total_memory_gb || "—"}</div>
            <div className="text-gray-600 text-xs">GB</div>
          </div>
        </div>

        {/* Runtime Config */}
        {cluster.config && (
          <div className="bg-slate-900/50 rounded p-2 text-xs text-gray-400">
            {cluster.config.runtime && (
              <div>
                <span className="text-cyan-400">Runtime:</span> {cluster.config.runtime}
              </div>
            )}
            {cluster.config.compression && (
              <div>
                <span className="text-cyan-400">Compression:</span> {cluster.config.compression}
              </div>
            )}
            <div>
              <span className="text-cyan-400">Max Jobs:</span> {cluster.max_parallel_jobs}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-700">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(cluster)}
            className="flex-1 border-slate-600 text-cyan-400 hover:bg-cyan-900/20 h-8"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(cluster.id)}
            className="flex-1 border-red-600/50 text-red-400 hover:bg-red-900/20 h-8"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}