import { db, storage } from "./firebase";
import { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, runTransaction 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Types
export interface EventData {
  id?: string;
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  deadline: string;
  totalSeats: number;
  availableSeats: number;
  imageUrl: string;
  createdAt?: any;
}

export interface RegistrationData {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  qrCodeData: string;
  registeredAt: any;
}

export interface AnnouncementData {
  id?: string;
  title: string;
  content: string;
  date: string;
  priority: "low" | "medium" | "high";
  createdAt?: any;
}

// ----------------------
// EVENT CRUD OPERATIONS
// ----------------------

export const uploadEventImage = async (file: File): Promise<string> => {
  const fileRef = ref(storage, `events/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

export const createEvent = async (event: Omit<EventData, "id" | "createdAt" | "availableSeats">): Promise<boolean> => {
  try {
    const newDocRef = doc(collection(db, "events"));
    await setDoc(newDocRef, {
      ...event,
      id: newDocRef.id,
      availableSeats: event.totalSeats,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error creating event:", error);
    return false;
  }
};

export const updateEvent = async (id: string, data: Partial<EventData>): Promise<boolean> => {
  try {
    const eventRef = doc(db, "events", id);
    await updateDoc(eventRef, data);
    return true;
  } catch (error) {
    console.error("Error updating event:", error);
    return false;
  }
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "events", id));
    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    return false;
  }
};

export const getAllEvents = async (): Promise<EventData[]> => {
  try {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as EventData);
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

// ----------------------
// REGISTRATIONS
// ----------------------

export const registerForEvent = async (eventId: string, userId: string, userName: string, userEmail: string): Promise<{success: boolean, message: string}> => {
  try {
    const eventRef = doc(db, "events", eventId);
    const registrationId = `${eventId}_${userId}`;
    const registrationRef = doc(db, "registrations", registrationId);

    return await runTransaction(db, async (transaction) => {
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists()) throw new Error("Event does not exist!");

      const eventData = eventDoc.data() as EventData;
      if (eventData.availableSeats <= 0) throw new Error("Event is sold out!");

      const regDoc = await transaction.get(registrationRef);
      if (regDoc.exists()) throw new Error("You are already registered for this event!");

      transaction.update(eventRef, { availableSeats: eventData.availableSeats - 1 });
      
      const newReg: RegistrationData = {
        id: registrationId,
        eventId,
        userId,
        userName,
        userEmail,
        qrCodeData: `EVORA-${registrationId}`,
        registeredAt: serverTimestamp()
      };
      
      transaction.set(registrationRef, newReg);
      return { success: true, message: "Registered successfully!" };
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, message: error.message };
  }
};

export const cancelRegistration = async (eventId: string, userId: string): Promise<{success: boolean, message: string}> => {
  try {
    const eventRef = doc(db, "events", eventId);
    const registrationId = `${eventId}_${userId}`;
    const registrationRef = doc(db, "registrations", registrationId);

    return await runTransaction(db, async (transaction) => {
      const regDoc = await transaction.get(registrationRef);
      if (!regDoc.exists()) throw new Error("Registration not found!");

      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists()) throw new Error("Event does not exist!");
      
      const eventData = eventDoc.data() as EventData;

      transaction.update(eventRef, { availableSeats: eventData.availableSeats + 1 });
      transaction.delete(registrationRef);
      
      return { success: true, message: "Registration cancelled successfully!" };
    });
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getUserRegistrations = async (userId: string): Promise<RegistrationData[]> => {
  try {
    const q = query(collection(db, "registrations"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as RegistrationData);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return [];
  }
};

export const getEventRegistrations = async (eventId: string): Promise<RegistrationData[]> => {
  try {
    const q = query(collection(db, "registrations"), where("eventId", "==", eventId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as RegistrationData);
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return [];
  }
};

// ----------------------
// ANNOUNCEMENTS
// ----------------------

export const createAnnouncement = async (announcement: Omit<AnnouncementData, "id" | "createdAt">): Promise<boolean> => {
  try {
    const newDocRef = doc(collection(db, "announcements"));
    await setDoc(newDocRef, {
      ...announcement,
      id: newDocRef.id,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error creating announcement:", error);
    return false;
  }
};

export const getAllAnnouncements = async (): Promise<AnnouncementData[]> => {
  try {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as AnnouncementData);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
};
