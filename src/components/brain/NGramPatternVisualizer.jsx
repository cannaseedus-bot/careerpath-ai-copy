import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, TrendingUp } from "lucide-react";

export default function NGramPatternVisualizer({ ngramData }) {
  if (!ngramData) return null;

  const { total, unigrams, bigrams, trigrams } = ngramData;

  // Calculate percentages
  const unigramPct = total > 0 ? (unigrams / total) * 100 : 0;
  const bigramPct = total > 0 ? (bigrams / total) * 100 : 0;
  const trigramPct = total > 0 ? (trigrams / total) * 100 : 0;

  return (
    <Card className="bg-slate-900 border-2 border-green-400">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-bold text-green-400">N-GRAM PATTERNS</h3>
          <Badge 
            className="bg-green-600"
            style={{ opacity: 'var(--inference-efficiency, 1)' }}
          >
            {total} TOTAL
          </Badge>
        </div>

        {/* Distribution Chart */}
        <div className="bg-black p-4 rounded border border-green-400 mb-4">
          <div className="text-xs text-gray-400 mb-3">Pattern Distribution</div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-400">Unigrams</span>
                <span className="text-green-400">{unigrams} ({unigramPct.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${unigramPct}%`,
                    opacity: 'var(--inference-efficiency, 1)'
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-yellow-400">Bigrams</span>
                <span className="text-yellow-400">{bigrams} ({bigramPct.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${bigramPct}%`,
                    opacity: 'var(--inference-efficiency, 1)'
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-cyan-400">Trigrams</span>
                <span className="text-cyan-400">{trigrams} ({trigramPct.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${trigramPct}%`,
                    opacity: 'var(--inference-efficiency, 1)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pattern Network */}
        <div className="bg-black p-4 rounded border border-green-400">
          <div className="text-xs text-gray-400 mb-3">Pattern Network Topology</div>
          <div className="relative h-32">
            {/* Central node */}
            <div
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-green-400 rounded-full border-4 border-green-600 flex items-center justify-center"
              style={{
                boxShadow: '0 0 20px rgba(74, 222, 128, 0.5)',
                animation: 'pulse 2s infinite'
              }}
            >
              <TrendingUp className="w-6 h-6 text-black" />
            </div>

            {/* Unigram nodes */}
            {[0, 1, 2].map((i) => (
              <div
                key={`uni-${i}`}
                className="absolute w-6 h-6 bg-green-600 rounded-full border-2 border-green-400"
                style={{
                  left: `${20 + i * 30}%`,
                  top: '10%',
                  opacity: 'var(--inference-efficiency, 0.8)'
                }}
              />
            ))}

            {/* Bigram nodes */}
            {[0, 1].map((i) => (
              <div
                key={`bi-${i}`}
                className="absolute w-6 h-6 bg-yellow-600 rounded-full border-2 border-yellow-400"
                style={{
                  left: `${15 + i * 70}%`,
                  top: '80%',
                  opacity: 'var(--inference-efficiency, 0.8)'
                }}
              />
            ))}

            {/* Trigram node */}
            <div
              className="absolute w-6 h-6 bg-cyan-600 rounded-full border-2 border-cyan-400"
              style={{
                right: '10%',
                top: '50%',
                opacity: 'var(--inference-efficiency, 0.8)'
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}