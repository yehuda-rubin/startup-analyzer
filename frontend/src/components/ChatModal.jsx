/**
 * ChatModal Component
 * Main chat interface for asking questions about analyses
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, AlertCircle, Loader2, Info } from 'lucide-react';
import { askQuestion, getChatHistory, getRemainingQuestions } from '../services/chatApi';
import ReactMarkdown from 'react-markdown';

const ChatModal = ({ isOpen, onClose, analysisId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remaining, setRemaining] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history and remaining questions on open
  useEffect(() => {
    if (isOpen && analysisId) {
      loadChatData();
    }
  }, [isOpen, analysisId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const loadChatData = async () => {
    try {
      setInitialLoading(true);
      
      // Load chat history
      const history = await getChatHistory(analysisId);
      setMessages(history.messages || []);
      
      // Load remaining questions
      const remainingData = await getRemainingQuestions(analysisId, userId);
      setRemaining(remainingData);
      
    } catch (err) {
      console.error('Failed to load chat data:', err);
      setError('לא הצלחנו לטעון את הנתונים. נסה שוב.');
    } finally {
      setInitialLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || loading) return;
    
    const question = input.trim();
    setInput('');
    setError(null);
    setLoading(true);

    // Add user message immediately
    const userMessage = {
      question,
      answer: null,
      created_at: new Date().toISOString(),
      isLoading: true
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send question to API
      const response = await askQuestion(analysisId, userId, question);
      
      // Replace loading message with actual response
      setMessages(prev => [
        ...prev.slice(0, -1),
        response
      ]);
      
      // Update remaining questions
      const remainingData = await getRemainingQuestions(analysisId, userId);
      setRemaining(remainingData);
      
    } catch (err) {
      console.error('Failed to send question:', err);
      
      // Remove loading message
      setMessages(prev => prev.slice(0, -1));
      
      // Handle quota exceeded
      if (err.type === 'quota_exceeded') {
        setError({
          type: 'quota',
          message: err.message,
          limit_type: err.limit_type,
          current: err.current,
          limit: err.limit,
          reset_at: err.reset_at,
          upgrade_cta: err.upgrade_cta
        });
      } else {
        setError({
          type: 'error',
          message: 'אירעה שגיאה בשליחת השאלה. נסה שוב.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter (but not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70]
                   w-[95vw] max-w-2xl h-[85vh] max-h-[700px]
                   bg-[#0A0A0A]/95 backdrop-blur-xl
                   border border-zinc-800 rounded-2xl
                   shadow-[0_0_60px_rgba(0,255,65,0.15)]
                   flex flex-col
                   animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00FF41]/10 rounded-full flex items-center justify-center">
              <Info size={20} className="text-[#00FF41]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">שאל על הניתוח</h2>
              <p className="text-sm text-zinc-400">
                ניתוח #{analysisId}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center
                       transition-colors text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Usage Counter */}
        {remaining && (
          <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800 text-xs">
            <div className="flex items-center gap-4 text-zinc-400">
              <span>
                לניתוח זה: 
                <span className="text-[#00FF41] font-mono mx-1">
                  {remaining.per_analysis.remaining || 0}
                </span>
                / {remaining.per_analysis.limit}
              </span>
              <span className="text-zinc-700">|</span>
              <span>
                היום: 
                <span className="text-[#00E5FF] font-mono mx-1">
                  {remaining.daily.remaining || 0}
                </span>
                / {remaining.daily.limit}
              </span>
              <span className="text-zinc-700">|</span>
              <span>
                החודש: 
                <span className="text-zinc-300 font-mono mx-1">
                  {remaining.monthly.remaining || 0}
                </span>
                / {remaining.monthly.limit}
              </span>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {initialLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center mb-4">
                <Info size={28} className="text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                התחל שיחה
              </h3>
              <p className="text-zinc-400 max-w-sm">
                שאל שאלות על הניתוח, הציונים, התובנות או כל מידע אחר מהמסמכים
              </p>
              <div className="mt-4 text-xs text-zinc-500">
                <p>דוגמאות לשאלות:</p>
                <ul className="mt-2 space-y-1 text-right">
                  <li>• למה ציון הצוות קיבל {'{ציון}'}?</li>
                  <li>• מה החולשות העיקריות של המיזם?</li>
                  <li>• איך אפשר לשפר את ה-Product-Market Fit?</li>
                </ul>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="space-y-3">
                {/* User Question */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-[#00FF41]/10 border border-[#00FF41]/20 
                                  rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-white text-sm leading-relaxed">
                      {msg.question}
                    </p>
                  </div>
                </div>
                
                {/* AI Answer */}
                {msg.isLoading ? (
                  <div className="flex gap-2 items-center text-zinc-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">מכין תשובה...</span>
                  </div>
                ) : msg.answer && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] bg-zinc-900/50 border border-zinc-800 
                                    rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="prose prose-invert prose-sm max-w-none
                                      prose-p:text-zinc-300 prose-p:leading-relaxed
                                      prose-headings:text-white prose-headings:font-semibold
                                      prose-li:text-zinc-300
                                      prose-strong:text-[#00FF41]">
                        <ReactMarkdown>{msg.answer}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          
          {/* Error Display */}
          {error && (
            <div className={`p-4 rounded-xl border ${
              error.type === 'quota' 
                ? 'bg-orange-500/10 border-orange-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-start gap-3">
                <AlertCircle 
                  size={20} 
                  className={error.type === 'quota' ? 'text-orange-400' : 'text-red-400'} 
                />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-1">
                    {error.message}
                  </p>
                  {error.type === 'quota' && error.upgrade_cta && (
                    <p className="text-xs text-zinc-400 mt-2">
                      {error.upgrade_cta}
                    </p>
                  )}
                  {error.reset_at && (
                    <p className="text-xs text-zinc-500 mt-1">
                      איפוס: {new Date(error.reset_at).toLocaleString('he-IL')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-800">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="שאל שאלה..."
              disabled={loading}
              className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3
                         text-white placeholder-zinc-500 text-sm
                         focus:outline-none focus:border-[#00FF41]/50 focus:bg-zinc-900
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all"
              maxLength={1000}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-12 h-12 bg-[#00FF41] hover:bg-[#00E5FF] disabled:bg-zinc-800
                         disabled:cursor-not-allowed
                         rounded-xl flex items-center justify-center
                         transition-all duration-200 hover:scale-105 active:scale-95
                         shadow-[0_0_20px_rgba(0,255,65,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)]"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 text-black animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-black" />
              )}
            </button>
          </form>
          
          <p className="text-xs text-zinc-500 mt-2 text-center">
            לחץ Enter לשליחה • Shift+Enter לשורה חדשה
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default ChatModal;