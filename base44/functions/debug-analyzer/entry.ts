import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { errorMessage, code, conversationId } = await req.json();

    if (!errorMessage) {
      return Response.json({ error: 'No error message provided' }, { status: 400 });
    }

    // Analyze error using LLM
    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this Python error and suggest a fix:

Error: ${errorMessage}

Current Code:
\`\`\`python
${code || 'No code provided'}
\`\`\`

Provide a structured response with:
1. Root cause (brief explanation of what went wrong)
2. Suggested fix (how to fix it)
3. Fixed code snippet (the corrected lines/function)
4. Prevention tip (how to avoid this error)

Be concise and actionable.`,
      response_json_schema: {
        type: 'object',
        properties: {
          root_cause: { type: 'string' },
          suggested_fix: { type: 'string' },
          fixed_code: { type: 'string' },
          prevention_tip: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'major', 'minor'] }
        }
      }
    });

    // If conversationId provided, log to Micronaut for tracking
    if (conversationId) {
      try {
        await base44.functions.invoke('micronaut-controller', {
          action: 'track_debug_event',
          event_type: 'error_analysis',
          error: errorMessage,
          severity: analysis.severity,
          conversation_id: conversationId
        });
      } catch (e) {
        console.log('Micronaut tracking skipped');
      }
    }

    return Response.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug analysis error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});