import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Sparkles, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { askCivixAiAssistant } from '../gemini';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  "delay in garbage collection",
  "How do I report a heavy water leakage in my street?",
  "heavy traffic jam on main road signal",
  "What department handles broken street lights?"
];

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am CIVIX AI, your official intelligent assistant for smart city governance and public civic inquiries. How can I assist you with municipal services, public infrastructure, roads, water, power, education, or health today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const processQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await askCivixAiAssistant(queryText.trim());
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.warn('AI Assistant error:', error);
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Thank you for reaching out to CIVIX AI. Please submit your complaint via "+ Report Issue" in the navigation bar for instant automated field dispatch and earn +10 Civic Coins!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await processQuery(input);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 p-4 rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center border border-emerald-400/30"
          title="Open CIVIX AI Assistant"
        >
          <Bot className="w-7 h-7 text-slate-950 font-bold" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
        </button>
      </div>

      {/* Copilot Drawer Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[560px]"
          >
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-inner">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <span>CIVIX AI Assistant</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Smart City Governance & Inquiries</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-slate-950/50">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                    msg.sender === 'user' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-emerald-400 border border-slate-700'
                  }`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className={`block text-[9px] text-right mt-1.5 opacity-75 ${msg.sender === 'user' ? 'text-slate-950 font-bold' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs pl-2 bg-slate-900/40 p-2 rounded-xl border border-slate-800/60 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span className="font-medium">CIVIX AI is analyzing query...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Chips */}
            <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800/60 overflow-x-auto custom-scrollbar flex gap-1.5 shrink-0">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => processQuery(q)}
                  disabled={loading}
                  className="whitespace-nowrap text-[10px] bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-emerald-500/40 px-2.5 py-1 rounded-full transition-all shrink-0 font-medium disabled:opacity-50"
                >
                  "{q}"
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about garbage, water leaks, street lights, traffic..."
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-2.5 rounded-xl font-bold transition-all disabled:opacity-40 flex items-center justify-center shadow-md shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
