'use client';

import { startVoiceSession } from '@/lib/actions/session.action';
import { DEFAULT_VOICE, VOICE_SETTINGS } from '@/lib/contants';
import { IBook, Messages } from '@/type';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';
import { getVoice } from '@/lib/utils';

export type CallStatus =
  | 'idle'
  | 'connecting'
  | 'starting'
  | 'listening'
  | 'thinking'
  | 'speaking';

// ─── Constants ───────────────────────────────────────────────────────────────

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

let vapiInstance: InstanceType<typeof Vapi> | null = null;

function getVapi() {
  if (!vapiInstance) {
    if (!VAPI_API_KEY)
      throw new Error('NEXT_PUBLIC_VAPI_API_KEY is not defined');
    vapiInstance = new Vapi(VAPI_API_KEY);
  }
  return vapiInstance;
}

function appendMessage(
  prev: Messages[],
  role: string,
  content: string
): Messages[] {
  const last = prev[prev.length - 1];
  if (last?.role === role && last?.content === content) return prev;
  return [...prev, { role, content }];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const useVapi = (book: IBook) => {
  const { userId } = useAuth();

  const [status, setStatus] = useState<CallStatus>('idle');
  const [messages, setMessages] = useState<Messages[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentUserMessage, setCurrentUserMessage] = useState('');
  const [duration, setDuration] = useState(0);
  const [limitError, setLimitError] = useState<string | null>(null);

  const sessionIdRef = useRef<string | null>(null);
  const isStoppingRef = useRef(false);
  const bookRef = useLatestRef(book);

  const isActive =
    status === 'listening' ||
    status === 'thinking' ||
    status === 'speaking' ||
    status === 'starting';

  // ── Event listeners ──────────────────────────────────────────────────────

  useEffect(() => {
    const vapi = getVapi();

    const onCallStart = () => {
      setStatus('listening');
      isStoppingRef.current = false;
    };

    const onCallEnd = () => {
      setStatus('idle');
      sessionIdRef.current = null;
      isStoppingRef.current = false;
    };

    const onSpeechStart = () => setStatus('speaking');
    const onSpeechEnd = () => setStatus('listening');

    const onMessage = (msg: any) => {
      if (msg.type !== 'transcript') return;

      const { role, transcript, transcriptType } = msg;

      if (transcriptType === 'partial') {
        if (role === 'user') setCurrentUserMessage(transcript);
        if (role === 'assistant') setCurrentMessage(transcript);
        return;
      }

      if (transcriptType === 'final') {
        if (role === 'user') {
          setCurrentUserMessage('');
          setStatus('thinking');
          setMessages((prev) => appendMessage(prev, role, transcript));
        } else if (role === 'assistant') {
          setCurrentMessage('');
          setMessages((prev) => appendMessage(prev, role, transcript));
        }
      }
    };

    const onError = (error: any) => {
      console.error('Vapi Error:', JSON.stringify(error, null, 2));
      setStatus('idle');
      setLimitError(error?.message ?? 'An error occurred during the call.');
      isStoppingRef.current = false;
    };

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('message', onMessage);
    vapi.on('error', onError);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('message', onMessage);
      vapi.off('error', onError);
    };
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const start = async () => {
    if (!userId) return setLimitError('Please login to start');
    if (status === 'connecting') return;

    setLimitError(null);
    setStatus('connecting');

    try {
      const result = await startVoiceSession(userId, book._id);

      if (!result.success) {
        setLimitError(
          result.error ?? 'Session limit reached. Please upgrade your plan.'
        );
        setStatus('idle');
        return;
      }

      sessionIdRef.current = result.sessionId ?? null;

      const firstMessage =
        `Hey, good to meet you. Quick question before we dive in: ` +
        `have you actually read ${book.title} yet? Or are we starting fresh?`;

      await getVapi().start(ASSISTANT_ID || '', {
        firstMessage,
        variableValues: {
          title: book.title,
          author: book.author,
          bookId: book._id,
        },
      });
    } catch (error) {
      console.error('Error starting Vapi call:', error);
      setStatus('idle');
      setLimitError('Failed to start call. Please try again.');
    }
  };

  const stop = async () => {
    isStoppingRef.current = true;
    await getVapi().stop();
  };

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    status,
    isActive,
    messages,
    currentMessage,
    currentUserMessage,
    duration,
    limitError,
    start,
    stop,
  };
};

export default useVapi;
