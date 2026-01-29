import React from 'react';
import { Layers, Cpu, Gauge, Monitor, Box, Zap, Globe, Sparkles } from 'lucide-react';

const ProblemCard = ({ icon: Icon, title, description, index }) => (
    <div className="p-6 bg-red-900/20 rounded-xl h-full border border-red-500/20">
        <div className="flex items-center gap-3 mb-3">
            <Icon className="w-5 h-5 text-red-400" />
            <h4 className="text-base font-medium text-white">Challenge #{index}: {title}</h4>
        </div>
        <p className="text-sm text-white/70 font-light">{description}</p>
    </div>
);

const SolutionCard = ({ icon: Icon, title, description }) => (
    <div className="p-6 bg-green-900/20 rounded-xl h-full border border-green-500/20">
        <div className="flex items-center gap-3 mb-3">
            <Icon className="w-5 h-5 text-green-400" />
            <h4 className="text-base font-medium text-white">Solution: {title}</h4>
        </div>
        <p className="text-sm text-white/70 font-light">{description}</p>
    </div>
);

export default function NemesisProblemsSolutionsSection() {
    const items = [
        { 
            pIcon: Layers, pTitle: "Resolution Scaling", pDesc: "Traditional engines struggle with crisp visuals across 1080p to 8K displays, requiring multiple texture resolutions.",
            sIcon: Box, sTitle: "Vector Resolution Independence", sDesc: "SVG-3D renders mathematically — infinite sharpness at any resolution without additional assets."
        },
        { 
            pIcon: Cpu, pTitle: "Large Asset Sizes", pDesc: "AAA games ship with 100GB+ of textures and models, causing long downloads and storage issues.",
            sIcon: Zap, sTitle: "Procedural Generation", sDesc: "KUHUL generates geometry from equations — entire game worlds in megabytes, not gigabytes."
        },
        { 
            pIcon: Gauge, pTitle: "Performance Bottlenecks", pDesc: "Complex scenes with millions of polygons cause frame drops and require expensive hardware.",
            sIcon: Sparkles, sTitle: "GPU-Accelerated Vectors", sDesc: "Compute shaders process vector math directly on GPU, achieving 60+ FPS on mid-range hardware."
        },
        { 
            pIcon: Monitor, pTitle: "Platform Fragmentation", pDesc: "Building for PC, console, mobile, and web requires separate optimizations and builds.",
            sIcon: Globe, sTitle: "Universal Export", sDesc: "Single codebase exports to WebGL, native desktop, mobile, and console with automatic optimization."
        }
    ];

    return (
        <section id="nemesis-problems-solutions" className="fade-in">
            <div className="text-center mb-16">
                <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Section 2</h2>
                <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">Challenges & Solutions</p>
                <div className="mt-6 max-w-3xl mx-auto glass-card p-4 rounded-xl border-l-4 border-r-4 border-purple-500/80">
                    <p className="text-white/80 font-light italic">Philosophy: "Mathematics is the ultimate compression."</p>
                    <p className="mt-2 text-white/90 font-medium">Every visual is a formula — infinitely scalable, instantly modifiable.</p>
                </div>
            </div>

            <div className="space-y-8">
                {items.map((item, index) => (
                    <div key={index} className="glass-card rounded-2xl p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ProblemCard icon={item.pIcon} title={item.pTitle} description={item.pDesc} index={index + 1} />
                            <SolutionCard icon={item.sIcon} title={item.sTitle} description={item.sDesc} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}