'use client';

import P2PRequestToPay from '@/components/P2PRequestToPay';
import DashboardLayout from '@/components/DashboardLayout';

export default function P2PRequestsPage() {
  return (
    <DashboardLayout>
      <P2PRequestToPay />
    </DashboardLayout>
  );
}