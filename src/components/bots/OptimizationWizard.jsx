import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Check, TrendingUp, Info } from "lucide-react";

export default function OptimizationWizard({ bot, onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [optimizationData, setOptimizationData] = useState({
    optimization_type: 'tensor_sharding',
    priority: 'medium',
    auto_apply: false,
    analysis_depth: 'standard'
  });

  const steps = [
    {
      id: 'type',
      title: 'Optimization Type',
      subtitle: 'What to optimize',
      info: 'Choose optimization strategy: Tensor Sharding splits data across nodes, Weight Pruning removes redundant parameters, Compression Tuning adjusts SCXQ2 settings for maximum efficiency'
    },
    {
      id: 'analysis',
      title: 'Analysis Depth',
      subtitle: 'How deep to analyze',
      info: 'Quick analysis gives instant suggestions, Standard performs comprehensive metrics review, Deep analysis uses AI to discover hidden optimization opportunities'
    },
    {
      id: 'priority',
      title: 'Priority & Auto-Apply',
      subtitle: 'Execution settings',
      info: 'Priority determines optimization importance. Auto-apply will implement suggestions immediately without confirmation (use with caution)'
    },
    {
      id: 'review',
      title: 'Review & Execute',
      subtitle: 'Confirm optimization',
      info: 'AI will analyze bot performance, suggest optimizations, and predict improvements. Review recommendations before applying'
    }
  ];

  const updateData = (field, value) => {
    setOptimizationData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOptimize = () => {
    onComplete({
      bot_id: bot.id,
      ...optimizationData
    });
  };

  const variants = {
    enter: (direction) => ({
      rotateY: direction > 0 ? 90 : -90,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      rotateY: direction > 0 ? -90 : 90,
      opacity: 0,
      scale: 0.8
    })
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                index < currentStep ? 'bg-green-600 text-white' :
                index === currentStep ? 'bg-purple-600 text-white' :
                'bg-gray-700 text-gray-400'
              }`}>
                {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <div className="text-xs text-gray-400 mt-1 text-center">{step.title}</div>
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-600"
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Flip Card */}
      <div style={{ perspective: '1000px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <Card className="bg-slate-900 border-2 border-purple-400 min-h-[450px]">
              <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    <h2 className="text-2xl font-bold text-purple-400">
                      {steps[currentStep].title}
                    </h2>
                  </div>
                  <p className="text-gray-400 mb-3">{steps[currentStep].subtitle}</p>
                  <div className="flex items-start gap-2 bg-black p-3 rounded border border-cyan-400">
                    <Info className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-cyan-400">{steps[currentStep].info}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4 mb-6">
                  {currentStep === 0 && (
                    <>
                      <div className="bg-black p-4 rounded border border-purple-400 mb-4">
                        <div className="text-sm text-gray-400 mb-2">Optimizing Bot:</div>
                        <div className="text-purple-400 font-bold text-lg">{bot.name}</div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Optimization Type *</label>
                        <Select value={optimizationData.optimization_type} onValueChange={(v) => updateData('optimization_type', v)}>
                          <SelectTrigger className="bg-black border-purple-400 text-purple-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tensor_sharding">Tensor Sharding</SelectItem>
                            <SelectItem value="weight_pruning">Weight Pruning</SelectItem>
                            <SelectItem value="compression_tuning">Compression Tuning</SelectItem>
                            <SelectItem value="phase_optimization">Phase Optimization</SelectItem>
                            <SelectItem value="cluster_rebalancing">Cluster Rebalancing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {currentStep === 1 && (
                    <>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Analysis Depth</label>
                        <Select value={optimizationData.analysis_depth} onValueChange={(v) => updateData('analysis_depth', v)}>
                          <SelectTrigger className="bg-black border-purple-400 text-purple-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quick">Quick (< 1 min)</SelectItem>
                            <SelectItem value="standard">Standard (2-5 min)</SelectItem>
                            <SelectItem value="deep">Deep AI Analysis (5-10 min)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-black p-3 rounded border border-green-400 text-center">
                          <div className="text-xs text-gray-400">Quick</div>
                          <div className="text-green-400 text-sm">Instant</div>
                        </div>
                        <div className="bg-black p-3 rounded border border-yellow-400 text-center">
                          <div className="text-xs text-gray-400">Standard</div>
                          <div className="text-yellow-400 text-sm">Thorough</div>
                        </div>
                        <div className="bg-black p-3 rounded border border-purple-400 text-center">
                          <div className="text-xs text-gray-400">Deep</div>
                          <div className="text-purple-400 text-sm">AI-Driven</div>
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Optimization Priority</label>
                        <Select value={optimizationData.priority} onValueChange={(v) => updateData('priority', v)}>
                          <SelectTrigger className="bg-black border-purple-400 text-purple-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="bg-black p-4 rounded border border-yellow-400">
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="checkbox"
                            checked={optimizationData.auto_apply}
                            onChange={(e) => updateData('auto_apply', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <label className="text-sm text-yellow-400 font-bold">Auto-Apply Optimizations</label>
                        </div>
                        <div className="text-xs text-gray-400">
                          ⚠️ When enabled, optimizations will be applied automatically without review. Use only for non-critical bots.
                        </div>
                      </div>
                    </>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="bg-black p-4 rounded border border-purple-400">
                        <div className="text-sm font-bold text-purple-400 mb-3">Optimization Summary</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Type:</span>
                            <span className="text-purple-400">{optimizationData.optimization_type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Analysis:</span>
                            <span className="text-purple-400">{optimizationData.analysis_depth}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Priority:</span>
                            <Badge className="bg-purple-600">{optimizationData.priority}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Auto-Apply:</span>
                            <Badge className={optimizationData.auto_apply ? "bg-yellow-600" : "bg-gray-600"}>
                              {optimizationData.auto_apply ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="bg-black p-3 rounded border border-cyan-400 text-xs text-cyan-400">
                        <strong>What happens next:</strong> AI analyzes bot performance metrics, identifies bottlenecks, generates optimization suggestions with predicted improvements, and {optimizationData.auto_apply ? 'applies them automatically' : 'waits for your approval'}.
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    onClick={currentStep === 0 ? onCancel : prevStep}
                    variant="outline"
                    className="border-gray-400 text-gray-400"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    {currentStep === 0 ? 'Cancel' : 'Back'}
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={nextStep}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleOptimize}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Run Optimization
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}