import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  FolderKanban, Plus, Calendar, Target, GitBranch, 
  Users, ChevronRight, Edit, Trash2, Link as LinkIcon
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS = {
  planning: "bg-slate-600",
  active: "bg-green-600",
  on_hold: "bg-yellow-600",
  completed: "bg-blue-600",
  archived: "bg-gray-600"
};

const PRIORITY_COLORS = {
  low: "text-slate-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  critical: "text-red-400"
};

export default function ProjectManager({ onSelectProject }) {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning",
    priority: "medium",
    repository_url: "",
    tech_stack: [],
    target_date: ""
  });
  const [techInput, setTechInput] = useState("");

  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date")
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      resetForm();
      toast.success("Project created!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      resetForm();
      toast.success("Project updated!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted!");
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "planning",
      priority: "medium",
      repository_url: "",
      tech_stack: [],
      target_date: ""
    });
    setEditingProject(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Project name required");
      return;
    }
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, session_ids: [], milestones: [], progress: 0 });
    }
  };

  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status || "planning",
      priority: project.priority || "medium",
      repository_url: project.repository_url || "",
      tech_stack: project.tech_stack || [],
      target_date: project.target_date || ""
    });
    setEditingProject(project);
    setShowForm(true);
  };

  const addTech = () => {
    if (techInput.trim() && !formData.tech_stack.includes(techInput.trim())) {
      setFormData({ ...formData, tech_stack: [...formData.tech_stack, techInput.trim()] });
      setTechInput("");
    }
  };

  const removeTech = (tech) => {
    setFormData({ ...formData, tech_stack: formData.tech_stack.filter(t => t !== tech) });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-white">Projects ({projects.length})</span>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-1" /> New Project
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="bg-slate-800 border-cyan-600">
          <CardHeader className="py-3">
            <CardTitle className="text-cyan-400 text-sm">
              {editingProject ? "Edit Project" : "Create Project"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Project name"
              className="bg-slate-900 border-slate-600 text-white"
            />
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description"
              className="bg-slate-900 border-slate-600 text-white h-20"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              value={formData.repository_url}
              onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
              placeholder="Repository URL (optional)"
              className="bg-slate-900 border-slate-600 text-white"
            />
            <Input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="bg-slate-900 border-slate-600 text-white"
            />
            <div className="flex gap-2">
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add tech (e.g., Python)"
                className="bg-slate-900 border-slate-600 text-white"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
              />
              <Button size="sm" onClick={addTech} className="bg-purple-600">Add</Button>
            </div>
            {formData.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.tech_stack.map(tech => (
                  <Badge key={tech} className="bg-purple-600 cursor-pointer" onClick={() => removeTech(tech)}>
                    {tech} ×
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 flex-1">
                {editingProject ? "Update" : "Create"}
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-slate-400 text-center py-8">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No projects yet. Create your first project!</div>
        ) : (
          projects.map(project => (
            <Card 
              key={project.id} 
              className="bg-slate-900 border-slate-700 hover:border-cyan-600 cursor-pointer transition-all"
              onClick={() => onSelectProject?.(project)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-semibold">{project.name}</span>
                      <Badge className={STATUS_COLORS[project.status]}>{project.status}</Badge>
                      <span className={`text-xs ${PRIORITY_COLORS[project.priority]}`}>
                        {project.priority}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-slate-400 text-sm mb-2 line-clamp-1">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {project.target_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {project.target_date}
                        </span>
                      )}
                      {project.repository_url && (
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" /> Repo
                        </span>
                      )}
                      {project.session_ids?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {project.session_ids.length} sessions
                        </span>
                      )}
                    </div>
                    {project.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.tech_stack.slice(0, 4).map(tech => (
                          <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                        ))}
                        {project.tech_stack.length > 4 && (
                          <Badge variant="outline" className="text-xs">+{project.tech_stack.length - 4}</Badge>
                        )}
                      </div>
                    )}
                    {project.progress > 0 && (
                      <div className="mt-2">
                        <Progress value={project.progress} className="h-1" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={(e) => { e.stopPropagation(); handleEdit(project); }}
                      className="h-7 w-7 text-slate-400 hover:text-white"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(project.id); }}
                      className="h-7 w-7 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}