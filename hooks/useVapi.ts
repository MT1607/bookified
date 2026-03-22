import { DEFAULT_VOICE } from '@/lib/contants';
import { IBook, Messages } from '@/type';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef, useState } from 'react';

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
    'starting';

  const start = async () => {};
  const stop = async () => {};
  const clearError = async () => {};

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
    clearError,
    // maxDurationSeconds,
    // remainingMinutes,
    // remainingSeconds,
    // showTimeWarning,
  };
};
export default useVapi;
