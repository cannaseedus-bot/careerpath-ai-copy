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
import { Bot, Plus, Play, Pause, Trash2, Network, Database, Globe, Cpu, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import BotTemplates from "@/components/bots/BotTemplates";

export default function BotOrchestrator() {
  const [showForm, setShowForm] = useState(false);
  const [editingBot, setEditingBot] = useState(null);
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
    setShowForm(false);
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
    setShowForm(true);
  };

  const handleTemplateSelect = (template) => {
    setFormData({
      ...formData,
      name: template.name,
      bot_type: template.bot_type,
      config: template.config,
      script: template.script
    });
    setShowForm(true);
  };

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
            <div className="flex justify-between items-center">
              <div>
                <div className="text-cyan-400 text-2xl mb-2">╔═══ BOT ORCHESTRATOR ═══╗</div>
                <div className="text-green-400">Create and manage autonomous bots for scraping, data processing, and cluster operations</div>
              </div>
              <button onClick={() => setShowForm(!showForm)} className="bg-green-400 text-black px-4 py-2 hover:bg-green-300 transition font-bold">
                <Plus className="w-4 h-4 inline mr-2" />
                CREATE_BOT
              </button>
            </div>
          </div>
        </div>

        {/* Bot Templates */}
        {!showForm && (
          <BotTemplates onSelectTemplate={handleTemplateSelect} />
        )}

        {/* Bot Form */}
        {showForm && (
          <div className="border-2 border-cyan-400 bg-black mb-6">
            <div className="bg-cyan-400 text-black px-4 py-1 font-bold">
              {editingBot ? "[ EDIT BOT ]" : "[ CREATE NEW BOT ]"}
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

                <div>
                  <label className="text-green-400 text-sm mb-2 block">BOT_SCRIPT:</label>
                  <Textarea
                    value={formData.script}
                    onChange={(e) => setFormData({ ...formData, script: e.target.value })}
                    className="min-h-[200px] bg-black border-2 border-green-400 text-green-400 font-mono text-sm"
                    placeholder="// Custom bot logic here&#10;async function execute(config) {&#10;  // Your code&#10;}"
                  />
                </div>

                <div className="flex gap-3 justify-end border-t-2 border-gray-700 pt-4">
                  <button type="button" onClick={resetForm} className="border-2 border-red-400 text-red-400 px-4 py-2 hover:bg-red-900/30 transition">
                    CANCEL
                  </button>
                  <button type="submit" className="bg-green-400 text-black px-4 py-2 hover:bg-green-300 transition font-bold">
                    {editingBot ? "UPDATE_BOT" : "CREATE_BOT"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bots Display */}
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
      </div>
    </div>
  );
}