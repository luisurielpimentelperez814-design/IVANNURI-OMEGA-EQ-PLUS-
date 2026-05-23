import React, { useState } from 'react';
import { Search, ChevronRight, ChevronDown, Database, Cpu, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ObjectItem {
  id: string;
  name: string;
  type: 'process' | 'buffer' | 'thread' | 'metadata';
  status: 'active' | 'idle' | 'warning' | 'info';
  value: string;
}

interface ObjectExplorerProps {
  trackMetadata?: any;
}

export const ObjectExplorer: React.FC<ObjectExplorerProps> = ({ trackMetadata }) => {
  const [items, setItems] = useState<ObjectItem[]>([
    { id: '1', name: 'NVSNP_CORE_V8', type: 'process', status: 'active', value: '0x7F41' },
    { id: '2', name: 'HRTF_BUFFER_A', type: 'buffer', status: 'active', value: '1024 samples' },
    { id: '3', name: 'NEURAL_EMBED_0', type: 'thread', status: 'idle', value: '4 core affinity' },
    { id: '4', name: 'KL_ADAPTIVE_M', type: 'process', status: 'warning', value: 'Latency spike' },
  ]);

  const displayItems = trackMetadata ? [
    ...items,
    { id: 'meta-1', name: 'ID_ISRC', type: 'metadata', status: 'info', value: trackMetadata.isrc || 'UNKNOWN' },
    { id: 'meta-2', name: 'STREAM_QUALITY', type: 'metadata', status: 'info', value: trackMetadata.quality || 'HIGH' },
    { id: 'meta-3', name: 'RELEASE_DATE', type: 'metadata', status: 'info', value: trackMetadata.releaseDate || 'N/A' },
  ] : items;

  return (
    <div id="object-explorer-container" className="bg-[#0a0a0a] border border-white/10 flex flex-col h-full">
      <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-2">
          <Database size={12} className={`text-orange-500 ${trackMetadata ? 'animate-pulse' : ''}`} />
          <span className="text-[9px] font-mono uppercase tracking-[0.2em]">Engine Instance Explorer {trackMetadata ? '(LINKED)' : ''}</span>
        </div>
        <span className="text-[8px] font-mono opacity-40">READ_ONLY</span>
      </div>

      <div className="flex-1 overflow-y-auto font-mono">
        {displayItems.map((item) => (
          <div key={item.id} className="group border-b border-white/5 hover:bg-white/5 transition-colors p-2 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className={`w-1 h-3 ${
                item.status === 'active' ? 'bg-orange-500' : 
                item.status === 'warning' ? 'bg-red-500' : 
                item.status === 'info' ? 'bg-cyan-500' :
                'bg-zinc-700'
              }`} />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                   <span className="text-[9px] text-white/80 group-hover:text-white transition-colors">{item.name}</span>
                   <span className="text-[7px] opacity-30 uppercase">{item.type}</span>
                </div>
                <div className="flex justify-between items-end">
                   <span className={`text-[7px] ${item.status === 'warning' ? 'text-red-400' : 'text-zinc-500'}`}>{item.status.toUpperCase()}</span>
                   <span className="text-[8px] text-orange-500/50 italic">{item.value}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-black/40 border-t border-white/5">
         <div className="flex gap-2">
            <div className="flex-1 h-1 bg-white/5"><div className="h-full bg-orange-500/40 w-[60%]" /></div>
            <div className="flex-1 h-1 bg-white/5"><div className="h-full bg-orange-500/40 w-[40%]" /></div>
            <div className="flex-1 h-1 bg-white/5"><div className="h-full bg-orange-500/40 w-[80%]" /></div>
         </div>
      </div>
    </div>
  );
};
