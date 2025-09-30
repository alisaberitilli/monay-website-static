'use client';

import React, { useState, useRef } from 'react';
import { QrCode, Camera, Upload, ArrowLeft, Scan, MapPin, Star, Clock, CreditCard, Receipt, History, Search } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Merchant {
  id: string;
  name: string;
  category: string;
  address: string;
  rating: number;
  distance: string;
  image: string;
  acceptsQR: boolean;
  recentTransaction?: {
    amount: number;
    date: string;
  };
}

interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
}

const QRPaymentsPage = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'generate' | 'history'>('scan');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [nearbyMerchants, setNearbyMerchants] = useState<Merchant[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data
  const merchants: Merchant[] = [
    {
      id: '1',
      name: 'Starbucks Coffee',
      category: 'Coffee & Cafe',
      address: '123 Main St, Downtown',
      rating: 4.5,
      distance: '0.1 mi',
      image: '/api/placeholder/60/60',
      acceptsQR: true,
      recentTransaction: {
        amount: 8.45,
        date: '2024-01-15'
      }
    },
    {
      id: '2',
      name: 'Target',
      category: 'Retail',
      address: '456 Shopping Plaza',
      rating: 4.3,
      distance: '0.3 mi',
      image: '/api/placeholder/60/60',
      acceptsQR: true
    },
    {
      id: '3',
      name: 'McDonald\'s',
      category: 'Fast Food',
      address: '789 Food Court',
      rating: 4.1,
      distance: '0.2 mi',
      image: '/api/placeholder/60/60',
      acceptsQR: true,
      recentTransaction: {
        amount: 12.34,
        date: '2024-01-14'
      }
    },
    {
      id: '4',
      name: 'CVS Pharmacy',
      category: 'Pharmacy',
      address: '321 Health Ave',
      rating: 4.2,
      distance: '0.4 mi',
      image: '/api/placeholder/60/60',
      acceptsQR: true
    },
    {
      id: '5',
      name: 'Whole Foods Market',
      category: 'Grocery',
      address: '654 Organic St',
      rating: 4.6,
      distance: '0.5 mi',
      image: '/api/placeholder/60/60',
      acceptsQR: true
    }
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      merchant: 'Starbucks Coffee',
      amount: 8.45,
      date: '2024-01-15T10:30:00',
      status: 'completed',
      paymentMethod: 'QR Code'
    },
    {
      id: '2',
      merchant: 'Target',
      amount: 45.67,
      date: '2024-01-14T15:45:00',
      status: 'completed',
      paymentMethod: 'QR Code'
    },
    {
      id: '3',
      merchant: 'McDonald\'s',
      amount: 12.34,
      date: '2024-01-14T12:20:00',
      status: 'completed',
      paymentMethod: 'QR Code'
    },
    {
      id: '4',
      merchant: 'CVS Pharmacy',
      amount: 23.89,
      date: '2024-01-13T16:10:00',
      status: 'completed',
      paymentMethod: 'QR Code'
    },
    {
      id: '5',
      merchant: 'Whole Foods Market',
      amount: 87.65,
      date: '2024-01-12T11:15:00',
      status: 'completed',
      paymentMethod: 'QR Code'
    }
  ];

  React.useEffect(() => {
    setNearbyMerchants(merchants);
    setRecentTransactions(transactions);
  }, []);

  const filteredMerchants = nearbyMerchants.filter(merchant =>
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would process the QR code from the uploaded image
      console.log('Processing QR code from file:', file.name);
      alert('QR Code scanned successfully! Processing payment...');
    }
  };

  const generateQRCode = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // In a real app, you would generate an actual QR code
    alert(`QR Code generated for $${amount}${description ? ` - ${description}` : ''}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">QR Payments</h1>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('scan')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'scan'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Scan className="h-4 w-4 inline mr-2" />
              Scan & Pay
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'generate'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <QrCode className="h-4 w-4 inline mr-2" />
              Request Payment
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <History className="h-4 w-4 inline mr-2" />
              Transaction History
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Scan & Pay Tab */}
        {activeTab === 'scan' && (
          <div className="space-y-6">
            {/* Scanner Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Scan QR Code to Pay</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Camera Scanner */}
                <div className="space-y-4">
                  <button
                    onClick={() => setShowCamera(!showCamera)}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
                  >
                    <Camera className="h-5 w-5" />
                    Open Camera Scanner
                  </button>

                  {showCamera && (
                    <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Camera scanner would appear here</p>
                        <p className="text-sm text-gray-500 mt-1">Position QR code within the frame</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload QR Code */}
                <div className="space-y-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 border border-dashed border-gray-300"
                  >
                    <Upload className="h-5 w-5" />
                    Upload QR Code Image
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="text-center">
                    <p className="text-sm text-gray-600">Or</p>
                    <p className="text-sm text-gray-500">Choose from nearby merchants below</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nearby Merchants */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Nearby QR-Enabled Merchants</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  Within 1 mile
                </div>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search merchants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredMerchants.map((merchant) => (
                  <div key={merchant.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <img
                        src={merchant.image}
                        alt={merchant.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{merchant.name}</h3>
                        <p className="text-sm text-gray-600">{merchant.category}</p>
                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            {merchant.rating}
                          </span>
                          <span>{merchant.distance}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {merchant.recentTransaction && (
                        <p className="text-sm text-gray-500 mb-2">
                          Last: ${merchant.recentTransaction.amount}
                        </p>
                      )}
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Pay Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generate QR Tab */}
        {activeTab === 'generate' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Generate Payment Request QR Code</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this payment for?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={generateQRCode}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode className="h-5 w-5" />
                  Generate QR Code
                </button>

                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Share this QR code with anyone to request payment</p>
                  <p>• Code expires in 24 hours for security</p>
                  <p>• You'll receive a notification when paid</p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="bg-gray-100 p-8 rounded-lg">
                  <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">QR Code will appear here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">QR Payment History</h2>

            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <QrCode className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{transaction.merchant}</h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(transaction.date)}
                        </span>
                        <span className="flex items-center">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {transaction.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${transaction.amount.toFixed(2)}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {recentTransactions.length === 0 && (
              <div className="text-center py-12">
                <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No QR transactions yet</h3>
                <p className="text-gray-600">Start using QR payments to see your transaction history here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QRPaymentsPage;