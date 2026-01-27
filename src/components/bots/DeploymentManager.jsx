import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Cloud, Server, Laptop, GitBranch, RotateCcw, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function DeploymentManager({ bot }) {
  const [environment, setEnvironment] = useState("local");
  const [version, setVersion] = useState("");
  const [changelog, setChangelog] = useState("");
  const [clusterNodes, setClusterNodes] = useState("");

  const queryClient = useQueryClient();

  const { data: deployments = [] } = useQuery({
    queryKey: ["deployments", bot.id],
    queryFn: () => base44.entities.BotDeployment.filter({ bot_id: bot.id })
  });

  const { data: versions = [] } = useQuery({
    queryKey: ["versions", bot.id],
    queryFn: () => base44.entities.BotVersion.filter({ bot_id: bot.id })
  });

  const deployMutation = useMutation({
    mutationFn: async (deployConfig) => {
      const { data } = await base44.functions.invoke('bot-deployment', {
        action: 'deploy',
        bot_id: bot.id,
        environment,
        config: deployConfig
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
      queryClient.invalidateQueries({ queryKey: ["versions"] });
      toast.success("Deployment initiated");
    }
  });

  const rollbackMutation = useMutation({
    mutationFn: async (deploymentId) => {
      const { data } = await base44.functions.invoke('bot-deployment', {
        action: 'rollback',
        config: { deployment_id: deploymentId }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
      toast.success("Rollback completed");
    }
  });

  const handleDeploy = () => {
    const nodes = clusterNodes.split(',').map(n => n.trim()).filter(n => n);
    
    deployMutation.mutate({
      version: version || `v${Date.now()}`,
      changelog: changelog || 'Manual deployment',
      cluster_nodes: nodes,
      tensor_schemas: bot.config.tensor_schemas || {},
      scxq2_config: bot.config.scxq2_config || {
        lanes: ['DICT', 'FIELD', 'EDGE', 'META']
      },
      xjson_config: {
        phases: ['@Pop', '@Wo', '@Sek', '@Collapse'],
        invariants: ['no_eval', 'weights_normalized']
      }
    });
  };

  const getEnvIcon = (env) => {
    switch (env) {
      case 'local': return Laptop;
      case 'staging': return Server;
      case 'production': return Cloud;
      default: return Server;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'deploying': return 'bg-blue-600';
      case 'failed': return 'bg-red-600';
      case 'rolled_back': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'deploying': return <Clock className="w-3 h-3" />;
      case 'failed': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="border-2 border-cyan-400 bg-black">
      <div className="bg-cyan-400 text-black px-4 py-1 font-bold">
        [ DEPLOYMENT MANAGER - {bot.name} ]
      </div>

      <div className="p-4">
        <Tabs defaultValue="deploy" className="space-y-4">
          <TabsList className="bg-slate-900 border-2 border-cyan-400">
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="active">Active Deployments</TabsTrigger>
          </TabsList>

          <TabsContent value="deploy" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-cyan-400 text-xs mb-1 block">ENVIRONMENT:</label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger className="bg-black border-2 border-cyan-400 text-cyan-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Dev</SelectItem>
                    <SelectItem value="staging">Staging Cluster</SelectItem>
                    <SelectItem value="production">Production Cluster</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-cyan-400 text-xs mb-1 block">VERSION:</label>
                <Input
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0.0"
                  className="bg-black border-2 border-cyan-400 text-cyan-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-cyan-400 text-xs mb-1 block">CLUSTER_NODES (comma-separated):</label>
              <Input
                value={clusterNodes}
                onChange={(e) => setClusterNodes(e.target.value)}
                placeholder="node1.example.com, node2.example.com"
                className="bg-black border-2 border-cyan-400 text-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="text-cyan-400 text-xs mb-1 block">CHANGELOG:</label>
              <Input
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="What changed in this deployment"
                className="bg-black border-2 border-cyan-400 text-cyan-400 font-mono"
              />
            </div>

            <div className="bg-slate-900 p-3 rounded border border-gray-700 text-xs space-y-1 text-gray-400">
              <div>✓ XJSON phases: @Pop → @Wo → @Sek → @Collapse</div>
              <div>✓ SCXQ2 compression: DICT, FIELD, EDGE, META</div>
              <div>✓ Tensor schemas: {bot.config.tensor_schemas ? 'Configured' : 'None'}</div>
              <div>✓ Invariants: {environment === 'production' ? 'Strict' : 'Standard'}</div>
            </div>

            <Button
              onClick={handleDeploy}
              disabled={deployMutation.isPending}
              className="bg-cyan-400 text-black hover:bg-cyan-300 w-full font-bold"
            >
              {deployMutation.isPending ? 'DEPLOYING...' : 'DEPLOY_TO_CLUSTER'}
            </Button>
          </TabsContent>

          <TabsContent value="versions" className="space-y-2">
            {versions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No versions yet. Deploy to create first version.
              </div>
            ) : (
              versions.map((v) => (
                <div key={v.id} className="bg-slate-900 p-3 rounded border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400 font-bold">{v.version}</span>
                        {v.is_stable && (
                          <Badge className="bg-green-600 text-xs">STABLE</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {v.changelog}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(v.created_date).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Hash: {v.artifacts_hash?.slice(0, 8)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-2">
            {deployments.filter(d => d.status === 'active').length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No active deployments
              </div>
            ) : (
              deployments.filter(d => d.status === 'active').map((d) => {
                const EnvIcon = getEnvIcon(d.environment);
                return (
                  <div key={d.id} className="bg-slate-900 p-3 rounded border border-cyan-400">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <EnvIcon className="w-4 h-4 text-cyan-400" />
                          <span className="text-cyan-400 font-bold uppercase">
                            {d.environment}
                          </span>
                          <Badge className={getStatusColor(d.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(d.status)}
                              {d.status}
                            </span>
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>Nodes: {d.cluster_nodes?.length || 0}</div>
                          <div>Deployed: {new Date(d.deployed_at).toLocaleString()}</div>
                          <div>Hash: {d.deployment_hash?.slice(0, 12)}</div>
                        </div>
                      </div>
                      {d.rollback_target && (
                        <button
                          onClick={() => rollbackMutation.mutate(d.id)}
                          disabled={rollbackMutation.isPending}
                          className="border border-yellow-400 text-yellow-400 px-2 py-1 text-xs hover:bg-yellow-900/30 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          ROLLBACK
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}