import React, { useState, useEffect, useRef } from "react";
import {
  Memory,
  Message,
  ProcessingState,
  ExtractedMemory
} from "./types";



import {
  extractMemoriesFromInput,
  generateAssistantResponse,
  generateSpeech,
} from "./services/geminiService";
import { MemoryCard } from "./components/MemoryCard";
import { VoiceIndicator } from "./components/VoiceIndicator";
import { api } from "./src/api/api";
import Auth from "./src/pages/Auth";
import { logout } from "./src/api/auth";


/* -------------------- Web Speech Types -------------------- */
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}



/* ======================== APP ======================== */
const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [activeMemoryIds, setActiveMemoryIds] = useState<string[]>([]);
  const [newMemoryId, setNewMemoryId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");

  const [isAuthed, setIsAuthed] = useState(
    Boolean(localStorage.getItem("token"))
  );




  const [state, setState] = useState<ProcessingState>({
    isListening: false,
    isExtractingMemory: false,
    isGeneratingResponse: false,
    isSpeaking: false,
    useThinking: false,
  });
  if (!isAuthed) {
    return <Auth onAuthSuccess={() => setIsAuthed(true)} />;
  }


  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* -------------------- Audio Context -------------------- */
  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContextRef.current;
  };

  /* -------------------- Load Memories -------------------- */
  useEffect(() => {
    api("/memories")
      .then(setMemories)
      .catch(() => setMemories([]));
  }, []);

  /* -------------------- Scroll Chat -------------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, state]);

  /* -------------------- Messages -------------------- */
  const addMessage = (
    role: "user" | "assistant",
    content: string,
    meta?: { relatedMemoryIds?: string[]; reasoning?: string }
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: Date.now(),
        relatedMemoryIds: meta?.relatedMemoryIds,
        reasoning: meta?.reasoning,
      },
    ]);
  };

  /* -------------------- Voice Input -------------------- */
  const handleVoiceInput = async () => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") await ctx.resume();

    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () =>
      setState((s) => ({ ...s, isListening: true }));

    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      processUserInput(text);
    };

    recognition.onend = () =>
      setState((s) => ({ ...s, isListening: false }));

    recognitionRef.current = recognition;
    recognition.start();
  };

  /* -------------------- Core Logic -------------------- */
  const processUserInput = async (text: string) => {
    addMessage("user", text);

    /* 1️⃣ Extract memories */
    setState((s) => ({ ...s, isExtractingMemory: true }));
    const extracted: ExtractedMemory[] =
      await extractMemoriesFromInput(text, memories);


    const savedMemories: Memory[] = [];

    for (const item of extracted) {
      const saved = await api("/memories", "POST", {
        content: item.content,
        mood: item.mood,
        tags: item.tags,
      });
      savedMemories.push(saved);
      setMemories((prev) => [saved, ...prev]);
      setNewMemoryId(saved._id);
    }

    setTimeout(() => setNewMemoryId(null), 3000);

    /* 2️⃣ Generate response */
    setState((s) => ({
      ...s,
      isExtractingMemory: false,
      isGeneratingResponse: true,
    }));

    const response = await generateAssistantResponse(
      text,
      [...savedMemories, ...memories],
      state.useThinking
    );

    setActiveMemoryIds(response.relevantMemoryIds);

    addMessage("assistant", response.text, {
      relatedMemoryIds: response.relevantMemoryIds,
      reasoning: response.reasoning,
    });

    /* 3️⃣ Speak */
    setState((s) => ({ ...s, isGeneratingResponse: false, isSpeaking: true }));
    const audio = await generateSpeech(response.text);
    if (audio) await playAudio(audio);

    setState((s) => ({ ...s, isSpeaking: false }));
    setActiveMemoryIds([]);
  };

  /* -------------------- Audio Playback -------------------- */
  const playAudio = async (base64: string) => {
    const ctx = getAudioContext();
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const pcm = new Int16Array(bytes.buffer);
    const floats = Float32Array.from(pcm, (v) => v / 32768);

    const buffer = ctx.createBuffer(1, floats.length, 24000);
    buffer.copyToChannel(floats, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    return new Promise<void>((res) => {
      source.onended = () => res();
      source.start();
    });
  };

  /* -------------------- Memory Ops -------------------- */
  const deleteMemory = async (id: string) => {
    await api(`/memories/${id}`, "DELETE");
    setMemories((prev) => prev.filter((m) => m._id !== id));
  };

  const clearMemory = async () => {
    if (!confirm("Clear all memories?")) return;
    for (const mem of memories) {
      await api(`/memories/${mem._id}`, "DELETE");
    }
    setMemories([]);
  };

  const toggleThinking = () =>
    setState((s) => ({ ...s, useThinking: !s.useThinking }));

  /* ======================== UI ======================== */
  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200">
      {/* CHAT */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto">
        <header className="p-6 border-b border-slate-800 flex justify-between">
          <h1 className="text-2xl font-bold text-indigo-400">EchoMind</h1>
          <button onClick={toggleThinking} className="text-xs">
            Deep Think: {state.useThinking ? "ON" : "OFF"}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "text-right" : ""}>
              <div className="inline-block bg-slate-800 p-3 rounded-xl">
                {m.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-center">
          <VoiceIndicator
            isActive={state.isListening}
            state={
              state.isListening
                ? "listening"
                : state.isSpeaking
                  ? "speaking"
                  : "idle"
            }
            onClick={handleVoiceInput}
          />
        </div>
      </div>

      {/* MEMORY PANEL */}
      <div className="w-80 border-l border-slate-800 p-4 hidden md:block">
        <div className="flex justify-between mb-4">
          <h2>Memory</h2>
          <button onClick={clearMemory} className="text-red-400 text-xs">
            Clear
          </button>
        </div>

        {memories.map((mem) => (
          <MemoryCard
            key={mem._id}
            memory={mem}
            highlight={activeMemoryIds.includes(mem._id)}
            isNew={newMemoryId === mem._id}
            onDelete={() => deleteMemory(mem._id)}
          />
        ))}
      </div>
    </div>

  );
};

export default App;
