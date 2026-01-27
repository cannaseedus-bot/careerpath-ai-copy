import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import ClusterCard from "@/components/clusters/ClusterCard";
import ClusterForm from "@/components/clusters/ClusterForm";
import ResourceUtilizationChart from "@/components/clusters/ResourceUtilizationChart";
import ClusterNodeDetail from "@/components/clusters/ClusterNodeDetail";
import { toast } from "sonner";

export default function ClusterManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingCluster, setEditingCluster] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [searchText, setSearchText] = useState("");
  const queryClient = useQueryClient();

  // Fetch clusters
  const { data: clusters = [], isLoading } = useQuery({
    queryKey: ["clusters"],
    queryFn: () => base44.entities.Cluster.list(),
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (clusterData) => {
      if (editingCluster) {
        return base44.entities.Cluster.update(editingCluster.id, clusterData);
      } else {
        return base44.entities.Cluster.create(clusterData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      setShowForm(false);
      setEditingCluster(null);
      toast.success(
        editingCluster ? "Cluster updated successfully" : "Cluster created successfully"
      );
    },
    onError: (error) => {
      toast.error("Operation failed: " + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (clusterId) => base44.entities.Cluster.delete(clusterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      setSelectedCluster(null);
      toast.success("Cluster deleted");
    },
    onError: (error) => {
      toast.error("Delete failed: " + error.message);
    },
  });

  const handleEdit = (cluster) => {
    setEditingCluster(cluster);
    setShowForm(true);
  };

  const handleDelete = (clusterId) => {
    if (confirm("Are you sure you want to delete this cluster?")) {
      deleteMutation.mutate(clusterId);
    }
  };

  const handleSave = (clusterData) => {
    saveMutation.mutate(clusterData);
  };

  const filteredClusters = clusters.filter((c) =>
    c.name.toLowerCase().includes(searchText.toLowerCase()) ||
    c.cluster_type.toLowerCase().includes(searchText.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center text-gray-400 py-12">Loading clusters...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-cyan-400 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">Cluster Management</h1>
              <p className="text-sm text-gray-400 mt-1">
                Manage bot orchestration clusters with xJSON and SCXQ2
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingCluster(null);
                setShowForm(true);
              }}
              className="bg-cyan-400 text-black hover:bg-cyan-300 font-bold"
            >
              <Plus className="w-4 h-4 mr-2" />
              NEW CLUSTER
            </Button>
          </div>
        </div>

        {/* Layout: Form (if open) + Clusters + Detail */}
        <div className="grid grid-cols-12 gap-6">
          {/* Form Panel */}
          {showForm && (
            <div className="col-span-4">
              <ClusterForm
                cluster={editingCluster}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingCluster(null);
                }}
              />
            </div>
          )}

          {/* Clusters List */}
          <div className={`${showForm ? "col-span-8" : "col-span-8"} space-y-4`}>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search clusters..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-black border border-slate-700 rounded px-3 py-2 pl-9 text-sm text-cyan-400 placeholder:text-gray-600 focus:border-cyan-400 outline-none"
              />
            </div>

            {/* Clusters Grid */}
            {filteredClusters.length > 0 ? (
              <div className="grid gap-4">
                {filteredClusters.map((cluster) => (
                  <div
                    key={cluster.id}
                    onClick={() => setSelectedCluster(cluster)}
                    className="cursor-pointer"
                  >
                    <ClusterCard
                      cluster={cluster}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                {searchText ? "No clusters found" : "No clusters yet. Create your first one!"}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedCluster && (
            <div className="col-span-4 space-y-4 h-fit sticky top-6">
              <ClusterNodeDetail cluster={selectedCluster} />
              <ResourceUtilizationChart clusterId={selectedCluster.id} />
            </div>
          )}
        </div>

        {/* Cluster Stats Overview */}
        {clusters.length > 0 && (
          <div className="border-t border-slate-700 pt-6 mt-6">
            <h2 className="text-lg font-bold text-cyan-400 mb-4">Overview</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-700 rounded p-4">
                <div className="text-xs text-gray-400 mb-1">TOTAL CLUSTERS</div>
                <div className="text-2xl font-bold text-cyan-400">{clusters.length}</div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded p-4">
                <div className="text-xs text-gray-400 mb-1">ACTIVE</div>
                <div className="text-2xl font-bold text-green-400">
                  {clusters.filter((c) => c.status === "active").length}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded p-4">
                <div className="text-xs text-gray-400 mb-1">GPU CLUSTERS</div>
                <div className="text-2xl font-bold text-green-400">
                  {clusters.filter((c) => c.gpu_support).length}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded p-4">
                <div className="text-xs text-gray-400 mb-1">HYBRID/xJSON</div>
                <div className="text-2xl font-bold text-orange-400">
                  {clusters.filter((c) => c.cluster_type === "hybrid").length}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}