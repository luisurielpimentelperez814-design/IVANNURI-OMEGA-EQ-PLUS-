import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface Node {
  id: number;
  x: number;
  y: number;
  type: 'input' | 'hidden' | 'output';
}

interface Link {
  from: number;
  to: number;
  strength: number;
}

export const NeuralArchitecture: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodes = useRef<Node[]>([]);
  const links = useRef<Link[]>([]);

  useEffect(() => {
    // Generate static architecture
    const layers = [1, 4, 6, 4, 1];
    const newNodes: Node[] = [];
    const newLinks: Link[] = [];
    let id = 0;

    layers.forEach((count, lIndex) => {
      for (let i = 0; i < count; i++) {
        newNodes.push({
          id: id++,
          x: (lIndex / (layers.length - 1)) * 340 + 30,
          y: (i / (count - 1 || 1)) * 180 + 10,
          type: lIndex === 0 ? 'input' : lIndex === layers.length - 1 ? 'output' : 'hidden'
        });
      }
    });

    // Create links between layers
    let nodeOffset = 0;
    for (let l = 0; l < layers.length - 1; l++) {
      const currentLayerCount = layers[l];
      const nextLayerCount = layers[l + 1];
      for (let i = 0; i < currentLayerCount; i++) {
        for (let j = 0; j < nextLayerCount; j++) {
          newLinks.push({
            from: nodeOffset + i,
            to: nodeOffset + currentLayerCount + j,
            strength: Math.random()
          });
        }
      }
      nodeOffset += currentLayerCount;
    }

    nodes.current = newNodes;
    links.current = newLinks;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const time = frame * 0.05;

      // Draw links
      links.current.forEach(link => {
        const from = nodes.current[link.from];
        const to = nodes.current[link.to];
        
        const opacity = active ? 0.1 + Math.sin(time + link.from) * 0.05 + 0.1 : 0.05;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = active ? `rgba(249, 115, 22, ${opacity})` : `rgba(255, 255, 255, 0.05)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        if (active && Math.random() < 0.02) {
          // Draw signal pulse
          const p = (frame % 50) / 50;
          const px = from.x + (to.x - from.x) * p;
          const py = from.y + (to.y - from.y) * p;
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(px, py, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw nodes
      nodes.current.forEach((node, i) => {
        const pulse = active ? Math.sin(time + i) * 2 : 0;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2 + pulse * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = active ? (node.type === 'input' || node.type === 'output' ? '#ffedd5' : '#f97316') : '#333';
        ctx.fill();
        
        if (active) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#f97316';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 1, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      requestAnimationFrame(animate);
    };

    const handle = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(handle);
  }, [active]);

  return (
    <div id="neural-architecture-container" className="relative w-full h-[200px] bg-black/20 border border-white/5 overflow-hidden">
      <div className="absolute top-2 left-3 flex items-center gap-2 opacity-30">
        <div className={`w-1 h-1 rounded-full ${active ? 'bg-orange-500 animate-pulse' : 'bg-zinc-500'}`} />
        <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Neural Weights Dynamic</span>
      </div>
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={200} 
        className="w-full h-full"
      />
    </div>
  );
};
