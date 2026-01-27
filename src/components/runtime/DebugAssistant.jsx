import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Zap, Check, Copy, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DebugAssistant({ lastError, code, onApplyFix }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!lastError || !lastError.trim()) {
      setAnalysis(null);
      return;
    }

    const analyzeError = async () => {
      setLoading(true);
      try {
        const result = await base44.functions.invoke('debug-analyzer', {
          errorMessage: lastError,
          code: code || ''
        });

        if (result.success) {
          setAnalysis(result.analysis);
          setExpanded(true);
        }
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeError();
  }, [lastError, code]);

  if (!lastError && !analysis) return null;

  const severityColor = {
    critical: 'border-l-red-500 bg-red-900/20',
    major: 'border-l-yellow-500 bg-yellow-900/20',
    minor: 'border-l-blue-500 bg-blue-900/20'
  };

  const severityBadge = {
    critical: 'bg-red-900 text-red-200',
    major: 'bg-yellow-900 text-yellow-200',
    minor: 'bg-blue-900 text-blue-200'
  };

  return (
    <div className={`border-l-4 rounded p-3 ${severityColor[analysis?.severity || 'major']}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-2 cursor-pointer hover:opacity-80"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-200">Debug Error</span>
            {analysis && (
              <span className={`text-xs px-2 py-0.5 rounded ${severityBadge[analysis.severity]}`}>
                {analysis.severity}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 line-clamp-2">{lastError}</p>
        </div>
      </button>

      {expanded && analysis && (
        <div className="mt-3 space-y-2 text-xs">
          <div>
            <p className="text-gray-300 font-semibold mb-1">🔍 Root Cause:</p>
            <p className="text-gray-400">{analysis.root_cause}</p>
          </div>

          <div>
            <p className="text-gray-300 font-semibold mb-1">💡 Fix:</p>
            <p className="text-gray-400">{analysis.suggested_fix}</p>
          </div>

          {analysis.fixed_code && (
            <div className="bg-slate-900/50 rounded p-2 mt-2">
              <p className="text-gray-400 mb-1">Code:</p>
              <pre className="text-cyan-300 overflow-x-auto max-h-24 text-xs">
                {analysis.fixed_code}
              </pre>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  className="h-6 text-xs bg-cyan-600 hover:bg-cyan-700"
                  onClick={() => {
                    navigator.clipboard.writeText(analysis.fixed_code);
                    toast.success('Code copied');
                  }}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                {onApplyFix && (
                  <Button
                    size="sm"
                    className="h-6 text-xs bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      onApplyFix(analysis.fixed_code);
                      toast.success('Fix applied');
                    }}
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Apply Fix
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-gray-700">
            <p className="text-gray-300 font-semibold mb-1">📌 Prevention:</p>
            <p className="text-gray-400">{analysis.prevention_tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}