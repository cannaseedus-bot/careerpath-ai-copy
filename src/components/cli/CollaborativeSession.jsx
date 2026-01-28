import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Send, Code, MessageSquare, Zap, Shield, Bug, Gauge, Eye, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

const AGENT_ROLES = [
  { value: "reviewer", label: "Code Reviewer", icon: Eye, color: "text-blue-400" },
  { value: "security", label: "Security Analyst", icon: Shield, color: "text-red-400" },
  { value: "debugger", label: "Debugger", icon: Bug, color: "text-orange-400" },
  { value: "optimizer", label: "Performance Optimizer", icon: Gauge, color: "text-green-400" },
  { value: "architect", label: "Architect", icon: Code, color: "text-purple-400" },
  { value: "observer", label: "Observer", icon: Eye, color: "text-slate-400" }
];

export default function CollaborativeSession({ 
  sessionId, 
  onClose,
  initialRole = "reviewer",
  agentName = null
}) {
  const [connected, setConnected] = useState(false);
  const [agents, setAgents] = useState([]);
  const [containers, setContainers] = useState([]);
  const [codeBuffer, setCodeBuffer] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [myAgent, setMyAgent] = useState({ id: null, role: initialRole });
  const [cursors, setCursors] = useState({});
  
  const wsRef = useRef(null);
  const codeEditorRef = useRef(null);

  const connectToSession = useCallback(() => {
    const agentId = agentName || `agent_${Date.now()}`;
    const wsUrl = `wss://${window.location.host}/api/cliCollaboration?session=${sessionId}&agent=${agentId}&role=${initialRole}`;
    
    // For development, use the function URL pattern
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setConnected(true);
      toast.success("Connected to collaborative session");
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWSMessage(message);
    };
    
    ws.onclose = () => {
      setConnected(false);
      toast.info("Disconnected from session");
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast.error("Connection error");
    };
    
    wsRef.current = ws;
  }, [sessionId, agentName, initialRole]);

  const handleWSMessage = (message) => {
    switch (message.type) {
      case "session_state":
        setAgents(message.session.agents || []);
        setContainers(message.session.containers || []);
        setCodeBuffer(message.session.codeBuffer || "");
        setMyAgent(message.yourAgent);
        break;
      
      case "agent_joined":
        setAgents(prev => [...prev, message.agent]);
        toast.info(`${message.agent.role} agent joined`);
        break;
      
      case "agent_left":
        setAgents(prev => prev.filter(a => a.id !== message.agentId));
        break;
      
      case "code_update":
        if (message.agentId !== myAgent.id) {
          setCodeBuffer(message.code);
        }
        if (message.cursor) {
          setCursors(prev => ({ ...prev, [message.agentId]: message.cursor }));
        }
        break;
      
      case "container_created":
        setContainers(prev => [...prev, message.container]);
        break;
      
      case "suggestion":
        setSuggestions(prev => [...prev, message.suggestion]);
        break;
      
      case "evaluation_result":
        setEvaluation(message.evaluation);
        toast.success("Code evaluation complete");
        break;
      
      case "chat":
        setChatMessages(prev => [...prev, {
          agentId: message.agentId,
          role: message.agentRole,
          text: message.message,
          timestamp: message.timestamp
        }]);
        break;
      
      case "cursor_move":
        setCursors(prev => ({ ...prev, [message.agentId]: message.position }));
        break;
      
      case "role_changed":
        setAgents(prev => prev.map(a => 
          a.id === message.agentId ? { ...a, role: message.newRole } : a
        ));
        break;
      
      case "code_submission":
        setEvaluation(message.evaluation);
        break;
    }
  };

  const sendMessage = (type, data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...data }));
    }
  };

  const handleCodeChange = (newCode) => {
    setCodeBuffer(newCode);
    sendMessage("code_update", { code: newCode });
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    sendMessage("chat", { text: chatInput });
    setChatInput("");
  };

  const requestEvaluation = () => {
    sendMessage("evaluate_request", { code: codeBuffer, language: "python" });
    toast.info("Requesting code evaluation...");
  };

  const submitSuggestion = (content, type = "improvement") => {
    sendMessage("suggestion", { content, suggestionType: type });
  };

  const createContainer = (title, content, contentType = "text") => {
    sendMessage("container_create", { title, content, contentType });
  };

  const changeRole = (newRole) => {
    sendMessage("role_change", { newRole });
    setMyAgent(prev => ({ ...prev, role: newRole }));
  };

  useEffect(() => {
    connectToSession();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connectToSession]);

  const getRoleIcon = (role) => {
    const roleConfig = AGENT_ROLES.find(r => r.value === role);
    return roleConfig ? roleConfig.icon : Eye;
  };

  const getRoleColor = (role) => {
    const roleConfig = AGENT_ROLES.find(r => r.value === role);
    return roleConfig ? roleConfig.color : "text-slate-400";
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-cyan-400" />
          <span className="font-bold text-cyan-400">Collaborative Session</span>
          <Badge className={connected ? "bg-green-600" : "bg-red-600"}>
            {connected ? "Connected" : "Disconnected"}
          </Badge>
          <Badge className="bg-slate-700">{sessionId?.slice(0, 15)}...</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={myAgent.role} onValueChange={changeRole}>
            <SelectTrigger className="w-40 bg-slate-700 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AGENT_ROLES.map(role => (
                <SelectItem key={role.value} value={role.value}>
                  <span className={role.color}>{role.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Code Editor */}
        <div className="flex-1 flex flex-col border-r border-slate-700">
          <div className="p-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
            <span className="text-sm text-slate-400">Shared Code Buffer</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={requestEvaluation} className="bg-purple-600 hover:bg-purple-700">
                <Zap className="w-3 h-3 mr-1" /> Evaluate
              </Button>
              <Button size="sm" onClick={() => createContainer("Code Snapshot", codeBuffer, "code")} className="bg-blue-600 hover:bg-blue-700">
                <Code className="w-3 h-3 mr-1" /> Save Container
              </Button>
            </div>
          </div>
          <Textarea
            ref={codeEditorRef}
            value={codeBuffer}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="flex-1 bg-slate-950 border-0 font-mono text-sm text-green-400 resize-none focus:ring-0"
            placeholder="# Collaborative code editing...&#10;# All connected agents can see and edit this code"
          />
          
          {/* Evaluation Results */}
          {evaluation && (
            <div className="p-3 bg-slate-800 border-t border-slate-700 max-h-48 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-cyan-400">Evaluation Results</span>
                <Badge className={evaluation.quality_score >= 7 ? "bg-green-600" : evaluation.quality_score >= 4 ? "bg-yellow-600" : "bg-red-600"}>
                  Score: {evaluation.quality_score}/10
                </Badge>
              </div>
              <p className="text-sm text-slate-300 mb-2">{evaluation.summary}</p>
              
              {evaluation.role_perspectives?.map((rp, i) => (
                <div key={i} className="text-xs bg-slate-900 p-2 rounded mb-1">
                  <span className={getRoleColor(rp.role)}>{rp.role}:</span>
                  <span className="text-slate-400 ml-2">{rp.feedback}</span>
                </div>
              ))}
              
              {evaluation.security_concerns?.length > 0 && (
                <div className="text-xs text-red-400 mt-2">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Security: {evaluation.security_concerns.join(", ")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Agents & Chat */}
        <div className="w-80 flex flex-col">
          {/* Connected Agents */}
          <div className="p-3 border-b border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold">Connected Agents ({agents.length})</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {agents.map(agent => {
                const RoleIcon = getRoleIcon(agent.role);
                return (
                  <div key={agent.id} className="flex items-center gap-2 text-xs bg-slate-800 p-2 rounded">
                    <RoleIcon className={`w-3 h-3 ${getRoleColor(agent.role)}`} />
                    <span className={getRoleColor(agent.role)}>{agent.role}</span>
                    <span className="text-slate-500">{agent.id.slice(0, 8)}...</span>
                    {agent.id === myAgent.id && <Badge className="bg-cyan-600 text-xs">You</Badge>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggestions */}
          <div className="p-3 border-b border-slate-700 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-bold">Suggestions ({suggestions.length})</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {suggestions.slice(-5).map((s, i) => {
                const RoleIcon = getRoleIcon(s.agentRole);
                return (
                  <div key={i} className="text-xs bg-slate-800 p-2 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <RoleIcon className={`w-3 h-3 ${getRoleColor(s.agentRole)}`} />
                      <span className={getRoleColor(s.agentRole)}>{s.agentRole}</span>
                    </div>
                    <p className="text-slate-300">{s.content}</p>
                  </div>
                );
              })}
              {suggestions.length === 0 && (
                <p className="text-xs text-slate-500">No suggestions yet</p>
              )}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-2 border-b border-slate-700 bg-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-400" />
                <span className="text-sm font-bold">Agent Chat</span>
              </div>
            </div>
            <div className="flex-1 p-2 overflow-y-auto space-y-2 max-h-48">
              {chatMessages.slice(-20).map((msg, i) => {
                const RoleIcon = getRoleIcon(msg.role);
                return (
                  <div key={i} className="text-xs">
                    <div className="flex items-center gap-1">
                      <RoleIcon className={`w-3 h-3 ${getRoleColor(msg.role)}`} />
                      <span className={getRoleColor(msg.role)}>{msg.role}</span>
                      <span className="text-slate-600">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 ml-4">{msg.text}</p>
                  </div>
                );
              })}
            </div>
            <div className="p-2 border-t border-slate-700 flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message agents..."
                className="bg-slate-800 border-slate-600 text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
              />
              <Button size="sm" onClick={handleChatSend} className="bg-green-600">
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sandbox Containers */}
      {containers.length > 0 && (
        <div className="border-t border-slate-700 p-3 bg-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold">Sandbox Containers ({containers.length})</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {containers.slice(-4).map(container => (
              <Card key={container.id} className="bg-slate-900 border-yellow-600 min-w-64 max-w-72">
                <CardHeader className="py-2 px-3">
                  <CardTitle className="text-xs text-yellow-400">{container.title}</CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <pre className="text-xs text-green-400 max-h-20 overflow-auto whitespace-pre-wrap">
                    {container.content.slice(0, 200)}{container.content.length > 200 && "..."}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}