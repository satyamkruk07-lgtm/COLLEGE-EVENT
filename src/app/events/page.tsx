"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { getAllEvents, registerForEvent, EventData } from "@/lib/firebase-db";
import ParticlesBackground from "@/components/particles-background";

const registrationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  collegeEmail: z.string().email("Invalid email address"),
  course: z.string().min(2, "Course is required"),
  branch: z.string().min(2, "Branch is required"),
  mobileNo: z.string().min(10, "Valid mobile number required"),
});

export default function EventsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Registration Form State
  const [selectedEventToRegister, setSelectedEventToRegister] = useState<EventData | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const regForm = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { name: "", collegeEmail: "", course: "", branch: "", mobileNo: "" }
  });

  useEffect(() => {
    // Check if user is logged in
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        regForm.setValue("name", user.displayName || "");
        regForm.setValue("collegeEmail", user.email || "");
      } else {
        setCurrentUser(null);
      }
    });

    fetchEvents();

    return () => unsubscribe();
  }, [regForm]);

  const fetchEvents = async () => {
    setLoading(true);
    const fetchedEvents = await getAllEvents();
    setEvents(fetchedEvents);
    setLoading(false);
  };

  const handleRegisterClick = (event: EventData) => {
    if (!currentUser) {
      // Not logged in -> redirect to login
      toast.info("Please login to register for events.");
      router.push("/login");
      return;
    }
    // Logged in -> open modal
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
      toast.success("Successfully registered! Check your Dashboard for the ticket.");
      setSelectedEventToRegister(null);
      fetchEvents(); // Refresh seats
      // Optionally redirect to dashboard to see the ticket
      setTimeout(() => router.push("/dashboard"), 1500);
    } else {
      toast.error(res.message);
    }
    setProcessingId(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white pt-24 font-sans">
      <ParticlesBackground />
      
      <div className="container mx-auto max-w-7xl px-6 sm:px-10 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover <span className="text-cyan-400">Events</span></h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Browse our curated list of next-generation tech events, hackathons, and global summits hosted by Evora Platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {loading ? (
            <div className="col-span-full py-20 text-center text-white/50 text-xl font-bold animate-pulse">
              Loading Events...
            </div>
          ) : events.length === 0 ? (
            <div className="col-span-full py-20 text-center text-white/50 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
              No upcoming events found. Please check back later!
            </div>
          ) : (
            events.map((event) => {
              const isSoldOut = event.availableSeats <= 0;
              
              return (
                <div key={event.id} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-white/10 transition-colors group flex flex-col">
                  {/* Banner Image */}
                  <div className="h-48 w-full relative">
                    <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-4 left-6">
                      <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 bg-cyan-400/20 backdrop-blur-md rounded-full border border-cyan-400/20">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className="text-xl font-bold group-hover:text-cyan-400 transition-colors line-clamp-2">{event.name}</h3>
                    </div>
                    <p className="text-white/50 text-sm mb-6 line-clamp-2 flex-1">{event.description}</p>
                    
                    <div className="space-y-2 text-sm text-white/70 mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
                      <div className="flex justify-between"><span>Date:</span> <span className="text-white font-medium">{event.date}</span></div>
                      <div className="flex justify-between"><span>Time:</span> <span className="text-white font-medium">{event.time}</span></div>
                      <div className="flex justify-between"><span>Seats Left:</span> <span className={isSoldOut ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>{event.availableSeats}</span></div>
                    </div>
                    
                    <button 
                      onClick={() => handleRegisterClick(event)}
                      disabled={isSoldOut}
                      className="block w-full py-3 text-center bg-cyan-400 text-black hover:bg-cyan-300 rounded-lg font-bold transition-all disabled:opacity-50 disabled:bg-white/10 disabled:text-white/50"
                    >
                      {isSoldOut ? "Sold Out" : "Register Now"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* REGISTRATION FORM MODAL */}
      {selectedEventToRegister && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !processingId && setSelectedEventToRegister(null)}></div>
          <div className="bg-[#0c1421] border border-white/10 rounded-2xl w-full max-w-lg relative z-10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-left">
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

    </div>
  );
}
