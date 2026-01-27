import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { command, context } = await req.json();

        // LLM analyzes command and spawns appropriate agents/micronauts
        const orchestration = await orchestrateFromLLM(base44, command, context);

        return Response.json(orchestration);
    } catch (error) {
        console.error('LLM agent orchestrator error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function orchestrateFromLLM(base44, command, context) {
    // Phase 1: LLM analyzes command and generates complete architecture with AI-driven specifications
    const architecture = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this command and design a complete agent/micronaut architecture with AI-generated operational data:

Command: ${command}
Context: ${JSON.stringify(context || {}, null, 2)}

Generate:
1. Agents needed (bot-orchestrator, bot-optimization-agent, custom agents)
2. Micronauts for each agent with optimal control vectors
3. AI-generated n-gram operational data:
   - Policies: Rules and actions specific to this task
   - Tools: Required APIs and functions with parameters
   - Build steps: Execution pipeline with dependencies
   - Contacts: External services or endpoints to coordinate with
4. Compression folds and entanglement patterns
5. Adaptive control strategy for real-time optimization
6. Success metrics and feedback mechanisms

Design should be executable, comprehensive, and optimized for the specific command.`,
        response_json_schema: {
            type: "object",
            properties: {
                agents: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            type: { type: "string" },
                            purpose: { type: "string" },
                            function_name: { type: "string" },
                            micronauts: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        type: { type: "string" },
                                        folds: { type: "array", items: { type: "string" } },
                                        control_vectors: {
                                            type: "object",
                                            properties: {
                                                flow: { type: "number" },
                                                intensity: { type: "number" },
                                                entropy: { type: "number" },
                                                stability: { type: "number" }
                                            }
                                        },
                                        operational_data: {
                                            type: "object",
                                            properties: {
                                                policies: { type: "array" },
                                                tools: { type: "array" },
                                                build_steps: { type: "array" },
                                                contacts: { type: "array" }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                coordination_pattern: { type: "string" },
                adaptive_strategy: { type: "string" },
                success_metrics: { type: "array", items: { type: "string" } },
                expected_outcome: { type: "string" }
            }
        }
    });

    // Phase 2: Spawn agents and micronauts with AI-generated specs
    const spawned = await spawnArchitectureWithAI(base44, architecture, command);

    // Phase 3: Execute with adaptive control
    const execution = await executeWithAdaptiveControl(base44, spawned, command, architecture);

    // Phase 4: Collect feedback and optimize
    const optimization = await optimizeBasedOnFeedback(base44, spawned, execution, architecture);

    return {
        success: true,
        architecture,
        spawned,
        execution,
        optimization,
        message: 'LLM orchestration with adaptive control complete'
    };
}

async function spawnArchitecture(base44, architecture) {
    const spawned = {
        agents: [],
        micronauts: []
    };

    // Spawn each agent and its micronauts
    for (const agentSpec of architecture.agents) {
        // Create agent context
        const agentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        spawned.agents.push({
            id: agentId,
            type: agentSpec.type,
            purpose: agentSpec.purpose
        });

        // Spawn micronauts for this agent
        for (const micronautSpec of agentSpec.micronauts) {
            const { data: micronaut } = await base44.functions.invoke('micronaut-controller', {
                action: 'spawn',
                micronaut_name: micronautSpec.name,
                config: {
                    type: micronautSpec.type,
                    folds: micronautSpec.folds,
                    control_vectors: {
                        flow: 0.7,
                        intensity: 0.8,
                        entropy: 0.15,
                        stability: 0.85
                    }
                },
                parent_agent_id: agentId,
                ngram_data: micronautSpec.operational_data
            });

            spawned.micronauts.push(micronaut);
        }
    }

    return spawned;
}

async function spawnArchitectureWithAI(base44, architecture, command) {
    const spawned = {
        agents: [],
        micronauts: []
    };

    for (const agentSpec of architecture.agents) {
        const agentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        spawned.agents.push({
            id: agentId,
            type: agentSpec.type,
            purpose: agentSpec.purpose,
            function_name: agentSpec.function_name
        });

        // Spawn micronauts with AI-generated operational data
        for (const micronautSpec of agentSpec.micronauts) {
            const { data: micronaut } = await base44.functions.invoke('micronaut-controller', {
                action: 'spawn',
                micronaut_name: micronautSpec.name,
                config: {
                    type: micronautSpec.type,
                    folds: micronautSpec.folds,
                    control_vectors: micronautSpec.control_vectors || {
                        flow: 0.7,
                        intensity: 0.8,
                        entropy: 0.15,
                        stability: 0.85
                    }
                },
                parent_agent_id: agentId,
                ngram_data: micronautSpec.operational_data
            });

            spawned.micronauts.push(micronaut);
        }
    }

    return spawned;
}

async function executeWithAdaptiveControl(base44, spawned, command, architecture) {
    const micronautNames = spawned.micronauts
        .filter(m => m.success)
        .map(m => m.micronaut.name);

    if (micronautNames.length === 0) {
        return { success: false, error: 'No micronauts available' };
    }

    // Execute with real-time monitoring
    const startTime = Date.now();
    
    const { data: coordination } = await base44.functions.invoke('micronaut-controller', {
        action: 'coordinate',
        config: {
            micronaut_names: micronautNames,
            task: command,
            parameters: {
                adaptive_mode: true,
                success_metrics: architecture.success_metrics
            }
        }
    });

    const executionTime = Date.now() - startTime;

    return {
        ...coordination,
        execution_time: executionTime,
        adaptive_enabled: true
    };
}

async function optimizeBasedOnFeedback(base44, spawned, execution, architecture) {
    // Gather execution metrics
    const metrics = {
        execution_time: execution.execution_time,
        success_rate: execution.coordinated > 0 ? 1 : 0,
        micronauts_active: spawned.micronauts.length
    };

    // LLM analyzes performance and suggests optimizations
    const optimizations = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze execution metrics and suggest control vector optimizations:

Metrics: ${JSON.stringify(metrics, null, 2)}
Architecture: ${JSON.stringify(architecture, null, 2)}
Execution Results: ${JSON.stringify(execution, null, 2)}

Suggest:
1. Control vector adjustments for each micronaut type
2. New policies or tools that should be added
3. Build step optimizations
4. Coordination pattern improvements

Focus on maximizing efficiency, reducing entropy, and improving stability.`,
        response_json_schema: {
            type: "object",
            properties: {
                control_vector_adjustments: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            micronaut_name: { type: "string" },
                            adjustments: { type: "object" },
                            reason: { type: "string" }
                        }
                    }
                },
                policy_additions: { type: "array" },
                tool_recommendations: { type: "array" },
                overall_efficiency_gain: { type: "string" }
            }
        }
    });

    // Apply optimizations to active micronauts
    for (const adjustment of optimizations.control_vector_adjustments || []) {
        try {
            await base44.functions.invoke('micronaut-controller', {
                action: 'control',
                micronaut_name: adjustment.micronaut_name,
                config: {
                    control_vectors: adjustment.adjustments
                }
            });
        } catch (error) {
            console.error(`Failed to apply optimization to ${adjustment.micronaut_name}:`, error);
        }
    }

    return optimizations;
}