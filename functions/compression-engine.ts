import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { operation, input, parameters } = await req.json();

        if (operation === 'compress') {
            return Response.json(await compressData(base44, input, parameters));
        } else if (operation === 'decompress') {
            return Response.json(await decompressData(input, parameters));
        } else if (operation === 'analyze') {
            return Response.json(await analyzeCompression(input));
        } else if (operation === 'optimize') {
            return Response.json(await optimizeCompression(base44, input, parameters));
        }

        return Response.json({ error: 'Invalid operation' }, { status: 400 });
    } catch (error) {
        console.error('Compression engine error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});

async function compressData(base44, input, params = {}) {
    const {
        method = 'pattern-based',
        intensity = 0.8,
        entropy_target = 0.15,
        create_folds = true
    } = params;

    // PHASE 1: Pattern Extraction
    const patterns = await extractPatterns(input);

    // PHASE 2: Fold Creation
    const folds = create_folds ? await createCompressionFolds(patterns) : null;

    // PHASE 3: Symbolic Compression
    const compressed = await applyCompression(input, patterns, folds, intensity);

    // PHASE 4: Entropy Calculation
    const entropy = calculateEntropy(compressed);

    // PHASE 5: Efficiency Metrics
    const originalSize = JSON.stringify(input).length;
    const compressedSize = JSON.stringify(compressed.symbols).length;
    const ratio = compressedSize / originalSize;

    return {
        success: true,
        compressed: {
            symbols: compressed.symbols,
            folds: folds,
            dictionary: compressed.dictionary
        },
        metrics: {
            original_size: originalSize,
            compressed_size: compressedSize,
            compression_ratio: ratio,
            efficiency: (1 - ratio) * 100,
            entropy: entropy,
            patterns_found: patterns.length
        },
        method
    };
}

async function extractPatterns(input) {
    const patterns = [];
    const data = JSON.stringify(input);
    
    // N-gram pattern extraction
    for (let n = 2; n <= 5; n++) {
        const ngrams = new Map();
        for (let i = 0; i <= data.length - n; i++) {
            const gram = data.slice(i, i + n);
            ngrams.set(gram, (ngrams.get(gram) || 0) + 1);
        }
        
        // Keep high-frequency patterns
        for (const [pattern, frequency] of ngrams.entries()) {
            if (frequency >= 3) {
                patterns.push({
                    pattern,
                    frequency,
                    length: n,
                    compression_value: frequency * n
                });
            }
        }
    }

    return patterns.sort((a, b) => b.compression_value - a.compression_value).slice(0, 50);
}

async function createCompressionFolds(patterns) {
    const folds = {
        '⟁DATA_FOLD⟁': [],
        '⟁TEXT_FOLD⟁': [],
        '⟁NUMERIC_FOLD⟁': [],
        '⟁PATTERN_FOLD⟁': []
    };

    patterns.forEach((p, idx) => {
        const symbol = `⟁P${idx}⟁`;
        
        if (/^\d+$/.test(p.pattern)) {
            folds['⟁NUMERIC_FOLD⟁'].push({ symbol, pattern: p.pattern, freq: p.frequency });
        } else if (/^[a-zA-Z]+$/.test(p.pattern)) {
            folds['⟁TEXT_FOLD⟁'].push({ symbol, pattern: p.pattern, freq: p.frequency });
        } else {
            folds['⟁PATTERN_FOLD⟁'].push({ symbol, pattern: p.pattern, freq: p.frequency });
        }
    });

    return folds;
}

async function applyCompression(input, patterns, folds, intensity) {
    let data = JSON.stringify(input);
    const dictionary = {};
    
    // Sort by compression value
    const sortedPatterns = patterns.sort((a, b) => b.compression_value - a.compression_value);
    
    // Apply top patterns based on intensity
    const numPatterns = Math.floor(sortedPatterns.length * intensity);
    
    sortedPatterns.slice(0, numPatterns).forEach((p, idx) => {
        const symbol = `⟁P${idx}⟁`;
        dictionary[symbol] = p.pattern;
        data = data.split(p.pattern).join(symbol);
    });

    return {
        symbols: data,
        dictionary
    };
}

function calculateEntropy(compressed) {
    const data = compressed.symbols;
    const freq = new Map();
    
    for (const char of data) {
        freq.set(char, (freq.get(char) || 0) + 1);
    }
    
    let entropy = 0;
    const total = data.length;
    
    for (const count of freq.values()) {
        const p = count / total;
        entropy -= p * Math.log2(p);
    }
    
    return entropy;
}

async function decompressData(compressed, params) {
    let data = compressed.symbols;
    const dictionary = compressed.dictionary;
    
    // Replace symbols with original patterns
    for (const [symbol, pattern] of Object.entries(dictionary)) {
        data = data.split(symbol).join(pattern);
    }
    
    return {
        success: true,
        decompressed: JSON.parse(data),
        folds_used: compressed.folds ? Object.keys(compressed.folds).length : 0
    };
}

async function analyzeCompression(input) {
    const data = JSON.stringify(input);
    const entropy = calculateEntropy({ symbols: data });
    
    return {
        size: data.length,
        entropy,
        compressibility: entropy > 3 ? 'low' : entropy > 1.5 ? 'medium' : 'high',
        recommended_method: entropy > 3 ? 'lossy' : 'pattern-based',
        estimated_ratio: Math.max(0.05, 1 - (5 - entropy) / 5)
    };
}

async function optimizeCompression(base44, compressed, params) {
    // Analyze current compression
    const currentEntropy = calculateEntropy(compressed);
    
    // Suggest optimizations using AI
    const suggestions = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this compression state and suggest optimizations:
        
Current Entropy: ${currentEntropy}
Compression Ratio: ${compressed.metrics?.compression_ratio || 'unknown'}
Patterns Found: ${compressed.metrics?.patterns_found || 0}

Suggest:
1. Better compression methods
2. Fold reorganization strategies
3. Entropy reduction techniques
4. Pattern refinement approaches`,
        response_json_schema: {
            type: "object",
            properties: {
                optimizations: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            type: { type: "string" },
                            suggestion: { type: "string" },
                            expected_improvement: { type: "string" }
                        }
                    }
                }
            }
        }
    });

    return {
        success: true,
        current_entropy: currentEntropy,
        optimizations: suggestions.optimizations || []
    };
}