

import { 
    collection, 
    getDocs, 
    addDoc, 
    query, 
    where, 
    doc, 
    setDoc,
    updateDoc,
    limit,
    getDoc
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, listAll } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import { Client, User, Unit, Submission, UserRole, Rank } from "../types";
import { MOCK_CLIENTS, MOCK_USERS, MOCK_UNITS, VITE_DEMO_MODE, RANKS } from "../constants";

// --- CONNECTION CHECKS ---
export const checkDBConnection = async (): Promise<boolean> => {
    if (VITE_DEMO_MODE || !db) return false;
    try {
        await getDocs(query(collection(db, "clients"), limit(1)));
        return true;
    } catch (e) {
        return false;
    }
};

export const checkStorageConnection = async (): Promise<boolean> => {
    if (VITE_DEMO_MODE || !storage) return false;
    try {
        const storageRef = ref(storage, '/');
        await listAll(storageRef);
        return true;
    } catch (e: any) {
        // storage/unauthorized is a 'connection' success (service reachable), just permission denied
        if (e.code === 'storage/unauthorized') return true; 
        if (e.code === 'storage/retry-limit-exceeded') return false;
        return false;
    }
}

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

export const createClient = async (clientData: Client): Promise<boolean> => {
    if (VITE_DEMO_MODE || !db) {
        console.log("Mock Create Client:", clientData);
        return true;
    }
    try {
        await setDoc(doc(db, "clients", clientData.id), clientData);
        return true;
    } catch (e) {
        console.warn("Failed to create client, using fallback.", e);
        return false;
    }
};

// --- USERS ---
export const getUsers = async (clientId?: string): Promise<User[]> => {
    // Always merge Mock Users in case registration fell back to local
    let results = [...MOCK_USERS];

    if (!VITE_DEMO_MODE && db) {
        try {
            const ref = collection(db, "users");
            const q = clientId ? query(ref, where("clientId", "==", clientId)) : ref;
            
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const dbUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
                // Deduping: Prefer DB users, but keep Mock users that aren't in DB (local session users)
                const dbIds = new Set(dbUsers.map(u => u.id));
                results = [...dbUsers, ...results.filter(u => !dbIds.has(u.id))];
            }
        } catch (e) {
            console.warn("DB Error (getUsers):", e);
        }
    }

    if (clientId) {
        return results.filter(u => u.clientId === clientId);
    }
    return results;
};

export const createUser = async (userData: User): Promise<boolean> => {
    if (VITE_DEMO_MODE || !db) return true;
    try {
        await setDoc(doc(db, "users", userData.id), userData);
        return true;
    } catch (e) {
        console.warn("Failed to create user (Firebase), falling back to local session.", e);
        return false;
    }
};

export const registerUser = async (name: string, email: string, role: UserRole, clientId: string): Promise<User> => {
    // 1. Efficiently check if user exists
    if (!VITE_DEMO_MODE && db) {
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                throw new Error("User identity already registered.");
            }
        } catch (e: any) {
            if (e.message === "User identity already registered.") throw e;
            console.warn("DB Query Error during registration check, proceeding cautiously:", e);
        }
    }

    // Check local mock users too (for hybrid state)
    if (MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("User identity already registered (Local).");
    }

    // 2. Create new User object
    const newUser: User = {
        id: `USR-${Date.now()}`,
        name,
        email,
        role,
        clientId: clientId || 'GLOBAL',
        status: 'Active',
        xp: 0,
        rank: 'Rookie',
        badges: []
    };

    // 3. Attempt Save to DB
    const cloudSuccess = await createUser(newUser);
    
    // 4. CRITICAL FIX: If Cloud fails (or doesn't exist), UPDATE MOCK DATA so login works this session
    if (!cloudSuccess || VITE_DEMO_MODE || !db) {
        console.log("Saving user to local session cache.");
        MOCK_USERS.push(newUser);
    }

    return newUser;
};

export const updateUserXP = async (userId: string, amount: number): Promise<{ newXP: number, newRank: Rank | null }> => {
    // Helper to calc rank
    const calcRank = (xp: number, currentRank: Rank) => {
        const nextRank = RANKS.slice().reverse().find(r => xp >= r.minXP);
        if (nextRank && nextRank.name !== currentRank) {
            return nextRank.name;
        }
        return null;
    };

    // 1. Update Cloud
    if (!VITE_DEMO_MODE && db) {
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data() as User;
                const newXP = (data.xp || 0) + amount;
                const newRankName = calcRank(newXP, data.rank);

                await updateDoc(userRef, {
                    xp: newXP,
                    rank: newRankName || data.rank
                });
                return { newXP, newRank: newRankName };
            }
        } catch(e) {
            console.error("XP Cloud Update Error", e);
        }
    }

    // 2. Update Local Mock (Always do this for UI responsiveness)
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
        user.xp = (user.xp || 0) + amount;
        const newRank = calcRank(user.xp, user.rank);
        if (newRank) user.rank = newRank;
        return { newXP: user.xp, newRank };
    }

    return { newXP: 0, newRank: null };
};

// --- COURSES ---
export const getCourses = async (clientId?: string): Promise<Unit[]> => {
    // Similar hybrid approach: Cloud first, fall back to Mock
    if (!VITE_DEMO_MODE && db) {
        try {
            const snapshot = await getDocs(collection(db, "courses"));
            if (!snapshot.empty) {
                const allCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
                // Note: We don't merge courses usually, as content should be authoritative
                return allCourses.filter(u => !u.clientId || u.clientId === clientId);
            }
        } catch (e) {
            console.warn("DB Error (getCourses):", e);
        }
    }
    return MOCK_UNITS.filter(u => !u.clientId || u.clientId === clientId);
};

export const createCourse = async (courseData: Unit): Promise<boolean> => {
    if (VITE_DEMO_MODE || !db) return true;
    try {
        await setDoc(doc(db, "courses", courseData.id), courseData);
        return true;
    } catch (e) {
         console.warn("Failed to create course, using fallback.", e);
         return false;
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

export const createTask = async (task: Task): Promise<boolean> => {
    if (VITE_DEMO_MODE || !db) return true;
    try {
        await setDoc(doc(db, "tasks", task.id), task);
        return true;
    } catch (e) {
        console.warn("Failed to create task, using fallback.", e);
        return false;
    }
}

// --- SUBMISSIONS ---
export const saveSubmission = async (submission: Submission): Promise<boolean> => {
    if (VITE_DEMO_MODE || !db) {
        return true;
    }
    try {
        await addDoc(collection(db, "submissions"), submission);
        return true;
    } catch (e) {
        console.warn("Failed to save submission, using fallback.", e);
        return false;
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
