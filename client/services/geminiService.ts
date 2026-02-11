import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { Memory, ExtractedMemory} from '../types';


// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });

// --- MEMORY EXTRACTION ---

const memoryExtractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    memories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['preference', 'fact', 'constraint', 'general'] },
          content: { type: Type.STRING, description: "The concise fact or preference extracted." },
          confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1." }
        },
        required: ['type', 'content', 'confidence']
      }
    }
  }
};

export const extractMemoriesFromInput = async (
  userInput: string, 
  existingMemories: Memory[]
): Promise<ExtractedMemory[]> => {
  
  const memoryContext = existingMemories.map(m => `- ${m.content}`).join('\n');

  const systemPrompt = `
    You are the Memory Engine for EchoMind. Your job is to listen to the user and Extract PERMANENT or LONG-TERM information.
    
    Current Known Memories:
    ${memoryContext || "No prior memories."}

    Rules:
    1. Extract facts, preferences (likes/dislikes), constraints (time, location), or specific personal details.
    2. IGNORE casual chit-chat, greetings, or temporary questions (like "what's the weather").
    3. If the user updates a preference, extract the new one.
    4. Return an empty array if no significant memory is found.
    5. Be concise. e.g., "User prefers calls after 11 AM".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', // Use Flash Lite for fast extraction
      contents: userInput,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: memoryExtractionSchema,
        temperature: 0.1,
      }
    });

    const json = JSON.parse(response.text || '{ "memories": [] }');
    return json.memories || [];
  } catch (error) {
    console.error("Error extracting memories:", error);
    return [];
  }
};

// --- RESPONSE GENERATION ---

export const generateAssistantResponse = async (
  userInput: string,
  memories: Memory[],
  useThinking: boolean = false
): Promise<{ text: string; relevantMemoryIds: string[]; reasoning: string }> => {
  
  const formattedMemories = memories
    .map((m, idx) => `[ID: ${m.id}] ${m.content} (Type: ${m.type})`)
    .join('\n');

  const systemPrompt = `
    You are EchoMind, a helpful, memory-aware voice assistant.
    
    Your Goal: Answer the user's input naturally.
    
    CRITICAL INSTRUCTION:
    1. Use the provided Long-Term Memories to personalize the answer.
    2. If a memory dictates a language (e.g., "prefers Kannada"), REPLY IN THAT LANGUAGE.
    3. If a memory dictates a constraint (e.g., "no calls before 11"), acknowledge it if relevant to the request.
    4. Do NOT say "I found a memory...". Just act on it.
    5. If no memory is relevant, answer normally.

    Long-Term Memories Available:
    ${formattedMemories || "None."}
  `;

  // Schema for structured output
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      reply: { type: Type.STRING, description: "The natural language response to speak to the user." },
      usedMemoryIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of Memory IDs that influenced this response." },
      reasoning: { type: Type.STRING, description: "Brief explanation of why this response was chosen based on memories." }
    },
    required: ['reply', 'usedMemoryIds', 'reasoning']
  };

  try {
    // Select model based on thinking mode
    const modelName = useThinking ? 'gemini-3-pro-preview' : 'gemini-flash-lite-latest';
    
    const config: any = {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.7
    };

    // Add Thinking Config if enabled (Only available on Pro/Flash 2.5/3.0)
    if (useThinking) {
      config.thinkingConfig = { thinkingBudget: 32768 }; // Max budget for Gemini 3 Pro
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userInput,
      config: config
    });

    const json = JSON.parse(response.text || '{}');
    return {
      text: json.reply || "I'm sorry, I couldn't process that.",
      relevantMemoryIds: json.usedMemoryIds || [],
      reasoning: json.reasoning || "Standard response."
    };
  } catch (error) {
    console.error("Error generating response:", error);
    return {
      text: "I'm having trouble connecting to my brain right now.",
      relevantMemoryIds: [],
      reasoning: "Error in processing."
    };
  }
};

// --- SPEECH GENERATION (TTS) ---

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: { parts: [{ text }] },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      }
    });

    // Return base64 encoded string
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};