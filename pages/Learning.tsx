
import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Send, CheckCircle, AlertTriangle, Lock, BookOpen, ChevronRight, Hash, Terminal } from 'lucide-react';
import { gradeSubmissionAI } from '../services/geminiService';
import { getCourses, getTasks, saveSubmission, Task } from '../services/db';
import { Grade, Unit, Submission } from '../types';
import { MOCK_USERS } from '../constants';
import toast from 'react-hot-toast';

const Learning = () => {
  // SIMULATED AUTH CONTEXT
  // We assume the logged-in student is 'Alex Rivera' from Tesla (CLI-TESLA)
  // Switch this ID in constants.ts to 'OP-443' (SpaceX) to see different courses
  const currentStudent = MOCK_USERS.find(u => u.id === 'OP-442')!;

  // Data State
  const [units, setUnits] = useState<Unit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // UI State
  const [activeUnitId, setActiveUnitId] = useState<string>('');
  const [activeTaskId, setActiveTaskId] = useState<string>(''); 
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [grade, setGrade] = useState<Grade | null>(null);

  // Load Units on Mount
  useEffect(() => {
      const loadUnits = async () => {
          const data = await getCourses(currentStudent.clientId);
          setUnits(data);
          if (data.length > 0) setActiveUnitId(data[0].id);
      };
      loadUnits();
  }, [currentStudent.clientId]);

  // Load Tasks when Unit Changes
  useEffect(() => {
      if (!activeUnitId) return;
      const loadTasks = async () => {
          const data = await getTasks(activeUnitId);
          setTasks(data);
          if (data.length > 0) setActiveTaskId(data[0].id);
          else setActiveTaskId('');
      }
      loadTasks();
  }, [activeUnitId]);

  const activeUnit = units.find(u => u.id === activeUnitId);
  const activeTask = tasks.find(t => t.id === activeTaskId);

  const handleSubmit = async () => {
    if (!response.trim() || !activeTask) return;
    setLoading(true);
    setGrade(null);

    try {
        const result = await gradeSubmissionAI(`Unit: ${activeUnit?.title}, Task: ${activeTask?.title}`, response);
        setGrade(result);
        
        // Save to DB
        const submission: Submission = {
            submission_id: `SUB-${Date.now()}`,
            user_id: currentStudent.id,
            clientId: currentStudent.clientId,
            unit_id: activeUnitId,
            task_id: activeTaskId,
            response: response,
            started_at: Date.now() - 300000, // mock start time
            submitted_at: Date.now(),
            time_sec: 300,
            grade: result
        };
        await saveSubmission(submission);
        toast.success("Progress Saved to Lumen Core");

    } catch(e) {
        toast.error("Submission failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* COLUMN 1: Course / Module Navigator */}
      <div className="lg:w-72 flex-shrink-0 flex flex-col bg-lumen-surface/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-black/20">
             <h2 className="text-xs font-mono text-lumen-secondary tracking-widest uppercase flex items-center gap-2">
                <BookOpen size={14} /> Training Modules
             </h2>
             <span className="text-[10px] text-gray-500 font-mono mt-1 block">Context: {currentStudent.clientId}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
            {units.length === 0 && (
                <div className="p-4 text-xs text-gray-500">No courses loaded. Check Admin to Seed DB.</div>
            )}
            {units.map(unit => (
                <button
                    key={unit.id}
                    disabled={unit.status === 'locked'}
                    onClick={() => { setActiveUnitId(unit.id); setGrade(null); setResponse(''); }}
                    className={`
                        w-full text-left p-3 rounded-lg border transition-all duration-200 group relative overflow-hidden
                        ${unit.id === activeUnitId 
                            ? 'bg-lumen-primary/10 border-lumen-primary/50 text-white' 
                            : unit.status === 'locked' 
                                ? 'opacity-50 cursor-not-allowed border-transparent' 
                                : 'hover:bg-white/5 border-transparent text-gray-400 hover:text-gray-200'}
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono opacity-70">{unit.id}</span>
                        {unit.status === 'locked' && <Lock size={12} />}
                        {unit.status === 'completed' && <CheckCircle size={12} className="text-lumen-primary" />}
                    </div>
                    <div className="font-medium text-sm mt-1 truncate pr-4">{unit.title}</div>
                    
                    {unit.id === activeUnitId && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-lumen-primary"></div>
                    )}
                    
                    {/* Private Content Indicator */}
                    {unit.clientId && (
                        <div className="absolute top-1 right-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                        </div>
                    )}
                </button>
            ))}
        </div>
      </div>

      {/* COLUMN 2: Task Selector (Middle) */}
      <div className="lg:w-64 flex-shrink-0 flex flex-col bg-lumen-surface/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
         <div className="p-4 border-b border-white/5 bg-black/20">
             <h2 className="text-xs font-mono text-lumen-secondary tracking-widest uppercase flex items-center gap-2">
                <Hash size={14} /> Module Tasks
             </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
             {activeUnit && tasks.length > 0 ? (
                 tasks.map(task => (
                    <button
                        key={task.id}
                        onClick={() => { setActiveTaskId(task.id); setGrade(null); setResponse(''); }}
                        className={`
                            w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3
                            ${task.id === activeTaskId 
                                ? 'bg-gradient-to-r from-lumen-dim/40 to-transparent border-lumen-secondary/50 text-white shadow-glow-sm' 
                                : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/5'}
                        `}
                    >
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border
                            ${task.completed ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'bg-gray-800 border-gray-700'}
                        `}>
                            {task.completed ? <CheckCircle size={14} /> : task.id.split('-').pop()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm truncate font-medium">{task.title}</h4>
                            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${
                                task.difficulty === 'Easy' ? 'border-green-800 text-green-400' : 
                                task.difficulty === 'Medium' ? 'border-yellow-800 text-yellow-400' : 
                                'border-red-800 text-red-400'
                            }`}>
                                {task.difficulty}
                            </span>
                        </div>
                        {task.id === activeTaskId && <ChevronRight size={16} className="text-lumen-secondary" />}
                    </button>
                 ))
             ) : (
                 <div className="p-6 text-center text-gray-500 text-sm italic">
                    <Lock size={24} className="mx-auto mb-2 opacity-50" />
                    {activeUnit ? "No tasks available for this module." : "Select an active module to view tasks."}
                 </div>
             )}
        </div>
      </div>

      {/* COLUMN 3: Workspace (Right) */}
      <div className="flex-1 min-w-0 flex flex-col gap-6 overflow-y-auto pr-2">
        {activeUnit && activeTask ? (
            <>
                {/* Video / Theory Section */}
                <div className="bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative group shrink-0">
                  <div className="aspect-video relative">
                     <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube-nocookie.com/embed/${activeUnit.video_id || 'LwCRRUa8yTU'}?controls=0&modestbranding=1`} 
                        title="Lesson Video"
                        className="opacity-90 group-hover:opacity-100 transition-opacity"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      ></iframe>
                  </div>
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur px-3 py-1.5 rounded border border-lumen-primary/30 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-lumen-primary animate-pulse"></div>
                    <span className="text-xs font-mono text-lumen-primary tracking-wide">THEORY UPLINK ACTIVE</span>
                  </div>
                </div>

                {/* Interactive Terminal */}
                <div className="flex-1 bg-lumen-surface/80 backdrop-blur-xl border border-white/5 rounded-2xl p-1 flex flex-col min-h-[400px]">
                    <div className="bg-black/40 p-3 rounded-t-xl border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Terminal size={16} />
                            <span className="text-xs font-mono">TASK TERMINAL // {activeTask.id}</span>
                        </div>
                        {grade && (
                             <span className={`text-xs font-bold px-2 py-1 rounded ${grade.score >= 70 ? 'text-green-400 bg-green-900/20' : 'text-yellow-400 bg-yellow-900/20'}`}>
                                SCORE: {grade.score}%
                             </span>
                        )}
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-light text-white mb-2">
                            {activeTask.title}
                        </h3>
                        <p className="text-gray-400 mb-6 font-mono text-sm border-l-2 border-lumen-secondary pl-3">
                            {/* In a real app, this prompt comes from the DB */}
                            Analyze the scenario and provide a technical solution. Be specific about safety protocols.
                        </p>

                        {!grade ? (
                            <div className="flex-1 flex flex-col gap-4">
                                <textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder="> Awaiting technician input..."
                                    className="flex-1 w-full bg-[#050a08] border border-white/10 rounded-lg p-4 text-green-100 placeholder-gray-700 focus:border-lumen-primary/50 focus:ring-1 focus:ring-lumen-primary/50 transition-all resize-none font-mono text-sm leading-relaxed"
                                />
                                <div className="flex justify-end">
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={loading || !response}
                                        className={`
                                            px-6 py-2 rounded-lg font-bold tracking-wide flex items-center gap-2 text-sm
                                            ${loading 
                                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                                : 'bg-lumen-primary hover:bg-lumen-highlight text-black shadow-glow hover:scale-105 transition-all'}
                                        `}
                                    >
                                        {loading ? <RotateCcw className="animate-spin" size={16} /> : <Send size={16} />}
                                        {loading ? 'PROCESSING...' : 'SUBMIT'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto bg-black/20 rounded-lg p-4 border border-white/5 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-3 mb-4">
                                     <div className={`p-2 rounded-full ${grade.score >= 70 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        {grade.score >= 70 ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                                     </div>
                                     <h4 className="text-white font-medium">Analysis Complete</h4>
                                </div>
                                <p className="text-sm text-gray-300 mb-4">{grade.feedback.overall}</p>
                                
                                <div className="space-y-2 mb-4">
                                    {grade.feedback.criteria.map((c, i) => (
                                        <div key={i} className="flex justify-between text-xs bg-white/5 p-2 rounded">
                                            <span className="text-gray-400">{c.name}</span>
                                            <span className={c.score > 80 ? 'text-lumen-primary' : 'text-yellow-500'}>{c.score}%</span>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                  onClick={() => { setGrade(null); setResponse(''); }}
                                  className="text-xs text-lumen-secondary hover:text-white underline underline-offset-4"
                                >
                                    Try Another Approach / Reset
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </>
        ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-2xl bg-black/20">
                <BookOpen size={48} className="mb-4 opacity-50" />
                <p>Select a module and task to begin training.</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default Learning;
