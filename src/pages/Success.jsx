import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Rocket } from "lucide-react";

export default function Success() {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Terminal Box */}
        <div className="border-2 border-green-400 bg-black">
          {/* Terminal Header */}
          <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
            <span className="font-bold">$ subscription.confirm</span>
            <span className="text-xs">[ SUCCESS ]</span>
          </div>
          
          {/* Terminal Content */}
          <div className="p-8 space-y-6">
            {/* Success Icon */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <div className="text-cyan-400 text-2xl mb-3">╔════════════════════════════════╗</div>
              <div className="text-cyan-400 text-3xl font-bold mb-2">SUBSCRIPTION_ACTIVE</div>
              <div className="text-cyan-400 text-2xl mb-4">╚════════════════════════════════╝</div>
              <div className="text-green-400 text-lg">
                $ Welcome to CLI.MX2LM.COM
              </div>
            </div>

            {/* Info Box */}
            <div className="border-2 border-cyan-400 p-6 text-center">
              <Rocket className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <div className="text-cyan-400 font-bold mb-2">
                ► READY_TO_START_MANAGING_MODELS
              </div>
              <div className="text-green-400 text-sm">
                You now have access to model hosting, API endpoints, and the CLI playground.
              </div>
            </div>

            {/* Commands */}
            <div className="space-y-3">
              <div className="text-yellow-400 text-sm mb-2">$ Available commands:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link to={createPageUrl("ModelManager")}>
                  <button className="w-full bg-green-400 text-black px-4 py-3 hover:bg-green-300 transition font-bold text-left">
                    → mx2lm models --manage
                  </button>
                </Link>
                <Link to={createPageUrl("APIManager")}>
                  <button className="w-full border-2 border-green-400 text-green-400 px-4 py-3 hover:bg-green-900/30 transition font-bold text-left">
                    → mx2lm endpoints --configure
                  </button>
                </Link>
              </div>
            </div>

            {/* Back Link */}
            <div className="text-center pt-4 border-t-2 border-gray-700">
              <Link to={createPageUrl("Home")}>
                <button className="text-gray-400 hover:text-cyan-400 transition">
                  ← cd ~/home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}