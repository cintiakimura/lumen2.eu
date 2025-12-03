import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Mic } from 'lucide-react';
import { AUDIO_TRACKS } from '../constants';

const Audio = () => {
  const [playing, setPlaying] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-lumen-surface/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
              <Mic size={200} className="text-lumen-primary" />
          </div>
          
          <div className="relative z-10">
            <h4 className="text-lumen-primary text-xs font-bold tracking-widest uppercase mb-4">Now Playing Channel</h4>
            <h2 className="text-3xl md:text-5xl font-light text-white mb-2">SoundHelix 3</h2>
            <p className="text-lumen-secondary text-lg mb-12">Automotive Fault Diagnosis • Chapter 1</p>

            {/* Visualizer Mock */}
            <div className="flex items-end justify-center gap-1 h-24 mb-12 opacity-80">
                {[...Array(30)].map((_, i) => (
                    <div 
                        key={i} 
                        className="w-2 bg-lumen-primary rounded-t-sm animate-pulse-slow" 
                        style={{ 
                            height: `${Math.random() * 100}%`, 
                            animationDelay: `${i * 0.05}s`,
                            opacity: playing ? 1 : 0.3
                        }}
                    ></div>
                ))}
            </div>

            <div className="flex items-center justify-center gap-8">
                <button className="p-4 text-gray-400 hover:text-white transition-colors"><SkipBack size={24} /></button>
                <button 
                    onClick={() => setPlaying(playing ? null : 1)}
                    className="w-20 h-20 rounded-full bg-lumen-primary text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,198,0,0.4)] hover:scale-110 transition-transform"
                >
                    {playing ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
                <button className="p-4 text-gray-400 hover:text-white transition-colors"><SkipForward size={24} /></button>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-gray-400 font-mono text-sm uppercase px-2">Library</h3>
        {AUDIO_TRACKS.map(track => (
            <div 
                key={track.id}
                onClick={() => setPlaying(track.id)}
                className={`
                    p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all
                    ${playing === track.id 
                        ? 'bg-lumen-dim/30 border-lumen-primary/50 shadow-glow-sm' 
                        : 'bg-white/5 border-transparent hover:bg-white/10'}
                `}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${playing === track.id ? 'bg-lumen-primary text-black' : 'bg-gray-800 text-gray-400'}`}>
                        {playing === track.id ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    </div>
                    <div>
                        <h4 className={`text-sm font-bold ${playing === track.id ? 'text-lumen-primary' : 'text-white'}`}>{track.title}</h4>
                        <p className="text-xs text-gray-500">{track.subtitle}</p>
                    </div>
                </div>
                <span className="text-xs font-mono text-gray-600">{track.duration}</span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Audio;
