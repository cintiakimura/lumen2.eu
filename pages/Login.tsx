
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ShieldCheck, ChevronRight, User, Terminal } from 'lucide-react';
import { MOCK_USERS } from '../constants';

const Login = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email);
    if (!success) {
      setError('Identity not recognized in Lumen Core.');
    }
  };

  const handleDemoSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setShowDemo(false);
  };

  return (
    <div className="min-h-screen bg-[#050a08] flex items-center justify-center relative overflow-hidden font-sans text-gray-100">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-lumen-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-lumen-secondary/5 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        {/* Logo Area */}
        <div className="text-center mb-10">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-lumen-primary/20 to-lumen-secondary/20 border border-white/10 mb-6 shadow-glow-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-lumen-primary">
                <path d="M12 2C7.03 2 3 6.03 3 11c0 3.3 1.8 6.18 4.55 7.74.8.46 1.45 1.5 1.45 2.66V22h6v-.6c0-1.16.65-2.2 1.45-2.66C19.2 17.18 21 14.3 21 11c0-4.97-4.03-9-9-9z" />
                <path d="M12 14c-2.5 0-4-1.5-4-3.5S9.5 7 12 7s4 1.5 4 3.5-1.5 3.5-4 3.5z" />
              </svg>
           </div>
           <h1 className="text-3xl font-light tracking-wide text-white">LUMEN <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-lumen-primary to-lumen-secondary">ACCESS</span></h1>
           <p className="text-xs font-mono text-lumen-secondary mt-2 tracking-[0.2em]">IDENTITY VERIFICATION PROTOCOL</p>
        </div>

        {/* Login Form */}
        <div className="bg-lumen-surface/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-500 uppercase ml-1">Technician ID / Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@organization.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-gray-600 focus:border-lumen-primary focus:ring-1 focus:ring-lumen-primary focus:outline-none transition-all font-mono text-sm"
                  autoFocus
                />
                <User size={16} className="absolute left-4 top-3.5 text-gray-500" />
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
                <ShieldCheck size={14} />
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-lumen-primary text-black font-bold rounded-xl hover:bg-lumen-highlight hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Terminal size={18} />}
              {loading ? 'AUTHENTICATING...' : 'INITIALIZE SESSION'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
             <button 
                onClick={() => setShowDemo(!showDemo)}
                className="text-xs text-gray-500 hover:text-white underline underline-offset-4 font-mono"
             >
               {showDemo ? 'Hide Demo Accounts' : 'Use Demo Account'}
             </button>

             {showDemo && (
               <div className="mt-4 grid grid-cols-1 gap-2 animate-in slide-in-from-top-2">
                  {MOCK_USERS.slice(0, 3).map(u => (
                    <button 
                      key={u.id}
                      onClick={() => handleDemoSelect(u.email)}
                      className="text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-colors flex items-center justify-between group"
                    >
                       <div>
                         <div className="text-xs font-bold text-gray-300 group-hover:text-white">{u.name}</div>
                         <div className="text-[10px] text-gray-500 font-mono">{u.role} • {u.clientId}</div>
                       </div>
                       <ChevronRight size={14} className="text-gray-600 group-hover:text-lumen-primary" />
                    </button>
                  ))}
               </div>
             )}
          </div>
        </div>
        
        <div className="mt-8 text-center text-[10px] text-gray-600 font-mono">
           SECURE CONNECTION ESTABLISHED • V2.4.0
        </div>
      </div>
    </div>
  );
};

export default Login;
