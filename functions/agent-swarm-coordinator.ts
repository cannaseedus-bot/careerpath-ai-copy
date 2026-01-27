import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { operation, parameters } = await req.json();

        let result;
        
        switch (operation) {
            case 'optimize_swarm':
                result = await optimizeSwarmRoles(base44, parameters);
                break;
            case 'share_learning':
                result = await shareLearningAcrossSwarm(base44, parameters);
                break;
            case 'generate_folds':
                result = await generateDynamicFolds(base44, parameters);
                break;
            case 'analyze_performance':
                result = await analyzeSwarmPerformance(base44);
                break;
            case 'specialize_agents':
                result = await specializeAgents(base44, parameters);
                break;
            default:
                return Response.json({ error: 'Unknown operation' }, { status: 400 });
        }

        return Response.json(result);
    } catch (error) {
        console.error('Agent swarm coordinator error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function optimizeSwarmRoles(base44, parameters) {
    // Get all micronauts
    const micronauts = await base44.entities.Micronaut.list();
    const brainAgents = micronauts.filter(m => m.parent_agent_id === 'brain-layer-11');
    
    if (brainAgents.length === 0) {
        return { success: false, message: 'No brain agents found' };
    }

    // Analyze performance metrics
    const performanceData = brainAgents.map(m => ({
        id: m.id,
        name: m.name,
        type: m.type,
        operations: m.metrics?.operations || 0,
        avg_time: m.metrics?.avg_execution_time || 0,
        success_rate: m.metrics?.success_rate || 1.0,
        efficiency_score: calculateEfficiencyScore(m.metrics)
    }));

    // Use AI to optimize roles
    const optimizations = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze agent swarm performance and optimize roles:

Current Agents:
${JSON.stringify(performanceData, null, 2)}

Determine:
1. Which agents are underperforming and why
2. Optimal role assignments based on performance
3. New agent types that should be created
4. Coordination patterns to improve
5. Control vector adjustments for each agent

Focus on maximizing collective swarm intelligence and compression efficiency.`,
        response_json_schema: {
            type: "object",
            properties: {
                role_reassignments: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            agent_id: { type: "string" },
                            new_role: { type: "string" },
                            reason: { type: "string" }
                        }
                    }
                },
                new_agent_types: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            type: { type: "string" },
                            purpose: { type: "string" },
                            folds: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                coordination_improvements: { type: "array", items: { type: "string" } },
                control_adjustments: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            agent_id: { type: "string" },
                            vectors: { type: "object" }
                        }
                    }
                }
            }
        }
    });

    // Apply role reassignments
    for (const reassignment of optimizations.role_reassignments || []) {
        await base44.entities.Micronaut.update(reassignment.agent_id, {
            type: reassignment.new_role,
            metrics: {
                ...micronauts.find(m => m.id === reassignment.agent_id)?.metrics,
                role_optimized: new Date().toISOString(),
                optimization_reason: reassignment.reason
            }
        });
    }

    // Apply control vector adjustments
    for (const adjustment of optimizations.control_adjustments || []) {
        await base44.entities.Micronaut.update(adjustment.agent_id, {
            control_vectors: adjustment.vectors
        });
    }

    return {
        success: true,
        optimizations,
        agents_optimized: (optimizations.role_reassignments?.length || 0) + 
                         (optimizations.control_adjustments?.length || 0)
    };
}

async function shareLearningAcrossSwarm(base44, parameters) {
    const { strategy, performance_metrics } = parameters;
    
    // Get all brain agents
    const micronauts = await base44.entities.Micronaut.list();
    const brainAgents = micronauts.filter(m => m.parent_agent_id === 'brain-layer-11');
    
    // Extract successful patterns
    const successfulPatterns = {
        compression_strategies: strategy.compression_strategies || [],
        fold_operations: strategy.fold_operations || [],
        ngram_optimizations: strategy.ngram_optimizations || [],
        performance: performance_metrics
    };

    // Share learning across all agents
    const updates = [];
    for (const agent of brainAgents) {
        const updatedData = {
            ...agent.ngram_data,
            learned_patterns: [
                ...(agent.ngram_data?.learned_patterns || []),
                {
                    timestamp: new Date().toISOString(),
                    source: 'swarm_learning',
                    patterns: successfulPatterns,
                    efficiency_gain: performance_metrics.efficiency_improvement || 0
                }
            ].slice(-20) // Keep last 20 learnings
        };

        await base44.entities.Micronaut.update(agent.id, {
            ngram_data: updatedData,
            metrics: {
                ...agent.metrics,
                learning_updates: (agent.metrics?.learning_updates || 0) + 1,
                last_learning: new Date().toISOString()
            }
        });

        updates.push({ agent: agent.name, patterns_learned: successfulPatterns.compression_strategies.length });
    }

    return {
        success: true,
        agents_updated: updates.length,
        patterns_shared: successfulPatterns.compression_strategies.length,
        updates
    };
}

async function generateDynamicFolds(base44, parameters) {
    const { data_analysis, existing_folds } = parameters;
    
    // Analyze data patterns to generate new folds
    const newFolds = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze data patterns and generate new compression folds:

Data Analysis:
${JSON.stringify(data_analysis, null, 2)}

Existing Folds:
${JSON.stringify(existing_folds, null, 2)}

Generate:
1. New fold types needed for this data
2. Fold operations for each new type
3. N-gram patterns specific to these folds
4. Interconnections with existing folds
5. Efficiency predictions

Create folds that maximize compression and processing efficiency.`,
        response_json_schema: {
            type: "object",
            properties: {
                new_folds: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            symbol: { type: "string" },
                            purpose: { type: "string" },
                            operations: { type: "array", items: { type: "string" } },
                            ngram_patterns: { type: "array" },
                            interconnections: { type: "array" },
                            efficiency_prediction: { type: "number" }
                        }
                    }
                },
                integration_strategy: { type: "string" },
                expected_improvements: { type: "object" }
            }
        }
    });

    // Store new folds in system
    const foldRecords = [];
    for (const fold of newFolds.new_folds || []) {
        // Store as a pattern in the system (could create a CompressionFold entity)
        foldRecords.push({
            name: fold.name,
            symbol: fold.symbol,
            created: new Date().toISOString(),
            efficiency: fold.efficiency_prediction
        });
    }

    return {
        success: true,
        new_folds: newFolds.new_folds,
        folds_generated: newFolds.new_folds?.length || 0,
        integration_strategy: newFolds.integration_strategy,
        expected_improvements: newFolds.expected_improvements
    };
}

async function analyzeSwarmPerformance(base44) {
    const micronauts = await base44.entities.Micronaut.list();
    const brainAgents = micronauts.filter(m => m.parent_agent_id === 'brain-layer-11');
    
    if (brainAgents.length === 0) {
        return { success: false, message: 'No brain agents to analyze' };
    }

    // Calculate swarm metrics
    const totalOps = brainAgents.reduce((sum, m) => sum + (m.metrics?.operations || 0), 0);
    const avgEfficiency = brainAgents.reduce((sum, m) => sum + calculateEfficiencyScore(m.metrics), 0) / brainAgents.length;
    const entangledCount = brainAgents.filter(m => m.metrics?.quantum_entangled).length;
    
    // Identify patterns
    const performancePatterns = {
        high_performers: brainAgents.filter(m => calculateEfficiencyScore(m.metrics) > 0.8).map(m => m.name),
        low_performers: brainAgents.filter(m => calculateEfficiencyScore(m.metrics) < 0.5).map(m => m.name),
        quantum_enabled: entangledCount,
        total_operations: totalOps,
        avg_efficiency: avgEfficiency
    };

    // Generate optimization recommendations
    const recommendations = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze swarm performance and provide recommendations:

Performance Data:
${JSON.stringify(performancePatterns, null, 2)}

Agents: ${brainAgents.length}
Total Operations: ${totalOps}
Average Efficiency: ${(avgEfficiency * 100).toFixed(1)}%

Recommend:
1. Immediate optimizations
2. New agent types to create
3. Learning strategies to implement
4. Coordination improvements`,
        response_json_schema: {
            type: "object",
            properties: {
                immediate_actions: { type: "array", items: { type: "string" } },
                new_agents: { type: "array", items: { type: "string" } },
                learning_strategies: { type: "array", items: { type: "string" } },
                coordination_improvements: { type: "array", items: { type: "string" } }
            }
        }
    });

    return {
        success: true,
        swarm_size: brainAgents.length,
        performance: performancePatterns,
        recommendations
    };
}

async function specializeAgents(base44, parameters) {
    const micronauts = await base44.entities.Micronaut.list();
    const brainAgents = micronauts.filter(m => m.parent_agent_id === 'brain-layer-11');
    
    if (brainAgents.length === 0) {
        return { success: false, message: 'No brain agents to specialize' };
    }

    // Analyze task patterns and agent performance
    const taskAnalysis = {
        text_compression: { count: 0, avg_efficiency: 0, agents: [] },
        code_optimization: { count: 0, avg_efficiency: 0, agents: [] },
        geometric_data: { count: 0, avg_efficiency: 0, agents: [] },
        network_streaming: { count: 0, avg_efficiency: 0, agents: [] },
        storage_patterns: { count: 0, avg_efficiency: 0, agents: [] },
        ui_rendering: { count: 0, avg_efficiency: 0, agents: [] }
    };

    // Gather performance data per agent
    brainAgents.forEach(agent => {
        const efficiency = calculateEfficiencyScore(agent.metrics);
        
        // Determine current specialization from folds
        if (agent.assigned_folds?.includes('DATA') || agent.assigned_folds?.includes('PATTERN')) {
            taskAnalysis.text_compression.agents.push({ id: agent.id, name: agent.name, efficiency });
        }
        if (agent.assigned_folds?.includes('CODE') || agent.assigned_folds?.includes('COMPUTE')) {
            taskAnalysis.code_optimization.agents.push({ id: agent.id, name: agent.name, efficiency });
        }
        if (agent.assigned_folds?.includes('SPACE') || agent.type === 'geometry') {
            taskAnalysis.geometric_data.agents.push({ id: agent.id, name: agent.name, efficiency });
        }
    });

    // AI-driven specialization recommendations
    const specializations = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze agent performance and recommend specializations:

Current Agents:
${JSON.stringify(brainAgents.map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    folds: a.assigned_folds,
    operations: a.metrics?.operations || 0,
    efficiency: calculateEfficiencyScore(a.metrics)
})), null, 2)}

Task Analysis:
${JSON.stringify(taskAnalysis, null, 2)}

Recommend for each agent:
1. Optimal specialization (text_compression, code_optimization, geometric_data, network_streaming, storage_patterns, ui_rendering)
2. Specific compression folds to assign (DATA, CODE, STORAGE, NETWORK, UI, AUTH, DB, COMPUTE, PATTERN, META, SPACE, TIME, CONTROL, EVENTS)
3. Control vector adjustments for specialization
4. Learning priorities specific to their domain
5. New specialized agent types if needed

Maximize collective swarm efficiency through complementary specializations.`,
        response_json_schema: {
            type: "object",
            properties: {
                agent_specializations: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            agent_id: { type: "string" },
                            specialization: { type: "string" },
                            new_type: { type: "string" },
                            assigned_folds: { type: "array", items: { type: "string" } },
                            control_vectors: {
                                type: "object",
                                properties: {
                                    flow: { type: "number" },
                                    intensity: { type: "number" },
                                    entropy: { type: "number" },
                                    stability: { type: "number" }
                                }
                            },
                            learning_priorities: { type: "array", items: { type: "string" } },
                            reason: { type: "string" }
                        }
                    }
                },
                new_specialized_agents: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            type: { type: "string" },
                            specialization: { type: "string" },
                            folds: { type: "array", items: { type: "string" } }
                        }
                    }
                },
                expected_improvements: { type: "object" }
            }
        }
    });

    // Apply specializations
    const specialized = [];
    for (const spec of specializations.agent_specializations || []) {
        await base44.entities.Micronaut.update(spec.agent_id, {
            type: spec.new_type,
            assigned_folds: spec.assigned_folds,
            control_vectors: spec.control_vectors,
            ngram_data: {
                ...brainAgents.find(a => a.id === spec.agent_id)?.ngram_data,
                specialization: spec.specialization,
                learning_priorities: spec.learning_priorities,
                specialized_at: new Date().toISOString()
            },
            metrics: {
                ...brainAgents.find(a => a.id === spec.agent_id)?.metrics,
                specialization: spec.specialization,
                specialization_reason: spec.reason
            }
        });
        
        specialized.push({
            agent: brainAgents.find(a => a.id === spec.agent_id)?.name,
            specialization: spec.specialization,
            folds: spec.assigned_folds
        });
    }

    // Create new specialized agents if recommended
    for (const newAgent of specializations.new_specialized_agents || []) {
        const { data: created } = await base44.functions.invoke('micronaut-controller', {
            action: 'spawn',
            micronaut_name: newAgent.name,
            config: {
                type: newAgent.type,
                folds: newAgent.folds,
                control_vectors: {
                    flow: 0.9,
                    intensity: 0.95,
                    entropy: 0.08,
                    stability: 0.92
                }
            },
            parent_agent_id: 'brain-layer-11',
            ngram_data: {
                specialization: newAgent.specialization,
                policies: [{ rule: `optimize.${newAgent.specialization}`, priority: 'critical' }],
                tools: [{ name: `${newAgent.specialization}.toolkit`, type: 'specialized' }],
                learning_priorities: [newAgent.specialization, 'efficiency', 'pattern_recognition']
            }
        });
        
        specialized.push({
            agent: newAgent.name,
            specialization: newAgent.specialization,
            folds: newAgent.folds,
            new: true
        });
    }

    return {
        success: true,
        specialized_agents: specialized,
        total_specialized: specialized.length,
        expected_improvements: specializations.expected_improvements
    };
}

function calculateEfficiencyScore(metrics) {
    if (!metrics) return 0.5;
    
    const operations = metrics.operations || 0;
    const avgTime = metrics.avg_execution_time || 100;
    const successRate = metrics.success_rate || 1.0;
    
    // Lower time is better, more operations is better
    const timeScore = Math.max(0, 1 - (avgTime / 1000));
    const opsScore = Math.min(1, operations / 100);
    
    return (timeScore * 0.4 + opsScore * 0.3 + successRate * 0.3);
}