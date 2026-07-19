import ParticlesBackground from "@/components/particles-background";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EventsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white pt-24 font-sans">
      <ParticlesBackground />
      
      <div className="container mx-auto max-w-7xl px-6 sm:px-10 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover <span className="text-cyan-400">Events</span></h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Browse our curated list of next-generation tech events, hackathons, and global summits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {/* Placeholder Event Card */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/10 transition-colors cursor-pointer group">
            <div className="inline-block px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
              Artificial Intelligence
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">Next-Gen AI Hackathon</h3>
            <p className="text-white/50 text-sm mb-6">Join the global challenge to build the future of AI payments and infrastructure.</p>
            
            <div className="space-y-2 text-sm text-white/70 mb-8">
              <div className="flex justify-between"><span>Date:</span> <span className="text-white">Aug 25, 2026</span></div>
              <div className="flex justify-between"><span>Location:</span> <span className="text-white">Main Auditorium</span></div>
            </div>
            
            <Link href="/login" className="block w-full py-3 text-center bg-white/10 hover:bg-cyan-400 hover:text-black rounded-lg font-bold transition-all">
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
