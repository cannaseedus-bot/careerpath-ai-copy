import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import JSZip from 'npm:jszip';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all CLI-related data
    const [models, endpoints, configs] = await Promise.all([
      base44.entities.HFModel.filter({ is_active: true }),
      base44.entities.APIEndpoint.filter({ is_active: true }),
      base44.entities.CLIConfig.list()
    ]);

    // Create ZIP file
    const zip = new JSZip();

    // Add models configuration
    zip.file('models.json', JSON.stringify(models, null, 2));

    // Add API endpoints
    zip.file('endpoints.json', JSON.stringify(endpoints, null, 2));

    // Add CLI configs
    zip.file('cli-configs.json', JSON.stringify(configs, null, 2));

    // Create a comprehensive config file
    const masterConfig = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      models: models.map(m => ({
        name: m.name,
        model_id: m.model_id,
        type: m.model_type,
        quantization: m.quantization,
        context_length: m.context_length,
        endpoint: m.api_endpoint
      })),
      endpoints: endpoints.map(e => ({
        name: e.name,
        url: e.url,
        type: e.endpoint_type
      })),
      active_config: configs.find(c => c.is_active) || null
    };

    zip.file('config.json', JSON.stringify(masterConfig, null, 2));

    // Add README
    const readme = `# CLI.MX2LM.COM Configuration Export
    
Generated: ${new Date().toISOString()}
User: ${user.email}

## Files Included

- \`config.json\` - Master configuration file
- \`models.json\` - All active models
- \`endpoints.json\` - All active API endpoints
- \`cli-configs.json\` - CLI configurations

## Usage

Use these files with your CLI tool to quickly set up your environment:

\`\`\`bash
cli-mx2lm import config.json
\`\`\`

Or manually reference the individual JSON files for specific configurations.
`;

    zip.file('README.md', readme);

    // Generate ZIP
    const zipContent = await zip.generateAsync({ type: 'uint8array' });

    return new Response(zipContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="cli-config-${Date.now()}.zip"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});