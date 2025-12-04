

import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  FileVideo, 
  Mic, 
  FileText, 
  Image as ImageIcon, 
  Link as LinkIcon,
  X, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  HardDrive,
  Lock,
  Globe,
  Layers,
  Plus,
  Save,
  Trash2
} from 'lucide-react';
import { uploadAsset, getCourses, updateCourse } from '../services/db';
import { Unit } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

type AssetCategory = 'video' | 'audio' | 'document' | 'infographic' | 'link';
type ViewMode = 'assets' | 'builder';

interface UploadState {
  file: File | null;
  url: string;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  errorMessage?: string;
  isProtected?: boolean; // For PDFs
}

const CATEGORIES: { id: AssetCategory; label: string; icon: any; accept: string; maxLimit: string; help: string }[] = [
  { 
    id: 'video', 
    label: 'Video', 
    icon: FileVideo, 
    accept: 'video/mp4,video/x-m4v,video/*', 
    maxLimit: '100MB',
    help: 'MP4, M4V' 
  },
  { 
    id: 'audio', 
    label: 'Audio', 
    icon: Mic, 
    accept: 'audio/mpeg,audio/wav,audio/mp4,audio/x-m4a', 
    maxLimit: '100MB',
    help: 'MP3, MP4A, WAV' 
  },
  { 
    id: 'document', 
    label: 'Document', 
    icon: FileText, 
    accept: 'application/pdf', 
    maxLimit: '50MB',
    help: 'PDF (Secure View)' 
  },
  { 
    id: 'infographic', 
    label: 'Image', 
    icon: ImageIcon, 
    accept: 'image/png,image/jpeg,image/webp', 
    maxLimit: '25MB',
    help: 'JPG, PNG' 
  },
  { 
    id: 'link', 
    label: 'Web Resource', 
    icon: LinkIcon, 
    accept: '', 
    maxLimit: 'N/A',
    help: 'HTTPS URL' 
  },
];

const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

const Author = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('assets');
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('video');
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    url: '',
    progress: 0,
    status: 'idle',
    isProtected: true 
  });
  
  // Builder State
  const [courses, setCourses] = useState<Unit[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Unit | null>(null);
  const [courseNodes, setCourseNodes] = useState<any[]>([]);
  const [savingCourse, setSavingCourse] = useState(false);

  // Recent Uploads
  const [recentUploads, setRecentUploads] = useState<any[]>([
      { name: "Hydraulic_Safety_Manual.pdf", size: "12.5 MB", type: "document", date: "Just now", secure: true },
      { name: "Pump_Maintenance_Q1.mp4a", size: "3.2 MB", type: "audio", date: "2h ago" },
      { name: "Safety_Protocol_Rev3.mp4", size: "92.1 MB", type: "video", date: "5h ago" },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const loadCourses = async () => {
          if (viewMode === 'builder') {
              const data = await getCourses(user?.clientId);
              setCourses(data);
          }
      }
      loadCourses();
  }, [viewMode, user]);

  const handleCourseSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const course = courses.find(c => c.id === e.target.value);
      setSelectedCourse(course || null);
      setCourseNodes(course?.nodes || []);
  };

  const addNode = () => {
      setCourseNodes([...courseNodes, { 
          id: `n${Date.now()}`, 
          title: 'New Lesson', 
          type: 'video', 
          completed: false 
      }]);
  };

  const removeNode = (index: number) => {
      const newNodes = [...courseNodes];
      newNodes.splice(index, 1);
      setCourseNodes(newNodes);
  };

  const updateNode = (index: number, field: string, value: string) => {
      const newNodes = [...courseNodes];
      newNodes[index] = { ...newNodes[index], [field]: value };
      setCourseNodes(newNodes);
  };

  const saveCourseStructure = async () => {
      if (!selectedCourse) return;
      setSavingCourse(true);
      const success = await updateCourse(selectedCourse.id, { nodes: courseNodes });
      if (success) {
          toast.success("Course Structure Updated");
          // Update local state
          const updatedCourses = courses.map(c => c.id === selectedCourse.id ? { ...c, nodes: courseNodes } : c);
          setCourses(updatedCourses);
      } else {
          toast.error("Failed to save changes");
      }
      setSavingCourse(false);
  };

  const activeConfig = CATEGORIES.find(c => c.id === activeCategory)!;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (activeCategory === 'link') return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setUploadState(prev => ({ ...prev, file: null, url: '', progress: 0, status: 'idle', errorMessage: undefined }));

    if (file.size > MAX_SIZE_BYTES) {
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: `File exceeds the 100MB limit. (Detected: ${(file.size / 1024 / 1024).toFixed(1)}MB)`
      }));
      return;
    }
    
    setUploadState(prev => ({
      ...prev,
      file,
      status: 'idle',
      isProtected: file.type === 'application/pdf'
    }));
  };

  const startUpload = async () => {
    if (!uploadState.file && !uploadState.url) return;
    setUploadState(prev => ({ ...prev, status: 'uploading', progress: 0 }));

    try {
        if (uploadState.file) {
            const path = `uploads/${activeCategory}s/${Date.now()}_${uploadState.file.name}`;
            const downloadUrl = await uploadAsset(uploadState.file, path);
            
            setRecentUploads(prev => [{
                name: uploadState.file!.name,
                size: (uploadState.file!.size / 1024 / 1024).toFixed(1) + " MB",
                type: activeCategory,
                date: "Just now",
                url: downloadUrl
            }, ...prev]);

            toast.success("File stored successfully");
        } else {
            toast.success("Link resource saved");
        }
        setUploadState(prev => ({ ...prev, status: 'success', progress: 100 }));
    } catch (e) {
        console.error(e);
        toast.error("Upload failed");
        setUploadState(prev => ({ ...prev, status: 'error', errorMessage: "Cloud Storage Error" }));
    }
  };

  const cancelUpload = () => {
    setUploadState({ file: null, url: '', progress: 0, status: 'idle', isProtected: true });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light text-white">Author Studio</h1>
          <p className="text-lumen-secondary font-mono text-sm mt-1">ASSET INGESTION & MODULE BUILDER</p>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
             <button 
                onClick={() => setViewMode('assets')}
                className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-2 ${viewMode === 'assets' ? 'bg-lumen-primary text-black shadow-glow-sm' : 'text-gray-400 hover:text-white'}`}
             >
                 <UploadCloud size={14} /> Assets
             </button>
             <button 
                onClick={() => setViewMode('builder')}
                className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-2 ${viewMode === 'builder' ? 'bg-lumen-secondary text-black shadow-glow-cyan' : 'text-gray-400 hover:text-white'}`}
             >
                 <Layers size={14} /> Builder
             </button>
        </div>
      </div>

      {viewMode === 'assets' ? (
        // === ASSET MODE ===
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-5 gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); cancelUpload(); }}
                            className={`
                                p-3 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300
                                ${activeCategory === cat.id 
                                    ? 'bg-lumen-dim/40 border-lumen-primary text-lumen-primary shadow-glow-sm scale-105 z-10' 
                                    : 'bg-lumen-surface/40 border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/20'}
                            `}
                        >
                            <cat.icon size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-wide hidden sm:block">{cat.label}</span>
                        </button>
                    ))}
                </div>

                <div className="relative min-h-[320px] rounded-2xl border-2 border-white/10 bg-black/20 p-8 flex flex-col">
                    {activeCategory === 'link' ? (
                        <div className="flex-1 flex flex-col justify-center items-center text-center animate-in fade-in duration-300">
                             <div className="w-16 h-16 rounded-full bg-lumen-secondary/10 flex items-center justify-center mb-6 border border-lumen-secondary/20">
                                <Globe size={32} className="text-lumen-secondary" />
                            </div>
                            <h3 className="text-xl text-white font-light mb-4">Add External Resource</h3>
                            <div className="w-full max-w-md relative">
                                <input 
                                    type="url" 
                                    placeholder="https://example.com/resource"
                                    value={uploadState.url}
                                    onChange={(e) => setUploadState(prev => ({ ...prev, url: e.target.value, status: 'idle' }))}
                                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 pl-10 text-white placeholder-gray-600 focus:border-lumen-primary focus:outline-none focus:ring-1 focus:ring-lumen-primary transition-all font-mono text-sm"
                                />
                                <LinkIcon size={16} className="absolute left-3 top-3.5 text-gray-500" />
                            </div>
                            <p className="text-xs text-gray-500 mt-4">Supported: YouTube, Drives, Public Docs</p>
                        </div>
                    ) : (
                        <div 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className={`
                                absolute inset-0 m-4 rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center
                                ${uploadState.status === 'error' 
                                    ? 'border-red-500/50 bg-red-500/5' 
                                    : uploadState.file 
                                        ? 'border-transparent' 
                                        : 'border-white/10 hover:border-lumen-primary/30 hover:bg-white/5'}
                            `}
                        >
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                id="asset-upload" 
                                className="hidden" 
                                accept={activeConfig.accept}
                                onChange={handleFileSelect}
                            />
                            {uploadState.status === 'idle' && !uploadState.file && (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center mb-6 border border-white/5 pointer-events-none">
                                        <UploadCloud size={32} className="text-gray-500" />
                                    </div>
                                    <h3 className="text-xl text-white font-light mb-2">Drag & Drop {activeConfig.label}</h3>
                                    <p className="text-sm text-gray-500 mb-6">or click to browse local files</p>
                                    <label htmlFor="asset-upload" className="absolute inset-0 cursor-pointer" />
                                </>
                            )}
                            
                            {uploadState.file && (
                                <div className="w-full max-w-md animate-in fade-in zoom-in duration-300 z-10">
                                    <div className="flex items-center gap-4 mb-6 bg-lumen-surface/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl">
                                        <div className="p-3 bg-lumen-dim/30 rounded-lg text-lumen-primary">
                                            <activeConfig.icon size={24} />
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{uploadState.file.name}</p>
                                            <p className="text-xs text-gray-500 font-mono">{(uploadState.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                        {uploadState.status === 'idle' && (
                                            <button onClick={cancelUpload} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition-colors">
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {(uploadState.file || (uploadState.url && activeCategory === 'link')) && (
                     <div className="bg-lumen-surface/60 border border-white/5 rounded-2xl p-6">
                        {uploadState.status === 'error' && (
                            <div className="flex items-center justify-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-4">
                                <AlertTriangle size={18} />
                                <span className="text-sm">{uploadState.errorMessage}</span>
                            </div>
                        )}
                        {uploadState.status === 'success' ? (
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 text-lumen-primary mb-4 px-4 py-2 bg-lumen-primary/10 rounded-full border border-lumen-primary/30">
                                    <CheckCircle size={20} />
                                    <span className="font-bold tracking-wide">
                                        {activeCategory === 'link' ? 'RESOURCE LINKED' : 'UPLOAD COMPLETE'}
                                    </span>
                                </div>
                                <button onClick={cancelUpload} className="block w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm uppercase font-bold">
                                    Add Another Asset
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {uploadState.status === 'uploading' && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-mono text-lumen-secondary">
                                            <span>{activeCategory === 'link' ? 'VALIDATING LINK...' : 'UPLOADING TO CLOUD...'}</span>
                                            <span className="animate-pulse">...</span>
                                        </div>
                                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-lumen-primary shadow-glow animate-pulse" style={{ width: `100%` }} />
                                        </div>
                                    </div>
                                )}
                                {uploadState.status === 'idle' && (
                                    <button 
                                        onClick={startUpload}
                                        className="w-full py-4 bg-lumen-primary hover:bg-lumen-highlight text-black font-bold rounded-xl shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        <UploadCloud size={20} />
                                        {activeCategory === 'link' ? 'ADD RESOURCE' : 'START UPLOAD'}
                                    </button>
                                )}
                            </div>
                        )}
                     </div>
                )}
            </div>

            <div className="lg:col-span-1">
                <div className="bg-lumen-surface/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col">
                    <h3 className="text-white font-medium mb-4 flex items-center justify-between">
                        Asset Library
                        <span className="text-xs text-lumen-secondary px-2 py-1 bg-lumen-secondary/10 rounded-full flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-lumen-secondary animate-pulse"></div>
                            SYNCED
                        </span>
                    </h3>
                    <div className="space-y-3 overflow-y-auto flex-1 pr-2 max-h-[500px]">
                        {recentUploads.map((file, i) => (
                            <div key={i} className="group p-3 rounded-lg border border-white/5 hover:border-lumen-primary/30 hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-black/40 flex items-center justify-center text-gray-500 group-hover:text-lumen-primary relative">
                                    <FileText size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm text-gray-300 truncate group-hover:text-white transition-colors">{file.name}</h4>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-xs text-gray-600 font-mono">{file.size}</span>
                                        <span className="text-[10px] text-gray-500">{file.date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      ) : (
        // === BUILDER MODE ===
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
             {/* Left: Course Structure */}
             <div className="lg:col-span-2 space-y-6">
                 <div className="bg-lumen-surface/60 border border-white/5 rounded-2xl p-6">
                     <h3 className="text-white font-medium mb-4">Select Course</h3>
                     <select 
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-lumen-secondary"
                        onChange={handleCourseSelect}
                        value={selectedCourse?.id || ''}
                     >
                         <option value="">-- Choose a Course to Edit --</option>
                         {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.id})</option>)}
                     </select>
                 </div>

                 {selectedCourse && (
                     <div className="bg-lumen-surface/60 border border-white/5 rounded-2xl p-6 relative">
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="text-lg text-white font-light">Course Structure: <span className="text-lumen-secondary font-bold">{selectedCourse.title}</span></h3>
                             <button 
                                onClick={addNode}
                                className="px-3 py-1.5 bg-lumen-secondary/10 text-lumen-secondary border border-lumen-secondary/30 rounded-lg hover:bg-lumen-secondary/20 text-xs font-bold uppercase flex items-center gap-2"
                             >
                                 <Plus size={14} /> Add Lesson
                             </button>
                         </div>
                         
                         <div className="space-y-3">
                             {courseNodes.length === 0 && (
                                 <div className="text-center p-8 border-2 border-dashed border-white/10 rounded-xl text-gray-500">
                                     No lessons defined. Click "Add Lesson" to start building.
                                 </div>
                             )}
                             
                             {courseNodes.map((node, i) => (
                                 <div key={i} className="bg-black/40 border border-white/10 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center">
                                     <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-mono text-xs">
                                         {i + 1}
                                     </div>
                                     <div className="flex-1 space-y-2 w-full">
                                         <input 
                                            type="text" 
                                            value={node.title} 
                                            onChange={(e) => updateNode(i, 'title', e.target.value)}
                                            className="w-full bg-transparent border-b border-white/10 focus:border-lumen-secondary text-white text-sm pb-1 outline-none font-medium"
                                            placeholder="Lesson Title"
                                         />
                                         <div className="flex gap-2">
                                             <select 
                                                value={node.type}
                                                onChange={(e) => updateNode(i, 'type', e.target.value)}
                                                className="bg-white/5 border border-white/10 rounded text-xs text-gray-400 p-1 outline-none"
                                             >
                                                 <option value="video">Video Lesson</option>
                                                 <option value="read">Reading Material</option>
                                                 <option value="quiz">Assessment</option>
                                             </select>
                                             <div className="flex-1 relative">
                                                 <input 
                                                    type="text" 
                                                    placeholder="Drag Asset here or paste ID"
                                                    className="w-full bg-white/5 border border-white/10 rounded text-xs text-gray-400 p-1 pl-2 outline-none"
                                                 />
                                             </div>
                                         </div>
                                     </div>
                                     <button onClick={() => removeNode(i)} className="text-gray-600 hover:text-red-400">
                                         <Trash2 size={16} />
                                     </button>
                                 </div>
                             ))}
                         </div>

                         <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                             <button 
                                onClick={saveCourseStructure}
                                disabled={savingCourse}
                                className="px-6 py-3 bg-lumen-primary text-black font-bold rounded-xl shadow-glow hover:scale-105 transition-transform flex items-center gap-2"
                             >
                                 {savingCourse ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                 SAVE STRUCTURE
                             </button>
                         </div>
                     </div>
                 )}
             </div>
             
             {/* Right: Asset Sidebar (Mini) */}
             <div className="lg:col-span-1">
                 <div className="bg-lumen-surface/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col">
                    <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-wide">Available Assets</h3>
                    <p className="text-xs text-gray-500 mb-4">Drag file names to link them to lessons.</p>
                    <div className="space-y-2 overflow-y-auto flex-1 max-h-[500px]">
                        {recentUploads.map((file, i) => (
                            <div 
                                key={i} 
                                draggable 
                                onDragStart={(e) => e.dataTransfer.setData("text/plain", file.name)}
                                className="p-3 bg-black/40 border border-white/5 rounded-lg hover:border-lumen-secondary/50 cursor-grab active:cursor-grabbing flex items-center gap-3"
                            >
                                <div className="text-gray-500">
                                    {file.type === 'video' && <FileVideo size={16} />}
                                    {file.type === 'document' && <FileText size={16} />}
                                    {file.type === 'audio' && <Mic size={16} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-300 truncate">{file.name}</p>
                                    <p className="text-[10px] text-gray-600">{file.size}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default Author;