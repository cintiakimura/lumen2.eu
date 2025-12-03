
import { 
    collection, 
    getDocs, 
    addDoc, 
    query, 
    where, 
    doc, 
    updateDoc,
    setDoc
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import { Client, User, Unit, Submission } from "../types";
import { MOCK_CLIENTS, MOCK_USERS, MOCK_UNITS, VITE_DEMO_MODE } from "../constants";

// --- CLIENTS ---
export const getClients = async (): Promise<Client[]> => {
    if (VITE_DEMO_MODE || !db) return MOCK_CLIENTS;
    
    try {
        const snapshot = await getDocs(collection(db, "clients"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
    } catch (e) {
        console.error("Error fetching clients:", e);
        return [];
    }
};

export const createClient = async (clientData: Client) => {
    if (VITE_DEMO_MODE || !db) {
        console.log("Mock Create Client:", clientData);
        return;
    }
    await setDoc(doc(db, "clients", clientData.id), clientData);
};

// --- USERS ---
export const getUsers = async (clientId?: string): Promise<User[]> => {
    if (VITE_DEMO_MODE || !db) {
        if (clientId) return MOCK_USERS.filter(u => u.clientId === clientId);
        return MOCK_USERS;
    }

    try {
        const ref = collection(db, "users");
        const q = clientId ? query(ref, where("clientId", "==", clientId)) : ref;
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (e) {
        console.error("Error fetching users:", e);
        return [];
    }
};

export const createUser = async (userData: User) => {
    if (VITE_DEMO_MODE || !db) return;
    await setDoc(doc(db, "users", userData.id), userData);
};

// --- COURSES ---
export const getCourses = async (clientId?: string): Promise<Unit[]> => {
    if (VITE_DEMO_MODE || !db) {
        return MOCK_UNITS.filter(u => !u.clientId || u.clientId === clientId);
    }

    try {
        const snapshot = await getDocs(collection(db, "courses"));
        const allCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
        
        return allCourses.filter(u => !u.clientId || u.clientId === clientId);
    } catch (e) {
        console.error("Error fetching courses:", e);
        return [];
    }
};

export const createCourse = async (courseData: Unit) => {
    if (VITE_DEMO_MODE || !db) return;
    await setDoc(doc(db, "courses", courseData.id), courseData);
}

// --- TASKS ---
export interface Task {
    id: string;
    unitId: string;
    title: string;
    difficulty: string;
    completed: boolean;
}

export const getTasks = async (unitId: string): Promise<Task[]> => {
    if (VITE_DEMO_MODE || !db) {
        return [
            { id: 'T-01', unitId, title: 'Foundations Task 1', difficulty: 'Easy', completed: true },
            { id: 'T-02', unitId, title: 'Advanced Logic', difficulty: 'Medium', completed: false }
        ];
    }
    
    try {
        const q = query(collection(db, "tasks"), where("unitId", "==", unitId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    } catch (e) {
        console.error("Error fetching tasks", e);
        return [];
    }
}

export const createTask = async (task: Task) => {
    if (VITE_DEMO_MODE || !db) return;
    await setDoc(doc(db, "tasks", task.id), task);
}

// --- SUBMISSIONS ---
export const saveSubmission = async (submission: Submission) => {
    if (VITE_DEMO_MODE || !db) {
        console.log("Mock Save Submission", submission);
        return;
    }
    await addDoc(collection(db, "submissions"), submission);
}

// --- STORAGE ---
export const uploadAsset = async (file: File, path: string): Promise<string> => {
    if (VITE_DEMO_MODE || !storage) throw new Error("Storage not configured");
    
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytesResumable(storageRef, file);
    return await getDownloadURL(snapshot.ref);
}
