import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { query, variables, operation_name } = await req.json();

        // GraphQL-style mapping that returns compressed n-gram data
        const result = await executeNgramQuery(base44, query, variables, operation_name);

        return Response.json(result);
    } catch (error) {
        console.error('N-gram data map error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function executeNgramQuery(base44, query, variables = {}, operationName) {
    // Parse query and determine data requirements
    const dataMap = parseQueryToNgramMap(query, variables);

    // Compress and prepare execution-ready data
    const compressedData = await compressToNgrams(base44, dataMap);

    // Return compressed, execution-ready data
    return {
        data: compressedData,
        compressed: true,
        fold: '⟁NGRAM_DATA_FOLD⟁',
        execution_ready: true
    };
}

function parseQueryToNgramMap(query, variables) {
    // Parse GraphQL-like query into n-gram data requirements
    const lines = query.split('\n').filter(l => l.trim());
    const dataMap = {
        entities: [],
        fields: [],
        relationships: [],
        compressed_patterns: []
    };

    for (const line of lines) {
        const trimmed = line.trim();
        
        // Extract entity names
        if (trimmed.includes('{') && !trimmed.startsWith('//')) {
            const match = trimmed.match(/(\w+)\s*\{/);
            if (match) {
                dataMap.entities.push(match[1]);
            }
        }
        
        // Extract field names
        if (!trimmed.includes('{') && !trimmed.includes('}') && trimmed.length > 0) {
            dataMap.fields.push(trimmed.replace(/[,\s]/g, ''));
        }
    }

    // Apply variables to map
    dataMap.variables = variables;

    return dataMap;
}

async function compressToNgrams(base44, dataMap) {
    const result = {};

    // For each entity, compress its data into n-grams
    for (const entityName of dataMap.entities) {
        try {
            // Fetch entity data
            const entities = await base44.entities[entityName]?.list() || [];
            
            // Compress to n-grams
            const { data: compressed } = await base44.functions.invoke('compression-engine', {
                operation: 'compress',
                input: entities,
                parameters: {
                    method: 'pattern-based',
                    intensity: 0.95,
                    entropy_target: 0.1,
                    create_folds: true
                }
            });

            // Store as execution-ready n-gram data
            result[entityName] = {
                compressed: compressed.compressed,
                dictionary: compressed.compressed.dictionary,
                fold: '⟁DATA_FOLD⟁',
                decompressor: 'ngram-executor',
                execution_ready: true,
                original_count: entities.length
            };
        } catch (error) {
            console.error(`Failed to compress ${entityName}:`, error);
            result[entityName] = { error: error.message };
        }
    }

    return result;
}