import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, Clock, User, Link as LinkIcon, Zap, 
  ChevronDown, ChevronUp, CheckCircle2, Circle, ArrowRight
} from "lucide-react";
import { toast } from "sonner";

const STATUS_COLUMNS = [
  { key: "backlog", label: "Backlog", color: "border-slate-600" },
  { key: "todo", label: "To Do", color: "border-yellow-600" },
  { key: "in_progress", label: "In Progress", color: "border-blue-600" },
  { key: "review", label: "Review", color: "border-purple-600" },
  { key: "completed", label: "Done", color: "border-green-600" }
];

const TASK_TYPE_ICONS = {
  feature: "🚀",
  bug: "🐛",
  refactor: "♻️",
  research: "🔬",
  documentation: "📝",
  testing: "🧪",
  ai_agent: "🤖"
};

const PRIORITY_COLORS = {
  low: "bg-slate-600",
  medium: "bg-yellow-600",
  high: "bg-orange-600",
  critical: "bg-red-600"
};

const AGENT_ROLES = [
  { value: "reviewer", label: "Reviewer" },
  { value: "security", label: "Security" },
  { value: "debugger", label: "Debugger" },
  { value: "optimizer", label: "Optimizer" },
  { value: "architect", label: "Architect" }
];

export default function TaskBoard({ project, onLinkSession }) {
  const [showForm, setShowForm] = useState(false);
  const [expandedTask, setExpandedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "backlog",
    priority: "medium",
    task_type: "feature",
    assigned_role: "",
    estimated_hours: "",
    due_date: ""
  });

  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", project?.id],
    queryFn: () => base44.entities.ProjectTask.filter({ project_id: project?.id }),
    enabled: !!project?.id
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ProjectTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", project?.id] });
      resetForm();
      toast.success("Task created!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProjectTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", project?.id] });
      updateProjectProgress();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProjectTask.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", project?.id] });
      toast.success("Task deleted!");
    }
  });

  const updateProjectProgress = () => {
    if (!project?.id) return;
    const completed = tasks.filter(t => t.status === "completed").length;
    const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    base44.entities.Project.update(project.id, { progress });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "backlog",
      priority: "medium",
      task_type: "feature",
      assigned_role: "",
      estimated_hours: "",
      due_date: ""
    });
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Task title required");
      return;
    }
    createMutation.mutate({
      ...formData,
      project_id: project.id,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
      ai_suggestions: [],
      dependencies: []
    });
  };

  const moveTask = (task, newStatus) => {
    updateMutation.mutate({
      id: task.id,
      data: {
        status: newStatus,
        completed_date: newStatus === "completed" ? new Date().toISOString() : null
      }
    });
  };

  const linkSessionToTask = (task) => {
    if (onLinkSession) {
      onLinkSession(task);
    }
  };

  if (!project) {
    return (
      <div className="text-slate-400 text-center py-12">
        Select a project to view tasks
      </div>
    );
  }

  const tasksByStatus = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter(t => t.status === col.key);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-white font-bold">{project.name}</span>
          <span className="text-slate-400 ml-2">- Tasks ({tasks.length})</span>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-1" /> Add Task
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="bg-slate-800 border-cyan-600">
          <CardContent className="p-4 space-y-3">
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
              className="bg-slate-900 border-slate-600 text-white"
            />
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description"
              className="bg-slate-900 border-slate-600 text-white h-16"
            />
            <div className="grid grid-cols-3 gap-2">
              <Select value={formData.task_type} onValueChange={(v) => setFormData({ ...formData, task_type: v })}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">🚀 Feature</SelectItem>
                  <SelectItem value="bug">🐛 Bug</SelectItem>
                  <SelectItem value="refactor">♻️ Refactor</SelectItem>
                  <SelectItem value="research">🔬 Research</SelectItem>
                  <SelectItem value="documentation">📝 Docs</SelectItem>
                  <SelectItem value="testing">🧪 Testing</SelectItem>
                  <SelectItem value="ai_agent">🤖 AI Agent</SelectItem>
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
              <Select value={formData.assigned_role} onValueChange={(v) => setFormData({ ...formData, assigned_role: v })}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue placeholder="Assign role" />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                placeholder="Est. hours"
                className="bg-slate-900 border-slate-600 text-white"
              />
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="bg-slate-900 border-slate-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="bg-green-600 flex-1">Create Task</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-2 overflow-x-auto">
        {STATUS_COLUMNS.map(column => (
          <div key={column.key} className={`bg-slate-900 rounded-lg border-t-2 ${column.color} min-h-64`}>
            <div className="p-2 border-b border-slate-700">
              <span className="text-white text-sm font-semibold">{column.label}</span>
              <Badge className="ml-2 bg-slate-700 text-xs">{tasksByStatus[column.key].length}</Badge>
            </div>
            <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
              {tasksByStatus[column.key].map(task => (
                <Card 
                  key={task.id} 
                  className="bg-slate-800 border-slate-700 cursor-pointer hover:border-slate-500"
                  onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                >
                  <CardContent className="p-2">
                    <div className="flex items-start gap-2">
                      <span>{TASK_TYPE_ICONS[task.task_type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{task.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge className={`${PRIORITY_COLORS[task.priority]} text-xs px-1`}>
                            {task.priority}
                          </Badge>
                          {task.assigned_role && (
                            <Badge variant="outline" className="text-xs px-1">{task.assigned_role}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {expandedTask === task.id && (
                      <div className="mt-2 pt-2 border-t border-slate-700 space-y-2">
                        {task.description && (
                          <p className="text-slate-400 text-xs">{task.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1 text-xs text-slate-500">
                          {task.estimated_hours && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />{task.estimated_hours}h
                            </span>
                          )}
                          {task.due_date && (
                            <span>Due: {task.due_date}</span>
                          )}
                        </div>
                        {task.ai_suggestions?.length > 0 && (
                          <div className="bg-purple-900/30 p-1 rounded text-xs">
                            <Zap className="w-3 h-3 inline text-purple-400" /> 
                            {task.ai_suggestions.length} AI suggestions
                          </div>
                        )}
                        <div className="flex gap-1 flex-wrap">
                          {column.key !== "completed" && (
                            <Button 
                              size="sm" 
                              className="h-6 text-xs bg-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextStatus = STATUS_COLUMNS[STATUS_COLUMNS.findIndex(c => c.key === column.key) + 1]?.key;
                                if (nextStatus) moveTask(task, nextStatus);
                              }}
                            >
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 text-xs"
                            onClick={(e) => { e.stopPropagation(); linkSessionToTask(task); }}
                          >
                            <LinkIcon className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 text-xs text-red-400"
                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(task.id); }}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}