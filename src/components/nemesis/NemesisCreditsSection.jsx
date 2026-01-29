import React from 'react';
import { Github, Globe, Gamepad2 } from 'lucide-react';

export default function NemesisCreditsSection() {
    return (
        <section id="nemesis-credits" className="fade-in text-center pt-16">
            <div className="glass-card rounded-2xl p-8 border border-purple-500/20">
                <div className="inline-block p-3 rounded-full bg-gradient-to-br from-purple-600/30 to-cyan-600/30 mb-4">
                    <Gamepad2 className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-light text-white">NEMESIS ENGINE</h3>
                <p className="text-white/80 mt-2">Powered by KUHUL SVG-3D Technology</p>
                <p className="text-purple-400 text-sm font-mono mt-1">Vector-Based Game Development</p>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-sm text-white/70 uppercase tracking-widest mb-4">Resources</h4>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="#" className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                            <Github className="w-4 h-4 text-white/70" />
                            <span className="text-sm text-white/80">GitHub</span>
                        </a>
                        <a href="#" className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                            <Globe className="w-4 h-4 text-white/70" />
                            <span className="text-sm text-white/80">Documentation</span>
                        </a>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/50">
                    <p>Part of the MX2LM Ecosystem • MIT License</p>
                </div>
            </div>
        </section>
    );
}