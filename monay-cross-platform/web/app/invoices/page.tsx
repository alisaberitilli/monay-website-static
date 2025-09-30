'use client';

import InvoiceInbox from '@/components/InvoiceInbox';
import DashboardLayout from '@/components/DashboardLayout';

export default function InvoicesPage() {
  return (
    <DashboardLayout>
      <InvoiceInbox />
    </DashboardLayout>
  );
}