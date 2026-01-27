import React from "react";
import { Terminal, Settings, Database, Cpu } from "lucide-react";

const widgets = [
  { id: "env-vars", label: "Environment", icon: Database, color: "text-yellow-400" },
  { id: "hf-models", label: "Models", icon: Cpu, color: "text-blue-400" },
  { id: "remote-config", label: "Runtime", icon: Settings, color: "text-green-400" }
];

export default function WidgetTray({ activeWidget, onWidgetClick }) {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 mb-4">
      <div className="bg-slate-900 border-2 border-cyan-400 rounded-full px-2 py-2 flex gap-2 shadow-2xl backdrop-blur-sm bg-slate-900/90">
        <Terminal className="w-6 h-6 text-cyan-400 mx-2" />
        {widgets.map((widget) => {
          const Icon = widget.icon;
          const isActive = activeWidget === widget.id;
          return (
            <button
              key={widget.id}
              onClick={() => onWidgetClick(widget.id)}
              title={widget.label}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? `${widget.color} bg-slate-800 ring-2 ring-cyan-400 scale-110`
                  : "bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}