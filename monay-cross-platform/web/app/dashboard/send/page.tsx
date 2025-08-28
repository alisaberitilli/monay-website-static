'use client';

import { useState } from 'react';
import { 
  User, 
  MessageCircle, 
  QrCode, 
  Users, 
  Clock,
  DollarSign
} from 'lucide-react';

export default function SendPage() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const recentContacts = [
    { id: '1', name: 'John Doe', email: 'john.doe@email.com', avatar: 'JD' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@email.com', avatar: 'JS' },
    { id: '3', name: 'Mike Johnson', email: 'mike.johnson@email.com', avatar: 'MJ' },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount) {
      alert('Please fill in recipient and amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // TODO: Implement actual send money logic
    if (window.confirm(`Send $${numAmount.toFixed(2)} to ${recipient}?`)) {
      alert('Money sent successfully!');
      setRecipient('');
      setAmount('');
      setNote('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Money</h1>
        <p className="text-gray-600">Send money to friends and family instantly</p>
      </div>

      <form onSubmit={handleSend} className="space-y-6">
        {/* Recipient Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Send to</h3>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Email or phone number"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Contacts</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentContacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                onClick={() => setRecipient(contact.email)}
                className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {contact.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{contact.name}</div>
                  <div className="text-xs text-gray-500 truncate">{contact.email}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount</h3>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-2xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        {/* Note Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add a note (optional)</h3>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              placeholder="What's this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
        >
          Send Money
        </button>
      </form>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-4">
          <button className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <QrCode className="h-8 w-8 text-primary-500" />
            <span className="text-sm font-medium text-gray-900">Scan QR</span>
          </button>
          <button className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Users className="h-8 w-8 text-primary-500" />
            <span className="text-sm font-medium text-gray-900">Contacts</span>
          </button>
          <button className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors">
            <Clock className="h-8 w-8 text-primary-500" />
            <span className="text-sm font-medium text-gray-900">Recent</span>
          </button>
        </div>
      </div>
    </div>
  );
}