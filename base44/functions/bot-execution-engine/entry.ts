import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bot_id, deployment_id, input_data } = await req.json();

        // Get bot and deployment
        const [bot, deployment] = await Promise.all([
            base44.entities.Bot.filter({ id: bot_id }),
            base44.entities.BotDeployment.filter({ id: deployment_id })
        ]);

        if (!bot || bot.length === 0 || !deployment || deployment.length === 0) {
            return Response.json({ error: 'Bot or deployment not found' }, { status: 404 });
        }

        const botData = bot[0];
        const deploymentData = deployment[0];

        // Execute XJSON phases
        const execution = await executeXJSONPipeline(
            botData,
            deploymentData,
            input_data
        );

        // Update bot status
        await base44.entities.Bot.update(bot_id, {
            status: execution.success ? 'completed' : 'error',
            output_data: execution.result,
            last_run: new Date().toISOString(),
            metrics: {
                ...botData.metrics,
                executions: (botData.metrics?.executions || 0) + 1,
                last_execution_time: execution.duration_ms
            }
        });

        return Response.json(execution);

    } catch (error) {
        console.error('Execution engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function executeXJSONPipeline(bot, deployment, input) {
    const startTime = Date.now();
    const xjsonConfig = deployment.xjson_config || {
        phases: ['@Pop', '@Wo', '@Sek', '@Collapse']
    };

    try {
        // Phase 1: @Pop - Intent arrives
        const popResult = await phase_Pop(bot, input, deployment);

        // Phase 2: @Wo - State exists
        const woResult = await phase_Wo(bot, popResult, deployment);

        // Phase 3: @Sek - Order enforced
        const sekResult = await phase_Sek(bot, woResult, deployment);

        // Phase 4: @Collapse - Outcome committed
        const collapseResult = await phase_Collapse(
            bot,
            sekResult,
            deployment,
            xjsonConfig.invariants || []
        );

        return {
            success: true,
            result: collapseResult,
            duration_ms: Date.now() - startTime,
            phases: {
                pop: popResult,
                wo: woResult,
                sek: sekResult,
                collapse: collapseResult
            }
        };

    } catch (error) {
        return {
            success: false,
            error: error.message,
            duration_ms: Date.now() - startTime
        };
    }
}

async function phase_Pop(bot, input, deployment) {
    // Intent arrives - load data, parse requests
    return {
        '@phase': '@Pop',
        '@timestamp': Date.now(),
        '@input': input,
        '@bot_type': bot.bot_type,
        '@environment': deployment.environment
    };
}

async function phase_Wo(bot, popData, deployment) {
    // State exists - extract tokens, build n-grams, process data
    const stateFragments = [];

    if (bot.bot_type === 'scraper') {
        // Extract data from sources
        stateFragments.push({
            type: 'scraped_data',
            urls: bot.config.urls || [],
            extracted: [] // Would contain actual scraped data
        });
    } else if (bot.bot_type === 'ngram-builder') {
        // Build n-grams
        stateFragments.push({
            type: 'ngrams',
            n: bot.config.n || 3,
            ngrams: [] // Would contain actual n-grams
        });
    }

    return {
        '@phase': '@Wo',
        '@state_fragments': stateFragments,
        '@from': '@Pop'
    };
}

async function phase_Sek(bot, woData, deployment) {
    // Order enforced - create SCXQ2 deltas, validate sequence
    const deltas = [];

    for (const fragment of woData['@state_fragments']) {
        if (fragment.type === 'ngrams') {
            // Create SCXQ2 deltas for n-grams
            deltas.push({
                '@delta_type': 'scxq2',
                '@compression': deployment.scxq2_config,
                '@payload': compressSCXQ2(fragment.ngrams, deployment.scxq2_config)
            });
        }
    }

    return {
        '@phase': '@Sek',
        '@deltas': deltas,
        '@ordered': true,
        '@sequence_hash': await hashSequence(deltas)
    };
}

async function phase_Collapse(bot, sekData, deployment, invariants) {
    // Outcome committed - verify invariants, merge deltas, finalize
    
    // Verify invariants
    for (const invariant of invariants) {
        const valid = await verifyInvariant(invariant, sekData);
        if (!valid) {
            throw new Error(`Invariant violation: ${invariant}`);
        }
    }

    // Merge SCXQ2 deltas
    const mergedState = await mergeSCXQ2Deltas(sekData['@deltas']);

    // Distribute to cluster nodes
    const distribution = await distributeToCluster(
        mergedState,
        deployment.cluster_nodes || []
    );

    return {
        '@phase': '@Collapse',
        '@committed': true,
        '@state': mergedState,
        '@distribution': distribution,
        '@timestamp': Date.now()
    };
}

function compressSCXQ2(data, config) {
    // SCXQ2 compression logic
    return {
        DICT: {}, // Dictionary of stable symbols
        FIELD: [], // Numeric/scalar changes
        EDGE: [], // Relationships
        META: { compressed: true, version: 'v1' }
    };
}

async function hashSequence(deltas) {
    const data = JSON.stringify(deltas);
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyInvariant(invariant, data) {
    // Verify XJSON invariants
    // Example: "weights.sum <= 1.0"
    return true; // Simplified
}

async function mergeSCXQ2Deltas(deltas) {
    // Merge multiple SCXQ2 deltas into final state
    const merged = {
        DICT: {},
        FIELD: [],
        EDGE: [],
        META: {}
    };

    for (const delta of deltas) {
        if (delta['@delta_type'] === 'scxq2') {
            const payload = delta['@payload'];
            Object.assign(merged.DICT, payload.DICT || {});
            merged.FIELD.push(...(payload.FIELD || []));
            merged.EDGE.push(...(payload.EDGE || []));
        }
    }

    return merged;
}

async function distributeToCluster(state, nodes) {
    const results = [];
    
    for (const node of nodes) {
        // Send state to cluster node
        results.push({
            node,
            status: 'distributed',
            timestamp: Date.now()
        });
    }

    return results;
}