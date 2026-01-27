import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Check, Rocket, Info } from "lucide-react";

export default function DeploymentWizard({ bot, onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [deploymentData, setDeploymentData] = useState({
    environment: 'staging',
    cluster_nodes: [],
    tensor_schemas: {},
    scxq2_config: {
      compression_level: 'standard',
      ngram_size: 3,
      optimization: true
    }
  });

  const steps = [
    {
      id: 'environment',
      title: 'Target Environment',
      subtitle: 'Choose where to deploy',
      info: 'Select deployment environment: local for testing, staging for pre-production validation, production for live operations'
    },
    {
      id: 'cluster',
      title: 'Cluster Configuration',
      subtitle: 'Configure node cluster',
      info: 'Define cluster nodes for distributed processing. More nodes = higher throughput and fault tolerance'
    },
    {
      id: 'compression',
      title: 'SCXQ2 Compression',
      subtitle: 'Optimize data compression',
      info: 'Configure SCXQ2 compression engine: higher compression = smaller payload, optimized inference = faster execution'
    },
    {
      id: 'tensors',
      title: 'Tensor Schemas',
      subtitle: 'SVG-3D tensor configuration',
      info: 'Define tensor schemas for data representation. Binary tensors enable geometric compression and visualization'
    },
    {
      id: 'review',
      title: 'Deployment Review',
      subtitle: 'Confirm and deploy',
      info: 'Review all settings before deploying. Deployment creates versioned snapshot and activates bot in target environment'
    }
  ];

  const updateData = (field, value) => {
    setDeploymentData(prev => ({ ...prev, [field]: value }));
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

  const handleDeploy = () => {
    onComplete({
      bot_id: bot.id,
      ...deploymentData
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
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                index < currentStep ? 'bg-green-600 text-white' :
                index === currentStep ? 'bg-orange-600 text-white' :
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
            className="h-full bg-orange-600"
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
            <Card className="bg-slate-900 border-2 border-orange-400 min-h-[450px]">
              <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-6 h-6 text-orange-400" />
                    <h2 className="text-2xl font-bold text-orange-400">
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
                      <div className="bg-black p-4 rounded border border-orange-400 mb-4">
                        <div className="text-sm text-gray-400 mb-2">Deploying Bot:</div>
                        <div className="text-orange-400 font-bold text-lg">{bot.name}</div>
                        <Badge className="bg-purple-600 mt-2">{bot.bot_type}</Badge>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Target Environment *</label>
                        <Select value={deploymentData.environment} onValueChange={(v) => updateData('environment', v)}>
                          <SelectTrigger className="bg-black border-orange-400 text-orange-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local">Local (Development)</SelectItem>
                            <SelectItem value="staging">Staging (Testing)</SelectItem>
                            <SelectItem value="production">Production (Live)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {currentStep === 1 && (
                    <>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Cluster Nodes (comma-separated URLs)</label>
                        <Input
                          value={deploymentData.cluster_nodes.join(', ')}
                          onChange={(e) => updateData('cluster_nodes', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                          placeholder="node1.example.com, node2.example.com"
                          className="bg-black border-orange-400 text-orange-400"
                        />
                      </div>
                      <div className="bg-black p-3 rounded border border-cyan-400 text-xs text-gray-400">
                        Leave empty for single-node deployment. Multi-node enables load balancing and high availability.
                      </div>
                    </>
                  )}

                  {currentStep === 2 && (
                    <>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Compression Level</label>
                        <Select 
                          value={deploymentData.scxq2_config.compression_level} 
                          onValueChange={(v) => updateData('scxq2_config', {...deploymentData.scxq2_config, compression_level: v})}
                        >
                          <SelectTrigger className="bg-black border-orange-400 text-orange-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minimal">Minimal (Fastest)</SelectItem>
                            <SelectItem value="standard">Standard (Balanced)</SelectItem>
                            <SelectItem value="aggressive">Aggressive (Smallest)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">N-Gram Window Size</label>
                        <Select 
                          value={deploymentData.scxq2_config.ngram_size.toString()} 
                          onValueChange={(v) => updateData('scxq2_config', {...deploymentData.scxq2_config, ngram_size: parseInt(v)})}
                        >
                          <SelectTrigger className="bg-black border-orange-400 text-orange-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 (Fast, less context)</SelectItem>
                            <SelectItem value="3">3 (Balanced)</SelectItem>
                            <SelectItem value="4">4 (Better patterns)</SelectItem>
                            <SelectItem value="5">5 (Maximum context)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 bg-black p-3 rounded border border-green-400">
                        <input
                          type="checkbox"
                          checked={deploymentData.scxq2_config.optimization}
                          onChange={(e) => updateData('scxq2_config', {...deploymentData.scxq2_config, optimization: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <label className="text-sm text-green-400">Enable Runtime Optimization</label>
                      </div>
                    </>
                  )}

                  {currentStep === 3 && (
                    <>
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Tensor Schema (JSON)</label>
                        <textarea
                          value={JSON.stringify(deploymentData.tensor_schemas, null, 2)}
                          onChange={(e) => {
                            try {
                              updateData('tensor_schemas', JSON.parse(e.target.value));
                            } catch {}
                          }}
                          placeholder='{"shape": [10, 10, 5], "encoding": "binary"}'
                          className="w-full min-h-[150px] bg-black border-2 border-orange-400 text-orange-400 font-mono text-sm p-3 rounded"
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        Define SVG-3D tensor structure for geometric compression. Leave empty for auto-detection.
                      </div>
                    </>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <div className="bg-black p-4 rounded border border-orange-400">
                        <div className="text-sm font-bold text-orange-400 mb-3">Deployment Configuration</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Bot:</span>
                            <span className="text-orange-400">{bot.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Environment:</span>
                            <Badge className="bg-orange-600">{deploymentData.environment}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Cluster Nodes:</span>
                            <span className="text-orange-400">
                              {deploymentData.cluster_nodes.length || 'Single node'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Compression:</span>
                            <span className="text-orange-400">{deploymentData.scxq2_config.compression_level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Optimization:</span>
                            <Badge className={deploymentData.scxq2_config.optimization ? "bg-green-600" : "bg-gray-600"}>
                              {deploymentData.scxq2_config.optimization ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>
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
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleDeploy}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy Now
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