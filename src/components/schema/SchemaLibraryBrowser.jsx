import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, BookOpen, CheckCircle, AlertTriangle, XCircle, Download, Upload, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SchemaLibraryBrowser() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSchema, setSelectedSchema] = useState(null);
    const queryClient = useQueryClient();

    const { data: schemas = [], isLoading } = useQuery({
        queryKey: ['schema-library', searchQuery],
        queryFn: () => {
            if (searchQuery) {
                return base44.entities.SchemaLibrary.filter({ 
                    name: { $regex: searchQuery, $options: 'i' }
                }, '-created_date', 50);
            }
            return base44.entities.SchemaLibrary.list('-created_date', 50);
        }
    });

    const validateMutation = useMutation({
        mutationFn: async (schemaId) => {
            const schema = schemas.find(s => s.id === schemaId);
            const response = await base44.functions.invoke('validate-schema', {
                schema: schema.schema_content,
                checkLibrary: true
            });
            return { schemaId, validation: response.data.validation };
        },
        onSuccess: ({ schemaId, validation }) => {
            toast.success(`Validation: ${validation.status}`);
            queryClient.invalidateQueries({ queryKey: ['schema-library'] });
        }
    });

    const exportSchema = (schema) => {
        const dataStr = JSON.stringify(schema.schema_content, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${schema.name.replace(/\s+/g, '_')}_v${schema.version}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Schema exported');
    };

    const copySchema = (schema) => {
        navigator.clipboard.writeText(JSON.stringify(schema.schema_content, null, 2));
        toast.success('Schema copied to clipboard');
    };

    const getValidationIcon = (status) => {
        const icons = {
            valid: <CheckCircle className="w-4 h-4 text-green-400" />,
            warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
            error: <XCircle className="w-4 h-4 text-red-400" />
        };
        return icons[status] || icons.valid;
    };

    return (
        <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-cyan-400" />
                        <CardTitle className="text-white">XJSON Schema Library</CardTitle>
                    </div>
                    <Badge className="bg-purple-600">Centralized</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search schemas by name, type, or tags..."
                        className="pl-10 bg-slate-950 border-slate-600 text-white"
                    />
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="bg-slate-950">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="entity">Entities</TabsTrigger>
                        <TabsTrigger value="tensor">Tensors</TabsTrigger>
                        <TabsTrigger value="bot_config">Bots</TabsTrigger>
                        <TabsTrigger value="micronaut">Micronauts</TabsTrigger>
                    </TabsList>

                    {['all', 'entity', 'tensor', 'bot_config', 'micronaut'].map(type => (
                        <TabsContent key={type} value={type} className="space-y-2">
                            {isLoading ? (
                                <div className="text-slate-400 text-center py-8">Loading schemas...</div>
                            ) : schemas.filter(s => type === 'all' || s.schema_type === type).length === 0 ? (
                                <div className="text-slate-400 text-center py-8">No schemas found</div>
                            ) : (
                                schemas.filter(s => type === 'all' || s.schema_type === type).map((schema) => (
                                    <div 
                                        key={schema.id}
                                        className={`bg-slate-950 border rounded-lg p-3 cursor-pointer transition-all ${
                                            selectedSchema?.id === schema.id ? 'border-cyan-500' : 'border-slate-800'
                                        }`}
                                        onClick={() => setSelectedSchema(schema)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {getValidationIcon(schema.validation_status)}
                                                    <span className="text-white font-semibold">{schema.name}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        v{schema.version}
                                                    </Badge>
                                                    <Badge className="bg-purple-900 text-xs">
                                                        {schema.schema_type}
                                                    </Badge>
                                                    {schema.is_public && (
                                                        <Badge className="bg-green-900 text-xs">
                                                            <Share2 className="w-3 h-3 mr-1" />
                                                            Public
                                                        </Badge>
                                                    )}
                                                </div>
                                                {schema.description && (
                                                    <p className="text-xs text-slate-400 mb-1">{schema.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span>Used {schema.usage_count} times</span>
                                                    {schema.tags && schema.tags.length > 0 && (
                                                        <span>• Tags: {schema.tags.join(', ')}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        validateMutation.mutate(schema.id);
                                                    }}
                                                    title="Validate"
                                                >
                                                    <CheckCircle className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        copySchema(schema);
                                                    }}
                                                    title="Copy"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        exportSchema(schema);
                                                    }}
                                                    title="Export"
                                                >
                                                    <Download className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        {selectedSchema?.id === schema.id && (
                                            <div className="mt-3 pt-3 border-t border-slate-800">
                                                <pre className="bg-slate-900 p-3 rounded text-xs text-slate-300 overflow-x-auto max-h-64">
                                                    {JSON.stringify(schema.schema_content, null, 2)}
                                                </pre>
                                                {schema.validation_notes && (
                                                    <div className="mt-2 text-xs text-slate-400">
                                                        {schema.validation_notes}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}