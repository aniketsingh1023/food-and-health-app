'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { sendChatMessage } from '@/services/chatService';
import { getRecentFoodLog, getDailyGoals } from '@/lib/storage';
import { sumMacros } from '@/lib/nutritionCalc';
import type { ChatMessage, ChatContext } from '@/types';

const QUICK_CHIPS = [
  'How am I doing on protein today?',
  'What should I eat for dinner?',
  'How many calories do I have left?',
  'Suggest a high-protein snack',
  'Am I eating enough fibre?',
  'What are good pre-workout foods?',
];

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3" aria-label="Assistant is typing">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center shrink-0 mr-2 mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z"/>
            <path d="M12 8v4l3 3"/>
          </svg>
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-green-600 text-white rounded-br-sm'
            : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
        }`}
        style={isUser ? {} : { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your NutriAI coach. Ask me anything about your nutrition, meal ideas, or how you're tracking today.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  function buildContext(): ChatContext {
    const entries = getRecentFoodLog(1);
    const goals = getDailyGoals();
    const consumed = sumMacros(entries);
    const recentMeals = getRecentFoodLog(3).map(e => e.description);
    return { consumed, goals, recentMeals };
  }

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    setError(null);
    setInput('');

    const userMsg: ChatMessage = {
      id: newId(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const assistantId = newId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg];
    setMessages([...nextMessages, assistantMsg]);
    setIsStreaming(true);

    try {
      await sendChatMessage(nextMessages, buildContext(), chunk => {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection error. Try again.');
      // Remove the empty assistant message on failure
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [messages, isStreaming]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <main className="flex flex-col flex-1 max-w-2xl mx-auto w-full h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">NutriAI Coach</p>
            <p className="text-xs text-green-600 font-medium">Online · Powered by Gemini</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{ paddingBottom: '1rem' }}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center shrink-0 mr-2 mt-0.5" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 0 1 10 10c0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2z"/>
                <path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <TypingDots />
            </div>
          </div>
        )}
        {error && (
          <p className="text-xs text-red-500 text-center" role="alert">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips — shown only at start */}
      {messages.length <= 2 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Suggested</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip}
                type="button"
                onClick={() => send(chip)}
                disabled={isStreaming}
                className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white text-slate-600 font-medium
                  hover:border-green-400 hover:text-green-700 transition-colors outline-none
                  focus-visible:ring-2 focus-visible:ring-green-600 disabled:opacity-40"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div
        className="px-4 py-3 bg-white border-t border-slate-100 pb-safe"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your nutrition…"
            rows={1}
            disabled={isStreaming}
            aria-label="Chat message"
            className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-700
              placeholder:text-slate-300 outline-none focus:border-green-500 transition-colors resize-none
              disabled:opacity-50"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
          <button
            type="button"
            onClick={() => send(input)}
            disabled={isStreaming || !input.trim()}
            aria-label="Send message"
            className="w-10 h-10 rounded-2xl bg-green-600 flex items-center justify-center shrink-0
              hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors
              outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-slate-300 text-center mt-1.5">Enter to send · Shift+Enter for new line</p>
      </div>
    </main>
  );
}
