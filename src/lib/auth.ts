import { auth, db } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  role?: string;
}

const ADMIN_EMAIL = "satyamkruk07@gmail.com";

// 1. Register New User
export const registerUser = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const role = email === ADMIN_EMAIL ? "admin" : "student";
    
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      role: role,
      createdAt: new Date().toISOString()
    });
    
    return { success: true, user, role };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 2. Login Existing User
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    let role = await getUserRole(user.uid);
    
    // Auto-upgrade to admin if the email matches but role wasn't set correctly
    if (user.email === ADMIN_EMAIL && role !== "admin") {
      await setDoc(doc(db, "users", user.uid), { role: "admin" }, { merge: true });
      role = "admin";
    }
    
    return { success: true, user, role };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// 3. Logout
export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

// 4. Google Login
export const loginWithGoogle = async (): Promise<AuthResponse> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    let role = user.email === ADMIN_EMAIL ? "admin" : "student";
    
    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        name: user.displayName || "Google User",
        email: user.email,
        role: role,
        createdAt: new Date().toISOString()
      });
    } else {
      role = userDocSnap.data().role || "student";
      // Auto-upgrade
      if (user.email === ADMIN_EMAIL && role !== "admin") {
        await setDoc(userDocRef, { role: "admin" }, { merge: true });
        role = "admin";
      }
    }
    
    return { success: true, user, role };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Helper: Get User Role
export const getUserRole = async (uid: string): Promise<string> => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return userDocSnap.data().role || "student";
    }
    return "student";
  } catch (error) {
    return "student";
  }
};
