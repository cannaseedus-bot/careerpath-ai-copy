import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { currentCode, newCode } = await req.json();

    if (!newCode) {
      return Response.json({ error: 'No new code provided' }, { status: 400 });
    }

    // Parse function/class definitions from both codes
    const extractDefinitions = (code) => {
      const defs = {
        functions: new Map(),
        classes: new Map(),
        imports: new Set(),
        other: []
      };

      const lines = code.split('\n');
      let currentBlock = null;
      let blockContent = [];
      let blockIndent = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Track imports
        if (line.trim().startsWith('import ') || line.trim().startsWith('from ')) {
          defs.imports.add(line.trim());
          continue;
        }

        // Detect function definition
        if (line.match(/^def\s+\w+\s*\(/)) {
          if (currentBlock) {
            defs[currentBlock.type].set(currentBlock.name, blockContent.join('\n'));
          }
          const match = line.match(/^def\s+(\w+)\s*\(/);
          currentBlock = { type: 'functions', name: match[1] };
          blockContent = [line];
          blockIndent = line.search(/\S/);
          continue;
        }

        // Detect class definition
        if (line.match(/^class\s+\w+/)) {
          if (currentBlock) {
            defs[currentBlock.type].set(currentBlock.name, blockContent.join('\n'));
          }
          const match = line.match(/^class\s+(\w+)/);
          currentBlock = { type: 'classes', name: match[1] };
          blockContent = [line];
          blockIndent = line.search(/\S/);
          continue;
        }

        // Add to current block if indented or empty
        if (currentBlock) {
          const indent = line.search(/\S/);
          if (line.trim() === '' || indent > blockIndent) {
            blockContent.push(line);
          } else {
            // Block ended
            defs[currentBlock.type].set(currentBlock.name, blockContent.join('\n'));
            currentBlock = null;
            defs.other.push(line);
          }
        } else if (line.trim()) {
          defs.other.push(line);
        }
      }

      // Save last block
      if (currentBlock) {
        defs[currentBlock.type].set(currentBlock.name, blockContent.join('\n'));
      }

      return defs;
    };

    const currentDefs = currentCode ? extractDefinitions(currentCode) : { functions: new Map(), classes: new Map(), imports: new Set(), other: [] };
    const newDefs = extractDefinitions(newCode);

    // Merge definitions - new code overwrites old
    for (const [name, content] of newDefs.functions) {
      currentDefs.functions.set(name, content);
    }
    for (const [name, content] of newDefs.classes) {
      currentDefs.classes.set(name, content);
    }
    for (const imp of newDefs.imports) {
      currentDefs.imports.add(imp);
    }

    // Rebuild code
    const mergedCode = [
      ...[...currentDefs.imports].sort(),
      '',
      [...currentDefs.classes.values()].join('\n\n'),
      '',
      [...currentDefs.functions.values()].join('\n\n'),
      '',
      currentDefs.other.filter(l => l.trim()).join('\n')
    ]
      .filter(s => s.trim())
      .join('\n')
      .replace(/\n\n\n+/g, '\n\n');

    return Response.json({
      success: true,
      code: mergedCode,
      stats: {
        functions: currentDefs.functions.size,
        classes: currentDefs.classes.size,
        imports: currentDefs.imports.size
      }
    });
  } catch (error) {
    console.error('Code merge error:', error);
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});