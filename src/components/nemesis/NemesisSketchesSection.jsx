import React from 'react';
import { Box, Hexagon, Triangle, Circle, Layers, Sparkles } from 'lucide-react';

const SketchCard = ({ icon: Icon, title, description, preview }) => (
    <div className="text-center p-6 border-2 border-dashed border-purple-500/30 rounded-xl bg-gradient-to-br from-purple-900/10 to-cyan-900/10 hover:from-purple-900/20 hover:to-cyan-900/20 hover:border-purple-500/50 transition-all duration-300">
        <div className="w-20 h-20 mx-auto mb-4 rounded-lg bg-black/50 flex items-center justify-center border border-white/10">
            <Icon className="w-10 h-10 text-cyan-400" />
        </div>
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-sm text-white/70 my-2 font-light">{description}</p>
        <p className="text-xs text-purple-400 font-mono">{preview}</p>
    </div>
);

const SVGDemo = ({ children, label }) => (
    <div className="glass-card rounded-xl p-6 border border-cyan-500/20">
        <div className="aspect-square bg-black/50 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
            {children}
        </div>
        <p className="text-center text-sm text-white/70">{label}</p>
    </div>
);

export default function NemesisSketchesSection() {
    return (
        <section id="nemesis-sketches" className="fade-in">
            <div className="text-center mb-16">
                <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Section 3</h2>
                <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">KUHUL SVG-3D Previews</p>
            </div>

            {/* Live SVG Demos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <SVGDemo label="Vector Cube">
                    <svg viewBox="0 0 100 100" className="w-24 h-24 animate-spin" style={{ animationDuration: '8s' }}>
                        <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="cyan" strokeWidth="1" />
                        <polygon points="50,10 90,30 50,50 10,30" fill="rgba(0,255,255,0.1)" stroke="cyan" strokeWidth="0.5" />
                        <polygon points="90,30 90,70 50,90 50,50" fill="rgba(128,0,255,0.1)" stroke="purple" strokeWidth="0.5" />
                        <polygon points="10,30 50,50 50,90 10,70" fill="rgba(0,128,255,0.1)" stroke="blue" strokeWidth="0.5" />
                    </svg>
                </SVGDemo>
                <SVGDemo label="Parametric Spiral">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                        <path d="M50,50 Q60,30 70,50 T90,50 Q70,70 50,70 T10,50 Q30,30 50,30 T70,30" fill="none" stroke="url(#gradient1)" strokeWidth="1.5">
                            <animate attributeName="stroke-dashoffset" from="0" to="100" dur="3s" repeatCount="indefinite" />
                        </path>
                        <defs>
                            <linearGradient id="gradient1"><stop offset="0%" stopColor="cyan"/><stop offset="100%" stopColor="purple"/></linearGradient>
                        </defs>
                    </svg>
                </SVGDemo>
                <SVGDemo label="Dynamic Mesh">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                        {[...Array(5)].map((_, i) => (
                            <circle key={i} cx="50" cy="50" r={10 + i * 8} fill="none" stroke="cyan" strokeWidth="0.5" opacity={1 - i * 0.15}>
                                <animate attributeName="r" values={`${10 + i * 8};${15 + i * 8};${10 + i * 8}`} dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
                            </circle>
                        ))}
                    </svg>
                </SVGDemo>
                <SVGDemo label="Procedural Grid">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                        {[...Array(5)].map((_, row) => 
                            [...Array(5)].map((_, col) => (
                                <rect key={`${row}-${col}`} x={10 + col * 18} y={10 + row * 18} width="12" height="12" fill="none" stroke="purple" strokeWidth="0.5" rx="2">
                                    <animate attributeName="opacity" values="0.3;1;0.3" dur={`${1 + (row + col) * 0.2}s`} repeatCount="indefinite" />
                                </rect>
                            ))
                        )}
                    </svg>
                </SVGDemo>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <SketchCard 
                    icon={Box} 
                    title="3D Primitives" 
                    description="Cubes, spheres, cylinders defined by vector equations"
                    preview="bezier + transform3d"
                />
                <SketchCard 
                    icon={Hexagon} 
                    title="Procedural Terrain" 
                    description="Infinite landscapes from noise functions"
                    preview="perlin + voronoi"
                />
                <SketchCard 
                    icon={Triangle} 
                    title="Character Rigs" 
                    description="Skeletal animation with vector bones"
                    preview="IK solver + spline"
                />
                <SketchCard 
                    icon={Circle} 
                    title="Particle Systems" 
                    description="Millions of particles via compute shaders"
                    preview="GPGPU + instancing"
                />
                <SketchCard 
                    icon={Layers} 
                    title="Level Editor" 
                    description="Node-based visual scripting for game logic"
                    preview="blueprint system"
                />
                <SketchCard 
                    icon={Sparkles} 
                    title="Shader Graph" 
                    description="Custom materials with vector math nodes"
                    preview="GLSL + node editor"
                />
            </div>
        </section>
    );
}