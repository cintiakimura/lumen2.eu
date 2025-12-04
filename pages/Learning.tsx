

import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, CheckCircle, Lock, BookOpen, Star, Mic, Send, Bot, User, ArrowRight, RotateCcw } from 'lucide-react';
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
  const [mode, setMode] = useState<'path' | 'content' | 'test'>('path');

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

  const handleNodeClick = (unit: Unit, node: any) => {
      if (unit.status === 'locked') return;
      
      setActiveUnit(unit);
      setActiveNode(node);
      
      if (node.type === 'quiz') {
          setMode('test');
          startTest(unit);
      } else {
          setMode('content');
      }
  };

  const startTest = (unit: Unit) => {
      setMessages([{
          role: 'model',
          text: `Welcome to the Gauntlet, ${user?.name}. I am the Guardian of this module. To proceed, I must verify your understanding of: ${unit.title}. Are you ready?`
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
      toast.success("Module Mastered! +500 XP");
      // Update XP
      if (user) {
         const { newRank } = await updateUserXP(user.id, 500);
         if (newRank) toast(`PROMOTED TO RANK: ${newRank.toUpperCase()}!`, { icon: '🎖️' });
      }
      
      // Mark as completed locally (simplified)
      if (activeUnit) {
          const updatedUnits = units.map(u => {
              if (u.id === activeUnit.id) {
                  return { ...u, status: 'completed' as const, progress: 100 };
              }
              // Unlock next
              return u; 
          });
          setUnits(updatedUnits);
      }
  };

  const handleVoiceInput = () => {
      // Mock voice input for now
      toast("Voice Input Active... (Listening)", { icon: '🎙️' });
      setTimeout(() => {
          setInput("The torque is force times radius times sine theta.");
      }, 1500);
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: THE PATH */}
        <div className="lg:w-1/3 bg-lumen-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 overflow-y-auto relative">
            <h2 className="text-2xl font-light text-white mb-8 text-center">Your Journey</h2>
            
            <div className="relative space-y-12">
                {/* Connecting Line */}
                <div className="absolute left-8 top-8 bottom-8 w-1 bg-white/10 z-0 rounded-full"></div>

                {units.map((unit, index) => (
                    <div key={unit.id} className="relative z-10 pl-2">
                        <div className="flex items-center gap-6">
                            {/* Node Icon */}
                            <button 
                                disabled={unit.status === 'locked'}
                                onClick={() => handleNodeClick(unit, unit.nodes?.[0])}
                                className={`
                                    w-14 h-14 rounded-2xl flex items-center justify-center border-4 transition-all duration-300 shadow-xl relative
                                    ${unit.status === 'completed' 
                                        ? 'bg-lumen-primary border-lumen-primary text-black' 
                                        : unit.status === 'active'
                                            ? 'bg-black border-lumen-secondary text-lumen-secondary animate-pulse-slow scale-110'
                                            : 'bg-black/50 border-gray-700 text-gray-700 cursor-not-allowed'}
                                `}
                            >
                                {unit.status === 'completed' ? <CheckCircle size={28} /> : 
                                 unit.status === 'locked' ? <Lock size={24} /> : 
                                 <Star size={24} fill="currentColor" />}
                            </button>

                            {/* Node Info */}
                            <div className="flex-1">
                                <h3 className={`text-lg font-bold ${unit.status === 'locked' ? 'text-gray-600' : 'text-white'}`}>
                                    {unit.title}
                                </h3>
                                <p className="text-xs text-gray-500 font-mono uppercase tracking-wide">{unit.category}</p>
                                
                                {/* Micro-Nodes (Sub-steps) */}
                                {unit.status !== 'locked' && unit.nodes && (
                                    <div className="flex gap-2 mt-3">
                                        {unit.nodes.map((n, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => handleNodeClick(unit, n)}
                                                className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center text-[10px] border transition-colors
                                                    ${activeNode?.id === n.id ? 'bg-white text-black border-white' : 'bg-black/40 border-white/20 text-gray-400 hover:border-white'}
                                                `}
                                            >
                                                {n.type === 'video' ? <PlayCircle size={14} /> : n.type === 'quiz' ? <Mic size={14} /> : <BookOpen size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* RIGHT COLUMN: INTERACTION AREA */}
        <div className="flex-1 bg-black/40 border border-white/10 rounded-3xl overflow-hidden flex flex-col relative shadow-2xl">
            {mode === 'path' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                    <div className="w-24 h-24 rounded-full bg-lumen-dim/20 flex items-center justify-center mb-6 animate-pulse-slow">
                        <ArrowRight size={48} className="text-lumen-secondary" />
                    </div>
                    <h2 className="text-2xl text-white font-light mb-2">Select a Module</h2>
                    <p className="max-w-md">Begin your path to mastery. Complete micro-units and pass the AI Gauntlet to earn your rank.</p>
                </div>
            )}

            {mode === 'content' && activeUnit && (
                <div className="flex-1 flex flex-col">
                    <div className="h-64 bg-black relative">
                         {/* Mock Video Player */}
                         <div className="absolute inset-0 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-50">
                             <PlayCircle size={64} className="text-white opacity-80" />
                         </div>
                         <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs font-mono text-white border border-white/10">
                            {activeNode?.title}
                         </div>
                         <button 
                            onClick={() => setMode('path')}
                            className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white hover:bg-white/20 transition-colors"
                         >
                             <ArrowRight size={20} />
                         </button>
                    </div>
                    <div className="p-8 flex-1 overflow-y-auto">
                        <h2 className="text-3xl font-light text-white mb-6">{activeUnit.title}</h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-gray-300 text-lg leading-relaxed">{activeUnit.content}</p>
                            <div className="mt-8 p-6 bg-lumen-dim/10 rounded-xl border border-lumen-primary/20">
                                <h4 className="text-lumen-primary font-bold mb-2 flex items-center gap-2"><Bot size={18}/> Quick Insight</h4>
                                <p className="text-sm text-gray-400">Remember: In industrial contexts, variables aren't just abstract letters; they usually represent physical limits like PSI or Volts.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                const quizNode = activeUnit.nodes?.find(n => n.type === 'quiz');
                                if(quizNode) handleNodeClick(activeUnit, quizNode);
                            }}
                            className="mt-8 w-full py-4 bg-lumen-primary hover:bg-lumen-highlight text-black font-bold rounded-xl shadow-glow transition-all"
                        >
                            Complete & Take Test
                        </button>
                    </div>
                </div>
            )}

            {mode === 'test' && (
                <div className="flex-1 flex flex-col bg-lumen-surface/80 backdrop-blur-md">
                     {/* Header */}
                     <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-lumen-secondary/20 flex items-center justify-center text-lumen-secondary animate-pulse">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white">The Gauntlet</h3>
                                <p className="text-xs text-lumen-secondary font-mono">ADAPTIVE EXAMINER ACTIVE</p>
                            </div>
                        </div>
                        <button onClick={() => setMode('path')} className="text-gray-400 hover:text-white"><ArrowRight /></button>
                     </div>

                     {/* Chat Area */}
                     <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-700' : 'bg-lumen-secondary/20 text-lumen-secondary'}`}>
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-white/10 text-white rounded-tr-none' 
                                    : 'bg-black/40 border border-lumen-secondary/20 text-gray-200 rounded-tl-none shadow-glow-cyan'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                             <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-lumen-secondary/20 text-lumen-secondary flex items-center justify-center shrink-0">
                                    <Bot size={14} />
                                </div>
                                <div className="bg-black/40 border border-lumen-secondary/20 p-4 rounded-2xl rounded-tl-none">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-lumen-secondary rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-lumen-secondary rounded-full animate-bounce delay-100"></span>
                                        <span className="w-2 h-2 bg-lumen-secondary rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                             </div>
                        )}
                        <div ref={scrollRef} />
                     </div>

                     {/* Input Area */}
                     {testPassed ? (
                         <div className="p-6 bg-lumen-primary/10 border-t border-lumen-primary/30 text-center">
                             <h3 className="text-xl font-bold text-lumen-primary mb-2">Assessment Passed!</h3>
                             <button onClick={() => setMode('path')} className="px-6 py-2 bg-lumen-primary text-black font-bold rounded-lg shadow-glow">
                                 Return to Path
                             </button>
                         </div>
                     ) : (
                        <div className="p-4 bg-black/60 border-t border-white/10">
                            <div className="relative flex items-center gap-2">
                                <button 
                                    onClick={handleVoiceInput}
                                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-lumen-secondary transition-colors"
                                    title="Voice Input"
                                >
                                    <Mic size={20} />
                                </button>
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Answer the examiner..."
                                    className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-lumen-secondary focus:ring-1 focus:ring-lumen-secondary outline-none font-mono text-sm"
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={!input.trim() || loading}
                                    className="p-3 bg-lumen-secondary text-black rounded-xl hover:bg-cyan-300 disabled:opacity-50 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <div className="text-center mt-2">
                                <span className="text-[10px] text-gray-600 font-mono">VOICE INPUT ENABLED • ADAPTIVE GRADING ON</span>
                            </div>
                        </div>
                     )}
                </div>
            )}
        </div>
    </div>
  );
};

export default Learning;