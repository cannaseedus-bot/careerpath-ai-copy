import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { description, codeContext, includeTests, includeMicronaut } = await req.json();

    if (!description) {
      return Response.json({ error: 'Description required' }, { status: 400 });
    }

    // Build comprehensive prompt with project context
    const prompt = `Generate a complete Python module based on this description:

${description}

${codeContext ? `\n**Existing Code Context:**\n\`\`\`python\n${codeContext}\n\`\`\`\n` : ''}

**Requirements:**
1. Generate production-ready, well-structured Python code
2. Follow PEP 8 style guidelines
3. Include comprehensive docstrings
4. Use type hints
5. Handle errors gracefully
6. Follow existing patterns from the codebase
${includeTests ? '7. Include pytest unit tests in a separate section' : ''}
${includeMicronaut ? '8. Include Micronaut controller implementation for runtime integration' : ''}

**Output Format:**
Return a JSON object with:
- \`main_code\`: The primary Python module code
- \`tests\`: Unit tests (if requested)
- \`micronaut\`: Micronaut controller code (if requested)
- \`usage_example\`: How to use the generated code
- \`dependencies\`: List of required packages

Generate clean, executable code. Do NOT include markdown formatting or explanations in the code blocks.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          main_code: { type: 'string' },
          tests: { type: 'string' },
          micronaut: { type: 'string' },
          usage_example: { type: 'string' },
          dependencies: { type: 'array', items: { type: 'string' } },
          explanation: { type: 'string' }
        }
      }
    });

    // Analyze code quality
    const qualityAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this generated code for quality and potential issues:

\`\`\`python
${result.main_code}
\`\`\`

Check for:
1. Security vulnerabilities
2. Performance issues
3. Code smells
4. Best practice violations
5. Edge cases not handled

Rate quality from 1-10 and provide specific improvement suggestions.`,
      response_json_schema: {
        type: 'object',
        properties: {
          quality_score: { type: 'number' },
          security_issues: { type: 'array', items: { type: 'string' } },
          performance_notes: { type: 'array', items: { type: 'string' } },
          improvements: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({
      success: true,
      code: result.main_code,
      tests: result.tests || null,
      micronaut: result.micronaut || null,
      usage_example: result.usage_example,
      dependencies: result.dependencies || [],
      explanation: result.explanation,
      quality: qualityAnalysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Code generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});