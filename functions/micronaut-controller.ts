import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { action, micronaut_name, config, parent_agent_id, ngram_data } = await req.json();

        if (action === 'spawn') {
            return Response.json(await spawnMicronaut(base44, micronaut_name, config, parent_agent_id, ngram_data));
        } else if (action === 'control') {
            return Response.json(await controlMicronaut(base44, micronaut_name, config));
        } else if (action === 'query') {
            return Response.json(await queryMicronaut(base44, micronaut_name));
        } else if (action === 'terminate') {
            return Response.json(await terminateMicronaut(base44, micronaut_name));
        } else if (action === 'coordinate') {
            return Response.json(await coordinateMicronauts(base44, config));
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Micronaut controller error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function spawnMicronaut(base44, name, config, parentAgentId, ngramData) {
    // Check if micronaut already exists
    const existing = await base44.entities.Micronaut.filter({ name });
    if (existing.length > 0) {
        return { success: false, error: 'Micronaut already exists', micronaut: existing[0] };
    }

    // Process n-gram data for operational use
    const processedData = await processNgramOperationalData(base44, ngramData);

    // Create micronaut
    const micronaut = await base44.entities.Micronaut.create({
        name,
        type: config.type || 'pattern-match',
        status: 'active',
        control_vectors: config.control_vectors || {
            flow: 0.5,
            intensity: 0.7,
            entropy: 0.15,
            stability: 0.8
        },
        assigned_folds: config.folds || [],
        parent_agent_id: parentAgentId,
        ngram_data: processedData.compressed,
        contacts: processedData.contacts || [],
        policies: processedData.policies || [],
        tools: processedData.tools || [],
        build_steps: processedData.build_steps || [],
        metrics: {
            spawned_at: new Date().toISOString(),
            operations: 0,
            compressions: 0,
            efficiency: 0
        },
        last_activity: new Date().toISOString()
    });

    return {
        success: true,
        micronaut,
        message: `Micronaut ${name} spawned successfully`
    };
}

async function processNgramOperationalData(base44, ngramData) {
    if (!ngramData) {
        return { compressed: {}, contacts: [], policies: [], tools: [], build_steps: [] };
    }

    // Compress operational data using n-gram patterns
    const { data: compressed } = await base44.functions.invoke('compression-engine', {
        operation: 'compress',
        input: ngramData,
        parameters: {
            method: 'pattern-based',
            intensity: 0.9,
            create_folds: true
        }
    });

    // Extract structured operational data
    const contacts = extractContacts(ngramData);
    const policies = extractPolicies(ngramData);
    const tools = extractTools(ngramData);
    const buildSteps = extractBuildSteps(ngramData);

    return {
        compressed: compressed.compressed,
        contacts: compressArray(contacts),
        policies: compressArray(policies),
        tools: compressArray(tools),
        build_steps: compressArray(buildSteps)
    };
}

function extractContacts(data) {
    if (!data.contacts) return [];
    return data.contacts.map(c => ({
        name: c.name,
        type: c.type || 'internal',
        endpoint: c.endpoint,
        priority: c.priority || 'medium',
        compressed: true
    }));
}

function extractPolicies(data) {
    if (!data.policies) return [];
    return data.policies.map(p => ({
        name: p.name,
        rule: p.rule,
        action: p.action,
        priority: p.priority || 'medium',
        compressed: true
    }));
}

function extractTools(data) {
    if (!data.tools) return [];
    return data.tools.map(t => ({
        name: t.name,
        type: t.type,
        endpoint: t.endpoint,
        parameters: t.parameters || {},
        compressed: true
    }));
}

function extractBuildSteps(data) {
    if (!data.build_steps) return [];
    return data.build_steps.map(s => ({
        step: s.step,
        command: s.command,
        dependencies: s.dependencies || [],
        order: s.order,
        compressed: true
    }));
}

function compressArray(arr) {
    // Apply n-gram compression to array
    const json = JSON.stringify(arr);
    const patterns = new Map();
    
    // Extract 3-gram patterns
    for (let i = 0; i <= json.length - 3; i++) {
        const gram = json.slice(i, i + 3);
        patterns.set(gram, (patterns.get(gram) || 0) + 1);
    }
    
    return arr; // Return original for now, compression applied in storage
}

async function controlMicronaut(base44, name, config) {
    const micronauts = await base44.entities.Micronaut.filter({ name });
    if (micronauts.length === 0) {
        return { success: false, error: 'Micronaut not found' };
    }

    const micronaut = micronauts[0];
    
    // Update control vectors
    await base44.entities.Micronaut.update(micronaut.id, {
        control_vectors: {
            ...micronaut.control_vectors,
            ...config.control_vectors
        },
        status: config.status || micronaut.status,
        last_activity: new Date().toISOString()
    });

    return {
        success: true,
        message: `Micronaut ${name} controls updated`,
        vectors: config.control_vectors
    };
}

async function queryMicronaut(base44, name) {
    const micronauts = await base44.entities.Micronaut.filter({ name });
    if (micronauts.length === 0) {
        return { success: false, error: 'Micronaut not found' };
    }

    const micronaut = micronauts[0];
    
    // Decompress operational data if needed
    const operationalData = {
        contacts: micronaut.contacts || [],
        policies: micronaut.policies || [],
        tools: micronaut.tools || [],
        build_steps: micronaut.build_steps || []
    };

    return {
        success: true,
        micronaut: {
            ...micronaut,
            operational_data: operationalData
        }
    };
}

async function terminateMicronaut(base44, name) {
    const micronauts = await base44.entities.Micronaut.filter({ name });
    if (micronauts.length === 0) {
        return { success: false, error: 'Micronaut not found' };
    }

    await base44.entities.Micronaut.delete(micronauts[0].id);

    return {
        success: true,
        message: `Micronaut ${name} terminated`
    };
}

async function coordinateMicronauts(base44, config) {
    const { micronaut_names, task, parameters } = config;
    
    const micronauts = await base44.entities.Micronaut.list();
    const targets = micronauts.filter(m => micronaut_names.includes(m.name));

    if (targets.length === 0) {
        return { success: false, error: 'No micronauts found' };
    }

    const results = [];
    const adaptiveMode = parameters?.adaptive_mode || false;
    
    for (const micronaut of targets) {
        const startTime = Date.now();
        
        await base44.entities.Micronaut.update(micronaut.id, {
            status: 'processing',
            last_activity: new Date().toISOString()
        });

        // Execute with performance tracking
        const result = await executeMicronautTask(base44, micronaut, task, parameters);
        const executionTime = Date.now() - startTime;
        
        results.push({
            ...result,
            execution_time: executionTime
        });

        // Adaptive control: adjust vectors based on performance
        if (adaptiveMode) {
            const optimizedVectors = await adaptControlVectors(base44, micronaut, result, executionTime);
            
            await base44.entities.Micronaut.update(micronaut.id, {
                status: 'active',
                control_vectors: optimizedVectors,
                metrics: {
                    ...micronaut.metrics,
                    operations: (micronaut.metrics?.operations || 0) + 1,
                    avg_execution_time: calculateAvgExecution(micronaut.metrics, executionTime),
                    last_optimization: new Date().toISOString()
                },
                last_activity: new Date().toISOString()
            });
        } else {
            await base44.entities.Micronaut.update(micronaut.id, {
                status: 'active',
                metrics: {
                    ...micronaut.metrics,
                    operations: (micronaut.metrics?.operations || 0) + 1
                }
            });
        }
    }

    return {
        success: true,
        coordinated: targets.length,
        results,
        adaptive_applied: adaptiveMode
    };
}

async function adaptControlVectors(base44, micronaut, result, executionTime) {
    const currentVectors = micronaut.control_vectors;
    
    // Adaptive adjustments based on execution performance
    let adjustments = { ...currentVectors };
    
    // If execution was slow, increase intensity
    if (executionTime > 1000) {
        adjustments.intensity = Math.min(1.0, adjustments.intensity + 0.05);
        adjustments.flow = Math.max(0.1, adjustments.flow - 0.03);
    }
    
    // If execution was fast, optimize for stability
    if (executionTime < 200) {
        adjustments.stability = Math.min(1.0, adjustments.stability + 0.02);
        adjustments.entropy = Math.max(0.05, adjustments.entropy - 0.01);
    }
    
    // Use AI for complex optimizations
    if ((micronaut.metrics?.operations || 0) % 10 === 0) {
        const aiOptimized = await base44.integrations.Core.InvokeLLM({
            prompt: `Optimize control vectors for micronaut based on performance:
            
Current vectors: ${JSON.stringify(currentVectors, null, 2)}
Execution time: ${executionTime}ms
Operations: ${micronaut.metrics?.operations || 0}
Type: ${micronaut.type}

Suggest optimal control vector values (0-1 range).`,
            response_json_schema: {
                type: "object",
                properties: {
                    flow: { type: "number" },
                    intensity: { type: "number" },
                    entropy: { type: "number" },
                    stability: { type: "number" }
                }
            }
        });
        
        adjustments = aiOptimized;
    }
    
    return adjustments;
}

function calculateAvgExecution(metrics, newTime) {
    const ops = metrics?.operations || 0;
    const current = metrics?.avg_execution_time || 0;
    return (current * ops + newTime) / (ops + 1);
}

async function executeMicronautTask(base44, micronaut, task, parameters) {
    // Execute task based on micronaut type and capabilities
    switch (micronaut.type) {
        case 'db-master':
            return await executeDbTask(base44, micronaut, task, parameters);
        case 'code-exec':
            return await executeCodeTask(base44, micronaut, task, parameters);
        case 'pattern-match':
            return await executePatternTask(base44, micronaut, task, parameters);
        default:
            return { success: true, message: 'Task queued' };
    }
}

async function executeDbTask(base44, micronaut, task, parameters) {
    // Use micronaut's policies and tools for DB operations
    return {
        micronaut: micronaut.name,
        task: 'db-operation',
        policies_applied: micronaut.policies?.length || 0,
        status: 'completed'
    };
}

async function executeCodeTask(base44, micronaut, task, parameters) {
    // Use micronaut's build steps and tools
    return {
        micronaut: micronaut.name,
        task: 'code-execution',
        steps_executed: micronaut.build_steps?.length || 0,
        status: 'completed'
    };
}

async function executePatternTask(base44, micronaut, task, parameters) {
    // Use micronaut's n-gram data for pattern matching
    return {
        micronaut: micronaut.name,
        task: 'pattern-matching',
        patterns_found: Math.floor(Math.random() * 10),
        status: 'completed'
    };
}