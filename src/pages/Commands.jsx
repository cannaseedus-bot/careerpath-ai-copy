import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Plus, Copy, Code, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function Commands() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [formData, setFormData] = useState({
    command: "",
    description: "",
    category: "custom",
    syntax: "",
    options: [],
    examples: [],
    script: "",
    is_custom: true,
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: commands = [] } = useQuery({
    queryKey: ["clicommands"],
    queryFn: () => base44.entities.CLICommand.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CLICommand.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clicommands"] });
      setShowForm(false);
      toast.success("Command created");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CLICommand.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clicommands"] });
      toast.success("Command deleted");
    }
  });

  const handleCopyCommand = (cmd) => {
    navigator.clipboard.writeText(cmd);
    toast.success("Command copied");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredCommands = selectedCategory === "all" 
    ? commands 
    : commands.filter(cmd => cmd.category === selectedCategory);

  const categories = ["all", "model", "deployment", "config", "monitoring", "data", "utility", "custom"];

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-7xl mx-auto">
        {/* Terminal Header */}
        <div className="border-2 border-green-400 bg-black mb-6">
          <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
            <span className="font-bold">$ mx2lm commands --custom</span>
            <span className="text-xs">[ Command Manager ]</span>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-cyan-400 text-2xl mb-2">╔═══ CLI COMMAND LIBRARY ═══╗</div>
                <div className="text-green-400">Manage and create custom CLI commands</div>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-green-400 text-black px-4 py-2 hover:bg-green-300 transition font-bold"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                NEW_COMMAND
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 transition ${
                selectedCategory === cat 
                  ? "bg-cyan-400 text-black font-bold" 
                  : "border-2 border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
              }`}
            >
              [{cat.toUpperCase()}]
            </button>
          ))}
        </div>

        {showForm && (
          <div className="mb-6 border-2 border-cyan-400 bg-black">
            <div className="bg-cyan-400 text-black px-4 py-1">
              <span className="font-bold">CREATE_CUSTOM_COMMAND</span>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-cyan-400 mb-2 block">► Command</label>
                    <Input
                      value={formData.command}
                      onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                      placeholder="mx2lm mycommand"
                      className="bg-black border-2 border-green-400 text-green-400 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-cyan-400 mb-2 block">► Category</label>
                    <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                      <SelectTrigger className="bg-black border-2 border-green-400 text-green-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="model">Model</SelectItem>
                        <SelectItem value="deployment">Deployment</SelectItem>
                        <SelectItem value="config">Config</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                        <SelectItem value="data">Data</SelectItem>
                        <SelectItem value="utility">Utility</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-cyan-400 mb-2 block">► Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What does this command do?"
                    className="bg-black border-2 border-green-400 text-green-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-cyan-400 mb-2 block">► Syntax</label>
                  <Input
                    value={formData.syntax}
                    onChange={(e) => setFormData({ ...formData, syntax: e.target.value })}
                    placeholder="mx2lm mycommand [options]"
                    className="bg-black border-2 border-green-400 text-green-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm text-cyan-400 mb-2 block">► Examples (one per line)</label>
                  <Textarea
                    value={formData.examples.join("\n")}
                    onChange={(e) => setFormData({ ...formData, examples: e.target.value.split("\n").filter(Boolean) })}
                    placeholder="mx2lm mycommand --option value"
                    className="min-h-[100px] bg-black border-2 border-green-400 text-green-400 font-mono text-sm"
                  />
                </div>
                <div className="flex gap-3 justify-end mt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="border-2 border-gray-600 text-gray-400 px-4 py-2 hover:bg-gray-900 transition">
                    [CANCEL]
                  </button>
                  <button type="submit" className="bg-green-400 text-black px-4 py-2 hover:bg-green-300 transition font-bold">
                    [CREATE]
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCommands.map((cmd) => (
            <div key={cmd.id} className="border-2 border-green-400 bg-black hover:border-cyan-400 transition-all">
              <div className="border-b-2 border-green-400 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-cyan-400 text-lg font-mono">{cmd.command}</div>
                    <p className="text-green-400 text-sm mt-1">{cmd.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-yellow-400 text-black">[{cmd.category.toUpperCase()}]</span>
                    {cmd.is_custom && <span className="text-xs px-2 py-1 border-2 border-gray-600 text-gray-400">[CUSTOM]</span>}
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {cmd.syntax && (
                  <div className="border-2 border-gray-700 p-3">
                    <div className="text-xs text-gray-500 mb-1">$ Syntax:</div>
                    <code className="text-sm text-yellow-400 font-mono">{cmd.syntax}</code>
                  </div>
                )}
                
                {cmd.examples && cmd.examples.length > 0 && (
                  <div className="border-2 border-gray-700 p-3">
                    <div className="text-xs text-gray-500 mb-2">$ Examples:</div>
                    {cmd.examples.map((example, i) => (
                      <div key={i} className="flex items-center justify-between group mb-1">
                        <code className="text-sm text-cyan-400 font-mono flex-1">{example}</code>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity border-2 border-cyan-400 text-cyan-400 px-2 py-1 hover:bg-cyan-900/30"
                          onClick={() => handleCopyCommand(example)}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    className="border-2 border-cyan-400 text-cyan-400 px-3 py-1 flex-1 hover:bg-cyan-900/30 transition"
                    onClick={() => handleCopyCommand(cmd.command)}
                  >
                    <Copy className="w-4 h-4 inline mr-1" />
                    COPY
                  </button>
                  {cmd.is_custom && (
                    <button
                      className="border-2 border-red-400 text-red-400 px-3 py-1 hover:bg-red-900/30 transition"
                      onClick={() => deleteMutation.mutate(cmd.id)}
                    >
                      DELETE
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCommands.length === 0 && (
          <div className="border-2 border-gray-600 bg-black p-16 text-center">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-500 mb-2">╔════════════════════════╗</div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">NO_COMMANDS_FOUND</h3>
            <div className="text-gray-500 mb-2">╚════════════════════════╝</div>
            <p className="text-gray-600">$ Create custom commands to extend CLI functionality</p>
          </div>
        )}
      </div>
    </div>
  );
}