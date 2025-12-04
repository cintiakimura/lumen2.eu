

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Activity, Box, Shield, Zap, Target, Award, Users, Server, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { RANKS } from '../constants';
import { getCourses } from '../services/db';

const data = [
  { time: 'Mon', load: 30, performance: 80 },
  { time: 'Tue', load: 45, performance: 78 },
  { time: 'Wed', load: 35, performance: 85 },
  { time: 'Thu', load: 60, performance: 65 },
  { time: 'Fri', load: 20, performance: 90 },
];

// --- 1. STUDENT VIEW ---
const StudentDashboard = ({ user }: { user: any }) => {
    const navigate = useNavigate();
    const currentRank = RANKS.find(r => r.name === user.rank) || RANKS[0];
    const nextRank = RANKS.find(r => r.minXP > user.xp) || RANKS[RANKS.length - 1];
    const xpNeeded = nextRank.minXP - user.xp;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-gradient-to-r from-lumen-dim/40 to-black p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Target size={200} className="text-lumen-primary" />
                </div>
                
                <div className="relative z-10 text-center md:text-left">
                    <h1 className="text-4xl font-light text-white mb-2">
                        Welcome back, <span className="font-bold text-lumen-primary">{user.name.split(',')[1] || user.name.split(' ')[0]}</span>.
                    </h1>
                    <p className="text-lumen-secondary font-mono tracking-widest text-sm">OPERATOR STATUS: ACTIVE • {user.clientId}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                        <button 
                            onClick={() => navigate('/learn')}
                            className="px-8 py-3 bg-lumen-primary text-black font-bold rounded-xl shadow-glow hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <Zap size={20} fill="currentColor" />
                            RESUME MISSION
                        </button>
                        <button 
                             onClick={() => navigate('/progress')}
                             className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                            <Award size={20} />
                            VIEW BADGES
                        </button>
                    </div>
                </div>

                {/* Rank Card */}
                <div className="relative z-10 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-full md:w-80">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs text-gray-400 font-mono uppercase">Current Rank</p>
                            <h3 className={`text-2xl font-bold ${currentRank.color}`}>{user.rank.toUpperCase()}</h3>
                        </div>
                        <div className="text-4xl">{currentRank.image}</div>
                    </div>
                    <div className="space-y-2">
                         <div className="flex justify-between text-xs font-mono">
                             <span className="text-white">{user.xp} XP</span>
                             <span className="text-gray-500">NEXT: {nextRank.minXP} XP</span>
                         </div>
                         <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-lumen-primary shadow-[0_0_10px_#00c600]" 
                                style={{ width: `${(user.xp / nextRank.minXP) * 100}%` }}
                             ></div>
                         </div>
                         <p className="text-[10px] text-lumen-secondary text-right mt-1">
                             {xpNeeded <= 0 ? 'MAX RANK ACHIEVED' : `${xpNeeded} XP TO PROMOTION`}
                         </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-lumen-surface/60 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-lumen-primary/30 transition-colors">
                    <div className="p-4 bg-lumen-primary/10 rounded-full text-lumen-primary">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold text-white">12</h4>
                        <p className="text-xs text-gray-500 font-mono uppercase">Missions Complete</p>
                    </div>
                </div>
                <div className="p-6 bg-lumen-surface/60 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-lumen-secondary/30 transition-colors">
                    <div className="p-4 bg-lumen-secondary/10 rounded-full text-lumen-secondary">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold text-white">4.5h</h4>
                        <p className="text-xs text-gray-500 font-mono uppercase">Training Time</p>
                    </div>
                </div>
                <div className="p-6 bg-lumen-surface/60 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-yellow-400/30 transition-colors">
                    <div className="p-4 bg-yellow-400/10 rounded-full text-yellow-400">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold text-white">5 Day</h4>
                        <p className="text-xs text-gray-500 font-mono uppercase">Current Streak</p>
                    </div>
                </div>
            </div>

            {/* Daily Challenge */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-lumen-primary/30 rounded-2xl p-6 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-lumen-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="flex justify-between items-center relative z-10">
                     <div className="flex gap-4 items-center">
                         <div className="p-3 bg-lumen-primary text-black rounded-lg font-bold shadow-glow">
                             <Target size={24} />
                         </div>
                         <div>
                             <h3 className="text-white font-bold text-lg">Daily Challenge: Precision Engineer</h3>
                             <p className="text-gray-400 text-sm">Score 100% on any Physics Module today.</p>
                         </div>
                     </div>
                     <div className="text-right">
                         <span className="block text-2xl font-bold text-lumen-primary">+200 XP</span>
                         <span className="text-xs text-gray-500 font-mono">REWARD</span>
                     </div>
                 </div>
            </div>
        </div>
    );
}

// --- 2. TEACHER VIEW ---
const TeacherDashboard = ({ user }: { user: any }) => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center bg-lumen-surface/80 p-6 rounded-2xl border border-white/10">
            <div>
                <h1 className="text-2xl font-light text-white">Fleet Command</h1>
                <p className="text-gray-400 text-sm mt-1">Monitoring {user.clientId} Personnel</p>
            </div>
            <div className="flex gap-3">
                 <button className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-300 hover:text-white">Generate Report</button>
                 <button className="px-4 py-2 bg-lumen-secondary/20 text-lumen-secondary border border-lumen-secondary/50 rounded-lg text-sm font-bold">Broadcast Alert</button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                    <AlertTriangle className="text-red-500" />
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Action Req</span>
                </div>
                <h3 className="text-2xl font-bold text-white">3</h3>
                <p className="text-sm text-gray-400">Technicians At Risk</p>
            </div>
            <div className="bg-lumen-surface/60 border border-white/5 p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                    <CheckCircle className="text-green-500" />
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">+12%</span>
                </div>
                <h3 className="text-2xl font-bold text-white">94%</h3>
                <p className="text-sm text-gray-400">Compliance Rate</p>
            </div>
            <div className="col-span-2 bg-lumen-surface/60 border border-white/5 p-6 rounded-2xl">
                 <h3 className="text-sm text-gray-400 font-mono mb-4 uppercase">Skill Gaps Detected</h3>
                 <div className="space-y-3">
                     <div className="flex justify-between items-center">
                         <span className="text-white text-sm">Hydraulics Safety</span>
                         <div className="w-1/2 h-1.5 bg-gray-800 rounded-full"><div className="w-[45%] h-full bg-red-500 rounded-full"></div></div>
                         <span className="text-red-400 text-xs font-mono">45% AVG</span>
                     </div>
                     <div className="flex justify-between items-center">
                         <span className="text-white text-sm">Electrical Basics</span>
                         <div className="w-1/2 h-1.5 bg-gray-800 rounded-full"><div className="w-[75%] h-full bg-yellow-500 rounded-full"></div></div>
                         <span className="text-yellow-400 text-xs font-mono">75% AVG</span>
                     </div>
                 </div>
            </div>
        </div>
    </div>
);

// --- 3. ADMIN VIEW ---
const AdminDashboard = () => (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-purple-900/20 border border-purple-500/30 p-8 rounded-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-20">
                 <Server size={120} className="text-purple-400" />
             </div>
             <h1 className="text-3xl font-light text-white mb-2">System Administration</h1>
             <p className="text-purple-300 font-mono text-sm">ROOT ACCESS GRANTED • LUMEN CORE V2.5</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-black/40 border border-white/10 rounded-2xl">
                <h3 className="text-gray-400 text-sm font-mono mb-2">SYSTEM LOAD</h3>
                <div className="text-3xl text-white font-bold mb-4">24%</div>
                <div className="h-24">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="load" stroke="#8884d8" fillOpacity={1} fill="url(#colorLoad)" />
                        </AreaChart>
                     </ResponsiveContainer>
                </div>
            </div>
            <div className="p-6 bg-black/40 border border-white/10 rounded-2xl">
                 <h3 className="text-gray-400 text-sm font-mono mb-2">TOTAL USERS</h3>
                 <div className="text-3xl text-white font-bold mb-4">2,405</div>
                 <div className="flex items-center gap-2 text-xs text-green-400">
                     <Users size={14} /> +125 this week
                 </div>
            </div>
            <div className="p-6 bg-black/40 border border-white/10 rounded-2xl">
                 <h3 className="text-gray-400 text-sm font-mono mb-2">STORAGE USAGE</h3>
                 <div className="text-3xl text-white font-bold mb-4">456 GB</div>
                 <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                     <div className="h-full bg-purple-500 w-[45%]"></div>
                 </div>
            </div>
        </div>
    </div>
);

// --- MAIN ROUTER ---
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect Super Admins
  useEffect(() => {
      if (user?.role === 'Super Admin') {
          // Optional: Keep them on dashboard if they want, but traditionally admin goes to admin panel
          // navigate('/admin'); 
      }
  }, [user, navigate]);

  if (!user) return null;

  if (user.role === 'Student') return <StudentDashboard user={user} />;
  if (user.role === 'Teacher') return <TeacherDashboard user={user} />;
  
  return <AdminDashboard />;
};

export default Dashboard;
