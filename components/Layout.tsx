
import React, { useState, useEffect, PropsWithChildren } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  TrendingUp, 
  Users, 
  Mic, 
  Terminal, 
  Edit3, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Hexagon,
  ShieldCheck,
  Bell,
  Database,
  Wifi,
  WifiOff
} from 'lucide-react';
import { requestNotificationPermission, onMessageListener } from '../services/notificationService';
import { checkDBConnection } from '../services/db';
import { Toaster, toast } from 'react-hot-toast';

interface SidebarItemProps {
  to: string;
  icon: any;
  label: string;
  collapsed: boolean;
}

// Custom Logo Component: Brain inside Lightbulb
const LumenLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bulb Outline */}
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M12 2C7.03 2 3 6.03 3 11c0 3.3 1.8 6.18 4.55 7.74.8.46 1.45 1.5 1.45 2.66V22h6v-.6c0-1.16.65-2.2 1.45-2.66C19.2 17.18 21 14.3 21 11c0-4.97-4.03-9-9-9z" />
    {/* Brain Details */}
    <path d="M12 14c-2.5 0-4-1.5-4-3.5S9.5 7 12 7s4 1.5 4 3.5-1.5 3.5-4 3.5z" />
    <path d="M12 7v7" />
    <path d="M9.5 9a2.5 2.5 0 0 0 5 0" />
  </svg>
);

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      relative flex items-center gap-4 px-4 py-3 my-1 mx-2 rounded-lg transition-all duration-300 group overflow-hidden
      ${isActive 
        ? 'bg-lumen-dim/30 text-lumen-highlight border border-lumen-primary/30 shadow-[0_0_15px_rgba(0,198,0,0.15)]' 
        : 'text-gray-500 hover:text-gray-200 hover:bg-white/5 border border-transparent'}
    `}
  >
    {({ isActive }) => (
      <>
        {/* Active Indicator Line */}
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-lumen-primary shadow-[0_0_10px_#00c600]"></div>
        )}
        
        <Icon 
          size={20} 
          className={`min-w-[20px] transition-transform duration-300 ${isActive ? 'text-lumen-primary scale-110 drop-shadow-[0_0_5px_rgba(57,255,20,0.8)]' : 'group-hover:text-white'}`} 
        />
        
        <span className={`
          whitespace-nowrap font-mono text-sm tracking-wide transition-all duration-300
          ${collapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}
          ${isActive ? 'font-bold' : 'font-medium'}
        `}>
          {label}
        </span>
        
        {/* Tech Decor on Hover */}
        {!isActive && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Hexagon size={10} className="text-lumen-secondary/50" />
            </div>
        )}
      </>
    )}
  </NavLink>
);

export const Layout = ({ children }: PropsWithChildren) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Sync theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Check Database Connection
    const checkStatus = async () => {
        const connected = await checkDBConnection();
        setIsConnected(connected);
    };
    checkStatus();

    // Listen for foreground messages
    onMessageListener().then((payload: any) => {
      console.log('Received foreground message: ', payload);
      toast(payload?.notification?.title || "New Notification", {
        icon: '🔔',
        style: {
          background: '#0a1410',
          color: '#fff',
          border: '1px solid #00c600'
        },
      });
    });
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const enableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setNotificationsEnabled(true);
      toast.success("Notifications Enabled!");
      console.log("Token for backend:", token);
    } else {
      toast.error("Could not enable notifications.");
    }
  };

  const handleDBStatusClick = () => {
      if (!isConnected) {
          toast((t) => (
              <div className="text-sm">
                  <b>System Offline</b>
                  <p>Using local mock data. To connect to real data, ensure Firebase API Keys are configured in your environment.</p>
              </div>
          ), { icon: '⚠️', duration: 5000 });
      } else {
          toast.success("Connected to Google Firestore");
      }
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'DASHBOARD' },
    { to: '/learn', icon: BookOpen, label: 'LEARN' },
    { to: '/progress', icon: TrendingUp, label: 'PROGRESS' },
    { to: '/teacher', icon: Users, label: 'TEACHER' },
    { to: '/admin', icon: ShieldCheck, label: 'ADMIN' },
    { to: '/command', icon: Terminal, label: 'COMMAND' },
    { to: '/audio', icon: Mic, label: 'ARCHIVES' },
    { to: '/author', icon: Edit3, label: 'STUDIO' },
  ];

  return (
    <div className="min-h-screen bg-lumen-base text-gray-100 font-sans selection:bg-lumen-primary selection:text-black overflow-hidden flex">
      {/* Toast Notifications */}
      <Toaster position="top-right" />

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        flex flex-col 
        bg-[#050a08] border-r border-white/10
        transition-all duration-300 ease-in-out
        ${collapsed ? 'lg:w-20' : 'lg:w-72'}
        ${mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
        shadow-[5px_0_30px_rgba(0,0,0,0.5)]
      `}>
        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
        
        {/* Logo Section */}
        <div className="h-20 flex items-center px-6 border-b border-white/5 relative z-10 bg-gradient-to-b from-white/5 to-transparent">
            <LumenLogo className="text-lumen-primary mr-3 w-8 h-8 drop-shadow-[0_0_8px_rgba(0,198,0,0.8)] flex-shrink-0" />
            <div className={`flex flex-col transition-opacity duration-200 ${collapsed ? 'hidden' : 'block'}`}>
              <span className="font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-lumen-primary to-lumen-secondary">
                LUMEN
              </span>
              <span className="text-white text-[10px] font-light tracking-[0.3em] uppercase opacity-70">
                Academy
              </span>
            </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto relative z-10 scrollbar-none">
          {navItems.map(item => (
            <SidebarItem 
              key={item.to} 
              to={item.to}
              icon={item.icon}
              label={item.label}
              collapsed={collapsed && !mobileOpen} 
            />
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20 relative z-10">
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''} p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group`}>
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-lumen-primary to-lumen-secondary flex items-center justify-center text-xs font-bold text-black shadow-glow group-hover:shadow-glow-cyan transition-shadow">
                OP
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
            </div>
            
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-gray-200 truncate font-mono">Operator 442</p>
                <div className="flex items-center gap-1.5">
                   <div className="h-1 w-12 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-lumen-primary w-[70%]"></div>
                   </div>
                   <p className="text-[10px] text-lumen-primary/80 truncate">LVL 4</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 bg-lumen-base/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu />
            </button>
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block text-gray-400 hover:text-lumen-primary transition-colors"
            >
              {collapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
            
            <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block"></div>

             {/* Company Name & Breadcrumb */}
             <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-100 tracking-wide hidden sm:block">Lumen Academy</span>
                </div>
                <h1 className="text-xs font-mono text-lumen-secondary uppercase tracking-widest flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-lumen-secondary"></div>
                   {location.pathname === '/' ? 'MISSION CONTROL' : location.pathname.substring(1).toUpperCase()}
                </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* DB STATUS INDICATOR */}
            <button 
              onClick={handleDBStatusClick}
              className={`
                hidden md:flex items-center px-3 py-1.5 rounded-full border shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform
                ${isConnected ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}
              `}
            >
              {isConnected ? <Wifi size={12} className="mr-2" /> : <WifiOff size={12} className="mr-2" />}
              <span className="text-[10px] font-mono tracking-wider">
                {isConnected === null ? 'CONNECTING...' : isConnected ? 'DB: GOOGLE' : 'DB: OFFLINE'}
              </span>
            </button>

            <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-lumen-primary/5 border border-lumen-primary/20 shadow-[0_0_10px_rgba(0,198,0,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-lumen-primary animate-pulse mr-2"></span>
              <span className="text-[10px] text-lumen-primary font-mono tracking-wider">SYSTEM OPTIMAL</span>
            </div>
            
            {/* Notification Bell */}
            <button 
              onClick={enableNotifications}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${notificationsEnabled ? 'text-lumen-primary' : 'text-gray-400'}`}
              title="Enable Push Notifications"
            >
              <Bell size={18} />
            </button>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-lumen-highlight transition-colors">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="px-2 py-1 rounded border border-white/10 text-xs font-bold text-gray-400 font-mono">
              EN
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative scrollbar-thin scrollbar-thumb-lumen-dim scrollbar-track-transparent">
           {/* Background Grid Effect */}
           <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
                style={{ backgroundImage: 'linear-gradient(rgba(0, 229, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
           </div>
           
           <div className="relative z-10 max-w-[1600px] mx-auto">
             {children}
           </div>
        </div>
      </main>
    </div>
  );
};
