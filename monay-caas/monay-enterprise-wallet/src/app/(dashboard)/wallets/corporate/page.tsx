'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function CorporateWalletsPage() {
  useEffect(() => {
    redirect('/wallets/corporate/overview');
  }, []);

  return null;
}
