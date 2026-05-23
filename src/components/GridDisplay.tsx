import React from 'react';
import { motion } from 'motion/react';

export const GridDisplay: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <div id="grid-display-container" className="relative w-full h-[120px] bg-black border border-white/10 overflow-hidden group">
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-6">
        {Array.from({ length: 72 }).map((_, i) => (
          <div key={i} className="border-[0.5px] border-white/5" />
        ))}
      </div>
      
      {active && (
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              x: ['0%', '100%', '0%'],
              y: ['0%', '50%', '100%', '0%']
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 bg-orange-500/20 blur-xl rounded-full"
          />
          <motion.div 
            animate={{ 
              x: ['100%', '0%', '100%'],
              y: ['100%', '0%', '100%']
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 bg-white/10 blur-xl rounded-full"
          />
        </div>
      )}

      <div className="absolute bottom-2 left-2 flex flex-col gap-0.5 opacity-40">
        <span className="text-[7px] font-mono uppercase tracking-[0.3em] text-white">Spatial Vector Map</span>
        <div className="w-12 h-0.5 bg-orange-500" />
      </div>

      <div className="absolute top-2 right-3 flex items-center gap-4">
         <div className="flex flex-col items-end">
            <span className="text-[6px] font-mono text-zinc-500">AZIMUTH</span>
            <span className="text-[8px] font-mono text-white">12.4°</span>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[6px] font-mono text-zinc-500">ELEVATION</span>
            <span className="text-[8px] font-mono text-white">-3.1°</span>
         </div>
      </div>
    </div>
  );
};
