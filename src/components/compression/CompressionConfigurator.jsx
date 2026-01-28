import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, Gauge, Target, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CompressionConfigurator() {
    const [profile, setProfile] = useState({
        name: '',
        compression_level: 5,
        target_ratio: 3.0,
        data_type: 'tensor',
        strategy: 'balanced'
    });
    const [optimizing, setOptimizing] = useState(false);
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.CompressionProfile.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['compression-profiles'] });
            toast.success('Compression profile saved');
            setProfile({
                name: '',
                compression_level: 5,
                target_ratio: 3.0,
                data_type: 'tensor',
                strategy: 'balanced'
            });
        }
    });

    const handleOptimize = async () => {
        setOptimizing(true);
        try {
            const response = await base44.functions.invoke('optimize-compression', {
                dataType: profile.data_type,
                performanceGoal: profile.strategy,
                currentSettings: profile
            });

            const optimization = response.data.optimization;
            setProfile({
                ...profile,
                compression_level: optimization.compression_level,
                target_ratio: optimization.target_ratio,
                strategy: optimization.strategy,
                scxq2_config: optimization.scxq2_config,
                ai_optimized: true,
                optimization_notes: optimization.reasoning
            });

            toast.success('AI optimization applied');
        } catch (error) {
            toast.error('Optimization failed');
        } finally {
            setOptimizing(false);
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Gauge className="w-5 h-5 text-purple-400" />
                        <CardTitle className="text-white">SCXQ2 Compression Configurator</CardTitle>
                    </div>
                    <Badge className="bg-cyan-600">Advanced</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label className="text-slate-300">Profile Name</Label>
                    <Input
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        placeholder="e.g., High-Performance Tensor"
                        className="bg-slate-950 border-slate-600 text-white"
                    />
                </div>

                <div>
                    <Label className="text-slate-300">Data Type</Label>
                    <Select value={profile.data_type} onValueChange={(value) => setProfile({...profile, data_type: value})}>
                        <SelectTrigger className="bg-slate-950 border-slate-600 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-600">
                            <SelectItem value="tensor">Tensor Data</SelectItem>
                            <SelectItem value="ngram">N-gram Data</SelectItem>
                            <SelectItem value="mixed">Mixed Data</SelectItem>
                            <SelectItem value="text">Text Data</SelectItem>
                            <SelectItem value="numeric">Numeric Data</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="text-slate-300">Compression Strategy</Label>
                    <Select value={profile.strategy} onValueChange={(value) => setProfile({...profile, strategy: value})}>
                        <SelectTrigger className="bg-slate-950 border-slate-600 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-600">
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="speed">Prioritize Speed</SelectItem>
                            <SelectItem value="ratio">Prioritize Ratio</SelectItem>
                            <SelectItem value="adaptive">Adaptive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="text-slate-300">
                        Compression Level: {profile.compression_level}
                        <span className="text-xs text-slate-500 ml-2">
                            ({profile.compression_level <= 3 ? 'Fast' : profile.compression_level <= 7 ? 'Balanced' : 'Max Compression'})
                        </span>
                    </Label>
                    <Slider
                        value={[profile.compression_level]}
                        onValueChange={([value]) => setProfile({...profile, compression_level: value})}
                        min={1}
                        max={10}
                        step={1}
                        className="mt-2"
                    />
                </div>

                <div>
                    <Label className="text-slate-300">Target Compression Ratio</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={profile.target_ratio}
                            onChange={(e) => setProfile({...profile, target_ratio: parseFloat(e.target.value)})}
                            min={1.0}
                            step={0.1}
                            className="bg-slate-950 border-slate-600 text-white"
                        />
                        <Badge variant="outline" className="text-xs">
                            {profile.target_ratio}x
                        </Badge>
                    </div>
                </div>

                {profile.optimization_notes && (
                    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-semibold text-blue-400">AI Optimization Applied</span>
                        </div>
                        <p className="text-xs text-slate-300">{profile.optimization_notes}</p>
                    </div>
                )}

                <div className="flex gap-2">
                    <Button
                        onClick={handleOptimize}
                        disabled={optimizing}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Optimize
                    </Button>
                    <Button
                        onClick={() => createMutation.mutate(profile)}
                        disabled={createMutation.isPending || !profile.name}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                        <Zap className="w-4 h-4 mr-2" />
                        Save Profile
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}