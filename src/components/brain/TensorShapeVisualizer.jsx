import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Box, Grid3x3 } from "lucide-react";

export default function TensorShapeVisualizer({ tensorData }) {
  if (!tensorData) return null;

  const { shape, rank, binary } = tensorData;

  // Calculate total elements
  const totalElements = shape.reduce((a, b) => a * b, 1);

  // Generate visual grid representation
  const renderShape = () => {
    if (rank === 1) {
      return (
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: Math.min(shape[0], 20) }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 bg-purple-600 border border-purple-400"
              style={{
                opacity: `var(--compression-ratio, 0.8)`
              }}
            />
          ))}
          {shape[0] > 20 && <span className="text-gray-400 text-xs">...</span>}
        </div>
      );
    }

    if (rank === 2) {
      const rows = Math.min(shape[0], 8);
      const cols = Math.min(shape[1], 8);
      return (
        <div className="flex flex-col gap-1">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-1">
              {Array.from({ length: cols }).map((_, j) => (
                <div
                  key={j}
                  className="w-6 h-6 bg-purple-600 border border-purple-400"
                  style={{
                    opacity: `calc(var(--compression-ratio, 0.8) * ${1 - (i + j) / (rows + cols)})`
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      );
    }

    // 3D tensor visualization (simplified)
    if (rank === 3) {
      return (
        <div className="relative w-full h-48">
          {Array.from({ length: Math.min(shape[0], 5) }).map((_, layer) => (
            <div
              key={layer}
              className="absolute bg-purple-600 border-2 border-purple-400"
              style={{
                width: `${80 - layer * 10}px`,
                height: `${80 - layer * 10}px`,
                left: `${20 + layer * 15}px`,
                top: `${20 + layer * 15}px`,
                opacity: `calc(var(--compression-ratio, 0.8) * ${1 - layer * 0.15})`
              }}
            >
              <div className="text-xs text-white p-1">L{layer}</div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-gray-400 text-sm">
        {rank}D tensor visualization (rank &gt; 3)
      </div>
    );
  };

  return (
    <Card className="bg-slate-900 border-2 border-purple-400">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Box className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-purple-400">BINARY TENSOR SHAPE</h3>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black p-3 rounded border border-purple-400 text-center">
            <div className="text-xs text-gray-400">Shape</div>
            <div className="text-purple-400 font-bold" style={{ fontSize: 'var(--processing-time, 16px)' }}>
              {shape.join(' × ')}
            </div>
          </div>
          <div className="bg-black p-3 rounded border border-purple-400 text-center">
            <div className="text-xs text-gray-400">Rank</div>
            <div className="text-purple-400 font-bold text-xl">{rank}D</div>
          </div>
          <div className="bg-black p-3 rounded border border-purple-400 text-center">
            <div className="text-xs text-gray-400">Elements</div>
            <div className="text-purple-400 font-bold text-xl">{totalElements}</div>
          </div>
        </div>

        <div className="bg-black p-4 rounded border border-purple-400">
          <div className="text-xs text-gray-400 mb-3">Visual Representation</div>
          {renderShape()}
        </div>

        {binary && (
          <div className="mt-3">
            <Badge className="bg-purple-600">BINARY TENSOR</Badge>
          </div>
        )}
      </div>
    </Card>
  );
}