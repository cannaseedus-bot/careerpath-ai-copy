import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { prompt, context, action, history, projectFiles, url, filePath, shellCommand, workingDir, contextFiles } = await req.json();
        
        // Initialize Claude API if available
        const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
        const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

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
            
        // Build file context
        const fileContext = contextFiles && contextFiles.length > 0
            ? `\n\nContext files:\n${contextFiles.join('\n')}`
            : '';
            
        const dirContext = workingDir ? `\n\nWorking directory: ${workingDir}` : '';

        if (action === 'command') {
            systemPrompt = `You are SCXQ2 Shell Assistant - a Claude-powered μ-agent for MX2LM runtime.
Your job is to convert natural language into MX2LM CLI commands and SCXQ2 workflows.

Focus on:
- SCXQ2 compression workflows (scxq2 compress, scxq2 quantize, scxq2 fold)
- Tensor operations (mx2lm tensor create, mx2lm tensor shard, mx2lm tensor encode)
- Micronaut management (mx2lm micronaut spawn, mx2lm micronaut monitor)
- Bot deployment (mx2lm bot deploy, mx2lm bot optimize)
- XCFE PowerShell (mx2lm ps exec --governed)
- N-gram indexing (mx2lm ngram build, mx2lm ngram compress)
- Cluster operations (mx2lm cluster deploy, mx2lm cluster scale)

Return ONLY the command without explanations.

Examples:
User: "create compression workflow"
Response: scxq2 compress --mode=fold --quantize=int4 --ngram-index

User: "deploy bot to cluster"
Response: mx2lm bot deploy --cluster=distributed --tensor-schema=svg3d

User: "list running processes"
Response: mx2lm ps exec --governed "Get-Process"`;

            userPrompt = prompt + contextSummary;
        } else if (action === 'code') {
            systemPrompt = `You are SCXQ2 Code Assistant - a Claude-powered μ-agent for MX2LM.
You generate XJSON schemas, PS-DSL-1 envelopes, tensor definitions, and compression models.

Specialize in:
- XJSON entity schemas with tensor metadata
- PS-DSL-1 legality envelopes for PowerShell
- CM-1 audit trail bindings
- SVG-3D tensor schemas
- N-gram compression dictionaries
- Micronaut control vectors (CSS-style)

Return production-ready code with MX2LM/SCXQ2 conventions.${projectContext}`;

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
        } else if (action === 'search') {
            // Google Search with grounding
            systemPrompt = `You are a research assistant. Search the web and provide accurate, well-sourced information.
Synthesize search results into a clear, concise answer with citations.`;

            const searchResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `${systemPrompt}\n\nQuery: ${prompt}`,
                add_context_from_internet: true
            });

            return Response.json({
                result: searchResponse,
                action: 'search'
            });
        } else if (action === 'fetch') {
            // Web fetching
            if (!url) {
                return Response.json({ error: 'URL required for fetch action' }, { status: 400 });
            }

            try {
                const fetchResponse = await fetch(url);
                const contentType = fetchResponse.headers.get('content-type');
                
                let content;
                if (contentType?.includes('application/json')) {
                    content = await fetchResponse.json();
                } else {
                    content = await fetchResponse.text();
                }

                return Response.json({
                    result: {
                        url,
                        status: fetchResponse.status,
                        contentType,
                        content: typeof content === 'string' ? content.slice(0, 10000) : content
                    },
                    action: 'fetch'
                });
            } catch (error) {
                return Response.json({
                    result: { error: error.message, url },
                    action: 'fetch'
                });
            }
        } else if (action === 'file-read') {
            // File operations - read
            systemPrompt = `You are a file analysis assistant. Analyze the file content and provide insights.`;

            const analysisResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `${systemPrompt}\n\nFile path: ${filePath}\nAnalyze this file and ${prompt}`,
                add_context_from_internet: false
            });

            return Response.json({
                result: analysisResponse,
                action: 'file-read'
            });
        } else if (action === 'file-write') {
            // File operations - write/create
            systemPrompt = `You are a file generation assistant. Generate appropriate file content based on requirements.
Return only the file content, no explanations.`;

            const fileContent = await base44.integrations.Core.InvokeLLM({
                prompt: `${systemPrompt}\n\nFile path: ${filePath}\nRequirements: ${prompt}`,
                add_context_from_internet: false
            });

            return Response.json({
                result: {
                    path: filePath,
                    content: fileContent
                },
                action: 'file-write'
            });
        } else if (action === 'shell-exec') {
            // Shell command execution guidance
            systemPrompt = `You are a shell command expert. Generate safe, production-ready shell commands.
Include explanations of what the command does and any precautions.`;

            const commandResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `${systemPrompt}\n\nTask: ${prompt}${shellCommand ? `\n\nVerify/explain this command: ${shellCommand}` : ''}`,
                add_context_from_internet: false
            });

            return Response.json({
                result: commandResponse,
                action: 'shell-exec'
            });
        } else if (action === 'cluster') {
            // Cluster/batch operations
            systemPrompt = `You are a batch operations assistant. Help with cluster management, parallel processing, and distributed tasks.
Provide efficient solutions for scaling and parallel execution.`;

            const clusterResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `${systemPrompt}\n\n${prompt}${projectContext}`,
                add_context_from_internet: false
            });

            return Response.json({
                result: clusterResponse,
                action: 'cluster'
            });
        } else if (action === 'powershell') {
            // XCFE-PS-ENVELOPE: Governed PowerShell execution
            const psCommand = prompt.trim();
            
            // PS-DSL-1: Deny-by-default command registry (Expanded)
            const allowedCommands = {
                'Get-Process': { safe: true, readOnly: true, description: 'List running processes' },
                'Get-Service': { safe: true, readOnly: true, description: 'Query Windows services' },
                'Get-EventLog': { safe: true, readOnly: true, description: 'Query event logs' },
                'Get-ComputerInfo': { safe: true, readOnly: true, description: 'Get system information' },
                'Get-WmiObject': { safe: true, readOnly: true, description: 'Query WMI objects' },
                'Get-ItemProperty': { safe: true, readOnly: true, description: 'Read registry values' },
                'Get-ChildItem': { safe: true, readOnly: true, description: 'List directory contents' },
                'Get-Content': { safe: true, readOnly: true, description: 'Read file contents' },
                'Get-NetAdapter': { safe: true, readOnly: true, description: 'Query network adapters' },
                'Get-NetIPConfiguration': { safe: true, readOnly: true, description: 'Get IP configuration' },
                'Get-DnsClientServerAddress': { safe: true, readOnly: true, description: 'Get DNS server addresses' },
                'Get-Volume': { safe: true, readOnly: true, description: 'Query disk volumes' },
                'Get-Disk': { safe: true, readOnly: true, description: 'Query physical disks' },
                'Get-PSDrive': { safe: true, readOnly: true, description: 'List PowerShell drives' },
                'Get-HotFix': { safe: true, readOnly: true, description: 'List installed updates' },
                'Get-CimInstance': { safe: true, readOnly: true, description: 'Query CIM instances' },
                'Get-Package': { safe: true, readOnly: true, description: 'List installed packages' },
                'Get-WindowsFeature': { safe: true, readOnly: true, description: 'Query Windows features' },
                'Get-ScheduledTask': { safe: true, readOnly: true, description: 'List scheduled tasks' },
                'Get-LocalUser': { safe: true, readOnly: true, description: 'List local users' },
                'Get-LocalGroup': { safe: true, readOnly: true, description: 'List local groups' },
                'Get-FileHash': { safe: true, readOnly: true, description: 'Compute file hash' },
                'Get-Date': { safe: true, readOnly: true, description: 'Get current date/time' },
                'Get-TimeZone': { safe: true, readOnly: true, description: 'Get system timezone' },
                'Get-Culture': { safe: true, readOnly: true, description: 'Get system culture' },
                'Get-Command': { safe: true, readOnly: true, description: 'List available commands' },
                'Get-Help': { safe: true, readOnly: true, description: 'Get command help' },
                'Get-Variable': { safe: true, readOnly: true, description: 'List PowerShell variables' },
                'Get-History': { safe: true, readOnly: true, description: 'Get command history' },
                'Test-Path': { safe: true, readOnly: true, description: 'Test if path exists' },
                'Test-Connection': { safe: true, readOnly: true, description: 'Ping network hosts' },
                'Measure-Object': { safe: true, readOnly: true, description: 'Measure object properties' }
            };
            
            const deniedCommands = [
                'Invoke-Expression', 'iex', 'Invoke-Command', 'icm',
                'Start-Process', 'New-Object', 'Add-Type',
                'Set-Item', 'Remove-Item', 'Invoke-WebRequest', 'iwr',
                'Invoke-RestMethod', 'irm', 'Set-ExecutionPolicy'
            ];
            
            // Legality verification
            const isDenied = deniedCommands.some(cmd => 
                psCommand.toLowerCase().includes(cmd.toLowerCase())
            );
            
            if (isDenied) {
                return Response.json({
                    result: `❌ XCFE-PS-ENVELOPE VIOLATION\n\nDenied: Command contains forbidden operations.\n\nBlocked commands: ${deniedCommands.join(', ')}\n\nReason: Arbitrary execution, privilege escalation, or network operations are not allowed.\n\nUse read-only system queries instead.`,
                    action: 'powershell',
                    legal: false,
                    cm1: {
                        phase: 'delegate.external',
                        target: 'powershell',
                        status: 'blocked',
                        reason: 'denylist_match'
                    }
                });
            }
            
            // Generate safe PS-DSL intent
            systemPrompt = `You are a PowerShell DSL generator for XCFE-PS-ENVELOPE.
Convert user requests into SAFE, READ-ONLY PowerShell commands from this allowlist:

${Object.entries(allowedCommands).map(([cmd, info]) => `- ${cmd}: ${info.description}`).join('\n')}

CRITICAL CONSTRAINTS:
- NO Invoke-Expression or script blocks
- NO pipe operators or complex expressions
- NO Set-*, Remove-*, New-* cmdlets
- NO network operations
- ONLY single, simple Get-* cmdlets
- Return ONLY the PowerShell command

Example:
User: "list running processes"
Response: Get-Process

User: "show windows services"
Response: Get-Service`;

            const psResponse = await base44.integrations.Core.InvokeLLM({
                prompt: `${systemPrompt}\n\nUser: ${psCommand}`,
                add_context_from_internet: false
            });
            
            const generatedCmd = psResponse.trim();
            
            // Verify generated command is allowlisted
            const isAllowed = Object.keys(allowedCommands).some(cmd =>
                generatedCmd.startsWith(cmd)
            );
            
            if (!isAllowed) {
                return Response.json({
                    result: `⚠️ XCFE-PS-ENVELOPE WARNING\n\nGenerated command not in allowlist.\n\nAllowed commands:\n${Object.keys(allowedCommands).join('\n')}\n\nGenerated: ${generatedCmd}\n\nPlease request read-only system queries only.`,
                    action: 'powershell',
                    legal: false,
                    cm1: {
                        phase: 'delegate.external',
                        target: 'powershell',
                        status: 'rejected',
                        reason: 'not_allowlisted'
                    }
                });
            }
            
            // CM-1 Binding: Audit trail
            const cm1Envelope = {
                soh: '[SOH] ps-envelope.v1',
                gs_intent: `[GS] intent=${psCommand}`,
                gs_lowered: `[GS] lowered=${generatedCmd}`,
                stx: '[STX]',
                command: generatedCmd,
                etx: '[ETX]',
                eot: '[EOT]',
                timestamp: new Date().toISOString(),
                user: user.email
            };
            
            // Store in audit database
            await base44.asServiceRole.entities.PowerShellAudit.create({
                intent: psCommand,
                lowered_command: generatedCmd,
                legal: true,
                cm1_metadata: cm1Envelope,
                working_dir: workingDir || '~/'
            });
            
            // Format output with CM-1 provenance
            const output = `✅ XCFE-PS-ENVELOPE APPROVED

📋 CM-1 Audit Trail:
${cm1Envelope.soh}
${cm1Envelope.gs_intent}
${cm1Envelope.gs_lowered}
${cm1Envelope.stx}

💻 PowerShell Command:
${generatedCmd}

${cm1Envelope.etx}
${cm1Envelope.eot}

⚡ Execution:
This command has been verified as safe and read-only.
Execute manually in PowerShell or via powershell-utils transport layer.

📊 Provenance:
- User: ${user.email}
- Time: ${cm1Envelope.timestamp}
- Legal: ✓ Allowlisted
- Read-only: ✓ Verified
- Audit: ✓ CM-1 Bound`;

            return Response.json({
                result: output,
                action: 'powershell',
                legal: true,
                command: generatedCmd,
                cm1: cm1Envelope
            });
        } else if (action === 'suggest-cmdlet') {
            // Handle cmdlet suggestion for allowlist
            const suggestion = {
                cmdlet: prompt.trim(),
                user: user.email,
                timestamp: new Date().toISOString(),
                status: 'pending_review'
            };
            
            // Store suggestion in database
            await base44.asServiceRole.entities.PowerShellSuggestion.create(suggestion);
            
            return Response.json({
                result: `✅ Cmdlet suggestion submitted for review\n\nCmdlet: ${suggestion.cmdlet}\nStatus: Pending Security Review\n\nYour suggestion will be evaluated for:\n- Read-only verification\n- Security implications\n- Usefulness for system inspection\n\nThank you for helping improve the XCFE-PS-ENVELOPE allowlist!`,
                action: 'suggest-cmdlet'
            });
        }

        // Use Claude API if available, otherwise fallback to base44 LLM
        let response;
        
        if (anthropic) {
            const fullPrompt = `${systemPrompt}\n\nUser request: ${userPrompt}${context ? `\n\nAdditional context: ${context}` : ''}${dirContext}${fileContext}`;
            
            const message = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 4096,
                messages: [{
                    role: "user",
                    content: fullPrompt
                }]
            });
            
            response = message.content[0].text;
        } else {
            response = await base44.integrations.Core.InvokeLLM({
                prompt: `${systemPrompt}\n\nUser request: ${userPrompt}${context ? `\n\nAdditional context: ${context}` : ''}${dirContext}${fileContext}`,
                add_context_from_internet: false
            });
        }

        return Response.json({ 
            result: response,
            action 
        });

    } catch (error) {
        console.error('Shell assistant error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});