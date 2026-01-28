import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Shield, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function CM1AuditPanel() {
    const [expandedId, setExpandedId] = useState(null);
    const [showSuggestDialog, setShowSuggestDialog] = useState(false);
    const [suggestion, setSuggestion] = useState({
        cmdlet: '',
        reason: '',
        use_case: ''
    });

    const queryClient = useQueryClient();

    const { data: audits = [], isLoading } = useQuery({
        queryKey: ['powershell-audits'],
        queryFn: () => base44.entities.PowerShellAudit.list('-created_date', 50)
    });

    const suggestMutation = useMutation({
        mutationFn: (data) => base44.entities.PowerShellSuggestion.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suggestions'] });
            setShowSuggestDialog(false);
            setSuggestion({ cmdlet: '', reason: '', use_case: '' });
            toast.success('Cmdlet suggestion submitted for review');
        }
    });

    const handleSuggest = () => {
        if (!suggestion.cmdlet.trim()) {
            toast.error('Cmdlet name required');
            return;
        }
        suggestMutation.mutate(suggestion);
    };

    return (
        <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-blue-400" />
                        <CardTitle className="text-white">CM-1 Audit Trail</CardTitle>
                        <Badge className="bg-green-600">XCFE-PS-ENVELOPE</Badge>
                    </div>
                    <Dialog open={showSuggestDialog} onOpenChange={setShowSuggestDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Suggest Cmdlet
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-700">
                            <DialogHeader>
                                <DialogTitle className="text-white">Suggest New Cmdlet</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-slate-300 mb-2 block">
                                        PowerShell Cmdlet
                                    </label>
                                    <Input
                                        value={suggestion.cmdlet}
                                        onChange={(e) => setSuggestion({...suggestion, cmdlet: e.target.value})}
                                        placeholder="e.g., Get-NetRoute"
                                        className="bg-slate-950 border-slate-600 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-300 mb-2 block">
                                        Reason for Allowlist
                                    </label>
                                    <Textarea
                                        value={suggestion.reason}
                                        onChange={(e) => setSuggestion({...suggestion, reason: e.target.value})}
                                        placeholder="Why is this cmdlet useful and safe?"
                                        className="bg-slate-950 border-slate-600 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-300 mb-2 block">
                                        Use Case Example
                                    </label>
                                    <Textarea
                                        value={suggestion.use_case}
                                        onChange={(e) => setSuggestion({...suggestion, use_case: e.target.value})}
                                        placeholder="Example scenario where this would be helpful"
                                        className="bg-slate-950 border-slate-600 text-white"
                                    />
                                </div>
                                <Button 
                                    onClick={handleSuggest}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={suggestMutation.isPending}
                                >
                                    Submit Suggestion
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-slate-400 text-center py-8">Loading audit trail...</div>
                ) : audits.length === 0 ? (
                    <div className="text-slate-400 text-center py-8">
                        No PowerShell commands executed yet
                        <p className="text-xs text-slate-500 mt-2">
                            Execute a governed PowerShell command to see CM-1 audit entries
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {audits.map((audit) => (
                            <div 
                                key={audit.id}
                                className="bg-slate-950 border border-slate-800 rounded-lg p-3"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {audit.legal ? (
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-400" />
                                            )}
                                            <span className={`text-sm font-semibold ${audit.legal ? 'text-green-400' : 'text-red-400'}`}>
                                                {audit.legal ? 'APPROVED' : 'BLOCKED'}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                {new Date(audit.created_date).toLocaleString()}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-slate-300 mb-1">
                                            <span className="text-slate-500">Intent:</span> {audit.intent}
                                        </div>
                                        <div className="text-sm font-mono text-cyan-400">
                                            <span className="text-slate-500">Command:</span> {audit.lowered_command}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setExpandedId(expandedId === audit.id ? null : audit.id)}
                                    >
                                        {expandedId === audit.id ? (
                                            <ChevronUp className="w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>

                                {expandedId === audit.id && audit.cm1_metadata && (
                                    <div className="mt-3 pt-3 border-t border-slate-800">
                                        <div className="text-xs text-slate-400 mb-2">CM-1 Envelope Metadata:</div>
                                        <pre className="bg-slate-900 p-3 rounded text-xs text-slate-300 overflow-x-auto">
                                            {JSON.stringify(audit.cm1_metadata, null, 2)}
                                        </pre>
                                        {audit.working_dir && (
                                            <div className="mt-2 text-xs text-slate-400">
                                                Working Dir: <code className="text-cyan-400">{audit.working_dir}</code>
                                            </div>
                                        )}
                                        <div className="mt-2 text-xs text-slate-500">
                                            User: {audit.created_by}
                                        </div>
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