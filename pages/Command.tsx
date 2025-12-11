
import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Sparkles, User, Bot, Activity, CheckCircle, XCircle, Database, Server, Cpu } from 'lucide-react';
import { sendMessageToGemini, checkGeminiConnection } from '../services/geminiService';
import { checkDBConnection, checkStorageConnection } from '../services/db';
import { ChatMessage } from '../types';

const Command = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'user', text: 'System check.', timestamp: Date.now() },
    { id: '2', role: 'model', text: 'Lumen Core online. Systems nominal. Ready for query.', timestamp: Date.now() }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addSystemMessage = (text: string) => {
      setMessages(prev => [...prev, { 
        id: Date.now().toString() + Math.random(), 
        role: 'model', 
        text, 
        timestamp: Date.now() 
      }]);
  };

  const runDiagnostics = async () => {
    setLoading(true);
    addSystemMessage("Initiating system-wide diagnostic scan...");
    
    // Artificial delay for "processing" feel
    await new Promise(r => setTimeout(r, 600));

    // 1. Database Check
    const dbStatus = await checkDBConnection();
    addSystemMessage(`[1/3] Checking Firestore Database... ${dbStatus ? '[ONLINE]' : '[OFFLINE / LOCAL MODE]'}`);
    await new Promise(r => setTimeout(r, 400));

    // 2. Storage Check
    const storageStatus = await checkStorageConnection();
    addSystemMessage(`[2/3] Verifying Asset Storage... ${storageStatus ? '[ONLINE]' : '[OFFLINE / RESTRICTED]'}`);
    await new Promise(r => setTimeout(r, 400));

    // 3. AI Check
    const aiStatus = await checkGeminiConnection();
    addSystemMessage(`[3/3] Pinging Neural Core (Gemini)... ${aiStatus ? '[CONNECTED]' : '[DISCONNECTED]'}`);
    
    await new Promise(r => setTimeout(r, 600));

    const allGood = dbStatus && storageStatus && aiStatus;
    const summary = allGood 
        ? "Diagnostics complete. All systems functioning within normal parameters."
        : "Diagnostics complete. System warnings detected. Some features may be degraded.";
    
    addSystemMessage(summary);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Intercept specific command for diagnostics
    if (input.toLowerCase() === 'run diagnostics' || input.toLowerCase() === 'system check') {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() }]);
        setInput('');
        await runDiagnostics();
        return;
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
        const responseText = await sendMessageToGemini(messages, input);
        const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
        setMessages(prev => [...prev, modelMsg]);
    } catch (e) {
        addSystemMessage("Error: Neural Uplink Failed.");
    }
    
    setLoading(false);
  };

  const handleQuickChip = (text: string) => {
      if (text === "Run Diagnostics") {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() }]);
          runDiagnostics();
      } else {
          setInput(text);
      }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-lumen-surface/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-lumen-secondary">
                <Terminal size={18} />
                <span className="font-mono text-sm tracking-widest">COMMAND LINE INTERFACE // GEMINI-2.5-FLASH</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-500 font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                ONLINE
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-lumen-primary/20 text-lumen-primary' : 'bg-lumen-secondary/20 text-lumen-secondary'}`}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`max-w-[80%] rounded-xl p-4 text-sm leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-white/5 border border-white/10 text-gray-200' 
                        : 'bg-lumen-dim/20 border border-lumen-secondary/20 text-green-100 shadow-glow-sm font-mono'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-lumen-secondary/20 text-lumen-secondary flex items-center justify-center shrink-0">
                        <Activity size={16} className="animate-spin" />
                    </div>
                    <div className="flex items-center gap-1 bg-lumen-dim/20 rounded-xl px-4 py-3 border border-white/5">
                        <span className="text-xs text-lumen-secondary font-mono animate-pulse">LUMEN CORE PROCESSING...</span>
                    </div>
                </div>
            )}
            <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/40 border-t border-white/5">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-none">
                {["Run Diagnostics", "Explain this unit", "Create practice questions"].map((chip, i) => (
                    <button 
                        key={i}
                        onClick={() => handleQuickChip(chip)}
                        className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-gray-400 hover:text-lumen-secondary hover:border-lumen-secondary/50 whitespace-nowrap transition-colors"
                    >
                        {chip}
                    </button>
                ))}
            </div>
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Enter command (e.g., 'Run Diagnostics')"
                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-4 pr-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-lumen-secondary/50 shadow-inner font-mono text-sm"
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="absolute right-2 top-2 p-2 bg-lumen-secondary/10 text-lumen-secondary rounded-lg hover:bg-lumen-secondary/20 disabled:opacity-30 transition-colors"
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    </div>
  );
};

export default Command;
