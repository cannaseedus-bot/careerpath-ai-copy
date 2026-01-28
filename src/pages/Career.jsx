import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, User, Briefcase, Star, Globe, Users, GitMerge, MapPin, 
  ExternalLink, CheckCircle, TrendingUp, CalendarCheck, MessageCircle, 
  Heart, Zap, Code, Terminal, Shield, Cpu, Server, Download,
  FolderKanban, ListTodo, Brain, Search, DollarSign
} from 'lucide-react';
import CountdownTimer from '@/components/shared/CountdownTimer';

const studios = [
  { rank: "1", name: "PENTAGRAM", location: "Global", founded: "1972", team: "20+ Partners", specialty: "Brand Identity", description: "World-renowned interdisciplinary design collective", alignment: "Global prestige and luxury system mastery", website: "pentagram.com", url: "https://www.pentagram.com" },
  { rank: "2", name: "RETHINK", location: "Vancouver", founded: "1999", team: "150+ People", specialty: "Brand Strategy", description: "Canadian creative agency with strong presence", alignment: "Local connection with growing design focus", website: "rethinkideas.com", url: "https://www.rethinkideas.com" },
  { rank: "3", name: "ANAGRAMA", location: "Mexico City", founded: "2011", team: "30+ Designers", specialty: "Packaging", description: "Boutique studio for material-driven brand systems", alignment: "Material craft and packaging expertise", website: "anagrama.com", url: "https://www.anagrama.com" },
  { rank: "4", name: "COLLINS", location: "New York / SF", founded: "2008", team: "100+ Team", specialty: "Transformation", description: "Transformation & brand studio end-to-end", alignment: "End-to-end brand transformation focus", website: "wearecollins.com", url: "https://www.wearecollins.com" }
];

const roles = [
  { rank: "1", title: "Brand Identity Designer / Art Director", subtitle: "luxury & cultural brands" },
  { rank: "2", title: "Senior Visual Designer", subtitle: "packaging, editorial, typographic systems" },
  { rank: "3", title: "Motion & Systems Designer", subtitle: "brand motion, launch assets, campaigns" },
  { rank: "4", title: "Design Lead", subtitle: "small boutique studio (project ownership)" }
];

const coreSkills = [
  { name: "Logo systems", level: 85 },
  { name: "Adobe CC (PS/AI/ID)", level: 90 },
  { name: "Figma", level: 80 },
  { name: "Photography & composition", level: 75 },
  { name: "Brand concepting", level: 85 }
];

const growthSkills = [
  { name: "Packaging production", level: 30 },
  { name: "Motion identity & AE", level: 25 },
  { name: "Design systems (digital)", level: 40 },
  { name: "Client storytelling", level: 35 },
  { name: "Custom typography", level: 45 }
];

const milestones = [
  { month: "1", title: "Foundation", tasks: ["2 portfolio case study outlines", "Start luxury identity project", "Publish process shots weekly"] },
  { month: "2", title: "Development", tasks: ["Complete luxury identity case study", "Create packaging mockups", "Outreach to photographer/print house"] },
  { month: "3", title: "Digital Presence", tasks: ["Build portfolio page (Figma → Webflow)", "Start motion tests for logo reveal", "Refine case studies"] },
  { month: "4", title: "Refinement", tasks: ["Polish case studies", "Request reviews from mentors", "Submit to Design Week / Behance"] },
  { month: "5", title: "Applications", tasks: ["Target applications: Rethink", "Small boutiques outreach", "Speculative briefs for Pentagram/COLLINS"] },
  { month: "6", title: "Launch", tasks: ["Refine pitch deck", "Rehearse presentation", "Interview prep and network follow-ups"] }
];

export default function CareerPage() {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Terminal Header */}
        <div className="border-2 border-cyan-400 bg-black mb-6">
          <div className="bg-gradient-to-r from-cyan-500 to-purple-500 text-black px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5" />
              <span className="font-bold text-lg">CAREER TERMINAL</span>
              <Badge className="bg-black text-cyan-400">v1.0</Badge>
            </div>
            <span className="text-xs">[ alaksa.khan@career ~ ]</span>
          </div>
          <div className="p-6">
            <div className="text-cyan-400 mb-2">
              <span className="text-yellow-400">$</span> ./whoami.sh
            </div>
            <div className="ml-4 space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-white">Alaksa Anjum Khan</div>
              <div className="text-xl text-cyan-400">Visual Designer & Strategist</div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                <Badge className="bg-purple-600"><Target className="w-3 h-3 mr-1" /> Luxury Brands</Badge>
                <Badge className="bg-blue-600"><Globe className="w-3 h-3 mr-1" /> Vancouver, BC</Badge>
                <Badge className="bg-green-600"><Zap className="w-3 h-3 mr-1" /> Available</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="border-2 border-purple-400 bg-gradient-to-r from-purple-900/30 to-cyan-900/30 mb-6">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-bold">MISSION STATEMENT</span>
            </div>
            <p className="text-white text-lg leading-relaxed">
              To design cinematic, culturally-rooted luxury identities that translate Bengali heritage into modern premium systems.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="border-2 border-green-400 bg-black p-4 text-center">
            <div className="text-3xl font-bold text-green-400"><CountdownTimer targetNumber={4} duration={1500} /></div>
            <div className="text-slate-400 text-sm">Target Studios</div>
          </div>
          <div className="border-2 border-cyan-400 bg-black p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400"><CountdownTimer targetNumber={5} duration={1800} /></div>
            <div className="text-slate-400 text-sm">Cities</div>
          </div>
          <div className="border-2 border-purple-400 bg-black p-4 text-center">
            <div className="text-3xl font-bold text-purple-400"><CountdownTimer targetNumber={6} duration={2000} /></div>
            <div className="text-slate-400 text-sm">Month Plan</div>
          </div>
          <div className="border-2 border-yellow-400 bg-black p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400"><CountdownTimer targetNumber={4} duration={2200} /></div>
            <div className="text-slate-400 text-sm">Target Roles</div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="studios" className="space-y-4">
          <TabsList className="bg-slate-900 border border-slate-700 flex-wrap">
            <TabsTrigger value="studios"><Briefcase className="w-4 h-4 mr-1" /> Studios</TabsTrigger>
            <TabsTrigger value="skills"><CheckCircle className="w-4 h-4 mr-1" /> Skills</TabsTrigger>
            <TabsTrigger value="plan"><CalendarCheck className="w-4 h-4 mr-1" /> Action Plan</TabsTrigger>
            <TabsTrigger value="tools"><Terminal className="w-4 h-4 mr-1" /> Tools</TabsTrigger>
            <TabsTrigger value="contact"><MessageCircle className="w-4 h-4 mr-1" /> Contact</TabsTrigger>
          </TabsList>

          {/* Studios Tab */}
          <TabsContent value="studios">
            <div className="border-2 border-green-400 bg-black">
              <div className="bg-green-400 text-black px-4 py-1">
                <span className="font-bold">TARGET STUDIOS</span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {studios.map((studio, i) => (
                  <Card key={i} className="bg-slate-900 border-slate-700 hover:border-cyan-600 transition-all">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Badge className="bg-cyan-600">{studio.rank}</Badge>
                            {studio.name}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
                            <MapPin className="w-3 h-3" /> {studio.location}
                          </div>
                        </div>
                        <a href={studio.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:text-cyan-300">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-slate-800 p-2 rounded text-center">
                          <div className="text-white font-bold">{studio.founded}</div>
                          <div className="text-slate-500">Founded</div>
                        </div>
                        <div className="bg-slate-800 p-2 rounded text-center">
                          <div className="text-white font-bold">{studio.team}</div>
                          <div className="text-slate-500">Team</div>
                        </div>
                        <div className="bg-slate-800 p-2 rounded text-center">
                          <div className="text-cyan-400 font-bold">{studio.specialty}</div>
                          <div className="text-slate-500">Focus</div>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm">{studio.description}</p>
                      <div className="bg-purple-900/30 border border-purple-600 p-2 rounded text-xs">
                        <span className="text-purple-400">Alignment:</span> <span className="text-white">{studio.alignment}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <div className="space-y-4">
              {/* Target Roles */}
              <div className="border-2 border-cyan-400 bg-black">
                <div className="bg-cyan-400 text-black px-4 py-1">
                  <span className="font-bold">TARGET ROLES</span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {roles.map((role, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-700 p-3 rounded flex items-center gap-3 hover:border-cyan-600 transition-all">
                      <Badge className="bg-green-600">{role.rank}</Badge>
                      <div>
                        <div className="text-white font-semibold">{role.title}</div>
                        <div className="text-slate-400 text-sm">{role.subtitle}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-green-400 bg-black">
                  <div className="bg-green-400 text-black px-4 py-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-bold">CORE COMPETENCIES</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {coreSkills.map((skill, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{skill.name}</span>
                          <span className="text-green-400">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-2 border-orange-400 bg-black">
                  <div className="bg-orange-400 text-black px-4 py-1 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-bold">GROWTH AREAS</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {growthSkills.map((skill, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{skill.name}</span>
                          <span className="text-orange-400">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Action Plan Tab */}
          <TabsContent value="plan">
            <div className="border-2 border-purple-400 bg-black">
              <div className="bg-purple-400 text-black px-4 py-1 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" />
                <span className="font-bold">6-MONTH ACTION PLAN</span>
              </div>
              <div className="p-4 space-y-3">
                {milestones.map((m, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-700 p-4 rounded hover:border-purple-600 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-purple-600">M{m.month}</Badge>
                      <span className="text-white font-bold">{m.title}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {m.tasks.map((task, j) => (
                        <div key={j} className="bg-slate-800 p-2 rounded text-sm text-slate-300 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools">
            <div className="border-2 border-cyan-400 bg-black">
              <div className="bg-cyan-400 text-black px-4 py-1 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                <span className="font-bold">MX2LM TOOLKIT INTEGRATION</span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <Link to={createPageUrl("CLIPlayground")} className="bg-slate-900 border border-slate-700 p-4 rounded hover:border-cyan-600 transition-all block">
                  <Code className="w-6 h-6 text-cyan-400 mb-2" />
                  <div className="text-white font-bold">CLI Playground</div>
                  <div className="text-slate-400 text-sm">Test AI models</div>
                </Link>
                <Link to={createPageUrl("ProjectDashboard")} className="bg-slate-900 border border-slate-700 p-4 rounded hover:border-green-600 transition-all block">
                  <FolderKanban className="w-6 h-6 text-green-400 mb-2" />
                  <div className="text-white font-bold">Project Manager</div>
                  <div className="text-slate-400 text-sm">Track portfolio projects</div>
                </Link>
                <Link to={createPageUrl("CLIEditor")} className="bg-slate-900 border border-slate-700 p-4 rounded hover:border-purple-600 transition-all block">
                  <Users className="w-6 h-6 text-purple-400 mb-2" />
                  <div className="text-white font-bold">Collaboration</div>
                  <div className="text-slate-400 text-sm">Multi-agent sessions</div>
                </Link>
                <Link to={createPageUrl("ShellAssistant")} className="bg-slate-900 border border-slate-700 p-4 rounded hover:border-orange-600 transition-all block">
                  <Brain className="w-6 h-6 text-orange-400 mb-2" />
                  <div className="text-white font-bold">Shell Assistant</div>
                  <div className="text-slate-400 text-sm">AI-powered help</div>
                </Link>
                <Link to={createPageUrl("BotOrchestrator")} className="bg-slate-900 border border-slate-700 p-4 rounded hover:border-yellow-600 transition-all block">
                  <Cpu className="w-6 h-6 text-yellow-400 mb-2" />
                  <div className="text-white font-bold">Bot Orchestrator</div>
                  <div className="text-slate-400 text-sm">Automate workflows</div>
                </Link>
                <Link to={createPageUrl("Monitoring")} className="bg-slate-900 border border-slate-700 p-4 rounded hover:border-red-600 transition-all block">
                  <Server className="w-6 h-6 text-red-400 mb-2" />
                  <div className="text-white font-bold">Monitoring</div>
                  <div className="text-slate-400 text-sm">System health</div>
                </Link>
              </div>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="space-y-4">
              <div className="border-2 border-green-400 bg-black">
                <div className="bg-green-400 text-black px-4 py-1">
                  <span className="font-bold">WHAT I NEED</span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-900 border border-slate-700 p-4 rounded text-center">
                    <MessageCircle className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                    <div className="text-white font-bold">Feedback</div>
                    <div className="text-slate-400 text-sm">On portfolio direction</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 p-4 rounded text-center">
                    <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-white font-bold">Connections</div>
                    <div className="text-slate-400 text-sm">To design leads</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-700 p-4 rounded text-center">
                    <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                    <div className="text-white font-bold">Mentorship</div>
                    <div className="text-slate-400 text-sm">In luxury branding</div>
                  </div>
                </div>
              </div>
              <div className="border-2 border-cyan-400 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 p-6 text-center">
                <div className="text-2xl font-bold text-white mb-2">Let's Connect</div>
                <div className="text-cyan-400 font-mono mb-4">alaksa.khan@lasallecollege.com</div>
                <div className="text-slate-400">Vancouver, BC • Available for opportunities</div>
                <Button className="mt-4 bg-white text-black hover:bg-gray-200">
                  <MessageCircle className="w-4 h-4 mr-2" /> Get in Touch
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-slate-700 pt-6">
          <div className="text-slate-500 text-sm">
            Career Terminal v1.0 • Powered by MX2LM Framework
          </div>
        </div>
      </div>
    </div>
  );
}