
import { Unit, Client, User } from './types';

// Feature flags
export const VITE_DEMO_MODE = false;

// Mock Clients (Tenants) - Fallback / Seeding Data
export const MOCK_CLIENTS: Client[] = [
  { id: 'CLI-TESLA', name: 'Tesla Gigafactory', industry: 'Automotive', userCount: 1420, status: 'Active', logoInitials: 'TG', domain: 'tesla.com' },
  { id: 'CLI-SPACEX', name: 'SpaceX Ops', industry: 'Aerospace', userCount: 850, status: 'Active', logoInitials: 'SX', domain: 'spacex.com' },
  { id: 'CLI-SHELL', name: 'Shell Refinery', industry: 'Oil & Gas', userCount: 2100, status: 'Pending', logoInitials: 'SR', domain: 'shell.com' },
];

// Mock Users with strict Client Association
export const MOCK_USERS: User[] = [
  { id: 'ADM-001', name: 'Sarah Connor', email: 'sarah@lumen.ai', role: 'Super Admin', clientId: 'LUMEN-CORE', status: 'Active' },
  // Tesla Users
  { id: 'TCH-102', name: 'Dr. Octavius', email: 'doc@tesla.com', role: 'Teacher', clientId: 'CLI-TESLA', status: 'Active' },
  { id: 'OP-442', name: 'Rivera, Alex', email: 'arivera@tesla.com', role: 'Student', clientId: 'CLI-TESLA', status: 'Active' },
  { id: 'OP-445', name: 'Kowalski, P', email: 'pkowalski@tesla.com', role: 'Student', clientId: 'CLI-TESLA', status: 'Active' },
  // SpaceX Users
  { id: 'OP-443', name: 'Chen, Wei', email: 'wchen@spacex.com', role: 'Student', clientId: 'CLI-SPACEX', status: 'Active' },
  { id: 'OP-444', name: 'Smith, J', email: 'jsmith@spacex.com', role: 'Student', clientId: 'CLI-SPACEX', status: 'Active' },
];

// Mock Units - Some Global, Some Custom
export const MOCK_UNITS: Unit[] = [
  { 
    id: 'ALG-101', 
    title: 'Algebra Foundations', 
    category: 'Math', 
    status: 'active', 
    progress: 45,
    video_id: 'LwCRRUa8yTU',
    start_sec: 0,
    clientId: undefined // Global
  },
  { id: 'PHY-202', title: 'Torque & Leverage', category: 'Physics', status: 'locked', progress: 0 },
  { id: 'SAF-100', title: 'Lockout / Tagout', category: 'Safety', status: 'completed', progress: 100 },
  { id: 'MEC-303', title: 'Hydraulic Systems', category: 'Mechanics', status: 'locked', progress: 0 },
  // Custom Client Content
  { id: 'TSLA-900', title: 'Giga Press Safety', category: 'Mechanics', status: 'locked', progress: 0, clientId: 'CLI-TESLA' },
  { id: 'SPX-101', title: 'Orbital Mechanics', category: 'Physics', status: 'locked', progress: 0, clientId: 'CLI-SPACEX' },
];

export const MOCK_STUDENTS = MOCK_USERS.filter(u => u.role === 'Student').map(u => ({
  ...u,
  proficiency: Math.floor(Math.random() * 40) + 60 // Random proficiency for demo
}));

export const AUDIO_TRACKS = [
  { id: 1, title: 'Automotive Fault Diagnosis', subtitle: 'Chapter 1: Basics', duration: '12:04' },
  { id: 2, title: 'Lean Manufacturing', subtitle: 'The 5S System', duration: '08:30' },
  { id: 3, title: 'Electrical Safety', subtitle: 'High Voltage Protocols', duration: '15:45' },
];
