import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

export default function EnvironmentVariablesPanel({ envVars, onChange }) {
  const [vars, setVars] = useState(envVars || {});

  const handleAdd = () => {
    const newKey = `VAR_${Date.now()}`;
    const updated = { ...vars, [newKey]: '' };
    setVars(updated);
    onChange?.(updated);
  };

  const handleRemove = (key) => {
    const updated = { ...vars };
    delete updated[key];
    setVars(updated);
    onChange?.(updated);
  };

  const handleChange = (key, value, isKey = false) => {
    const updated = { ...vars };
    
    if (isKey && key !== value) {
      delete updated[key];
      updated[value] = vars[key];
    } else {
      updated[key] = value;
    }
    
    setVars(updated);
    onChange?.(updated);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-cyan-400">Environment Variables</h4>
        <Button
          size="sm"
          onClick={handleAdd}
          className="bg-cyan-600 hover:bg-cyan-700 text-black font-bold h-7"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {Object.entries(vars).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <Input
              value={key}
              onChange={(e) => handleChange(key, e.target.value, true)}
              placeholder="Variable name"
              className="bg-black border-slate-700 text-cyan-400 placeholder:text-gray-600 text-xs"
            />
            <Input
              value={value}
              onChange={(e) => handleChange(key, e.target.value, false)}
              placeholder="Value"
              className="bg-black border-slate-700 text-cyan-400 placeholder:text-gray-600 text-xs flex-1"
              type="password"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRemove(key)}
              className="border-slate-600 text-red-400 hover:text-red-300 h-9 w-9 p-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {Object.keys(vars).length === 0 && (
        <p className="text-xs text-gray-500 text-center py-2">No variables set</p>
      )}
    </div>
  );
}