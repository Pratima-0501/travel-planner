import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Bot, User, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'agent',
      text: 'Hanji main aapka ticket wala bhaiya bol rha hu. Bataiye, kahan jaana chahenge iss baar?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Connect to Express backend (proxied by Vite or direct via VITE_API_URL)
      const apiBase = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: data.reply || (data.error ? `⚠️ **${data.error}**` : 'No response returned.'),
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: '**Network Error:** Could not connect to agent backend on port 5001. Is the server running?',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#212121] text-gray-100 font-sans antialiased">
      {/* Top Header */}
      <header className="h-12 border-b border-[#2f2f2f] flex items-center justify-between px-6 bg-[#212121]/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-2 font-medium text-sm text-gray-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>TIcket Wale Bhaiya Official</span>
        </div>
        <button
          onClick={() => setMessages([])}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
          title="Clear Chat"
        >
          <Trash2 size={14} /> Clear
        </button>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'agent' && (
                <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Bot size={15} />
                </div>
              )}

              <div
                className={`max-w-[85%] text-[15px] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#2f2f2f] text-gray-100 px-4 py-2 rounded-2xl rounded-tr-sm'
                    : 'text-gray-200 space-y-2'
                }`}
              >
                <div className="prose prose-invert max-w-none text-[15px] prose-p:leading-relaxed prose-pre:bg-[#171717] prose-pre:border prose-pre:border-[#2f2f2f]">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <User size={15} />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3.5 items-center text-gray-400 text-sm">
              <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-white shrink-0">
                <Bot size={15} />
              </div>
              <div className="flex items-center gap-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce [animation-delay:0.2s]">●</span>
                <span className="animate-bounce [animation-delay:0.4s]">●</span>
                <span className="text-xs text-gray-500 ml-2">Orchestrating agents...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating ChatGPT Input Dock */}
      <footer className="w-full pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end bg-[#2f2f2f] rounded-2xl border border-transparent focus-within:border-gray-500 transition px-3 py-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the agents (e.g., Plan a 4-day trip to Tokyo with $2000 budget)..."
              rows={1}
              className="w-full bg-transparent text-gray-100 text-[15px] outline-none resize-none max-h-44 py-1 pr-10 placeholder-gray-400 leading-normal"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-3 bottom-2 p-1.5 rounded-xl bg-white text-black disabled:bg-[#424242] disabled:text-gray-500 transition disabled:cursor-not-allowed cursor-pointer"
            >
              <SendHorizontal size={16} />
            </button>
          </div>
          <p className="text-center text-[11px] text-gray-500 mt-2">
            Multi-agent system with real-time tools & memory.
          </p>
        </div>
      </footer>
    </div>
  );
}