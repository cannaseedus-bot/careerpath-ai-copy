import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { description, codeContext, includeTests, includeMicronaut, generationType } = await req.json();

    if (!description) {
      return Response.json({ error: 'Description required' }, { status: 400 });
    }

    // Route to specialized generators
    if (generationType === 'micronaut_service') {
      return Response.json(await generateMicronautService(base44, description, codeContext));
    } else if (generationType === 'micronaut_entity') {
      return Response.json(await generateMicronautEntity(base44, description));
    } else if (generationType === 'api_documentation') {
      return Response.json(await generateAPIDocumentation(base44, description, codeContext));
    } else if (generationType === 'data_model') {
      return Response.json(await generateDataModel(base44, description));
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

async function generateMicronautService(base44, description, context) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate a complete Micronaut service based on this description:

${description}

${context ? `\nExisting Code Context:\n\`\`\`python\n${context}\n\`\`\`\n` : ''}

Generate:
1. **Service Implementation**: Complete Micronaut μ-service with control vectors (velocity, mass, entropy, stability)
2. **Entity Definition**: XJSON entity schema if needed
3. **Controller Methods**: API endpoints following Micronaut patterns
4. **Integration Code**: How to connect with other Micronauts

Use Micronaut naming conventions (μ-vector-ctrl, μ-db-master, μ-lang-parse, etc.)`,
    response_json_schema: {
      type: 'object',
      properties: {
        service_code: { type: 'string' },
        entity_schema: { type: 'string' },
        controller_code: { type: 'string' },
        integration_guide: { type: 'string' },
        control_vectors: { type: 'object' },
        assigned_folds: { type: 'array', items: { type: 'number' } }
      }
    }
  });

  return {
    success: true,
    type: 'micronaut_service',
    code: result.service_code,
    entity_schema: result.entity_schema,
    micronaut: result.controller_code,
    usage_example: result.integration_guide,
    control_vectors: result.control_vectors,
    assigned_folds: result.assigned_folds,
    timestamp: new Date().toISOString()
  };
}

async function generateMicronautEntity(base44, description) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate a Micronaut entity schema based on this description:

${description}

Create a complete entity definition including:
1. Entity name and type
2. Properties with types and descriptions
3. Control vectors (flow, intensity, entropy)
4. Assigned fold recommendations
5. N-gram compressed data structure if applicable

Output as XJSON format compatible with the Micronaut entity system.`,
    response_json_schema: {
      type: 'object',
      properties: {
        entity_name: { type: 'string' },
        entity_schema: { type: 'object' },
        control_vectors: { type: 'object' },
        assigned_folds: { type: 'array', items: { type: 'number' } },
        ngram_structure: { type: 'object' }
      }
    }
  });

  return {
    success: true,
    type: 'micronaut_entity',
    entity_name: result.entity_name,
    schema: JSON.stringify(result.entity_schema, null, 2),
    control_vectors: result.control_vectors,
    assigned_folds: result.assigned_folds,
    ngram_structure: result.ngram_structure,
    timestamp: new Date().toISOString()
  };
}

async function generateAPIDocumentation(base44, description, codeContext) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate OpenAPI 3.0 specification for these Micronaut controllers:

${description}

${codeContext ? `\nController Code:\n\`\`\`python\n${codeContext}\n\`\`\`\n` : ''}

Generate complete OpenAPI documentation including:
1. API info and version
2. All endpoints with methods, parameters, request/response schemas
3. Authentication requirements
4. Error responses
5. Examples for each endpoint

Output as valid OpenAPI 3.0 JSON.`,
    response_json_schema: {
      type: 'object',
      properties: {
        openapi_spec: { type: 'object' },
        markdown_docs: { type: 'string' },
        postman_collection: { type: 'object' }
      }
    }
  });

  return {
    success: true,
    type: 'api_documentation',
    openapi: JSON.stringify(result.openapi_spec, null, 2),
    markdown: result.markdown_docs,
    postman: JSON.stringify(result.postman_collection, null, 2),
    timestamp: new Date().toISOString()
  };
}

async function generateDataModel(base44, description) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate data models and schemas based on this description:

${description}

Create:
1. **Python Data Classes**: Using dataclasses with type hints
2. **JSON Schema**: For validation
3. **Database Schema**: SQL CREATE TABLE statements
4. **Pydantic Models**: For API validation
5. **TypeScript Interfaces**: For frontend usage

Include relationships, constraints, and validation rules.`,
    response_json_schema: {
      type: 'object',
      properties: {
        python_dataclass: { type: 'string' },
        json_schema: { type: 'object' },
        sql_schema: { type: 'string' },
        pydantic_model: { type: 'string' },
        typescript_interface: { type: 'string' },
        relationships: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return {
    success: true,
    type: 'data_model',
    python_dataclass: result.python_dataclass,
    json_schema: JSON.stringify(result.json_schema, null, 2),
    sql_schema: result.sql_schema,
    pydantic_model: result.pydantic_model,
    typescript_interface: result.typescript_interface,
    relationships: result.relationships,
    timestamp: new Date().toISOString()
  };
}