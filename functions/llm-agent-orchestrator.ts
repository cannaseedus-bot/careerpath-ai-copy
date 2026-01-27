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
    // Phase 1: LLM analyzes command and determines architecture
    const architecture = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this command and design the agent/micronaut architecture:

Command: ${command}
Context: ${JSON.stringify(context || {}, null, 2)}

Design:
1. What agents are needed? (bot-orchestrator, bot-optimization-agent, etc.)
2. What micronauts should each agent spawn? (µ-vector-ctrl, µ-db-master, etc.)
3. What n-gram operational data do micronauts need? (contacts, policies, tools, build_steps)
4. What compression folds should be utilized?
5. What coordination pattern should be used?

Provide a complete execution plan.`,
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
                            micronauts: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        type: { type: "string" },
                                        folds: { type: "array", items: { type: "string" } },
                                        operational_data: { type: "object" }
                                    }
                                }
                            }
                        }
                    }
                },
                coordination_pattern: { type: "string" },
                expected_outcome: { type: "string" }
            }
        }
    });

    // Phase 2: Spawn agents and micronauts based on LLM design
    const spawned = await spawnArchitecture(base44, architecture);

    // Phase 3: Coordinate execution
    const execution = await executeCoordinated(base44, spawned, command);

    return {
        success: true,
        architecture,
        spawned,
        execution,
        message: 'LLM orchestration complete'
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

async function executeCoordinated(base44, spawned, command) {
    // Coordinate micronauts to execute the command
    const micronautNames = spawned.micronauts
        .filter(m => m.success)
        .map(m => m.micronaut.name);

    if (micronautNames.length === 0) {
        return { success: false, error: 'No micronauts available' };
    }

    const { data: coordination } = await base44.functions.invoke('micronaut-controller', {
        action: 'coordinate',
        config: {
            micronaut_names: micronautNames,
            task: command,
            parameters: {}
        }
    });

    return coordination;
}