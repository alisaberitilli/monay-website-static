'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  ArrowRight,
  Plus,
  Check,
  Info,
  Shield,
  Clock,
  DollarSign,
  ChevronRight,
  QrCode,
  Link2,
  Banknote,
  TrendingUp
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'upi' | 'wallet';
  name: string;
  description: string;
  icon: any;
  isRecommended?: boolean;
  fee?: string;
  processingTime?: string;
}

export default function AddMoneyPage() {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>('1'); // Default to first card
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [savedCards, setSavedCards] = useState([
    { id: '1', last4: '8912', brand: 'Visa', isDefault: true },
    { id: '2', last4: '3456', brand: 'Mastercard', isDefault: false }
  ]);

  const quickAmounts = ['100', '250', '500', '1000', '2500', '5000'];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      type: 'card',
      name: 'Debit/Credit Card',
      description: 'Add money using your card',
      icon: CreditCard,
      isRecommended: true,
      fee: 'No fees',
      processingTime: 'Instant'
    },
    {
      id: 'bank',
      type: 'bank',
      name: 'Bank Transfer',
      description: 'Direct transfer from your bank',
      icon: Building2,
      fee: 'No fees',
      processingTime: '1-2 business days'
    },
    {
      id: 'upi',
      type: 'upi',
      name: 'UPI',
      description: 'Transfer via UPI ID',
      icon: Smartphone,
      fee: 'No fees',
      processingTime: 'Instant'
    },
    {
      id: 'wallet',
      type: 'wallet',
      name: 'Digital Wallet',
      description: 'PayPal, Google Pay, Apple Pay',
      icon: Wallet,
      fee: '2.9% + $0.30',
      processingTime: 'Instant'
    }
  ];

  const recentTransfers = [
    { id: '1', amount: 500, date: '2 days ago', method: 'Card ending 8912', status: 'completed' },
    { id: '2', amount: 1000, date: '5 days ago', method: 'Bank Transfer', status: 'completed' },
    { id: '3', amount: 250, date: '1 week ago', method: 'UPI', status: 'completed' },
  ];

  const handleAddMoney = async () => {
    if (!amount || !selectedMethod || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount and select a payment method');
      return;
    }

    // If card payment is selected but no card is chosen
    if (selectedMethod.type === 'card' && !selectedCard) {
      alert('Please select a card for payment');
      return;
    }

    setShowConfirmation(true);

    try {
      // Call the API to process payment
      const response = await fetch('/api/payments/add-money', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethodId: selectedMethod.id,
          cardDetails: selectedMethod.type === 'card' && selectedCard ? {
            cardId: selectedCard,
            last4: savedCards.find(c => c.id === selectedCard)?.last4,
            brand: savedCards.find(c => c.id === selectedCard)?.brand
          } : undefined,
          userId: 'user123' // This should come from auth context
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Success - show success message
        alert(`Successfully added $${amount} to your wallet! New balance: $${data.newBalance?.toFixed(2) || amount}`);
        
        // Reset form
        setAmount('');
        setSelectedMethod(null);
        setSelectedCard(null);
        
        // Redirect back to dashboard to see updated balance
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        // Error handling
        const errorMessage = data.details || data.message || 'Payment failed. Please try again.';
        alert(`Error: ${errorMessage}`);
        
        if (data.error?.includes('not configured')) {
          console.log('TilliPay API not configured. Please add your API credentials to .env.local file');
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred while processing your payment. Please try again.');
    } finally {
      setShowConfirmation(false);
    }
  };

  const formatAmount = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9.]/g, '');
    return numericValue;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Money</h1>
            <p className="text-gray-600 mt-2">Top up your wallet balance</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 text-white">
            <p className="text-sm text-white/80 mb-1">Current Balance</p>
            <p className="text-2xl font-bold">$12,450.75</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amount Input */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Enter Amount</h3>
              
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-3xl font-bold text-gray-400">$</span>
                <input
                  type="text"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(formatAmount(e.target.value))}
                  className="w-full pl-12 pr-4 py-6 text-3xl font-bold bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-3">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount)}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      amount === quickAmount
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ${quickAmount}
                  </button>
                ))}
              </div>

              {/* Fee Information */}
              {amount && parseFloat(amount) > 0 && (
                <div className="mt-6 p-4 bg-purple-50 rounded-2xl">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-purple-900">Transaction Summary</p>
                      <div className="mt-2 space-y-1 text-purple-700">
                        <div className="flex justify-between">
                          <span>Amount to add:</span>
                          <span className="font-medium">${amount}</span>
                        </div>
                        {selectedMethod?.fee && selectedMethod.fee !== 'No fees' && (
                          <div className="flex justify-between">
                            <span>Processing fee:</span>
                            <span className="font-medium">{selectedMethod.fee}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-purple-200">
                          <span className="font-medium">Total:</span>
                          <span className="font-bold">${amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Payment Method</h3>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedMethod?.id === method.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            selectedMethod?.id === method.id
                              ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                              : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              selectedMethod?.id === method.id ? 'text-white' : 'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900">{method.name}</p>
                              {method.isRecommended && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{method.description}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {method.processingTime}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {method.fee}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedMethod?.id === method.id
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedMethod?.id === method.id && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>

                      {/* Show saved cards for card payment */}
                      {method.type === 'card' && selectedMethod?.id === method.id && (
                        <div className="mt-4 pl-16 space-y-2">
                          {savedCards.map((card) => (
                            <div 
                              key={card.id} 
                              onClick={() => setSelectedCard(card.id)}
                              className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                                selectedCard === card.id 
                                  ? 'bg-purple-100 border-2 border-purple-500' 
                                  : 'bg-white border-2 border-transparent hover:border-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <CreditCard className={`h-4 w-4 ${
                                  selectedCard === card.id ? 'text-purple-600' : 'text-gray-600'
                                }`} />
                                <span className={`text-sm font-medium ${
                                  selectedCard === card.id ? 'text-purple-900' : 'text-gray-900'
                                }`}>
                                  {card.brand} ending {card.last4}
                                </span>
                                {card.isDefault && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                selectedCard === card.id 
                                  ? 'border-purple-500 bg-purple-500' 
                                  : 'border-gray-300'
                              }`}>
                                {selectedCard === card.id && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                            </div>
                          ))}
                          <button className="w-full p-3 bg-purple-50 text-purple-700 rounded-xl font-medium flex items-center justify-center hover:bg-purple-100 transition-colors">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Card
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Money Button */}
            <button
              onClick={handleAddMoney}
              disabled={!amount || !selectedMethod || parseFloat(amount) <= 0}
              className={`w-full py-4 rounded-2xl font-medium transition-all flex items-center justify-center ${
                amount && selectedMethod && parseFloat(amount) > 0
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {showConfirmation ? (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Add ${amount || '0.00'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Security Info */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Secure Transaction</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Your payment information is encrypted and secure. We use industry-standard security measures.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">256-bit SSL encryption</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">PCI DSS compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">3D Secure authentication</span>
                </div>
              </div>
            </div>

            {/* Recent Transfers */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Top-ups</h3>
              <div className="space-y-3">
                {recentTransfers.map((transfer) => (
                  <div key={transfer.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">+${transfer.amount}</p>
                      <p className="text-sm text-gray-500">{transfer.date} • {transfer.method}</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {transfer.status}
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-purple-600 font-medium text-sm">
                View All History
              </button>
            </div>

            {/* Promo Section */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-3">
                <TrendingUp className="h-6 w-6" />
                <h3 className="text-lg font-semibold">Get 2% Bonus!</h3>
              </div>
              <p className="text-sm text-white/90 mb-4">
                Add $500 or more and get 2% bonus credited instantly to your wallet.
              </p>
              <button className="w-full py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium hover:bg-white/30 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}