import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { port = 8000, enableGPU = true, pythonVersion = "3.12" } = await req.json();

    const runtimeScript = `#!/usr/bin/env python${pythonVersion}
"""
WebGPU Runtime Server for Base44 Runtime Studio
This script creates a local REST API for executing Python scripts with GPU support
"""

import json
import subprocess
import sys
import os
import tempfile
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import traceback

ENABLE_GPU = ${enableGPU}
PORT = ${port}
HOST = "127.0.0.1"

class ScriptExecutorHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/execute':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            try:
                data = json.loads(body)
                script = data.get('script', '')
                args = data.get('args', [])
                env_vars = data.get('envVars', {})
                python_version = data.get('pythonVersion', '${pythonVersion}')
                
                if not script:
                    self.send_json_response({'error': 'Script is required'}, 400)
                    return
                
                output = []
                
                try:
                    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                        f.write(script)
                        script_file = f.name
                    
                    # Prepare environment
                    exec_env = os.environ.copy()
                    exec_env.update(env_vars)
                    
                    if ENABLE_GPU:
                        # Set GPU-related environment variables
                        exec_env['CUDA_VISIBLE_DEVICES'] = '0'
                        exec_env['TF_CPP_MIN_LOG_LEVEL'] = '0'
                    
                    # Execute script
                    process = subprocess.Popen(
                        [f'python{python_version}', script_file] + args,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        env=exec_env,
                        text=True
                    )
                    
                    stdout, stderr = process.communicate(timeout=300)
                    
                    # Parse output
                    if stdout:
                        for line in stdout.split('\\n'):
                            if line.strip():
                                output.append({'type': 'info', 'text': line})
                    
                    if stderr:
                        for line in stderr.split('\\n'):
                            if line.strip():
                                output.append({'type': 'error', 'text': line})
                    
                    os.unlink(script_file)
                    
                    self.send_json_response({
                        'success': process.returncode == 0,
                        'output': output,
                        'exitCode': process.returncode
                    })
                    
                except Exception as e:
                    output.append({'type': 'error', 'text': f'Execution error: {str(e)}'})
                    self.send_json_response({
                        'success': False,
                        'output': output,
                        'error': str(e)
                    }, 500)
            
            except json.JSONDecodeError:
                self.send_json_response({'error': 'Invalid JSON'}, 400)
        
        elif self.path == '/health':
            self.send_json_response({
                'status': 'ok',
                'gpu_enabled': ENABLE_GPU,
                'python_version': '${pythonVersion}'
            })
        
        else:
            self.send_json_response({'error': 'Endpoint not found'}, 404)
    
    def send_json_response(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == '__main__':
    server = HTTPServer((HOST, PORT), ScriptExecutorHandler)
    print(f"🚀 WebGPU Runtime Server started on http://{HOST}:{PORT}")
    print(f"GPU Support: {'✓ Enabled' if ENABLE_GPU else '✗ Disabled'}")
    print(f"Python Version: ${pythonVersion}")
    print(f"\\nEndpoints:")
    print(f"  POST /execute - Execute Python scripts")
    print(f"  POST /health - Check server status")
    print(f"\\nPress Ctrl+C to stop the server")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\\n\\n🛑 Server stopped")
        sys.exit(0)
`;

    return new Response(runtimeScript, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="webgpu-runtime.py"'
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});