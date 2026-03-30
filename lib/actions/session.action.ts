'use server';

import VoiceSession from '@/database/models/voice-session.model';
import { connectToDatabase } from '@/database/mongoose';
import { StartSessionResult } from '@/type';
import { auth } from '@clerk/nextjs/server';
import { getUserPlan, checkSessionLimit } from '../utils/subscription';
import { getCurrentBillingPeriodStart } from '../constants/subscriptions';

export const startVoiceSession = async (
  clerkId: string,
  bookId: string
): Promise<StartSessionResult> => {
  try {
    await connectToDatabase();

    const { has } = await auth();
    const userPlan = getUserPlan(has);
    const billingPeriodStart = getCurrentBillingPeriodStart();
    
    const existingSessionsCount = await VoiceSession.countDocuments({ 
      clerkId,
      billingPeriodStart: { $gte: billingPeriodStart }
    });
    
    const limitCheck = checkSessionLimit(existingSessionsCount, userPlan);

    if (!limitCheck.allowed) {
      return {
        success: false,
        error: `Session limit reached for your ${userPlan} plan. Please upgrade to start more sessions.`,
      };
    }

    const session = await VoiceSession.create({
      clerkId,
      bookId,
      startedAt: new Date(),
      billingPeriodStart,
      durationSeconds: 0,
    });

    return {
      success: true,
      sessionId: session._id.toString(),
      maxDurationMinutes: limitCheck.maxDurationMinutes,
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
