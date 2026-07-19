"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { logoutUser } from "@/lib/auth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { 
  getAllEvents, registerForEvent, getUserRegistrations, cancelRegistration, 
  getAllAnnouncements, EventData, RegistrationData, AnnouncementData
} from "@/lib/firebase-db";

const registrationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  collegeEmail: z.string().email("Invalid email address"),
  course: z.string().min(2, "Course is required"),
  branch: z.string().min(2, "Branch is required"),
  mobileNo: z.string().min(10, "Valid mobile number required"),
});

export default function StudentDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [events, setEvents] = useState<EventData[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modals
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  
  // Registration Form State
  const [selectedEventToRegister, setSelectedEventToRegister] = useState<EventData | null>(null);

  const regForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { name: "", collegeEmail: "", course: "", branch: "", mobileNo: "" }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        regForm.setValue("name", user.displayName || "");
        regForm.setValue("collegeEmail", user.email || "");
        fetchDashboardData(user.uid);
      } else {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, [router, regForm]);

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

  const openRegistrationModal = (event: EventData) => {
    setSelectedEventToRegister(event);
  };

  const onRegisterSubmit = async (values: z.infer<typeof registrationSchema>) => {
    if (!currentUser || !selectedEventToRegister) return;
    
    setProcessingId(selectedEventToRegister.id!);
    
    const res = await registerForEvent(
      selectedEventToRegister.id!, 
      currentUser.uid, 
      values.name, 
      values.collegeEmail,
      values.course,
      values.branch,
      values.mobileNo
    );
    
    if (res.success) {
      toast.success(res.message);
      setSelectedEventToRegister(null);
      await fetchDashboardData(currentUser.uid);
    } else {
      toast.error(res.message);
    }
    setProcessingId(null);
  };

  const handleCancelRegistration = async (eventId: string) => {
    if (!currentUser) return;
    if (!confirm("Are you sure you want to cancel this ticket?")) return;
    
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
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button onClick={() => setIsTicketsModalOpen(true)} className="w-full sm:w-auto bg-cyan-400 text-black px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              🎟️ My Tickets ({registrations.length})
            </button>
            <button onClick={handleLogout} className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white bg-white/5 border border-white/20 rounded-xl hover:bg-red-500/80 hover:border-red-500 transition-colors shadow-sm">
              Logout
            </button>
          </div>
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
                          onClick={() => openRegistrationModal(event)}
                          disabled={isSoldOut}
                          className="bg-cyan-400 text-black px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest w-full sm:w-auto hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:shadow-none"
                        >
                          {isSoldOut ? "Sold Out" : "Register Now"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar - Announcements */}
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

          </div>
        </div>
      </div>

      {/* REGISTRATION FORM MODAL */}
      {selectedEventToRegister && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !processingId && setSelectedEventToRegister(null)}></div>
          <div className="bg-[#0c1421] border border-white/10 rounded-2xl w-full max-w-lg relative z-10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Register for Event</h2>
            <p className="text-white/50 text-sm mb-6">Complete your details to secure your seat for <strong className="text-white">{selectedEventToRegister.name}</strong>.</p>
            
            <form onSubmit={regForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Full Name</label>
                <input {...regForm.register("name")} className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white" />
                {regForm.formState.errors.name && <p className="text-red-400 text-xs mt-1">{regForm.formState.errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">College Email ID</label>
                <input {...regForm.register("collegeEmail")} type="email" className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white" />
                {regForm.formState.errors.collegeEmail && <p className="text-red-400 text-xs mt-1">{regForm.formState.errors.collegeEmail.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Course (e.g. B.Tech)</label>
                  <input {...regForm.register("course")} className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white" />
                  {regForm.formState.errors.course && <p className="text-red-400 text-xs mt-1">{regForm.formState.errors.course.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Branch</label>
                  <input {...regForm.register("branch")} className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white" />
                  {regForm.formState.errors.branch && <p className="text-red-400 text-xs mt-1">{regForm.formState.errors.branch.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Mobile No.</label>
                <input {...regForm.register("mobileNo")} type="tel" className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white" />
                {regForm.formState.errors.mobileNo && <p className="text-red-400 text-xs mt-1">{regForm.formState.errors.mobileNo.message}</p>}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setSelectedEventToRegister(null)} disabled={!!processingId} className="px-5 py-2 text-white/70 hover:text-white transition-colors disabled:opacity-50">Cancel</button>
                <button type="submit" disabled={!!processingId} className="bg-cyan-400 text-black px-6 py-2 rounded-lg font-bold hover:bg-cyan-300 disabled:opacity-50">
                  {processingId ? "Confirming..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MY TICKETS MODAL (GALLERY) */}
      {isTicketsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsTicketsModalOpen(false)}></div>
          <div className="bg-[#0c1421] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 p-6 md:p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
              <h2 className="text-3xl font-black text-white">My Tickets</h2>
              <button onClick={() => setIsTicketsModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                ✕ Close
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-10 text-white/40 text-sm">Loading tickets...</div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                <p className="text-white/40 text-lg">You haven't booked any tickets yet.</p>
                <button onClick={() => setIsTicketsModalOpen(false)} className="mt-4 px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">Browse Events</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registrations.map(reg => {
                  const event = events.find(e => e.id === reg.eventId);
                  return (
                    <div key={reg.id} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative group">
                      <div className="bg-gradient-to-br from-cyan-400/20 to-transparent p-4 border-b border-white/10">
                        <h3 className="font-bold text-white text-lg line-clamp-1">{event?.name || "Event Ticket"}</h3>
                        <p className="text-xs text-white/60 mt-1">{event?.date} at {event?.time}</p>
                      </div>
                      
                      <div className="p-6 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-xl mb-4">
                          <QRCodeSVG value={reg.qrCodeData} size={140} />
                        </div>
                        <p className="text-center text-[0.65rem] text-white/50 font-mono mb-4 bg-black/40 px-3 py-1.5 rounded-full">{reg.qrCodeData}</p>
                        
                        <div className="w-full text-xs text-white/60 space-y-1 mb-6 bg-black/20 p-3 rounded-lg">
                          <p><strong className="text-white/80">Name:</strong> {reg.userName}</p>
                          <p><strong className="text-white/80">Course:</strong> {reg.course} - {reg.branch}</p>
                        </div>
                        
                        <button 
                          onClick={() => handleCancelRegistration(reg.eventId)}
                          disabled={processingId === reg.eventId}
                          className="w-full text-xs font-bold uppercase tracking-widest text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/20 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                        >
                          {processingId === reg.eventId ? "Cancelling..." : "Cancel Ticket"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
