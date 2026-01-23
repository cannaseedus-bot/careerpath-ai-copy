import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Rocket } from "lucide-react";

export default function Success() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full bg-slate-800/50 border-green-500/30 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>
          <CardTitle className="text-4xl text-white mb-4">
            Welcome to CLI.MX2LM.COM!
          </CardTitle>
          <p className="text-xl text-slate-300">
            Your subscription is now active
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-slate-900/50 rounded-lg p-6 text-center">
            <Rocket className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Ready to Start Managing Models
            </h3>
            <p className="text-slate-300">
              You now have access to model hosting, API endpoints, and the CLI playground.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to={createPageUrl("ModelManager")} className="block">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Manage Models
              </Button>
            </Link>
            <Link to={createPageUrl("APIManager")} className="block">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                Configure APIs
              </Button>
            </Link>
          </div>
          
          <div className="text-center pt-4">
            <Link to={createPageUrl("Home")}>
              <Button variant="ghost" className="text-slate-400 hover:text-white">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}