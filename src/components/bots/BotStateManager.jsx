import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Activity, AlertTriangle, CheckCircle, Pause, Play, RotateCcw, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BotStateManager({ botId }) {
    const [selectedState, setSelectedState] = useState(null);
    const queryClient = useQueryClient();

    const { data: states = [], isLoading } = useQuery({
        queryKey: ['bot-states', botId],
        queryFn: () => base44.entities.BotState.filter({ bot_id: botId }, '-created_date', 20),
        enabled: !!botId
    });

    const recoverMutation = useMutation({
        mutationFn: async (stateId) => {
            const response = await base44.functions.invoke('bot-error-recovery', {
                botStateId: stateId
            });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['bot-states'] });
            toast.success(`Recovery strategy: ${data.recommendation.strategy}`);
        }
    });

    const getStatusColor = (status) => {
        const colors = {
            running: 'bg-green-600',
            paused: 'bg-yellow-600',
            error: 'bg-red-600',
            recovering: 'bg-blue-600',
            completed: 'bg-slate-600'
        };
        return colors[status] || 'bg-slate-600';
    };

    const getPhaseIcon = (phase) => {
        const icons = {
            '@Pop': '🔵',
            '@Wo': '🟢',
            '@Sek': '🟡',
            '@Collapse': '🔴'
        };
        return icons[phase] || '⚪';
    };

    return (
        <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        <CardTitle className="text-white">Workflow State Manager</CardTitle>
                    </div>
                    <Badge className="bg-purple-600">XJSON Runtime</Badge>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-slate-400 text-center py-8">Loading states...</div>
                ) : states.length === 0 ? (
                    <div className="text-slate-400 text-center py-8">No active workflows</div>
                ) : (
                    <div className="space-y-3">
                        {states.map((state) => (
                            <div 
                                key={state.id}
                                className={`bg-slate-950 border rounded-lg p-4 cursor-pointer transition-all ${
                                    selectedState?.id === state.id ? 'border-cyan-500' : 'border-slate-800'
                                }`}
                                onClick={() => setSelectedState(state)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xl">{getPhaseIcon(state.current_phase)}</span>
                                            <Badge className={getStatusColor(state.status)}>
                                                {state.status}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {state.current_phase}
                                            </Badge>
                                            {state.error_count > 0 && (
                                                <Badge className="bg-red-900 text-xs">
                                                    {state.error_count} errors
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-slate-300 font-mono">
                                            Workflow: {state.workflow_id}
                                        </div>
                                        {state.recovery_strategy && (
                                            <div className="text-xs text-blue-400 mt-1">
                                                Recovery: {state.recovery_strategy}
                                            </div>
                                        )}
                                    </div>
                                    {state.status === 'error' && (
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                recoverMutation.mutate(state.id);
                                            }}
                                            disabled={recoverMutation.isPending}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            <RotateCcw className="w-3 h-3 mr-1" />
                                            Recover
                                        </Button>
                                    )}
                                </div>

                                {selectedState?.id === state.id && state.last_error && (
                                    <div className="mt-3 pt-3 border-t border-slate-800">
                                        <div className="text-xs text-red-400 mb-2">Last Error:</div>
                                        <pre className="bg-slate-900 p-2 rounded text-xs text-slate-300 overflow-x-auto">
                                            {JSON.stringify(state.last_error, null, 2)}
                                        </pre>
                                        {state.checkpoint_data && (
                                            <div className="mt-2">
                                                <div className="text-xs text-slate-500">Recovery Checkpoint Available</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}