import { Assessment, ResultLog, ActiveSession } from "./types";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc,
  query,
  where 
} from "firebase/firestore";

// --- CONFIGURATION ---
// 1. Go to Firebase Console -> Project Settings -> General -> Your Apps -> SDK Setup and Configuration
// 2. Copy the "firebaseConfig" object and paste it below.

const firebaseConfig = {
  apiKey: "AIzaSyDJabXrn5a6dgOYtNyBE0fqzwpxj5ZWcb8",
  authDomain: "e-assessment-app.firebaseapp.com",
  projectId: "e-assessment-app",
  storageBucket: "e-assessment-app.firebasestorage.app",
  messagingSenderId: "694766041620",
  appId: "1:694766041620:web:7ad50caffb746e3c1b4501"
};

// Initialize Firebase
// We add a check to prevent crashing if config is missing during initial setup
let db: any;
try {
  if (firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    console.warn("Firebase config is missing in db.ts. App will not save data correctly.");
  }
} catch (e) {
  console.error("Error initializing Firebase:", e);
}

// --- DATABASE FUNCTIONS ---

export const getAssessments = async (): Promise<Assessment[]> => {
  if (!db) return [];
  try {
    const snapshot = await getDocs(collection(db, "assessments"));
    return snapshot.docs.map(d => d.data() as Assessment);
  } catch (e) {
    console.error("Error fetching assessments:", e);
    return [];
  }
};

export const saveAssessment = async (assessment: Assessment): Promise<void> => {
  if (!db) return;
  try {
    // We use setDoc with the ID so we can easily update/overwrite if needed
    await setDoc(doc(db, "assessments", assessment.id), assessment);
  } catch (e) {
    console.error("Error saving assessment:", e);
    alert("Failed to save to database. Check console.");
  }
};

export const deleteAssessment = async (id: string): Promise<void> => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, "assessments", id));
  } catch (e) {
    console.error("Error deleting assessment:", e);
  }
};

export const saveResult = async (result: ResultLog): Promise<void> => {
  if (!db) return;
  try {
    await addDoc(collection(db, "results"), result);
  } catch (e) {
    console.error("Error saving result:", e);
    // Fallback: alert user
    alert("Error: Result could not be saved to server. Please contact admin.");
  }
};

export const getResults = async (): Promise<ResultLog[]> => {
  if (!db) return [];
  try {
    const snapshot = await getDocs(collection(db, "results"));
    return snapshot.docs.map(d => d.data() as ResultLog);
  } catch (e) {
    console.error("Error fetching results:", e);
    return [];
  }
};

// --- SESSION HANDLING ---
// For "Active Sessions" (Resume functionality), we stick to LocalStorage.
// Why? 
// 1. Speed: It needs to save every time you click a button.
// 2. Privacy: We don't need to clutter the main database with half-finished attempts.
// 3. Device specific: Resuming is usually done on the same device.

const KEY_SESSION = "assess_app_active_session";

export const saveSession = (session: ActiveSession) => {
  localStorage.setItem(KEY_SESSION, JSON.stringify(session));
};

export const getSession = (): ActiveSession | null => {
  const data = localStorage.getItem(KEY_SESSION);
  return data ? JSON.parse(data) : null;
};

export const clearSession = () => {
  localStorage.removeItem(KEY_SESSION);
};