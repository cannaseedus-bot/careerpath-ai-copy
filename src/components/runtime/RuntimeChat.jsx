import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Plus, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function RuntimeChat({ onCodeGenerated }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

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

  const handleSend = async () => {
    if (!inputValue.trim() || !conversation || isLoading) return;

    setIsLoading(true);
    const userMessage = inputValue;
    setInputValue("");

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
      <div className="border-b border-cyan-400 p-4 flex items-center justify-between">
        <div>
          <h3 className="text-cyan-400 font-bold">AI Studio Assistant</h3>
          <p className="text-xs text-gray-400">Runtime Studio v1.0</p>
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
          className="border-cyan-400 text-cyan-400 hover:bg-cyan-900/20"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-cyan-900/40 border border-cyan-400 text-cyan-100"
                  : "bg-slate-900 border border-slate-700 text-gray-300"
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
                            <pre className="bg-black/70 p-2 rounded text-xs overflow-x-auto">
                              <code className="text-cyan-300">{children}</code>
                            </pre>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 bg-slate-800 hover:bg-slate-700"
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
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-gray-400 text-sm">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-cyan-400 p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask for help with scripts, models, optimization..."
            className="bg-slate-900 border-cyan-400 text-white"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}