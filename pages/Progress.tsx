
import React, { useState, useEffect } from 'react';
import { getCourses } from '../services/db';
import { Lock, Check, Zap } from 'lucide-react';
import { Unit } from '../types';

const Progress = () => {
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
      const loadUnits = async () => {
          // Assume global context for demo progress view
          const data = await getCourses(undefined); 
          setUnits(data);
      };
      loadUnits();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="bg-lumen-surface/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5">
        <h2 className="text-2xl font-light text-white mb-6">Skill Acquisition Tree</h2>
        <div className="w-full h-4 bg-gray-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-lumen-primary via-lumen-highlight to-cyan-400 w-[35%] shadow-glow"></div>
        </div>
        <div className="flex justify-between mt-2 text-sm font-mono text-gray-400">
            <span>Level 3 Technician</span>
            <span>35% Mastered</span>
        </div>
      </div>

      {/* Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
        {/* Connector Line decoration */}
        <div className="hidden lg:block absolute top-12 left-[16%] right-[16%] h-1 bg-white/5 z-0"></div>

        {units.length === 0 && (
             <div className="text-gray-500 italic p-4">Loading Progress Data...</div>
        )}

        {units.map((unit, index) => (
            <div key={unit.id} className={`relative z-10 group`}>
                <div className={`
                    p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300
                    ${unit.status === 'active' 
                        ? 'bg-lumen-dim/30 border-lumen-primary shadow-glow transform scale-105' 
                        : unit.status === 'completed'
                        ? 'bg-lumen-surface/60 border-lumen-secondary/50'
                        : 'bg-black/40 border-white/5 opacity-60 grayscale'}
                `}>
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-mono px-2 py-1 rounded bg-black/40 border border-white/10 text-gray-400">
                            {unit.id}
                        </span>
                        {unit.status === 'active' && <Zap className="text-lumen-primary animate-pulse" size={20} />}
                        {unit.status === 'completed' && <Check className="text-lumen-secondary" size={20} />}
                        {unit.status === 'locked' && <Lock className="text-gray-600" size={20} />}
                    </div>
                    
                    <h3 className={`text-lg font-medium mb-1 ${unit.status === 'active' ? 'text-white' : 'text-gray-400'}`}>
                        {unit.title}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">{unit.category}</p>
                    
                    {unit.status !== 'locked' && (
                        <div className="w-full bg-gray-900 h-1.5 rounded-full">
                            <div 
                                className={`h-full rounded-full ${unit.status === 'active' ? 'bg-lumen-primary' : 'bg-lumen-secondary'}`} 
                                style={{ width: `${unit.progress}%` }}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Progress;
