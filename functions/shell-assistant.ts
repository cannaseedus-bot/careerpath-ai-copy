import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prompt, context, action, history, projectFiles } = await req.json();

        let systemPrompt = '';
        let userPrompt = '';
        
        // Build context from history
        const contextSummary = history && history.length > 0 
            ? `\n\nRecent session context:\n${history.slice(-5).map(h => `${h.type === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')}`
            : '';
        
        // Build project context
        const projectContext = projectFiles && projectFiles.length > 0
            ? `\n\nProject files:\n${projectFiles.map(f => `- ${f.name}: ${f.type || 'file'}`).join('\n')}`
            : '';

        if (action === 'command') {
            systemPrompt = `You are an AI shell assistant for MX2LM - a MICRONAUT (agent, brain, tool) for LLM runtime for coding applications.
Your job is to convert natural language requests into shell commands.

Focus on:
- Ollama model management (ollama pull, ollama run, ollama list, ollama rm, etc.)
- File operations (ls, cd, cat, mkdir, rm, cp, mv)
- Git operations (git clone, git pull, git commit, git push)
- Package management (npm, pip, cargo)
- Process management (ps, kill, top)
- General Unix/Linux commands

Return ONLY the shell command without explanations. If the request is ambiguous, return the most likely command.
For Ollama cloud models, remind users to set OLLAMA_API_KEY.

Examples:
User: "pull the gpt-oss 120b cloud model"
Response: ollama pull gpt-oss:120b-cloud

User: "list all my models"
Response: ollama list

User: "show me the files here"
Response: ls -la`;

            userPrompt = prompt + contextSummary;
        } else if (action === 'code') {
            systemPrompt = `You are an AI coding assistant for MX2LM - a MICRONAUT (agent, brain, tool) for LLM runtime.
You help with code generation, explanation, and debugging.

Consider the project context when generating code to ensure it fits the existing architecture.
Return well-formatted code with comments and relevant imports.
For explanations, be clear and concise.
For debugging, identify the issue and suggest fixes with examples.${projectContext}`;

            userPrompt = prompt + contextSummary;
        } else if (action === 'explain') {
            systemPrompt = `You are an AI assistant that explains technical concepts clearly and concisely.
Focus on practical understanding for developers working with LLMs and CLI tools.`;

            userPrompt = prompt + contextSummary;
        } else if (action === 'suggest') {
            systemPrompt = `You are an AI assistant that suggests relevant commands and operations based on user context.
Analyze recent commands and suggest 3-5 logical next steps or helpful commands.
Format: Return a JSON array of suggestions, each with "command" and "description" fields.${contextSummary}${projectContext}`;

            userPrompt = "Based on the recent activity, suggest helpful next commands or operations.";
            
            const suggestionResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `${systemPrompt}\n\n${userPrompt}`,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        suggestions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    command: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            
            return Response.json({ 
                result: suggestionResponse.suggestions || [],
                action: 'suggest'
            });
        } else if (action === 'scaffold') {
            const scaffoldData = JSON.parse(prompt);
            
            systemPrompt = `You are a project scaffolding assistant. Generate a comprehensive project setup plan based on user requirements.

Consider the project type and generate appropriate structure:
- Web App: React/Vue components, routing, state management
- Mobile App: React Native screens, navigation, native modules
- Desktop App: Electron main/renderer processes, IPC, native integrations
- API/Microservice: Route handlers, middleware, controllers

Include state management setup (Zustand, Redux Toolkit, etc.) if specified.
Include styling configuration (Tailwind, Styled Components, CSS Modules) if specified.
Include testing framework setup (Vitest, Jest, Playwright) with sample tests if specified.

Return a JSON structure with:
- files: array of files to create with their content (include config files for state management, styling, testing)
- env_variables: array of required environment variables
- dependencies: array of packages to install (including state management, styling, testing libraries)
- setup_steps: array of setup instructions
- database_schema: if database is needed, provide schema
- routes: API/WebSocket routes if needed`;

            const scaffoldResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `${systemPrompt}\n\nProject requirements:\n${JSON.stringify(scaffoldData, null, 2)}`,
                add_context_from_internet: false,
                response_json_schema: {
                    type: "object",
                    properties: {
                        files: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    path: { type: "string" },
                                    content: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        },
                        env_variables: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    description: { type: "string" },
                                    example: { type: "string" }
                                }
                            }
                        },
                        dependencies: { type: "array", items: { type: "string" } },
                        setup_steps: { type: "array", items: { type: "string" } },
                        database_schema: { type: "string" },
                        routes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    path: { type: "string" },
                                    method: { type: "string" },
                                    description: { type: "string" }
                                }
                            }
                        }
                    }
                }
            });
            
            return Response.json({
                result: scaffoldResponse,
                action: 'scaffold'
            });
        }

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `${systemPrompt}\n\nUser request: ${userPrompt}${context ? `\n\nAdditional context: ${context}` : ''}`,
            add_context_from_internet: false
        });

        return Response.json({ 
            result: response,
            action 
        });

    } catch (error) {
        console.error('Shell assistant error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});