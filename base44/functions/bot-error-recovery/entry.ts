import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { botStateId, errorContext } = await req.json();

        if (!botStateId) {
            return Response.json({ error: 'Bot state ID required' }, { status: 400 });
        }

        // Get bot state
        const botStates = await base44.entities.BotState.filter({ id: botStateId });
        if (!botStates || botStates.length === 0) {
            return Response.json({ error: 'Bot state not found' }, { status: 404 });
        }

        const botState = botStates[0];

        const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
        
        if (!anthropicKey) {
            return Response.json({ 
                error: 'ANTHROPIC_API_KEY not configured',
                recommendation: 'retry'
            }, { status: 500 });
        }

        const anthropic = new Anthropic({ apiKey: anthropicKey });

        const systemPrompt = `You are an AI error recovery expert for the MX2LM/SCXQ2 bot orchestration system.

Analyze bot errors and provide recovery strategies:
1. RETRY - Error is transient, safe to retry
2. ROLLBACK - Revert to last checkpoint
3. SKIP - Skip problematic step, continue workflow
4. MANUAL - Requires human intervention

Consider:
- XJSON phase pipeline (@Pop → @Wo → @Sek → @Collapse)
- SCXQ2 compression state
- Workflow dependencies
- Data integrity

Provide JSON output:
{
  "strategy": "retry|rollback|skip|manual",
  "reasoning": "explanation",
  "action_plan": ["step1", "step2", ...],
  "estimated_recovery_time": "5 minutes",
  "risk_level": "low|medium|high"
}`;

        const userPrompt = `Analyze this bot error and recommend recovery:

Bot State:
- Workflow ID: ${botState.workflow_id}
- Current Phase: ${botState.current_phase}
- Error Count: ${botState.error_count}
- Status: ${botState.status}

Last Error:
${JSON.stringify(botState.last_error, null, 2)}

${errorContext ? `Additional Context:\n${errorContext}` : ''}

State Data:
${JSON.stringify(botState.state_data, null, 2)}

Provide recovery recommendation.`;

        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 2048,
            messages: [{
                role: "user",
                content: userPrompt
            }],
            system: systemPrompt
        });

        const responseText = message.content[0].text;
        let recommendation;
        
        try {
            const jsonMatch = responseText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
            recommendation = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
        } catch (e) {
            recommendation = {
                strategy: 'manual',
                reasoning: 'Failed to parse AI recommendation',
                action_plan: ['Review error manually', 'Check logs'],
                risk_level: 'high'
            };
        }

        // Update bot state with recovery strategy
        await base44.asServiceRole.entities.BotState.update(botStateId, {
            recovery_strategy: recommendation.strategy,
            status: 'recovering'
        });

        return Response.json({
            botStateId,
            recommendation,
            success: true
        });

    } catch (error) {
        console.error('Bot error recovery analysis failed:', error);
        return Response.json({ 
            error: error.message,
            recommendation: { strategy: 'manual', reasoning: 'Analysis failed' }
        }, { status: 500 });
    }
});