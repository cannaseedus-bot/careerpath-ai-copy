import React from 'react';
import { Cpu, Layers, Zap, BarChart2, Box, Triangle, Hexagon, CircleDot } from 'lucide-react';

const InfoCard = ({ icon: Icon, title, children }) => (
    <div className="glass-card rounded-xl p-6 hover:bg-black/20 transition-colors border border-purple-500/20 hover:border-purple-500/40">
        <div className="flex items-center gap-3 mb-4">
            <Icon className="w-5 h-5 text-purple-400" />
            <h4 className="text-base font-medium text-white uppercase tracking-widest">{title}</h4>
        </div>
        <div className="text-sm text-white/80 font-light space-y-2">
            {children}
        </div>
    </div>
);

const FeatureCard = ({ name, description, metric, icon: Icon }) => (
    <div className="bg-white/5 p-4 rounded-lg border border-transparent hover:border-cyan-500/30 transition-colors duration-300 h-full flex flex-col">
        <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/30 to-cyan-600/30 flex items-center justify-center flex-shrink-0">
                 <Icon className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
                <h5 className="font-semibold text-white">{name}</h5>
                <p className="text-xs text-white/60">{description}</p>
            </div>
        </div>
        <div className="text-xs text-green-300 bg-green-900/30 p-3 rounded-md mt-auto">
            <p className="font-bold text-green-200 uppercase tracking-wider text-[10px] mb-1">Performance</p>
            <p className="font-light">{metric}</p>
        </div>
    </div>
);

export default function NemesisResearchSection() {
    return (
        <section id="nemesis-research" className="fade-in">
            <div className="text-center mb-16">
                <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Section 1</h2>
                <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">Engine Architecture</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <InfoCard icon={Cpu} title="KUHUL Core">
                    <p>KUHUL is a mathematical framework that uses vector geometry for all rendering operations.</p>
                    <p>SVG-3D extends traditional 2D vectors into full 3D space with GPU acceleration.</p>
                </InfoCard>
                <InfoCard icon={Layers} title="Rendering Pipeline">
                    <p>Multi-pass vector renderer with real-time tessellation and smooth curve interpolation.</p>
                    <p>Native support for infinite zoom without quality loss — true resolution independence.</p>
                </InfoCard>
                <InfoCard icon={Zap} title="Performance">
                    <p><strong className="text-white">60+ FPS:</strong> Optimized for real-time gaming on modern hardware.</p>
                    <p><strong className="text-white">Low Memory:</strong> Vector math reduces asset footprint by 80%.</p>
                </InfoCard>
                <InfoCard icon={BarChart2} title="Comparison">
                    <p><strong className="text-white">vs Unity:</strong> Smaller builds, faster load times, cleaner scaling.</p>
                    <p><strong className="text-white">vs Unreal:</strong> No baking, instant lighting, procedural everything.</p>
                </InfoCard>
                <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-cyan-500/20">
                    <div className="flex items-center gap-3 mb-4">
                        <Box className="w-5 h-5 text-cyan-400" />
                        <h4 className="text-base font-medium text-white uppercase tracking-widest">Core Capabilities</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FeatureCard name="Vector Meshes" description="Procedural geometry" metric="10x smaller than traditional 3D models" icon={Triangle} />
                        <FeatureCard name="Dynamic Lighting" description="Real-time raymarching" metric="No pre-baked lightmaps required" icon={CircleDot} />
                        <FeatureCard name="Physics Engine" description="KUHUL π integration" metric="Deterministic simulation at 120Hz" icon={Hexagon} />
                    </div>
                </div>
            </div>
            
            <div className="glass-card rounded-2xl p-8 border-l-4 border-purple-500">
                 <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-medium text-white uppercase tracking-widest">Why Vector-Based?</h3>
                </div>
                <p className="text-white/90 font-light leading-relaxed">
                    Traditional game engines rely on rasterized textures and polygon meshes that scale poorly. KUHUL SVG-3D uses mathematical descriptions of geometry — curves, surfaces, and volumes defined by equations. This means infinite detail at any zoom level, procedural generation of complex shapes, and dramatically smaller file sizes. Perfect for stylized games, data visualization, and applications requiring crisp visuals at any resolution.
                </p>
            </div>
        </section>
    );
}