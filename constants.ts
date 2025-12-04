

import { Unit, Client, User, Rank, Badge } from './types';

// Feature flags
export const VITE_DEMO_MODE = false;

// Gamification Constants - Professional/Industrial Theme
export const RANKS: { name: Rank; minXP: number; color: string; image: string }[] = [
    { name: 'Operative', minXP: 0, color: 'text-gray-400', image: 'T-1' },
    { name: 'Technician', minXP: 1000, color: 'text-lumen-secondary', image: 'T-2' },
    { name: 'Specialist', minXP: 3000, color: 'text-lumen-primary', image: 'S-3' },
    { name: 'Senior Engineer', minXP: 6000, color: 'text-purple-400', image: 'E-4' },
    { name: 'Systems Architect', minXP: 10000, color: 'text-yellow-400', image: 'A-5' },
];

export const BADGES: Badge[] = [
    { id: 'b1', name: 'System Initialization', icon: 'zap', description: 'First module successfully integrated.' },
    { id: 'b2', name: 'Zero Tolerance', icon: 'crosshair', description: 'Achieved 100% calibration accuracy on assessment.' },
    { id: 'b3', name: 'Velocity Efficiency', icon: 'timer', description: 'Completed operation cycle in record time.' },
    { id: 'b4', name: 'Protocol Alpha', icon: 'shield', description: 'Full compliance with Safety Standards.' },
    { id: 'b5', name: 'Neural Uplink', icon: 'brain', description: 'Established high-bandwidth connection with AI Core.' },
];

// Mock Clients (Tenants) - Fallback / Seeding Data
export const MOCK_CLIENTS: Client[] = [
  { id: 'CLI-TESLA', name: 'Tesla Gigafactory', industry: 'Automotive', userCount: 1420, status: 'Active', logoInitials: 'TG', domain: 'tesla.com' },
  { id: 'CLI-SPACEX', name: 'SpaceX Ops', industry: 'Aerospace', userCount: 850, status: 'Active', logoInitials: 'SX', domain: 'spacex.com' },
  { id: 'CLI-SHELL', name: 'Shell Refinery', industry: 'Oil & Gas', userCount: 2100, status: 'Pending', logoInitials: 'SR', domain: 'shell.com' },
];

// Mock Users with strict Client Association
export const MOCK_USERS: User[] = [
  { id: 'ADM-001', name: 'Sarah Connor', email: 'sarah@lumen.ai', role: 'Super Admin', clientId: 'LUMEN-CORE', status: 'Active', xp: 12500, rank: 'Systems Architect', badges: [BADGES[0], BADGES[1]] },
  // Tesla Users
  { id: 'TCH-102', name: 'Dr. Octavius', email: 'doc@tesla.com', role: 'Teacher', clientId: 'CLI-TESLA', status: 'Active', xp: 8000, rank: 'Senior Engineer', badges: [BADGES[1]] },
  { id: 'OP-442', name: 'Rivera, Alex', email: 'arivera@tesla.com', role: 'Student', clientId: 'CLI-TESLA', status: 'Active', xp: 2400, rank: 'Technician', badges: [BADGES[0]] },
  { id: 'OP-445', name: 'Kowalski, P', email: 'pkowalski@tesla.com', role: 'Student', clientId: 'CLI-TESLA', status: 'Active', xp: 500, rank: 'Operative', badges: [] },
  // SpaceX Users
  { id: 'OP-443', name: 'Chen, Wei', email: 'wchen@spacex.com', role: 'Student', clientId: 'CLI-SPACEX', status: 'Active', xp: 4500, rank: 'Specialist', badges: [BADGES[0], BADGES[2]] },
  { id: 'OP-444', name: 'Smith, J', email: 'jsmith@spacex.com', role: 'Student', clientId: 'CLI-SPACEX', status: 'Active', xp: 1200, rank: 'Technician', badges: [] },
];

// Mock Units - With Visual Map Coordinates
export const MOCK_UNITS: Unit[] = [
  { id: 'SAF-100', title: 'Lockout / Tagout', category: 'Safety', status: 'completed', progress: 100, coordinates: { x: 20, y: 50 }, xpReward: 500, missionType: 'Main Quest' },
  { 
    id: 'ALG-101', 
    title: 'Algebra Foundations', 
    category: 'Math', 
    status: 'active', 
    progress: 45,
    video_id: 'LwCRRUa8yTU',
    start_sec: 0,
    clientId: undefined, 
    content: "Algebra is the study of mathematical symbols and the rules for manipulating these symbols. In industrial settings, variables often represent pressure, temperature, or voltage.",
    nodes: [
        { id: 'n1', title: 'Variables', type: 'video', completed: true },
        { id: 'n2', title: 'Linear Eq', type: 'read', completed: false },
        { id: 'n3', title: 'Final Test', type: 'quiz', completed: false }
    ],
    coordinates: { x: 40, y: 30 },
    xpReward: 800,
    missionType: 'Main Quest'
  },
  { 
      id: 'PHY-202', 
      title: 'Torque & Leverage', 
      category: 'Physics', 
      status: 'locked', 
      progress: 0,
      content: "Torque is a measure of the force that can cause an object to rotate about an axis. T = F * r * sin(theta).",
      nodes: [
        { id: 'n1', title: 'Force Vectors', type: 'video', completed: false },
        { id: 'n2', title: 'Lever Arms', type: 'read', completed: false },
        { id: 'n3', title: 'Wrench Exam', type: 'quiz', completed: false }
    ],
    coordinates: { x: 60, y: 60 },
    xpReward: 1000,
    missionType: 'Main Quest'
  },
  { id: 'MEC-303', title: 'Hydraulic Systems', category: 'Mechanics', status: 'locked', progress: 0, coordinates: { x: 80, y: 40 }, xpReward: 1500, missionType: 'Main Quest' },
  // Custom Client Content
  { id: 'TSLA-900', title: 'Giga Press Safety', category: 'Mechanics', status: 'locked', progress: 0, clientId: 'CLI-TESLA', coordinates: { x: 50, y: 80 }, xpReward: 2000, missionType: 'Side Quest' },
  { id: 'SPX-101', title: 'Orbital Mechanics', category: 'Physics', status: 'locked', progress: 0, clientId: 'CLI-SPACEX', coordinates: { x: 50, y: 20 }, xpReward: 2500, missionType: 'Side Quest' },
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