
import { 
    collection, 
    getDocs, 
    addDoc, 
    query, 
    where, 
    doc, 
    updateDoc 
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Client, User, Unit } from "../types";
import { MOCK_CLIENTS, MOCK_USERS, MOCK_UNITS, VITE_DEMO_MODE } from "../constants";

// --- CLIENTS ---
export const getClients = async (): Promise<Client[]> => {
    if (VITE_DEMO_MODE || !db) return MOCK_CLIENTS;
    
    const snapshot = await getDocs(collection(db, "clients"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
};

export const createClient = async (clientData: Omit<Client, 'id'>) => {
    if (VITE_DEMO_MODE || !db) {
        console.log("Mock Create Client:", clientData);
        return;
    }
    await addDoc(collection(db, "clients"), clientData);
};

// --- USERS ---
export const getUsers = async (clientId?: string): Promise<User[]> => {
    if (VITE_DEMO_MODE || !db) {
        if (clientId) return MOCK_USERS.filter(u => u.clientId === clientId);
        return MOCK_USERS;
    }

    const ref = collection(db, "users");
    const q = clientId ? query(ref, where("clientId", "==", clientId)) : ref;
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const createUser = async (userData: Omit<User, 'id'>) => {
    if (VITE_DEMO_MODE || !db) return;
    await addDoc(collection(db, "users"), userData);
};

// --- COURSES ---
export const getCourses = async (clientId?: string): Promise<Unit[]> => {
    if (VITE_DEMO_MODE || !db) {
        // Return Global Courses (no client ID) + Specific Client Courses
        return MOCK_UNITS.filter(u => !u.clientId || u.clientId === clientId);
    }

    // In Firestore, we would need a complex query or multiple queries
    // Simple approach: Get all and filter (for small datasets)
    const snapshot = await getDocs(collection(db, "courses"));
    const allCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
    
    return allCourses.filter(u => !u.clientId || u.clientId === clientId);
};
