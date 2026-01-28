import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Download, Check } from 'lucide-react';

export default function IDECard({ integration, onConfigure, onDownload }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-600';
            case 'configured': return 'bg-blue-600';
            case 'available': return 'bg-slate-600';
            default: return 'bg-slate-600';
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-700 hover:border-slate-600 transition-colors">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {integration.icon && (
                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                                {integration.icon}
                            </div>
                        )}
                        <div>
                            <CardTitle className="text-white text-lg">{integration.name}</CardTitle>
                            <p className="text-xs text-slate-400 mt-1">{integration.description}</p>
                        </div>
                    </div>
                    <Badge className={getStatusColor(integration.status)}>
                        {integration.status === 'active' && <Check className="w-3 h-3 mr-1" />}
                        {integration.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {integration.features && (
                        <div>
                            <h4 className="text-xs font-semibold text-slate-300 mb-2">Features</h4>
                            <ul className="text-xs text-slate-400 space-y-1">
                                {integration.features.map((feature, idx) => (
                                    <li key={idx}>• {feature}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex gap-2 pt-2">
                        {integration.status === 'available' && onDownload && (
                            <Button 
                                size="sm" 
                                onClick={() => onDownload(integration)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                            </Button>
                        )}
                        {integration.status !== 'available' && onConfigure && (
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => onConfigure(integration)}
                                className="border-slate-600"
                            >
                                Configure
                            </Button>
                        )}
                        {integration.docs && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(integration.docs, '_blank')}
                            >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Docs
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}