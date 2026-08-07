import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SplitText from "@/ui_comp/text";
import DecryptedText from "@/ui_comp/de_para";

export default function LandingPage() {
    const [animate, setAnimate] = useState(false);
    const [contentChanged, setContentChanged] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleClick = () => {
        setAnimate(true);
        setTimeout(() => setContentChanged(true), 1000); // Change content after animation
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen"></div>
            </div>

            {/* Content */}
            <motion.div
                className="relative z-10 text-center text-white px-8 md:px-16 w-full max-w-5xl"
                animate={animate ? { x: "-10%", y: "10%" } : { x: 0, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    {!contentChanged ? (
                        <div className={`flex flex-col items-center transition-opacity duration-1000 ${animate ? 'opacity-0' : 'opacity-100'}`}>
                            
                            {/* Logo Title text style */}
                            <div className="mb-6 flex flex-col items-center">
                                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-2">
                                    Geo<span className="text-gradient">Sense</span>
                                </h1>
                                <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
                            </div>

                            {/* Heading */}
                            <div className="mt-8 space-y-2">
                                <SplitText
                                    text="Web3-Powered Geospatial"
                                    className="text-3xl md:text-5xl font-medium tracking-tight text-center text-slate-200"
                                    delay={40}
                                    animationFrom={{ opacity: 0, transform: 'translate3d(0,30px,0)' }}
                                    animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                                    easing="easeOutCubic"
                                    threshold={0.2}
                                    rootMargin="-50px"
                                />
                                <SplitText
                                    text="Intelligence Platform"
                                    className="text-3xl md:text-5xl font-medium tracking-tight text-center text-slate-200"
                                    delay={40}
                                    animationFrom={{ opacity: 0, transform: 'translate3d(0,30px,0)' }}
                                    animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                                    easing="easeOutCubic"
                                    threshold={0.2}
                                    rootMargin="-50px"
                                />
                            </div>

                            <p className="mt-6 text-slate-400 text-lg max-w-xl text-center">
                                AI-driven satellite segmentation meets blockchain-based land asset management. Measure, analyze, and tokenize.
                            </p>

                            {/* CTA Button */}
                            <button
                                className="mt-12 bg-white text-black text-lg font-semibold px-8 py-4 rounded-full hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transform hover:scale-105"
                                onClick={handleClick}
                            >
                                Enter Mission Control →
                            </button>
                        </div>
                    ) : (
                        <div className={`flex flex-col items-start max-w-2xl text-left transition-opacity duration-1000 ${animate ? 'opacity-100' : 'opacity-0'}`}>
                            
                            <h2 className="text-4xl font-bold mb-4 text-white">
                                <span className="text-gradient">Analyze.</span> Tokenize. Own.
                            </h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 mb-8 rounded-full"></div>

                            <div className="space-y-6 text-slate-300">
                                <div className="font-mono text-blue-400 text-sm md:text-base mb-6 space-y-2 bg-blue-900/10 p-5 rounded-xl border border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)] w-fit">
                                    <div className="block">
                                        <DecryptedText
                                            text="> Initializing HQ-SAM AI models..."
                                            animateOn="view" speed={60} maxIterations={10} revealDirection="start"
                                        />
                                    </div>
                                    <div className="block">
                                        <DecryptedText
                                            text="> Establishing Web3 connection protocols..."
                                            animateOn="view" speed={60} maxIterations={10} revealDirection="start"
                                        />
                                    </div>
                                </div>
                                
                                <div className="text-xl md:text-2xl leading-relaxed text-slate-200 font-medium max-w-xl">
                                    GeoSense is a premium platform for measuring land area effortlessly. Draw a boundary, and our AI automatically segments parcels from high-resolution satellite imagery.
                                </div>
                                
                                <div className="text-base md:text-lg leading-relaxed text-slate-400 max-w-xl pt-2">
                                    Whether for real estate, agriculture, or urban planning, GeoSense makes land measurement simple, precise, and ready for on-chain tokenization.
                                </div>
                            </div>

                            {/* CTA Button */}
                            <Link href="/geosense">
                                <button className="mt-10 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-lg font-bold px-8 py-4 rounded-full hover:from-blue-500 hover:to-cyan-400 transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] transform hover:scale-105 flex items-center gap-2">
                                    Launch Interface
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Link>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* Earth Image */}
            <motion.div
                className={`absolute z-10 pointer-events-none ${animate ? 'right-0 top-1/2 -translate-y-1/2' : 'bottom-[-20%] right-[-10%]'}`}
                animate={animate ? { 
                    rotate: [0, 45],
                    scale: 1.2,
                    x: "30%", 
                    y: "0%",
                    opacity: 0.9
                } : { 
                    rotate: [0, 360],
                    x: 0, 
                    y: 0,
                    opacity: 0.6
                }}
                transition={{ 
                    duration: animate ? 2 : 120, 
                    ease: animate ? [0.22, 1, 0.36, 1] : "linear",
                    repeat: animate ? 0 : Infinity
                }}
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150"></div>
                    <Image
                        src="https://freesvg.org/img/3d-Earth-Globe.png"
                        alt="Earth view from space"
                        height={animate ? 800 : 700}
                        width={animate ? 800 : 700}
                        className="drop-shadow-[0_0_50px_rgba(59,130,246,0.3)] opacity-80"
                    />
                </div>
            </motion.div>
        </div>
    );
}