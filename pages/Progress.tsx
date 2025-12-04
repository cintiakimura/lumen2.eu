

import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/db';
import { Unit } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Award, Lock, Star, Shield, Zap } from 'lucide-react';
import { BADGES, RANKS } from '../constants';

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

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Hero: Rank Display */}
      <div className="flex flex-col items-center justify-center py-12 bg-black/40 border border-white/5 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-lumen-primary/10 to-transparent"></div>
          
          <div className="text-6xl mb-4 animate-bounce relative z-10">{currentRank.image}</div>
          <h1 className={`text-4xl font-bold ${currentRank.color} mb-2 relative z-10 uppercase tracking-widest`}>{user?.rank}</h1>
          <p className="text-gray-400 font-mono text-sm relative z-10">CURRENT CLEARANCE LEVEL</p>
          
          <div className="w-64 h-2 bg-gray-800 rounded-full mt-6 relative z-10">
              <div className="h-full bg-lumen-primary shadow-glow" style={{ width: '45%' }}></div>
          </div>
          <p className="text-xs text-lumen-secondary mt-2 relative z-10 font-mono">{user?.xp} XP TOTAL</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Badge Case */}
          <div className="bg-lumen-surface/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <h2 className="text-xl text-white font-light mb-6 flex items-center gap-2">
                  <Award className="text-yellow-500" /> Service Ribbons & Badges
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {BADGES.map((badge) => {
                      const isUnlocked = user?.badges.some(b => b.id === badge.id);
                      return (
                          <div key={badge.id} className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 text-center border transition-all ${isUnlocked ? 'bg-white/5 border-lumen-secondary/30 shadow-glow-sm' : 'bg-black/40 border-transparent opacity-40 grayscale'}`}>
                              <div className="text-3xl mb-2">{badge.icon}</div>
                              <p className="text-[10px] font-bold text-gray-300 leading-tight">{badge.name}</p>
                          </div>
                      )
                  })}
              </div>
          </div>

          {/* Module Mastery */}
          <div className="bg-lumen-surface/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <h2 className="text-xl text-white font-light mb-6 flex items-center gap-2">
                  <Shield className="text-lumen-primary" /> System Mastery
              </h2>
              <div className="space-y-4">
                  {units.map((unit) => (
                      <div key={unit.id} className="flex items-center gap-4 p-3 rounded-xl bg-black/20 border border-white/5">
                          <div className={`p-2 rounded-lg ${unit.status === 'completed' ? 'text-lumen-primary bg-lumen-primary/10' : 'text-gray-600 bg-gray-800'}`}>
                              {unit.status === 'completed' ? <CheckCircle size={20} /> : <Lock size={20} />}
                          </div>
                          <div className="flex-1">
                              <h4 className={`text-sm font-bold ${unit.status === 'completed' ? 'text-white' : 'text-gray-500'}`}>{unit.title}</h4>
                              <p className="text-[10px] text-gray-600 font-mono">{unit.category} • +{unit.xpReward || 500} XP</p>
                          </div>
                          {unit.status === 'completed' && (
                              <div className="flex gap-1 text-yellow-500">
                                  <Star size={12} fill="currentColor" />
                                  <Star size={12} fill="currentColor" />
                                  <Star size={12} fill="currentColor" />
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};

// Helper for icon
import { CheckCircle } from 'lucide-react';

export default Progress;
