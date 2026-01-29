import React from 'react';
import { Palette, Type, Terminal, Box, Cpu, Globe } from 'lucide-react';

const ColorSwatch = ({ hex, name }) => (
    <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-white/20" style={{ backgroundColor: hex }}></div>
        <div>
            <p className="font-medium text-white">{name}</p>
            <p className="text-xs text-white/60 font-mono">{hex}</p>
        </div>
    </div>
);

export default function NemesisDigitalSection() {
    const roadmapSteps = [
        { week: "1–2", title: "Core Renderer", description: "SVG-3D pipeline, vector mesh format, basic transforms." },
        { week: "3–4", title: "Physics Integration", description: "KUHUL π engine, collision detection, rigidbody dynamics." },
        { week: "5–6", title: "Editor Tools", description: "Visual scene editor, node-based scripting, asset browser." },
        { week: "7–8", title: "Platform Export", description: "WebGL, desktop (Electron), mobile (Capacitor) builds." },
        { week: "9–10", title: "Audio & Input", description: "Spatial audio, gamepad support, input mapping." },
        { week: "11–12", title: "Beta Release", description: "Public SDK, documentation portal, starter templates." }
    ];

    return (
        <section id="nemesis-digital" className="fade-in space-y-24">
            <div>
                <div className="text-center mb-12">
                    <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Section 4</h2>
                    <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">Engine Interface</p>
                </div>
                
                <div className="glass-card rounded-2xl overflow-hidden mb-8 border border-purple-500/20">
                    <div className="p-3 bg-black/50 border-b border-white/10 flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="ml-auto text-xs text-white/40 font-mono">nemesis-engine v0.1.0</div>
                    </div>
                    <div className="p-8">
                        <h3 className="text-lg font-medium text-white mb-4 uppercase tracking-widest">Editor Preview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-light">
                            <div className="bg-black/30 p-6 rounded-lg border border-cyan-500/20">
                                <h4 className="font-medium text-cyan-400 mb-2">Scene Viewport</h4>
                                <div className="aspect-video bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-lg flex items-center justify-center border border-white/10">
                                    <svg viewBox="0 0 200 120" className="w-full h-full p-4">
                                        <rect x="20" y="80" width="160" height="2" fill="rgba(255,255,255,0.2)" />
                                        <polygon points="100,20 140,60 100,100 60,60" fill="none" stroke="cyan" strokeWidth="1" />
                                        <polygon points="100,20 140,60 100,60" fill="rgba(0,255,255,0.1)" />
                                        <circle cx="100" cy="60" r="3" fill="purple" />
                                        <text x="100" y="115" fill="rgba(255,255,255,0.5)" fontSize="8" textAnchor="middle">Grid: 10 units</text>
                                    </svg>
                                </div>
                            </div>
                            <div className="bg-black/30 p-6 rounded-lg border border-purple-500/20">
                                <h4 className="font-medium text-purple-400 mb-2">Inspector Panel</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between"><span className="text-white/60">Object:</span><span className="text-white">Diamond_01</span></div>
                                    <div className="flex justify-between"><span className="text-white/60">Position:</span><span className="text-cyan-400 font-mono">0, 0, 0</span></div>
                                    <div className="flex justify-between"><span className="text-white/60">Rotation:</span><span className="text-cyan-400 font-mono">0°, 45°, 0°</span></div>
                                    <div className="flex justify-between"><span className="text-white/60">Scale:</span><span className="text-cyan-400 font-mono">1, 1, 1</span></div>
                                    <div className="flex justify-between"><span className="text-white/60">Vertices:</span><span className="text-green-400">4 (vector)</span></div>
                                    <div className="flex justify-between"><span className="text-white/60">Material:</span><span className="text-purple-400">Glass_Refract</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass-card rounded-2xl p-8 border border-purple-500/20">
                        <div className="flex items-center gap-3 mb-6"><Palette className="w-5 h-5 text-purple-400" /><h4 className="text-base font-medium text-white uppercase tracking-widest">Engine Color Palette</h4></div>
                        <div className="space-y-4">
                            <ColorSwatch hex="#8B5CF6" name="Nemesis Purple" />
                            <ColorSwatch hex="#06B6D4" name="Cyber Cyan" />
                            <ColorSwatch hex="#0F172A" name="Deep Space" />
                            <ColorSwatch hex="#22D3EE" name="Glow Accent" />
                        </div>
                    </div>
                     <div className="glass-card rounded-2xl p-8 border border-cyan-500/20">
                        <div className="flex items-center gap-3 mb-6"><Type className="w-5 h-5 text-cyan-400" /><h4 className="text-base font-medium text-white uppercase tracking-widest">Tech Stack</h4></div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-lg text-white">Renderer: WebGL 2.0 / WebGPU</p>
                                <p className="text-white/60 text-sm">GPU-accelerated vector math</p>
                            </div>
                             <div>
                                <p className="text-lg text-white">Language: TypeScript + Rust (WASM)</p>
                                <p className="text-white/60 text-sm">Type-safe with native performance</p>
                            </div>
                             <div>
                                <p className="text-lg text-white">Physics: KUHUL π Deterministic</p>
                                <p className="text-white/60 text-sm">Reproducible simulations</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-white/10">
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-light text-white tracking-tight">Development Roadmap</h3>
                </div>
                <div className="relative border-l-2 border-purple-500/30 pl-10">
                    {roadmapSteps.map((step, index) => (
                        <div key={index} className="mb-12 relative last:mb-0">
                             <div className="absolute -left-[50px] top-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                                <span className="text-white font-mono text-sm">{index + 1}</span>
                            </div>
                            <p className="text-sm font-bold text-purple-400">Week {step.week}</p>
                            <h5 className="font-medium text-white text-lg">{step.title}</h5>
                            <p className="text-sm text-white/70 font-light mt-1">{step.description}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div className="flex items-center justify-center gap-2"><Terminal className="w-4 h-4 text-cyan-400"/> <span className="text-sm text-white/80">CLI Tools</span></div>
                    <div className="flex items-center justify-center gap-2"><Box className="w-4 h-4 text-purple-400"/> <span className="text-sm text-white/80">Visual Editor</span></div>
                    <div className="flex items-center justify-center gap-2"><Globe className="w-4 h-4 text-green-400"/> <span className="text-sm text-white/80">Open Source</span></div>
                </div>
            </div>
        </section>
    );
}