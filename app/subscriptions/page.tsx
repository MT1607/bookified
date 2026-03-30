'use client';

import React from 'react';
import { PricingTable } from '@clerk/nextjs';

export default function SubscriptionsPage() {
  return (
    <main className="min-h-screen bg-[#f8f4e9] px-5 pt-28 pb-16 font-sans text-[#212a3b]">
      <div className="mx-auto flex max-w-[1050px] flex-col items-center">
        {/* Header Text */}
        <div className="mb-14 text-center">
          <h1 className="mb-4 font-serif text-[40px] leading-tight font-bold text-[#212a3b] md:text-[44px]">
            Choose Your Plan
          </h1>
          <p className="text-[17px] font-medium tracking-tight text-[#555]">
            Upgrade to unlock more books, longer sessions, and advanced
            features.
          </p>
        </div>

        {/* Pricing Cards Container replaced by Clerk PricingTable */}
        <div className="w-full">
          <PricingTable
            appearance={{
              variables: {
                colorPrimary: '#363a45',
                colorText: '#212a3b',
                colorTextSecondary: '#777',
                colorBackground: '#ffffff',
                fontFamily: 'inherit',
                borderRadius: '18px',
              },
              elements: {
                pricingCard: 'shadow-[0_8px_30px_0px_rgba(0,0,0,0.04)] border border-gray-100',
                primaryButton: 'hover:bg-[#212a3b] transition-colors shadow-sm',
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
