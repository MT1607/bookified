'use client';
import { startVoiceSession } from '@/lib/actions/session.action';
import { DEFAULT_VOICE, VOICE_SETTINGS } from '@/lib/contants';
import { IBook, Messages } from '@/type';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';

import Vapi from '@vapi-ai/web';
import { title } from 'process';
import { getVoice } from '@/lib/utils';

export type CallStatus =
  | 'idle'
  | 'connecting'
  | 'starting'
  | 'listening'
  | 'thinking'
  | 'speaking';

const useLatestRef = <T>(value: T) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
};

const VAPI_API_KEY = process.env.NEXT_PUBLIC_VAPI_API_KEY;
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

let vapi: InstanceType<typeof Vapi> | null = null;
function getVapi() {
  if (!vapi) {
    if (!VAPI_API_KEY) {
      throw new Error('VAPI_API_KEY is not defined');
    }
    vapi = new Vapi(VAPI_API_KEY);
  }
  return vapi;
}

const useVapi = (book: IBook) => {
  const { userId } = useAuth();
  const [status, setStatus] = useState<CallStatus>('idle');
  const [message, setMassages] = useState<Messages[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [currentUserMessage, setCurrentUserMessage] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [limitError, setLimitError] = useState<string | null>(null);

  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const startTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const isStoppingRef = useRef<boolean>(false);

  const bookRef = useLatestRef(book);
  const durationRef = useLatestRef(duration);
  const voice = book.persona || DEFAULT_VOICE;

  useEffect(() => {
    const vapiInstance = getVapi();

    const onCallStart = () => {
      setStatus('listening');
      isStoppingRef.current = false;
    };

    const onCallEnd = () => {
      setStatus('idle');
      sessionIdRef.current = null;
      isStoppingRef.current = false;
    };

    const onSpeechStart = () => {
      setStatus('speaking');
    };

    const onSpeechEnd = () => {
      setStatus('listening');
    };

    const onMessage = (message: any) => {
      if (message.type === 'transcript') {
        if (message.transcriptType === 'partial') {
          if (message.role === 'user') {
            setCurrentUserMessage(message.transcript);
          } else if (message.role === 'assistant') {
            setCurrentMessage(message.transcript);
          }
        } else if (message.transcriptType === 'final') {
          if (message.role === 'user') {
            setCurrentUserMessage('');
            setStatus('thinking');
            setMassages((prev) => {
              const lastMsg = prev[prev.length - 1];
              if (
                lastMsg &&
                lastMsg.role === message.role &&
                lastMsg.content === message.transcript
              ) {
                return prev;
              }
              return [
                ...prev,
                { role: message.role, content: message.transcript },
              ];
            });
          } else if (message.role === 'assistant') {
            setCurrentMessage('');
            setMassages((prev) => {
              const lastMsg = prev[prev.length - 1];
              if (
                lastMsg &&
                lastMsg.role === message.role &&
                lastMsg.content === message.transcript
              ) {
                return prev;
              }
              return [
                ...prev,
                { role: message.role, content: message.transcript },
              ];
            });
          }
        }
      }
    };

    const onError = (error: any) => {
      console.error('Vapi Error:', error);
      setStatus('idle');
      setLimitError(error.message || 'An error occurred during the call.');
      isStoppingRef.current = false;
    };

    vapiInstance.on('call-start', onCallStart);
    vapiInstance.on('call-end', onCallEnd);
    vapiInstance.on('speech-start', onSpeechStart);
    vapiInstance.on('speech-end', onSpeechEnd);
    vapiInstance.on('message', onMessage);
    vapiInstance.on('error', onError);

    return () => {
      vapiInstance.off('call-start', onCallStart);
      vapiInstance.off('call-end', onCallEnd);
      vapiInstance.off('speech-start', onSpeechStart);
      vapiInstance.off('speech-end', onSpeechEnd);
      vapiInstance.off('message', onMessage);
      vapiInstance.off('error', onError);
    };
  }, []);

  //* Limits
  //const maxDurationRef = useLatestRef(limits.maxSessionMinutes * 60);
  //const maxDurationSeconds
  //const remainingMinutes
  //const remainingSeconds
  //const showTimeWarning

  const isActive =
    status === 'listening' ||
    status === 'thinking' ||
    status === 'speaking' ||
    status === 'starting';

  const start = async () => {
    console.log('is starting voice AI');
    if (!userId) return setLimitError('Please login to start');
    if (status === 'connecting') return;

    setLimitError(null);
    setStatus('connecting');
    console.log('is connecting voice AI');
    try {
      const result = await startVoiceSession(userId, book._id);

      if (!result.success) {
        setLimitError(
          result.error || 'Session limit reached. Please upgrade your plan'
        );
        setStatus('idle');
        return;
      }

      sessionIdRef.current = result.sessionId || null;
      const firstMessage = `Hey, good to meet you. Quick question, before we dive in: have you actualy read, ${book.title} yet? Or are we are starting fresh`;
      await getVapi().start(ASSISTANT_ID, {
        firstMessage,
        variableValues: {
          title: book.title,
          author: book.author,
          bookId: book._id,
        },
        // voice: {
        //   provider: '11labs',
        //   model: 'eleven_turbo_v2_5',
        //   voiceId: getVoice(voice).id,
        //   stability: VOICE_SETTINGS.stability,
        //   similarityBoost: VOICE_SETTINGS.similarityBoost,
        //   style: VOICE_SETTINGS.style,
        //   useSpeakerBoost: VOICE_SETTINGS.useSpeakerBoost,
        // },
      });
    } catch (error) {
      console.error('Error starting call AI: ', error);
      setStatus('idle');
      setLimitError('Failed to start call. Please try again.');
    }
  };

  const stop = async () => {
    console.log('stoping voice AI');
    console.log('is Active', isActive);

    isStoppingRef.current = true;
    await getVapi().stop();
  };

  const clearErrors = async () => {};

  return {
    status,
    isActive,
    message,
    currentMessage,
    currentUserMessage,
    duration,
    limitError,
    start,
    stop,
    clearErrors,
    // maxDurationSeconds,
    // remainingMinutes,
    // remainingSeconds,
    // showTimeWarning,
  };
};
export default useVapi;
