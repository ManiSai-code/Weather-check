import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Radio } from 'lucide-react';

interface AudioImmersionProps {
  condition: string;
}

export default function AudioImmersion({ condition }: AudioImmersionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const normalized = condition.toLowerCase();
  const isRainyOrStorm = normalized.includes('rain') || normalized.includes('drizzle') || normalized.includes('shower') || normalized.includes('thunder') || normalized.includes('storm');
  const isWindyOrSand = normalized.includes('sand') || normalized.includes('dust') || normalized.includes('wind') || normalized.includes('cloud') || normalized.includes('overcast');

  const createNoiseBuffer = (ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2; 
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  };

  const startSynthesizer = () => {
    if (noiseSourceRef.current) return;

    // 🛠️ FIXED: Removed 'any' cast by accessing native window properties safely
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNodeRef.current = gainNode;

    const filter = ctx.createBiquadFilter();
    if (isRainyOrStorm) {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime); 
    } else if (isWindyOrSand) {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime); 
      filter.Q.setValueAtTime(3, ctx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime); 
    }

    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx);
    source.loop = true;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();
    noiseSourceRef.current = source;
  };

  const stopSynthesizer = () => {
    // 🛠️ FIXED: Swapped 'source' out for the correct ref tracker pointer
    if (noiseSourceRef.current) {
      try { 
        noiseSourceRef.current.stop(); 
      } catch {
        // Fallback for already stopped streams
      }
      noiseSourceRef.current.disconnect();
      noiseSourceRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close();
    }
  };

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      stopSynthesizer();
      startSynthesizer();
    }
  }, [condition]);

  const togglePlayback = () => {
    if (isPlaying) {
      stopSynthesizer();
    } else {
      startSynthesizer();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800 rounded-full px-4 py-2 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-1.5">
        <Radio className={`w-4 h-4 ${isPlaying ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
        <span className="text-xs font-mono uppercase font-bold tracking-wider text-slate-400">Atmosphere Synth</span>
      </div>

      <button
        onClick={togglePlayback}
        className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}
      >
        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>

      <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
        {volume === 0 ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
        <input
          type="range"
          min="0"
          max="0.8"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );
}