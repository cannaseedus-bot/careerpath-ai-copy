import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bot_config, bot_type, sample_data, script_analysis } = await req.json();

        // Build AI prompt for tensor schema generation
        const prompt = buildSchemaPrompt(bot_config, bot_type, sample_data, script_analysis);

        // Generate schema using AI
        const schema = await base44.integrations.Core.InvokeLLM({
            prompt,
            add_context_from_internet: false,
            response_json_schema: {
                type: "object",
                properties: {
                    tensor_rank: { type: "integer" },
                    tensor_shape: { type: "array", items: { type: "integer" } },
                    attributes: {
                        type: "object",
                        properties: {
                            "data-src": { type: "string" },
                            "data-dst": { type: "string" },
                            "data-weight": { type: "string" }
                        }
                    },
                    svg_structure: { type: "object" },
                    compression_hints: { type: "object" },
                    invariants: { type: "array", items: { type: "string" } }
                }
            }
        });

        // Generate sample n-grams if needed
        let ngrams = null;
        if (bot_type === 'ngram-builder' && sample_data) {
            ngrams = await generateNGrams(sample_data, bot_config.n || 3);
        }

        // Generate tensor weights on-the-fly
        const weights = await generateTensorWeights(schema, bot_config, sample_data);

        return Response.json({
            success: true,
            schema: {
                ...schema,
                svg_3d_version: "1.0",
                generated_at: new Date().toISOString(),
                bot_type
            },
            ngrams,
            weights,
            scxq2_config: generateSCXQ2Config(schema)
        });

    } catch (error) {
        console.error('Tensor schema generation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

function buildSchemaPrompt(bot_config, bot_type, sample_data, script_analysis) {
    return `You are an expert in SVG-3D tensor schema design for XJSON runtime clusters.

Bot Type: ${bot_type}
Bot Configuration: ${JSON.stringify(bot_config, null, 2)}
${sample_data ? `Sample Data: ${JSON.stringify(sample_data, null, 2)}` : ''}
${script_analysis ? `Script Analysis: ${script_analysis}` : ''}

Generate an SVG-3D tensor schema with the following requirements:

1. TENSOR RANK: Determine the appropriate tensor rank (0-4) based on data dimensionality
   - Rank 0: Scalar (single value)
   - Rank 1: Vector (1D array)
   - Rank 2: Matrix (2D grid)
   - Rank 3: 3D tensor (volume)
   - Rank 4: 4D tensor (spacetime)

2. TENSOR SHAPE: Array specifying dimensions, e.g., [10, 20, 5] for 3D tensor

3. SVG ATTRIBUTES: Define data flow attributes
   - data-src: Source node identifier pattern
   - data-dst: Destination node identifier pattern  
   - data-weight: Weight calculation method (cosine, dot, geometric, learned)

4. SVG STRUCTURE: Nested SVG element structure for visualization
   - Include <g> grouping, <path> elements for edges, <circle> for nodes
   - Use geometric primitives appropriate for tensor rank

5. COMPRESSION HINTS: SCXQ2 compression optimization
   - Which lanes (DICT/FIELD/EDGE/META) to prioritize
   - Delta sensitivity thresholds

6. INVARIANTS: Legal constraints that must hold
   - Examples: "weights_sum <= 1.0", "no_self_loops", "acyclic"

For ${bot_type} bots, consider:
- scrapers: Graph tensors (rank 2-3) for relationship extraction
- ngram-builder: Sequence tensors (rank 1-2) for token patterns
- tensor-processor: High-rank tensors (3-4) for geometric operations
- cluster-worker: Distributed tensors with partition hints

Provide a complete, valid schema that can be directly used in XJSON runtime.`;
}

async function generateNGrams(sample_data, n = 3) {
    // Generate n-grams from sample text data
    const text = typeof sample_data === 'string' ? sample_data : JSON.stringify(sample_data);
    const tokens = text.toLowerCase().split(/\s+/);
    
    const ngrams = [];
    for (let i = 0; i <= tokens.length - n; i++) {
        const ngram = tokens.slice(i, i + n).join(' ');
        ngrams.push({
            sequence: ngram,
            tokens: tokens.slice(i, i + n),
            start_pos: i,
            frequency: 1
        });
    }

    // Count frequencies
    const ngramMap = new Map();
    ngrams.forEach(ng => {
        const key = ng.sequence;
        if (ngramMap.has(key)) {
            ngramMap.get(key).frequency++;
        } else {
            ngramMap.set(key, ng);
        }
    });

    return Array.from(ngramMap.values())
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 100); // Top 100 n-grams
}

async function generateTensorWeights(schema, bot_config, sample_data) {
    // Generate tensor weights based on schema and data
    const rank = schema.tensor_rank || 2;
    const shape = schema.tensor_shape || [10, 10];

    const weights = {
        rank,
        shape,
        method: schema.attributes?.['data-weight'] || 'geometric',
        values: []
    };

    // Generate sample weight matrix
    if (rank === 2) {
        // Matrix weights
        for (let i = 0; i < shape[0]; i++) {
            const row = [];
            for (let j = 0; j < shape[1]; j++) {
                // Use geometric decay or learned patterns
                const weight = Math.exp(-Math.abs(i - j) / 5);
                row.push(weight);
            }
            weights.values.push(row);
        }
    } else if (rank === 1) {
        // Vector weights
        for (let i = 0; i < shape[0]; i++) {
            weights.values.push(1.0 / shape[0]);
        }
    }

    return weights;
}

function generateSCXQ2Config(schema) {
    return {
        enabled: true,
        lanes: {
            DICT: {
                priority: schema.tensor_rank <= 1 ? 'high' : 'medium',
                compression: 'lz4'
            },
            FIELD: {
                priority: 'high',
                compression: 'delta',
                threshold: 0.001
            },
            EDGE: {
                priority: schema.tensor_rank >= 2 ? 'high' : 'low',
                compression: 'sparse'
            },
            META: {
                priority: 'low',
                compression: 'none'
            }
        },
        delta_mode: 'incremental',
        merge_strategy: 'last_write_wins'
    };
}