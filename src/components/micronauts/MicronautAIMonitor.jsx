import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Zap, 
  Brain,
  Settings,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function MicronautAIMonitor({ micronautId }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    if (micronautId) {
      analyzeNow();
    }
  }, [micronautId]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => analyzeNow(), 30000); // 30s
    return () => clearInterval(interval);
  }, [autoRefresh, micronautId]);

  const analyzeNow = async () => {
    if (!micronautId) return;
    setLoading(true);
    try {
      const result = await base44.functions.invoke('micronaut-analyzer', {
        micronautId,
        analysisType: 'full_analysis'
      });
      
      if (result.success) {
        setAnalysis(result);
        if (result.anomalies?.critical_issues?.length > 0) {
          toast.error(`${result.anomalies.critical_issues.length} critical issues detected`);
        }
      }
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const applyOptimization = async () => {
    if (!analysis?.optimization?.optimized_config) return;
    try {
      await base44.entities.Micronaut.update(micronautId, {
        control_vectors: analysis.optimization.optimized_config.control_vectors,
        assigned_folds: analysis.optimization.optimized_config.assigned_folds
      });
      toast.success('Optimization applied');
      analyzeNow();
    } catch (error) {
      toast.error('Failed to apply optimization');
    }
  };

  const getHealthColor = (health) => {
    const colors = {
      excellent: 'text-green-400 bg-green-900/20 border-green-700',
      good: 'text-blue-400 bg-blue-900/20 border-blue-700',
      warning: 'text-yellow-400 bg-yellow-900/20 border-yellow-700',
      critical: 'text-red-400 bg-red-900/20 border-red-700'
    };
    return colors[health] || colors.warning;
  };

  const getUrgencyIcon = (urgency) => {
    if (urgency === 'immediate') return <AlertTriangle className="w-4 h-4 text-red-400" />;
    if (urgency === 'soon') return <Activity className="w-4 h-4 text-yellow-400" />;
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };

  if (!micronautId) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="pt-6 text-center text-gray-500">
          Select a Micronaut to view AI analysis
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-slate-900 border-cyan-400">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              <CardTitle className="text-cyan-400">AI Monitor</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`border-slate-600 ${autoRefresh ? 'bg-cyan-900/30 text-cyan-400' : 'text-gray-400'}`}
              >
                <Zap className="w-4 h-4 mr-1" />
                {autoRefresh ? 'Live' : 'Manual'}
              </Button>
              <Button
                size="sm"
                onClick={analyzeNow}
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading && !analysis && (
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="pt-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
            <p className="text-gray-400 mt-2">Running AI analysis...</p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <>
          {/* Summary */}
          <Card className={`border-2 ${getHealthColor(analysis.summary?.overall_health)}`}>
            <CardHeader>
              <CardTitle className="text-sm">Overall Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status:</span>
                <Badge className={getHealthColor(analysis.summary?.overall_health)}>
                  {analysis.summary?.overall_health?.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Critical Issues:</span>
                <span className="text-red-400 font-bold">{analysis.summary?.critical_issues || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Maintenance:</span>
                <div className="flex items-center gap-1">
                  {getUrgencyIcon(analysis.maintenance?.urgency)}
                  <span className="text-sm">{analysis.maintenance?.urgency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anomalies */}
          {analysis.anomalies && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Anomaly Detection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.anomalies.anomalies_detected?.length > 0 ? (
                  analysis.anomalies.anomalies_detected.map((anomaly, idx) => (
                    <div key={idx} className="p-2 bg-slate-800 rounded border border-slate-700">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-300">{anomaly.type}</span>
                        <Badge className={
                          anomaly.severity === 'critical' ? 'bg-red-900 text-red-200' :
                          anomaly.severity === 'high' ? 'bg-orange-900 text-orange-200' :
                          'bg-yellow-900 text-yellow-200'
                        }>
                          {anomaly.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{anomaly.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No anomalies detected ✓</p>
                )}
                
                {analysis.anomalies.recommendations?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs font-semibold text-gray-300 mb-2">Recommendations:</p>
                    <ul className="space-y-1">
                      {analysis.anomalies.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                          <span className="text-cyan-400">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Optimization */}
          {analysis.optimization && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Performance Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.optimization.optimized_config && (
                  <div className="p-2 bg-slate-800 rounded border border-slate-700">
                    <p className="text-xs text-gray-400 mb-2">Optimized Configuration:</p>
                    <pre className="text-xs text-cyan-300 overflow-x-auto">
                      {JSON.stringify(analysis.optimization.optimized_config, null, 2)}
                    </pre>
                  </div>
                )}
                
                {analysis.optimization.expected_improvements && (
                  <div className="p-2 bg-slate-800 rounded border border-slate-700">
                    <p className="text-xs text-gray-400 mb-2">Expected Improvements:</p>
                    <ul className="space-y-1">
                      {Object.entries(analysis.optimization.expected_improvements).map(([key, value]) => (
                        <li key={key} className="text-xs text-gray-300 flex justify-between">
                          <span>{key}:</span>
                          <span className="text-green-400">+{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.optimization.priority_actions?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-300 mb-2">Priority Actions:</p>
                    <ul className="space-y-1">
                      {analysis.optimization.priority_actions.map((action, idx) => (
                        <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                          <span className="text-green-400">{idx + 1}.</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.optimization.optimized_config && (
                  <Button
                    size="sm"
                    onClick={applyOptimization}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Apply Optimization
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Predictive Maintenance */}
          {analysis.maintenance && (
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {getUrgencyIcon(analysis.maintenance.urgency)}
                  Predictive Maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
                  <span className="text-sm text-gray-400">Maintenance Needed:</span>
                  <Badge className={analysis.maintenance.maintenance_needed ? 'bg-yellow-900' : 'bg-green-900'}>
                    {analysis.maintenance.maintenance_needed ? 'YES' : 'NO'}
                  </Badge>
                </div>
                
                {analysis.maintenance.timeline && (
                  <div className="p-2 bg-slate-800 rounded border border-slate-700">
                    <p className="text-xs text-gray-400">Timeline:</p>
                    <p className="text-sm text-yellow-300">{analysis.maintenance.timeline}</p>
                  </div>
                )}
                
                {analysis.maintenance.predicted_issues?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-300 mb-2">Predicted Issues:</p>
                    <ul className="space-y-1">
                      {analysis.maintenance.predicted_issues.map((issue, idx) => (
                        <li key={idx} className="text-xs text-red-300 flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.maintenance.proactive_measures?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-300 mb-2">Proactive Measures:</p>
                    <ul className="space-y-1">
                      {analysis.maintenance.proactive_measures.map((measure, idx) => (
                        <li key={idx} className="text-xs text-green-300 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {measure}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}