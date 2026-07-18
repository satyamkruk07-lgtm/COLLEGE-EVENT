"use client";

import { LogOut, Calendar, Users, Megaphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logoutUser } from "@/lib/auth";

export default function StudentDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans pt-20">
      
      {/* Fixed Background Image using Frame 050 */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center"
        style={{ backgroundImage: "url('/hero_frames/frame_050.jpg')" }}
      />
      {/* Dark overlay for contrast */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[-1]" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-16 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 border-b border-white/10 pb-6 mb-8 mt-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
               <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
               <span className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-cyan-200">Live Dashboard</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Evora Student Portal</h1>
            <p className="text-white/60 mt-2 font-medium">Welcome back! Here are your updates.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white bg-white/5 border border-white/20 rounded-xl hover:bg-red-500/80 hover:border-red-500 transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Upcoming Events */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest">Available Events</h2>
            
            {/* Event Card Placeholder 1 */}
            <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 hover:bg-black/50 hover:border-white/20 transition-all shadow-2xl group">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 rounded-full">Artificial Intelligence</span>
                   <h3 className="font-bold text-2xl text-white mt-4 tracking-tight group-hover:text-cyan-200 transition-colors">Next-Gen AI Payments Hackathon</h3>
                 </div>
                 <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full whitespace-nowrap">45 Seats Left</span>
               </div>
               <p className="text-white/60 text-sm mb-6 border-l-2 border-white/20 pl-4 py-1 leading-relaxed">
                 <span className="font-semibold text-white/80">Date:</span> 25 Aug 2026<br/>
                 <span className="font-semibold text-white/80">Time:</span> 10:00 AM<br/>
                 <span className="font-semibold text-white/80">Location:</span> Main Auditorium
               </p>
               <button className="bg-cyan-400 text-black px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest w-full sm:w-auto hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]">
                 Register Now
               </button>
            </div>
          </div>

          {/* Sidebar - Announcements & Tickets */}
          <div className="space-y-6">
            
            {/* Announcements Box */}
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl" />
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center">
                <span className="mr-2">📢</span> Announcements
              </h2>
              <div className="bg-black/30 p-5 rounded-xl border border-white/5">
                <p className="text-sm text-white font-bold mb-1">Platform Update</p>
                <p className="text-xs text-white/60 leading-relaxed">QR Code registration is now live for all upcoming hackathons. Ensure your profile is complete.</p>
              </div>
            </div>

            {/* My Registrations Box */}
            <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">
              <h2 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-4">My Registrations</h2>
              <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5 border-dashed">
                <p className="text-white/40 text-sm italic">You haven't registered for any events yet.</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
