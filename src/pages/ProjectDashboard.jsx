import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FolderKanban, ListTodo, Users, GitBranch, ArrowLeft, 
  Link as LinkIcon, Zap
} from "lucide-react";
import { toast } from "sonner";
import ProjectManager from "@/components/projects/ProjectManager";
import TaskBoard from "@/components/projects/TaskBoard";
import CollaborativeSession from "@/components/cli/CollaborativeSession";
import { cliCollaboration } from "@/functions/cliCollaboration";

export default function ProjectDashboard() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [linkingTask, setLinkingTask] = useState(null);

  const queryClient = useQueryClient();

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProjectTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", selectedProject?.id] });
      toast.success("Session linked to task!");
    }
  });

  const createSessionForProject = async () => {
    try {
      const response = await cliCollaboration({
        action: "create_session",
        data: {
          config: {
            projectId: selectedProject.id,
            projectName: selectedProject.name
          }
        }
      });

      if (response.data?.sessionId) {
        // Link session to project
        const currentSessions = selectedProject.session_ids || [];
        updateProjectMutation.mutate({
          id: selectedProject.id,
          data: { session_ids: [...currentSessions, response.data.sessionId] }
        });

        setActiveSession(response.data.sessionId);
        toast.success("Session created and linked to project!");
      }
    } catch (e) {
      toast.error("Failed to create session");
    }
  };

  const handleLinkSession = (task) => {
    setLinkingTask(task);
    createSessionForProject();
  };

  const linkSessionToTask = (sessionId) => {
    if (linkingTask) {
      updateTaskMutation.mutate({
        id: linkingTask.id,
        data: { session_id: sessionId }
      });
      setLinkingTask(null);
    }
  };

  // If there's an active session, show the collaboration view
  if (activeSession) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono">
        <div className="h-screen flex flex-col">
          <div className="p-2 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  if (linkingTask) linkSessionToTask(activeSession);
                  setActiveSession(null);
                }}
                className="text-cyan-400"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Project
              </Button>
              {selectedProject && (
                <Badge className="bg-cyan-600">{selectedProject.name}</Badge>
              )}
            </div>
          </div>
          <div className="flex-1">
            <CollaborativeSession
              sessionId={activeSession}
              initialRole="architect"
              onClose={() => {
                if (linkingTask) linkSessionToTask(activeSession);
                setActiveSession(null);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="border-2 border-cyan-400 bg-black mb-6">
          <div className="bg-gradient-to-r from-cyan-500 to-purple-500 text-black px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FolderKanban className="w-5 h-5" />
              <span className="font-bold text-lg">PROJECT MANAGEMENT</span>
              <Badge className="bg-black text-cyan-400">CLI Integration</Badge>
            </div>
            <span className="text-xs">Track • Collaborate • Deliver</span>
          </div>
        </div>

        {selectedProject ? (
          // Project Detail View
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedProject(null)}
                className="text-cyan-400"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> All Projects
              </Button>
              <Button 
                onClick={createSessionForProject}
                className="bg-green-600 hover:bg-green-700"
              >
                <Users className="w-4 h-4 mr-2" /> Start Collaboration Session
              </Button>
            </div>

            {/* Project Info */}
            <Card className="bg-slate-900 border-cyan-600">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedProject.name}</h2>
                    {selectedProject.description && (
                      <p className="text-slate-400 text-sm mt-1">{selectedProject.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className={`${selectedProject.status === 'active' ? 'bg-green-600' : 'bg-slate-600'}`}>
                        {selectedProject.status}
                      </Badge>
                      {selectedProject.repository_url && (
                        <a 
                          href={selectedProject.repository_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-cyan-400 text-sm hover:underline"
                        >
                          <GitBranch className="w-3 h-3" /> Repository
                        </a>
                      )}
                      {selectedProject.session_ids?.length > 0 && (
                        <span className="flex items-center gap-1 text-purple-400 text-sm">
                          <Users className="w-3 h-3" /> {selectedProject.session_ids.length} sessions
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {selectedProject.target_date && (
                      <div className="text-slate-400 text-sm">Target: {selectedProject.target_date}</div>
                    )}
                    <div className="text-2xl font-bold text-cyan-400">{selectedProject.progress || 0}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session History */}
            {selectedProject.session_ids?.length > 0 && (
              <Card className="bg-slate-900 border-purple-600">
                <CardHeader className="py-3">
                  <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" /> Linked Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.session_ids.map(sid => (
                      <Button
                        key={sid}
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveSession(sid)}
                        className="text-xs"
                      >
                        <LinkIcon className="w-3 h-3 mr-1" />
                        {sid.slice(0, 15)}...
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Task Board */}
            <TaskBoard 
              project={selectedProject} 
              onLinkSession={handleLinkSession}
            />
          </div>
        ) : (
          // Project List View
          <Tabs defaultValue="projects" className="space-y-4">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="projects">
                <FolderKanban className="w-4 h-4 mr-1" /> Projects
              </TabsTrigger>
              <TabsTrigger value="overview">
                <Zap className="w-4 h-4 mr-1" /> Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              <ProjectManager onSelectProject={setSelectedProject} />
            </TabsContent>

            <TabsContent value="overview">
              <Card className="bg-slate-900 border-slate-700">
                <CardContent className="p-6 text-center">
                  <FolderKanban className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2">Project Management Hub</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Create projects, track tasks with Kanban boards, and link collaborative CLI sessions 
                    for multi-agent code review and development.
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-cyan-400 font-bold">Projects</div>
                      <div className="text-slate-400">Organize work</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-purple-400 font-bold">Tasks</div>
                      <div className="text-slate-400">Track progress</div>
                    </div>
                    <div className="bg-slate-800 p-3 rounded">
                      <div className="text-green-400 font-bold">Sessions</div>
                      <div className="text-slate-400">Collaborate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}