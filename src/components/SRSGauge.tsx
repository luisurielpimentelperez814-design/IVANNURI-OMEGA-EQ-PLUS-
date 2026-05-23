import React from 'react';
import { motion } from 'motion/react';

export const SRSGauge: React.FC<{ value: number }> = ({ value }) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div id="srs-gauge-container" className="flex flex-col items-center justify-center p-3 bg-white/5 border border-white/5 rounded-sm">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg width="100" height="100" className="-rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="4"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#f97316"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-serif text-white tracking-widest">{Math.floor(value)}%</span>
          <span className="text-[7px] font-mono text-orange-500 uppercase tracking-widest -mt-1">SRS Quality</span>
        </div>
      </div>
      
      <div className="mt-3 flex gap-4 w-full">
        <div className="flex-1 flex flex-col gap-1">
           <div className="h-0.5 w-full bg-white/5">
             <div className="h-full bg-white/20 w-[65%]" />
           </div>
           <span className="text-[6px] font-mono opacity-30 uppercase tracking-tighter">Phase Coherence</span>
        </div>
        <div className="flex-1 flex flex-col gap-1">
           <div className="h-0.5 w-full bg-white/5">
             <div className="h-full bg-white/20 w-[82%]" />
           </div>
           <span className="text-[6px] font-mono opacity-30 uppercase tracking-tighter">Harmonic Dist</span>
        </div>
      </div>
    </div>
  );
};
