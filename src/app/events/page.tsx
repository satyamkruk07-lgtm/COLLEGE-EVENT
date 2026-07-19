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
import EventSkeleton from "@/components/event-skeleton";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Search, Calendar as CalendarIcon, Grid } from "lucide-react";

const registrationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  collegeEmail: z.string().email("Invalid email address"),
  course: z.string().min(2, "Course is required"),
  branch: z.string().min(2, "Branch is required"),
  mobileNo: z.string().min(10, "Valid mobile number required"),
});

const ITEMS_PER_PAGE = 6;

export default function EventsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const categories = ["All", "Technology", "Hackathon", "Workshop", "Conference", "Cultural"];

  // View Mode
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Registration Form State
  const [selectedEventToRegister, setSelectedEventToRegister] = useState<EventData | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

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
      toast.info("Please login to register for events.");
      router.push("/login");
      return;
    }
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
      fetchEvents();
      setTimeout(() => router.push("/dashboard"), 1500);
    } else {
      toast.error(res.message);
    }
    setProcessingId(null);
  };

  // Derived state for Filtering
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === "All" || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Derived state for Pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const currentEvents = filteredEvents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Derived state for Calendar
  const eventDates = events.map(e => new Date(e.date));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const eventsOnSelectedDate = selectedDate 
    ? filteredEvents.filter(e => {
        const d = new Date(e.date);
        return d.getDate() === selectedDate.getDate() && 
               d.getMonth() === selectedDate.getMonth() && 
               d.getFullYear() === selectedDate.getFullYear();
      })
    : [];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white pt-24 font-sans">
      <ParticlesBackground />
      
      <div className="container mx-auto max-w-7xl px-6 sm:px-10 relative z-10">
        
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover <span className="text-cyan-400">Events</span></h1>
            <p className="text-white/60 text-lg max-w-2xl">
              Browse our curated list of next-generation tech events, hackathons, and global summits.
            </p>
          </div>
          
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="text" 
                placeholder="Search events..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            
            <select 
              value={categoryFilter} 
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-cyan-400 appearance-none text-white [&>option]:bg-[#0c1421] [&>option]:text-white"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            <div className="flex bg-white/5 rounded-xl border border-white/10 p-1">
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-cyan-400 text-black' : 'text-white/50 hover:text-white'}`}>
                <Grid className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode("calendar")} className={`p-2 rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-cyan-400 text-black' : 'text-white/50 hover:text-white'}`}>
                <CalendarIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic View Mode */}
        {viewMode === "grid" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
              {loading ? (
                <>
                  <EventSkeleton />
                  <EventSkeleton />
                  <EventSkeleton />
                  <EventSkeleton />
                  <EventSkeleton />
                  <EventSkeleton />
                </>
              ) : currentEvents.length === 0 ? (
                <div className="col-span-full py-20 text-center text-white/50 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md">
                  No upcoming events found matching your criteria.
                </div>
              ) : (
                currentEvents.map((event) => {
                  const isSoldOut = event.availableSeats <= 0;
                  return (
                    <div key={event.id} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-white/10 transition-colors group flex flex-col">
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
                        <h3 className="text-xl font-bold group-hover:text-cyan-400 transition-colors mb-2 line-clamp-1">{event.name}</h3>
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

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pb-20">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg disabled:opacity-30 hover:bg-white/20 transition-colors"
                >
                  Previous
                </button>
                <span className="text-white/60 text-sm font-medium">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg disabled:opacity-30 hover:bg-white/20 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex justify-center">
              <style>{`
                .rdp { --rdp-cell-size: 45px; --rdp-accent-color: #22d3ee; --rdp-background-color: rgba(34,211,238,0.2); }
                .rdp-day_selected { font-weight: bold; }
                .rdp-day_today { color: #22d3ee; font-weight: bold; }
              `}</style>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                modifiers={{ booked: eventDates }}
                modifiersStyles={{ booked: { border: '2px solid #22d3ee' } }}
              />
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Events on {selectedDate?.toLocaleDateString()}</h2>
              {eventsOnSelectedDate.length === 0 ? (
                <div className="text-white/40 p-8 border border-white/10 border-dashed rounded-xl text-center">
                  No events scheduled for this date.
                </div>
              ) : (
                <div className="space-y-4">
                  {eventsOnSelectedDate.map(event => (
                    <div key={event.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{event.category}</span>
                        <h3 className="text-lg font-bold text-white mt-1">{event.name}</h3>
                        <p className="text-sm text-white/60 mt-1">{event.time} • {event.venue}</p>
                      </div>
                      <button 
                        onClick={() => handleRegisterClick(event)}
                        disabled={event.availableSeats <= 0}
                        className="px-6 py-2 bg-cyan-400 text-black font-bold text-sm rounded-lg hover:bg-cyan-300 disabled:opacity-50"
                      >
                        {event.availableSeats <= 0 ? "Sold Out" : "Register"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
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

    </div>
  );
}
