'use client';

import React from 'react';
import AnimatedDashboard from '@/components/AnimatedDashboard';

export default function DashboardPage() {
  const blockchainStatus = {
    base: {
      status: 'connected',
      network: 'Base Sepolia',
      balance: '1,245,000',
      latency: 45
    },
    solana: {
      status: 'connected',
      network: 'Devnet',
      balance: '780,500',
      latency: 32
    }
  };

  return <AnimatedDashboard blockchainStatus={blockchainStatus} />;
}