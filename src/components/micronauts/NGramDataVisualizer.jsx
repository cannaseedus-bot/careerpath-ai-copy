import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Database, Zap, Layers, Activity } from "lucide-react";
import { toast } from "sonner";

export default function NGramDataVisualizer() {
  const [query, setQuery] = useState(`{
  Bot {
    name
    bot_type
    status
  }
  Micronaut {
    name
    type
    status
  }
}`);
  const [ngramData, setNgramData] = useState(null);
  const [executedData, setExecutedData] = useState(null);

  const executeBrainMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Map query to n-gram data
      const { data: mapped } = await base44.functions.invoke('ngram-data-map', {
        query,
        variables: {},
        operation_name: 'BrainQuery'
      });
      setNgramData(mapped);

      // Step 2: Execute brain query
      const { data: executed } = await base44.functions.invoke('brain-data-executor', {
        brain_query: query,
        execution_context: {
          operation_name: 'BrainQuery',
          persistent: false
        },
        session_data: {
          session_id: Date.now()
        }
      });
      setExecutedData(executed);

      return executed;
    },
    onSuccess: () => {
      toast.success("Brain query executed with compressed n-gram data");
    }
  });

  return (
    <div className="space-y-4">
      <div className="border-2 border-cyan-400 bg-black">
        <div className="bg-cyan-400 text-black px-4 py-1 font-bold flex items-center gap-2">
          <Database className="w-4 h-4" />
          BRAIN DATA EXECUTOR (N-Gram GraphQL)
        </div>
        <div className="p-4 space-y-3">
          <div className="text-xs text-gray-400 mb-2">
            GraphQL-style query mapped to compressed n-gram execution
          </div>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-slate-900 text-green-400 font-mono text-xs h-40"
          />
          <Button
            onClick={() => executeBrainMutation.mutate()}
            disabled={executeBrainMutation.isPending}
            className="w-full bg-cyan-400 text-black hover:bg-cyan-300"
          >
            <Zap className="w-4 h-4 mr-2" />
            {executeBrainMutation.isPending ? 'EXECUTING...' : 'EXECUTE BRAIN QUERY'}
          </Button>
        </div>
      </div>

      {ngramData && (
        <div className="border-2 border-purple-400 bg-black">
          <div className="bg-purple-400 text-black px-4 py-1 font-bold flex items-center gap-2">
            <Layers className="w-4 h-4" />
            COMPRESSED N-GRAM MAP
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {Object.entries(ngramData).map(([entity, data]) => (
                <div key={entity} className="bg-slate-900 p-3 rounded border border-purple-400">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-purple-400 font-bold">{entity}</span>
                    <div className="flex gap-2">
                      <Badge className="bg-purple-600 text-xs">
                        {data.fold || 'N/A'}
                      </Badge>
                      {data.execution_ready && (
                        <Badge className="bg-green-600 text-xs">EXEC READY</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs space-y-1">
                    {data.original_count !== undefined && (
                      <div className="text-gray-400">
                        Original count: <span className="text-cyan-400">{data.original_count}</span>
                      </div>
                    )}
                    {data.compressed?.dictionary && (
                      <div className="text-gray-400">
                        Patterns: <span className="text-yellow-400">
                          {Object.keys(data.compressed.dictionary).length}
                        </span>
                      </div>
                    )}
                    {data.decompressor && (
                      <div className="text-gray-400">
                        Decompressor: <span className="text-green-400">{data.decompressor}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {executedData && (
        <div className="border-2 border-green-400 bg-black">
          <div className="bg-green-400 text-black px-4 py-1 font-bold flex items-center gap-2">
            <Activity className="w-4 h-4" />
            EXECUTION RESULTS
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <div className="flex gap-2 mb-3">
                <Badge className="bg-green-600">Mode: {executedData.mode}</Badge>
                <Badge className="bg-purple-600">Compressed: {executedData.compressed?.toString()}</Badge>
                <Badge className="bg-cyan-600">{executedData.fold}</Badge>
              </div>
              {executedData.data && Object.entries(executedData.data).map(([entity, result]) => (
                <div key={entity} className="bg-slate-900 p-3 rounded border border-green-400">
                  <div className="text-green-400 font-bold mb-2">{entity}</div>
                  <div className="text-xs space-y-1">
                    {result.ephemeral !== undefined && (
                      <div className="text-gray-400">
                        Ephemeral: <span className="text-yellow-400">{result.ephemeral.toString()}</span>
                      </div>
                    )}
                    {result.data && (
                      <div className="text-gray-400">
                        Records: <span className="text-cyan-400">{result.data.length || 0}</span>
                      </div>
                    )}
                    {result.execution_handle && (
                      <div className="text-gray-400">
                        Handle: <span className="text-purple-400">{result.execution_handle}</span>
                      </div>
                    )}
                    {result.recall_method && (
                      <div className="text-gray-400">
                        Recall: <span className="text-orange-400">{result.recall_method}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-600 space-y-1">
        <div>✓ Brains replace traditional database queries</div>
        <div>✓ Data compressed to n-grams for AI recall</div>
        <div>✓ Execution-ready without separate DB system</div>
        <div>✓ Session-based or persistent compression modes</div>
      </div>
    </div>
  );
}