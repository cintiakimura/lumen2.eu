

export interface UserProgress {
  user_id: string;
  unit_id: string;
  clientId: string; // Data Isolation Key
  accuracy_ma: number; // Moving average
  time_ma_sec: number;
  habit_streak: number;
  cycles_completed: number;
  gate_unlocked: boolean;
  overload_flags: string[];
}

export interface Submission {
  submission_id: string;
  user_id: string;
  clientId: string; // Data Isolation Key
  unit_id: string;
  task_id: string;
  response: string;
  started_at: number;
  submitted_at: number;
  time_sec: number;
  grade?: Grade;
}

export interface Grade {
  grade_id: string;
  score: number;
  feedback: {
    overall: string;
    criteria: Array<{ name: string; score: number; explanation: string }>;
  };
  reflection_prompt: string;
  experiment_task?: { difficulty: string };
  latency_ms: number;
}

export interface Unit {
  id: string;
  title: string;
  category: 'Math' | 'Physics' | 'Safety' | 'Mechanics';
  status: 'locked' | 'active' | 'completed';
  progress: number;
  video_id?: string;
  start_sec?: number;
  clientId?: string; // If null, it is a Global Course. If set, it is private to that client.
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// Admin Types
export type UserRole = 'Super Admin' | 'Teacher' | 'Student';

export interface Client {
  id: string;
  name: string;
  industry: string;
  userCount: number;
  status: 'Active' | 'Pending' | 'Suspended';
  logoInitials: string;
  domain: string; // e.g. @tesla.com - used for auto-assignment
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId: string; // Links user to a specific client organization
  status: 'Active' | 'Inactive' | 'Advanced';
}