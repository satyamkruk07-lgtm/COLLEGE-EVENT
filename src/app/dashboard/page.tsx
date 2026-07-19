"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';
import { logoutUser } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { 
  getAllEvents, registerForEvent, getUserRegistrations, cancelRegistration, 
  getAllAnnouncements, EventData, RegistrationData, AnnouncementData
} from "@/lib/firebase-db";

export default function StudentDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [events, setEvents] = useState<EventData[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        fetchDashboardData(user.uid);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    const [fetchedEvents, fetchedAnnouncements, fetchedRegs] = await Promise.all([
      getAllEvents(),
      getAllAnnouncements(),
      getUserRegistrations(userId)
    ]);
    
    setEvents(fetchedEvents);
    setAnnouncements(fetchedAnnouncements);
    setRegistrations(fetchedRegs);
    setLoading(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  const handleRegister = async (event: EventData) => {
    if (!currentUser) return;
    setProcessingId(event.id!);
    
    const res = await registerForEvent(
      event.id!, currentUser.uid, currentUser.displayName || "Student", currentUser.email || ""
    );
    
    if (res.success) {
      toast.success(res.message);
      await fetchDashboardData(currentUser.uid);
    } else {
      toast.error(res.message);
    }
    setProcessingId(null);
  };

  const handleCancelRegistration = async (eventId: string) => {
    if (!currentUser) return;
    if (!confirm("Are you sure you want to cancel this registration?")) return;
    
    setProcessingId(eventId);
    const res = await cancelRegistration(eventId, currentUser.uid);
    
    if (res.success) {
      toast.success(res.message);
      await fetchDashboardData(currentUser.uid);
    } else {
      toast.error(res.message);
    }
    setProcessingId(null);
  };

  // Helper to check if user is already registered for an event
  const isRegistered = (eventId: string) => registrations.some(r => r.eventId === eventId);

  return (
    <div className="min-h-screen relative overflow-hidden font-sans pt-20">
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: "url('/hero_frames/frame_050.jpg')" }} />
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
            <p className="text-white/60 mt-2 font-medium">Welcome back, {currentUser?.displayName || "Student"}! Here are your updates.</p>
          </div>
          <button onClick={handleLogout} className="px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white bg-white/5 border border-white/20 rounded-xl hover:bg-red-500/80 hover:border-red-500 transition-colors shadow-sm">
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Upcoming Events */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest">Available Events</h2>
            
            {loading ? (
              <div className="text-white/50 py-10 text-center">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-white/50 py-10 text-center bg-black/40 rounded-2xl border border-white/10">No events currently available.</div>
            ) : (
              events.map((event) => {
                const registered = isRegistered(event.id!);
                const isSoldOut = event.availableSeats <= 0;
                
                return (
                  <div key={event.id} className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-black/50 hover:border-white/20 transition-all shadow-2xl group overflow-hidden">
                    <div className="h-48 w-full relative">
                      <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
                      <div className="absolute bottom-4 left-6">
                        <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 bg-cyan-400/20 backdrop-blur-md rounded-full border border-cyan-400/20">{event.category}</span>
                      </div>
                    </div>
                    
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
                        <h3 className="font-bold text-2xl text-white tracking-tight group-hover:text-cyan-200 transition-colors">{event.name}</h3>
                        <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap ${isSoldOut ? 'text-red-400 bg-red-400/10 border border-red-400/20' : 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'}`}>
                          {event.availableSeats} Seats Left
                        </span>
                      </div>
                      
                      <p className="text-white/70 text-sm mb-6 leading-relaxed line-clamp-2">{event.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm text-white/60">
                        <div className="flex items-center gap-2"><span className="text-cyan-400">📅</span> {event.date} at {event.time}</div>
                        <div className="flex items-center gap-2"><span className="text-cyan-400">📍</span> {event.venue}</div>
                        <div className="flex items-center gap-2"><span className="text-cyan-400">⏳</span> Deadline: {event.deadline}</div>
                      </div>
                      
                      {registered ? (
                        <button disabled className="bg-white/10 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest w-full sm:w-auto opacity-50 cursor-not-allowed">
                          Already Registered
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleRegister(event)}
                          disabled={isSoldOut || processingId === event.id}
                          className="bg-cyan-400 text-black px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest w-full sm:w-auto hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:shadow-none"
                        >
                          {processingId === event.id ? "Processing..." : isSoldOut ? "Sold Out" : "Register Now"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar - Announcements & Tickets */}
          <div className="space-y-6">
            
            {/* Announcements Box */}
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl" />
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center">
                <span className="mr-2">📢</span> Announcements
              </h2>
              <div className="space-y-3">
                {announcements.length === 0 ? (
                  <p className="text-white/40 text-xs italic">No announcements.</p>
                ) : (
                  announcements.map(ann => (
                    <div key={ann.id} className="bg-black/30 p-4 rounded-xl border border-white/5">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm text-white font-bold">{ann.title}</p>
                        {ann.priority === 'high' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1.5" />}
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">{ann.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* My Registrations Box */}
            <div className="bg-black/40 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl">
              <h2 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-4">My Registrations</h2>
              
              {loading ? (
                <div className="text-center py-6 text-white/40 text-sm">Loading...</div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5 border-dashed">
                  <p className="text-white/40 text-sm italic">You haven't registered for any events yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {registrations.map(reg => {
                    const event = events.find(e => e.id === reg.eventId);
                    return (
                      <div key={reg.id} className="bg-white/5 rounded-xl border border-white/10 p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-white text-sm line-clamp-1">{event?.name || "Unknown Event"}</h3>
                        </div>
                        <div className="bg-white p-3 rounded-lg flex justify-center mb-4 max-w-[150px] mx-auto">
                          <QRCodeSVG value={reg.qrCodeData} size={100} />
                        </div>
                        <p className="text-center text-[0.65rem] text-white/50 font-mono mb-4 break-all px-2">{reg.qrCodeData}</p>
                        
                        <button 
                          onClick={() => handleCancelRegistration(reg.eventId)}
                          disabled={processingId === reg.eventId}
                          className="w-full text-xs font-bold uppercase tracking-widest text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {processingId === reg.eventId ? "Cancelling..." : "Cancel Ticket"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
