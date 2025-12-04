

import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, CheckCircle, Lock, BookOpen, Star, Mic, Send, Bot, User, ArrowRight, X, Zap, Shield, HelpCircle, Terminal } from 'lucide-react';
import { runAdaptiveTutor } from '../services/geminiService';
import { getCourses, updateUserXP } from '../services/db';
import { Unit } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Learning = () => {
  const { user } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [activeUnit, setActiveUnit] = useState<Unit | null>(null);
  const [activeNode, setActiveNode] = useState<any | null>(null);
  const [mode, setMode] = useState<'map' | 'briefing' | 'content' | 'test'>('map');

  // Chat/Test State
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [testPassed, setTestPassed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
        if (!user) return;
        const data = await getCourses(user.clientId);
        setUnits(data);
    };
    loadData();
  }, [user]);

  useEffect(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Node Click -> Open Briefing
  const handleSystemSelect = (unit: Unit) => {
      if (unit.status === 'locked') {
          toast.error("System Locked. Complete previous missions first.", { icon: '🔒' });
          return;
      }
      setActiveUnit(unit);
      setMode('briefing');
  };

  const startMission = () => {
      if (!activeUnit) return;
      if (activeUnit.nodes && activeUnit.nodes.length > 0) {
          setActiveNode(activeUnit.nodes[0]);
          setMode('content');
      } else {
          // Direct to test if no content nodes
          startTest(activeUnit);
      }
  };

  const startTest = (unit: Unit) => {
      setMode('test');
      setMessages([{
          role: 'model',
          text: `SYSTEM OVERRIDE DETECTED.\n\nIdentity confirmed: ${user?.name}.\nTo secure this node, you must demonstrate mastery of: ${unit.title.toUpperCase()}.\n\nStandby for query...`
      }]);
      setTestPassed(false);
  };

  const handleSendMessage = async () => {
      if (!input.trim() || loading || testPassed) return;

      const userMsg = { role: 'user' as const, text: input };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      const response = await runAdaptiveTutor(messages, input, activeUnit?.content || "Basic concepts.");
      
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      setLoading(false);

      if (response.passed) {
          setTestPassed(true);
          handlePass();
      }
  };

  const handlePass = async () => {
      if (!activeUnit) return;
      const xpGain = activeUnit.xpReward || 500;
      
      // Update XP
      if (user) {
         const { newRank } = await updateUserXP(user.id, xpGain);
         
         // Visual Feedback Delay
         setTimeout(() => {
             toast.custom((t) => (
                 <div className="bg-black border-2 border-lumen-primary p-6 rounded-2xl shadow-[0_0_30px_#00c600] text-center animate-in zoom-in">
                     <div className="text-4xl mb-2">🎉</div>
                     <h1 className="text-2xl font-bold text-white mb-1">MISSION ACCOMPLISHED</h1>
                     <p className="text-lumen-primary font-mono text-lg">+{xpGain} XP</p>
                     {newRank && <p className="text-yellow-400 font-bold mt-2 animate-bounce">RANK UP! {newRank}</p>}
                 </div>
             ), { duration: 4000 });
         }, 500);
      }
      
      // Mark as completed locally
      const updatedUnits = units.map(u => {
          if (u.id === activeUnit.id) {
              return { ...u, status: 'completed' as const, progress: 100 };
          }
          // Simple logic: Unlock next locked unit
          return u; 
      });
      // In a real app, logic to unlock the specific next node would be here
      // For demo, we just unlock everything or one by one.
      setUnits(updatedUnits);
  };

  return (
    <div className="h-[calc(100vh-8rem)] relative overflow-hidden bg-[#050a08] rounded-3xl border border-white/5 shadow-2xl">
        
        {/* --- MODE: MAP (The Galaxy View) --- */}
        {mode === 'map' && (
            <div className="absolute inset-0 overflow-auto cursor-grab active:cursor-grabbing custom-scrollbar">
                {/* Background Grid */}
                <div className="absolute inset-0 w-[200%] h-[200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at center, transparent 0%, #050a08 100%)' }}></div>
                
                {/* MAP CONTAINER */}
                <div className="relative w-full h-full min-h-[600px] flex items-center justify-center">
                    
                    {/* SVG Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <defs>
                             <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="4" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        {units.map((unit, i) => {
                             if (i === units.length - 1) return null;
                             const next = units[i+1];
                             if (!unit.coordinates || !next.coordinates) return null;
                             
                             return (
                                 <line 
                                    key={i}
                                    x1={`${unit.coordinates.x}%`} 
                                    y1={`${unit.coordinates.y}%`} 
                                    x2={`${next.coordinates.x}%`} 
                                    y2={`${next.coordinates.y}%`} 
                                    stroke={unit.status === 'completed' ? '#00c600' : '#333'} 
                                    strokeWidth="2" 
                                    strokeDasharray={unit.status === 'completed' ? '0' : '5,5'}
                                    className="transition-colors duration-1000"
                                 />
                             );
                        })}
                    </svg>

                    {/* Nodes */}
                    {units.map((unit) => (
                        <div 
                            key={unit.id}
                            onClick={() => handleSystemSelect(unit)}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group cursor-pointer`}
                            style={{ left: `${unit.coordinates?.x || 50}%`, top: `${unit.coordinates?.y || 50}%` }}
                        >
                            {/* Pulse Effect for Active */}
                            {unit.status === 'active' && (
                                <div className="absolute inset-0 bg-lumen-primary/30 rounded-full animate-ping"></div>
                            )}

                            {/* Node Circle */}
                            <div className={`
                                w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center border-4 relative z-10 shadow-xl
                                ${unit.status === 'completed' 
                                    ? 'bg-black border-lumen-primary text-lumen-primary shadow-[0_0_20px_rgba(0,198,0,0.4)]' 
                                    : unit.status === 'active'
                                        ? 'bg-black border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-110'
                                        : 'bg-black/50 border-gray-800 text-gray-700 grayscale'}
                            `}>
                                {unit.status === 'completed' ? <CheckCircle size={28} /> : 
                                 unit.status === 'locked' ? <Lock size={24} /> : 
                                 <Star size={28} fill="currentColor" />}
                            </div>

                            {/* Label */}
                            <div className={`
                                absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded bg-black/80 backdrop-blur border border-white/10 text-xs font-mono
                                ${unit.status === 'locked' ? 'text-gray-600' : 'text-white group-hover:text-lumen-primary group-hover:border-lumen-primary'}
                            `}>
                                {unit.title}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- MODE: BRIEFING MODAL --- */}
        {mode === 'briefing' && activeUnit && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-[#0a1410] border border-lumen-primary/30 w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,198,0,0.1)]">
                    <div className="h-2 bg-gradient-to-r from-lumen-primary to-lumen-secondary"></div>
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lumen-primary font-mono text-xs tracking-widest uppercase mb-1">MISSION BRIEFING</h3>
                                <h1 className="text-3xl text-white font-light">{activeUnit.title}</h1>
                            </div>
                            <button onClick={() => setMode('map')} className="text-gray-500 hover:text-white"><X /></button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-gray-400 font-mono mb-1">OBJECTIVE</p>
                                <p className="text-white text-sm">{activeUnit.content?.substring(0, 100)}...</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-gray-400 font-mono mb-1">REWARDS</p>
                                <div className="flex items-center gap-2 text-yellow-400 font-bold">
                                    <Zap size={16} fill="currentColor" /> {activeUnit.xpReward || 500} XP
                                </div>
                                <div className="flex items-center gap-2 text-lumen-secondary text-sm mt-1">
                                    <Shield size={16} /> Access Key
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setMode('map')} className="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                                ABORT
                            </button>
                            <button onClick={startMission} className="flex-1 py-3 bg-lumen-primary text-black font-bold rounded-xl shadow-glow hover:scale-105 transition-transform">
                                ENGAGE SYSTEM
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODE: CONTENT --- */}
        {mode === 'content' && activeUnit && (
            <div className="absolute inset-0 bg-[#050a08] flex flex-col z-20 animate-in slide-in-from-right">
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40">
                    <h3 className="text-white font-medium">{activeUnit.title} <span className="text-gray-500">/</span> Learning Phase</h3>
                    <button onClick={() => setMode('map')} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm">
                        EXIT <X size={16} />
                    </button>
                </div>
                
                <div className="flex-1 flex overflow-hidden">
                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                         <div className="max-w-3xl mx-auto">
                            {/* Fake Video Player */}
                            <div className="aspect-video bg-gray-900 rounded-2xl mb-8 relative group overflow-hidden border border-white/10">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <PlayCircle size={64} className="text-white/50 group-hover:text-lumen-primary transition-colors cursor-pointer" />
                                </div>
                                <div className="absolute bottom-4 left-4 bg-black/60 px-2 py-1 rounded text-xs text-white">00:00 / 04:35</div>
                            </div>
                            
                            <h2 className="text-2xl text-white font-bold mb-4">Core Concepts</h2>
                            <div className="prose prose-invert prose-lg text-gray-300">
                                <p>{activeUnit.content}</p>
                            </div>

                            <button 
                                onClick={() => startTest(activeUnit)}
                                className="mt-12 w-full py-4 bg-lumen-secondary/10 border border-lumen-secondary/50 text-lumen-secondary font-bold rounded-xl hover:bg-lumen-secondary/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Terminal size={20} />
                                LAUNCH GAUNTLET PROTOCOL
                            </button>
                         </div>
                    </div>

                    {/* Right Sidebar Checklist */}
                    <div className="w-80 border-l border-white/10 bg-black/20 p-6 hidden lg:block">
                        <h4 className="text-xs font-mono text-gray-500 uppercase mb-4">Module Checklist</h4>
                        <div className="space-y-2">
                            {activeUnit.nodes?.map((node, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${
                                    activeNode?.id === node.id ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-500'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${node.completed ? 'bg-lumen-primary' : 'bg-gray-700'}`}></div>
                                    <span className="text-sm">{node.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- MODE: TEST (THE GAUNTLET) --- */}
        {mode === 'test' && (
            <div className="absolute inset-0 z-30 bg-black flex flex-col font-mono text-green-500">
                {/* CRT Effect Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
                
                {/* Header */}
                <div className="p-4 border-b border-green-500/30 flex justify-between items-center bg-green-900/10 relative z-20">
                     <div className="flex items-center gap-2 animate-pulse">
                         <Terminal size={18} />
                         <span>GAUNTLET_PROTOCOL_V4.exe</span>
                     </div>
                     <button onClick={() => setMode('map')} className="hover:text-white transition-colors"><X size={18} /></button>
                </div>

                {/* Chat Stream */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-20" ref={scrollRef}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <Bot className="shrink-0 mt-1" size={20} />}
                            <div className={`max-w-[80%] p-4 border ${
                                msg.role === 'user' 
                                ? 'border-white/30 text-white bg-white/5 rounded-l-xl rounded-br-xl' 
                                : 'border-green-500/30 text-green-400 bg-green-900/10 rounded-r-xl rounded-bl-xl shadow-[0_0_10px_rgba(0,198,0,0.1)]'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            {msg.role === 'user' && <User className="shrink-0 mt-1" size={20} />}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-2 text-green-500/50 animate-pulse ml-9">
                            <span>ANALYZING INPUT</span>
                            <span>...</span>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input */}
                <div className="p-6 border-t border-green-500/30 bg-black relative z-20">
                     {testPassed ? (
                         <button 
                            onClick={() => setMode('map')} 
                            className="w-full py-4 bg-green-500 text-black font-bold uppercase tracking-widest hover:bg-green-400 transition-colors shadow-glow"
                         >
                             Return to System Map
                         </button>
                     ) : (
                         <div className="flex gap-4">
                             <input 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="ENTER RESPONSE..."
                                className="flex-1 bg-transparent border-b-2 border-green-500/50 text-green-400 placeholder-green-500/30 focus:outline-none focus:border-green-500 py-2"
                                autoFocus
                             />
                             <button onClick={handleSendMessage} disabled={!input.trim()} className="text-green-500 hover:text-white disabled:opacity-50">
                                 <Send size={24} />
                             </button>
                         </div>
                     )}
                </div>
            </div>
        )}
    </div>
  );
};

export default Learning;
