

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Activity, Box, Shield, Zap, Target, Award, Users, Server, Clock, Play, Map, ChevronRight } from 'lucide-react';
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

// --- 1. STUDENT VIEW (GAMIFIED) ---
const StudentDashboard = ({ user }: { user: any }) => {
    const navigate = useNavigate();
    const currentRank = RANKS.find(r => r.name === user.rank) || RANKS[0];
    const nextRank = RANKS.find(r => r.minXP > user.xp) || RANKS[RANKS.length - 1];
    const xpNeeded = nextRank.minXP - user.xp;
    const progressPercent = nextRank === currentRank ? 100 : ((user.xp || 0) - currentRank.minXP) / (nextRank.minXP - currentRank.minXP) * 100;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl border border-lumen-primary/30 bg-[#0a1410] min-h-[300px] flex flex-col md:flex-row">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="absolute right-0 top-0 w-2/3 h-full bg-gradient-to-l from-lumen-primary/10 to-transparent"></div>
                
                {/* Left Content */}
                <div className="relative z-10 p-8 md:p-12 flex flex-col justify-center flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lumen-primary/10 border border-lumen-primary/30 text-lumen-primary text-xs font-mono mb-4 w-fit">
                        <div className="w-2 h-2 rounded-full bg-lumen-primary animate-pulse"></div>
                        SYSTEM ONLINE // READY
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight">
                        WAKE UP, <span className="text-transparent bg-clip-text bg-gradient-to-r from-lumen-primary to-lumen-secondary">{user.name.split(' ')[0].toUpperCase()}</span>.
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-8">
                        Your next mission awaits. The fleet needs its best technicians.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button 
                            onClick={() => navigate('/learn')}
                            className="px-8 py-4 bg-lumen-primary hover:bg-lumen-highlight text-black font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(0,198,0,0.4)] hover:shadow-[0_0_30px_rgba(0,198,0,0.6)] hover:scale-105 transition-all flex items-center gap-3 group"
                        >
                            <Play size={24} fill="currentColor" />
                            ENTER SIMULATION
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Right Stat Block */}
                <div className="relative z-10 p-8 md:border-l border-white/10 flex flex-col justify-center w-full md:w-80 bg-black/20 backdrop-blur-sm">
                     <div className="text-center mb-6">
                         <div className="text-6xl mb-2 drop-shadow-glow">{currentRank.image}</div>
                         <h2 className={`text-2xl font-black uppercase tracking-widest ${currentRank.color}`}>{user.rank}</h2>
                         <p className="text-xs text-gray-500 font-mono">CLEARANCE LEVEL {RANKS.indexOf(currentRank) + 1}</p>
                     </div>
                     
                     <div className="space-y-1">
                         <div className="flex justify-between text-xs font-bold text-gray-400">
                             <span>EXP</span>
                             <span>{Math.floor(progressPercent)}%</span>
                         </div>
                         <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                             <div 
                                className="h-full bg-gradient-to-r from-lumen-primary to-lumen-secondary shadow-[0_0_10px_#00c600]" 
                                style={{ width: `${progressPercent}%` }}
                             ></div>
                         </div>
                         <p className="text-[10px] text-center text-gray-500 mt-2 font-mono">
                             {xpNeeded > 0 ? `${xpNeeded} XP UNTIL PROMOTION` : 'MAX LEVEL'}
                         </p>
                     </div>
                </div>
            </div>

            {/* Missions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Daily Challenge */}
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 hover:border-lumen-secondary/50 transition-all cursor-pointer">
                    <div className="absolute inset-0 bg-lumen-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-lumen-secondary/10 text-lumen-secondary rounded-lg">
                                <Target size={24} />
                            </div>
                            <span className="px-2 py-1 bg-lumen-secondary/10 border border-lumen-secondary/30 rounded text-[10px] text-lumen-secondary font-bold uppercase">Daily</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Precision Calibrator</h3>
                        <p className="text-sm text-gray-400 mb-4">Complete 3 Physics modules with &gt;90% accuracy.</p>
                        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                            <div className="h-1.5 w-24 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-lumen-secondary w-1/3"></div>
                            </div>
                            1/3 COMPLETE
                        </div>
                    </div>
                </div>

                {/* Streak */}
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 hover:border-yellow-500/50 transition-all cursor-pointer">
                    <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-[10px] text-yellow-500 font-bold uppercase">Streak</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">5 Day Streak</h3>
                        <p className="text-sm text-gray-400 mb-4">You're on fire! Login tomorrow to keep it going.</p>
                        <div className="flex gap-1">
                             {[1,2,3,4,5].map(d => (
                                 <div key={d} className="w-2 h-8 rounded-sm bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
                             ))}
                             {[6,7].map(d => (
                                 <div key={d} className="w-2 h-8 rounded-sm bg-gray-800"></div>
                             ))}
                        </div>
                    </div>
                </div>

                {/* Map Shortcut */}
                <div onClick={() => navigate('/learn')} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 hover:border-lumen-primary/50 transition-all cursor-pointer">
                    <div className="absolute inset-0 bg-lumen-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-lumen-primary/10 text-lumen-primary rounded-lg">
                                <Map size={24} />
                            </div>
                            <span className="px-2 py-1 bg-lumen-primary/10 border border-lumen-primary/30 rounded text-[10px] text-lumen-primary font-bold uppercase">Resume</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Sector 4: Mechanics</h3>
                        <p className="text-sm text-gray-400 mb-4">Hydraulics Mastery is 45% complete.</p>
                        <div className="text-lumen-primary text-sm font-bold flex items-center gap-1 group-hover:translate-x-2 transition-transform">
                            JUMP TO SECTOR <ChevronRight size={16} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- 2. TEACHER VIEW (CLEAN & DATA FOCUSED) ---
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

// --- 3. ADMIN VIEW (SYSTEM FOCUSED) ---
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
          // navigate('/admin'); 
      }
  }, [user, navigate]);

  if (!user) return null;

  if (user.role === 'Student') return <StudentDashboard user={user} />;
  if (user.role === 'Teacher') return <TeacherDashboard user={user} />;
  
  return <AdminDashboard />;
};

export default Dashboard;
