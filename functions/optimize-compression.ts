import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { dataType, dataSize, performanceGoal, currentSettings } = await req.json();

        const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
        
        if (!anthropicKey) {
            return Response.json({ 
                error: 'ANTHROPIC_API_KEY not configured'
            }, { status: 500 });
        }

        const anthropic = new Anthropic({ apiKey: anthropicKey });

        const systemPrompt = `You are an SCXQ2 compression optimization expert for the MX2LM runtime.

Analyze data characteristics and recommend optimal compression settings:
- Compression level (1-10)
- Target compression ratio
- Strategy (balanced/speed/ratio/adaptive)
- SCXQ2 algorithm parameters
- Fold configuration

Output JSON:
{
  "compression_level": 5,
  "target_ratio": 3.5,
  "strategy": "balanced",
  "scxq2_config": {
    "quantization_bits": 4,
    "delta_encoding": true,
    "fold_depth": 3
  },
  "reasoning": "explanation",
  "expected_performance": {
    "compression_ratio": "3.2-3.8x",
    "speed": "fast",
    "quality": "high"
  }
}`;

        const userPrompt = `Optimize SCXQ2 compression for:

Data Type: ${dataType}
Data Size: ${dataSize || 'unknown'}
Performance Goal: ${performanceGoal || 'balanced'}

${currentSettings ? `Current Settings:\n${JSON.stringify(currentSettings, null, 2)}` : ''}

Recommend optimal compression profile.`;

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
        let optimization;
        
        try {
            const jsonMatch = responseText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
            optimization = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
        } catch (e) {
            return Response.json({ 
                error: 'Failed to parse optimization recommendation'
            }, { status: 500 });
        }

        return Response.json({
            optimization,
            success: true
        });

    } catch (error) {
        console.error('Compression optimization failed:', error);
        return Response.json({ 
            error: error.message
        }, { status: 500 });
    }
});