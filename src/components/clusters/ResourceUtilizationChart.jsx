import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResourceUtilizationChart({ clusterId, data = [] }) {
  // Generate mock time-series data if not provided
  const chartData = data.length > 0 ? data : generateMockData();

  return (
    <Card className="bg-black border-slate-700">
      <CardHeader>
        <CardTitle className="text-cyan-400">Resource Utilization (24h)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #0ea5e9",
              }}
              labelStyle={{ color: "#0ea5e9" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              name="CPU %"
            />
            <Line
              type="monotone"
              dataKey="gpu"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              name="GPU %"
            />
            <Line
              type="monotone"
              dataKey="memory"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              name="Memory %"
            />
            <Line
              type="monotone"
              dataKey="jobs"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={false}
              name="Active Jobs"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function generateMockData() {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    cpu: Math.round(20 + Math.random() * 60),
    gpu: Math.round(15 + Math.random() * 70),
    memory: Math.round(30 + Math.random() * 50),
    jobs: Math.floor(2 + Math.random() * 8),
  }));
}