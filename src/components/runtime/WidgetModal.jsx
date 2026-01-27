import React from "react";
import { X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WidgetModal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-cyan-400 rounded-lg w-full max-w-2xl max-h-96 overflow-hidden flex flex-col shadow-2xl">
        <div className="border-b border-slate-700 p-3 flex items-center justify-between bg-slate-800">
          <h3 className="text-cyan-400 font-bold text-sm flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            {title}
          </h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="w-6 h-6 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {children}
        </div>
      </div>
    </div>
  );
}