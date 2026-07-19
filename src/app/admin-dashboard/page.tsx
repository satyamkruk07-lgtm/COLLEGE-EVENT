"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { logoutUser } from "@/lib/auth";
import { 
  getAllEvents, createEvent, updateEvent, deleteEvent, 
  uploadEventImage, getEventRegistrations, EventData, RegistrationData,
  createAnnouncement, getAllAnnouncements, AnnouncementData
} from "@/lib/firebase-db";

const eventSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description is too short"),
  date: z.string(),
  time: z.string(),
  venue: z.string(),
  category: z.string(),
  deadline: z.string(),
  totalSeats: z.coerce.number().min(1, "Must have at least 1 seat"),
});

const announcementSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  priority: z.enum(["low", "medium", "high"])
});

export default function AdminDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Registrations Modal
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  // Announcements
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      name: "", description: "", date: "", time: "", venue: "", category: "Technology", deadline: "", totalSeats: 100
    }
  });

  const announceForm = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title: "", content: "", priority: "medium" }
  });

  const fetchEvents = async () => {
    setLoading(true);
    const data = await getAllEvents();
    setEvents(data);
    setLoading(false);
  };

  const fetchAnnouncements = async () => {
    const data = await getAllAnnouncements();
    setAnnouncements(data);
  };

  useEffect(() => {
    fetchEvents();
    fetchAnnouncements();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setImageFile(null);
    form.reset({ name: "", description: "", date: "", time: "", venue: "", category: "Technology", deadline: "", totalSeats: 100 });
    setIsEventModalOpen(true);
  };

  const openEditModal = (event: EventData) => {
    setEditingEvent(event);
    setImageFile(null);
    form.reset({
      name: event.name, description: event.description, date: event.date, time: event.time, 
      venue: event.venue, category: event.category, deadline: event.deadline, totalSeats: event.totalSeats
    });
    setIsEventModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    const success = await deleteEvent(id);
    if (success) {
      toast.success("Event deleted!");
      fetchEvents();
    } else {
      toast.error("Failed to delete event.");
    }
  };

  const handleViewRegistrations = async (eventId: string) => {
    setIsRegModalOpen(true);
    setLoadingRegs(true);
    const regs = await getEventRegistrations(eventId);
    setRegistrations(regs);
    setLoadingRegs(false);
  };

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    setIsSubmitting(true);
    try {
      let imageUrl = editingEvent?.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop";
      
      if (imageFile) {
        toast.info("Uploading image...");
        imageUrl = await uploadEventImage(imageFile);
      }

      const eventData = { ...values, imageUrl };

      if (editingEvent?.id) {
        await updateEvent(editingEvent.id, eventData);
        toast.success("Event updated successfully!");
      } else {
        await createEvent(eventData);
        toast.success("Event created successfully!");
      }
      setIsEventModalOpen(false);
      fetchEvents();
    } catch (error) {
      toast.error("An error occurred.");
    }
    setIsSubmitting(false);
  };

  const onAnnounceSubmit = async (values: z.infer<typeof announcementSchema>) => {
    const success = await createAnnouncement({ ...values, date: new Date().toISOString() });
    if (success) {
      toast.success("Announcement published!");
      setIsAnnounceModalOpen(false);
      announceForm.reset();
      fetchAnnouncements();
    } else {
      toast.error("Failed to publish.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans pt-20">
      <div className="fixed inset-0 z-[-1] bg-cover bg-center" style={{ backgroundImage: "url('/hero_frames/frame_115.jpg')" }} />
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[-1]" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-16 relative z-10">
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
            <button onClick={handleLogout} className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white bg-white/5 border border-white/20 rounded-xl hover:bg-red-500/80 hover:border-red-500 transition-colors shadow-sm">
              Logout
            </button>
            <button onClick={openCreateModal} className="w-full sm:w-auto bg-cyan-400 text-black px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              + Create Event
            </button>
          </div>
        </div>

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
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Seats</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-8">Loading events...</td></tr>
                ) : events.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8">No events found. Create one!</td></tr>
                ) : events.map(event => (
                  <tr key={event.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-5 font-bold text-white tracking-wide flex items-center gap-3">
                      <img src={event.imageUrl} alt="Banner" className="w-10 h-10 object-cover rounded-md border border-white/10" />
                      {event.name}
                    </td>
                    <td className="px-6 py-5 text-white/70">{event.date} at {event.time}</td>
                    <td className="px-6 py-5"><span className="px-2 py-1 bg-cyan-400/20 text-cyan-400 rounded text-xs">{event.category}</span></td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-semibold text-white/50 block tracking-widest">{event.totalSeats - event.availableSeats} / {event.totalSeats} Filled</span>
                    </td>
                    <td className="px-6 py-5 text-right space-x-4">
                      <button onClick={() => handleViewRegistrations(event.id!)} className="text-white hover:text-cyan-400 font-bold uppercase tracking-widest text-xs transition-colors">Regs</button>
                      <button onClick={() => openEditModal(event)} className="text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-widest text-xs transition-colors">Edit</button>
                      <button onClick={() => handleDelete(event.id!)} className="text-red-400 hover:text-red-300 font-bold uppercase tracking-widest text-xs transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements Management */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-1 mt-10">
          <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Platform Announcements</h2>
            <button onClick={() => setIsAnnounceModalOpen(true)} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-md text-xs font-bold text-cyan-400 hover:bg-white/10 transition-colors">
              + Publish
            </button>
          </div>
          <div className="p-6">
            {announcements.length === 0 ? (
              <p className="text-white/50 text-sm">No announcements published yet.</p>
            ) : (
              <div className="space-y-4">
                {announcements.map(ann => (
                  <div key={ann.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-white">{ann.title}</h3>
                      <span className={`text-[0.65rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${ann.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-cyan-400/20 text-cyan-400'}`}>
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-sm text-white/70">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* EVENT FORM MODAL */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEventModalOpen(false)}></div>
          <div className="bg-[#0c1421] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">{editingEvent ? "Edit Event" : "Create New Event"}</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Banner Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" />
                {editingEvent && !imageFile && <p className="text-xs text-white/40 mt-1">Leave empty to keep current image.</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Event Name</label>
                  <input {...form.register("name")} className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Category</label>
                  <input {...form.register("category")} className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Description</label>
                <textarea {...form.register("description")} rows={3} className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white"></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Date</label>
                  <input {...form.register("date")} type="date" className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Time</label>
                  <input {...form.register("time")} type="time" className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Total Seats</label>
                  <input {...form.register("totalSeats")} type="number" className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Venue</label>
                  <input {...form.register("venue")} className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Reg. Deadline</label>
                  <input {...form.register("deadline")} type="date" className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsEventModalOpen(false)} className="px-5 py-2 text-white/70 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-cyan-400 text-black px-6 py-2 rounded-lg font-bold hover:bg-cyan-300 disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATIONS MODAL */}
      {isRegModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsRegModalOpen(false)}></div>
          <div className="bg-[#0c1421] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto relative z-10 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Event Registrations</h2>
            
            {loadingRegs ? (
              <p className="text-white/50 text-center py-4">Loading...</p>
            ) : registrations.length === 0 ? (
              <p className="text-white/50 text-center py-4">No registrations yet.</p>
            ) : (
              <ul className="divide-y divide-white/10">
                {registrations.map(reg => (
                  <li key={reg.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{reg.userName}</p>
                      <p className="text-xs text-white/50">{reg.userEmail}</p>
                    </div>
                    <span className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded">Confirmed</span>
                  </li>
                ))}
              </ul>
            )}
            
            <button onClick={() => setIsRegModalOpen(false)} className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT MODAL */}
      {isAnnounceModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAnnounceModalOpen(false)}></div>
          <div className="bg-[#0c1421] border border-white/10 rounded-2xl w-full max-w-lg relative z-10 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Publish Announcement</h2>
            <form onSubmit={announceForm.handleSubmit(onAnnounceSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Title</label>
                <input {...announceForm.register("title")} className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Content</label>
                <textarea {...announceForm.register("content")} rows={4} className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white"></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-widest mb-1.5">Priority</label>
                <select {...announceForm.register("priority")} className="w-full bg-[#0c1421] border border-white/20 rounded-xl p-3 text-sm text-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAnnounceModalOpen(false)} className="px-5 py-2 text-white/70 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-cyan-400 text-black px-6 py-2 rounded-lg font-bold hover:bg-cyan-300">Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
