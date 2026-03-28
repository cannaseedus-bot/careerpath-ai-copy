import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { schema, checkLibrary } = await req.json();

        if (!schema) {
            return Response.json({ error: 'Schema required' }, { status: 400 });
        }

        const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
        
        if (!anthropicKey) {
            return Response.json({ 
                error: 'ANTHROPIC_API_KEY not configured',
                validation: { status: 'unknown' }
            }, { status: 500 });
        }

        const anthropic = new Anthropic({ apiKey: anthropicKey });

        // Get existing schemas if checking library
        let librarySchemas = [];
        if (checkLibrary) {
            librarySchemas = await base44.entities.SchemaLibrary.list('-created_date', 50);
        }

        const systemPrompt = `You are an XJSON schema validator for MX2LM/SCXQ2.

Validate schemas for:
- JSON schema correctness
- MX2LM conventions
- Control vector definitions
- Phase pipeline compatibility
- SCXQ2 compression hints
- Relationship integrity
${checkLibrary ? '- Consistency with existing schemas' : ''}

Output JSON:
{
  "status": "valid|warning|error",
  "issues": [
    {
      "severity": "error|warning|info",
      "path": "schema.path",
      "message": "description"
    }
  ],
  "suggestions": ["improvement1", "improvement2"],
  "consistency_score": 0.95
}`;

        const userPrompt = `Validate this XJSON schema:

${JSON.stringify(schema, null, 2)}

${checkLibrary && librarySchemas.length > 0 ? `\nCheck consistency against library (${librarySchemas.length} schemas):\n${librarySchemas.slice(0, 5).map(s => `- ${s.name} (${s.schema_type})`).join('\n')}` : ''}

Provide validation report.`;

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
        let validation;
        
        try {
            const jsonMatch = responseText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
            validation = JSON.parse(jsonMatch ? jsonMatch[1] : responseText);
        } catch (e) {
            validation = {
                status: 'error',
                issues: [{ severity: 'error', message: 'Failed to parse validation' }]
            };
        }

        return Response.json({
            validation,
            success: true
        });

    } catch (error) {
        console.error('Schema validation failed:', error);
        return Response.json({ 
            error: error.message,
            validation: { status: 'error' }
        }, { status: 500 });
    }
});