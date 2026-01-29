import React from 'react';
import { Gamepad2 } from 'lucide-react';

export default function NemesisHeroSection() {
    return (
        <section id="nemesis-hero" className="relative min-h-[90vh] flex flex-col items-center justify-center text-center fade-in">
            <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
                <img 
                    src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2940&auto=format&fit=crop"
                    alt="Dark gaming environment with neon lights"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-cyan-900/30"></div>
            </div>

            <div className="relative z-10 p-8">
                <div className="mb-8">
                    <div className="inline-block glass-card rounded-full p-4 mb-6 border-2 border-purple-500/50 animate-pulse">
                        <Gamepad2 className="w-12 h-12 text-purple-400" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        NEMESIS ENGINE
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-extralight text-white text-opacity-90 mt-4">
                        Powered by KUHUL SVG-3D
                    </h2>
                </div>
                
                <div className="glass-card rounded-2xl p-6 max-w-4xl mx-auto border border-purple-500/30">
                    <p className="text-lg md:text-xl text-white text-opacity-80 font-light leading-relaxed">
                        A next-generation vector-based 3D game engine leveraging mathematical geometry for unprecedented performance and visual fidelity
                    </p>
                    <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap justify-center gap-3">
                        <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm">Vector Graphics</span>
                        <span className="px-3 py-1 bg-cyan-600/30 text-cyan-300 rounded-full text-sm">SVG-3D Rendering</span>
                        <span className="px-3 py-1 bg-green-600/30 text-green-300 rounded-full text-sm">Real-time Physics</span>
                        <span className="px-3 py-1 bg-orange-600/30 text-orange-300 rounded-full text-sm">Cross-platform</span>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-4 text-xs text-white/40 font-light">
                KUHUL SVG-3D • Vector-Based Game Development Framework
            </div>
        </section>
    );
}