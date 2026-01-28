import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, Briefcase, Target, CheckCircle, ArrowRight, ArrowLeft, 
  Plus, Trash2, Zap, Sparkles 
} from 'lucide-react';

const STEPS = [
  { id: 'basics', title: 'Basic Info', icon: User },
  { id: 'mission', title: 'Mission', icon: Target },
  { id: 'skills', title: 'Skills', icon: CheckCircle },
  { id: 'studios', title: 'Target Studios', icon: Briefcase },
  { id: 'plan', title: 'Action Plan', icon: Zap },
];

export default function ProfileSetupWizard({ onComplete, initialData }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState(initialData || {
    full_name: '',
    title: '',
    location: '',
    email: '',
    availability: 'available',
    mission_statement: '',
    target_studios: [{ rank: '1', name: '', location: '', founded: '', team: '', specialty: '', description: '', alignment: '', website: '', url: '' }],
    target_roles: [{ rank: '1', title: '', subtitle: '' }],
    core_skills: [{ name: '', level: 50 }],
    growth_skills: [{ name: '', level: 30 }],
    action_plan: [{ month: '1', title: '', tasks: [''] }],
    what_i_need: [{ icon: 'MessageCircle', title: 'Feedback', subtitle: 'On portfolio direction' }],
    setup_complete: false
  });

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field, template) => {
    setProfile(prev => ({
      ...prev,
      [field]: [...prev[field], { ...template, rank: String(prev[field].length + 1) }]
    }));
  };

  const updateArrayItem = (field, index, key, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? { ...item, [key]: value } : item)
    }));
  };

  const removeArrayItem = (field, index) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleComplete();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleComplete = () => {
    onComplete({ ...profile, setup_complete: true });
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="border-2 border-cyan-400 bg-black mb-6">
          <div className="bg-gradient-to-r from-cyan-500 to-purple-500 text-black px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">PROFILE SETUP WIZARD</span>
            </div>
            <span className="text-xs">Step {step + 1} of {STEPS.length}</span>
          </div>
          <div className="p-4">
            <Progress value={progress} className="h-2 mb-4" />
            <div className="flex justify-between">
              {STEPS.map((s, i) => (
                <div key={s.id} className={`flex items-center gap-1 text-xs ${i <= step ? 'text-cyan-400' : 'text-slate-600'}`}>
                  <s.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{s.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-slate-900 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {React.createElement(STEPS[step].icon, { className: "w-5 h-5 text-cyan-400" })}
              {STEPS[step].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Full Name</label>
                  <Input value={profile.full_name} onChange={(e) => updateProfile('full_name', e.target.value)} placeholder="John Doe" className="bg-slate-800 border-slate-600 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Professional Title</label>
                  <Input value={profile.title} onChange={(e) => updateProfile('title', e.target.value)} placeholder="Full Stack Developer" className="bg-slate-800 border-slate-600 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Location</label>
                  <Input value={profile.location} onChange={(e) => updateProfile('location', e.target.value)} placeholder="City, State" className="bg-slate-800 border-slate-600 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Contact Email</label>
                  <Input value={profile.email} onChange={(e) => updateProfile('email', e.target.value)} placeholder="you@email.com" className="bg-slate-800 border-slate-600 text-white" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Availability</label>
                  <Select value={profile.availability} onValueChange={(val) => updateProfile('availability', val)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="open">Open to Opportunities</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Step 1: Mission */}
            {step === 1 && (
              <>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Mission Statement</label>
                  <Textarea value={profile.mission_statement} onChange={(e) => updateProfile('mission_statement', e.target.value)} placeholder="Describe your professional mission and goals..." className="bg-slate-800 border-slate-600 text-white min-h-[120px]" />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Target Roles</label>
                  {profile.target_roles.map((role, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <Badge className="bg-green-600">{i + 1}</Badge>
                      <Input value={role.title} onChange={(e) => updateArrayItem('target_roles', i, 'title', e.target.value)} placeholder="Role Title" className="bg-slate-800 border-slate-600 text-white flex-1" />
                      <Input value={role.subtitle} onChange={(e) => updateArrayItem('target_roles', i, 'subtitle', e.target.value)} placeholder="Subtitle" className="bg-slate-800 border-slate-600 text-white flex-1" />
                      {profile.target_roles.length > 1 && (
                        <Button size="icon" variant="ghost" onClick={() => removeArrayItem('target_roles', i)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                      )}
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => addArrayItem('target_roles', { title: '', subtitle: '' })} className="mt-2">
                    <Plus className="w-4 h-4 mr-1" /> Add Role
                  </Button>
                </div>
              </>
            )}

            {/* Step 2: Skills */}
            {step === 2 && (
              <>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Core Skills</label>
                  {profile.core_skills.map((skill, i) => (
                    <div key={i} className="flex gap-2 mb-2 items-center">
                      <Input value={skill.name} onChange={(e) => updateArrayItem('core_skills', i, 'name', e.target.value)} placeholder="Skill name" className="bg-slate-800 border-slate-600 text-white flex-1" />
                      <Input type="number" min="0" max="100" value={skill.level} onChange={(e) => updateArrayItem('core_skills', i, 'level', parseInt(e.target.value) || 0)} className="bg-slate-800 border-slate-600 text-white w-20" />
                      <span className="text-slate-400 text-sm">%</span>
                      {profile.core_skills.length > 1 && (
                        <Button size="icon" variant="ghost" onClick={() => removeArrayItem('core_skills', i)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                      )}
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => addArrayItem('core_skills', { name: '', level: 50 })} className="mt-2">
                    <Plus className="w-4 h-4 mr-1" /> Add Skill
                  </Button>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Growth Areas</label>
                  {profile.growth_skills.map((skill, i) => (
                    <div key={i} className="flex gap-2 mb-2 items-center">
                      <Input value={skill.name} onChange={(e) => updateArrayItem('growth_skills', i, 'name', e.target.value)} placeholder="Skill name" className="bg-slate-800 border-slate-600 text-white flex-1" />
                      <Input type="number" min="0" max="100" value={skill.level} onChange={(e) => updateArrayItem('growth_skills', i, 'level', parseInt(e.target.value) || 0)} className="bg-slate-800 border-slate-600 text-white w-20" />
                      <span className="text-slate-400 text-sm">%</span>
                      {profile.growth_skills.length > 1 && (
                        <Button size="icon" variant="ghost" onClick={() => removeArrayItem('growth_skills', i)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                      )}
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={() => addArrayItem('growth_skills', { name: '', level: 30 })} className="mt-2">
                    <Plus className="w-4 h-4 mr-1" /> Add Skill
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Studios */}
            {step === 3 && (
              <>
                <label className="text-slate-400 text-sm mb-2 block">Target Companies/Studios</label>
                {profile.target_studios.map((studio, i) => (
                  <div key={i} className="bg-slate-800 p-3 rounded mb-3 border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                      <Badge className="bg-cyan-600">#{i + 1}</Badge>
                      {profile.target_studios.length > 1 && (
                        <Button size="icon" variant="ghost" onClick={() => removeArrayItem('target_studios', i)} className="text-red-400 h-6 w-6"><Trash2 className="w-3 h-3" /></Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={studio.name} onChange={(e) => updateArrayItem('target_studios', i, 'name', e.target.value)} placeholder="Company Name" className="bg-slate-900 border-slate-600 text-white" />
                      <Input value={studio.location} onChange={(e) => updateArrayItem('target_studios', i, 'location', e.target.value)} placeholder="Location" className="bg-slate-900 border-slate-600 text-white" />
                      <Input value={studio.specialty} onChange={(e) => updateArrayItem('target_studios', i, 'specialty', e.target.value)} placeholder="Specialty" className="bg-slate-900 border-slate-600 text-white" />
                      <Input value={studio.url} onChange={(e) => updateArrayItem('target_studios', i, 'url', e.target.value)} placeholder="Website URL" className="bg-slate-900 border-slate-600 text-white" />
                    </div>
                    <Textarea value={studio.description} onChange={(e) => updateArrayItem('target_studios', i, 'description', e.target.value)} placeholder="Description" className="bg-slate-900 border-slate-600 text-white mt-2" />
                    <Input value={studio.alignment} onChange={(e) => updateArrayItem('target_studios', i, 'alignment', e.target.value)} placeholder="Why this company aligns with your goals" className="bg-slate-900 border-slate-600 text-white mt-2" />
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => addArrayItem('target_studios', { name: '', location: '', founded: '', team: '', specialty: '', description: '', alignment: '', website: '', url: '' })}>
                  <Plus className="w-4 h-4 mr-1" /> Add Studio
                </Button>
              </>
            )}

            {/* Step 4: Action Plan */}
            {step === 4 && (
              <>
                <label className="text-slate-400 text-sm mb-2 block">Roadmap / Action Plan</label>
                {profile.action_plan.map((milestone, i) => (
                  <div key={i} className="bg-slate-800 p-3 rounded mb-3 border border-slate-700">
                    <div className="flex gap-2 items-center mb-2">
                      <Badge className="bg-purple-600">M{i + 1}</Badge>
                      <Input value={milestone.title} onChange={(e) => updateArrayItem('action_plan', i, 'title', e.target.value)} placeholder="Phase Title" className="bg-slate-900 border-slate-600 text-white flex-1" />
                      {profile.action_plan.length > 1 && (
                        <Button size="icon" variant="ghost" onClick={() => removeArrayItem('action_plan', i)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                      )}
                    </div>
                    <Textarea 
                      value={milestone.tasks.join('\n')} 
                      onChange={(e) => updateArrayItem('action_plan', i, 'tasks', e.target.value.split('\n'))} 
                      placeholder="Tasks (one per line)" 
                      className="bg-slate-900 border-slate-600 text-white" 
                    />
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => addArrayItem('action_plan', { month: String(profile.action_plan.length + 1), title: '', tasks: [''] })}>
                  <Plus className="w-4 h-4 mr-1" /> Add Phase
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={step === 0} className="border-slate-600">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={handleNext} className="bg-cyan-600 hover:bg-cyan-700">
            {step === STEPS.length - 1 ? 'Complete Setup' : 'Next'} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}