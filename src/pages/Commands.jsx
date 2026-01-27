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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Terminal className="w-10 h-10 text-orange-400" />
              CLI Commands
            </h1>
            <p className="text-slate-400 mt-2">Manage and create custom CLI commands</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-5 h-5 mr-2" />
            New Command
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat 
                ? "bg-orange-600" 
                : "border-slate-600 text-slate-300"
              }
            >
              {cat}
            </Button>
          ))}
        </div>

        {showForm && (
          <Card className="mb-8 bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Create Custom Command</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Command</label>
                    <Input
                      value={formData.command}
                      onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                      placeholder="mx2lm mycommand"
                      className="bg-slate-900 border-slate-600 text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">Category</label>
                    <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
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
                  <label className="text-sm text-slate-300 mb-2 block">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What does this command do?"
                    className="bg-slate-900 border-slate-600 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Syntax</label>
                  <Input
                    value={formData.syntax}
                    onChange={(e) => setFormData({ ...formData, syntax: e.target.value })}
                    placeholder="mx2lm mycommand [options]"
                    className="bg-slate-900 border-slate-600 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Examples (one per line)</label>
                  <Textarea
                    value={formData.examples.join("\n")}
                    onChange={(e) => setFormData({ ...formData, examples: e.target.value.split("\n").filter(Boolean) })}
                    placeholder="mx2lm mycommand --option value"
                    className="min-h-[100px] bg-slate-900 border-slate-600 text-white font-mono text-sm"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                    Create Command
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCommands.map((cmd) => (
            <Card key={cmd.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg font-mono">{cmd.command}</CardTitle>
                    <p className="text-slate-400 text-sm mt-1">{cmd.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-orange-600">{cmd.category}</Badge>
                    {cmd.is_custom && <Badge variant="outline" className="border-slate-600">Custom</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {cmd.syntax && (
                  <div className="bg-slate-900 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">Syntax:</div>
                    <code className="text-sm text-green-400 font-mono">{cmd.syntax}</code>
                  </div>
                )}
                
                {cmd.examples && cmd.examples.length > 0 && (
                  <div className="bg-slate-900 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-2">Examples:</div>
                    {cmd.examples.map((example, i) => (
                      <div key={i} className="flex items-center justify-between group mb-1">
                        <code className="text-sm text-green-400 font-mono flex-1">{example}</code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                          onClick={() => handleCopyCommand(example)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-slate-300 flex-1"
                    onClick={() => handleCopyCommand(cmd.command)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  {cmd.is_custom && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(cmd.id)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCommands.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No commands found</h3>
            <p className="text-slate-500">Create custom commands to extend CLI functionality</p>
          </div>
        )}
      </div>
    </div>
  );
}