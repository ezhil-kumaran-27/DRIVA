import React, { useState } from 'react';
import { api } from '../services/api';
import { Sparkles, X, Send, Bot, User, Database, AlertCircle, ArrowRight } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isFallback?: boolean;
  modelUsed?: string;
  timestamp: string;
}

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRequestId?: number;
}

const PRESET_QUESTIONS = [
  "Why did DRIVA choose this agency?",
  "Which option is cheapest?",
  "Which option is fastest?",
  "Why wasn't the EV selected?",
  "What will save me more money?"
];

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  activeRequestId
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your DRIVA AI Transportation Assistant. I analyze verified backend freight data, quotes, and provider scorecards to answer your dispatch questions. Ask anything about your options or select a quick query below.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const res = await api.askAssistant(q, activeRequestId);
      const assistantMsg: Message = {
        role: 'assistant',
        content: res.answer,
        isFallback: res.is_fallback,
        modelUsed: res.model_used,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "AI explanation temporarily unavailable. Real-time carrier data could not be retrieved at this moment.",
          isFallback: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">DRIVA Transportation Assistant</h3>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-400/30">
                  Groq LLM
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Grounded in Live Backend Database & Models</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Data Grounding Banner */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-[11px] text-slate-600 flex items-center space-x-2">
          <Database className="w-3.5 h-3.5 text-sky-600 flex-shrink-0" />
          <span>Strict fact verification: Uses verified PostgreSQL rate matrices & ML predictions.</span>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-slate-900 text-sky-400 flex items-center justify-center flex-shrink-0 text-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-black/5 text-[10px] opacity-75">
                  <span>{m.timestamp}</span>
                  {m.modelUsed && (
                    <span className="italic ml-2 font-mono">
                      {m.modelUsed}
                    </span>
                  )}
                </div>
              </div>
              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-sky-400 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 rounded-xl p-3.5 text-xs text-slate-500 rounded-tl-none border border-slate-200 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-sky-600 animate-ping"></div>
                <span>Retrieving backend facts & generating Groq answer...</span>
              </div>
            </div>
          )}
        </div>

        {/* Preset Question Pills */}
        <div className="p-3 bg-slate-50 border-t border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
            Suggested Business Questions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="text-[11px] px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-700 rounded-full border border-slate-200 font-medium transition cursor-pointer disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask DRIVA about rates, transit times, EVs..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
