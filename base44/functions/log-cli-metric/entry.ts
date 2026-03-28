import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const payload = await req.json();
    const base44 = createClientFromRequest(req);

    // Validate required fields
    const { cli_id, model_name, latency_ms, throughput, error_rate, tokens_processed, memory_usage_mb, cpu_usage_percent } = payload;
    
    if (!cli_id || !model_name) {
      return Response.json({ error: 'Missing required fields: cli_id, model_name' }, { status: 400 });
    }

    // Determine health status based on metrics
    let status = 'healthy';
    if (error_rate > 10 || latency_ms > 5000) {
      status = 'degraded';
    }
    if (error_rate > 25 || latency_ms > 10000) {
      status = 'critical';
    }

    // Log the metric
    const metric = await base44.asServiceRole.entities.PerformanceMetric.create({
      cli_id,
      model_name,
      latency_ms: latency_ms || 0,
      throughput: throughput || 0,
      error_rate: error_rate || 0,
      tokens_processed: tokens_processed || 0,
      memory_usage_mb: memory_usage_mb || 0,
      cpu_usage_percent: cpu_usage_percent || 0,
      status,
      timestamp: new Date().toISOString()
    });

    // Check if alert should be triggered
    const alertsNeeded = [];

    if (latency_ms > 5000) {
      alertsNeeded.push({
        alert_type: 'latency_spike',
        severity: latency_ms > 10000 ? 'critical' : 'warning',
        title: `Latency spike detected for ${model_name}`,
        description: `Model ${model_name} is experiencing high latency`,
        threshold: '5000ms',
        current_value: `${latency_ms}ms`
      });
    }

    if (error_rate > 10) {
      alertsNeeded.push({
        alert_type: 'high_error_rate',
        severity: error_rate > 25 ? 'critical' : 'warning',
        title: `High error rate for ${model_name}`,
        description: `Error rate exceeded threshold`,
        threshold: '10%',
        current_value: `${error_rate.toFixed(2)}%`
      });
    }

    if (memory_usage_mb > 8000) {
      alertsNeeded.push({
        alert_type: 'memory_overload',
        severity: memory_usage_mb > 15000 ? 'critical' : 'warning',
        title: `Memory usage high for ${model_name}`,
        description: `Memory usage exceeds safe limits`,
        threshold: '8000MB',
        current_value: `${memory_usage_mb.toFixed(2)}MB`
      });
    }

    if (cpu_usage_percent > 80) {
      alertsNeeded.push({
        alert_type: 'cpu_spike',
        severity: cpu_usage_percent > 95 ? 'critical' : 'warning',
        title: `CPU usage spike for ${model_name}`,
        description: `CPU usage is critically high`,
        threshold: '80%',
        current_value: `${cpu_usage_percent.toFixed(2)}%`
      });
    }

    // Create alerts
    if (alertsNeeded.length > 0) {
      for (const alert of alertsNeeded) {
        await base44.asServiceRole.entities.Alert.create({
          cli_id,
          ...alert,
          triggered_at: new Date().toISOString()
        });
      }
    }

    return Response.json({
      success: true,
      metric_id: metric.id,
      alerts_created: alertsNeeded.length,
      status
    });
  } catch (error) {
    console.error('Error logging metric:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});