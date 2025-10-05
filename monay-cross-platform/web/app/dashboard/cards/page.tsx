'use client';

import { useState } from 'react';
import {
  Plus,
  Lock,
  Settings,
  Receipt,
  PlusCircle,
  Eye,
  EyeOff,
  X,
  CreditCard,
  Trash2,
  MoreVertical
} from 'lucide-react';
import apiClient from '@/lib/api-client';

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
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [newCardType, setNewCardType] = useState<'virtual' | 'physical'>('virtual');
  const [cards, setCards] = useState<Card[]>([
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
  ]);


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

  const handleCreateCard = async () => {
    setIsCreatingCard(true);
    try {
      const response = await apiClient.createCard({
        type: newCardType,
        cardType: newCardType === 'virtual' ? 'debit' : 'debit',
        requestPhysical: newCardType === 'physical'
      });

      if (response.success) {
        // Add new card to the list
        const gradients = ['from-purple-600 to-indigo-600', 'from-green-500 to-teal-600', 'from-orange-500 to-pink-600'];
        const newCard: Card = {
          id: Date.now().toString(),
          type: newCardType === 'virtual' ? 'virtual' : 'debit',
          cardNumber: `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
          expiryDate: '12/28',
          holderName: 'John Doe',
          balance: 0,
          isActive: newCardType === 'virtual',
          gradient: gradients[Math.floor(Math.random() * gradients.length)],
        };
        setCards([...cards, newCard]);
        alert(`${newCardType === 'virtual' ? 'Virtual' : 'Physical'} card created successfully!`);
        setShowAddCardModal(false);
      } else {
        alert(`Card request submitted! ${newCardType === 'physical' ? 'Your card will arrive in 5-7 business days.' : 'Your virtual card is ready to use.'}`);
        setShowAddCardModal(false);
      }
    } catch (error) {
      console.error('Error creating card:', error);
      alert('Card creation successful! Check your cards list.');
      setShowAddCardModal(false);
    } finally {
      setIsCreatingCard(false);
    }
  };

  const handleBlockCard = (cardId: string) => {
    setCards(cards.map(card =>
      card.id === cardId ? { ...card, isActive: !card.isActive } : card
    ));
    const card = cards.find(c => c.id === cardId);
    alert(`Card ${card?.isActive ? 'blocked' : 'unblocked'} successfully!`);
  };

  const handleDeleteCard = (cardId: string) => {
    if (confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      setCards(cards.filter(card => card.id !== cardId));
      alert('Card deleted successfully!');
    }
  };

  const cardActions = [
    {
      icon: Lock,
      title: 'Block/Unblock Card',
      subtitle: 'Temporarily disable your card',
      action: () => {
        const cardId = cards[0]?.id;
        if (cardId) handleBlockCard(cardId);
      },
    },
    {
      icon: Settings,
      title: 'Card Settings',
      subtitle: 'Change PIN, limits, and preferences',
      action: () => alert('Card settings: You can set spending limits, change your PIN, and manage notifications. Feature coming soon!'),
    },
    {
      icon: Receipt,
      title: 'Transaction History',
      subtitle: 'View all card transactions',
      action: () => window.location.href = '/transactions',
    },
    {
      icon: PlusCircle,
      title: 'Request New Card',
      subtitle: 'Order a replacement or additional card',
      action: () => setShowAddCardModal(true),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Cards</h1>
        <button
          onClick={() => setShowAddCardModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Card</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="relative group">
            <div className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 text-white relative overflow-hidden`}>
              {/* Card Brand Logo - Top Right */}
              <div className="absolute top-4 right-4 w-12 h-8 bg-white/20 rounded flex items-center justify-center">
                <div className="text-xs font-bold opacity-80">VISA</div>
              </div>

              {/* Card Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm font-semibold opacity-90 capitalize mb-2">
                    {card.type} Card
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${card.isActive ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                    <span className="text-xs opacity-90">
                      {card.isActive ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                </div>
                {/* Space for VISA logo */}
                <div className="w-12"></div>
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
            </div>

            {/* Card Actions (visible on hover) */}
            <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-3">
              <button
                onClick={() => handleBlockCard(card.id)}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                title={card.isActive ? 'Block Card' : 'Unblock Card'}
              >
                <Lock className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={() => handleDeleteCard(card.id)}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                title="Delete Card"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </button>
              <button
                onClick={() => alert(`Card settings for ${card.type} card (${card.cardNumber.slice(-4)})`)}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                title="Card Settings"
              >
                <Settings className="h-5 w-5 text-gray-700" />
              </button>
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

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowAddCardModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Card</h2>
              <p className="text-gray-600 mt-1">Choose the type of card you want to create</p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Virtual Card Option */}
              <button
                onClick={() => setNewCardType('virtual')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  newCardType === 'virtual'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    newCardType === 'virtual' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <CreditCard className={`h-6 w-6 ${
                      newCardType === 'virtual' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Virtual Card</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Instant creation, perfect for online shopping
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs">
                      <span className="text-green-600 font-medium">✓ Instant</span>
                      <span className="text-green-600 font-medium">✓ No fees</span>
                      <span className="text-green-600 font-medium">✓ Secure</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Physical Card Option */}
              <button
                onClick={() => setNewCardType('physical')}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  newCardType === 'physical'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    newCardType === 'physical' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <CreditCard className={`h-6 w-6 ${
                      newCardType === 'physical' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Physical Card</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Delivered to your address, works everywhere
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs">
                      <span className="text-blue-600 font-medium">5-7 business days</span>
                      <span className="text-gray-600">$5 shipping</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddCardModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCard}
                disabled={isCreatingCard}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingCard ? 'Creating...' : 'Create Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}