import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Cpu, Zap, HardDrive } from "lucide-react";

export default function ClusterNodeDetail({ cluster }) {
  return (
    <Card className="bg-black border-slate-700">
      <CardHeader>
        <CardTitle className="text-cyan-400">Cluster Nodes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cluster.nodes && cluster.nodes.length > 0 ? (
          cluster.nodes.map((node, idx) => (
            <div
              key={idx}
              className="bg-slate-900 rounded p-3 border border-slate-700 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-cyan-400">{node.id}</span>
                </div>
                <Badge className="bg-green-900/30 text-green-400 border-green-700 text-xs">
                  ACTIVE
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-black rounded p-2 border border-slate-700">
                  <div className="flex items-center gap-1 text-gray-400 mb-1">
                    <Cpu className="w-3 h-3" />
                    CPU
                  </div>
                  <div className="text-cyan-400 font-bold">{node.cpu || "—"}</div>
                </div>

                <div className="bg-black rounded p-2 border border-slate-700">
                  <div className="flex items-center gap-1 text-gray-400 mb-1">
                    <Zap className="w-3 h-3" />
                    GPU
                  </div>
                  <div className="text-green-400 font-bold">{node.gpu || "—"}</div>
                </div>

                <div className="bg-black rounded p-2 border border-slate-700">
                  <div className="flex items-center gap-1 text-gray-400 mb-1">
                    <HardDrive className="w-3 h-3" />
                    RAM
                  </div>
                  <div className="text-orange-400 font-bold">
                    {node.memory || "—"}GB
                  </div>
                </div>
              </div>

              {node.status && (
                <div className="text-xs text-gray-500 pt-1 border-t border-slate-700">
                  Status: {node.status}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 text-sm py-6">
            No node information available
          </div>
        )}

        {/* Cluster Summary */}
        <div className="bg-slate-900/50 rounded p-3 border border-slate-700 mt-4">
          <div className="text-xs text-cyan-400 font-semibold mb-2">CLUSTER TOTALS</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-400">Total CPU:</span>
              <span className="text-cyan-400 ml-2 font-bold">
                {cluster.total_cpu_cores} cores
              </span>
            </div>
            <div>
              <span className="text-gray-400">Total GPU:</span>
              <span className="text-green-400 ml-2 font-bold">
                {cluster.total_gpu_count} units
              </span>
            </div>
            <div>
              <span className="text-gray-400">Total RAM:</span>
              <span className="text-orange-400 ml-2 font-bold">
                {cluster.total_memory_gb}GB
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}