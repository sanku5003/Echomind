import React from 'react';

interface VoiceIndicatorProps {
  isActive: boolean;
  state: 'idle' | 'listening' | 'processing' | 'speaking';
  onClick: () => void;
}

export const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ isActive, state, onClick }) => {
  
  let buttonColor = 'bg-slate-700 hover:bg-slate-600';
  let icon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 1.5a6 6 0 00-6 6v1.5a6 6 0 006 6v-1.5a6 6 0 006-6v-1.5a6 6 0 00-6-6z" />
    </svg>
  );
  let statusText = "Tap to Speak";

  if (state === 'listening') {
    buttonColor = 'bg-red-500';
    statusText = "Listening...";
  } else if (state === 'processing') {
    buttonColor = 'bg-indigo-500 animate-pulse';
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 animate-spin">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    );
    statusText = "Thinking...";
  } else if (state === 'speaking') {
    buttonColor = 'bg-emerald-500';
     icon = (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    );
    statusText = "Speaking...";
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative group">
        {state === 'listening' && <div className="pulse-ring bg-red-500" />}
        {state === 'speaking' && <div className="pulse-ring bg-emerald-500" />}
        
        <button 
          onClick={onClick}
          className={`
            relative z-10 w-20 h-20 rounded-full flex items-center justify-center 
            text-white shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95
            ${buttonColor}
          `}
        >
          {icon}
        </button>
      </div>
      <span className="text-sm font-medium tracking-widest uppercase text-slate-400">
        {statusText}
      </span>
    </div>
  );
};