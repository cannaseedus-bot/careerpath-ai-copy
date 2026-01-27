import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Check, Layers, Info, Globe, Database, Cpu } from "lucide-react";

export default function TemplateWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customizations, setCustomizations] = useState({});

  const templates = [
    {
      id: 'web-scraper',
      name: 'Web Scraper Bot',
      icon: Globe,
      bot_type: 'scraper',
      description: 'Extracts data from websites using CSS selectors and XPath',
      config: { urls: [], selectors: {}, interval: 3600 },
      script: '// Web scraping logic\nasync function scrape(url, selectors) {\n  // Fetch and parse\n}',
      customizable: ['urls', 'selectors', 'interval']
    },
    {
      id: 'data-processor',
      name: 'Data Processor Bot',
      icon: Database,
      bot_type: 'data-builder',
      description: 'Processes and transforms data through compression pipelines',
      config: { input_source: 'api', output_format: 'json', compression: true },
      script: '// Data processing logic\nasync function process(data) {\n  // Transform data\n}',
      customizable: ['input_source', 'output_format', 'compression']
    },
    {
      id: 'tensor-worker',
      name: 'Tensor Worker Bot',
      icon: Cpu,
      bot_type: 'tensor-processor',
      description: 'Creates and processes binary tensors for geometric compression',
      config: { tensor_shape: [10, 10, 5], encoding: 'binary', optimization: true },
      script: '// Tensor processing logic\nasync function processTensor(data, shape) {\n  // Create tensor\n}',
      customizable: ['tensor_shape', 'encoding', 'optimization']
    }
  ];

  const steps = [
    {
      id: 'select',
      title: 'Select Template',
      subtitle: 'Choose a starting point',
      info: 'Templates provide pre-configured bots for common tasks. Each template includes optimized settings and example code you can customize'
    },
    {
      id: 'customize',
      title: 'Customize Settings',
      subtitle: 'Configure bot parameters',
      info: 'Adjust template settings to match your specific use case. These settings determine how the bot operates and what data it processes'
    },
    {
      id: 'name',
      title: 'Name & Finalize',
      subtitle: 'Give your bot a name',
      info: 'Choose a descriptive name for your bot. This helps identify it in the orchestrator dashboard and logs'
    }
  ];

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

  const handleComplete = () => {
    if (!selectedTemplate || !customizations.name) return;
    
    const finalConfig = { ...selectedTemplate.config };
    selectedTemplate.customizable.forEach(field => {
      if (customizations[field] !== undefined) {
        finalConfig[field] = customizations[field];
      }
    });

    onComplete({
      name: customizations.name,
      bot_type: selectedTemplate.bot_type,
      config: finalConfig,
      script: selectedTemplate.script,
      status: 'idle'
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                index < currentStep ? 'bg-green-600 text-white' :
                index === currentStep ? 'bg-yellow-600 text-black' :
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
            className="h-full bg-yellow-600"
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
            <Card className="bg-slate-900 border-2 border-yellow-400 min-h-[450px]">
              <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-2xl font-bold text-yellow-400">
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
                    <div className="grid grid-cols-1 gap-3">
                      {templates.map((template) => {
                        const Icon = template.icon;
                        return (
                          <div
                            key={template.id}
                            onClick={() => setSelectedTemplate(template)}
                            className={`p-4 rounded border-2 cursor-pointer transition ${
                              selectedTemplate?.id === template.id
                                ? 'border-yellow-400 bg-yellow-950'
                                : 'border-gray-600 hover:border-yellow-400'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Icon className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-yellow-400 font-bold mb-1">{template.name}</div>
                                <div className="text-xs text-gray-400">{template.description}</div>
                                <Badge className="bg-purple-600 mt-2 text-xs">{template.bot_type}</Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {currentStep === 1 && selectedTemplate && (
                    <>
                      <div className="bg-black p-3 rounded border border-yellow-400 mb-4">
                        <div className="text-sm text-gray-400">Template:</div>
                        <div className="text-yellow-400 font-bold">{selectedTemplate.name}</div>
                      </div>
                      {selectedTemplate.customizable.map(field => (
                        <div key={field}>
                          <label className="text-sm text-gray-400 mb-2 block capitalize">
                            {field.replace(/_/g, ' ')}
                          </label>
                          <Input
                            value={customizations[field] || ''}
                            onChange={(e) => setCustomizations({...customizations, [field]: e.target.value})}
                            placeholder={`Enter ${field}`}
                            className="bg-black border-yellow-400 text-yellow-400"
                          />
                        </div>
                      ))}
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Bot Name *</label>
                        <Input
                          value={customizations.name || ''}
                          onChange={(e) => setCustomizations({...customizations, name: e.target.value})}
                          placeholder="my-bot-name"
                          className="bg-black border-yellow-400 text-yellow-400"
                        />
                      </div>
                      <div className="bg-black p-4 rounded border border-green-400">
                        <div className="text-sm font-bold text-green-400 mb-3">✓ Ready to Create</div>
                        <div className="space-y-1 text-xs text-gray-400">
                          <div>• Template: <span className="text-yellow-400">{selectedTemplate?.name}</span></div>
                          <div>• Type: <span className="text-yellow-400">{selectedTemplate?.bot_type}</span></div>
                          <div>• Customized: <span className="text-yellow-400">{Object.keys(customizations).length - 1} settings</span></div>
                        </div>
                      </div>
                    </>
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
                      disabled={currentStep === 0 && !selectedTemplate}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleComplete}
                      disabled={!customizations.name}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Create from Template
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