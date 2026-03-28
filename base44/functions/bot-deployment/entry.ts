import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, bot_id, version_id, environment, config } = await req.json();

        if (action === 'deploy') {
            // Create new deployment
            const bot = await base44.entities.Bot.filter({ id: bot_id });
            if (!bot || bot.length === 0) {
                return Response.json({ error: 'Bot not found' }, { status: 404 });
            }

            const botData = bot[0];
            
            // Create version snapshot
            const version = await base44.entities.BotVersion.create({
                bot_id,
                version: config.version || `v${Date.now()}`,
                script_snapshot: botData.script,
                config_snapshot: botData.config,
                tensor_schemas: config.tensor_schemas || {},
                scxq2_config: config.scxq2_config || {},
                changelog: config.changelog || 'Deployment snapshot',
                is_stable: environment === 'production'
            });

            // Create deployment record
            const deployment = await base44.entities.BotDeployment.create({
                bot_id,
                bot_version_id: version.id,
                environment,
                cluster_nodes: config.cluster_nodes || [],
                status: 'deploying',
                tensor_schemas: config.tensor_schemas || {},
                scxq2_config: config.scxq2_config || {},
                xjson_config: config.xjson_config || {
                    phases: ['@Pop', '@Wo', '@Sek', '@Collapse'],
                    invariants: []
                },
                deployment_hash: await generateHash(version)
            });

            // Deploy to cluster nodes
            const deploymentResults = await deployToCluster(
                botData,
                deployment,
                config.cluster_nodes || []
            );

            // Update deployment status
            await base44.entities.BotDeployment.update(deployment.id, {
                status: deploymentResults.success ? 'active' : 'failed',
                deployed_at: new Date().toISOString(),
                health_status: deploymentResults.health
            });

            return Response.json({
                success: deploymentResults.success,
                deployment_id: deployment.id,
                version_id: version.id,
                results: deploymentResults
            });

        } else if (action === 'rollback') {
            // Rollback to previous version
            const deployment = await base44.entities.BotDeployment.filter({ id: config.deployment_id });
            if (!deployment || deployment.length === 0) {
                return Response.json({ error: 'Deployment not found' }, { status: 404 });
            }

            const currentDeployment = deployment[0];
            
            if (!currentDeployment.rollback_target) {
                return Response.json({ error: 'No rollback target available' }, { status: 400 });
            }

            // Get previous deployment
            const previousDeployment = await base44.entities.BotDeployment.filter({
                id: currentDeployment.rollback_target
            });

            if (!previousDeployment || previousDeployment.length === 0) {
                return Response.json({ error: 'Rollback target not found' }, { status: 404 });
            }

            const prevDeploy = previousDeployment[0];
            const prevVersion = await base44.entities.BotVersion.filter({
                id: prevDeploy.bot_version_id
            });

            // Deploy previous version
            const rollbackResults = await deployToCluster(
                {
                    script: prevVersion[0].script_snapshot,
                    config: prevVersion[0].config_snapshot
                },
                prevDeploy,
                currentDeployment.cluster_nodes
            );

            // Mark current as rolled back
            await base44.entities.BotDeployment.update(currentDeployment.id, {
                status: 'rolled_back'
            });

            // Create new deployment record
            const newDeployment = await base44.entities.BotDeployment.create({
                ...currentDeployment,
                bot_version_id: prevDeploy.bot_version_id,
                status: 'active',
                deployed_at: new Date().toISOString(),
                rollback_target: currentDeployment.id
            });

            return Response.json({
                success: true,
                deployment_id: newDeployment.id,
                rolled_back_from: currentDeployment.id
            });

        } else if (action === 'health_check') {
            // Check cluster health
            const deployments = await base44.entities.BotDeployment.filter({
                environment,
                status: 'active'
            });

            const healthResults = await Promise.all(
                deployments.map(d => checkClusterHealth(d))
            );

            return Response.json({ health: healthResults });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Deployment error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function deployToCluster(bot, deployment, nodes) {
    const results = {
        success: true,
        deployed_nodes: [],
        failed_nodes: [],
        health: {}
    };

    // In production, this would deploy to actual cluster nodes
    // For now, simulate deployment
    for (const node of nodes) {
        try {
            // Simulate deployment to node
            const deployed = await deployToNode(node, bot, deployment);
            results.deployed_nodes.push(node);
            results.health[node] = 'healthy';
        } catch (error) {
            results.failed_nodes.push({ node, error: error.message });
            results.success = false;
        }
    }

    return results;
}

async function deployToNode(node, bot, deployment) {
    // Simulate node deployment
    // In production: send bot script, config, and tensor schemas to node
    return {
        node,
        status: 'deployed',
        timestamp: new Date().toISOString()
    };
}

async function checkClusterHealth(deployment) {
    // Check health of all cluster nodes
    const health = {
        deployment_id: deployment.id,
        nodes: {}
    };

    for (const node of deployment.cluster_nodes || []) {
        health.nodes[node] = {
            status: 'healthy',
            last_ping: new Date().toISOString()
        };
    }

    return health;
}

async function generateHash(version) {
    const data = JSON.stringify({
        script: version.script_snapshot,
        config: version.config_snapshot,
        timestamp: version.created_date
    });

    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}