import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// In-memory session store (in production, use Redis or similar)
const sessions = new Map();
const connections = new Map();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    
    // Handle WebSocket upgrade
    if (req.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(req);
      const sessionId = url.searchParams.get("session");
      const agentId = url.searchParams.get("agent") || `agent_${Date.now()}`;
      const agentRole = url.searchParams.get("role") || "observer";
      
      socket.onopen = () => {
        console.log(`Agent ${agentId} connected to session ${sessionId}`);
        
        // Initialize session if needed
        if (!sessions.has(sessionId)) {
          sessions.set(sessionId, {
            id: sessionId,
            created: new Date().toISOString(),
            agents: [],
            containers: [],
            codeBuffer: "",
            history: []
          });
        }
        
        const session = sessions.get(sessionId);
        session.agents.push({
          id: agentId,
          role: agentRole,
          connected: new Date().toISOString(),
          status: "active"
        });
        
        // Store connection
        if (!connections.has(sessionId)) {
          connections.set(sessionId, new Map());
        }
        connections.get(sessionId).set(agentId, socket);
        
        // Send session state to new agent
        socket.send(JSON.stringify({
          type: "session_state",
          session: session,
          yourAgent: { id: agentId, role: agentRole }
        }));
        
        // Broadcast agent joined
        broadcastToSession(sessionId, {
          type: "agent_joined",
          agent: { id: agentId, role: agentRole },
          timestamp: new Date().toISOString()
        }, agentId);
      };
      
      socket.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          await handleMessage(sessionId, agentId, message, base44);
        } catch (e) {
          console.error("Message handling error:", e);
          socket.send(JSON.stringify({ type: "error", message: e.message }));
        }
      };
      
      socket.onclose = () => {
        console.log(`Agent ${agentId} disconnected from session ${sessionId}`);
        
        // Remove from session
        const session = sessions.get(sessionId);
        if (session) {
          session.agents = session.agents.filter(a => a.id !== agentId);
          if (session.agents.length === 0) {
            sessions.delete(sessionId);
            connections.delete(sessionId);
          }
        }
        
        // Remove connection
        const sessionConns = connections.get(sessionId);
        if (sessionConns) {
          sessionConns.delete(agentId);
        }
        
        // Broadcast agent left
        broadcastToSession(sessionId, {
          type: "agent_left",
          agentId: agentId,
          timestamp: new Date().toISOString()
        });
      };
      
      return response;
    }
    
    // REST API endpoints
    const { action, sessionId, agentId, data } = await req.json();
    
    switch (action) {
      case "create_session":
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessions.set(newSessionId, {
          id: newSessionId,
          created: new Date().toISOString(),
          agents: [],
          containers: [],
          codeBuffer: "",
          history: [],
          config: data?.config || {}
        });
        return Response.json({ sessionId: newSessionId, status: "created" });
      
      case "get_session":
        const session = sessions.get(sessionId);
        if (!session) {
          return Response.json({ error: "Session not found" }, { status: 404 });
        }
        return Response.json({ session });
      
      case "list_sessions":
        const sessionList = Array.from(sessions.entries()).map(([id, s]) => ({
          id,
          agentCount: s.agents.length,
          created: s.created
        }));
        return Response.json({ sessions: sessionList });
      
      case "submit_code":
        return await handleCodeSubmission(sessionId, agentId, data, base44);
      
      case "evaluate_code":
        return await evaluateCodeWithAgents(sessionId, data.code, data.language, base44);
      
      default:
        return Response.json({ error: "Unknown action" }, { status: 400 });
    }
    
  } catch (error) {
    console.error("CLI Collaboration error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function broadcastToSession(sessionId, message, excludeAgentId = null) {
  const sessionConns = connections.get(sessionId);
  if (!sessionConns) return;
  
  const messageStr = JSON.stringify(message);
  for (const [agentId, socket] of sessionConns) {
    if (agentId !== excludeAgentId && socket.readyState === WebSocket.OPEN) {
      socket.send(messageStr);
    }
  }
}

async function handleMessage(sessionId, agentId, message, base44) {
  const session = sessions.get(sessionId);
  if (!session) return;
  
  switch (message.type) {
    case "code_update":
      session.codeBuffer = message.code;
      session.history.push({
        type: "code_update",
        agentId,
        code: message.code,
        timestamp: new Date().toISOString()
      });
      broadcastToSession(sessionId, {
        type: "code_update",
        agentId,
        code: message.code,
        cursor: message.cursor,
        timestamp: new Date().toISOString()
      }, agentId);
      break;
    
    case "container_create":
      const container = {
        id: `container_${Date.now()}`,
        title: message.title,
        content: message.content,
        agentId,
        type: message.contentType || "text",
        created: new Date().toISOString()
      };
      session.containers.push(container);
      broadcastToSession(sessionId, {
        type: "container_created",
        container,
        timestamp: new Date().toISOString()
      });
      break;
    
    case "suggestion":
      const suggestion = {
        id: `suggestion_${Date.now()}`,
        agentId,
        agentRole: session.agents.find(a => a.id === agentId)?.role,
        content: message.content,
        targetLine: message.targetLine,
        type: message.suggestionType,
        timestamp: new Date().toISOString()
      };
      session.history.push({ type: "suggestion", ...suggestion });
      broadcastToSession(sessionId, {
        type: "suggestion",
        suggestion,
        timestamp: new Date().toISOString()
      });
      break;
    
    case "evaluate_request":
      const evaluation = await evaluateCodeWithLLM(message.code, message.language, session.agents, base44);
      broadcastToSession(sessionId, {
        type: "evaluation_result",
        requestedBy: agentId,
        evaluation,
        timestamp: new Date().toISOString()
      });
      break;
    
    case "chat":
      broadcastToSession(sessionId, {
        type: "chat",
        agentId,
        agentRole: session.agents.find(a => a.id === agentId)?.role,
        message: message.text,
        timestamp: new Date().toISOString()
      });
      break;
    
    case "cursor_move":
      broadcastToSession(sessionId, {
        type: "cursor_move",
        agentId,
        position: message.position,
        timestamp: new Date().toISOString()
      }, agentId);
      break;
    
    case "role_change":
      const agent = session.agents.find(a => a.id === agentId);
      if (agent) {
        agent.role = message.newRole;
        broadcastToSession(sessionId, {
          type: "role_changed",
          agentId,
          newRole: message.newRole,
          timestamp: new Date().toISOString()
        });
      }
      break;
  }
}

async function handleCodeSubmission(sessionId, agentId, data, base44) {
  const session = sessions.get(sessionId);
  if (!session) {
    return Response.json({ error: "Session not found" }, { status: 404 });
  }
  
  const submission = {
    id: `submission_${Date.now()}`,
    agentId,
    code: data.code,
    language: data.language || "python",
    timestamp: new Date().toISOString()
  };
  
  session.history.push({ type: "submission", ...submission });
  
  // Trigger evaluation
  const evaluation = await evaluateCodeWithLLM(data.code, data.language, session.agents, base44);
  
  // Broadcast to all agents
  broadcastToSession(sessionId, {
    type: "code_submission",
    submission,
    evaluation,
    timestamp: new Date().toISOString()
  });
  
  return Response.json({ submission, evaluation });
}

async function evaluateCodeWithLLM(code, language, agents, base44) {
  const agentRoles = agents.map(a => a.role).join(", ");
  
  const prompt = `You are a collaborative code review system with multiple agent perspectives.
Active agent roles: ${agentRoles || "general reviewers"}

Evaluate this ${language || "code"} from each perspective:

\`\`\`${language || ""}
${code}
\`\`\`

Provide analysis as JSON with:
1. Overall quality score (1-10)
2. Suggestions from each role perspective
3. Security concerns if any
4. Performance improvements
5. Best practice recommendations

Be specific and actionable.`;

  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          quality_score: { type: "number" },
          summary: { type: "string" },
          role_perspectives: {
            type: "array",
            items: {
              type: "object",
              properties: {
                role: { type: "string" },
                feedback: { type: "string" },
                suggestions: { type: "array", items: { type: "string" } }
              }
            }
          },
          security_concerns: { type: "array", items: { type: "string" } },
          performance_tips: { type: "array", items: { type: "string" } },
          best_practices: { type: "array", items: { type: "string" } },
          improved_code: { type: "string" }
        }
      }
    });
    
    return response;
  } catch (e) {
    console.error("LLM evaluation error:", e);
    return {
      quality_score: 0,
      summary: "Evaluation failed",
      error: e.message
    };
  }
}

async function evaluateCodeWithAgents(sessionId, code, language, base44) {
  const session = sessions.get(sessionId);
  const agents = session?.agents || [];
  
  const evaluation = await evaluateCodeWithLLM(code, language, agents, base44);
  
  return Response.json({ evaluation });
}