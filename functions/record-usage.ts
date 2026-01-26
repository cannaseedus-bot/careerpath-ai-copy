import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const payload = await req.json();
    const base44 = createClientFromRequest(req);

    const { 
      cli_id, 
      model_name, 
      api_calls_count, 
      successful_calls, 
      failed_calls, 
      total_tokens_used,
      total_requests_processed,
      avg_response_time_ms,
      peak_concurrent_requests,
      resource_cost,
      period = 'hourly'
    } = payload;

    if (!cli_id || !model_name) {
      return Response.json({ error: 'Missing required fields: cli_id, model_name' }, { status: 400 });
    }

    // Create usage analytics record
    const analytics = await base44.asServiceRole.entities.UsageAnalytics.create({
      cli_id,
      model_name,
      api_calls_count: api_calls_count || 0,
      successful_calls: successful_calls || 0,
      failed_calls: failed_calls || 0,
      total_tokens_used: total_tokens_used || 0,
      total_requests_processed: total_requests_processed || 0,
      avg_response_time_ms: avg_response_time_ms || 0,
      peak_concurrent_requests: peak_concurrent_requests || 0,
      resource_cost: resource_cost || 0,
      period,
      timestamp: new Date().toISOString()
    });

    return Response.json({
      success: true,
      analytics_id: analytics.id
    });
  } catch (error) {
    console.error('Error recording usage:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});