import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, GitBranch, Zap, Copy } from "lucide-react";
import { toast } from "sonner";

export default function TensorSchemaVisualizer({ schema, onEdit }) {
  if (!schema) {
    return (
      <div className="border-2 border-gray-700 bg-black p-4 text-center text-gray-500">
        No tensor schema defined. Generate one using AI Assistant.
      </div>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    toast.success("Schema copied to clipboard");
  };

  return (
    <div className="border-2 border-purple-400 bg-black">
      <div className="bg-purple-400 text-black px-4 py-1 flex justify-between items-center">
        <span className="font-bold">SVG-3D TENSOR SCHEMA</span>
        <Button
          onClick={copyToClipboard}
          className="bg-black text-purple-400 hover:bg-gray-900 h-6 px-2 text-xs"
        >
          <Copy className="w-3 h-3" />
        </Button>
      </div>

      <div className="p-4 space-y-3">
        {/* Tensor Properties */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900 p-2 rounded">
            <div className="text-xs text-gray-500">RANK</div>
            <div className="text-purple-400 font-bold text-lg">
              {schema.tensor_rank || 'N/A'}
            </div>
          </div>
          <div className="bg-slate-900 p-2 rounded col-span-2">
            <div className="text-xs text-gray-500">SHAPE</div>
            <div className="text-purple-400 font-mono text-sm">
              [{(schema.tensor_shape || []).join(', ')}]
            </div>
          </div>
        </div>

        {/* Attributes */}
        {schema.attributes && (
          <div className="bg-slate-900 p-3 rounded">
            <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
              <GitBranch className="w-3 h-3" />
              SVG ATTRIBUTES
            </div>
            <div className="space-y-1 text-xs font-mono">
              {Object.entries(schema.attributes).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-cyan-400">{key}:</span>
                  <span className="text-green-400">"{value}"</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invariants */}
        {schema.invariants && schema.invariants.length > 0 && (
          <div className="bg-slate-900 p-3 rounded">
            <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
              <Zap className="w-3 h-3" />
              INVARIANTS
            </div>
            <div className="space-y-1">
              {schema.invariants.map((inv, idx) => (
                <Badge key={idx} className="bg-yellow-600 text-black text-xs mr-1">
                  {inv}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Compression Config */}
        {schema.compression_hints && (
          <div className="bg-slate-900 p-3 rounded">
            <div className="text-xs text-gray-500 mb-2 flex items-center gap-2">
              <Layers className="w-3 h-3" />
              SCXQ2 COMPRESSION
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(schema.compression_hints.lanes || {}).map(([lane, config]) => (
                <div key={lane} className="flex justify-between">
                  <span className="text-gray-400">{lane}:</span>
                  <span className="text-purple-400">{config.priority}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-gray-600 border-t border-gray-800 pt-2">
          <div>Version: {schema.svg_3d_version || '1.0'}</div>
          <div>Generated: {schema.generated_at ? new Date(schema.generated_at).toLocaleString() : 'N/A'}</div>
          <div>Bot Type: {schema.bot_type || 'Unknown'}</div>
        </div>
      </div>
    </div>
  );
}