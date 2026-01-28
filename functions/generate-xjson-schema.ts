import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { description, schemaType, context } = await req.json();

        if (!description) {
            return Response.json({ error: 'Description required' }, { status: 400 });
        }

        const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
        
        if (!anthropicKey) {
            return Response.json({ 
                error: 'ANTHROPIC_API_KEY not configured',
                schema: null
            }, { status: 500 });
        }

        const anthropic = new Anthropic({ apiKey: anthropicKey });

        const systemPrompt = `You are an XJSON schema architect for the MX2LM/SCXQ2 runtime system.

XJSON Schema Structure:
- Uses JSON schema format with MX2LM extensions
- Supports SVG-3D tensor schemas (@Pop, @Wo, @Sek, @Collapse phases)
- Includes SCXQ2 compression metadata
- Control vectors: flow, intensity, entropy, phase_lock
- Relationships: entity references, fold assignments, micronaut bindings

Schema Types:
1. TENSOR_SCHEMA: SVG-3D geometric tensor definitions
2. BOT_CONFIG: Bot configuration with n-gram data, tools, policies
3. ENTITY: Data entity schemas for runtime storage
4. MICRONAUT: Micronaut service definitions with control vectors

Generate valid XJSON schemas that:
- Infer appropriate data types from context
- Add necessary constraints and validation
- Include MX2LM-specific metadata (phases, folds, control vectors)
- Define relationships and dependencies
- Add compression hints for SCXQ2

Output ONLY the JSON schema, no explanation.`;

        const userPrompt = `Generate an XJSON ${schemaType || 'schema'} for:

${description}

${context ? `\nAdditional Context:\n${context}` : ''}

Requirements:
- Valid JSON schema format
- Include MX2LM control vectors where appropriate
- Add SCXQ2 compression metadata
- Define relationships and constraints
- Include phase pipeline hints if relevant`;

        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4096,
            messages: [{
                role: "user",
                content: userPrompt
            }],
            system: systemPrompt
        });

        const schemaText = message.content[0].text;
        
        // Extract JSON from response (Claude might wrap it in markdown)
        let schema;
        try {
            const jsonMatch = schemaText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
            schema = JSON.parse(jsonMatch ? jsonMatch[1] : schemaText);
        } catch (e) {
            // If parsing fails, return the raw text
            return Response.json({ 
                error: 'Failed to parse generated schema',
                rawOutput: schemaText
            }, { status: 500 });
        }

        // Add MX2LM metadata
        const enrichedSchema = {
            ...schema,
            "x-mx2lm-version": "2.0",
            "x-generated": new Date().toISOString(),
            "x-generated-by": user.email,
            "x-schema-type": schemaType || "generic"
        };

        return Response.json({
            schema: enrichedSchema,
            description,
            schemaType: schemaType || 'generic',
            success: true
        });

    } catch (error) {
        console.error('XJSON schema generation error:', error);
        return Response.json({ 
            error: error.message,
            schema: null
        }, { status: 500 });
    }
});