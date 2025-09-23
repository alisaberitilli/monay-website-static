'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Zap,
  Clock,
  DollarSign,
  Shield,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Globe,
  CreditCard,
  Banknote,
  Wifi,
  Building,
  Coins,
  ArrowRight,
  Info,
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface PaymentRail {
  id: string;
  name: string;
  type: 'fiat' | 'crypto' | 'hybrid';
  speed: 'instant' | 'seconds' | 'minutes' | 'hours' | 'days';
  cost: number;
  minAmount: number;
  maxAmount: number;
  availability: number; // percentage
  features: string[];
  restrictions?: string[];
  icon: React.ElementType;
  color: string;
  estimatedTime?: string;
  complianceLevel: 'low' | 'medium' | 'high';
}

interface PaymentRailSelectorProps {
  amount: number;
  currency?: string;
  recipientType?: 'individual' | 'business' | 'government';
  recipientCountry?: string;
  purpose?: string;
  onRailSelected?: (rail: PaymentRail) => void;
  showRecommendation?: boolean;
}

const PaymentRailSelector: React.FC<PaymentRailSelectorProps> = ({
  amount = 1000,
  currency = 'USD',
  recipientType = 'individual',
  recipientCountry = 'US',
  purpose = 'standard',
  onRailSelected,
  showRecommendation = true
}) => {
  const [selectedRail, setSelectedRail] = useState<string | null>(null);
  const [recommendedRail, setRecommendedRail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [railStatus, setRailStatus] = useState<Record<string, 'available' | 'degraded' | 'unavailable'>>({});

  // Available payment rails
  const paymentRails: PaymentRail[] = [
    {
      id: 'fednow',
      name: 'FedNow',
      type: 'fiat',
      speed: 'instant',
      cost: 0.50,
      minAmount: 0.01,
      maxAmount: 1000000,
      availability: 99.9,
      features: ['24/7/365 availability', 'Instant settlement', 'Federal Reserve backed'],
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      estimatedTime: '< 5 seconds',
      complianceLevel: 'high'
    },
    {
      id: 'rtp',
      name: 'RTP (Real-Time Payments)',
      type: 'fiat',
      speed: 'instant',
      cost: 0.45,
      minAmount: 0.01,
      maxAmount: 1000000,
      availability: 99.5,
      features: ['Real-time clearing', 'Request for payment', 'Rich data'],
      icon: Clock,
      color: 'from-blue-500 to-indigo-600',
      estimatedTime: '< 10 seconds',
      complianceLevel: 'high'
    },
    {
      id: 'ach-same-day',
      name: 'ACH Same Day',
      type: 'fiat',
      speed: 'hours',
      cost: 0.75,
      minAmount: 0.01,
      maxAmount: 1000000,
      availability: 98,
      features: ['Same business day', 'Batch processing', 'Lower cost'],
      icon: Building,
      color: 'from-green-500 to-emerald-600',
      estimatedTime: '2-4 hours',
      complianceLevel: 'medium'
    },
    {
      id: 'ach-standard',
      name: 'ACH Standard',
      type: 'fiat',
      speed: 'days',
      cost: 0.25,
      minAmount: 0.01,
      maxAmount: 25000000,
      availability: 99,
      features: ['Low cost', 'High limits', 'Reversible'],
      restrictions: ['Business days only', '2-3 day settlement'],
      icon: Banknote,
      color: 'from-gray-500 to-gray-700',
      estimatedTime: '2-3 business days',
      complianceLevel: 'medium'
    },
    {
      id: 'wire',
      name: 'Wire Transfer',
      type: 'fiat',
      speed: 'hours',
      cost: 25,
      minAmount: 100,
      maxAmount: 100000000,
      availability: 95,
      features: ['High limits', 'International', 'Irrevocable'],
      restrictions: ['High fees', 'Business hours'],
      icon: Globe,
      color: 'from-purple-500 to-pink-600',
      estimatedTime: '2-24 hours',
      complianceLevel: 'high'
    },
    {
      id: 'card',
      name: 'Debit Card Push',
      type: 'fiat',
      speed: 'instant',
      cost: 2.5,
      minAmount: 0.01,
      maxAmount: 5000,
      availability: 98.5,
      features: ['Instant funding', 'Wide acceptance', 'Consumer friendly'],
      restrictions: ['Higher fees', 'Daily limits'],
      icon: CreditCard,
      color: 'from-red-500 to-rose-600',
      estimatedTime: '< 30 seconds',
      complianceLevel: 'low'
    },
    {
      id: 'base-usdc',
      name: 'Base USDC',
      type: 'crypto',
      speed: 'seconds',
      cost: 0.01,
      minAmount: 0.01,
      maxAmount: 10000000,
      availability: 99.99,
      features: ['Low fees', 'Global reach', 'Programmable', '24/7'],
      icon: Coins,
      color: 'from-cyan-500 to-blue-600',
      estimatedTime: '< 2 seconds',
      complianceLevel: 'medium'
    },
    {
      id: 'solana-usdc',
      name: 'Solana USDC',
      type: 'crypto',
      speed: 'instant',
      cost: 0.001,
      minAmount: 0.01,
      maxAmount: 10000000,
      availability: 99.95,
      features: ['Sub-second', 'Minimal fees', 'High throughput'],
      icon: Zap,
      color: 'from-purple-500 to-indigo-600',
      estimatedTime: '< 1 second',
      complianceLevel: 'medium'
    }
  ];

  // Intelligent rail selection based on parameters
  useEffect(() => {
    const selectOptimalRail = () => {
      let recommended = 'ach-standard'; // Default

      // Emergency disbursements - need speed
      if (purpose === 'emergency') {
        recommended = amount < 5000 ? 'card' : 'fednow';
      }
      // Government benefits - compliance and cost
      else if (purpose === 'government-benefits') {
        recommended = amount < 1000 ? 'ach-same-day' : 'fednow';
      }
      // International - need wire or crypto
      else if (recipientCountry !== 'US') {
        recommended = recipientType === 'business' ? 'wire' : 'base-usdc';
      }
      // Large B2B - wire or ACH
      else if (recipientType === 'business' && amount > 50000) {
        recommended = 'wire';
      }
      // Small instant payments
      else if (amount < 500 && purpose === 'instant') {
        recommended = 'solana-usdc';
      }
      // Standard domestic
      else if (amount < 10000) {
        recommended = purpose === 'instant' ? 'fednow' : 'ach-same-day';
      }
      // Large domestic
      else {
        recommended = 'wire';
      }

      setRecommendedRail(recommended);
    };

    selectOptimalRail();
  }, [amount, recipientType, recipientCountry, purpose]);

  // Check rail availability
  useEffect(() => {
    const checkRailStatus = async () => {
      setLoading(true);
      try {
        // In production, this would call the API
        // const response = await fetch('/api/payments/rails/status');
        // const data = await response.json();

        // Mock status for demonstration
        const mockStatus: Record<string, 'available' | 'degraded' | 'unavailable'> = {
          'fednow': 'available',
          'rtp': 'available',
          'ach-same-day': 'available',
          'ach-standard': 'available',
          'wire': recipientCountry === 'US' ? 'available' : 'degraded',
          'card': 'available',
          'base-usdc': 'available',
          'solana-usdc': 'available'
        };

        setRailStatus(mockStatus);
      } catch (error) {
        console.error('Failed to check rail status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkRailStatus();

    // Refresh status every 30 seconds
    const interval = setInterval(checkRailStatus, 30000);
    return () => clearInterval(interval);
  }, [recipientCountry]);

  const handleRailSelection = async (rail: PaymentRail) => {
    setSelectedRail(rail.id);

    if (onRailSelected) {
      onRailSelected(rail);
    }

    // Initiate payment processing
    try {
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          railId: rail.id,
          amount,
          currency,
          recipientType,
          recipientCountry,
          purpose
        })
      });

      const data = await response.json();
      console.log('Payment initiated:', data);
    } catch (error) {
      console.error('Payment initiation failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'degraded': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'unavailable': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getSpeedBadge = (speed: string) => {
    switch (speed) {
      case 'instant': return { color: 'bg-green-500', text: 'Instant' };
      case 'seconds': return { color: 'bg-blue-500', text: 'Seconds' };
      case 'minutes': return { color: 'bg-yellow-500', text: 'Minutes' };
      case 'hours': return { color: 'bg-orange-500', text: 'Hours' };
      case 'days': return { color: 'bg-gray-500', text: 'Days' };
      default: return { color: 'bg-gray-500', text: 'Unknown' };
    }
  };

  const formatCost = (cost: number) => {
    if (cost < 1) {
      return `$${cost.toFixed(3)}`;
    } else if (cost < 10) {
      return `$${cost.toFixed(2)}`;
    } else {
      return `$${cost.toFixed(0)}`;
    }
  };

  const isRailAvailable = (rail: PaymentRail) => {
    const status = railStatus[rail.id];
    const meetsAmount = amount >= rail.minAmount && amount <= rail.maxAmount;
    const isAvailable = status === 'available' || status === 'degraded';

    return meetsAmount && isAvailable;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Select Payment Rail</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose the optimal payment method for your transaction
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {currency} {amount.toLocaleString()}
          </Badge>
          <Badge variant="outline">
            To: {recipientCountry}
          </Badge>
        </div>
      </div>

      {/* Recommendation Banner */}
      {showRecommendation && recommendedRail && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  Recommended: {paymentRails.find(r => r.id === recommendedRail)?.name}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Based on amount, destination, and speed requirements
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  const rail = paymentRails.find(r => r.id === recommendedRail);
                  if (rail) handleRailSelection(rail);
                }}
              >
                Use Recommended
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Rails Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentRails.map((rail) => {
          const Icon = rail.icon;
          const status = railStatus[rail.id] || 'available';
          const isRecommended = rail.id === recommendedRail;
          const isSelected = rail.id === selectedRail;
          const isAvailable = isRailAvailable(rail);
          const speedBadge = getSpeedBadge(rail.speed);

          return (
            <motion.div
              key={rail.id}
              whileHover={{ scale: isAvailable ? 1.02 : 1 }}
              whileTap={{ scale: isAvailable ? 0.98 : 1 }}
            >
              <Card
                className={`
                  cursor-pointer transition-all relative overflow-hidden
                  ${isSelected
                    ? 'ring-2 ring-blue-500 border-blue-500'
                    : isRecommended
                    ? 'ring-1 ring-blue-300 border-blue-300'
                    : 'hover:shadow-lg'
                  }
                  ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => isAvailable && handleRailSelection(rail)}
              >
                {isRecommended && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl">
                    Recommended
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${rail.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{rail.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {rail.type}
                          </Badge>
                          <Badge className={getStatusColor(status)}>
                            {status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Speed & Cost */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Speed</p>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${speedBadge.color}`} />
                          <span className="text-sm font-medium">{rail.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Cost</p>
                        <span className="text-sm font-medium">{formatCost(rail.cost)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Limits */}
                  <div className="text-xs text-muted-foreground">
                    Limits: ${rail.minAmount.toLocaleString()} - ${rail.maxAmount.toLocaleString()}
                  </div>

                  {/* Availability */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Availability</span>
                      <span>{rail.availability}%</span>
                    </div>
                    <Progress value={rail.availability} className="h-1" />
                  </div>

                  {/* Features */}
                  <div className="space-y-1">
                    {rail.features.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {rail.restrictions && rail.restrictions.slice(0, 1).map((restriction, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-xs">
                        <AlertCircle className="h-3 w-3 text-yellow-500" />
                        <span className="text-muted-foreground">{restriction}</span>
                      </div>
                    ))}
                  </div>

                  {/* Compliance Level */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Shield className={`h-4 w-4 ${
                        rail.complianceLevel === 'high'
                          ? 'text-green-500'
                          : rail.complianceLevel === 'medium'
                          ? 'text-yellow-500'
                          : 'text-gray-500'
                      }`} />
                      <span className="text-xs capitalize">{rail.complianceLevel} compliance</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Checking rail availability...</span>
        </div>
      )}

      {/* Info Box */}
      <Card className="border-gray-200 bg-gray-50/50 dark:bg-gray-900/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-1">Payment Rail Selection</p>
              <p>Our intelligent routing system analyzes transaction parameters including amount,
                destination, speed requirements, and compliance needs to recommend the optimal payment rail.
                All rails are monitored in real-time for availability and performance.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentRailSelector;