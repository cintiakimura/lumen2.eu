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
import { Client, User, Unit, Submission, UserRole, Rank, Task } from "../types";
import { MOCK_CLIENTS, MOCK_USERS, MOCK_UNITS, VITE_DEMO_MODE, RANKS } from "../constants";

// --- LOCAL SESSION CACHE (Persistent) ---
const loadCache = <T>(key: string, defaultVal: T[]): T[] => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch {
        return defaultVal;
    }
};

const saveCache = (key: string, data: any[]) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn("Failed to save to localStorage", e);
    }
};

const LOCAL_CLIENTS: Client[] = loadCache('lumen_local_clients', []);
const LOCAL_USERS: User[] = loadCache('lumen_local_users', []);
const LOCAL_COURSES: Unit[] = loadCache('lumen_local_courses', []);
const LOCAL_TASKS: Task[] = loadCache('lumen_local_tasks', []);
const LOCAL_SUBMISSIONS: Submission[] = loadCache('lumen_local_submissions', []);

// --- HELPER: MERGE DATA ---
const mergeData = <T extends { id: string }>(mock: T[], local: T[], dbData: T[]): T[] => {
    const unique = new Map<string, T>();
    // 1. Mock Data (Baseline)
    mock.forEach(item => unique.set(item.id, item));
    // 2. DB Data (Overwrites Mock)
    dbData.forEach(item => unique.set(item.id, item));
    // 3. Local Data (Overwrites DB - most recent "writes" in this session)
    local.forEach(item => unique.set(item.id, item));
    return Array.from(unique.values());
};

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
        if (e.code === 'storage/unauthorized') return true; 
        if (e.code === 'storage/retry-limit-exceeded') return false;
        return false;
    }
}

// --- CLIENTS ---
export const getClients = async (): Promise<Client[]> => {
    let dbResults: Client[] = [];
    
    if (!VITE_DEMO_MODE && db) {
        try {
            const snapshot = await getDocs(collection(db, "clients"));
            if (!snapshot.empty) {
                dbResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
            }
        } catch (e) {
            console.warn("DB Error (getClients):", e);
        }
    }
    return mergeData(MOCK_CLIENTS, LOCAL_CLIENTS, dbResults);
};

export const createClient = async (clientData: Client): Promise<boolean> => {
    LOCAL_CLIENTS.push(clientData);
    saveCache('lumen_local_clients', LOCAL_CLIENTS);

    if (VITE_DEMO_MODE || !db) {
        return true;
    }
    try {
        await setDoc(doc(db, "clients", clientData.id), clientData);
        return true;
    } catch (e) {
        console.warn("Failed to create client (Firebase), saved locally.", e);
        return true;
    }
};

// --- USERS ---
export const getUsers = async (clientId?: string): Promise<User[]> => {
    let dbResults: User[] = [];

    if (!VITE_DEMO_MODE && db) {
        try {
            const ref = collection(db, "users");
            const q = clientId ? query(ref, where("clientId", "==", clientId)) : ref;
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                dbResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            }
        } catch (e) {
            console.warn("DB Error (getUsers):", e);
        }
    }

    const allUsers = mergeData(MOCK_USERS, LOCAL_USERS, dbResults);

    if (clientId) {
        return allUsers.filter(u => u.clientId === clientId);
    }
    return allUsers;
};

export const createUser = async (userData: User): Promise<boolean> => {
    LOCAL_USERS.push(userData);
    saveCache('lumen_local_users', LOCAL_USERS);

    if (VITE_DEMO_MODE || !db) return true;
    try {
        await setDoc(doc(db, "users", userData.id), userData);
        return true;
    } catch (e) {
        console.warn("Failed to create user (Firebase), saved locally.", e);
        return true;
    }
};

export const registerUser = async (name: string, email: string, role: UserRole, clientId: string): Promise<User> => {
    // 1. Efficiently check if user exists (DB)
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
        }
    }

    // Check local/mock
    const allKnownUsers = [...MOCK_USERS, ...LOCAL_USERS];
    if (allKnownUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
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
        rank: 'Operative',
        badges: []
    };

    // 3. Attempt Save
    await createUser(newUser);

    return newUser;
};

export const updateUserXP = async (userId: string, amount: number): Promise<{ newXP: number, newRank: Rank | null }> => {
    const calcRank = (xp: number, currentRank: Rank): Rank | null => {
        const nextRank = [...RANKS].reverse().find(r => xp >= r.minXP);
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

    // 2. Update Local Cache/Mock (Always do this for UI responsiveness)
    const localUser = LOCAL_USERS.find(u => u.id === userId);
    if (localUser) {
        localUser.xp = (localUser.xp || 0) + amount;
        const newRank = calcRank(localUser.xp, localUser.rank);
        if (newRank) localUser.rank = newRank;
        saveCache('lumen_local_users', LOCAL_USERS); 
        return { newXP: localUser.xp, newRank };
    }

    const mockUser = MOCK_USERS.find(u => u.id === userId);
    if (mockUser) {
        mockUser.xp = (mockUser.xp || 0) + amount;
        const newRank = calcRank(mockUser.xp, mockUser.rank);
        if (newRank) mockUser.rank = newRank;
        return { newXP: mockUser.xp, newRank };
    }

    return { newXP: 0, newRank: null };
};

// --- COURSES ---
export const getCourses = async (clientId?: string): Promise<Unit[]> => {
    let dbResults: Unit[] = [];

    if (!VITE_DEMO_MODE && db) {
        try {
            const snapshot = await getDocs(collection(db, "courses"));
            if (!snapshot.empty) {
                dbResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unit));
            }
        } catch (e) {
            console.warn("DB Error (getCourses):", e);
        }
    }

    const allCourses = mergeData(MOCK_UNITS, LOCAL_COURSES, dbResults);
    return allCourses.filter(u => !u.clientId || u.clientId === clientId);
};

export const createCourse = async (courseData: Unit): Promise<boolean> => {
    LOCAL_COURSES.push(courseData);
    saveCache('lumen_local_courses', LOCAL_COURSES);

    if (VITE_DEMO_MODE || !db) return true;
    try {
        await setDoc(doc(db, "courses", courseData.id), courseData);
        return true;
    } catch (e) {
         console.warn("Failed to create course, using fallback.", e);
         return true;
    }
}

export const updateCourse = async (courseId: string, updates: Partial<Unit>): Promise<boolean> => {
    const localIdx = LOCAL_COURSES.findIndex(c => c.id === courseId);
    if (localIdx >= 0) {
        LOCAL_COURSES[localIdx] = { ...LOCAL_COURSES[localIdx], ...updates };
        saveCache('lumen_local_courses', LOCAL_COURSES);
    }

    if (VITE_DEMO_MODE || !db) return true;
    try {
        await updateDoc(doc(db, "courses", courseId), updates);
        return true;
    } catch (e) {
        console.warn("Failed to update course, using fallback.", e);
        return true;
    }
}

// --- TASKS ---
export const getTasks = async (unitId: string): Promise<Task[]> => {
    const mockTasks: Task[] = [
        { id: `T-${unitId}-1`, unitId, title: 'Concept Verification', difficulty: 'Easy', completed: true },
        { id: `T-${unitId}-2`, unitId, title: 'Practical Application', difficulty: 'Medium', completed: false }
    ];

    let dbTasks: Task[] = [];
    
    if (!VITE_DEMO_MODE && db) {
        try {
            const q = query(collection(db, "tasks"), where("unitId", "==", unitId));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                dbTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            }
        } catch (e) {
            console.warn("Error fetching tasks:", e);
        }
    }

    const allTasks = mergeData(mockTasks, LOCAL_TASKS, dbTasks);
    return allTasks.filter(t => t.unitId === unitId);
}

export const createTask = async (task: Task): Promise<boolean> => {
    LOCAL_TASKS.push(task);
    saveCache('lumen_local_tasks', LOCAL_TASKS);

    if (VITE_DEMO_MODE || !db) return true;
    try {
        await setDoc(doc(db, "tasks", task.id), task);
        return true;
    } catch (e) {
        console.warn("Failed to create task, using fallback.", e);
        return true;
    }
}

// --- SUBMISSIONS ---
export const saveSubmission = async (submission: Submission): Promise<boolean> => {
    LOCAL_SUBMISSIONS.push(submission);
    saveCache('lumen_local_submissions', LOCAL_SUBMISSIONS);

    if (VITE_DEMO_MODE || !db) return true;
    try {
        await addDoc(collection(db, "submissions"), submission);
        return true;
    } catch (e) {
        console.warn("Failed to save submission, using fallback.", e);
        return true;
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
    if (VITE_DEMO_MODE || !storage) {
        return mockUpload(path);
    }
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytesResumable(storageRef, file);
        return await getDownloadURL(snapshot.ref);
    } catch (e) {
        console.warn("Storage upload failed (Network/Permissions), falling back to mock upload.");
        return mockUpload(path);
    }
}