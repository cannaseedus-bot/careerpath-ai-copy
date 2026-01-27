import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prompt, context, action } = await req.json();

        let systemPrompt = '';
        let userPrompt = '';

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

            userPrompt = prompt;
        } else if (action === 'code') {
            systemPrompt = `You are an AI coding assistant for MX2LM - a MICRONAUT (agent, brain, tool) for LLM runtime.
You help with code generation, explanation, and debugging.

Return well-formatted code with comments when generating.
For explanations, be clear and concise.
For debugging, identify the issue and suggest fixes.`;

            userPrompt = prompt;
        } else if (action === 'explain') {
            systemPrompt = `You are an AI assistant that explains technical concepts clearly and concisely.
Focus on practical understanding for developers working with LLMs and CLI tools.`;

            userPrompt = prompt;
        }

        const response = await base44.integrations.Core.InvokeLLM({
            prompt: `${systemPrompt}\n\nUser request: ${userPrompt}${context ? `\n\nContext: ${context}` : ''}`,
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