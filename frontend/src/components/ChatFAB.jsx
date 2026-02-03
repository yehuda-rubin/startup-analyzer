/**
 * ChatFAB Component
 * Floating Action Button for opening the chat interface
 */

import React from 'react';
import { MessageCircleQuestion } from 'lucide-react';

const ChatFAB = ({ onClick, hasUnreadMessages = false }) => {
  return (
    <button
      onClick={onClick}
      className="group fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#00FF41] hover:bg-[#00E5FF] 
                 rounded-full shadow-[0_0_30px_rgba(0,255,65,0.4)] hover:shadow-[0_0_40px_rgba(0,229,255,0.5)]
                 transition-all duration-300 hover:scale-110 active:scale-95
                 flex items-center justify-center
                 border-2 border-[#00FF41]/20 hover:border-[#00E5FF]/30"
      aria-label="פתח צ'אט"
    >
      {/* Pulse Animation Ring */}
      <div className="absolute inset-0 rounded-full bg-[#00FF41] opacity-75 
                      animate-ping pointer-events-none" 
           style={{ animationDuration: '2s' }} />
      
      {/* Icon */}
      <MessageCircleQuestion 
        size={28} 
        className="text-black relative z-10 transition-transform duration-300 
                   group-hover:rotate-12" 
        strokeWidth={2.5}
      />
      
      {/* Unread Indicator (optional) */}
      {hasUnreadMessages && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full 
                        border-2 border-black animate-pulse z-20" />
      )}
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00FF41] to-[#00E5FF] 
                      opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl" />
    </button>
  );
};

export default ChatFAB;