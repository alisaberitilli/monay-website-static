'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Zap, TrendingDown } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface BillingInfo {
  tier: 'free' | 'small_business' | 'enterprise' | 'custom';
  current_amount_cents: number;
  next_billing_date: string;
  payment_method: 'USDXM' | 'USDC' | 'USDT' | null;
  discount_available: number;
  transaction_count: number;
  transaction_limit: number;
}

export default function SimpleBilling() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'USDXM' | 'USDC' | 'USDT'>('USDXM');

  useEffect(() => {
    loadBillingInfo();
  }, []);

  const loadBillingInfo = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/billing/my-account`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBilling(data);
      }
    } catch (error) {
      console.error('Failed to load billing info:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const makePayment = async () => {
    if (!billing) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/billing/pay`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount_cents: billing.current_amount_cents,
            payment_method: selectedMethod,
          }),
        }
      );

      if (response.ok) {
        alert('Payment successful!');
        setShowPayment(false);
        loadBillingInfo();
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
        <div className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (!billing) {
    return null;
  }

  const isFree = billing.tier === 'free';
  const hasUSDXM = billing.payment_method === 'USDXM';
  const discountAmount = Math.floor(billing.current_amount_cents * 0.1);
  const finalAmount = selectedMethod === 'USDXM' 
    ? billing.current_amount_cents - discountAmount 
    : billing.current_amount_cents;

  return (
    <div className="space-y-4">
      {/* Current Plan Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Plan</h2>
          <Badge className="capitalize">
            {billing.tier === 'free' ? 'Free' : billing.tier.replace('_', ' ')}
          </Badge>
        </div>

        {isFree ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-gray-900">$0</p>
              <p className="text-sm text-gray-600 mt-1">Forever free</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium mb-2">
                Upgrade to unlock:
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Unlimited transactions</li>
                <li>• Family sharing</li>
                <li>• Premium support</li>
                <li>• Save 10% with USDXM payments</li>
              </ul>
              <Button 
                size="sm" 
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                onClick={() => window.location.href = '/upgrade'}
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Amount due</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(billing.current_amount_cents)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Due date</p>
                <p className="text-sm font-medium">
                  {new Date(billing.next_billing_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Usage Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Transactions</span>
                <span className="text-sm font-medium">
                  {billing.transaction_count} / {billing.transaction_limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ 
                    width: `${Math.min(100, (billing.transaction_count / billing.transaction_limit) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Payment Button */}
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => setShowPayment(true)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay Now
            </Button>
          </div>
        )}
      </Card>

      {/* USDXM Promotion Card */}
      {!isFree && !hasUSDXM && (
        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-900">Save 10% Every Month!</h3>
              <p className="text-sm text-green-700 mt-1">
                Pay with USDXM (USD eXpress Monay) and automatically save{' '}
                <strong>{formatCurrency(discountAmount)}</strong> on your next bill.
              </p>
              <Button 
                size="sm" 
                variant="outline"
                className="mt-3 text-green-700 border-green-300 hover:bg-green-50"
                onClick={() => {
                  setSelectedMethod('USDXM');
                  setShowPayment(true);
                }}
              >
                <Zap className="w-4 h-4 mr-1" />
                Switch to USDXM
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Choose Payment Method</h3>
            
            <div className="space-y-3 mb-6">
              {/* USDXM Option */}
              <button
                onClick={() => setSelectedMethod('USDXM')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'USDXM' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">USDXM</span>
                  <Badge className="bg-green-100 text-green-700">Save 10%</Badge>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600">USD eXpress Monay</p>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    {formatCurrency(billing.current_amount_cents - discountAmount)}
                  </p>
                </div>
              </button>

              {/* USDC Option */}
              <button
                onClick={() => setSelectedMethod('USDC')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'USDC' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">USDC</span>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600">USD Coin</p>
                  <p className="text-lg font-bold mt-1">
                    {formatCurrency(billing.current_amount_cents)}
                  </p>
                </div>
              </button>

              {/* USDT Option */}
              <button
                onClick={() => setSelectedMethod('USDT')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === 'USDT' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">USDT</span>
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600">Tether USD</p>
                  <p className="text-lg font-bold mt-1">
                    {formatCurrency(billing.current_amount_cents)}
                  </p>
                </div>
              </button>
            </div>

            {selectedMethod === 'USDXM' && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ You\'re saving {formatCurrency(discountAmount)} with USDXM!
                </p>
              </div>
            )}

            <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(billing.current_amount_cents)}</span>
              </div>
              {selectedMethod === 'USDXM' && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>USDXM Discount (10%)</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Total</span>
                <span className="text-lg">{formatCurrency(finalAmount)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPayment(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={makePayment}
                className={`flex-1 ${
                  selectedMethod === 'USDXM' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Pay {formatCurrency(finalAmount)}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}