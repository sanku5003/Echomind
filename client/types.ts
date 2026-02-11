export type MemoryType = 'preference' | 'fact' | 'constraint' | 'general';

export interface Memory {
  id: string;
  type: MemoryType;
  content: string; // The actual fact, e.g., "User prefers Kannada"
  confidence: number;
  mood?: string;
  tags?: string[];
  lastUsedTurn?: number;
  originTurn?: number;
  createdAt: number;
}

export interface ExtractedMemory {
  content: string;
  mood?: string;
  tags?: string[];
}


export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  relatedMemoryIds?: string[]; // IDs of memories used to generate this response
  reasoning?: string; // Explanation of why this response was chosen (transparency)
  feedback?: 'positive' | 'negative';
}

export interface ProcessingState {
  isListening: boolean;
  isExtractingMemory: boolean;
  isGeneratingResponse: boolean;
  isSpeaking: boolean;
  useThinking: boolean; // New flag for deep thinking mode
}