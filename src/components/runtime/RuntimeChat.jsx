import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Plus, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import PresetQuestions from "@/components/runtime/PresetQuestions";

export default function RuntimeChat({ onCodeGenerated, code = "" }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showPresets, setShowPresets] = useState(true);
  const [codingPatterns, setCodingPatterns] = useState({});
  const messagesEndRef = useRef(null);

  // Analyze coding patterns
  useEffect(() => {
    if (!code) return;
    
    const patterns = {
      usesAsync: /async|await|asyncio/.test(code),
      usesDataProcessing: /pandas|numpy|DataFrame/.test(code),
      complexity: code.split("\n").length > 50 ? "high" : "medium"
    };
    
    setCodingPatterns(patterns);
  }, [code]);

  useEffect(() => {
    const initChat = async () => {
      try {
        const newConv = await base44.agents.createConversation({
          agent_name: "runtime-studio",
          metadata: { name: "Runtime Session", type: "development" }
        });
        if (newConv?.id) {
          setConversation(newConv);
          setMessages(newConv.messages || []);
        } else {
          toast.error("Failed to initialize chat agent");
        }
      } catch (error) {
        toast.error("Chat initialization failed");
        console.error(error);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!conversation?.id) return;
    try {
      const unsubscribe = base44.agents.subscribeToConversation(
        conversation.id,
        (data) => {
          setMessages(data.messages || []);
          setIsLoading(false);
        }
      );
      return unsubscribe;
    } catch (error) {
      console.error("Subscription error:", error);
      return () => {};
    }
  }, [conversation?.id]);

  const handleSend = async (message = inputValue) => {
    if (!message.trim() || !conversation || isLoading) return;

    setIsLoading(true);
    const userMessage = message;
    if (message === inputValue) setInputValue("");
    setShowPresets(false);

    try {
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: userMessage
      });
    } catch (error) {
      toast.error("Failed to send message");
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-black border-l border-cyan-400">
      {/* Header */}
      <div className="border-b border-slate-700 p-4 flex items-center justify-between bg-slate-900">
        <div>
          <h3 className="text-cyan-400 font-bold">AI Studio Assistant</h3>
          <p className="text-xs text-gray-500">Runtime Studio v1.0</p>
        </div>
        <Button
          size="icon"
          variant="outline"
          onClick={() => {
            const newConv = base44.agents.createConversation({
              agent_name: "runtime-studio"
            });
            setConversation(newConv);
            setMessages([]);
          }}
          className="border-slate-600 text-cyan-400 hover:bg-cyan-900/20"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Preset Questions */}
      {showPresets && messages.length === 0 && (
        <div className="p-4 border-b border-slate-700 bg-slate-900">
          <PresetQuestions 
            onSelect={(question) => handleSend(question)} 
            codingPatterns={codingPatterns}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-cyan-900/30 border border-cyan-600 text-cyan-300"
                  : "bg-slate-800 border border-slate-700 text-gray-300"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      code: ({ inline, children }) =>
                        inline ? (
                          <code className="bg-black/50 px-1 rounded text-cyan-300">
                            {children}
                          </code>
                        ) : (
                          <div className="relative group">
                           <pre className="bg-black p-2 rounded text-xs overflow-x-auto border border-slate-700">
                             <code className="text-cyan-300">{children}</code>
                           </pre>
                           <Button
                             size="icon"
                             variant="ghost"
                             className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 bg-cyan-900/40 hover:bg-cyan-800/50 border border-slate-700"
                             onClick={() => {
                               copyToClipboard(String(children), idx);
                             }}
                           >
                              {copiedIndex === idx ? (
                                <Check className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        ),
                      a: ({ children, ...props }) => (
                        <a {...props} className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="ml-4 mb-2 list-disc">{children}</ul>,
                      ol: ({ children }) => <ol className="ml-4 mb-2 list-decimal">{children}</ol>
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-gray-400 text-sm">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 p-4 bg-slate-900">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask for help with scripts, models, optimization..."
            className="bg-black border-slate-700 text-cyan-400 placeholder:text-gray-600"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-black font-bold"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}