import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { script, pythonVersion = "3.12", args = [], envVars = {}, remoteApiUrl } = await req.json();

    if (!script) {
      return Response.json({ error: 'Script is required' }, { status: 400 });
    }

    // If remote API is configured, forward to remote runtime
    if (remoteApiUrl) {
      try {
        const response = await fetch(`${remoteApiUrl}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ script, pythonVersion, args, envVars })
        });
        
        if (!response.ok) {
          throw new Error(`Remote API error: ${response.status}`);
        }
        
        const result = await response.json();
        return Response.json(result);
      } catch (error) {
        return Response.json({ 
          error: 'Remote runtime error', 
          details: error.message,
          output: [{ type: 'error', text: `Failed to connect to remote runtime at ${remoteApiUrl}` }]
        }, { status: 502 });
      }
    }

    // Local execution using Deno
    const output = [];
    const scriptFile = `/tmp/script_${Date.now()}.py`;
    
    try {
      // Write script to temporary file
      await Deno.writeTextFile(scriptFile, script);

      // Prepare environment variables
      const execEnv = { ...Deno.env.toObject(), ...envVars };

      // Execute script
      const process = new Deno.Command('python' + (pythonVersion ? pythonVersion : ''), {
        args: [scriptFile, ...args],
        env: execEnv,
        stdout: 'piped',
        stderr: 'piped'
      });

      const { success, stdout, stderr } = await process.output();

      // Parse output
      const stdoutText = new TextDecoder().decode(stdout);
      const stderrText = new TextDecoder().decode(stderr);

      if (stdoutText) {
        stdoutText.split('\n').forEach(line => {
          if (line.trim()) {
            output.push({ type: 'info', text: line, timestamp: new Date().toISOString() });
          }
        });
      }

      if (stderrText) {
        stderrText.split('\n').forEach(line => {
          if (line.trim()) {
            output.push({ type: 'error', text: line, timestamp: new Date().toISOString() });
          }
        });
      }

      return Response.json({
        success,
        output,
        exitCode: success ? 0 : 1
      });

    } catch (error) {
      output.push({ 
        type: 'error', 
        text: `Execution error: ${error.message}`,
        timestamp: new Date().toISOString()
      });
      return Response.json({ success: false, output, error: error.message }, { status: 500 });
    } finally {
      // Cleanup
      try {
        await Deno.remove(scriptFile);
      } catch {}
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});