'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  HelpCircle,
  Shield,
  CreditCard,
  Send,
  Wallet,
  TrendingUp,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Video,
  Headphones,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  helpful: number;
  icon: any;
}

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved';
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'faq' | 'articles' | 'contact'>('faq');

  const categories = [
    { id: 'all', name: 'All Topics', icon: HelpCircle, count: 24 },
    { id: 'account', name: 'Account', icon: Users, count: 6 },
    { id: 'payments', name: 'Payments', icon: CreditCard, count: 8 },
    { id: 'security', name: 'Security', icon: Shield, count: 5 },
    { id: 'cards', name: 'Cards', icon: Wallet, count: 5 }
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I add money to my wallet?',
      answer: 'You can add money to your wallet using multiple methods: credit/debit cards, bank transfers, UPI, or digital wallets. Go to the "Add Money" section, enter the amount, select your preferred payment method, and follow the instructions.',
      category: 'payments'
    },
    {
      id: '2',
      question: 'Is my money safe with Monay?',
      answer: 'Yes, your money is completely safe. We use bank-level 256-bit SSL encryption, are PCI DSS compliant, and your funds are held in segregated accounts with our banking partners. We also offer 2-factor authentication for added security.',
      category: 'security'
    },
    {
      id: '3',
      question: 'How do I reset my password?',
      answer: 'To reset your password, click on "Forgot Password" on the login screen. Enter your registered email or phone number, and we\'ll send you a verification code. Use this code to create a new password.',
      category: 'account'
    },
    {
      id: '4',
      question: 'What are the transaction limits?',
      answer: 'Daily transaction limits vary based on your account verification level. Basic accounts have a $1,000 daily limit, while verified accounts can transact up to $10,000 per day. You can view and request limit increases in Settings.',
      category: 'payments'
    },
    {
      id: '5',
      question: 'How do I order a physical card?',
      answer: 'You can order a physical card from the Cards section. Click on "Add New Card", select "Physical Card", provide your shipping address, and confirm. Your card will be delivered within 7-10 business days.',
      category: 'cards'
    }
  ];

  const articles: Article[] = [
    {
      id: '1',
      title: 'Getting Started with Monay',
      description: 'Learn the basics of setting up your account and making your first transaction',
      category: 'account',
      readTime: '5 min',
      helpful: 234,
      icon: BookOpen
    },
    {
      id: '2',
      title: 'Security Best Practices',
      description: 'Keep your account secure with these essential security tips',
      category: 'security',
      readTime: '3 min',
      helpful: 189,
      icon: Shield
    },
    {
      id: '3',
      title: 'Understanding Transaction Fees',
      description: 'A complete guide to our fee structure and how to minimize costs',
      category: 'payments',
      readTime: '4 min',
      helpful: 156,
      icon: TrendingUp
    },
    {
      id: '4',
      title: 'Virtual vs Physical Cards',
      description: 'Choose the right card type for your needs',
      category: 'cards',
      readTime: '6 min',
      helpful: 142,
      icon: CreditCard
    }
  ];

  const recentTickets: Ticket[] = [
    { id: '1', subject: 'Transaction failed but amount debited', status: 'resolved', date: '2 days ago', priority: 'high' },
    { id: '2', subject: 'Unable to add new bank account', status: 'pending', date: '5 days ago', priority: 'medium' },
    { id: '3', subject: 'Request for transaction statement', status: 'open', date: '1 week ago', priority: 'low' }
  ];

  const filteredFAQs = faqs.filter(faq => 
    (selectedCategory === 'all' || faq.category === selectedCategory) &&
    (faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
     faq.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredArticles = articles.filter(article =>
    (selectedCategory === 'all' || article.category === selectedCategory) &&
    (article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     article.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">How can we help you?</h1>
          <p className="text-gray-600 mt-2">Search our knowledge base or contact support</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:from-purple-100 hover:to-pink-100 transition-all">
            <MessageCircle className="h-8 w-8 text-purple-600 mb-2" />
            <p className="font-medium text-gray-900">Live Chat</p>
            <p className="text-xs text-gray-600 mt-1">Chat with support</p>
          </button>
          
          <button className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl hover:from-blue-100 hover:to-cyan-100 transition-all">
            <Phone className="h-8 w-8 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">Call Us</p>
            <p className="text-xs text-gray-600 mt-1">1-800-MONAY</p>
          </button>
          
          <button className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:from-green-100 hover:to-emerald-100 transition-all">
            <Mail className="h-8 w-8 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">Email</p>
            <p className="text-xs text-gray-600 mt-1">support@monay.com</p>
          </button>
          
          <button className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl hover:from-orange-100 hover:to-red-100 transition-all">
            <Video className="h-8 w-8 text-orange-600 mb-2" />
            <p className="font-medium text-gray-900">Video Tutorials</p>
            <p className="text-xs text-gray-600 mt-1">Watch guides</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                        selectedCategory === category.id
                          ? 'bg-purple-50 text-purple-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{category.count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Recent Tickets */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Your Recent Tickets</h4>
                <div className="space-y-3">
                  {recentTickets.map((ticket) => (
                    <div key={ticket.id} className="text-sm">
                      <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">{ticket.date}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 text-purple-600 text-sm font-medium">
                  View All Tickets
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-3xl p-1 flex space-x-1 mb-6">
              <button
                onClick={() => setActiveTab('faq')}
                className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
                  activeTab === 'faq'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                FAQs
              </button>
              <button
                onClick={() => setActiveTab('articles')}
                className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
                  activeTab === 'articles'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Help Articles
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex-1 py-3 rounded-2xl font-medium transition-all ${
                  activeTab === 'contact'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Contact Support
              </button>
            </div>

            {/* FAQ Content */}
            {activeTab === 'faq' && (
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="bg-white rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-start space-x-3">
                        <HelpCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                        <p className="font-medium text-gray-900">{faq.question}</p>
                      </div>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 pl-8">{faq.answer}</p>
                        <div className="flex items-center space-x-4 mt-4 pl-8">
                          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-purple-600">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Helpful</span>
                          </button>
                          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-purple-600">
                            <ThumbsDown className="h-4 w-4" />
                            <span>Not Helpful</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Articles Content */}
            {activeTab === 'articles' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map((article) => {
                  const Icon = article.icon;
                  return (
                    <div key={article.id} className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                          <Icon className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">{article.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{article.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {article.readTime}
                              </span>
                              <span className="flex items-center">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {article.helpful} found helpful
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Contact Support Content */}
            {activeTab === 'contact' && (
              <div className="bg-white rounded-3xl p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Submit a Support Request</h3>
                
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Brief description of your issue"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>Select a category</option>
                      <option>Account Issues</option>
                      <option>Payment Problems</option>
                      <option>Card Issues</option>
                      <option>Security Concerns</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button type="button" className="py-3 px-4 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100">
                        Low
                      </button>
                      <button type="button" className="py-3 px-4 bg-yellow-50 text-yellow-700 rounded-xl font-medium hover:bg-yellow-100">
                        Medium
                      </button>
                      <button type="button" className="py-3 px-4 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100">
                        High
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Please describe your issue in detail..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all"
                  >
                    Submit Request
                  </button>
                </form>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Expected Response Time</p>
                      <p>We typically respond within 2-4 hours during business hours (9 AM - 6 PM EST)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}