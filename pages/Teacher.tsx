
import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, User, MoreVertical, Eye, ShieldAlert } from 'lucide-react';
import { getUsers } from '../services/db';
import { User as UserType } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Teacher = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [students, setStudents] = useState<UserType[]>([]);

  useEffect(() => {
    if (!user) return;
    const loadStudents = async () => {
        const data = await getUsers(user.clientId);
        setStudents(data.filter(u => u.role === 'Student'));
    }
    loadStudents();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleUpload = () => {
    if (!fileName) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setFileName('');
      alert("File uploaded successfully to Lumen Cloud.");
    }, 2000);
  };

  if (user?.role === 'Student') {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <ShieldAlert size={48} className="text-red-500 mb-4" />
              <h1 className="text-2xl font-light text-white">Access Denied</h1>
              <p className="text-gray-400 mt-2">Student privileges are insufficient for the Teacher Dashboard.</p>
          </div>
      )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-light text-white">Teacher Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
                <p className="text-lumen-secondary font-mono text-sm">FLEET DIAGNOSTICS & MANAGEMENT</p>
                <span className="text-xs text-gray-500 font-mono px-2 py-0.5 border border-white/10 rounded">
                    ORG: {user?.clientId}
                </span>
            </div>
        </div>
        <button className="px-6 py-2 border border-lumen-secondary text-lumen-secondary hover:bg-lumen-secondary/10 rounded-lg transition-colors text-sm font-bold uppercase tracking-wider">
            Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-1 bg-lumen-surface/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5">
            <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                <UploadCloud size={20} className="text-lumen-primary" />
                Upload Course Content
            </h3>
            
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-lumen-primary/30 transition-colors group bg-black/20">
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <FileText size={40} className="text-gray-600 group-hover:text-lumen-primary transition-colors mb-2" />
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                        {fileName || "Drag & Drop or Click to Browse"}
                    </span>
                    <span className="text-xs text-gray-600 mt-1">PDF, MP4, JSON supported</span>
                </label>
            </div>

            {fileName && (
                <button 
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full mt-4 bg-lumen-primary text-black font-bold py-2 rounded-lg hover:shadow-glow transition-all disabled:opacity-50"
                >
                    {uploading ? 'UPLOADING...' : 'CONFIRM UPLOAD'}
                </button>
            )}
        </div>

        {/* Student List */}
        <div className="lg:col-span-2 bg-lumen-surface/60 backdrop-blur-xl p-6 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-white">Technician Status</h3>
                <div className="flex items-center gap-1 text-[10px] text-green-500 bg-green-900/20 px-2 py-1 rounded border border-green-900/30">
                    <ShieldAlert size={12} />
                    DATA ISOLATED
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-mono text-gray-500 border-b border-white/10">
                            <th className="p-3">ID</th>
                            <th className="p-3">NAME</th>
                            <th className="p-3">STATUS</th>
                            <th className="p-3 text-right">ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {students.map(student => (
                            <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-3 font-mono text-lumen-secondary">{student.id}</td>
                                <td className="p-3 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white">
                                        {student.name.charAt(0)}
                                    </div>
                                    <span className="text-gray-300">{student.name}</span>
                                </td>
                                <td className="p-3">
                                    <span className={`text-xs px-2 py-1 rounded-full border ${
                                        student.status === 'Active' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                        student.status === 'Advanced' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                        'bg-red-500/10 border-red-500/30 text-red-400'
                                    }`}>
                                        {student.status}
                                    </span>
                                </td>
                                <td className="p-3 text-right">
                                    <button className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                                        <Eye size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {students.length === 0 && (
                    <div className="p-8 text-center text-gray-500 italic">
                        No active technicians found for your organization ({user?.clientId}).
                        <br/>(Check Admin panel for user data)
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Teacher;
