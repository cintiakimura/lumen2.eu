
import { 
    collection, 
    getDocs, 
    addDoc, 
    query, 
    where, 
    doc, 
    setDoc,
    limit
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import { Client, User, Unit, Submission } from "../../types";
import { MOCK_CLIENTS, MOCK_USERS, MOCK_UNITS, VITE_DEMO_MODE } from "../../constants";

// --- CONNECTION CHECK ---
export const checkDBConnection = async (): Promise<boolean> => {
    if (VITE_DEMO_MODE || !db) return false;
    try {
        // Try to fetch a single document to verify connection
        await getDocs(query(collection(db, "clients"), limit(1)));
        return true;
    } catch (e) {
        return false;
    }
};

// --- CLIENTS ---
export const getClients = async (): Promise<Client[]> => {
    if (VITE_DEMO_MODE || !db) return MOCK_CLIENTS;
    
    try {
        const snapshot = await getDocs(collection(db, "clients"));
        if (snapshot.empty) return MOCK_CLIENTS;
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
    } catch (e) {
        console.warn("DB Error (getClients):", e);
        return MOCK_CLIENTS;
    }
};

export const createClient = async (clientData: Client) => {
    if (VITE_DEMO_MODE || !db) {
        console.log("Mock Create Client:", clientData);
        return;
    }
    try {
        await setDoc(doc(db, "clients", clientData.id), clientData);
    } catch (e) {
        console.warn("Failed to create client, using fallback.", e);
    }
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
        if (snapshot.empty) {
             if (clientId) return MOCK_USERS.filter(u => u.clientId === clientId);
             return MOCK_USERS;
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (e) {
        console.warn("DB Error (getUsers):", e);
        if (clientId) return MOCK_USERS.filter(u => u.clientId === clientId);
        return MOCK_USERS;
    }
};

export const createUser = async (userData: User) => {
    if (VITE_DEMO_MODE || !db) return;
    try {
        await setDoc(doc(db, "users", userData.id), userData);
    } catch (e) {
        console.warn("Failed to create user, using fallback.", e);
    }
};

// --- COURSES ---
export const getCourses = async (clientId?: string): Promise<Unit[]> => {
    if (VITE_DEMO_MODE || !db) {
        return MOCK_UNITS.filter(u => !u.clientId || u.clientId === clientId);
    }

    try {
        const snapshot = await getDocs(collection(db, "courses"));
        if (snapshot.empty) return MOCK_UNITS.filter(u => !u.clientId || u.clientId === clientId);

        const allCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
        return allCourses.filter(u => !u.clientId || u.clientId === clientId);
    } catch (e) {
        console.warn("DB Error (getCourses):", e);
        return MOCK_UNITS.filter(u => !u.clientId || u.clientId === clientId);
    }
};

export const createCourse = async (courseData: Unit) => {
    if (VITE_DEMO_MODE || !db) return;
    try {
        await setDoc(doc(db, "courses", courseData.id), courseData);
    } catch (e) {
         console.warn("Failed to create course, using fallback.", e);
    }
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
        return getMockTasks(unitId);
    }
    
    try {
        const q = query(collection(db, "tasks"), where("unitId", "==", unitId));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
             return getMockTasks(unitId);
        }
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    } catch (e) {
        console.warn("Error fetching tasks:", e);
        return getMockTasks(unitId);
    }
}

const getMockTasks = (unitId: string): Task[] => [
    { id: `T-${unitId}-1`, unitId, title: 'Concept Verification', difficulty: 'Easy', completed: true },
    { id: `T-${unitId}-2`, unitId, title: 'Practical Application', difficulty: 'Medium', completed: false }
];

export const createTask = async (task: Task) => {
    if (VITE_DEMO_MODE || !db) return;
    try {
        await setDoc(doc(db, "tasks", task.id), task);
    } catch (e) {
        console.warn("Failed to create task, using fallback.", e);
    }
}

// --- SUBMISSIONS ---
export const saveSubmission = async (submission: Submission) => {
    if (VITE_DEMO_MODE || !db) {
        console.log("Mock Save Submission", submission);
        return;
    }
    try {
        await addDoc(collection(db, "submissions"), submission);
    } catch (e) {
        console.warn("Failed to save submission, using fallback.", e);
    }
}

// --- STORAGE ---
const mockUpload = (path: string): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`https://mock-storage.lumen.ai/${path}`);
        }, 1500);
    });
};

export const uploadAsset = async (file: File, path: string): Promise<string> => {
    // 1. Mock Mode
    if (VITE_DEMO_MODE || !storage) {
        return mockUpload(path);
    }
    
    // 2. Real Upload with Fallback
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytesResumable(storageRef, file);
        return await getDownloadURL(snapshot.ref);
    } catch (e) {
        console.warn("Storage upload failed (Network/Permissions), falling back to mock upload.");
        return mockUpload(path);
    }
}
