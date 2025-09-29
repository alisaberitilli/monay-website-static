'use client';

import { useState } from 'react';
import { 
  Plus, 
  Lock, 
  Settings, 
  Receipt, 
  PlusCircle,
  Eye,
  EyeOff
} from 'lucide-react';

interface Card {
  id: string;
  type: 'debit' | 'credit' | 'virtual';
  cardNumber: string;
  expiryDate: string;
  holderName: string;
  balance?: number;
  creditLimit?: number;
  isActive: boolean;
  gradient: string;
}

export default function CardsPage() {
  const [showCardNumbers, setShowCardNumbers] = useState<{[key: string]: boolean}>({});

  // Mock data - replace with real data from API
  const cards: Card[] = [
    {
      id: '1',
      type: 'debit',
      cardNumber: '4532 1234 5678 9012',
      expiryDate: '12/26',
      holderName: 'John Doe',
      balance: 2547.83,
      isActive: true,
      gradient: 'from-blue-600 to-purple-700',
    },
    {
      id: '2',
      type: 'credit',
      cardNumber: '5678 9012 3456 7890',
      expiryDate: '09/27',
      holderName: 'John Doe',
      creditLimit: 5000,
      balance: 1250.45,
      isActive: true,
      gradient: 'from-pink-500 to-red-600',
    },
    {
      id: '3',
      type: 'virtual',
      cardNumber: '9012 3456 7890 1234',
      expiryDate: '03/25',
      holderName: 'John Doe',
      balance: 500.00,
      isActive: false,
      gradient: 'from-cyan-500 to-blue-500',
    },
  ];

  const toggleCardNumber = (cardId: string) => {
    setShowCardNumbers(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const maskCardNumber = (cardNumber: string, show: boolean) => {
    if (show) return cardNumber;
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
  };

  const cardActions = [
    {
      icon: Lock,
      title: 'Block/Unblock Card',
      subtitle: 'Temporarily disable your card',
      action: () => alert('Block/Unblock functionality coming soon'),
    },
    {
      icon: Settings,
      title: 'Card Settings',
      subtitle: 'Change PIN, limits, and preferences',
      action: () => alert('Card settings coming soon'),
    },
    {
      icon: Receipt,
      title: 'Transaction History',
      subtitle: 'View all card transactions',
      action: () => alert('Transaction history coming soon'),
    },
    {
      icon: PlusCircle,
      title: 'Request New Card',
      subtitle: 'Order a replacement or additional card',
      action: () => alert('New card request coming soon'),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Cards</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
          <Plus className="h-4 w-4" />
          <span>Add Card</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.id} className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 text-white relative overflow-hidden`}>
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm font-semibold opacity-90 capitalize">
                {card.type} Card
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${card.isActive ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-xs opacity-90">
                  {card.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Card Number */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-lg font-mono tracking-wider">
                  {maskCardNumber(card.cardNumber, showCardNumbers[card.id])}
                </div>
                <button
                  onClick={() => toggleCardNumber(card.id)}
                  className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  {showCardNumbers[card.id] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Card Details */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs opacity-70 mb-1">Card Holder</div>
                <div className="text-sm font-semibold">{card.holderName}</div>
              </div>
              <div>
                <div className="text-xs opacity-70 mb-1">Expires</div>
                <div className="text-sm font-semibold">{card.expiryDate}</div>
              </div>
            </div>

            {/* Balance/Credit */}
            <div className="mt-4 pt-4 border-t border-white/20">
              {card.type === 'credit' ? (
                <div>
                  <div className="text-xs opacity-70 mb-1">Available Credit</div>
                  <div className="text-xl font-bold">
                    ${(card.creditLimit! - card.balance!).toFixed(2)}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    Used: ${card.balance?.toFixed(2)} / ${card.creditLimit?.toFixed(2)}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs opacity-70 mb-1">Balance</div>
                  <div className="text-xl font-bold">${card.balance?.toFixed(2)}</div>
                </div>
              )}
            </div>

            {/* Card Brand Logo */}
            <div className="absolute top-4 right-4 w-12 h-8 bg-white/20 rounded flex items-center justify-center">
              <div className="text-xs font-bold opacity-80">VISA</div>
            </div>
          </div>
        ))}
      </div>

      {/* Card Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Card Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cardActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <action.icon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{action.title}</div>
                <div className="text-xs text-gray-500 mt-1">{action.subtitle}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Card Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Total Balance</div>
              <div className="text-2xl font-bold text-gray-900">
                ${cards.reduce((sum, card) => sum + (card.balance || 0), 0).toFixed(2)}
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Receipt className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Active Cards</div>
              <div className="text-2xl font-bold text-gray-900">
                {cards.filter(card => card.isActive).length}
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500">Credit Available</div>
              <div className="text-2xl font-bold text-gray-900">
                ${cards
                  .filter(card => card.type === 'credit')
                  .reduce((sum, card) => sum + ((card.creditLimit || 0) - (card.balance || 0)), 0)
                  .toFixed(2)}
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <PlusCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}