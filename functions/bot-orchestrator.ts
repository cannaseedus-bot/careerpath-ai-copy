import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, bot_id, config } = await req.json();

        if (action === 'execute') {
            // Execute a bot
            const bot = await base44.entities.Bot.filter({ id: bot_id });
            if (!bot || bot.length === 0) {
                return Response.json({ error: 'Bot not found' }, { status: 404 });
            }

            const botData = bot[0];

            // Update bot status to running
            await base44.entities.Bot.update(bot_id, {
                status: 'running',
                last_run: new Date().toISOString()
            });

            try {
                // Execute bot based on type
                let result;

                switch (botData.bot_type) {
                    case 'orchestrator':
                        result = await executeOrchestrator(botData, base44);
                        break;
                    case 'scraper':
                        result = await executeScraper(botData);
                        break;
                    case 'data-builder':
                        result = await executeDataBuilder(botData);
                        break;
                    case 'cluster-worker':
                        result = await executeClusterWorker(botData);
                        break;
                    case 'ngram-builder':
                        result = await executeNgramBuilder(botData);
                        break;
                    case 'tensor-processor':
                        result = await executeTensorProcessor(botData);
                        break;
                    case 'custom':
                        result = await executeCustomBot(botData);
                        break;
                    default:
                        throw new Error(`Unknown bot type: ${botData.bot_type}`);
                }

                // Update bot with results
                await base44.entities.Bot.update(bot_id, {
                    status: 'completed',
                    output_data: result,
                    metrics: {
                        ...botData.metrics,
                        last_execution_time: new Date().toISOString(),
                        executions: (botData.metrics?.executions || 0) + 1
                    }
                });

                return Response.json({ success: true, result });

            } catch (error) {
                // Update bot with error
                await base44.entities.Bot.update(bot_id, {
                    status: 'error',
                    error_log: [
                        ...(botData.error_log || []),
                        `${new Date().toISOString()}: ${error.message}`
                    ]
                });

                return Response.json({ error: error.message }, { status: 500 });
            }
        } else if (action === 'schedule') {
            // Schedule a bot for periodic execution
            const bot = await base44.entities.Bot.filter({ id: bot_id });
            if (!bot || bot.length === 0) {
                return Response.json({ error: 'Bot not found' }, { status: 404 });
            }

            // Calculate next run based on schedule config
            const nextRun = calculateNextRun(config.schedule);

            await base44.entities.Bot.update(bot_id, {
                schedule: config.schedule,
                next_run: nextRun
            });

            return Response.json({ success: true, next_run: nextRun });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Bot orchestrator error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function executeOrchestrator(bot, base44) {
    // Orchestrator coordinates child bots
    const results = [];

    if (bot.child_bot_ids && bot.child_bot_ids.length > 0) {
        for (const childId of bot.child_bot_ids) {
            const childBots = await base44.entities.Bot.filter({ id: childId });
            if (childBots && childBots.length > 0) {
                const childResult = await executeBot(childBots[0], base44);
                results.push({ bot_id: childId, result: childResult });
            }
        }
    }

    return { orchestrated: true, child_results: results };
}

async function executeBot(bot, base44) {
    // Execute individual bot based on type
    switch (bot.bot_type) {
        case 'scraper':
            return await executeScraper(bot);
        case 'data-builder':
            return await executeDataBuilder(bot);
        case 'cluster-worker':
            return await executeClusterWorker(bot);
        default:
            return await executeCustomBot(bot);
    }
}

async function executeScraper(bot) {
    // Web scraping logic
    const results = [];
    const urls = bot.config.urls || [];

    for (const url of urls) {
        try {
            const response = await fetch(url);
            const html = await response.text();

            // Basic extraction (in real implementation, use a proper HTML parser)
            results.push({
                url,
                status: response.status,
                content_length: html.length,
                scraped_at: new Date().toISOString()
            });
        } catch (error) {
            results.push({
                url,
                error: error.message
            });
        }
    }

    return { scraped_count: results.length, results };
}

async function executeDataBuilder(bot) {
    // Data building and transformation logic
    const sources = bot.config.sources || [];
    const data = [];

    // Simulate data building
    return {
        sources_processed: sources.length,
        records_built: data.length,
        timestamp: new Date().toISOString()
    };
}

async function executeClusterWorker(bot) {
    // Cluster worker logic - processes distributed tasks
    return {
        worker_id: bot.id,
        tasks_processed: 0,
        status: 'idle'
    };
}

async function executeNgramBuilder(bot) {
    // N-gram building logic
    const n = bot.config.n || 3;
    const minFreq = bot.config.min_frequency || 5;

    return {
        ngram_size: n,
        min_frequency: minFreq,
        ngrams_built: 0,
        corpus_size: 0
    };
}

async function executeTensorProcessor(bot) {
    // Tensor processing logic
    return {
        tensors_processed: 0,
        operations: bot.config.operations || [],
        precision: bot.config.precision || 'float32'
    };
}

async function executeCustomBot(bot) {
    // Execute custom bot script
    // In a real implementation, use a sandboxed environment
    try {
        // Simulate custom bot execution
        return {
            custom: true,
            config: bot.config,
            executed_at: new Date().toISOString()
        };
    } catch (error) {
        throw new Error(`Custom bot execution failed: ${error.message}`);
    }
}

function calculateNextRun(schedule) {
    // Calculate next run time based on schedule config
    const now = new Date();
    const interval = schedule.interval || 3600; // Default 1 hour

    const nextRun = new Date(now.getTime() + interval * 1000);
    return nextRun.toISOString();
}