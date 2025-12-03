
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  BookOpen, 
  Plus, 
  Search, 
  Shield, 
  CheckCircle, 
  XCircle,
  Briefcase,
  Lock,
  Globe,
  ArrowLeft,
  Database
} from 'lucide-react';
import { Client, User, Unit, UserRole } from '../types';
import { getClients, getUsers, getCourses, createClient, createUser, createCourse, createTask } from '../services/db';
import { MOCK_CLIENTS, MOCK_USERS, MOCK_UNITS } from '../constants';
import toast from 'react-hot-toast';

type AdminTab = 'clients' | 'users' | 'courses';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('clients');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Unit[]>([]);

  // Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemRole, setNewItemRole] = useState<UserRole>('Student');
  const [newItemClientId, setNewItemClientId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [selectedClient, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
        if (activeTab === 'clients') {
            const data = await getClients();
            setClients(data);
        } else if (activeTab === 'users') {
            const data = await getUsers(selectedClient?.id); // If null, gets all (super admin)
            setUsers(data);
        } else if (activeTab === 'courses') {
            const data = await getCourses(selectedClient?.id);
            setCourses(data);
        }
    } catch (e) {
        toast.error("Failed to load data");
    } finally {
        setLoading(false);
    }
  };

  // Filter Data based on isolation rules & Search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCourses = courses.filter(unit => 
     unit.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newItemName) return;

    try {
        if (activeTab === 'clients') {
            const newClient: Client = {
                id: `CLI-${newItemName.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
                name: newItemName,
                industry: 'General Industry',
                userCount: 0,
                status: 'Active',
                logoInitials: newItemName.substring(0, 2).toUpperCase(),
                domain: `${newItemName.toLowerCase().replace(/\s/g, '')}.com`
            };
            await createClient(newClient);
            toast.success("Client Created");
        } else if (activeTab === 'users') {
            const newUser: User = {
                id: `USR-${Math.floor(Math.random() * 10000)}`,
                name: newItemName,
                email: `${newItemName.toLowerCase().split(' ')[0]}@lumen.demo`,
                role: newItemRole,
                clientId: newItemClientId || (selectedClient?.id || clients[0]?.id),
                status: 'Active'
            };
            await createUser(newUser);
            toast.success("User Created");
        } else if (activeTab === 'courses') {
            const newCourse: Unit = {
                id: `MOD-${Math.floor(Math.random() * 1000)}`,
                title: newItemName,
                category: 'Mechanics',
                status: 'locked',
                progress: 0,
                clientId: selectedClient ? selectedClient.id : undefined // Private if in client view
            };
            await createCourse(newCourse);
            // Auto-create dummy tasks for functionality
            await createTask({ id: `T-${Date.now()}-1`, unitId: newCourse.id, title: 'Intro Task', difficulty: 'Easy', completed: false });
            await createTask({ id: `T-${Date.now()}-2`, unitId: newCourse.id, title: 'Advanced Analysis', difficulty: 'Hard', completed: false });
            toast.success("Course Created");
        }
        
        setShowModal(false);
        setNewItemName('');
        loadData(); // Refresh list
    } catch (e) {
        toast.error("Error creating record");
        console.error(e);
    }
  };

  const seedDatabase = async () => {
      if(!window.confirm("This will populate your database with Mock Data. Continue?")) return;
      const toastId = toast.loading("Seeding Database...");
      
      try {
          for(const c of MOCK_CLIENTS) await createClient(c);
          for(const u of MOCK_USERS) await createUser(u);
          for(const unit of MOCK_UNITS) {
              await createCourse(unit);
              // Seed tasks for unit
              await createTask({ id: `T-${unit.id}-1`, unitId: unit.id, title: 'Concept Check', difficulty: 'Easy', completed: false });
              await createTask({ id: `T-${unit.id}-2`, unitId: unit.id, title: 'Practical Application', difficulty: 'Medium', completed: false });
          }
          toast.success("Database Populated!", { id: toastId });
          loadData();
      } catch(e) {
          toast.error("Seeding Failed", { id: toastId });
      }
  }

  // Tab Component
  const TabButton = ({ id, label, icon: Icon }: { id: AdminTab; label: string; icon: any }) => (
    <button
      onClick={() => { setActiveTab(id); setSelectedClient(null); }}
      className={`
        flex items-center gap-2 px-6 py-3 rounded-t-lg border-t border-l border-r transition-all
        ${activeTab === id 
          ? 'bg-lumen-surface/80 border-lumen-primary/30 text-white font-bold' 
          : 'bg-black/20 border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'}
      `}
    >
      <Icon size={16} className={activeTab === id ? 'text-lumen-primary' : ''} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light text-white flex items-center gap-3">
            <Shield className="text-lumen-primary" size={32} />
            System Administration
          </h1>
          <p className="text-lumen-secondary font-mono text-sm mt-1 ml-11">
              GLOBAL ACCESS LEVEL • SUPER ADMIN 
              {selectedClient && <span className="text-white"> • {selectedClient.name.toUpperCase()} CONTEXT</span>}
          </p>
        </div>
        <div className="flex gap-3">
            <button onClick={seedDatabase} className="flex items-center gap-2 px-4 py-2 bg-yellow-900/20 border border-yellow-700/50 text-yellow-500 rounded-lg hover:bg-yellow-900/40 transition-colors text-xs font-mono uppercase">
                <Database size={14} /> Seed DB
            </button>
            <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-right">
                <p className="text-[10px] text-gray-400 font-mono uppercase">Total Users</p>
                <p className="text-xl font-light text-white">{users.length}</p>
            </div>
            <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-right">
                <p className="text-[10px] text-gray-400 font-mono uppercase">Active Clients</p>
                <p className="text-xl font-light text-lumen-primary">{clients.length}</p>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <TabButton id="clients" label="Client Organizations" icon={Building2} />
        <TabButton id="users" label="User Management" icon={Users} />
        <TabButton id="courses" label="Course Registry" icon={BookOpen} />
      </div>

      {/* Toolbar */}
      <div className="bg-lumen-surface/60 backdrop-blur-xl border border-white/5 rounded-b-2xl rounded-tr-2xl p-6 min-h-[500px]">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
                {selectedClient && (
                    <button 
                        onClick={() => setSelectedClient(null)} 
                        className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
                        title="Back to Global View"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                
                <div className="relative w-72">
                    <Search size={18} className="absolute left-3 top-3 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder={`Search ${activeTab}...`} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:border-lumen-primary/50 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            <div className="flex gap-3">
                 {/* Isolation Indicator */}
                 {selectedClient ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-lumen-primary/10 border border-lumen-primary/30 rounded-lg">
                        <Lock size={14} className="text-lumen-primary" />
                        <span className="text-xs font-mono text-lumen-primary">DATA ISOLATION: {selectedClient.id}</span>
                    </div>
                 ) : (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg">
                        <Globe size={14} className="text-gray-400" />
                        <span className="text-xs font-mono text-gray-400">GLOBAL VIEW</span>
                    </div>
                 )}

                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-lumen-primary text-black font-bold rounded-lg hover:bg-lumen-highlight transition-all shadow-glow hover:scale-105"
                >
                    <Plus size={18} />
                    <span>Add {activeTab === 'clients' ? 'Client' : activeTab === 'users' ? 'User' : 'Course'}</span>
                </button>
            </div>
        </div>

        {/* CONTENT AREA */}
        {loading && (
            <div className="p-8 text-center text-lumen-primary animate-pulse">
                Loading Data from Firestore...
            </div>
        )}

        {/* CLIENTS VIEW */}
        {activeTab === 'clients' && !selectedClient && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in">
                {clients.map(client => (
                    <div 
                        key={client.id} 
                        onClick={() => { setSelectedClient(client); setActiveTab('users'); }}
                        className="group p-5 bg-black/20 border border-white/5 rounded-xl hover:border-lumen-secondary/50 transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-xl font-bold text-gray-400 font-mono group-hover:text-white group-hover:border-lumen-secondary/50">
                                {client.logoInitials}
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${
                                client.status === 'Active' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                            }`}>
                                {client.status}
                            </span>
                        </div>
                        <h3 className="text-lg text-white font-medium mb-1 group-hover:text-lumen-secondary transition-colors">{client.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{client.industry}</p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono bg-white/5 p-2 rounded">
                            <Users size={14} />
                            <span>{client.userCount?.toLocaleString() || 0} Licensed Seats</span>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-2 font-mono">ID: {client.id}</p>
                    </div>
                ))}
            </div>
        )}

        {/* USERS VIEW */}
        {(activeTab === 'users' || selectedClient) && activeTab !== 'clients' && activeTab !== 'courses' && !loading && (
            <div className="overflow-x-auto animate-in fade-in">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-mono text-gray-500 border-b border-white/10 bg-black/20">
                            <th className="p-4">USER IDENTITY</th>
                            <th className="p-4">ROLE</th>
                            <th className="p-4">ORGANIZATION (CLIENT ID)</th>
                            <th className="p-4">STATUS</th>
                            <th className="p-4 text-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                                            user.role === 'Super Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                            user.role === 'Teacher' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-gray-800 text-gray-300 border border-gray-700'
                                        }`}>
                                            {user.role === 'Super Admin' && <Shield size={10} />}
                                            {user.role === 'Teacher' && <Briefcase size={10} />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-gray-400 text-xs">
                                        <span className={user.clientId === selectedClient?.id ? 'text-lumen-primary font-bold' : ''}>
                                            {user.clientId}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {user.status === 'Active' ? (
                                            <div className="flex items-center gap-1.5 text-green-500 text-xs">
                                                <CheckCircle size={12} /> Active
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                                                <XCircle size={12} /> Inactive
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-lumen-secondary hover:text-white text-xs font-bold uppercase">Edit</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                                    No users found for this context.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}

        {/* COURSES VIEW */}
        {activeTab === 'courses' && !loading && (
            <div className="space-y-2 animate-in fade-in">
                {filteredCourses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-lg hover:border-lumen-primary/30 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-lumen-primary/10 text-lumen-primary rounded-lg">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    {course.title}
                                    {course.clientId && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                            PRIVATE: {course.clientId}
                                        </span>
                                    )}
                                </h3>
                                <p className="text-xs font-mono text-gray-500">{course.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 transition-colors">
                                Manage
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Dynamic Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0f1f1a] border border-lumen-primary/20 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><XCircle size={24} /></button>
                <h2 className="text-xl text-white mb-6 flex items-center gap-2">
                    <Plus size={20} className="text-lumen-primary" />
                    Create New {activeTab === 'clients' ? 'Client' : activeTab === 'users' ? 'User' : 'Course'}
                </h2>
                
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase font-bold">
                             {activeTab === 'courses' ? 'Course Title' : 'Name'}
                        </label>
                        <input 
                            type="text" 
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder={activeTab === 'clients' ? "e.g. Cyberdyne Systems" : "e.g. John Doe"}
                            className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-lumen-primary/50 outline-none transition-colors"
                            autoFocus
                        />
                    </div>

                    {activeTab === 'users' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 uppercase font-bold">Role</label>
                                <select 
                                    value={newItemRole}
                                    onChange={(e) => setNewItemRole(e.target.value as UserRole)}
                                    className="w-full bg-black/40 border border-white/10 rounded p-3 text-white outline-none"
                                >
                                    <option value="Student">Student</option>
                                    <option value="Teacher">Teacher</option>
                                    <option value="Super Admin">Super Admin</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-gray-400 uppercase font-bold">Assign to Client</label>
                                <select 
                                    value={newItemClientId}
                                    onChange={(e) => setNewItemClientId(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded p-3 text-white outline-none"
                                >
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    {activeTab === 'courses' && selectedClient && (
                         <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-500 flex items-center gap-2">
                            <Lock size={12} />
                            Creating Private Course for {selectedClient.name}
                         </div>
                    )}

                    <button 
                        onClick={handleCreate}
                        disabled={!newItemName}
                        className="w-full py-3 bg-lumen-primary text-black font-bold rounded hover:bg-lumen-highlight mt-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
                    >
                        Create Record (Real DB)
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
