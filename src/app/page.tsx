"use client";

import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ShieldCheck, BarChart3, Zap, ArrowRight, Calendar, Users, Star, Ticket } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

// Spring Configs
const springTransition = { type: "spring" as const, stiffness: 200, damping: 26 };

export default function Home() {
  const [loaderReady, setLoaderReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  
  const FRAME_COUNT = 118;

  // Global Scroll Binding - Tracks the entire document scroll
  const { scrollYProgress } = useScroll();

  const currentFrame = useTransform(scrollYProgress, [0, 1], [1, FRAME_COUNT]);

  // Preload Images for Canvas
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      // Ensure zero-padding matches extracted format: frame_001.jpg
      const paddedIndex = i.toString().padStart(3, '0');
      img.src = `/hero_frames/frame_${paddedIndex}.jpg`;
      
      img.onload = () => {
        loadedCount++;
        // If all images loaded, trigger initial draw
        if (loadedCount === FRAME_COUNT && canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) drawImageCover(ctx, loadedImages[0], canvasRef.current);
        }
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Utility to simulate 'object-fit: cover' on Canvas
  const drawImageCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvas: HTMLCanvasElement) => {
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    } else {
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Listen to scroll changes and update canvas
  useMotionValueEvent(currentFrame, "change", (latest) => {
    if (!canvasRef.current || images.length === 0) return;
    
    // Ensure index bounds
    const frameIndex = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(latest) - 1));
    const img = images[frameIndex];
    const ctx = canvasRef.current.getContext("2d");
    
    if (img && ctx) {
      drawImageCover(ctx, img, canvasRef.current);
    }
  });

  // Handle Canvas Resize
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        
        // Redraw current frame after resize
        if (images.length > 0) {
          const currentIdx = Math.min(FRAME_COUNT - 1, Math.max(0, Math.floor(currentFrame.get()) - 1));
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) drawImageCover(ctx, images[currentIdx], canvasRef.current);
        }
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [images, currentFrame]);

  useEffect(() => {
    // Cinematic Loader simulation
    const timer = setTimeout(() => {
      setLoaderReady(true);
      document.documentElement.classList.remove("locked");
    }, 2000);
    document.documentElement.classList.add("locked");
    return () => clearTimeout(timer);
  }, []);

  // Evora 2026 Text Array
  const headline = ["EVORA", "2026"];

  return (
    <>
      {/* Cinematic Loader */}
      {!loaderReady && (
        <motion.div
          initial={{ y: "0%" }}
          exit={{ y: "-105%" }}
          transition={{ duration: 0.85, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-8 text-white"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
            className="flex items-center gap-3 font-medium uppercase tracking-[0.2em] text-cyan-400"
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="9"/><path d="M4.8 5.6A9 9 0 0 0 4.8 18.4"/><path d="M19.2 5.6a9 9 0 0 1 0 12.8"/>
            </svg>
            EVORA
          </motion.div>
          <div className="w-40 h-[1px] bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.28, delay: 0.12, ease: "easeInOut" }}
              className="w-full h-full bg-cyan-400 origin-left drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
            />
          </div>
        </motion.div>
      )}

      {/* FIXED GLOBAL CANVAS BACKGROUND */}
      <div className="fixed inset-0 z-[-10] w-full h-full bg-black">
         <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-60"
         />
         {/* Subtle overlay to ensure text readability */}
         <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      {/* Main Content Layout - All sections are now transparent / glassmorphic */}
      <div className="w-full relative z-10 text-white font-sans">
        
        {/* 1. Hero Section */}
        <section id="hero" className="relative min-h-[100vh] flex flex-col items-center justify-center pt-20 pb-32">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: loaderReady ? 1 : 0, y: loaderReady ? 0 : 30 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="px-6 sm:px-10 text-center flex flex-col items-center max-w-4xl mx-auto mt-24"
            >
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-cyan-200">Next-Gen Event Platform</span>
              </div>

              {/* Refined Headline */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
                Architecting the Future of <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Tech Events.</span>
              </h1>
              
              {/* Subtitle description */}
              <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
                Seamlessly register, manage, and scale your university tech fests with Evora's real-time, high-performance infrastructure.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                 <Link href="/login" className="w-full sm:w-auto relative group inline-flex justify-center items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                    <span>Access Portal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Link>
                 
                 <Link href="#features" className="w-full sm:w-auto inline-flex justify-center items-center gap-3 bg-white/5 border border-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors">
                    <span>Explore Features</span>
                 </Link>
              </div>
            </motion.div>
        </section>

        {/* 2. Features / Trust Section */}
        <section id="features" className="relative px-6 sm:px-10 py-20 sm:py-28 mx-2 sm:mx-3">
          
          <div className="flex flex-col sm:flex-row justify-between gap-6 relative z-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={springTransition}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/10 backdrop-blur-md flex flex-col items-center justify-center text-center border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
            >
              <div className="text-2xl font-medium">100%</div>
              <div className="text-[0.6rem] text-white/70 max-w-[7em] mt-1 leading-tight uppercase tracking-wider">Secure Infrastructure</div>
            </motion.div>

            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ ...springTransition, delay: 0.12 }}
              className="max-w-[32rem] rounded-[1.5rem] bg-white/5 backdrop-blur-lg border border-white/10 p-6 flex flex-col gap-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
            >
              <div className="rounded-xl bg-white/10 px-4 py-2 text-xl font-medium self-start border border-white/20">#01</div>
              <div>
                <h3 className="text-lg font-medium text-white">Trusted by Top Institutions</h3>
                <p className="text-sm text-white/70 leading-relaxed mt-2">From massive hackathons to exclusive tech workshops, Evora provides the resilient infrastructure required for scale. Built with modern web technologies to ensure your data stays secure and operations run smoothly under heavy traffic.</p>
              </div>
            </motion.article>
          </div>

          <div className="max-w-[88rem] mx-auto mt-24 mb-10 text-center pointer-events-none select-none">
            <h2 className="text-[6vw] sm:text-[5vw] font-black uppercase leading-[1.1] tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Scalable <span className="text-cyan-400">Data-Driven</span> Platform
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 relative z-10">
            {[
              { icon: ShieldCheck, title: "Role-Based Security", desc: "Strict RBAC via Firebase ensuring admins have control and students have privacy." },
              { icon: BarChart3, title: "Real-Time Tracking", desc: "Live event capacities and instant dashboard updates the moment a ticket is booked." },
              { icon: Zap, title: "Frictionless UI", desc: "Optimized user flows designed to minimize clicks and maximize registration conversions." }
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ ...springTransition, delay: i * 0.1 }}
                whileHover={{ y: -8, transition: { type: "spring", stiffness: 300, damping: 22 } }}
                className="rounded-[1.5rem] bg-white/5 backdrop-blur-md border border-white/10 p-8 flex flex-col justify-between"
              >
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                  <feat.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-medium tracking-tight mb-3 text-white">{feat.title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 3. Workflow / How it works */}
        <section className="px-6 sm:px-10 py-16 mx-2 sm:mx-3 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-400 mb-4"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> How it Works
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-medium leading-[0.95] tracking-tight mb-16 text-white"
            >
              Three steps to<br/>the frontline
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/20 pt-12">
              {[
                { step: "01", icon: Calendar, title: "Discover", text: "Browse the latest tech events, workshops, and hackathons hosted by top universities." },
                { step: "02", icon: Ticket, title: "Secure Seat", text: "Register with a single click. Our real-time database locks in your spot instantly." },
                { step: "03", icon: Users, title: "Participate", text: "Get your QR code, join the community, and elevate your skills on the day." }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ ...springTransition, delay: i * 0.15 }}
                  className="flex flex-col gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl"
                >
                  <span className="text-sm font-bold text-cyan-400 tracking-widest">{item.step}</span>
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-medium tracking-tight mt-2 text-white">{item.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Testimonials */}
        <section className="px-6 sm:px-10 py-16 mx-2 sm:mx-3 border-t border-white/20 relative z-10">
           <div className="max-w-7xl mx-auto">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-400 mb-4"
             >
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Testimonials
             </motion.div>
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="text-5xl md:text-6xl font-medium leading-[0.95] tracking-tight mb-16 text-white"
             >
               Trusted by the<br/>student community
             </motion.h2>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: "Rahul S.", role: "CS Student", text: "Evora made registering for the AI Workshop incredibly fast. No more crashing Google Forms." },
                  { name: "Priya M.", role: "Event Admin", text: "Managing 500+ participants used to be a nightmare. Now I see everything clearly on my dashboard." },
                  { name: "David L.", role: "Hackathon Lead", text: "The real-time seat availability feature alone saved us hours of answering emails." }
                ].map((test, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ ...springTransition, delay: i * 0.1 }}
                    whileHover={{ y: -5, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 text-white p-8 rounded-2xl flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
                  >
                    <div>
                      <div className="flex gap-1 mb-6">
                        {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-cyan-400 text-cyan-400" />)}
                      </div>
                      <blockquote className="text-lg leading-relaxed font-medium">"{test.text}"</blockquote>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/20">
                      <div className="font-bold text-sm tracking-wide">{test.name}</div>
                      <div className="text-xs text-white/50 uppercase tracking-widest mt-1">{test.role}</div>
                    </div>
                  </motion.div>
                ))}
             </div>
           </div>
        </section>

        {/* 5. Stats Section */}
        <section id="stats" className="bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-[2rem] mt-16 mx-2 sm:mx-3 p-10 sm:p-20 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-400"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> By the numbers
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-medium leading-[0.95] tracking-tight mt-4 text-white"
          >
            An infrastructure<br/>built to scale
          </motion.h2>
          
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mt-16">
            {[
              { val: "10K+", label: "Active Users" },
              { val: "500+", label: "Events Hosted" },
              { val: "0.2s", label: "Latency" },
              { val: "99%", label: "Uptime" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ...springTransition, delay: i * 0.11 }}
                className="border-t border-white/20 pt-5"
              >
                <dd className="text-6xl sm:text-7xl font-medium tracking-tight leading-none text-white drop-shadow-md">{stat.val}</dd>
                <dt className="text-sm text-cyan-400 mt-3 uppercase tracking-wider">{stat.label}</dt>
              </motion.div>
            ))}
          </dl>
        </section>

        {/* 6. Footer CTA */}
        <footer className="bg-black/40 backdrop-blur-md text-white rounded-[2rem] mt-3 mx-2 sm:mx-3 p-10 sm:p-20 relative z-10 border border-white/10 mb-3">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-8 border-b border-white/15 pb-14">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-400">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Get started
              </div>
              <h2 className="text-6xl font-medium leading-[0.92] tracking-tight mt-4 text-white">
                Ready to<br/>deploy?
              </h2>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...springTransition, delay: 0.15 }}
            >
              <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-white text-black px-7 py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-cyan-400 transition-colors">
                Access Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
          
          <div className="pt-8 text-sm text-white/60 flex flex-col sm:flex-row justify-between items-center gap-5">
            <p>© 2026 Evora Platform. All rights reserved.</p>
            <div className="flex gap-5">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
