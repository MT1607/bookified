import { PlanType } from '@/type';

export const PLANS = {
  free: {
    name: 'Free',
    books: 1,
    sessionsPerMonth: 5,
    sessionMinutes: 5,
    history: false,
  },
  standard: {
    name: 'Standard',
    books: 10,
    sessionsPerMonth: 100,
    sessionMinutes: 15,
    history: true,
  },
  pro: {
    name: 'Pro',
    books: 100,
    sessionsPerMonth: 999999, // unlimited
    sessionMinutes: 60,
    history: true,
  },
} as const;

export const getCurrentBillingPeriodStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};
