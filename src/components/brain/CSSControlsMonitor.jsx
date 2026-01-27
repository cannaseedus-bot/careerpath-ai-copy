import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Cpu } from "lucide-react";

export default function CSSControlsMonitor({ cssControls }) {
  const [activeVariables, setActiveVariables] = useState({});

  useEffect(() => {
    if (!cssControls?.variables) return;

    // Apply CSS variables to root
    const root = document.documentElement;
    Object.entries(cssControls.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    setActiveVariables(cssControls.variables);

    // Apply animations if provided
    if (cssControls.animations) {
      const styleEl = document.getElementById('scxq2-animations') || document.createElement('style');
      styleEl.id = 'scxq2-animations';
      styleEl.textContent = cssControls.animations.join('\n');
      if (!styleEl.parentNode) {
        document.head.appendChild(styleEl);
      }
    }

    // Apply rules if provided
    if (cssControls.rules) {
      const styleEl = document.getElementById('scxq2-rules') || document.createElement('style');
      styleEl.id = 'scxq2-rules';
      styleEl.textContent = cssControls.rules.join('\n');
      if (!styleEl.parentNode) {
        document.head.appendChild(styleEl);
      }
    }
  }, [cssControls]);

  if (!cssControls) return null;

  return (
    <Card className="bg-slate-900 border-2 border-cyan-400">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-bold text-cyan-400">SCXQ2 CSS CONTROLS</h3>
          <Badge className="bg-green-600 animate-pulse">LIVE</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(activeVariables).map(([key, value]) => (
            <div key={key} className="bg-black p-3 rounded border border-cyan-400">
              <div className="text-xs text-gray-400 mb-1">{key}</div>
              <div className="text-cyan-400 font-mono text-sm font-bold">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-black p-3 rounded border border-cyan-400">
          <div className="text-xs text-gray-400 mb-2">Active Compression State</div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-cyan-400 text-sm">
              CSS Variables Bound to DOM
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}