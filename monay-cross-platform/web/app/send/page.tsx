'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import apiClient from '@/services/api-client';
import { 
  Search, 
  User, 
  Phone, 
  DollarSign, 
  Send, 
  Clock,
  ChevronRight,
  QrCode,
  Smartphone,
  CreditCard,
  Building,
  Users,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  initials: string;
  lastTransaction?: string;
}

export default function SendMoneyPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'card' | 'bank'>('balance');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [note, setNote] = useState('');
  
  // New state for real functionality
  const [currentBalance, setCurrentBalance] = useState(0);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inputMode, setInputMode] = useState<'contact' | 'phone'>('contact');

  // Load contacts and balance on mount
  useEffect(() => {
    fetchContacts();
    fetchBalance();
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.length > 0) {
      const searchTimeout = setTimeout(() => {
        searchUsers();
      }, 300); // 300ms delay for debouncing

      return () => clearTimeout(searchTimeout);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getRecentContacts();
      if (response.success && response.data) {
        // Transform the data to match our Contact interface
        const transformedContacts = (response.data as any[]).map((contact: any) => ({
          id: contact.id,
          name: contact.name,
          phone: contact.identifier,
          email: contact.type === 'email' ? contact.identifier : undefined,
          initials: contact.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
          lastTransaction: contact.lastTransaction
        }));
        setContacts(transformedContacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await apiClient.getWalletBalance();
      if (response.success && response.data) {
        setCurrentBalance((response.data as any).availableBalance || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiClient.searchUsers(searchQuery.trim());
      if (response.success && response.data) {
        // Transform the search results to match our Contact interface
        const transformedResults = (response.data as any[]).map((user: any) => {
          // Handle both API response format (name field) and user object format (firstName/lastName)
          const firstName = user.firstName || user.first_name || '';
          const lastName = user.lastName || user.last_name || '';
          const fullName = user.name || `${firstName} ${lastName}`.trim();

          return {
            id: user.id,
            name: fullName || user.email || user.identifier || 'Unknown User',
            phone: user.mobile || user.phone || '',
            email: user.email || '',
            initials: `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || user.name?.[0]?.toUpperCase() || '?',
            lastTransaction: undefined
          };
        });
        setSearchResults(transformedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Use search results if searching, otherwise filter recent contacts
  const displayContacts = searchQuery.length > 0 ? searchResults : contacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    return contact.name.toLowerCase().includes(query) ||
           (contact.phone && contact.phone.includes(searchQuery));
  });

  const quickAmounts = ['10', '25', '50', '100', '250', '500'];

  const handleSendMoney = async () => {
    if ((!selectedContact && !phoneNumber) || !amount || parseFloat(amount) <= 0) {
      setError('Please select a recipient and enter a valid amount');
      return;
    }

    const recipientIdentifier = selectedContact?.phone || phoneNumber;

    setIsSending(true);
    setError('');
    setSuccess('');
    setShowConfirmation(true);

    try {
      // First validate the transaction
      const validationResponse = await apiClient.validateTransaction(
        parseFloat(amount),
        'p2p'
      );

      if (!validationResponse.success || !(validationResponse.data as any)?.isValid) {
        const errors = (validationResponse.data as any)?.errors || ['Transaction validation failed'];
        setError(errors.join('. '));
        setTimeout(() => setShowConfirmation(false), 3000);
        return;
      }

      // Validate recipient
      const recipientValidation = await apiClient.validateRecipient(recipientIdentifier);

      if (!recipientValidation.success || !(recipientValidation.data as any)?.isValid) {
        setError((recipientValidation.data as any)?.error || 'Invalid recipient');
        setTimeout(() => setShowConfirmation(false), 3000);
        return;
      }

      // Send the money
      const response = await apiClient.sendMoney({
        recipientIdentifier,
        amount: parseFloat(amount),
        note,
        category: 'personal',
        transferMethod: 'instant'
      });

      if (response.success && response.data) {
        setSuccess(`Successfully sent $${amount} to ${(response.data as any).recipient || recipientIdentifier}!`);

        // Refresh balance
        await fetchBalance();

        // Reset form after 2 seconds
        setTimeout(() => {
          setShowConfirmation(false);
          setAmount('');
          setSelectedContact(null);
          setPhoneNumber('');
          setNote('');
          setSuccess('');
          // Redirect to dashboard
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(response.error?.message || 'Failed to send money');
        setTimeout(() => {
          setShowConfirmation(false);
        }, 3000);
      }
    } catch (error: any) {
      console.error('Send money error:', error);
      setError(error.error?.message || 'An error occurred while sending money');
      setTimeout(() => {
        setShowConfirmation(false);
      }, 3000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Balance */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Send Money</h1>
            <p className="text-gray-600 mt-2">Transfer money instantly to anyone</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 text-white">
            <p className="text-sm text-white/80 mb-1">Available Balance</p>
            <p className="text-2xl font-bold">${currentBalance.toFixed(2)}</p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-start space-x-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recipient Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Input Mode Toggle */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Recipient</h3>
              
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setInputMode('contact')}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                    inputMode === 'contact' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Contacts
                </button>
                <button
                  onClick={() => setInputMode('phone')}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                    inputMode === 'phone' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Phone Number
                </button>
              </div>

              {inputMode === 'contact' ? (
                <>
                  {/* Search Contacts */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Contacts List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {(isLoading || isSearching) ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                        <span className="ml-2 text-gray-600">
                          {isSearching ? 'Searching users...' : 'Loading contacts...'}
                        </span>
                      </div>
                    ) : displayContacts.length > 0 ? (
                      displayContacts.map((contact) => (
                        <button
                          key={contact.id}
                          onClick={() => {
                            setSelectedContact(contact);
                            setPhoneNumber('');
                          }}
                          className={`w-full p-3 rounded-xl flex items-center space-x-3 transition-all ${
                            selectedContact?.id === contact.id
                              ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-500'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                            {contact.initials}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{contact.name}</p>
                            <p className="text-sm text-gray-500">{contact.phone}</p>
                          </div>
                          {selectedContact?.id === contact.id && (
                            <Check className="h-5 w-5 text-purple-600" />
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        {searchQuery ?
                          `No users found for "${searchQuery}"` :
                          'Start typing to search for users to send money to'
                        }
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Phone Number Input */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          setSelectedContact(null);
                        }}
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Middle Column - Amount & Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Amount Input */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Amount</h3>
              
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-400">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 text-2xl font-bold bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount)}
                    className={`py-2 rounded-xl font-medium transition-all ${
                      amount === quickAmount
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ${quickAmount}
                  </button>
                ))}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Note (Optional)
                </label>
                <textarea
                  placeholder="What's this for?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('balance')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                    paymentMethod === 'balance'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium">Wallet Balance</p>
                      <p className="text-sm text-gray-500">${currentBalance.toFixed(2)} available</p>
                    </div>
                  </div>
                  {paymentMethod === 'balance' && <Check className="h-5 w-5 text-purple-600" />}
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                    paymentMethod === 'card'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium">Debit/Credit Card</p>
                      <p className="text-sm text-gray-500">Visa ending 8912</p>
                    </div>
                  </div>
                  {paymentMethod === 'card' && <Check className="h-5 w-5 text-purple-600" />}
                </button>

                <button
                  onClick={() => setPaymentMethod('bank')}
                  className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium">Bank Transfer</p>
                      <p className="text-sm text-gray-500">From your bank account</p>
                    </div>
                  </div>
                  {paymentMethod === 'bank' && <Check className="h-5 w-5 text-purple-600" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Send */}
          <div className="lg:col-span-1 space-y-6">
            {/* Transaction Summary */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient</span>
                  <span className="font-medium text-gray-900">
                    {selectedContact?.name || phoneNumber || 'Not selected'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-medium text-gray-900">
                    ${amount || '0.00'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium text-gray-900">
                    {paymentMethod === 'balance' ? 'Wallet' : paymentMethod === 'card' ? 'Card' : 'Bank'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee</span>
                  <span className="font-medium text-gray-900">$0.00</span>
                </div>
                
                <div className="pt-3 border-t border-purple-200">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="text-xl font-bold text-purple-600">
                      ${amount || '0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <button
                onClick={handleSendMoney}
                disabled={!amount || (!selectedContact && !phoneNumber) || parseFloat(amount) <= 0 || isSending}
                className={`w-full mt-6 py-4 rounded-2xl font-medium transition-all flex items-center justify-center ${
                  amount && (selectedContact || phoneNumber) && parseFloat(amount) > 0 && !isSending
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Send Money
                  </>
                )}
              </button>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transfers</h3>
              <p className="text-sm text-gray-500">Your recent transfers will appear here</p>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full">
              {isSending ? (
                <div className="text-center py-8">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Transfer</h3>
                  <p className="text-gray-600">Please wait while we process your transfer...</p>
                </div>
              ) : success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Transfer Successful!</h3>
                  <p className="text-gray-600">{success}</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Transfer Failed</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}