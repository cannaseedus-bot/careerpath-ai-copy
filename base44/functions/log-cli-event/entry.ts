import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const payload = await req.json();
    const base44 = createClientFromRequest(req);

    const { cli_id, log_level, message, error_stack, request_id, model_name, duration_ms, metadata } = payload;

    if (!cli_id || !log_level || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create log entry
    const log = await base44.asServiceRole.entities.CLILog.create({
      cli_id,
      log_level,
      message,
      error_stack: error_stack || null,
      request_id: request_id || null,
      model_name: model_name || null,
      duration_ms: duration_ms || null,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    });

    // If it's a critical error, create an alert
    if (log_level === 'critical' || log_level === 'error') {
      await base44.asServiceRole.entities.Alert.create({
        cli_id,
        alert_type: 'custom',
        severity: log_level === 'critical' ? 'critical' : 'warning',
        title: `${log_level.toUpperCase()}: ${message.substring(0, 50)}`,
        description: message,
        triggered_at: new Date().toISOString()
      });
    }

    return Response.json({
      success: true,
      log_id: log.id
    });
  } catch (error) {
    console.error('Error logging event:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});