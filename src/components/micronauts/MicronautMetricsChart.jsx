import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function MicronautMetricsChart({ metrics, timeRange = '24h' }) {
  // Transform metrics data for chart
  const chartData = React.useMemo(() => {
    if (!metrics || !metrics.history) return [];
    
    return metrics.history.map((entry, idx) => ({
      time: entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : `T${idx}`,
      velocity: entry.velocity || 0,
      mass: entry.mass || 0,
      entropy: entry.entropy || 0,
      stability: entry.stability || 0
    }));
  }, [metrics]);

  const currentMetrics = metrics?.current || {};

  return (
    <Card className="bg-slate-900 border-cyan-400">
      <CardHeader>
        <CardTitle className="text-sm text-cyan-400">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Values */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800 rounded border border-slate-700">
            <p className="text-xs text-gray-400">Velocity</p>
            <p className="text-lg font-bold text-cyan-300">{currentMetrics.velocity?.toFixed(2) || 0}</p>
          </div>
          <div className="p-3 bg-slate-800 rounded border border-slate-700">
            <p className="text-xs text-gray-400">Mass</p>
            <p className="text-lg font-bold text-blue-300">{currentMetrics.mass?.toFixed(2) || 0}</p>
          </div>
          <div className="p-3 bg-slate-800 rounded border border-slate-700">
            <p className="text-xs text-gray-400">Entropy</p>
            <p className="text-lg font-bold text-yellow-300">{currentMetrics.entropy?.toFixed(3) || 0}</p>
          </div>
          <div className="p-3 bg-slate-800 rounded border border-slate-700">
            <p className="text-xs text-gray-400">Stability</p>
            <p className="text-lg font-bold text-green-300">{currentMetrics.stability?.toFixed(2) || 0}</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="time" 
                  stroke="#94a3b8" 
                  style={{ fontSize: '10px' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  style={{ fontSize: '10px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '8px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="velocity" 
                  stroke="#22d3ee" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="entropy" 
                  stroke="#fbbf24" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="stability" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}