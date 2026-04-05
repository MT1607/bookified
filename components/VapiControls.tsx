'use client';
import { IBook } from '@/type';
import Image from 'next/image';
import useVapi from '@/hooks/useVapi';
import Transcript from './Transcript';
import { Mic, MicOff } from 'lucide-react';

const VapiControls = ({ book }: { book: IBook }) => {
  const {
    status,
    isActive,
    start,
    stop,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    limitError,
  } = useVapi(book);
  return (
    <>
      <div className="vapi-main-container space-y-8">
        {/* Header Card */}
        <div className="vapi-header-card w-full">
          {/* Cover & Mic Button */}
          <div className="vapi-cover-wrapper">
            <Image
              src={
                book.coverURL || 'https://placehold.co/400x600?text=No+Cover'
              }
              alt={book.title}
              width={162}
              height={240}
              className="vapi-cover-image"
            />
            <div className="vapi-mic-wrapper">
              {isActive && (status === 'speaking' || status === 'thinking') && (
                <div className="vapi-pulse-ring"></div>
              )}
              <button
                onClick={isActive ? stop : start}
                disabled={status === 'connecting'}
                className={`vapi-mic-btn !h-[60px] !w-[60px] shadow-md ${
                  isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'
                }`}
              >
                {isActive ? (
                  <Mic className="size-7 text-[#212a3b]" />
                ) : (
                  <MicOff className="size-7 text-[#212a3b]" />
                )}
              </button>
            </div>
          </div>

          {/* Book Details */}
          <div className="flex flex-1 flex-col pl-2">
            <h1 className="book-title-lg">{book.title}</h1>
            <p className="subtitle mb-6">by {book.author}</p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="vapi-status-indicator">
                <span className="vapi-status-dot vapi-status-dot-ready"></span>
                <span className="vapi-status-text">Ready</span>
              </div>

              <div className="vapi-badge-ai">
                <span className="vapi-badge-ai-text">
                  Voice: {book.persona || 'Daniel'}
                </span>
              </div>

              <div className="vapi-badge-ai">
                <span className="vapi-badge-ai-text">0:00/15:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="vapi-transcript-wrapper">
          <div className="transcript-container min-h-[400px]">
            <Transcript
              messages={messages || []}
              currentMessage={currentMessage}
              currentUserMessage={currentUserMessage}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default VapiControls;
