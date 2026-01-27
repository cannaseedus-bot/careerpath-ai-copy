import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Rocket, Crown, Terminal } from "lucide-react";
import { createCheckout } from "@/functions/create-checkout";

const tiers = [
  {
    name: "Starter",
    key: "starter",
    price: "$9.99",
    period: "/month",
    icon: Terminal,
    color: "blue",
    features: [
      "5 models hosted",
      "1,000 API calls/month",
      "Community support",
      "Basic quantization (INT8)",
      "2GB model storage",
      "Standard endpoints"
    ],
    cta: "Subscribe Now",
    popular: false
  },
  {
    name: "Professional",
    key: "professional",
    price: "$29.99",
    period: "/month",
    icon: Rocket,
    color: "purple",
    features: [
      "20 models hosted",
      "10,000 API calls/month",
      "Priority support",
      "Advanced quantization (INT4, GGUF)",
      "10GB model storage",
      "Custom endpoints",
      "cPanel integration"
    ],
    cta: "Subscribe Now",
    popular: true
  },
  {
    name: "Enterprise",
    key: "enterprise",
    price: "$99.99",
    period: "/month",
    icon: Crown,
    color: "yellow",
    features: [
      "Unlimited models",
      "100,000 API calls/month",
      "Dedicated support",
      "All quantization formats",
      "50GB model storage",
      "Custom infrastructure",
      "White-label options",
      "SLA guarantee"
    ],
    cta: "Subscribe Now",
    popular: false
  }
];

const addOns = [
  { name: "Extra 10K API calls", price: "$9.99" },
  { name: "Additional 10GB storage", price: "$4.99" },
  { name: "Custom model training", price: "$49.99" },
  { name: "Private endpoint hosting", price: "$19.99" }
];

export default function Pricing() {
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (tierKey) => {
    if (window.self !== window.top) {
      alert('Checkout is only available in the published app. Please open the app in a new tab.');
      return;
    }

    setLoading(tierKey);
    try {
      const { data } = await createCheckout({
        tier: tierKey,
        success_url: window.location.origin + '/success',
        cancel_url: window.location.href
      });
      window.location.href = data.url;
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-7xl mx-auto">
        {/* Terminal Header */}
        <div className="border-2 border-green-400 bg-black mb-8">
          <div className="bg-green-400 text-black px-4 py-1 flex justify-between items-center">
            <span className="font-bold">$ mx2lm pricing --plans</span>
            <span className="text-xs">[ Subscription Plans ]</span>
          </div>
          <div className="p-6 text-center">
            <div className="text-cyan-400 text-3xl mb-3">╔═══════════════════════════╗</div>
            <div className="text-cyan-400 text-2xl mb-2">CHOOSE YOUR PLAN</div>
            <div className="text-cyan-400 text-3xl mb-4">╚═══════════════════════════╝</div>
            <div className="text-green-400 max-w-2xl mx-auto">
              Model hosting and metered API access for your CLI tools. Start at $9.99/month.
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const colorClasses = {
              blue: "border-blue-500 bg-blue-500/5",
              purple: "border-purple-500 bg-purple-500/10 scale-105 shadow-2xl",
              yellow: "border-yellow-500 bg-yellow-500/5"
            };
            const buttonColors = {
              blue: "bg-blue-600 hover:bg-blue-700",
              purple: "bg-purple-600 hover:bg-purple-700",
              yellow: "bg-yellow-600 hover:bg-yellow-700"
            };

            return (
              <Card
                key={tier.name}
                className={`relative bg-slate-800/50 backdrop-blur-sm border-2 transition-all hover:scale-105 ${colorClasses[tier.color]}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <Icon className={`w-10 h-10 text-${tier.color}-400`} />
                  </div>
                  <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-5xl font-black text-white">{tier.price}</span>
                    <span className="text-slate-400">{tier.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${buttonColors[tier.color]}`}
                    onClick={() => handleCheckout(tier.key)}
                    disabled={loading === tier.key}
                  >
                    {loading === tier.key ? 'Processing...' : tier.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add-ons */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-8">Add-Ons & Extensions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addOns.map((addon) => (
              <Card key={addon.name} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-purple-500 transition-all">
                <CardContent className="p-6 text-center">
                  <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">{addon.name}</h3>
                  <p className="text-2xl font-bold text-purple-300">{addon.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Metered Pricing Info */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-400" />
              Metered API Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-purple-300 mb-2">$0.01</div>
                <div className="text-slate-300">per additional API call</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-300 mb-2">$0.50</div>
                <div className="text-slate-300">per GB model storage</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-300 mb-2">$0.02</div>
                <div className="text-slate-300">per compute minute</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link to={createPageUrl("ModelManager")}>
            <Button className="bg-purple-600 hover:bg-purple-700 px-8 py-6 text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}