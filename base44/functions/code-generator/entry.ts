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
    } else {
      // Standard full module generation
      return Response.json(await generateFullModule(base44, description, codeContext, includeTests, includeMicronaut));
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

async function generateFullModule(base44, description, context, includeTests, includeMicronaut) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate a complete, production-ready Python module based on this description:

${description}

${context ? `\nExisting Code Context:\n\`\`\`python\n${context}\n\`\`\`\n` : ''}

Create a comprehensive implementation including:
1. **Main Module Code**: Complete, well-documented Python code with type hints, docstrings, and error handling
2. **Unit Tests**: Comprehensive pytest test suite covering edge cases
${includeMicronaut ? '3. **Micronaut Controller**: Integration code for Micronaut architecture\n' : ''}
4. **Usage Examples**: Clear examples showing how to use the module
5. **Dependencies**: List of required pip packages
6. **Quality Analysis**: Code quality score (1-10), security considerations, and improvement suggestions

Make the code production-ready, following PEP 8 and best practices.`,
    response_json_schema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        tests: { type: 'string' },
        micronaut: { type: 'string' },
        usage_example: { type: 'string' },
        dependencies: { type: 'array', items: { type: 'string' } },
        explanation: { type: 'string' },
        quality: {
          type: 'object',
          properties: {
            quality_score: { type: 'number' },
            security_issues: { type: 'array', items: { type: 'string' } },
            improvements: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  });

  return {
    success: true,
    type: 'full_module',
    code: result.code,
    tests: includeTests ? result.tests : null,
    micronaut: includeMicronaut ? result.micronaut : null,
    usage_example: result.usage_example,
    dependencies: result.dependencies || [],
    explanation: result.explanation,
    quality: result.quality,
    timestamp: new Date().toISOString()
  };
}

async function generateMicronautService(base44, description, context) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate a complete Micronaut μ-service based on this description:

${description}

${context ? `\nExisting Code Context:\n\`\`\`python\n${context}\n\`\`\`\n` : ''}

Create a production-ready Micronaut service:
1. **Service Implementation**: Complete Python class implementing the Micronaut μ-service pattern
2. **Control Vectors**: CSS-style control vectors (velocity, mass, entropy, stability, flow, intensity)
3. **Entity Schema**: XJSON entity definition for data storage
4. **Controller Code**: Micronaut controller with API endpoints
5. **Integration Guide**: How to connect with other Micronauts and folds
6. **Unit Tests**: Test coverage for the service

Use Micronaut naming conventions (μ-vector-ctrl, μ-db-master, μ-lang-parse, μ-code-exec, μ-pattern-match, μ-ast-gen).`,
    response_json_schema: {
      type: 'object',
      properties: {
        service_code: { type: 'string' },
        entity_schema: { type: 'string' },
        controller_code: { type: 'string' },
        integration_guide: { type: 'string' },
        tests: { type: 'string' },
        control_vectors: { 
          type: 'object',
          properties: {
            velocity: { type: 'number' },
            mass: { type: 'number' },
            entropy: { type: 'number' },
            stability: { type: 'number' },
            flow: { type: 'number' },
            intensity: { type: 'number' }
          }
        },
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
    tests: result.tests,
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
    prompt: `Generate comprehensive API documentation for this service:

${description}

${codeContext ? `\nController/API Code:\n\`\`\`python\n${codeContext}\n\`\`\`\n` : ''}

Create complete API documentation:
1. **OpenAPI 3.0 Specification**: Full spec with all endpoints, schemas, authentication
2. **Markdown Documentation**: Human-readable API docs with examples
3. **Postman Collection**: Import-ready collection for testing
4. **Integration Examples**: Code snippets showing how to call the API (Python, JavaScript, curl)
5. **Error Handling Guide**: All possible error responses and codes

Include detailed request/response examples and authentication flows.`,
    response_json_schema: {
      type: 'object',
      properties: {
        openapi_spec: { type: 'object' },
        markdown_docs: { type: 'string' },
        postman_collection: { type: 'object' },
        integration_examples: { type: 'string' },
        error_handling: { type: 'string' }
      }
    }
  });

  return {
    success: true,
    type: 'api_documentation',
    openapi: JSON.stringify(result.openapi_spec, null, 2),
    markdown: result.markdown_docs,
    postman: JSON.stringify(result.postman_collection, null, 2),
    usage_example: result.integration_examples,
    error_guide: result.error_handling,
    timestamp: new Date().toISOString()
  };
}

async function generateDataModel(base44, description) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Generate comprehensive data models and schemas based on this description:

${description}

Create complete data layer implementations:
1. **Python Dataclass**: Modern dataclass with type hints, default values, and validators
2. **Pydantic Model**: For API request/response validation with custom validators
3. **JSON Schema**: Complete JSON schema for validation
4. **SQL Schema**: Database CREATE TABLE statements with indexes and foreign keys
5. **TypeScript Interface**: Frontend type definitions
6. **ORM Model**: SQLAlchemy or similar ORM model definition
7. **Migration Scripts**: Database migration code
8. **Usage Examples**: How to use each model type

Include all relationships, constraints, indexes, and validation rules.`,
    response_json_schema: {
      type: 'object',
      properties: {
        python_dataclass: { type: 'string' },
        pydantic_model: { type: 'string' },
        json_schema: { type: 'object' },
        sql_schema: { type: 'string' },
        typescript_interface: { type: 'string' },
        orm_model: { type: 'string' },
        migration_script: { type: 'string' },
        usage_examples: { type: 'string' },
        relationships: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return {
    success: true,
    type: 'data_model',
    code: result.python_dataclass,
    pydantic_model: result.pydantic_model,
    json_schema: JSON.stringify(result.json_schema, null, 2),
    sql_schema: result.sql_schema,
    typescript_interface: result.typescript_interface,
    orm_model: result.orm_model,
    migration_script: result.migration_script,
    usage_example: result.usage_examples,
    relationships: result.relationships,
    timestamp: new Date().toISOString()
  };
}