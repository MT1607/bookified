import { PLANS } from '../constants/subscriptions';
import { PlanType } from '@/type';

export const getUserPlan = (has: (params: any) => boolean): PlanType => {
  if (has({ entitlement: 'pro' })) return 'pro';
  if (has({ entitlement: 'standard' })) return 'standard';
  return 'free';
};

export const checkBookLimit = (currentBooksCount: number, plan: PlanType) => {
  const limit = PLANS[plan].books;
  return {
    allowed: currentBooksCount < limit,
    limit,
    currentCount: currentBooksCount,
  };
};

export const checkSessionLimit = (currentMonthSessionsCount: number, plan: PlanType) => {
  const limit = PLANS[plan].sessionsPerMonth;
  return {
    allowed: currentMonthSessionsCount < limit,
    limit,
    currentCount: currentMonthSessionsCount,
    maxDurationMinutes: PLANS[plan].sessionMinutes,
  };
};
