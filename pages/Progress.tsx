

import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/db';
import { Unit } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
    Award, Lock, Star, Shield, Zap, Crosshair, Timer, 
    BrainCircuit, CheckCircle, ChevronRight, Activity, 
    Hexagon, Aperture, Component, Layers 
} from 'lucide-react';
import { BADGES, RANKS } from '../constants';

// Map constant IDs to Lucide components
const ICON_MAP: Record<string, any> = {
    'zap': Zap,
    'crosshair': Crosshair,
    'timer': Timer,
    'shield': Shield,
    'brain': BrainCircuit
};

const Progress = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
      const loadUnits = async () => {
          const data = await getCourses(user?.clientId); 
          setUnits(data);
      };
      loadUnits();
  }, [user]);

  const currentRank = RANKS.find(r => r.name === user?.rank) || RANKS[0];
  const nextRank = RANKS.find(r => r.minXP > (user?.xp || 0)) || RANKS[RANKS.length - 1];
  const progressPercent = nextRank === currentRank ? 100 : ((user?.xp || 0) - currentRank.minXP) / (nextRank.minXP - currentRank.minXP) * 100;

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      
      {/* Hero: Rank Display - Sci-Fi Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0a1410] border border-white/10 p-8 md:p-12">
          {/* Backgrounds */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-lumen-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-lumen-secondary/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-white/10 bg-white/5 text-[10px] font-mono text-gray-400 mb-4 uppercase tracking-widest">
                      <Activity size={12} className="text-lumen-primary animate-pulse" />
                      Clearance Level Verified
                  </div>
                  <h1 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter ${currentRank.color} mb-2`}>
                      {user?.rank}
                  </h1>
                  <p className="text-gray-400 font-mono text-sm max-w-md">
                      Current operational status active. Continue training modules to acquire clearance for {nextRank.name}.
                  </p>
                  
                  {/* XP Bar */}
                  <div className="mt-8 max-w-lg">
                      <div className="flex justify-between text-xs font-bold font-mono text-gray-500 mb-2">
                          <span>EXP. LOG</span>
                          <span>{Math.floor(progressPercent)}% TO PROMOTION</span>
                      </div>
                      <div className="h-4 bg-black/50 rounded-sm border border-white/10 p-0.5">
                          <div 
                            className="h-full bg-gradient-to-r from-lumen-dim to-lumen-primary shadow-[0_0_15px_rgba(0,198,0,0.5)]" 
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                      </div>
                  </div>
              </div>

              {/* Rank Insignia */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                   {/* Decorative Rings */}
                   <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full animate-[spin_10s_linear_infinite]"></div>
                   <div className="absolute inset-4 border border-white/5 rounded-full"></div>
                   
                   <div className="w-32 h-32 bg-gradient-to-tr from-lumen-surface to-black border border-white/20 rounded-xl rotate-45 flex items-center justify-center shadow-2xl relative overflow-hidden">
                       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                       <span className={`text-5xl font-black -rotate-45 ${currentRank.color} drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]`}>
                           {currentRank.image}
                       </span>
                   </div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Badge Case - Industrial Grid */}
          <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl text-white font-light flex items-center gap-3">
                    <Award className="text-lumen-secondary" /> 
                    <span className="uppercase tracking-widest font-bold text-sm">Service Commendations</span>
                 </h2>
                 <span className="text-xs font-mono text-gray-500">{user?.badges.length} / {BADGES.length} ACQUIRED</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {BADGES.map((badge) => {
                      const isUnlocked = user?.badges.some(b => b.id === badge.id);
                      const IconComponent = ICON_MAP[badge.icon] || Award;

                      return (
                          <div key={badge.id} className={`group relative p-1 transition-all duration-500 ${isUnlocked ? 'hover:scale-[1.02]' : 'opacity-50 grayscale'}`}>
                              {/* Hexagon Border SVG */}
                              <div className={`absolute inset-0 ${isUnlocked ? 'text-lumen-primary/30' : 'text-gray-800'}`}>
                                  <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current stroke-2">
                                      <path d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z" />
                                  </svg>
                              </div>
                              
                              <div className="aspect-[1/1.15] flex flex-col items-center justify-center p-4 text-center relative z-10">
                                  <div className={`
                                      mb-3 p-3 rounded-full transition-all duration-500
                                      ${isUnlocked 
                                        ? 'bg-lumen-primary/10 text-lumen-primary shadow-[0_0_20px_rgba(0,198,0,0.3)]' 
                                        : 'bg-black/40 text-gray-600'}
                                  `}>
                                      <IconComponent size={24} strokeWidth={1.5} />
                                  </div>
                                  <p className={`text-[10px] font-bold uppercase tracking-wide leading-tight ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                                      {badge.name}
                                  </p>
                              </div>
                              
                              {/* Description Tooltip */}
                              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 text-center z-20 pointer-events-none">
                                   <p className="text-[10px] text-gray-300 font-mono leading-tight">{badge.description}</p>
                              </div>
                          </div>
                      )
                  })}
              </div>
          </div>

          {/* Module Mastery - List View */}
          <div className="bg-lumen-surface/30 border border-white/5 rounded-2xl p-6 h-fit">
              <h2 className="text-xl text-white font-light mb-6 flex items-center gap-3">
                  <Component className="text-lumen-primary" /> 
                  <span className="uppercase tracking-widest font-bold text-sm">Module Mastery</span>
              </h2>
              <div className="space-y-1">
                  {units.map((unit) => (
                      <div key={unit.id} className="group relative overflow-hidden p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-all">
                          {/* Progress Bar Background */}
                          <div className="absolute bottom-0 left-0 h-0.5 bg-gray-800 w-full">
                              <div className="h-full bg-lumen-primary" style={{ width: `${unit.progress}%` }}></div>
                          </div>

                          <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded bg-black border ${unit.status === 'completed' ? 'border-lumen-primary/50 text-lumen-primary' : 'border-white/10 text-gray-600'}`}>
                                      {unit.status === 'completed' ? <CheckCircle size={16} /> : <Lock size={16} />}
                                  </div>
                                  <div>
                                      <h4 className={`text-sm font-bold ${unit.status === 'completed' ? 'text-gray-200' : 'text-gray-500'}`}>{unit.title}</h4>
                                      <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600">
                                          <span>{unit.id}</span>
                                          <span>•</span>
                                          <span className="uppercase">{unit.category}</span>
                                      </div>
                                  </div>
                              </div>
                              {unit.status === 'completed' && (
                                  <div className="flex gap-0.5">
                                      {[1,2,3].map(i => (
                                          <div key={i} className="w-1 h-3 bg-lumen-primary/50 skew-x-12"></div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Progress;