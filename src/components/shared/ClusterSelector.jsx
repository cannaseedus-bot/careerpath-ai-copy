import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive } from "lucide-react";

export default function ClusterSelector({ value, onChange, label = "Select Cluster" }) {
  const { data: clusters = [], isLoading } = useQuery({
    queryKey: ["clusters"],
    queryFn: () => base44.entities.Cluster.list(),
  });

  const selectedCluster = clusters.find((c) => c.id === value);

  if (isLoading) {
    return <div className="text-gray-400 text-sm">Loading clusters...</div>;
  }

  return (
    <div className="space-y-2">
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className="bg-black border-slate-700 text-cyan-400">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className="bg-black border-slate-700">
          {clusters.map((cluster) => (
            <SelectItem key={cluster.id} value={cluster.id}>
              <div className="flex items-center gap-2">
                <span>{cluster.name}</span>
                {cluster.gpu_support && (
                  <Badge className="ml-2 bg-green-900/30 text-green-400 border-green-700">
                    {cluster.total_gpu_count} GPU
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedCluster && (
        <div className="bg-slate-900 border border-slate-700 rounded p-3 text-xs space-y-2">
          <p className="text-gray-300 font-semibold">{selectedCluster.name}</p>
          {selectedCluster.description && (
            <p className="text-gray-500">{selectedCluster.description}</p>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="border-slate-600 text-cyan-400">
              {selectedCluster.cluster_type}
            </Badge>
            {selectedCluster.total_cpu_cores && (
              <div className="flex items-center gap-1 text-gray-400">
                <Cpu className="w-3 h-3" />
                <span>{selectedCluster.total_cpu_cores} cores</span>
              </div>
            )}
            {selectedCluster.total_memory_gb && (
              <div className="flex items-center gap-1 text-gray-400">
                <HardDrive className="w-3 h-3" />
                <span>{selectedCluster.total_memory_gb}GB RAM</span>
              </div>
            )}
          </div>
          <p className="text-gray-600">
            Max parallel jobs: {selectedCluster.max_parallel_jobs}
          </p>
        </div>
      )}
    </div>
  );
}