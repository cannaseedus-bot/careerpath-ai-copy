import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Terminal, 
    Sparkles, 
    Copy, 
    Check, 
    Loader2,
    Code,
    HelpCircle,
    Zap
} from "lucide-react";
import { toast } from "sonner";

export default function ShellAssistant() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [copied, setCopied] = useState(null);
    const terminalRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [history]);

    const processCommand = async (action) => {
        if (!input.trim()) return;

        const userMessage = { type: 'user', content: input, timestamp: new Date() };
        setHistory(prev => [...prev, userMessage]);
        setLoading(true);

        try {
            const response = await base44.functions.invoke('shell-assistant', {
                prompt: input,
                action: action
            });

            const assistantMessage = {
                type: 'assistant',
                content: response.data.result,
                action: response.data.action,
                timestamp: new Date()
            };

            setHistory(prev => [...prev, assistantMessage]);
            setInput("");
        } catch (error) {
            toast.error("Failed to process request");
            console.error(error);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(null), 2000);
    };

    const clearHistory = () => {
        setHistory([]);
        toast.success("Terminal cleared");
    };

    return (
        <div className="w-full max-w-7xl mx-auto py-8 px-4">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Terminal className="w-8 h-8 text-green-400" />
                    <h1 className="text-3xl font-bold text-white">MX2LM Shell Assistant</h1>
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-slate-400">
                    AI-powered terminal assistant for Ollama model management and coding tasks
                </p>
            </div>

            {/* Terminal Display */}
            <div 
                ref={terminalRef}
                className="bg-slate-950 border border-slate-800 rounded-lg p-6 mb-4 h-[500px] overflow-y-auto font-mono text-sm"
            >
                {history.length === 0 ? (
                    <div className="text-slate-500 space-y-2">
                        <p>$ Welcome to MX2LM Shell Assistant</p>
                        <p className="text-xs">
                          Try: "pull gpt-oss cloud model" | "list my models" | "generate a python script"
                        </p>
                    </div>
                ) : (
                    history.map((entry, idx) => (
                        <div key={idx} className="mb-4">
                            {entry.type === 'user' ? (
                                <div className="flex gap-2 text-green-400">
                                    <span>$</span>
                                    <span>{entry.content}</span>
                                </div>
                            ) : (
                                <div className="mt-2 mb-4">
                                    <div className="flex items-start justify-between gap-2 group">
                                        <pre className="text-slate-300 whitespace-pre-wrap flex-1 bg-slate-900 p-3 rounded border border-slate-800">
                                            {entry.content}
                                        </pre>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => copyToClipboard(entry.content, idx)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {copied === idx ? (
                                                <Check className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {entry.action === 'command' && (
                                        <div className="text-xs text-slate-500 mt-1 ml-3">
                                            → Shell command ready to execute
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
                {loading && (
                    <div className="flex items-center gap-2 text-yellow-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    processCommand('command');
                                }
                            }}
                            placeholder="Type your request in natural language..."
                            className="pl-10 bg-slate-900 border-slate-700 text-white font-mono"
                            disabled={loading}
                        />
                    </div>
                    <Button
                        onClick={clearHistory}
                        variant="outline"
                        className="border-slate-700"
                    >
                        Clear
                    </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                    <Button
                        onClick={() => processCommand('command')}
                        disabled={loading || !input.trim()}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Terminal className="w-4 h-4 mr-2" />
                        Generate Command
                    </Button>
                    <Button
                        onClick={() => processCommand('code')}
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Code className="w-4 h-4 mr-2" />
                        Generate Code
                    </Button>
                    <Button
                        onClick={() => processCommand('explain')}
                        disabled={loading || !input.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Explain
                    </Button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <h3 className="font-semibold text-white">Ollama Commands</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <button
                            onClick={() => setInput("list all available ollama models")}
                            className="text-left text-slate-400 hover:text-blue-400 transition-colors w-full"
                        >
                            → List all models
                        </button>
                        <button
                            onClick={() => setInput("pull gpt-oss:120b-cloud")}
                            className="text-left text-slate-400 hover:text-blue-400 transition-colors w-full"
                        >
                            → Pull GPT-OSS cloud model
                        </button>
                        <button
                            onClick={() => setInput("run deepseek-v3.1:671b-cloud")}
                            className="text-left text-slate-400 hover:text-blue-400 transition-colors w-full"
                        >
                            → Run DeepSeek model
                        </button>
                        <button
                            onClick={() => setInput("check ollama version")}
                            className="text-left text-slate-400 hover:text-blue-400 transition-colors w-full"
                        >
                            → Check Ollama version
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Code className="w-5 h-5 text-blue-400" />
                        <h3 className="font-semibold text-white">Code Tasks</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                        <button
                            onClick={() => setInput("generate a python script that processes CSV files")}
                            className="text-left text-slate-400 hover:text-blue-400 transition-colors w-full"
                        >
                            → Generate Python script
                        </button>
                        <button
                            onClick={() => setInput("explain how async/await works in JavaScript")}
                            className="text-left text-slate-400 hover:text-blue-400 transition-colors w-full"
                        >
                            → Explain async/await
                        </button>
                        <button
                            onClick={() => setInput("debug: TypeError: Cannot read property of undefined")}
                            className="text-left text-slate-400 hover:text-blue-400 transition-colors w-full"
                        >
                            → Debug error
                        </button>
                        <button
                            onClick={() => setInput("create a REST API endpoint in Node.js")}
                            className="text-left text-slate-400 hover:text-blue-400 transition-colors w-full"
                        >
                            → Create API endpoint
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}