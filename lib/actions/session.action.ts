'use server';

import VoiceSession from '@/database/models/voice-session.model';
import { connectToDatabase } from '@/database/mongoose';
import { StartSessionResult } from '@/type';
import { getCurrentBillingPeriodStart } from '../subcriptions-contants';

export const startVoiceSession = async (
  clerkId: string,
  bookId: string
): Promise<StartSessionResult> => {
  try {
    await connectToDatabase();

    // Limits/Plan to see whether a session is allowed
    const session = await VoiceSession.create({
      clerkId,
      bookId,
      startedAt: new Date(),
      billingPeriodStart: getCurrentBillingPeriodStart(),
      durationSeconds: 0,
    });

    return {
      success: true,
      sessionId: session._id.toString(),
    };
  } catch (error) {
    console.error('Error starting voice session: ', error);
    return {
      success: false,
      error: 'Failed to start voice session',
    };
  }
};

export const endVoiceSession = async (
  sessionId: string,
  durationSeconds: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    await connectToDatabase();

    const result = await VoiceSession.findByIdAndUpdate(sessionId, {
      endedAt: new Date(),
      durationSeconds,
    });

    if (!result) return { success: false, error: 'Voice Session not found' };
    return { success: true };
  } catch (error) {
    console.error('Error ending voice session: ', error);
    return {
      success: false,
      error: 'Failed to end voice session',
    };
  }
};
