import React from 'react';
import { Memory } from '../types';

interface MemoryCardProps {
  memory: Memory;
  isNew?: boolean;
  highlight?: boolean;
  onDelete: (id: string) => void;
}

const typeColors = {
  preference: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  fact: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  constraint: 'bg-red-500/20 text-red-300 border-red-500/50',
  general: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
};

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, isNew, highlight, onDelete }) => {
  return (
    <div 
      className={`
        relative p-3 rounded-lg border mb-3 transition-all duration-500 group
        ${typeColors[memory.type]}
        ${isNew ? 'animate-bounce shadow-[0_0_15px_rgba(99,102,241,0.5)]' : ''}
        ${highlight ? 'ring-2 ring-yellow-400 scale-105 bg-yellow-500/10' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">
          {memory.type}
        </span>
        <div className="flex items-center space-x-2">
            <span className="text-[10px] opacity-60">
            {new Date(memory.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(memory._id); }}
                className="text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="Forget this memory"
                aria-label="Delete memory"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      </div>
      <p className="text-sm font-medium leading-relaxed">{memory.content}</p>
      {highlight && (
        <div className="absolute -right-1 -top-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
      )}
    </div>
  );
};