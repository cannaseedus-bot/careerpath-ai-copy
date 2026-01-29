import React, { useState, useEffect } from 'react';
import { Gamepad2 } from 'lucide-react';

import Pagination from '@/components/shared/Pagination';
import NemesisHeroSection from '@/components/nemesis/NemesisHeroSection';
import NemesisResearchSection from '@/components/nemesis/NemesisResearchSection';
import NemesisProblemsSolutionsSection from '@/components/nemesis/NemesisProblemsSolutionsSection';
import NemesisSketchesSection from '@/components/nemesis/NemesisSketchesSection';
import NemesisDigitalSection from '@/components/nemesis/NemesisDigitalSection';
import NemesisCreditsSection from '@/components/nemesis/NemesisCreditsSection';

export default function NemesisPage() {
    const [showHeader, setShowHeader] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 30;
            if (scrolled !== !showHeader) {
                setShowHeader(!scrolled);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showHeader]);
    
    return (
        <div className="w-full max-w-7xl pt-20 pb-24 space-y-32 md:space-y-48">

            {/* Engine Version Header */}
            <div className={`fixed top-6 right-6 z-50 print:static print:top-0 print:right-0 print:mb-8 transition-all duration-500 ease-out ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
                <div className="glass-card rounded-xl p-4 text-right border border-purple-500/30 print:bg-white print:text-black print:border-black print:border-opacity-20 hover:bg-black hover:bg-opacity-30 transition-colors duration-300">
                    <div className="flex items-center justify-end gap-2 mb-2">
                        <Gamepad2 className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-xs font-light uppercase tracking-widest">Game Engine</span>
                    </div>
                    <div className="text-white font-medium text-sm">NEMESIS ENGINE v0.1.0</div>
                    <div className="text-cyan-400 text-opacity-80 text-xs font-light">KUHUL SVG-3D Core</div>
                    <div className="text-white text-opacity-70 text-xs font-light">Vector-Based Rendering</div>
                </div>
            </div>

            <NemesisHeroSection />
            <NemesisResearchSection />
            <NemesisProblemsSolutionsSection />
            <NemesisSketchesSection />
            <NemesisDigitalSection />
            <NemesisCreditsSection />

            {/* Pagination */}
            <Pagination currentPage="Nemesis" />
        </div>
    );
}