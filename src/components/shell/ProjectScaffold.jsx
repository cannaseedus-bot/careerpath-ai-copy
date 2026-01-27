import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Database, Code, Zap } from "lucide-react";

export default function ProjectScaffold({ onGenerate }) {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        projectName: "",
        projectType: "web-app",
        database: "none",
        features: {
            authentication: false,
            payments: false,
            api: false,
            websockets: false,
        },
        language: "javascript",
        framework: "react"
    });

    const handleGenerate = async () => {
        if (!config.projectName.trim()) {
            alert("Please enter a project name");
            return;
        }

        setLoading(true);
        try {
            await onGenerate(config);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Project Scaffolding
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="projectName" className="text-slate-300">Project Name</Label>
                    <Input
                        id="projectName"
                        value={config.projectName}
                        onChange={(e) => setConfig({...config, projectName: e.target.value})}
                        placeholder="my-awesome-app"
                        className="bg-slate-950 border-slate-700 text-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Project Type</Label>
                    <Select value={config.projectType} onValueChange={(value) => setConfig({...config, projectType: value})}>
                        <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="web-app">Web Application</SelectItem>
                            <SelectItem value="api">REST API</SelectItem>
                            <SelectItem value="cli">CLI Tool</SelectItem>
                            <SelectItem value="microservice">Microservice</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">
                        <Database className="w-4 h-4 inline mr-2" />
                        Database
                    </Label>
                    <Select value={config.database} onValueChange={(value) => setConfig({...config, database: value})}>
                        <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Database</SelectItem>
                            <SelectItem value="indexeddb">IndexedDB (Local)</SelectItem>
                            <SelectItem value="supabase">Supabase</SelectItem>
                            <SelectItem value="mongodb">MongoDB</SelectItem>
                            <SelectItem value="postgresql">PostgreSQL</SelectItem>
                            <SelectItem value="json">JSON Files</SelectItem>
                            <SelectItem value="api">External API</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Language & Framework</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Select value={config.language} onValueChange={(value) => setConfig({...config, language: value})}>
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="typescript">TypeScript</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={config.framework} onValueChange={(value) => setConfig({...config, framework: value})}>
                            <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="react">React</SelectItem>
                                <SelectItem value="vue">Vue</SelectItem>
                                <SelectItem value="express">Express</SelectItem>
                                <SelectItem value="fastapi">FastAPI</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-slate-300">Features</Label>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="auth"
                                checked={config.features.authentication}
                                onCheckedChange={(checked) => setConfig({
                                    ...config,
                                    features: {...config.features, authentication: checked}
                                })}
                            />
                            <label htmlFor="auth" className="text-sm text-slate-400 cursor-pointer">
                                Authentication & User Management
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="payments"
                                checked={config.features.payments}
                                onCheckedChange={(checked) => setConfig({
                                    ...config,
                                    features: {...config.features, payments: checked}
                                })}
                            />
                            <label htmlFor="payments" className="text-sm text-slate-400 cursor-pointer">
                                Payment Integration (Stripe)
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="api"
                                checked={config.features.api}
                                onCheckedChange={(checked) => setConfig({
                                    ...config,
                                    features: {...config.features, api: checked}
                                })}
                            />
                            <label htmlFor="api" className="text-sm text-slate-400 cursor-pointer">
                                REST API Routes
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="websockets"
                                checked={config.features.websockets}
                                onCheckedChange={(checked) => setConfig({
                                    ...config,
                                    features: {...config.features, websockets: checked}
                                })}
                            />
                            <label htmlFor="websockets" className="text-sm text-slate-400 cursor-pointer">
                                WebSocket Support
                            </label>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Zap className="w-4 h-4 mr-2" />
                            Generate Project
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}