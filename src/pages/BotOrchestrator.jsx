import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Plus, Play, Pause, Trash2, Network, Database, Globe, Cpu, Zap, AlertCircle, Sparkles, Rocket, Layers, TrendingUp, Activity } from "lucide-react";
import { toast } from "sonner";
import BotTemplates from "@/components/bots/BotTemplates";
import AIAssistant from "@/components/bots/AIAssistant";
import DeploymentManager from "@/components/bots/DeploymentManager";
import TensorSchemaVisualizer from "@/components/bots/TensorSchemaVisualizer";
import OptimizationInsights from "@/components/bots/OptimizationInsights";
import CompressionMetrics from "@/components/bots/CompressionMetrics";
import MicronautDashboard from "@/components/micronauts/MicronautDashboard";
import BotCreationWizard from "@/components/bots/BotCreationWizard";
import DeploymentWizard from "@/components/bots/DeploymentWizard";
import OptimizationWizard from "@/components/bots/OptimizationWizard";
import TemplateWizard from "@/components/bots/TemplateWizard";
import ModelBuilderWizard from "@/components/bots/ModelBuilderWizard";

export default function BotOrchestrator() {
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, create, deploy, optimize, template, model
  const [editingBot, setEditingBot] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    bot_type: "custom",
    config: {},
    script: "",
    status: "idle",
    parent_bot_id: "",
    child_bot_ids: [],
    schedule: {}
  });

  const queryClient = useQueryClient();

  const { data: bots = [] } = useQuery({
    queryKey: ["bots"],
    queryFn: () => base44.entities.Bot.list("-updated_date")
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Bot.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      resetForm();
      toast.success("Bot created");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Bot.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Bot.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      toast.success("Bot deleted");
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      bot_type: "custom",
      config: {},
      script: "",
      status: "idle",
      parent_bot_id: "",
      child_bot_ids: [],
      schedule: {}
    });
    setEditingBot(null);
    setActiveView('dashboard');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBot) {
      updateMutation.mutate({ id: editingBot.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (bot) => {
    setEditingBot(bot);
    setFormData(bot);
    setActiveView('create');
  };

  const deployBotMutation = useMutation({
    mutationFn: async (deploymentConfig) => {
      const { data } = await base44.functions.invoke('bot-deployment', {
        action: 'deploy',
        ...deploymentConfig
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
      toast.success('Bot deployed successfully');
      setActiveView('dashboard');
      setSelectedBot(null);
    }
  });

  const optimizeBotMutation = useMutation({
    mutationFn: async (optimizationConfig) => {
      const { data } = await base44.functions.invoke('bot-optimization-agent', {
        action: 'analyze',
        ...optimizationConfig
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
      toast.success('Optimization analysis complete');
      setActiveView('dashboard');
      setSelectedBot(null);
    }
  });

  const toggleBotStatus = async (bot) => {
    const newStatus = bot.status === "running" ? "paused" : "running";
    await updateMutation.mutateAsync({
      id: bot.id,
      data: { ...bot, status: newStatus }
    });
  };

  const getBotIcon = (type) => {
    switch (type) {
      case "orchestrator": return Network;
      case "scraper": return Globe;
      case "data-builder": return Database;
      case "cluster-worker": return Cpu;
      case "ngram-builder": return Zap;
      case "tensor-processor": return Cpu;
      default: return Bot;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "running": return "bg-green-600";
      case "paused": return "bg-yellow-600";
      case "error": return "bg-red-600";
      case "completed": return "bg-blue-600";
      default: return "bg-gray-600";
    }
  };

  const orchestratorBots = bots.filter(b => b.bot_type === "orchestrator");
  const workerBots = bots.filter(b => b.bot_type !== "orchestrator");

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-7xl mx-auto">
        {/* Terminal Header */}
        <div className="border-2 border-green-400 bg-black mb-6">
          <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
            <span className="font-bold">$ mx2lm bots --orchestrate</span>
            <span className="text-xs">[ Bot Orchestration System ]</span>
          </div>
          <div className="p-6">
            <div className="text-cyan-400 text-2xl mb-4">╔═══ BOT ORCHESTRATOR ═══╗</div>
            
            {/* Main Action Buttons */}
            {activeView === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveView('create')}
                  className="border-2 border-green-400 bg-black hover:bg-green-900/30 p-6 transition group"
                >
                  <Plus className="w-12 h-12 text-green-400 mx-auto mb-3 group-hover:scale-110 transition" />
                  <div className="text-green-400 font-bold text-lg">CREATE BOT</div>
                  <div className="text-xs text-gray-400 mt-2">Build custom bot from scratch with AI assistance</div>
                </button>

                <button
                  onClick={() => setActiveView('template')}
                  className="border-2 border-yellow-400 bg-black hover:bg-yellow-900/30 p-6 transition group"
                >
                  <Layers className="w-12 h-12 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition" />
                  <div className="text-yellow-400 font-bold text-lg">USE TEMPLATE</div>
                  <div className="text-xs text-gray-400 mt-2">Quick-start with pre-configured bot templates</div>
                </button>

                <button
                  onClick={() => {
                    if (bots.length === 0) {
                      toast.error('Create a bot first');
                      return;
                    }
                    setActiveView('deploy');
                  }}
                  className="border-2 border-cyan-400 bg-black hover:bg-cyan-900/30 p-6 transition group"
                >
                  <Rocket className="w-12 h-12 text-cyan-400 mx-auto mb-3 group-hover:scale-110 transition" />
                  <div className="text-cyan-400 font-bold text-lg">DEPLOY BOT</div>
                  <div className="text-xs text-gray-400 mt-2">Deploy to local, staging, or production cluster</div>
                </button>

                <button
                  onClick={() => {
                    if (bots.length === 0) {
                      toast.error('Create a bot first');
                      return;
                    }
                    setActiveView('optimize');
                  }}
                  className="border-2 border-purple-400 bg-black hover:bg-purple-900/30 p-6 transition group"
                >
                  <TrendingUp className="w-12 h-12 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition" />
                  <div className="text-purple-400 font-bold text-lg">OPTIMIZE BOT</div>
                  <div className="text-xs text-gray-400 mt-2">AI-driven performance optimization analysis</div>
                </button>

                <button
                  onClick={() => setActiveView('model')}
                  className="border-2 border-yellow-400 bg-black hover:bg-yellow-900/30 p-6 transition group"
                >
                  <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition" />
                  <div className="text-yellow-400 font-bold text-lg">BUILD MODEL</div>
                  <div className="text-xs text-gray-400 mt-2">Configure and quantize LLM models</div>
                </button>
              </div>
            )}

            {/* Back Button */}
            {activeView !== 'dashboard' && (
              <button
                onClick={() => {
                  setActiveView('dashboard');
                  setSelectedBot(null);
                  setEditingBot(null);
                }}
                className="border-2 border-gray-400 text-gray-400 px-4 py-2 hover:bg-gray-900/30 transition mb-4"
              >
                ← BACK TO DASHBOARD
              </button>
            )}
          </div>
        </div>

        {/* Template Wizard View */}
        {activeView === 'template' && (
          <div className="mb-6">
            <TemplateWizard
              onComplete={(botData) => {
                createMutation.mutate(botData);
                setActiveView('dashboard');
              }}
              onCancel={() => setActiveView('dashboard')}
            />
          </div>
        )}

        {/* Create Bot View */}
        {activeView === 'create' && !editingBot && (
          <BotCreationWizard
            onComplete={(botData) => createMutation.mutate(botData)}
            onCancel={() => setActiveView('dashboard')}
          />
        )}

        {/* Deploy Bot View */}
        {activeView === 'deploy' && (
          <div className="mb-6">
            {!selectedBot ? (
              <div className="border-2 border-cyan-400 bg-black p-6">
                <div className="text-cyan-400 text-xl mb-4 font-bold">SELECT BOT TO DEPLOY</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bots.map(bot => (
                    <button
                      key={bot.id}
                      onClick={() => setSelectedBot(bot)}
                      className="border-2 border-cyan-400 p-4 hover:bg-cyan-900/30 transition text-left"
                    >
                      <div className="text-cyan-400 font-bold">{bot.name}</div>
                      <div className="text-xs text-gray-400">{bot.bot_type}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <DeploymentWizard
                bot={selectedBot}
                onComplete={(config) => deployBotMutation.mutate(config)}
                onCancel={() => {
                  setActiveView('dashboard');
                  setSelectedBot(null);
                }}
              />
            )}
          </div>
        )}

        {/* Optimize Bot View */}
        {activeView === 'optimize' && (
          <div className="mb-6">
            {!selectedBot ? (
              <div className="border-2 border-purple-400 bg-black p-6">
                <div className="text-purple-400 text-xl mb-4 font-bold">SELECT BOT TO OPTIMIZE</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bots.map(bot => (
                    <button
                      key={bot.id}
                      onClick={() => setSelectedBot(bot)}
                      className="border-2 border-purple-400 p-4 hover:bg-purple-900/30 transition text-left"
                    >
                      <div className="text-purple-400 font-bold">{bot.name}</div>
                      <div className="text-xs text-gray-400">{bot.bot_type}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <OptimizationWizard
                bot={selectedBot}
                onComplete={(config) => optimizeBotMutation.mutate(config)}
                onCancel={() => {
                  setActiveView('dashboard');
                  setSelectedBot(null);
                }}
              />
            )}
          </div>
        )}

        {/* Model Builder View */}
        {activeView === 'model' && (
          <div className="mb-6">
            <ModelBuilderWizard
              onComplete={(modelData) => {
                toast.success('Model configuration saved');
                setActiveView('dashboard');
              }}
              onCancel={() => setActiveView('dashboard')}
            />
          </div>
        )}

        {/* Model Builder View */}
        {activeView === 'model' && (
          <div className="mb-6">
            <ModelBuilderWizard
              onComplete={(modelData) => {
                toast.success('Model configuration saved');
                setActiveView('dashboard');
              }}
              onCancel={() => setActiveView('dashboard')}
            />
          </div>
        )}

        {/* Bot Edit Form */}
        {activeView === 'create' && editingBot && (
          <div className="border-2 border-cyan-400 bg-black mb-6">
            <div className="bg-cyan-400 text-black px-4 py-1 font-bold">
              [ EDIT BOT ]
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-green-400 text-sm mb-2 block">BOT_NAME:</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="my-scraper-bot"
                      className="bg-black border-2 border-green-400 text-green-400 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-green-400 text-sm mb-2 block">BOT_TYPE:</label>
                    <Select value={formData.bot_type} onValueChange={(val) => setFormData({ ...formData, bot_type: val })}>
                      <SelectTrigger className="bg-black border-2 border-green-400 text-green-400 font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orchestrator">Orchestrator</SelectItem>
                        <SelectItem value="scraper">Web Scraper</SelectItem>
                        <SelectItem value="data-builder">Data Builder</SelectItem>
                        <SelectItem value="cluster-worker">Cluster Worker</SelectItem>
                        <SelectItem value="ngram-builder">N-gram Builder</SelectItem>
                        <SelectItem value="tensor-processor">Tensor Processor</SelectItem>
                        <SelectItem value="custom">Custom Bot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-green-400 text-sm mb-2 block">CONFIGURATION (JSON):</label>
                  <Textarea
                    value={JSON.stringify(formData.config, null, 2)}
                    onChange={(e) => {
                      try {
                        setFormData({ ...formData, config: JSON.parse(e.target.value) });
                      } catch (err) {}
                    }}
                    className="min-h-[150px] bg-black border-2 border-green-400 text-green-400 font-mono text-sm"
                    placeholder='{"urls": [], "selectors": {}, "interval": 3600}'
                  />
                </div>

                {/* Tensor Schema Visualizer */}
                {formData.config?.tensor_schemas && (
                  <TensorSchemaVisualizer 
                    schema={formData.config.tensor_schemas}
                    onEdit={(schema) => setFormData({...formData, config: {...formData.config, tensor_schemas: schema}})}
                  />
                )}

                <div>
                  <label className="text-green-400 text-sm mb-2 flex justify-between items-center">
                    <span>BOT_SCRIPT:</span>
                    <button
                      type="button"
                      onClick={() => setShowAIAssistant(!showAIAssistant)}
                      className="text-xs border border-purple-400 text-purple-400 px-2 py-1 hover:bg-purple-900/30 transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      {showAIAssistant ? "HIDE" : "SHOW"}_AI_ASSIST
                    </button>
                  </label>
                  <Textarea
                    value={formData.script}
                    onChange={(e) => setFormData({ ...formData, script: e.target.value })}
                    className="min-h-[200px] bg-black border-2 border-green-400 text-green-400 font-mono text-sm"
                    placeholder="// Custom bot logic here&#10;async function execute(config) {&#10;  // Your code&#10;}"
                  />
                </div>

                <div className="flex gap-3 justify-end border-t-2 border-gray-700 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                    className="border-2 border-purple-400 text-purple-400 px-4 py-2 hover:bg-purple-900/30 transition font-bold"
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    {showAIAssistant ? 'HIDE' : 'SHOW'}_AI
                  </button>
                  <button type="button" onClick={resetForm} className="border-2 border-red-400 text-red-400 px-4 py-2 hover:bg-red-900/30 transition">
                    CANCEL
                  </button>
                  <button type="submit" className="bg-green-400 text-black px-4 py-2 hover:bg-green-300 transition font-bold">
                    UPDATE_BOT
                  </button>
                </div>

                {/* AI Assistant Panel */}
                {showAIAssistant && (
                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <AIAssistant
                      botType={formData.bot_type}
                      currentScript={formData.script}
                      currentConfig={formData.config}
                      onApplySuggestion={(code) => {
                        setFormData({ ...formData, script: code });
                        toast.success("Code applied to editor");
                      }}
                    />
                    <CompressionMetrics bot={editingBot} />
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Micronaut Dashboard & Bot List */}
        {activeView === 'dashboard' && (
          <>
            <div className="mb-6">
              <MicronautDashboard />
            </div>

            <Tabs defaultValue="orchestrators" className="space-y-6">
          <TabsList className="bg-slate-900 border-2 border-green-400">
            <TabsTrigger value="orchestrators" className="data-[state=active]:bg-green-400 data-[state=active]:text-black">
              Orchestrators ({orchestratorBots.length})
            </TabsTrigger>
            <TabsTrigger value="workers" className="data-[state=active]:bg-green-400 data-[state=active]:text-black">
              Worker Bots ({workerBots.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orchestrators" className="space-y-4">
            {orchestratorBots.length === 0 ? (
              <div className="border-2 border-gray-700 bg-black p-8 text-center">
                <Network className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-500">No orchestrator bots created yet</div>
              </div>
            ) : (
              orchestratorBots.map((bot) => {
                const Icon = getBotIcon(bot.bot_type);
                return (
                  <div key={bot.id} className="border-2 border-cyan-400 bg-black">
                    <div className="bg-cyan-400 text-black px-4 py-1 flex justify-between items-center">
                      <span className="font-bold flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {bot.name}
                      </span>
                      <Badge className={getStatusColor(bot.status)}>
                        {bot.status}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="text-sm">
                        <span className="text-gray-500">TYPE:</span> <span className="text-yellow-400">{bot.bot_type}</span>
                      </div>
                      {bot.child_bot_ids?.length > 0 && (
                        <div className="text-sm">
                          <span className="text-gray-500">CHILD_BOTS:</span> <span className="text-cyan-400">{bot.child_bot_ids.length}</span>
                        </div>
                      )}
                      {bot.metrics && (
                        <div className="bg-slate-900 p-3 rounded text-xs">
                          <pre className="text-green-400">{JSON.stringify(bot.metrics, null, 2)}</pre>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2 border-t-2 border-gray-700">
                        <button
                          onClick={() => toggleBotStatus(bot)}
                          className="border-2 border-green-400 text-green-400 px-3 py-1 hover:bg-green-900/30 transition flex items-center gap-2"
                        >
                          {bot.status === "running" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {bot.status === "running" ? "PAUSE" : "START"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBot(bot);
                            setActiveView('deploy');
                          }}
                          className="border-2 border-cyan-400 text-cyan-400 px-3 py-1 hover:bg-cyan-900/30 transition flex items-center gap-2"
                        >
                          <Rocket className="w-4 h-4" />
                          DEPLOY
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBot(bot);
                            setActiveView('optimize');
                          }}
                          className="border-2 border-orange-400 text-orange-400 px-3 py-1 hover:bg-orange-900/30 transition flex items-center gap-2"
                        >
                          <TrendingUp className="w-4 h-4" />
                          OPTIMIZE
                        </button>
                        <button
                          onClick={() => handleEdit(bot)}
                          className="border-2 border-yellow-400 text-yellow-400 px-3 py-1 hover:bg-yellow-900/30 transition"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(bot.id)}
                          className="border-2 border-red-400 text-red-400 px-3 py-1 hover:bg-red-900/30 transition"
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="workers" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workerBots.length === 0 ? (
              <div className="col-span-full border-2 border-gray-700 bg-black p-8 text-center">
                <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-500">No worker bots created yet</div>
              </div>
            ) : (
              workerBots.map((bot) => {
                const Icon = getBotIcon(bot.bot_type);
                return (
                  <div key={bot.id} className="border-2 border-green-400 bg-black">
                    <div className="bg-green-400 text-black px-3 py-1 flex justify-between items-center">
                      <span className="font-bold text-sm flex items-center gap-1">
                        <Icon className="w-3 h-3" />
                        {bot.name}
                      </span>
                      <Badge className={`${getStatusColor(bot.status)} text-xs`}>
                        {bot.status}
                      </Badge>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="text-xs">
                        <span className="text-gray-500">TYPE:</span> <span className="text-yellow-400">{bot.bot_type}</span>
                      </div>
                      {bot.last_run && (
                        <div className="text-xs text-gray-500">
                          LAST_RUN: {new Date(bot.last_run).toLocaleString()}
                        </div>
                      )}
                      <div className="flex gap-1 pt-2 border-t-2 border-gray-700">
                        <button
                          onClick={() => toggleBotStatus(bot)}
                          className="flex-1 border border-green-400 text-green-400 px-2 py-1 hover:bg-green-900/30 transition text-xs"
                        >
                          {bot.status === "running" ? "PAUSE" : "START"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBot(bot);
                            setActiveView('deploy');
                          }}
                          className="border border-cyan-400 text-cyan-400 px-2 py-1 hover:bg-cyan-900/30 transition text-xs"
                          title="Deploy"
                        >
                          <Rocket className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBot(bot);
                            setActiveView('optimize');
                          }}
                          className="border border-orange-400 text-orange-400 px-2 py-1 hover:bg-orange-900/30 transition text-xs"
                          title="Optimize"
                        >
                          <TrendingUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleEdit(bot)}
                          className="border border-yellow-400 text-yellow-400 px-2 py-1 hover:bg-yellow-900/30 transition text-xs"
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(bot.id)}
                          className="border border-red-400 text-red-400 px-2 py-1 hover:bg-red-900/30 transition text-xs"
                        >
                          DEL
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
          </>
        )}
      </div>
    </div>
  );
}