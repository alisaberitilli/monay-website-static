'use client';

import React from 'react';
import AnimatedDashboard from '@/components/AnimatedDashboard';

export default function DashboardPage() {
  const blockchainStatus = {
    status: 'connected',
    network: 'Base',
    latency: 45
  };

  return <AnimatedDashboard blockchainStatus={blockchainStatus} />;
}