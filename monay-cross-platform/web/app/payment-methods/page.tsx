'use client';

import { useState, useEffect } from 'react';
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
  Briefcase,
  Building2,
  Smartphone,
  Wallet,
  Check,
  X,
  Edit3,
  Trash2,
  ArrowRight,
  Link2
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'upi' | 'digital_wallet';
  name: string;
  displayName: string;
  isDefault: boolean;
  status: 'active' | 'inactive' | 'frozen';
  details?: any;
}

interface Card extends PaymentMethod {
  type: 'card';
  number: string;
  balance: number;
  cardType: 'physical' | 'virtual';
  expiryDate: string;
  cvv: string;
  gradient: string;
}

interface BankAccount extends PaymentMethod {
  type: 'bank';
  bankName: string;
  accountType: 'checking' | 'savings';
  accountNumber: string;
  routingNumber: string;
}

interface UPIAccount extends PaymentMethod {
  type: 'upi';
  upiId: string;
  linkedBank: string;
}

interface DigitalWallet extends PaymentMethod {
  type: 'digital_wallet';
  provider: 'apple_pay' | 'google_pay' | 'amazon_pay' | 'paypal' | 'venmo' | 'fednow' | 'zelle';
  email?: string;
  phone?: string;
}

type AllPaymentMethods = Card | BankAccount | UPIAccount | DigitalWallet;

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  icon: any;
  paymentMethodId: string;
}

export default function PaymentMethodsPage() {
  const [selectedMethod, setSelectedMethod] = useState<AllPaymentMethods | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'cards' | 'banks' | 'upi' | 'wallets'>('all');
  const [addMethodType, setAddMethodType] = useState<'card' | 'bank' | 'upi' | 'wallet' | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'info'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [paymentMethods, setPaymentMethods] = useState<AllPaymentMethods[]>([
    // Cards
    {
      id: '1',
      type: 'card',
      name: 'Primary Card',
      displayName: 'Monay Card',
      number: '4532 •••• •••• 8912',
      balance: 2547.83,
      cardType: 'physical',
      status: 'active',
      expiryDate: '12/26',
      cvv: '***',
      gradient: 'from-purple-600 to-pink-600',
      isDefault: true
    } as Card,
    {
      id: '2',
      type: 'card',
      name: 'Virtual Card',
      displayName: 'Virtual Card',
      number: '5412 •••• •••• 3456',
      balance: 1250.00,
      cardType: 'virtual',
      status: 'active',
      expiryDate: '08/25',
      cvv: '***',
      gradient: 'from-blue-600 to-cyan-600',
      isDefault: false
    } as Card,
    
    // Bank Accounts
    {
      id: '3',
      type: 'bank',
      name: 'Chase Checking',
      displayName: 'Chase Bank',
      bankName: 'Chase Bank',
      accountType: 'checking',
      accountNumber: '****1234',
      routingNumber: '021000021',
      status: 'active',
      isDefault: false,
      details: { logo: 'chase' }
    } as BankAccount,
    {
      id: '4',
      type: 'bank',
      name: 'Bank of America Savings',
      displayName: 'Bank of America',
      bankName: 'Bank of America',
      accountType: 'savings',
      accountNumber: '****5678',
      routingNumber: '121000358',
      status: 'active',
      isDefault: false,
      details: { logo: 'bofa' }
    } as BankAccount,

    // UPI
    {
      id: '5',
      type: 'upi',
      name: 'Personal UPI',
      displayName: 'john@paytm',
      upiId: 'john@paytm',
      linkedBank: 'HDFC Bank',
      status: 'active',
      isDefault: false
    } as UPIAccount,

    // Digital Wallets
    {
      id: '6',
      type: 'digital_wallet',
      name: 'Apple Pay',
      displayName: 'Apple Pay',
      provider: 'apple_pay',
      status: 'active',
      isDefault: false
    } as DigitalWallet,
    {
      id: '7',
      type: 'digital_wallet',
      name: 'Google Pay',
      displayName: 'Google Pay',
      provider: 'google_pay',
      email: 'john@gmail.com',
      status: 'active',
      isDefault: false
    } as DigitalWallet,
    {
      id: '8',
      type: 'digital_wallet',
      name: 'PayPal',
      displayName: 'PayPal',
      provider: 'paypal',
      email: 'john@example.com',
      status: 'active',
      isDefault: false
    } as DigitalWallet,
    {
      id: '9',
      type: 'digital_wallet',
      name: 'Venmo',
      displayName: 'Venmo',
      provider: 'venmo',
      phone: '+1234567890',
      status: 'active',
      isDefault: false
    } as DigitalWallet,
    {
      id: '10',
      type: 'digital_wallet',
      name: 'Zelle',
      displayName: 'Zelle',
      provider: 'zelle',
      email: 'john@example.com',
      status: 'active',
      isDefault: false
    } as DigitalWallet,
  ]);

  // Debug: Log payment methods changes
  useEffect(() => {
    console.log('Payment methods updated:', paymentMethods.length, 'methods');
  }, [paymentMethods]);

  const recentTransactions: Transaction[] = [
    { id: '1', merchant: 'Starbucks', amount: -12.50, date: 'Today, 9:30 AM', category: 'Food', icon: Coffee, paymentMethodId: '1' },
    { id: '2', merchant: 'Amazon', amount: -89.99, date: 'Today, 2:15 PM', category: 'Shopping', icon: ShoppingBag, paymentMethodId: '6' },
    { id: '3', merchant: 'Uber', amount: -24.30, date: 'Yesterday', category: 'Transport', icon: Car, paymentMethodId: '3' },
    { id: '4', merchant: 'Spotify', amount: -9.99, date: '2 days ago', category: 'Entertainment', icon: Home, paymentMethodId: '7' },
  ];

  const getFilteredMethods = () => {
    switch (activeTab) {
      case 'cards':
        return paymentMethods.filter(method => method.type === 'card');
      case 'banks':
        return paymentMethods.filter(method => method.type === 'bank');
      case 'upi':
        return paymentMethods.filter(method => method.type === 'upi');
      case 'wallets':
        return paymentMethods.filter(method => method.type === 'digital_wallet');
      default:
        return paymentMethods;
    }
  };

  const getMethodIcon = (method: AllPaymentMethods) => {
    switch (method.type) {
      case 'card':
        return CreditCard;
      case 'bank':
        return Building2;
      case 'upi':
        return Smartphone;
      case 'digital_wallet':
        return Wallet;
      default:
        return CreditCard;
    }
  };

  const renderWalletLogo = (provider: string, isSelected: boolean) => {
    const baseClasses = `font-bold text-center`;
    const colorClasses = isSelected ? 'text-purple-600' : 'text-gray-600';
    
    switch (provider) {
      case 'apple_pay':
        return (
          <div className={`${baseClasses} text-xs font-bold`} style={{ color: '#000000' }}>
            <div className="flex flex-col items-center">
              <span style={{ fontSize: '8px', marginBottom: '1px' }}>🍎</span>
              <span style={{ fontSize: '6px', fontWeight: 'bold' }}>Pay</span>
            </div>
          </div>
        );
      case 'google_pay':
        return (
          <div className={`${baseClasses} text-lg font-bold`} style={{ 
            background: 'linear-gradient(45deg, #4285F4, #EA4335, #FBBC05, #34A853)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            G
          </div>
        );
      case 'amazon_pay':
        return (
          <div className={`${baseClasses} text-xs font-bold`} style={{ color: '#FF9900' }}>
            amazon
          </div>
        );
      case 'paypal':
        return (
          <div className={`${baseClasses} text-xs font-bold`}>
            <span style={{ color: '#0070BA' }}>Pay</span>
            <span style={{ color: '#003087' }}>Pal</span>
          </div>
        );
      case 'venmo':
        return (
          <div className={`${baseClasses} text-lg font-bold`} style={{ color: '#3D95CE' }}>
            V
          </div>
        );
      case 'fednow':
        return (
          <div className={`${baseClasses} text-xs font-bold`} style={{ color: '#1F4E79' }}>
            Fed
          </div>
        );
      case 'zelle':
        return (
          <div className={`${baseClasses} text-lg font-bold`} style={{ color: '#6C1C9D' }}>
            Z
          </div>
        );
      default:
        return <span className="text-2xl">💳</span>;
    }
  };

  const renderBankLogo = (bankCode: string, isSelected: boolean) => {
    const baseClasses = `font-bold text-center`;
    
    switch (bankCode) {
      case 'chase':
        return (
          <div className={`${baseClasses} text-xs font-bold`}>
            <div style={{ color: '#117ACA' }}>CHASE</div>
          </div>
        );
      case 'bofa':
        return (
          <div className={`${baseClasses} text-xs font-bold`}>
            <div style={{ color: '#E31837' }}>BofA</div>
          </div>
        );
      case 'wells_fargo':
        return (
          <div className={`${baseClasses} text-xs font-bold`}>
            <div style={{ color: '#D71E2B' }}>Wells</div>
          </div>
        );
      case 'citibank':
        return (
          <div className={`${baseClasses} text-xs font-bold`}>
            <div style={{ color: '#1976D2' }}>Citi</div>
          </div>
        );
      default:
        return <Building2 className={`h-6 w-6 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />;
    }
  };

  const handleMethodAction = (action: 'freeze' | 'unfreeze' | 'delete', methodId: string) => {
    if (action === 'delete') {
      setShowDeleteConfirm(true);
    } else if (action === 'freeze') {
      setPaymentMethods(methods =>
        methods.map(m =>
          m.id === methodId ? { ...m, status: 'frozen' as const } : m
        )
      );
      showToast('Payment method frozen successfully', 'info');
    } else if (action === 'unfreeze') {
      setPaymentMethods(methods =>
        methods.map(m =>
          m.id === methodId ? { ...m, status: 'active' as const } : m
        )
      );
      showToast('Payment method activated successfully', 'success');
    }
  };

  const handleDeleteMethod = () => {
    if (!selectedMethod) return;

    const methodName = selectedMethod.displayName;
    setPaymentMethods(methods =>
      methods.filter(m => m.id !== selectedMethod.id)
    );
    setShowDeleteConfirm(false);
    setSelectedMethod(null);
    showToast(`${methodName} removed successfully`, 'success');
  };

  const handleSetDefault = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    setPaymentMethods(methods =>
      methods.map(m => ({
        ...m,
        isDefault: m.id === methodId
      }))
    );
    showToast(`${method?.displayName} set as default`, 'success');
  };

  const handleAddCard = (cardData: any) => {
    console.log('Adding card:', cardData);
    const newCard: Card = {
      id: Date.now().toString(),
      type: 'card',
      name: cardData.name || 'New Card',
      displayName: `${cardData.cardType === 'virtual' ? 'Virtual' : 'Physical'} Card`,
      number: `${cardData.cardNumber.slice(0, 4)} •••• •••• ${cardData.cardNumber.slice(-4)}`,
      balance: 0,
      cardType: cardData.cardType || 'virtual',
      status: 'active',
      expiryDate: cardData.expiryDate,
      cvv: '***',
      gradient: cardData.cardType === 'virtual' ? 'from-cyan-600 to-blue-600' : 'from-indigo-600 to-purple-600',
      isDefault: false
    };
    console.log('New card created:', newCard);
    setPaymentMethods(prevMethods => {
      const updated = [...prevMethods, newCard];
      console.log('Updated methods:', updated.length);
      return updated;
    });
    setShowAddMethod(false);
    setAddMethodType(null);
    showToast(`${newCard.displayName} added successfully!`, 'success');

    // Force tab to show cards
    setActiveTab('cards');
  };

  const handleAddBank = (bankData: any) => {
    const newBank: BankAccount = {
      id: Date.now().toString(),
      type: 'bank',
      name: bankData.accountName,
      displayName: bankData.bankName,
      bankName: bankData.bankName,
      accountType: bankData.accountType,
      accountNumber: `****${bankData.accountNumber.slice(-4)}`,
      routingNumber: bankData.routingNumber,
      status: 'active',
      isDefault: false,
      details: {}
    };
    setPaymentMethods(methods => [...methods, newBank]);
    setShowAddMethod(false);
    setAddMethodType(null);
    showToast('Bank account added successfully!', 'success');
  };

  const handleAddWallet = (walletData: any) => {
    const newWallet: DigitalWallet = {
      id: Date.now().toString(),
      type: 'digital_wallet',
      name: walletData.provider,
      displayName: walletData.provider.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      provider: walletData.provider,
      email: walletData.email,
      phone: walletData.phone,
      status: 'active',
      isDefault: false
    };
    setPaymentMethods(methods => [...methods, newWallet]);
    setShowAddMethod(false);
    setAddMethodType(null);
    showToast(`${newWallet.displayName} connected successfully!`, 'success');
  };

  const renderMethodCard = (method: AllPaymentMethods) => {
    const Icon = getMethodIcon(method);

    if (method.type === 'card') {
      const card = method as Card;
      return (
        <div
          key={card.id}
          onClick={() => setSelectedMethod(card)}
          className={`relative cursor-pointer transform hover:scale-105 transition-all ${
            selectedMethod?.id === card.id ? 'ring-4 ring-purple-500 ring-opacity-50' : ''
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
                    card.cardType === 'virtual' 
                      ? 'bg-white/20 backdrop-blur-sm' 
                      : 'bg-white/10'
                  }`}>
                    {card.cardType === 'virtual' ? 'Virtual' : 'Physical'}
                  </div>
                  {card.isDefault && (
                    <div className="px-2 py-1 bg-yellow-500/20 rounded-full">
                      <span className="text-xs font-medium">Default</span>
                    </div>
                  )}
                </div>
                <Wifi className="h-6 w-6 rotate-90" />
              </div>
              
              {/* Card Number */}
              <div className="mb-6">
                <p className="font-mono text-lg tracking-wider">
                  {showDetails ? card.number.replace('•••• ••••', '1234 5678') : card.number}
                </p>
              </div>
              
              {/* Card Details */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-white/70 mb-1">Card Holder</p>
                  <p className="font-medium">Ali Saberi</p>
                </div>
                <div>
                  <p className="text-xs text-white/70 mb-1">Expires</p>
                  <p className="font-mono">{card.expiryDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Other payment method types
    return (
      <div
        key={method.id}
        onClick={() => setSelectedMethod(method)}
        className={`bg-white rounded-2xl p-6 border-2 cursor-pointer hover:shadow-lg transition-all ${
          selectedMethod?.id === method.id 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              selectedMethod?.id === method.id 
                ? 'bg-purple-100' 
                : 'bg-gray-100'
            }`}>
              {method.type === 'digital_wallet' ? (
                <div className="flex items-center justify-center w-full h-full">
                  {renderWalletLogo((method as DigitalWallet).provider, selectedMethod?.id === method.id)}
                </div>
              ) : method.type === 'bank' ? (
                <div className="flex items-center justify-center w-full h-full">
                  {renderBankLogo((method as BankAccount).details?.logo || 'generic', selectedMethod?.id === method.id)}
                </div>
              ) : (
                <Icon className={`h-6 w-6 ${
                  selectedMethod?.id === method.id ? 'text-purple-600' : 'text-gray-600'
                }`} />
              )}
            </div>
            <div>
              <h3 className={`font-medium ${
                selectedMethod?.id === method.id ? 'text-purple-900' : 'text-gray-900'
              }`}>
                {method.displayName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {method.type === 'bank' && `${(method as BankAccount).accountType} •••• ${(method as BankAccount).accountNumber}`}
                {method.type === 'upi' && (method as UPIAccount).upiId}
                {method.type === 'digital_wallet' && (
                  (method as DigitalWallet).email || (method as DigitalWallet).phone || 'Connected'
                )}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  method.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {method.status}
                </span>
                {method.isDefault && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                    Default
                  </span>
                )}
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
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
            <p className="text-gray-600 mt-2">Manage your cards, bank accounts, and digital wallets</p>
          </div>
          <button 
            onClick={() => setShowAddMethod(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Payment Method
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl p-2">
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'All Methods', count: paymentMethods.length },
              { key: 'cards', label: 'Cards', count: paymentMethods.filter(m => m.type === 'card').length },
              { key: 'banks', label: 'Banks', count: paymentMethods.filter(m => m.type === 'bank').length },
              { key: 'upi', label: 'UPI', count: paymentMethods.filter(m => m.type === 'upi').length },
              { key: 'wallets', label: 'Digital Wallets', count: paymentMethods.filter(m => m.type === 'digital_wallet').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Methods Grid */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {activeTab === 'all' ? 'All Payment Methods' : 
                 activeTab === 'cards' ? 'Your Cards' :
                 activeTab === 'banks' ? 'Bank Accounts' :
                 activeTab === 'upi' ? 'UPI Accounts' :
                 'Digital Wallets'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getFilteredMethods().map(renderMethodCard)}
              </div>
            </div>

            {/* Quick Actions */}
            {selectedMethod && (
              <div className="bg-white rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedMethod.type === 'card' && (
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="flex flex-col items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all group"
                    >
                      {showDetails ? (
                        <EyeOff className="h-6 w-6 text-gray-600 group-hover:text-purple-600 mb-2" />
                      ) : (
                        <Eye className="h-6 w-6 text-gray-600 group-hover:text-purple-600 mb-2" />
                      )}
                      <span className="text-sm text-gray-700">{showDetails ? 'Hide' : 'Show'} Details</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleMethodAction(
                      selectedMethod.status === 'frozen' ? 'unfreeze' : 'freeze', 
                      selectedMethod.id
                    )}
                    className="flex flex-col items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all group"
                  >
                    {selectedMethod.status === 'frozen' ? (
                      <Unlock className="h-6 w-6 text-gray-600 group-hover:text-purple-600 mb-2" />
                    ) : (
                      <Lock className="h-6 w-6 text-gray-600 group-hover:text-purple-600 mb-2" />
                    )}
                    <span className="text-sm text-gray-700">
                      {selectedMethod.status === 'frozen' ? 'Activate' : 'Deactivate'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleSetDefault(selectedMethod.id)}
                    className="flex flex-col items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all group"
                    disabled={selectedMethod.isDefault}
                  >
                    <Check className="h-6 w-6 text-gray-600 group-hover:text-purple-600 mb-2" />
                    <span className="text-sm text-gray-700">Set Default</span>
                  </button>
                  
                  <button 
                    onClick={() => handleMethodAction('delete', selectedMethod.id)}
                    className="flex flex-col items-center p-4 bg-gray-50 hover:bg-red-50 rounded-2xl transition-all group"
                  >
                    <Trash2 className="h-6 w-6 text-gray-600 group-hover:text-red-600 mb-2" />
                    <span className="text-sm text-gray-700 group-hover:text-red-700">Remove</span>
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
                  const paymentMethod = paymentMethods.find(m => m.id === transaction.paymentMethodId);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                          <Icon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.merchant}</p>
                          <p className="text-sm text-gray-500">{transaction.date} • {paymentMethod?.displayName}</p>
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

          {/* Right Column - Details & Quick Add */}
          <div className="space-y-6">
            {/* Selected Method Details */}
            {selectedMethod && (
              <div className="bg-white rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Method Details</h3>
                
                {selectedMethod.type === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Available Balance</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${(selectedMethod as Card).balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Card Type</p>
                        <p className="font-medium capitalize">{(selectedMethod as Card).cardType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Expires</p>
                        <p className="font-medium">{(selectedMethod as Card).expiryDate}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod.type === 'bank' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Bank Name</p>
                      <p className="text-xl font-bold text-gray-900">{(selectedMethod as BankAccount).bankName}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Account Type</p>
                        <p className="font-medium capitalize">{(selectedMethod as BankAccount).accountType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Account Number</p>
                        <p className="font-medium">{(selectedMethod as BankAccount).accountNumber}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod.type === 'upi' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">UPI ID</p>
                      <p className="text-xl font-bold text-gray-900">{(selectedMethod as UPIAccount).upiId}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Linked Bank</p>
                      <p className="font-medium">{(selectedMethod as UPIAccount).linkedBank}</p>
                    </div>
                  </div>
                )}

                {selectedMethod.type === 'digital_wallet' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        {renderWalletLogo((selectedMethod as DigitalWallet).provider, false)}
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-900">{selectedMethod.displayName}</p>
                        <p className="text-sm text-gray-500">Digital Wallet</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Connected Account</p>
                      <p className="font-medium">
                        {(selectedMethod as DigitalWallet).email || (selectedMethod as DigitalWallet).phone || 'Connected'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Add Methods */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add</h3>
              <div className="space-y-3">
                <button
                  onClick={() => { setShowAddMethod(true); setAddMethodType('card'); }}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
                    <span className="font-medium text-gray-700 group-hover:text-purple-700">Add Card</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                </button>

                <button
                  onClick={() => { setShowAddMethod(true); setAddMethodType('bank'); }}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
                    <span className="font-medium text-gray-700 group-hover:text-purple-700">Add Bank Account</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                </button>

                <button
                  onClick={() => { setShowAddMethod(true); setAddMethodType('upi'); }}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-5 w-5 text-gray-600 group-hover:text-purple-600" />
                    <span className="font-medium text-gray-700 group-hover:text-purple-700">Add UPI</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
                </button>
                
                {/* Popular Digital Wallets */}
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Popular Wallets</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddWallet({ provider: 'apple_pay' })}
                      className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-purple-50 rounded-xl transition-all group"
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        {renderWalletLogo('apple_pay', false)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Apple Pay</span>
                    </button>

                    <button
                      onClick={() => handleAddWallet({ provider: 'google_pay', email: 'user@gmail.com' })}
                      className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-purple-50 rounded-xl transition-all group"
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        {renderWalletLogo('google_pay', false)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Google Pay</span>
                    </button>

                    <button
                      onClick={() => handleAddWallet({ provider: 'paypal', email: 'user@example.com' })}
                      className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-purple-50 rounded-xl transition-all group"
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        {renderWalletLogo('paypal', false)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">PayPal</span>
                    </button>

                    <button
                      onClick={() => handleAddWallet({ provider: 'venmo', phone: '+1234567890' })}
                      className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-purple-50 rounded-xl transition-all group"
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        {renderWalletLogo('venmo', false)}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Venmo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                All your payment methods are secured with bank-level encryption and fraud protection.
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
                  <span className="text-gray-700">Real-time fraud monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Payment Method Modal */}
        {showAddMethod && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-8 relative">
              <button
                onClick={() => { setShowAddMethod(false); setAddMethodType(null); }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Add {addMethodType === 'card' ? 'Card' : addMethodType === 'bank' ? 'Bank Account' : 'UPI'}
              </h2>

              {addMethodType === 'card' && <AddCardForm onSubmit={handleAddCard} onCancel={() => setShowAddMethod(false)} />}
              {addMethodType === 'bank' && <AddBankForm onSubmit={handleAddBank} onCancel={() => setShowAddMethod(false)} />}
              {addMethodType === 'upi' && <AddUPIForm onSubmit={(data) => {
                const upiAccount: UPIAccount = {
                  id: Date.now().toString(),
                  type: 'upi',
                  name: 'UPI Account',
                  displayName: data.upiId,
                  upiId: data.upiId,
                  linkedBank: data.linkedBank || 'Bank',
                  status: 'active',
                  isDefault: false
                };
                setPaymentMethods(methods => [...methods, upiAccount]);
                setShowAddMethod(false);
                setAddMethodType(null);
                showToast('UPI account added successfully!', 'success');
              }} onCancel={() => setShowAddMethod(false)} />}
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-4 right-4 z-[60] transition-all duration-300 ease-in-out" style={{
            animation: 'slideInRight 0.3s ease-out'
          }}>
            <style jsx>{`
              @keyframes slideInRight {
                from {
                  transform: translateX(400px);
                  opacity: 0;
                }
                to {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
            `}</style>
            <div className={`rounded-xl shadow-2xl p-4 pr-12 flex items-center space-x-3 min-w-[320px] ${
              toast.type === 'success' ? 'bg-green-600 text-white' :
              toast.type === 'error' ? 'bg-red-600 text-white' :
              'bg-blue-600 text-white'
            }`}>
              {toast.type === 'success' && <Check className="h-5 w-5 flex-shrink-0" />}
              {toast.type === 'error' && <X className="h-5 w-5 flex-shrink-0" />}
              {toast.type === 'info' && <Lock className="h-5 w-5 flex-shrink-0" />}
              <span className="font-medium">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="absolute top-2 right-2 text-white/80 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedMethod && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Remove Payment Method?</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to remove <strong>{selectedMethod.displayName}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMethod}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Add Card Form Component
function AddCardForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    cardType: 'virtual' as 'virtual' | 'physical'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData({ ...formData, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setFormData({ ...formData, expiryDate: formatted });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
        <input
          type="text"
          placeholder="4532 1234 5678 9012"
          value={formData.cardNumber}
          onChange={handleCardNumberChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
          required
          maxLength={19}
        />
        <p className="text-xs text-gray-500 mt-1">Enter 16-digit card number</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
          <input
            type="text"
            placeholder="MM/YY"
            value={formData.expiryDate}
            onChange={handleExpiryChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
            required
            maxLength={5}
          />
          <p className="text-xs text-gray-500 mt-1">Format: MM/YY</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
          <input
            type="password"
            placeholder="123"
            value={formData.cvv}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              setFormData({ ...formData, cvv: value });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
            required
            maxLength={4}
            minLength={3}
          />
          <p className="text-xs text-gray-500 mt-1">3-4 digits on back</p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Holder Name</label>
        <input
          type="text"
          placeholder="Ali Saberi"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
          required
          pattern="[A-Za-z\s]+"
        />
        <p className="text-xs text-gray-500 mt-1">Name as it appears on card</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Type</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, cardType: 'virtual' })}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
              formData.cardType === 'virtual' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}
          >
            Virtual
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, cardType: 'physical' })}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
              formData.cardType === 'physical' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}
          >
            Physical
          </button>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          Add Card
        </button>
      </div>
    </form>
  );
}

// Add Bank Form Component
function AddBankForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking' as 'checking' | 'savings'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
        <input
          type="text"
          placeholder="Chase Bank"
          value={formData.bankName}
          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
        <input
          type="text"
          placeholder="Ali Saberi"
          value={formData.accountName}
          onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
        <input
          type="text"
          placeholder="1234567890"
          value={formData.accountNumber}
          onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Routing Number</label>
        <input
          type="text"
          placeholder="021000021"
          value={formData.routingNumber}
          onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
          maxLength={9}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, accountType: 'checking' })}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
              formData.accountType === 'checking' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}
          >
            Checking
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, accountType: 'savings' })}
            className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
              formData.accountType === 'savings' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}
          >
            Savings
          </button>
        </div>
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          Add Bank Account
        </button>
      </div>
    </form>
  );
}

// Add UPI Form Component
function AddUPIForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    upiId: '',
    linkedBank: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
        <input
          type="text"
          placeholder="yourname@paytm"
          value={formData.upiId}
          onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Linked Bank</label>
        <input
          type="text"
          placeholder="HDFC Bank"
          value={formData.linkedBank}
          onChange={(e) => setFormData({ ...formData, linkedBank: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
        >
          Add UPI Account
        </button>
      </div>
    </form>
  );
}