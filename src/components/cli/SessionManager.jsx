import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Link, Copy, Zap } from "lucide-react";
import { toast } from "sonner";
import { cliCollaboration } from "@/functions/cliCollaboration";
import CollaborativeSession from "./CollaborativeSession";

const AGENT_ROLES = [
  { value: "reviewer", label: "Code Reviewer" },
  { value: "security", label: "Security Analyst" },
  { value: "debugger", label: "Debugger" },
  { value: "optimizer", label: "Performance Optimizer" },
  { value: "architect", label: "Architect" },
  { value: "observer", label: "Observer" }
];

export default function SessionManager() {
  const [activeSession, setActiveSession] = useState(null);
  const [joinSessionId, setJoinSessionId] = useState("");
  const [selectedRole, setSelectedRole] = useState("reviewer");
  const [agentName, setAgentName] = useState("");
  const [loading, setLoading] = useState(false);

  const createSession = async () => {
    setLoading(true);
    try {
      const response = await cliCollaboration({
        action: "create_session",
        data: {
          config: {
            maxAgents: 10,
            allowCodeExecution: false
          }
        }
      });
      
      if (response.data?.sessionId) {
        setActiveSession(response.data.sessionId);
        toast.success("Session created!");
      }
    } catch (e) {
      toast.error("Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const joinSession = () => {
    if (!joinSessionId.trim()) {
      toast.error("Enter a session ID");
      return;
    }
    setActiveSession(joinSessionId.trim());
  };

  const copySessionLink = () => {
    if (activeSession) {
      navigator.clipboard.writeText(activeSession);
      toast.success("Session ID copied!");
    }
  };

  if (activeSession) {
    return (
      <div className="h-full">
        <CollaborativeSession
          sessionId={activeSession}
          initialRole={selectedRole}
          agentName={agentName || undefined}
          onClose={() => setActiveSession(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="bg-slate-800 border-cyan-600">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            CLI Collaboration Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create Session */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-400" />
              Create New Session
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Your agent name (optional)"
                className="bg-slate-900 border-slate-600 text-white"
              />
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AGENT_ROLES.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={createSession} 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              {loading ? "Creating..." : "Create Collaborative Session"}
            </Button>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-3">
              <Link className="w-4 h-4 text-blue-400" />
              Join Existing Session
            </h3>
            <div className="flex gap-2">
              <Input
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
                placeholder="Enter session ID"
                className="bg-slate-900 border-slate-600 text-white"
              />
              <Button onClick={joinSession} className="bg-blue-600 hover:bg-blue-700">
                Join
              </Button>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg text-sm text-slate-400">
            <p className="font-semibold text-white mb-2">How it works:</p>
            <ul className="space-y-1">
              <li>• Create a session and share the ID with other agents</li>
              <li>• Each agent selects a role (reviewer, security, debugger, etc.)</li>
              <li>• Collaborate on code in real-time via shared buffer</li>
              <li>• Request AI evaluation for multi-perspective feedback</li>
              <li>• Chat and share suggestions between agents</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}