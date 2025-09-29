'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  CreditCard, 
  Plus, 
  Lock, 
  Unlock,
  MoreVertical,
  Eye,
  EyeOff,
  Wifi,
  Shield,
  Snowflake,
  Settings,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Briefcase
} from 'lucide-react';

interface Card {
  id: string;
  name: string;
  number: string;
  balance: number;
  type: 'physical' | 'virtual';
  status: 'active' | 'frozen' | 'inactive';
  expiryDate: string;
  cvv: string;
  gradient: string;
}

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  icon: any;
}

export default function CardsPage() {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);

  const cards: Card[] = [
    {
      id: '1',
      name: 'Primary Card',
      number: '4532 •••• •••• 8912',
      balance: 2547.83,
      type: 'physical',
      status: 'active',
      expiryDate: '12/26',
      cvv: '***',
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      id: '2',
      name: 'Virtual Card',
      number: '5412 •••• •••• 3456',
      balance: 1250.00,
      type: 'virtual',
      status: 'active',
      expiryDate: '08/25',
      cvv: '***',
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      id: '3',
      name: 'Travel Card',
      number: '4916 •••• •••• 7823',
      balance: 500.00,
      type: 'physical',
      status: 'frozen',
      expiryDate: '03/27',
      cvv: '***',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const recentTransactions: Transaction[] = [
    { id: '1', merchant: 'Starbucks', amount: -12.50, date: 'Today, 9:30 AM', category: 'Food', icon: Coffee },
    { id: '2', merchant: 'Amazon', amount: -89.99, date: 'Today, 2:15 PM', category: 'Shopping', icon: ShoppingBag },
    { id: '3', merchant: 'Uber', amount: -24.30, date: 'Yesterday', category: 'Transport', icon: Car },
    { id: '4', merchant: 'Spotify', amount: -9.99, date: '2 days ago', category: 'Entertainment', icon: Home },
  ];

  const spendingCategories = [
    { name: 'Shopping', amount: 450.50, percentage: 35, color: 'from-purple-500 to-pink-500' },
    { name: 'Food & Dining', amount: 325.75, percentage: 25, color: 'from-blue-500 to-cyan-500' },
    { name: 'Transport', amount: 220.00, percentage: 17, color: 'from-green-500 to-emerald-500' },
    { name: 'Entertainment', amount: 150.25, percentage: 12, color: 'from-orange-500 to-red-500' },
    { name: 'Others', amount: 140.50, percentage: 11, color: 'from-gray-500 to-gray-600' },
  ];

  const handleCardAction = (action: 'freeze' | 'unfreeze', cardId: string) => {
    // Handle card freeze/unfreeze
    console.log(`${action} card ${cardId}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Cards</h1>
            <p className="text-gray-600 mt-2">Manage your physical and virtual cards</p>
          </div>
          <button 
            onClick={() => setShowAddCard(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Card
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cards Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Carousel */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className={`relative cursor-pointer transform hover:scale-105 transition-all ${
                      selectedCard?.id === card.id ? 'ring-4 ring-purple-500 ring-opacity-50' : ''
                    }`}
                  >
                    {/* Card Design */}
                    <div className={`bg-gradient-to-br ${card.gradient} rounded-3xl p-6 text-white h-56 relative overflow-hidden`}>
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
                      </div>
                      
                      <div className="relative z-10">
                        {/* Card Type Badge */}
                        <div className="flex justify-between items-start mb-8">
                          <div className="flex items-center space-x-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              card.type === 'virtual' 
                                ? 'bg-white/20 backdrop-blur-sm' 
                                : 'bg-white/10'
                            }`}>
                              {card.type === 'virtual' ? 'Virtual' : 'Physical'}
                            </div>
                            {card.status === 'frozen' && (
                              <div className="p-1.5 bg-white/20 rounded-full">
                                <Snowflake className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <Wifi className="h-6 w-6 rotate-90" />
                        </div>
                        
                        {/* Card Number */}
                        <div className="mb-6">
                          <p className="font-mono text-lg tracking-wider">
                            {showCardDetails ? card.number.replace('•••• ••••', '1234 5678') : card.number}
                          </p>
                        </div>
                        
                        {/* Card Details */}
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-white/70 mb-1">Card Holder</p>
                            <p className="font-medium">John Doe</p>
                          </div>
                          <div>
                            <p className="text-xs text-white/70 mb-1">Expires</p>
                            <p className="font-mono">{card.expiryDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Actions */}
            {selectedCard && (
              <div className="bg-white rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => setShowCardDetails(!showCardDetails)}
                    className="flex flex-col items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all group"
                  >
                    {showCardDetails ? (
                      <EyeOff className="h-6 w-6 text-gray-600 group-hover:text-purple-600 mb-2" />
                    ) : (
                      <Eye className="h-6 w-6 text-gray-600 group-hover:text-purple-600 mb-2" />
                    )}
                    <span className="text-sm text-gray-700">{showCardDetails ? 'Hide' : 'Show'} Details</span>
                  </button>
                  
                  <button
                    onClick={() => handleCardAction(selectedCard.status === 'frozen' ? 'unfreeze' : 'freeze', selectedCard.id)}
                    className="flex flex-col items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all group"
                  >
                    {selectedCard.status === 'frozen' ? (
                      <Unlock className="h-6 w-6 text-gray-600 group-hover:text-purple-600 mb-2" />
                    ) : (
                      <Lock className="h-6 w-6 text-gray-600 group-hover:text-purple-600 mb-2" />
                    )}
                    <span className="text-sm text-gray-700">{selectedCard.status === 'frozen' ? 'Unfreeze' : 'Freeze'} Card</span>
                  </button>
                  
                  <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all group">
                    <Shield className="h-6 w-6 text-gray-600 group-hover:text-purple-600 mb-2" />
                    <span className="text-sm text-gray-700">Security</span>
                  </button>
                  
                  <button className="flex flex-col items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all group">
                    <Settings className="h-6 w-6 text-gray-600 group-hover:text-purple-600 mb-2" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </button>
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <button className="text-purple-600 font-medium hover:text-purple-700">View All</button>
              </div>
              
              <div className="space-y-3">
                {recentTransactions.map((transaction) => {
                  const Icon = transaction.icon;
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                          <Icon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.merchant}</p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <p className={`font-semibold text-lg ${
                        transaction.amount < 0 ? 'text-gray-900' : 'text-green-600'
                      }`}>
                        {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Info */}
          <div className="space-y-6">
            {/* Card Balance */}
            {selectedCard && (
              <div className="bg-white rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Balance</h3>
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900 mb-2">
                    ${selectedCard.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-500">Available Balance</p>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Monthly Limit</span>
                    <span className="font-medium text-gray-900">$10,000</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Used This Month</span>
                    <span className="font-medium text-gray-900">$1,287.00</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '12.87%' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Spending Analysis */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
              <div className="space-y-3">
                {spendingCategories.map((category) => (
                  <div key={category.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      <span className="text-sm font-medium text-gray-900">${category.amount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${category.color} h-2 rounded-full transition-all duration-500`} 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Total Spent</span>
                  <span className="text-xl font-bold text-gray-900">$1,287.00</span>
                </div>
              </div>
            </div>

            {/* Card Benefits */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Card Benefits</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">2% Cashback</p>
                    <p className="text-xs text-gray-600">On all purchases</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Fraud Protection</p>
                    <p className="text-xs text-gray-600">24/7 monitoring</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">No Foreign Fees</p>
                    <p className="text-xs text-gray-600">Use worldwide</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}