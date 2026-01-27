import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, TrendingUp, AlertTriangle, Activity, Zap, Clock } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function Monitoring() {
  const [selectedCLI, setSelectedCLI] = useState(null);

  const { data: metrics = [] } = useQuery({
    queryKey: ["performancemetrics"],
    queryFn: () => base44.entities.PerformanceMetric.list('-created_date', 100),
    refetchInterval: 5000
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["clilogs"],
    queryFn: () => base44.entities.CLILog.list('-created_date', 50),
    refetchInterval: 10000
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list('-triggered_at', 50)
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ["usageanalytics"],
    queryFn: () => base44.entities.UsageAnalytics.list('-timestamp', 100)
  });

  // Get unique CLIs
  const clis = [...new Set(metrics.map(m => m.cli_id))];
  const activeCLI = selectedCLI || clis[0];

  // Filter data for selected CLI
  const cliMetrics = metrics.filter(m => m.cli_id === activeCLI);
  const cliLogs = logs.filter(l => l.cli_id === activeCLI);
  const cliAlerts = alerts.filter(a => a.cli_id === activeCLI);
  const cliAnalytics = analytics.filter(a => a.cli_id === activeCLI);

  // Calculate stats
  const latestMetric = cliMetrics[0] || {};
  const avgLatency = cliMetrics.length > 0 
    ? (cliMetrics.reduce((sum, m) => sum + (m.latency_ms || 0), 0) / cliMetrics.length).toFixed(2)
    : 0;
  const avgErrorRate = cliMetrics.length > 0
    ? (cliMetrics.reduce((sum, m) => sum + (m.error_rate || 0), 0) / cliMetrics.length).toFixed(2)
    : 0;

  const activeAlerts = cliAlerts.filter(a => a.status === 'active').length;
  const criticalAlerts = cliAlerts.filter(a => a.status === 'active' && a.severity === 'critical').length;

  const getStatusColor = (status) => {
    if (status === 'critical') return 'bg-red-600 text-white';
    if (status === 'degraded') return 'bg-yellow-600 text-white';
    return 'bg-green-600 text-white';
  };

  const getLevelColor = (level) => {
    if (level === 'critical') return 'bg-red-100 text-red-800';
    if (level === 'error') return 'bg-red-100 text-red-800';
    if (level === 'warn') return 'bg-yellow-100 text-yellow-800';
    if (level === 'info') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'bg-red-600 text-white';
    if (severity === 'warning') return 'bg-yellow-600 text-white';
    return 'bg-blue-600 text-white';
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-7xl mx-auto">
        {/* Terminal Header */}
        <div className="border-2 border-green-400 bg-black mb-6">
          <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
            <span className="font-bold">$ mx2lm monitor --realtime</span>
            <span className="text-xs">[ Monitoring Dashboard ]</span>
          </div>
          <div className="p-6">
            <div className="text-cyan-400 text-2xl mb-2">╔═══ CLI MONITORING & ANALYTICS ═══╗</div>
            <div className="text-green-400">Real-time performance metrics, logs, and alerts</div>
          </div>
        </div>

        {/* CLI Selector */}
        {clis.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            {clis.map(cli => (
              <button
                key={cli}
                onClick={() => setSelectedCLI(cli)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeCLI === cli
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {cli}
              </button>
            ))}
          </div>
        )}

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Current Status</p>
                  <Badge className={getStatusColor(latestMetric.status || 'healthy')}>
                    {latestMetric.status || 'healthy'}
                  </Badge>
                </div>
                <Activity className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Avg Latency</p>
                  <div className="text-2xl font-bold text-white">{avgLatency}ms</div>
                </div>
                <Clock className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Error Rate</p>
                  <div className="text-2xl font-bold text-white">{avgErrorRate}%</div>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Active Alerts</p>
                  <div className="text-2xl font-bold text-white">{activeAlerts}</div>
                  {criticalAlerts > 0 && (
                    <p className="text-red-400 text-xs mt-1">{criticalAlerts} critical</p>
                  )}
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="analytics">Usage Analytics</TabsTrigger>
          </TabsList>

          {/* Performance Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            {cliMetrics.length > 0 ? (
              <>
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Latency Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={cliMetrics.slice(-20).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Line type="monotone" dataKey="latency_ms" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Error Rate & Throughput</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={cliMetrics.slice(-20).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Legend />
                        <Area type="monotone" dataKey="error_rate" fill="#ef4444" stroke="#ef4444" />
                        <Area type="monotone" dataKey="throughput" fill="#10b981" stroke="#10b981" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Resource Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={cliMetrics.slice(-10).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                        <Legend />
                        <Bar dataKey="memory_usage_mb" fill="#8b5cf6" />
                        <Bar dataKey="cpu_usage_percent" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-400">No metrics available yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Event Logs</CardTitle>
              </CardHeader>
              <CardContent>
                {cliLogs.length > 0 ? (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {cliLogs.map((log) => (
                      <div key={log.id} className={`p-4 rounded-lg border border-slate-700 ${getLevelColor(log.log_level)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">{log.log_level.toUpperCase()}</Badge>
                              {log.model_name && (
                                <span className="text-xs text-slate-600">
                                  {log.model_name}
                                </span>
                              )}
                            </div>
                            <p className="font-semibold mb-1">{log.message}</p>
                            {log.error_stack && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-500">
                                  Stack Trace
                                </summary>
                                <pre className="mt-2 p-2 bg-slate-900 rounded text-xs overflow-auto max-h-[200px]">
                                  {log.error_stack}
                                </pre>
                              </details>
                            )}
                            {log.duration_ms && (
                              <p className="text-xs text-slate-600 mt-1">⏱️ {log.duration_ms}ms</p>
                            )}
                          </div>
                          <span className="text-xs text-slate-600 whitespace-nowrap ml-2">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No logs available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {cliAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {cliAlerts.map((alert) => (
                      <div key={alert.id} className="p-4 rounded-lg border border-slate-700 bg-slate-900">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                              <Badge variant="outline">{alert.alert_type}</Badge>
                              <Badge variant="outline">{alert.status}</Badge>
                            </div>
                            <h3 className="font-bold text-white text-lg">{alert.title}</h3>
                          </div>
                          <span className="text-xs text-slate-400 whitespace-nowrap">
                            {new Date(alert.triggered_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-300 mb-2">{alert.description}</p>
                        {alert.threshold && (
                          <div className="text-sm text-slate-400 bg-slate-800 p-2 rounded">
                            <span className="font-semibold">Threshold:</span> {alert.threshold} | 
                            <span className="font-semibold ml-2">Current:</span> {alert.current_value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">No alerts</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {cliAnalytics.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {cliAnalytics.slice(0, 4).map((analytics, idx) => (
                    <Card key={idx} className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          {analytics.model_name} - {analytics.period}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <p className="text-slate-400 text-sm">API Calls</p>
                          <p className="text-2xl font-bold text-white">
                            {analytics.api_calls_count || 0}
                          </p>
                          <p className="text-xs text-green-400">
                            ✓ {analytics.successful_calls || 0} successful
                          </p>
                          {analytics.failed_calls > 0 && (
                            <p className="text-xs text-red-400">
                              ✗ {analytics.failed_calls} failed
                            </p>
                          )}
                        </div>
                        <div className="border-t border-slate-700 pt-2">
                          <p className="text-slate-400 text-sm">Avg Response Time</p>
                          <p className="text-xl font-bold text-white">
                            {analytics.avg_response_time_ms || 0}ms
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Tokens Used</p>
                          <p className="text-xl font-bold text-white">
                            {(analytics.total_tokens_used || 0).toLocaleString()}
                          </p>
                        </div>
                        {analytics.resource_cost > 0 && (
                          <div className="bg-slate-900 p-2 rounded">
                            <p className="text-slate-400 text-sm">Est. Cost</p>
                            <p className="text-lg font-bold text-yellow-400">
                              ${analytics.resource_cost.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {cliAnalytics.length > 0 && (
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">API Calls Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={cliAnalytics.slice(-15).reverse()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                          <Legend />
                          <Bar dataKey="api_calls_count" fill="#3b82f6" />
                          <Bar dataKey="total_tokens_used" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-400">No analytics data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}