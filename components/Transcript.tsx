'use client';
import React, { useEffect, useRef } from 'react';
import { Messages } from '@/type';
import { Mic } from 'lucide-react';

interface TranscriptProps {
  messages: Messages[];
  currentMessage: string;
  currentUserMessage: string;
}

const Transcript = ({
  messages,
  currentMessage,
  currentUserMessage,
}: TranscriptProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, currentMessage, currentUserMessage]);

  const isEmpty =
    messages.length === 0 && !currentMessage && !currentUserMessage;

  if (isEmpty) {
    return (
      <div className="transcript-empty">
        <Mic className="size-12 text-[#212a3b] mb-4" />
        <h2 className="transcript-empty-text">
          <b>No conversation yet</b>
        </h2>
        <p className="transcript-empty-hint">
          Click the mic button above to start talking
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="transcript-messages overflow-y-auto pr-2 flex-1"
    >
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`transcript-message ${
            msg.role === 'user'
              ? 'transcript-message-user'
              : 'transcript-message-assistant'
          }`}
        >
          <div
            className={`transcript-bubble ${
              msg.role === 'user'
                ? 'transcript-bubble-user'
                : 'transcript-bubble-assistant'
            }`}
          >
            {msg.content}
          </div>
        </div>
      ))}

      {currentUserMessage && (
        <div className="transcript-message transcript-message-user">
          <div className="transcript-bubble transcript-bubble-user">
            {currentUserMessage}
            <span className="transcript-cursor"></span>
          </div>
        </div>
      )}

      {currentMessage && (
        <div className="transcript-message transcript-message-assistant">
          <div className="transcript-bubble transcript-bubble-assistant">
            {currentMessage}
            <span className="transcript-cursor"></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transcript;
