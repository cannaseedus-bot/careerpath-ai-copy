import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { content, conversationId } = await req.json();

    if (!content) {
      return Response.json({ error: 'No content provided' }, { status: 400 });
    }

    // Extract Python code blocks
    const pythonCodeRegex = /```(?:python)?\n([\s\S]*?)\n```/g;
    const matches = [];
    let match;

    while ((match = pythonCodeRegex.exec(content)) !== null) {
      matches.push(match[1].trim());
    }

    // If no code blocks found, return null
    if (matches.length === 0) {
      return Response.json({ code: null, message: 'No code blocks found' });
    }

    // Return the first code block (most relevant)
    const code = matches[0];

    // Log via Micronaut
    try {
      await base44.asServiceRole.entities.Micronaut.create({
        name: 'μ-code-extractor',
        type: 'code-exec',
        status: 'active',
        metrics: {
          extracted_code_length: code.length,
          code_block_count: matches.length,
          conversation_id: conversationId,
          timestamp: new Date().toISOString()
        }
      });
    } catch (e) {
      // Silent fail for metrics
    }

    return Response.json({ 
      code,
      blockCount: matches.length,
      success: true
    });
  } catch (error) {
    console.error('Code extraction error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});