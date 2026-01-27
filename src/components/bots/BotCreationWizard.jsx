import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Check, Zap } from "lucide-react";

export default function BotCreationWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    bot_type: 'scraper',
    config: {},
    script: '',
    schedule: null
  });

  const steps = [
    {
      id: 'basic',
      title: 'Basic Info',
      subtitle: 'Name and type of bot'
    },
    {
      id: 'config',
      title: 'Configuration',
      subtitle: 'Bot settings and parameters'
    },
    {
      id: 'script',
      title: 'Script',
      subtitle: 'Custom code (optional)'
    },
    {
      id: 'schedule',
      title: 'Schedule',
      subtitle: 'Automation timing'
    },
    {
      id: 'review',
      title: 'Review',
      subtitle: 'Confirm and create'
    }
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = () => {
    onComplete(formData);
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
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                index < currentStep ? 'bg-green-600 text-white' :
                index === currentStep ? 'bg-cyan-600 text-white' :
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
            className="h-full bg-cyan-600"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Flip Card Container */}
      <div className="perspective-1000" style={{ perspective: '1000px' }}>
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
            <Card className="bg-slate-900 border-2 border-cyan-400 min-h-[400px]">
              <div className="p-6">
                {/* Step Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-2xl font-bold text-cyan-400">
                      {steps[currentStep].title}
                    </h2>
                  </div>
                  <p className="text-gray-400">{steps[currentStep].subtitle}</p>
                </div>

                {/* Step Content */}
                <div className="space-y-4 mb-6">
                  {currentStep === 0 && (
                    <>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Bot Name *</label>
                        <Input
                          value={formData.name}
                          onChange={(e) => updateFormData('name', e.target.value)}
                          placeholder="e.g., Product Scraper"
                          className="bg-black border-cyan-400 text-cyan-400"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Bot Type *</label>
                        <Select value={formData.bot_type} onValueChange={(v) => updateFormData('bot_type', v)}>
                          <SelectTrigger className="bg-black border-cyan-400 text-cyan-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="orchestrator">Orchestrator</SelectItem>
                            <SelectItem value="scraper">Scraper</SelectItem>
                            <SelectItem value="data-builder">Data Builder</SelectItem>
                            <SelectItem value="cluster-worker">Cluster Worker</SelectItem>
                            <SelectItem value="ngram-builder">N-Gram Builder</SelectItem>
                            <SelectItem value="tensor-processor">Tensor Processor</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {currentStep === 1 && (
                    <>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Configuration (JSON)</label>
                        <Textarea
                          value={JSON.stringify(formData.config, null, 2)}
                          onChange={(e) => {
                            try {
                              updateFormData('config', JSON.parse(e.target.value));
                            } catch {}
                          }}
                          placeholder='{"url": "https://example.com", "selector": ".product"}'
                          className="font-mono text-sm min-h-[200px] bg-black border-cyan-400 text-cyan-400"
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Add configuration specific to your bot type (URLs, selectors, API endpoints, etc.)
                      </div>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Custom Script (Optional)</label>
                        <Textarea
                          value={formData.script}
                          onChange={(e) => updateFormData('script', e.target.value)}
                          placeholder="// Custom bot logic here..."
                          className="font-mono text-sm min-h-[250px] bg-black border-cyan-400 text-cyan-400"
                        />
                      </div>
                      <div className="text-xs text-gray-500">
                        Leave empty to use default bot behavior
                      </div>
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Schedule Type</label>
                        <Select 
                          value={formData.schedule?.type || 'none'} 
                          onValueChange={(v) => updateFormData('schedule', v === 'none' ? null : { type: v })}
                        >
                          <SelectTrigger className="bg-black border-cyan-400 text-cyan-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Schedule (Manual)</SelectItem>
                            <SelectItem value="interval">Interval</SelectItem>
                            <SelectItem value="cron">Cron Expression</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {formData.schedule?.type === 'interval' && (
                        <div>
                          <label className="text-sm text-gray-400 mb-2 block">Interval (minutes)</label>
                          <Input
                            type="number"
                            placeholder="60"
                            className="bg-black border-cyan-400 text-cyan-400"
                          />
                        </div>
                      )}
                      {formData.schedule?.type === 'cron' && (
                        <div>
                          <label className="text-sm text-gray-400 mb-2 block">Cron Expression</label>
                          <Input
                            placeholder="0 */6 * * *"
                            className="bg-black border-cyan-400 text-cyan-400"
                          />
                        </div>
                      )}
                    </>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="bg-black p-4 rounded border border-cyan-400">
                        <div className="text-sm font-bold text-cyan-400 mb-3">Bot Summary</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Name:</span>
                            <span className="text-cyan-400">{formData.name || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Type:</span>
                            <Badge className="bg-purple-600">{formData.bot_type}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Script:</span>
                            <span className="text-cyan-400">
                              {formData.script ? 'Custom' : 'Default'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Schedule:</span>
                            <span className="text-cyan-400">
                              {formData.schedule ? formData.schedule.type : 'Manual'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!formData.name && (
                        <div className="text-red-400 text-sm">
                          ⚠️ Bot name is required
                        </div>
                      )}
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
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!formData.name}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Create Bot
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