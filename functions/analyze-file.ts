import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { filePath, workingDir } = await req.json();

        // Attempt to read the file
        let fileContent;
        let fileError = null;
        
        try {
            // In a real scenario, this would read from the file system
            // For now, we'll use a placeholder that indicates we'd need file system access
            fileContent = `[File analysis for: ${filePath}]\nNote: File system access would be required for actual content reading.`;
        } catch (error) {
            fileError = error.message;
        }

        const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
        const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

        if (!anthropic) {
            return Response.json({ 
                error: 'ANTHROPIC_API_KEY not configured',
                summary: 'Unable to analyze file - Claude API not available'
            }, { status: 500 });
        }

        // Analyze the file
        const analysisPrompt = `Analyze this file and provide a structured summary:

File: ${filePath}
Working Directory: ${workingDir || '~/'}

${fileError ? `Error reading file: ${fileError}` : `Content:\n${fileContent}`}

Provide analysis in this format:
1. FILE TYPE: (Python, JSON, JavaScript, etc.)
2. PRIMARY PURPOSE: (1-2 sentences)
3. KEY COMPONENTS:
   - List main functions, classes, or sections
4. DEPENDENCIES:
   - External libraries/imports
   - File dependencies
5. COMPLEXITY: (Low/Medium/High with brief justification)
6. NOTABLE PATTERNS:
   - Design patterns, architecture notes
7. SUGGESTED COMMANDS:
   - 2-3 relevant MX2LM/SCXQ2 commands based on this file

Keep it concise and actionable.`;

        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 2048,
            messages: [{
                role: "user",
                content: analysisPrompt
            }]
        });

        const analysis = message.content[0].text;

        // Store analysis in context
        await base44.asServiceRole.entities.FileContext.create({
            file_path: filePath,
            working_dir: workingDir || '~/',
            analysis: analysis,
            file_type: extractFileType(filePath),
            analyzed_at: new Date().toISOString()
        });

        return Response.json({
            filePath,
            analysis,
            success: true
        });

    } catch (error) {
        console.error('File analysis error:', error);
        return Response.json({ 
            error: error.message,
            summary: 'Failed to analyze file'
        }, { status: 500 });
    }
});

function extractFileType(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    const typeMap = {
        'py': 'python',
        'js': 'javascript',
        'ts': 'typescript',
        'json': 'json',
        'md': 'markdown',
        'yaml': 'yaml',
        'yml': 'yaml',
        'toml': 'toml',
        'xml': 'xml',
        'html': 'html',
        'css': 'css',
        'sh': 'shell',
        'ps1': 'powershell'
    };
    return typeMap[ext] || 'unknown';
}