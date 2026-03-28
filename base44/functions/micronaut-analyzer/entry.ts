import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { micronautId, metrics, analysisType } = await req.json();

    if (!micronautId && !metrics) {
      return Response.json({ error: 'Micronaut ID or metrics required' }, { status: 400 });
    }

    // Fetch Micronaut data if ID provided
    let micronautData = metrics;
    if (micronautId) {
      const micronaut = await base44.asServiceRole.entities.Micronaut.list();
      const found = micronaut.find(m => m.id === micronautId);
      if (found) {
        micronautData = {
          ...found,
          metrics: found.metrics || {}
        };
      }
    }

    // Analyze based on type
    if (analysisType === 'anomaly_detection') {
      return Response.json(await detectAnomalies(base44, micronautData));
    } else if (analysisType === 'performance_optimization') {
      return Response.json(await optimizePerformance(base44, micronautData));
    } else if (analysisType === 'predictive_maintenance') {
      return Response.json(await predictMaintenance(base44, micronautData));
    } else {
      // Full analysis
      return Response.json(await fullAnalysis(base44, micronautData));
    }
  } catch (error) {
    console.error('Micronaut analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function detectAnomalies(base44, data) {
  const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze these Micronaut metrics for anomalies:

Micronaut: ${data.name || 'Unknown'} (Type: ${data.type || 'Unknown'})
Status: ${data.status || 'Unknown'}
Metrics: ${JSON.stringify(data.metrics || {}, null, 2)}
Control Vectors: ${JSON.stringify(data.control_vectors || {}, null, 2)}

Detect:
1. Performance anomalies (unusual latency, throughput drops)
2. Resource anomalies (memory/CPU spikes)
3. Pattern anomalies (unexpected behavior patterns)
4. Health indicators (degradation signals)

Provide severity (low/medium/high/critical) and specific recommendations.`,
    response_json_schema: {
      type: 'object',
      properties: {
        anomalies_detected: { type: 'array', items: { type: 'object' } },
        overall_health: { type: 'string', enum: ['excellent', 'good', 'warning', 'critical'] },
        critical_issues: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } }
      }
    }
  });

  return {
    success: true,
    type: 'anomaly_detection',
    analysis,
    timestamp: new Date().toISOString()
  };
}

async function optimizePerformance(base44, data) {
  const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Optimize this Micronaut configuration:

Micronaut: ${data.name || 'Unknown'}
Type: ${data.type || 'Unknown'}
Current Metrics: ${JSON.stringify(data.metrics || {}, null, 2)}
Control Vectors: ${JSON.stringify(data.control_vectors || {}, null, 2)}
Assigned Folds: ${JSON.stringify(data.assigned_folds || [], null, 2)}

Suggest:
1. Optimal control vector values (flow, intensity, entropy)
2. Better fold assignments
3. Resource allocation improvements
4. Configuration tweaks for performance

Provide specific numeric values and explanations.`,
    response_json_schema: {
      type: 'object',
      properties: {
        optimized_config: { type: 'object' },
        expected_improvements: { type: 'object' },
        priority_actions: { type: 'array', items: { type: 'string' } },
        risk_level: { type: 'string', enum: ['low', 'medium', 'high'] }
      }
    }
  });

  return {
    success: true,
    type: 'performance_optimization',
    analysis,
    timestamp: new Date().toISOString()
  };
}

async function predictMaintenance(base44, data) {
  const analysis = await base44.integrations.Core.InvokeLLM({
    prompt: `Predict maintenance needs for this Micronaut:

Name: ${data.name || 'Unknown'}
Type: ${data.type || 'Unknown'}
Status: ${data.status || 'Unknown'}
Last Activity: ${data.last_activity || 'Unknown'}
Metrics History: ${JSON.stringify(data.metrics || {}, null, 2)}

Predict:
1. When maintenance is likely needed
2. What issues might develop
3. Proactive measures to take now
4. Risk timeline (days/hours until critical)

Be specific and actionable.`,
    response_json_schema: {
      type: 'object',
      properties: {
        maintenance_needed: { type: 'boolean' },
        urgency: { type: 'string', enum: ['immediate', 'soon', 'scheduled', 'none'] },
        predicted_issues: { type: 'array', items: { type: 'string' } },
        proactive_measures: { type: 'array', items: { type: 'string' } },
        timeline: { type: 'string' }
      }
    }
  });

  return {
    success: true,
    type: 'predictive_maintenance',
    analysis,
    timestamp: new Date().toISOString()
  };
}

async function fullAnalysis(base44, data) {
  const [anomalies, optimization, maintenance] = await Promise.all([
    detectAnomalies(base44, data),
    optimizePerformance(base44, data),
    predictMaintenance(base44, data)
  ]);

  return {
    success: true,
    type: 'full_analysis',
    anomalies: anomalies.analysis,
    optimization: optimization.analysis,
    maintenance: maintenance.analysis,
    summary: {
      overall_health: anomalies.analysis.overall_health,
      critical_issues: anomalies.analysis.critical_issues?.length || 0,
      optimization_potential: optimization.analysis.expected_improvements ? 'high' : 'low',
      maintenance_urgency: maintenance.analysis.urgency
    },
    timestamp: new Date().toISOString()
  };
}