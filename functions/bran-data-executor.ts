import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { bran_query, execution_context, session_data } = await req.json();

        // Execute compressed n-gram data directly
        const result = await executeBran(base44, bran_query, execution_context, session_data);

        return Response.json(result);
    } catch (error) {
        console.error('Bran executor error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function executeBran(base44, query, context, sessionData) {
    // BRAN = Brain Constellation Data Access Node
    // Replaces traditional DB queries with compressed n-gram execution

    // Step 1: Fetch compressed n-gram data via map
    const { data: ngramData } = await base44.functions.invoke('ngram-data-map', {
        query,
        variables: context.variables || {},
        operation_name: context.operation_name
    });

    // Step 2: Determine if session-based or persistent execution
    const executionMode = determineExecutionMode(context, sessionData);

    // Step 3: Execute compressed data
    const executed = await executeCompressedData(base44, ngramData, executionMode, sessionData);

    // Step 4: Return execution results
    return {
        success: true,
        data: executed,
        mode: executionMode,
        compressed: true,
        fold: '⟁BRAN_EXECUTION_FOLD⟁',
        timestamp: new Date().toISOString()
    };
}

function determineExecutionMode(context, sessionData) {
    // Session-based: temporary data for current session
    // Persistent: data that needs to be recalled across sessions
    
    if (sessionData && sessionData.session_id) {
        return 'session-based';
    }
    
    if (context.persistent || context.recall_required) {
        return 'persistent-compressed';
    }
    
    return 'ephemeral-execution';
}

async function executeCompressedData(base44, ngramData, mode, sessionData) {
    const results = {};

    for (const [entity, compressedData] of Object.entries(ngramData)) {
        if (compressedData.error) {
            results[entity] = { error: compressedData.error };
            continue;
        }

        // Decompress for execution
        const { data: decompressed } = await base44.functions.invoke('compression-engine', {
            operation: 'decompress',
            input: compressedData.compressed,
            parameters: {}
        });

        // Execute based on mode
        if (mode === 'session-based') {
            // Store in session memory (ephemeral)
            results[entity] = {
                data: decompressed.decompressed,
                session_id: sessionData.session_id,
                ephemeral: true
            };
        } else if (mode === 'persistent-compressed') {
            // Keep compressed, return execution handle
            results[entity] = {
                compressed: compressedData.compressed,
                execution_handle: `bran:${entity}:${Date.now()}`,
                recall_method: 'ngram-decompression'
            };
        } else {
            // Ephemeral execution - decompress and return
            results[entity] = {
                data: decompressed.decompressed,
                ephemeral: true
            };
        }
    }

    return results;
}