import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, FileCode, Database, Package, List, GitBranch } from "lucide-react";
import { toast } from "sonner";

export default function ScaffoldResult({ scaffold }) {
    const [copied, setCopied] = useState(null);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(null), 2000);
    };

    if (!scaffold) return null;

    return (
        <Card className="bg-slate-900 border-slate-700 mt-4">
            <CardHeader>
                <CardTitle className="text-white">Project Scaffold Generated</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="files" className="w-full">
                    <TabsList className="bg-slate-950">
                        <TabsTrigger value="files">
                            <FileCode className="w-4 h-4 mr-2" />
                            Files
                        </TabsTrigger>
                        <TabsTrigger value="env">
                            <Database className="w-4 h-4 mr-2" />
                            Environment
                        </TabsTrigger>
                        <TabsTrigger value="deps">
                            <Package className="w-4 h-4 mr-2" />
                            Dependencies
                        </TabsTrigger>
                        <TabsTrigger value="setup">
                            <List className="w-4 h-4 mr-2" />
                            Setup
                        </TabsTrigger>
                        {scaffold.routes && scaffold.routes.length > 0 && (
                            <TabsTrigger value="routes">
                                <GitBranch className="w-4 h-4 mr-2" />
                                Routes
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="files" className="space-y-3 mt-4">
                        {scaffold.files && scaffold.files.map((file, idx) => (
                            <div key={idx} className="bg-slate-950 rounded-lg border border-slate-800">
                                <div className="flex items-center justify-between p-3 border-b border-slate-800">
                                    <div>
                                        <div className="text-sm font-mono text-green-400">{file.path}</div>
                                        <div className="text-xs text-slate-500">{file.description}</div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(file.content, `file-${idx}`)}
                                    >
                                        {copied === `file-${idx}` ? (
                                            <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                                <pre className="p-3 text-xs text-slate-300 overflow-x-auto">
                                    {file.content}
                                </pre>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="env" className="space-y-3 mt-4">
                        <div className="bg-slate-950 rounded-lg border border-slate-800 p-4">
                            <div className="text-sm text-yellow-400 mb-3">
                                ⚠️ Add these to your .env file
                            </div>
                            {scaffold.env_variables && scaffold.env_variables.map((env, idx) => (
                                <div key={idx} className="mb-4 pb-4 border-b border-slate-800 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <code className="text-sm font-mono text-green-400">{env.name}</code>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(`${env.name}=${env.example || ''}`, `env-${idx}`)}
                                        >
                                            {copied === `env-${idx}` ? (
                                                <Check className="w-3 h-3 text-green-400" />
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                        </Button>
                                    </div>
                                    <div className="text-xs text-slate-400">{env.description}</div>
                                    {env.example && (
                                        <div className="text-xs text-slate-500 mt-1">
                                            Example: <code>{env.example}</code>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="deps" className="space-y-3 mt-4">
                        <div className="bg-slate-950 rounded-lg border border-slate-800 p-4">
                            {scaffold.dependencies && scaffold.dependencies.map((dep, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2">
                                    <code className="text-sm font-mono text-blue-400">{dep}</code>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyToClipboard(`npm install ${dep}`, `dep-${idx}`)}
                                    >
                                        {copied === `dep-${idx}` ? (
                                            <Check className="w-3 h-3 text-green-400" />
                                        ) : (
                                            <Copy className="w-3 h-3" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="setup" className="space-y-3 mt-4">
                        <div className="bg-slate-950 rounded-lg border border-slate-800 p-4">
                            <ol className="space-y-3">
                                {scaffold.setup_steps && scaffold.setup_steps.map((step, idx) => (
                                    <li key={idx} className="flex gap-3">
                                        <span className="text-blue-400 font-bold">{idx + 1}.</span>
                                        <span className="text-slate-300 text-sm">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </TabsContent>

                    {scaffold.routes && scaffold.routes.length > 0 && (
                        <TabsContent value="routes" className="space-y-3 mt-4">
                            <div className="bg-slate-950 rounded-lg border border-slate-800">
                                {scaffold.routes.map((route, idx) => (
                                    <div key={idx} className="p-3 border-b border-slate-800 last:border-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                                                route.method === 'GET' ? 'bg-green-900 text-green-300' :
                                                route.method === 'POST' ? 'bg-blue-900 text-blue-300' :
                                                route.method === 'PUT' ? 'bg-yellow-900 text-yellow-300' :
                                                'bg-red-900 text-red-300'
                                            }`}>
                                                {route.method}
                                            </span>
                                            <code className="text-sm font-mono text-purple-400">{route.path}</code>
                                        </div>
                                        <div className="text-xs text-slate-400 ml-16">{route.description}</div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    )}
                </Tabs>

                {scaffold.database_schema && (
                    <div className="mt-4 bg-slate-950 rounded-lg border border-slate-800 p-4">
                        <div className="text-sm font-semibold text-white mb-2">Database Schema</div>
                        <pre className="text-xs text-slate-300 overflow-x-auto">
                            {scaffold.database_schema}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}