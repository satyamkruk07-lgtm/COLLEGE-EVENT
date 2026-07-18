"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logoutUser } from "@/lib/auth";

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans pt-20">
      
      {/* Fixed Background Image using Frame 115 */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center"
        style={{ backgroundImage: "url('/hero_frames/frame_115.jpg')" }}
      />
      {/* Dark overlay for contrast */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[-1]" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-16 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-white/10 pb-6 mb-8 mt-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
               <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
               <span className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-cyan-200">Admin Control Center</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Evora Admin Center</h1>
            <p className="text-white/60 mt-2 font-medium">Manage events, registrations, and platform announcements.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={handleLogout}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white bg-white/5 border border-white/20 rounded-xl hover:bg-red-500/80 hover:border-red-500 transition-colors shadow-sm"
            >
              Logout
            </button>
            <button className="w-full sm:w-auto bg-cyan-400 text-black px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]">
              + Create Event
            </button>
          </div>
        </div>

        {/* Quick Analytics Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl group hover:bg-black/50 hover:border-white/20 transition-all">
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Total Users</p>
            <h3 className="text-4xl font-black text-white group-hover:text-cyan-400 transition-colors">124</h3>
          </div>
          <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl group hover:bg-black/50 hover:border-white/20 transition-all">
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Active Events</p>
            <h3 className="text-4xl font-black text-white group-hover:text-cyan-400 transition-colors">3</h3>
          </div>
          <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl group hover:bg-black/50 hover:border-white/20 transition-all">
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Total Registrations</p>
            <h3 className="text-4xl font-black text-white group-hover:text-cyan-400 transition-colors">89</h3>
          </div>
        </div>

        {/* Event Management Table */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-1">
          <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Manage Events</h2>
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-white/60">Live Database</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="bg-white/5 border-b border-white/10 text-white/50 uppercase tracking-widest text-[0.65rem] font-bold">
                <tr>
                  <th className="px-6 py-4">Event Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Seats Filled</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                <tr className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5 font-bold text-white tracking-wide">Next-Gen AI Payments</td>
                  <td className="px-6 py-5 text-white/70">25 Aug 2026</td>
                  <td className="px-6 py-5">
                    <div className="w-full bg-white/10 rounded-full h-1.5 mt-1 overflow-hidden relative">
                      <div className="absolute top-0 left-0 h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ width: '55%' }}></div>
                    </div>
                    <span className="text-xs font-semibold text-white/50 mt-2 block tracking-widest">55 / 100</span>
                  </td>
                  <td className="px-6 py-5 text-right space-x-4">
                    <button className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-widest text-xs transition-colors">Edit</button>
                    <button className="text-red-400 hover:text-red-300 font-bold uppercase tracking-widest text-xs transition-colors">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
