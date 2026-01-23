import React, { useState, useEffect, useRef } from "react";
import { 
    User,
    Briefcase,
    BarChart3,
    CalendarCheck,
    Mail,
    Zap,
    Download,
    Shield,
    Search,
    AlertTriangle,
    Edit3,
    Monitor,
    Info
} from "lucide-react";

const navigationItems = {
    Career: [
        { title: "Mission", id: "hero", icon: User },
        { title: "Studios", id: "studios", icon: Briefcase },
        { title: "Skills", id: "skills", icon: BarChart3 },
        { title: "Action Plan", id: "plan", icon: CalendarCheck },
        { title: "Contact", id: "contact", icon: Mail },
    ],
    SWOT: [
        { title: "Overview", id: "swot-hero", icon: Shield },
        { title: "Matrix", id: "swot-matrix", icon: BarChart3 },
        { title: "Action Plan", id: "swot-action", icon: CalendarCheck },
    ],
    Nemesis: [
        { title: "Intro", id: "nemesis-hero", icon: Zap },
        { title: "Research", id: "nemesis-research", icon: Search },
        { title: "Problems", id: "nemesis-problems-solutions", icon: AlertTriangle },
        { title: "Sketches", id: "nemesis-sketches", icon: Edit3 },
        { title: "Digital", id: "nemesis-digital", icon: Monitor },
        { title: "Credits", id: "nemesis-credits", icon: Info },
    ]
};

export default function Layout({ children, currentPageName }) {
    const [activeSection, setActiveSection] = useState(currentPageName === 'SWOT' ? 'swot-hero' : (currentPageName === 'Nemesis' ? 'nemesis-hero' : 'hero'));
    const observer = useRef(null);

    const currentNavItems = navigationItems[currentPageName] || navigationItems.Career;

    useEffect(() => {
        observer.current = new IntersectionObserver((entries) => {
            const visibleSection = entries.find((entry) => entry.isIntersecting)?.target;
            if (visibleSection) {
                setActiveSection(visibleSection.id);
            }
        }, { 
            threshold: 0.3,
            rootMargin: "-30% 0px -30% 0px"
        });

        const sections = document.querySelectorAll('section[id]');
        sections.forEach((section) => {
            if (observer.current) {
                observer.current.observe(section);
            }
        });

        return () => {
            sections.forEach((section) => {
                if (observer.current) {
                    observer.current.unobserve(section);
                }
            });
        };
    }, [children, currentPageName]);

    useEffect(() => {
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorOutline = document.querySelector('.cursor-outline');
        
        if (!cursorDot || !cursorOutline) return;

        let mouseX = 0, mouseY = 0;
        let outlineX = 0, outlineY = 0;
        let animationId;

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        };

        const animateOutline = () => {
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;
            cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0)`;
            animationId = requestAnimationFrame(animateOutline);
        };

        const handleMouseEnter = () => cursorOutline.classList.add('hover');
        const handleMouseLeave = () => cursorOutline.classList.remove('hover');

        const addListeners = () => {
            document.querySelectorAll('a, button').forEach(el => {
                el.addEventListener('mouseenter', handleMouseEnter);
                el.addEventListener('mouseleave', handleMouseLeave);
            });
        };

        const removeListeners = () => {
            document.querySelectorAll('a, button').forEach(el => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        animationId = requestAnimationFrame(animateOutline);
        addListeners();

        const mutationObserver = new MutationObserver((mutations) => {
            removeListeners();
            addListeners();
        });

        mutationObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
            removeListeners();
            mutationObserver.disconnect();
        };
    }, [children]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="relative min-h-screen bg-black text-white font-sans custom-cursor-area print:bg-white print:text-black">
             <div className="cursor-dot"></div>
             <div className="cursor-outline"></div>

            {/* Background - Hidden in Print */}
            <div className="fixed inset-0 z-0 print:hidden">
                <iframe 
                    src="https://my.spline.design/thresholddarkambientui-v0gkZCfi6zXm69kE0wccy70f/" 
                    frameBorder="0" 
                    width="100%" 
                    height="100%" 
                    className="w-full h-full"
                    loading="lazy"
                    title="3D Background"
                ></iframe>
            </div>

            {/* Sidebar - Hidden in Print */}
            <aside className="fixed inset-y-0 left-0 flex flex-col gap-3 sm:gap-4 py-6 px-3 items-center bg-transparent z-50 print:hidden">
                <a 
                    href={currentPageName === 'SWOT' ? '#swot-hero' : (currentPageName === 'Nemesis' ? '#nemesis-hero' : '#hero')}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform,background-color duration-150 bg-white text-black hover:scale-105 shadow-lg mb-4 will-change-transform"
                    aria-label="Go to top"
                >
                    <Zap className="w-5 h-5" />
                </a>
                
                {currentNavItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <a
                            key={item.title}
                            href={`#${item.id}`}
                            title={item.title}
                            aria-label={`Go to ${item.title}`}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 will-change-transform ${
                                isActive 
                                    ? 'bg-white text-black scale-105 shadow-md'
                                    : 'bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 hover:bg-opacity-20 hover:scale-105 text-white'
                            }`}
                        >
                            <item.icon className="w-4 h-4" />
                        </a>
                    );
                })}

                <button
                    onClick={handlePrint}
                    title="Print or Save as PDF"
                    aria-label="Print or save presentation as PDF"
                    className="w-9 h-9 mt-auto rounded-full flex items-center justify-center transition-all duration-150 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-10 hover:bg-opacity-20 hover:scale-105 text-white will-change-transform"
                >
                    <Download className="w-4 h-4" />
                </button>
            </aside>
            
            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center w-full px-4 custom-scrollbar overflow-y-auto min-h-screen sm:pl-20 md:pl-24 lg:pl-28 print:pl-0 print:px-8">
                {children}
            </main>
        </div>
    );
}