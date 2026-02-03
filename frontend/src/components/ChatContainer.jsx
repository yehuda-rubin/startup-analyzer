/**
 * ChatContainer Component
 * Wrapper that manages chat state and combines FAB + Modal
 * Use this component on any page where you want chat functionality
 */

import React, { useState } from 'react';
import ChatFAB from './ChatFAB';
import ChatModal from './ChatModal';
import { useAuth } from '../context/AuthContext';

const ChatContainer = ({ analysisId }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { currentUser } = useAuth();

  if (!analysisId || !currentUser) {
    return null;
  }

  return (
    <>
      <ChatFAB 
        onClick={() => setIsChatOpen(true)} 
      />
      
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        analysisId={analysisId}
        userId={currentUser.uid}
      />
    </>
  );
};

export default ChatContainer;