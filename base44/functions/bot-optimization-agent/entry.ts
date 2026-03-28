import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bot_id, deployment_id, auto_apply } = await req.json();

        // Get bot and deployment data
        const [bot, deployment] = await Promise.all([
            base44.entities.Bot.filter({ id: bot_id }),
            deployment_id ? base44.entities.BotDeployment.filter({ id: deployment_id }) : Promise.resolve([])
        ]);

        if (!bot || bot.length === 0) {
            return Response.json({ error: 'Bot not found' }, { status: 404 });
        }

        const botData = bot[0];
        const deploymentData = deployment[0];

        // Analyze performance metrics
        const analysis = await analyzePerformance(botData, deploymentData);

        // Generate optimization suggestions using AI
        const optimizations = await generateOptimizations(base44, botData, deploymentData, analysis);

        // Spawn micronauts for optimization if needed
        if (optimizations.length > 0) {
            await spawnOptimizationMicronauts(base44, botData, optimizations);
        }

        // Save optimization suggestions
        const savedOptimizations = [];
        for (const opt of optimizations) {
            const saved = await base44.entities.BotOptimization.create({
                bot_id,
                deployment_id: deployment_id || null,
                optimization_type: opt.type,
                analysis: analysis,
                suggestion: opt.suggestion,
                config_changes: opt.config_changes,
                expected_improvement: opt.expected_improvement,
                priority: opt.priority,
                status: auto_apply && opt.priority === 'critical' ? 'auto_applied' : 'pending'
            });

            // Auto-apply critical optimizations if enabled
            if (auto_apply && opt.priority === 'critical') {
                await applyOptimization(base44, botData, deploymentData, opt);
                await base44.entities.BotOptimization.update(saved.id, {
                    status: 'auto_applied',
                    applied_at: new Date().toISOString()
                });
            }

            savedOptimizations.push(saved);
        }

        return Response.json({
            success: true,
            analysis,
            optimizations: savedOptimizations,
            auto_applied: auto_apply ? savedOptimizations.filter(o => o.status === 'auto_applied').length : 0
        });

    } catch (error) {
        console.error('Optimization agent error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function analyzePerformance(bot, deployment) {
    const metrics = bot.metrics || {};
    const tensorSchemas = bot.config?.tensor_schemas || deployment?.tensor_schemas || {};

    return {
        execution_time: metrics.last_execution_time || 0,
        executions: metrics.executions || 0,
        memory_usage: metrics.memory_usage || 0,
        tensor_rank: tensorSchemas.tensor_rank || 0,
        tensor_shape: tensorSchemas.tensor_shape || [],
        tensor_size: calculateTensorSize(tensorSchemas),
        compression_ratio: calculateCompressionRatio(deployment),
        cluster_load: calculateClusterLoad(deployment),
        bottlenecks: identifyBottlenecks(metrics, tensorSchemas)
    };
}

function calculateTensorSize(schema) {
    if (!schema.tensor_shape || schema.tensor_shape.length === 0) return 0;
    return schema.tensor_shape.reduce((acc, dim) => acc * dim, 1);
}

function calculateCompressionRatio(deployment) {
    const scxq2 = deployment?.scxq2_config || {};
    // Estimate compression based on lane priorities
    const laneWeights = { high: 0.3, medium: 0.6, low: 0.9 };
    let avgCompression = 0.7; // default
    
    if (scxq2.lanes) {
        const priorities = Object.values(scxq2.lanes).map(l => l.priority);
        avgCompression = priorities.reduce((sum, p) => sum + (laneWeights[p] || 0.7), 0) / priorities.length;
    }
    
    return avgCompression;
}

function calculateClusterLoad(deployment) {
    const nodes = deployment?.cluster_nodes || [];
    return {
        node_count: nodes.length,
        estimated_load: nodes.length > 0 ? 1.0 / nodes.length : 1.0
    };
}

function identifyBottlenecks(metrics, schema) {
    const bottlenecks = [];
    
    if (metrics.last_execution_time > 5000) {
        bottlenecks.push('slow_execution');
    }
    
    if (schema.tensor_rank > 3) {
        bottlenecks.push('high_rank_tensor');
    }
    
    const size = calculateTensorSize(schema);
    if (size > 10000) {
        bottlenecks.push('large_tensor');
    }
    
    if (metrics.memory_usage > 500000000) {
        bottlenecks.push('high_memory');
    }
    
    return bottlenecks;
}

async function generateOptimizations(base44, bot, deployment, analysis) {
    const prompt = `Analyze this bot deployment and suggest optimizations:

Bot Type: ${bot.bot_type}
Execution Time: ${analysis.execution_time}ms
Tensor Rank: ${analysis.tensor_rank}
Tensor Shape: ${JSON.stringify(analysis.tensor_shape)}
Tensor Size: ${analysis.tensor_size} elements
Compression Ratio: ${analysis.compression_ratio}
Cluster Load: ${analysis.cluster_load.estimated_load}
Bottlenecks: ${analysis.bottlenecks.join(', ')}

Current Config:
${JSON.stringify(bot.config, null, 2)}

Suggest 3-5 optimizations from these categories:
1. TENSOR_SHARDING: Split large tensors across cluster nodes
2. WEIGHT_PRUNING: Remove low-weight edges from SVG-3D tensors
3. COMPRESSION_TUNING: Adjust SCXQ2 lane priorities and thresholds
4. PHASE_OPTIMIZATION: Reorder or parallelize XJSON phases
5. CLUSTER_REBALANCING: Redistribute work across nodes

For each optimization, provide:
- Type (from categories above)
- Priority (critical/high/medium/low)
- Suggestion (clear explanation)
- Config changes (specific JSON changes)
- Expected improvement (quantitative estimates)

Focus on optimizations with highest impact and lowest risk.`;

    const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
            type: "object",
            properties: {
                optimizations: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            type: { type: "string" },
                            priority: { type: "string" },
                            suggestion: { type: "string" },
                            config_changes: { type: "object" },
                            expected_improvement: {
                                type: "object",
                                properties: {
                                    execution_time_reduction: { type: "string" },
                                    memory_reduction: { type: "string" },
                                    throughput_increase: { type: "string" }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    return response.optimizations || [];
}

async function applyOptimization(base44, bot, deployment, optimization) {
    // Merge config changes
    const newConfig = {
        ...bot.config,
        ...optimization.config_changes
    };

    // Update bot configuration
    await base44.entities.Bot.update(bot.id, {
        config: newConfig
    });

    // If deployment exists, update it too
    if (deployment) {
        await base44.entities.BotDeployment.update(deployment.id, {
            tensor_schemas: newConfig.tensor_schemas || deployment.tensor_schemas,
            scxq2_config: newConfig.scxq2_config || deployment.scxq2_config
        });
    }

    return true;
}

async function spawnOptimizationMicronauts(base44, bot, optimizations) {
    // Spawn micronauts to handle specific optimization types
    const micronautSpecs = {
        'tensor_sharding': { type: 'db-master', folds: ['⟁TENSOR_FOLD⟁', '⟁STORAGE_FOLD⟁'] },
        'weight_pruning': { type: 'pattern-match', folds: ['⟁TENSOR_FOLD⟁'] },
        'compression_tuning': { type: 'vector-ctrl', folds: ['⟁COMPRESSION_FOLD⟁'] }
    };

    for (const opt of optimizations) {
        const spec = micronautSpecs[opt.type];
        if (spec) {
            try {
                await base44.functions.invoke('micronaut-controller', {
                    action: 'spawn',
                    micronaut_name: `µ-opt-${opt.type}-${Date.now()}`,
                    config: {
                        type: spec.type,
                        folds: spec.folds,
                        control_vectors: {
                            flow: 0.8,
                            intensity: 0.9,
                            entropy: 0.1,
                            stability: 0.95
                        }
                    },
                    parent_agent_id: `optimization-agent-${bot.id}`,
                    ngram_data: {
                        policies: [
                            { name: 'optimization-policy', rule: opt.type, action: 'apply', priority: opt.priority }
                        ],
                        tools: [
                            { name: 'compression-engine', type: 'compression', endpoint: 'compression-engine' }
                        ]
                    }
                });
            } catch (error) {
                console.error('Failed to spawn micronaut:', error);
            }
        }
    }
}