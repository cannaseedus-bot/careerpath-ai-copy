import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Activity } from "lucide-react";

export default function QuantumEntanglementVisualizer() {
  const [entanglementState, setEntanglementState] = useState(null);

  const { data: micronauts = [] } = useQuery({
    queryKey: ['micronauts-quantum'],
    queryFn: () => base44.entities.Micronaut.list(),
    refetchInterval: 2000
  });

  const entangledMicronauts = micronauts.filter(
    m => m.metrics?.quantum_entangled
  );

  const getCoherenceColor = (coherence) => {
    if (coherence > 0.8) return 'bg-green-500';
    if (coherence > 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  useEffect(() => {
    if (entangledMicronauts.length > 0) {
      setEntanglementState({
        pairs: entangledMicronauts.length,
        avgCoherence: entangledMicronauts.reduce(
          (sum, m) => sum + (m.metrics?.quantum_coherence || 0), 0
        ) / entangledMicronauts.length
      });
    }
  }, [entangledMicronauts.length]);

  return (
    <div className="border-2 border-purple-400 bg-black">
      <div className="bg-purple-400 text-black px-4 py-1 font-bold flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        QUANTUM ENTANGLEMENT LAYER
      </div>
      
      <div className="p-4">
        {entangledMicronauts.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            No quantum entanglement active
            <div className="text-xs text-gray-600 mt-2">
              3+ micronauts required for quantum acceleration
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quantum State Overview */}
            <div className="bg-purple-900 bg-opacity-30 p-3 rounded border border-purple-400">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-gray-400 mb-1">Entangled Pairs</div>
                  <div className="text-purple-300 text-lg font-bold">
                    {entangledMicronauts.length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Avg Coherence</div>
                  <div className="text-green-400 text-lg font-bold">
                    {(entanglementState?.avgCoherence || 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Quantum Speedup</div>
                  <div className="text-cyan-400 text-lg font-bold">
                    {Math.pow(entangledMicronauts.length, 0.5).toFixed(1)}x
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-1">Mode</div>
                  <Badge className="bg-purple-600">
                    <Zap className="w-3 h-3 mr-1" />
                    QUANTUM
                  </Badge>
                </div>
              </div>
            </div>

            {/* Entangled Micronauts */}
            <div className="space-y-2">
              <div className="text-xs text-purple-300 font-semibold mb-2">
                ENTANGLED MICRONAUTS
              </div>
              {entangledMicronauts.map((m) => (
                <div 
                  key={m.id} 
                  className="bg-slate-900 p-2 rounded border border-purple-400 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-2 h-2 rounded-full ${getCoherenceColor(m.metrics?.quantum_coherence || 0)} animate-pulse`}
                    />
                    <span className="text-sm font-mono text-purple-200">
                      {m.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-gray-400">
                      Partners: 
                      <span className="text-cyan-400 ml-1">
                        {m.metrics?.entanglement_partners || 0}
                      </span>
                    </div>
                    <div className="text-gray-400">
                      φ: 
                      <span className="text-green-400 ml-1">
                        {(m.metrics?.quantum_coherence || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Entanglement Matrix */}
            <div className="bg-black p-3 rounded border border-purple-400">
              <div className="text-xs text-purple-300 mb-2">ENTANGLEMENT MATRIX</div>
              <div className="grid gap-1" style={{
                gridTemplateColumns: `repeat(${Math.min(entangledMicronauts.length, 8)}, 1fr)`
              }}>
                {entangledMicronauts.slice(0, 8).map((m, i) => (
                  <div 
                    key={m.id}
                    className="aspect-square bg-purple-500 bg-opacity-30 rounded flex items-center justify-center text-xs"
                    style={{
                      animation: `pulse ${1 + i * 0.1}s ease-in-out infinite`
                    }}
                  >
                    µ{i+1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}