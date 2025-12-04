
import React, { useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, CheckCircle, Activity, Box, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const data = [
  { time: '09:00', load: 30, performance: 80 },
  { time: '10:00', load: 45, performance: 78 },
  { time: '11:00', load: 35, performance: 85 },
  { time: '12:00', load: 60, performance: 65 },
  { time: '13:00', load: 20, performance: 90 },
  { time: '14:00', load: 50, performance: 75 },
  { time: '15:00', load: 70, performance: 60 },
];

const MetricCard = ({ label, value, trend, icon: Icon, alert }: any) => (
  <div className={`
    p-6 rounded-2xl backdrop-blur-xl border 
    ${alert ? 'bg-red-900/10 border-red-500/30' : 'bg-lumen-surface/60 border-white/5'}
    flex flex-col relative overflow-hidden group hover:border-lumen-primary/30 transition-all
  `}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${alert ? 'bg-red-500/20 text-red-400' : 'bg-lumen-primary/10 text-lumen-primary'}`}>
        <Icon size={24} />
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
      </span>
    </div>
    <div className="mt-auto">
      <h3 className="text-gray-400 text-sm font-mono uppercase tracking-wider mb-1">{label}</h3>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
    {/* Decorative Glow */}
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-lumen-primary/5 rounded-full blur-3xl group-hover:bg-lumen-primary/10 transition-colors"></div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect Super Admins to the Admin Panel for convenience
  useEffect(() => {
      if (user?.role === 'Super Admin') {
          navigate('/admin');
      }
  }, [user, navigate]);

  return (
    <div className="space-y-6">
      {user?.role === 'Super Admin' && (
          <div className="flex justify-center mb-4">
              <button 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-6 py-3 bg-lumen-primary/20 text-lumen-primary border border-lumen-primary rounded-lg hover:bg-lumen-primary/30 transition-all"
              >
                  <Shield size={20} />
                  <span>Go to Admin Console</span>
              </button>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Overload Alerts" value="3" trend={-5} icon={AlertTriangle} alert />
        <MetricCard label="Modules Cleared" value="142" trend={12} icon={CheckCircle} />
        <MetricCard label="Avg Efficiency" value="94%" trend={2} icon={Activity} />
        <MetricCard label="Skill Nodes" value="28" trend={8} icon={Box} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-lumen-surface/60 border border-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-lumen-secondary flex items-center gap-2">
              <Activity size={18} />
              Performance vs Cognitive Load
            </h2>
            <div className="flex gap-2">
                <span className="flex items-center text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-lumen-primary mr-2"></span>Perf</span>
                <span className="flex items-center text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></span>Load</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00c600" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00c600" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#333" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#333" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a1410', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="performance" stroke="#00c600" strokeWidth={2} fillOpacity={1} fill="url(#colorPerf)" />
                <Area type="monotone" dataKey="load" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Module */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-lumen-surface/80 to-lumen-dim/20 border border-lumen-primary/30 backdrop-blur-xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
                <Box size={100} className="text-lumen-primary" />
            </div>
            <span className="text-xs font-mono text-lumen-primary mb-2">ACTIVE MODULE</span>
            <h2 className="text-2xl font-light text-white mb-4">Algebra Foundations</h2>
            <div className="space-y-4 mt-auto z-10">
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Progress</span>
                    <span>45%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1">
                    <div className="bg-lumen-primary h-1 rounded-full shadow-glow" style={{ width: '45%' }}></div>
                </div>
                <button className="w-full py-3 bg-lumen-primary/10 hover:bg-lumen-primary/20 border border-lumen-primary/50 text-lumen-primary rounded-lg font-medium transition-all hover:shadow-glow flex items-center justify-center gap-2">
                    Resume Module <CheckCircle size={16} />
                </button>
            </div>
        </div>
      </div>

      {/* AR Panels Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['AR Maintenance Overlay', '3D Equipment Schematics', 'Interactive Checklist'].map((item, i) => (
             <div key={i} className="group relative p-4 rounded-xl border border-dashed border-white/10 hover:border-lumen-secondary/50 transition-colors cursor-pointer bg-black/20">
                <div className="absolute inset-0 bg-scan-lines opacity-10 pointer-events-none"></div>
                <h4 className="text-lumen-secondary font-mono text-sm mb-1 group-hover:text-white transition-colors">AR-PANEL-0{i+1}</h4>
                <p className="text-gray-400 text-sm">{item}</p>
             </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
