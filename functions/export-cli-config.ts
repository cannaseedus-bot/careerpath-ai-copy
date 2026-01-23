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

    // Create personalized CLI starter script
    const cliScript = `#!/usr/bin/env python3
# Personalized CLI for ${user.full_name || user.email}
# Generated: ${new Date().toISOString()}

import os
import sys
import json
import requests

# Your personalized API configuration
USER_EMAIL = "${user.email}"
USER_NAME = "${user.full_name || 'User'}"

# Your API endpoints (personalized)
ENDPOINTS = ${JSON.stringify(endpoints.reduce((acc, e) => {
  acc[e.name] = {
    'url': e.url,
    'type': e.endpoint_type,
    'api_key': e.api_key || 'YOUR_API_KEY_HERE'
  };
  return acc;
}, {}), null, 2)}

# Your active models
MODELS = ${JSON.stringify(models.reduce((acc, m) => {
  acc[m.name] = {
    'model_id': m.model_id,
    'type': m.model_type,
    'quantization': m.quantization,
    'context_length': m.context_length,
    'endpoint': m.api_endpoint
  };
  return acc;
}, {}), null, 2)}

def init_cli():
    """Initialize your personalized CLI"""
    print(f"🚀 CLI.MX2LM.COM - Personalized for {USER_NAME}")
    print(f"📧 Account: {USER_EMAIL}")
    print(f"📦 Available Models: {len(MODELS)}")
    print(f"🔗 Configured Endpoints: {len(ENDPOINTS)}")

def list_models():
    """List all your active models"""
    for name, config in MODELS.items():
        print(f"  • {name} ({config['type']}) - {config['quantization']}")

def run_model(model_name, prompt):
    """Run inference with your model"""
    if model_name not in MODELS:
        print(f"❌ Model '{model_name}' not found")
        return
    
    model = MODELS[model_name]
    print(f"🤖 Running {model_name}...")
    print(f"   Model ID: {model['model_id']}")
    print(f"   Quantization: {model['quantization']}")
    
    # TODO: Implement actual API call to your endpoint
    # Use the endpoint configuration from ENDPOINTS
    print(f"\\n💡 Prompt: {prompt}")
    print("\\n⚠️  Connect to your API endpoint to see real results")

if __name__ == "__main__":
    init_cli()
    print("\\n📋 Available Commands:")
    print("  python cli.py list        - List all models")
    print("  python cli.py run <model> <prompt> - Run inference")
    print("\\n🔧 Customize this script to fit your workflow!")
`;

    zip.file('cli.py', cliScript);

    // Create .env file with their credentials
    const envFile = `# Personalized Environment Variables
# Generated for: ${user.email}

USER_EMAIL=${user.email}
USER_NAME="${user.full_name || 'User'}"

# API Keys (add your actual keys here)
${endpoints.map(e => `${e.name.toUpperCase().replace(/\s+/g, '_')}_API_KEY=${e.api_key || 'YOUR_KEY_HERE'}`).join('\n')}

# Default Model
DEFAULT_MODEL=${models[0]?.model_id || 'phi-3-mini'}
`;

    zip.file('.env.example', envFile);

    // Add README
    const readme = `# 🚀 CLI.MX2LM.COM - Personalized CLI Package

**Generated for:** ${user.full_name || user.email}  
**Email:** ${user.email}  
**Date:** ${new Date().toISOString()}

---

## 📦 Files Included

- \`cli.py\` - **Your personalized Python CLI script** (ready to run!)
- \`config.json\` - Master configuration with all your settings
- \`models.json\` - All your active models
- \`endpoints.json\` - Your API endpoint configurations
- \`.env.example\` - Environment variables template with your credentials

---

## 🎯 Quick Start

1. **Extract this ZIP file**
   \`\`\`bash
   unzip cli-config-*.zip
   cd cli-config/
   \`\`\`

2. **Run your personalized CLI**
   \`\`\`bash
   python cli.py
   \`\`\`

3. **List your models**
   \`\`\`bash
   python cli.py list
   \`\`\`

4. **Customize the script** - Add your API logic to \`cli.py\`

---

## 🔑 Your Configuration

**Active Models:** ${models.length}  
**API Endpoints:** ${endpoints.length}  

### Your Models:
${models.map(m => `- **${m.name}** (${m.model_type}) - ${m.quantization}`).join('\n')}

### Your Endpoints:
${endpoints.map(e => `- **${e.name}** - ${e.url} (${e.endpoint_type})`).join('\n')}

---

## 🛠️ Customization

The \`cli.py\` script is **pre-configured with your API keys and models**.  
Modify it to add:
- Custom commands
- Advanced model inference
- Batch processing
- Your own workflows

---

## 📚 Resources

- Documentation: CLI.MX2LM.COM
- Support: ${user.email}
- Dashboard: https://your-app-url.com

**Enjoy your personalized CLI! 🎉**
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