

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
          toast.error("System Locked. Complete previous missions first.", { 
              icon: '🔒',
              style: { background: '#111', color: '#fff', border: '1px solid #333' }
          });
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
                 <div className="bg-black/90 backdrop-blur-md border-2 border-lumen-primary p-8 rounded-2xl shadow-[0_0_50px_#00c600] text-center animate-in zoom-in duration-500">
                     <div className="text-6xl mb-4 animate-bounce">🎉</div>
                     <h1 className="text-3xl font-black text-white mb-2 tracking-widest uppercase">MISSION ACCOMPLISHED</h1>
                     <div className="inline-block px-6 py-2 bg-lumen-primary text-black font-bold rounded-full text-xl shadow-glow">
                         +{xpGain} XP
                     </div>
                     {newRank && (
                         <div className="mt-6 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-xl">
                            <p className="text-yellow-400 font-bold text-sm tracking-widest uppercase mb-1">PROMOTION GRANTED</p>
                            <p className="text-2xl text-white font-black">{newRank}</p>
                         </div>
                     )}
                 </div>
             ), { duration: 5000 });
         }, 500);
      }
      
      // Mark as completed locally
      const updatedUnits = units.map((u, i) => {
          if (u.id === activeUnit.id) {
              return { ...u, status: 'completed' as const, progress: 100 };
          }
          // Simple unlock logic for the very next node
          const currentIndex = units.findIndex(un => un.id === activeUnit.id);
          if (i === currentIndex + 1) {
              return { ...u, status: 'active' as const };
          }
          return u; 
      });

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
                             
                             const isPathActive = unit.status === 'completed';
                             
                             return (
                                 <g key={i}>
                                     {/* Base Line */}
                                     <line 
                                        x1={`${unit.coordinates.x}%`} 
                                        y1={`${unit.coordinates.y}%`} 
                                        x2={`${next.coordinates.x}%`} 
                                        y2={`${next.coordinates.y}%`} 
                                        stroke={isPathActive ? '#00c600' : '#333'} 
                                        strokeWidth={isPathActive ? 3 : 2}
                                        strokeDasharray={isPathActive ? '0' : '5,5'}
                                        opacity={isPathActive ? 0.5 : 0.3}
                                     />
                                     {/* Animated Pulse Packet on Active Paths */}
                                     {isPathActive && (
                                         <circle r="3" fill="#39FF14">
                                             <animateMotion 
                                                dur="3s" 
                                                repeatCount="indefinite"
                                                path={`M${unit.coordinates.x * window.innerWidth / 100},${unit.coordinates.y * window.innerHeight / 100} L${next.coordinates.x * window.innerWidth / 100},${next.coordinates.y * window.innerHeight / 100}`} // Note: This coordinate logic is simplified for SVG; proper responsive SVG math needs viewBox.
                                                // Simplified visual fallback for demo:
                                             />
                                         </circle>
                                     )}
                                 </g>
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
                                <div className="absolute inset-0 bg-lumen-primary/30 rounded-full animate-ping duration-[2000ms]"></div>
                            )}

                            {/* Node Circle */}
                            <div className={`
                                w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center border-4 relative z-10 shadow-xl transition-transform hover:scale-110
                                ${unit.status === 'completed' 
                                    ? 'bg-black border-lumen-primary text-lumen-primary shadow-[0_0_20px_rgba(0,198,0,0.4)]' 
                                    : unit.status === 'active'
                                        ? 'bg-black border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                                        : 'bg-black/80 border-gray-800 text-gray-700'}
                            `}>
                                {unit.status === 'completed' ? <CheckCircle size={28} /> : 
                                 unit.status === 'locked' ? <Lock size={24} /> : 
                                 <Star size={28} fill="currentColor" />}
                            </div>

                            {/* Label */}
                            <div className={`
                                absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded bg-black/80 backdrop-blur border text-xs font-mono transition-all duration-300
                                ${unit.status === 'locked' 
                                    ? 'border-transparent text-gray-600 opacity-50' 
                                    : unit.status === 'active' 
                                        ? 'border-white text-white scale-110 font-bold'
                                        : 'border-lumen-primary/30 text-lumen-primary'}
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
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
                <div className="bg-[#0a1410] border border-lumen-primary/30 w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,198,0,0.2)]">
                    <div className="h-1 bg-gradient-to-r from-lumen-primary to-lumen-secondary"></div>
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lumen-primary font-mono text-xs tracking-widest uppercase mb-1 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-lumen-primary rounded-full animate-pulse"></div>
                                    MISSION BRIEFING
                                </h3>
                                <h1 className="text-3xl text-white font-light uppercase tracking-wide">{activeUnit.title}</h1>
                            </div>
                            <button onClick={() => setMode('map')} className="text-gray-500 hover:text-white"><X /></button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                                <p className="text-xs text-gray-400 font-mono mb-2 uppercase tracking-wider">Parameters</p>
                                <p className="text-white text-sm leading-relaxed">{activeUnit.content?.substring(0, 100)}...</p>
                            </div>
                            <div className="bg-white/5 p-5 rounded-xl border border-white/5">
                                <p className="text-xs text-gray-400 font-mono mb-2 uppercase tracking-wider">Bounties</p>
                                <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg mb-1">
                                    <Zap size={20} fill="currentColor" /> {activeUnit.xpReward || 500} XP
                                </div>
                                <div className="flex items-center gap-2 text-lumen-secondary text-sm">
                                    <Shield size={16} /> Clearance Key
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setMode('map')} className="flex-1 py-4 bg-white/5 text-gray-300 font-bold rounded-xl hover:bg-white/10 transition-colors uppercase tracking-wider text-sm">
                                Abort
                            </button>
                            <button onClick={startMission} className="flex-1 py-4 bg-lumen-primary text-black font-bold rounded-xl shadow-glow hover:scale-105 transition-transform uppercase tracking-wider text-sm flex items-center justify-center gap-2">
                                <PlayCircle size={18} /> Engage Protocol
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
                    <h3 className="text-white font-medium flex items-center gap-2">
                        <span className="text-lumen-primary font-mono">{activeUnit.id}</span>
                        <span className="text-gray-600">/</span>
                        {activeUnit.title}
                    </h3>
                    <button onClick={() => setMode('map')} className="text-gray-400 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded border border-white/10 hover:border-white/30 transition-all">
                        Exit <X size={14} />
                    </button>
                </div>
                
                <div className="flex-1 flex overflow-hidden">
                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                         <div className="max-w-3xl mx-auto">
                            {/* Fake Video Player */}
                            <div className="aspect-video bg-gray-900 rounded-2xl mb-8 relative group overflow-hidden border border-white/10 shadow-2xl">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 rounded-full bg-lumen-primary/10 flex items-center justify-center border border-lumen-primary/30 group-hover:scale-110 transition-transform cursor-pointer backdrop-blur-sm">
                                        <PlayCircle size={40} className="text-lumen-primary" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                                    <div className="flex items-center gap-2 text-white font-mono text-xs">
                                        <span className="bg-red-500 px-1.5 py-0.5 rounded text-[10px] font-bold">LIVE</span>
                                        <span>00:00 / 04:35</span>
                                    </div>
                                </div>
                            </div>
                            
                            <h2 className="text-2xl text-white font-bold mb-4">Transmission Decoded</h2>
                            <div className="prose prose-invert prose-lg text-gray-300 mb-12">
                                <p>{activeUnit.content}</p>
                            </div>

                            <button 
                                onClick={() => startTest(activeUnit)}
                                className="w-full py-5 bg-gradient-to-r from-lumen-dim/20 to-black border border-lumen-primary/50 text-lumen-primary font-bold rounded-xl hover:bg-lumen-dim/30 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,198,0,0.1)] group"
                            >
                                <Terminal size={24} className="group-hover:animate-pulse" />
                                <span className="tracking-widest uppercase">Launch Gauntlet Protocol</span>
                            </button>
                         </div>
                    </div>

                    {/* Right Sidebar Checklist */}
                    <div className="w-80 border-l border-white/10 bg-black/20 p-6 hidden lg:block backdrop-blur-sm">
                        <h4 className="text-xs font-mono text-gray-500 uppercase mb-4 tracking-wider">Module Checklist</h4>
                        <div className="space-y-2">
                            {activeUnit.nodes?.map((node, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                    activeNode?.id === node.id ? 'bg-lumen-primary/10 border-lumen-primary/30 text-white' : 'border-transparent text-gray-500 hover:bg-white/5'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${node.completed ? 'bg-lumen-primary' : 'bg-gray-700'}`}></div>
                                    <span className="text-sm font-medium">{node.title}</span>
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
                         <span className="tracking-widest font-bold">GAUNTLET_PROTOCOL_V4.exe</span>
                     </div>
                     <button onClick={() => setMode('map')} className="hover:text-white transition-colors"><X size={18} /></button>
                </div>

                {/* Chat Stream */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-20 scrollbar-none" ref={scrollRef}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <Bot className="shrink-0 mt-1" size={20} />}
                            <div className={`max-w-[80%] p-4 border relative ${
                                msg.role === 'user' 
                                ? 'border-white/30 text-white bg-white/5 rounded-l-xl rounded-br-xl' 
                                : 'border-green-500/30 text-green-400 bg-green-900/10 rounded-r-xl rounded-bl-xl shadow-[0_0_10px_rgba(0,198,0,0.1)]'
                            }`}>
                                <p className="whitespace-pre-wrap text-sm md:text-base">{msg.text}</p>
                                {/* Decorate corners */}
                                <div className="absolute top-0 left-0 w-1 h-1 bg-current opacity-50"></div>
                                <div className="absolute bottom-0 right-0 w-1 h-1 bg-current opacity-50"></div>
                            </div>
                            {msg.role === 'user' && <User className="shrink-0 mt-1" size={20} />}
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-2 text-green-500/50 animate-pulse ml-9 items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="tracking-widest text-xs">ANALYZING INPUT PATTERN...</span>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input */}
                <div className="p-6 border-t border-green-500/30 bg-black relative z-20">
                     {testPassed ? (
                         <button 
                            onClick={() => setMode('map')} 
                            className="w-full py-4 bg-green-500 text-black font-bold uppercase tracking-widest hover:bg-green-400 transition-colors shadow-glow flex items-center justify-center gap-2"
                         >
                             <CheckCircle size={20} /> Return to System Map
                         </button>
                     ) : (
                         <div className="flex gap-4 items-end">
                             <div className="flex-1">
                                 <label className="text-[10px] text-green-700 uppercase tracking-widest mb-1 block">Command Input</label>
                                 <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="TYPE RESPONSE HERE..."
                                    className="w-full bg-transparent border-b-2 border-green-500/50 text-green-400 placeholder-green-900 focus:outline-none focus:border-green-500 py-2 font-mono"
                                    autoFocus
                                 />
                             </div>
                             <button onClick={handleSendMessage} disabled={!input.trim()} className="text-green-500 hover:text-white disabled:opacity-30 transition-colors p-2 border border-green-500/30 rounded">
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
