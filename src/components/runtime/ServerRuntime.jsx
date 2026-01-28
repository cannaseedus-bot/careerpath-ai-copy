import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server, Activity, Wifi, WifiOff, Play, Square, RotateCcw, Terminal } from "lucide-react";

/**
 * MX2LM Server Runtime Panel (MX2LM-SR-1)
 * CSS-Micronaut projection-only UI
 * Connects to ws://127.0.0.1:4141/ws/status
 */
export default function ServerRuntime() {
  const [status, setStatus] = useState({
    connected: false,
    uptime: 0,
    requests: 0,
    healthy: false,
    lastTick: null
  });
  const [piSupport, setPiSupport] = useState(1.0);
  const [crashCount, setCrashCount] = useState(0);
  const wsRef = useRef(null);

  // CSS variable projection
  useEffect(() => {
    const health = status.healthy ? 1 : 0.2;
    const traffic = Math.min(1, status.requests / 100);
    const glow = Math.max(health, traffic);

    document.documentElement.style.setProperty("--mx2lm-health", health);
    document.documentElement.style.setProperty("--mx2lm-uptime", status.uptime);
    document.documentElement.style.setProperty("--mx2lm-traffic", traffic);
    document.documentElement.style.setProperty("--mx2lm-glow", glow);
  }, [status]);

  const connectWS = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      wsRef.current = new WebSocket("ws://127.0.0.1:4141/ws/status");

      wsRef.current.onopen = () => {
        setStatus(s => ({ ...s, connected: true }));
      };

      wsRef.current.onmessage = (e) => {
        const data = JSON.parse(e.data);
        setStatus({
          connected: true,
          uptime: data.uptime || 0,
          requests: data.requests || 0,
          healthy: data.healthy || false,
          lastTick: data.ts || Date.now()
        });
      };

      wsRef.current.onclose = () => {
        setStatus(s => ({ ...s, connected: false, healthy: false }));
      };

      wsRef.current.onerror = () => {
        setStatus(s => ({ ...s, connected: false, healthy: false }));
      };
    } catch (err) {
      console.log("[MX2LM] WS connection failed (server not running locally)");
    }
  };

  const simulateCrash = () => {
    setCrashCount(c => c + 1);
    setPiSupport(p => p * 0.6);
  };

  const getRestartMode = () => {
    if (piSupport < 0.4) return { mode: "SUPPRESS", color: "bg-red-600" };
    if (piSupport < 0.7) return { mode: "ONCE", color: "bg-yellow-600" };
    if (piSupport < 0.9) return { mode: "BACKOFF", color: "bg-blue-600" };
    return { mode: "IMMEDIATE", color: "bg-green-600" };
  };

  const restartInfo = getRestartMode();

  return (
    <div className="space-y-4">
      {/* CSS Variables for Micronaut */}
      <style>{`
        :root {
          --mx2lm-health: ${status.healthy ? 1 : 0.2};
          --mx2lm-uptime: ${status.uptime};
          --mx2lm-traffic: ${Math.min(1, status.requests / 100)};
          --mx2lm-glow: ${Math.max(status.healthy ? 1 : 0.2, Math.min(1, status.requests / 100))};
        }
        
        .mx2lm-panel {
          padding: 12px 16px;
          border-radius: 12px;
          background: color-mix(in oklab, #0b1020, #0f172a 60%);
          box-shadow: 0 0 calc(20px * var(--mx2lm-glow)) rgba(80,200,255,0.35);
          transition: box-shadow .2s ease, opacity .2s ease;
          opacity: calc(.6 + .4 * var(--mx2lm-health));
        }
        
        .mx2lm-indicator {
          height: 6px;
          border-radius: 6px;
          background: linear-gradient(90deg,
            #22c55e calc(100% * var(--mx2lm-health)),
            #334155 0);
        }
      `}</style>

      {/* Server Status Panel */}
      <Card className="bg-slate-900 border-cyan-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              MX2LM Server Runtime
              <Badge className="bg-cyan-600 text-xs">SR-1</Badge>
            </div>
            <div className="flex items-center gap-2">
              {status.connected ? (
                <Badge className="bg-green-600 flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Connected
                </Badge>
              ) : (
                <Badge className="bg-slate-600 flex items-center gap-1">
                  <WifiOff className="w-3 h-3" /> Disconnected
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Micronaut Panel */}
          <div className="mx2lm-panel">
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-400 text-sm">Health</span>
              <span className={`text-sm font-mono ${status.healthy ? 'text-green-400' : 'text-red-400'}`}>
                {status.healthy ? 'HEALTHY' : 'UNHEALTHY'}
              </span>
            </div>
            <div className="mx2lm-indicator mb-4"></div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-cyan-400">{status.uptime}s</div>
                <div className="text-xs text-slate-500">Uptime</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{status.requests}</div>
                <div className="text-xs text-slate-500">Requests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {status.lastTick ? new Date(status.lastTick).toLocaleTimeString() : '--'}
                </div>
                <div className="text-xs text-slate-500">Last Tick</div>
              </div>
            </div>
          </div>

          {/* π Decay Visualization */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm">π Support (Decay Engine)</span>
              <Badge className={restartInfo.color}>{restartInfo.mode}</Badge>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                style={{ width: `${piSupport * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>π = {piSupport.toFixed(2)}</span>
              <span>Crashes: {crashCount}</span>
            </div>
          </div>

          {/* CLI Commands */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              CLI Commands
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={connectWS}>
                <Play className="w-3 h-3 mr-1" /> Connect WS
              </Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={simulateCrash}>
                <Square className="w-3 h-3 mr-1" /> Simulate Crash
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => { setPiSupport(1.0); setCrashCount(0); }}>
                <RotateCcw className="w-3 h-3 mr-1" /> Reset π
              </Button>
            </div>
            <div className="mt-3 font-mono text-xs text-slate-500">
              <div>$ mx2lm server start</div>
              <div>$ mx2lm server stop</div>
              <div>$ mx2lm server status</div>
            </div>
          </div>

          {/* Spec Reference */}
          <div className="text-xs text-slate-600 border-t border-slate-700 pt-3">
            <div className="flex justify-between">
              <span>MX2LM-SR-1.0.0 • localhost:4141 • GET only</span>
              <span>KUHUL π governed • XCFE legal • CM-1 auditable</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}