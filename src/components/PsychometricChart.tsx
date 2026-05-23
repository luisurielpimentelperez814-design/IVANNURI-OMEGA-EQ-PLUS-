import React from 'react';
import { motion } from 'motion/react';

interface PsychometricChartProps {
  data: {
    transparency: number;
    warmth: number;
    impact: number;
    depth: number;
    neurality: number;
  };
}

export const PsychometricChart: React.FC<PsychometricChartProps> = ({ data }) => {
  const size = 160;
  const center = size / 2;
  const radius = size * 0.4;

  const points = [
    { label: 'TRA', val: data.transparency, angle: -90 },
    { label: 'WRM', val: data.warmth, angle: -18 },
    { label: 'IMP', val: data.impact, angle: 54 },
    { label: 'DEP', val: data.depth, angle: 126 },
    { label: 'NEU', val: data.neurality, angle: 198 },
  ];

  const getPath = (vals: typeof data) => {
    return points.map((p, i) => {
      const v = Object.values(vals)[i];
      const r = (v / 10) * radius;
      const x = center + r * Math.cos((p.angle * Math.PI) / 180);
      const y = center + r * Math.sin((p.angle * Math.PI) / 180);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';
  };

  return (
    <div id="psychometric-chart-container" className="flex flex-col items-center bg-[#111] border border-white/5 p-4 rounded-sm">
      <div className="w-full flex justify-between items-center mb-4 opacity-30">
        <span className="text-[8px] font-mono uppercase tracking-widest">Psychometric Profile</span>
        <span className="text-[8px] font-mono">v8.2</span>
      </div>
      
      <div className="relative">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background circles */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius * r}
              fill="none"
              stroke="white"
              strokeOpacity={0.05}
              strokeDasharray={i === 4 ? "0" : "2,2"}
            />
          ))}

          {/* Axis lines */}
          {points.map((p, i) => {
            const x2 = center + radius * Math.cos((p.angle * Math.PI) / 180);
            const y2 = center + radius * Math.sin((p.angle * Math.PI) / 180);
            return (
              <g key={i}>
                <line
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="white"
                  strokeOpacity={0.1}
                />
                <text
                  x={center + (radius + 15) * Math.cos((p.angle * Math.PI) / 180)}
                  y={center + (radius + 15) * Math.sin((p.angle * Math.PI) / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-neutral-500 text-[7px] font-mono uppercase tracking-tighter"
                >
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Data area */}
          <motion.path
            initial={false}
            animate={{ d: getPath(data) }}
            fill="rgba(249, 115, 22, 0.2)"
            stroke="#f97316"
            strokeWidth="1.5"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-1 w-full">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="flex flex-col items-center">
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(val / 10) * 100}%` }}
                 className="h-full bg-orange-500/50" 
               />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
