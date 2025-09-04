"use client";

import React, { useState, useEffect } from 'react';

interface PricingData {
  monayMonthly: number;
  monayAnnual: number;
  competitorMonthly: number;
  competitorAnnual: number;
  savings: number;
  savingsPercentage: number;
  pilotSavings: number;
  totalSavings: number;
}

const pricingTiers = {
  monayID: {
    tiers: [
      { min: 0, max: 2500, price: 0, perUnit: 0 },
      { min: 2501, max: 25000, price: 149, perUnit: 0.006 },
      { min: 25001, max: 100000, price: 499, perUnit: 0.005 },
      { min: 100001, max: Infinity, price: 999, perUnit: 0.003 }
    ],
    competitors: {
      auth0: {
        name: 'Auth0',
        tiers: [
          { min: 0, max: 7000, price: 0, perUnit: 0 },
          { min: 7001, max: 10000, price: 240, perUnit: 0.024 },
          { min: 10001, max: 50000, price: 700, perUnit: 0.014 },
          { min: 50001, max: Infinity, price: 2100, perUnit: 0.008 }
        ]
      },
      okta: {
        name: 'Okta',
        tiers: [
          { min: 0, max: 0, price: 0, perUnit: 0 },
          { min: 1, max: 1000, price: 1500, perUnit: 1.5 },
          { min: 1001, max: 10000, price: 3000, perUnit: 0.3 },
          { min: 10001, max: Infinity, price: 5000, perUnit: 0.15 }
        ]
      },
      firebase: {
        name: 'Firebase Auth',
        tiers: [
          { min: 0, max: 50000, price: 0, perUnit: 0.0055 },
          { min: 50001, max: 100000, price: 275, perUnit: 0.0045 },
          { min: 100001, max: Infinity, price: 500, perUnit: 0.0025 }
        ]
      }
    }
  },
  monayCaaS: {
    tiers: [
      { min: 0, max: 50000, price: 2499, perUnit: 0 },
      { min: 50001, max: 500000, price: 9999, perUnit: 0 },
      { min: 500001, max: Infinity, price: 24999, perUnit: 0 }
    ],
    competitors: {
      circle: {
        name: 'Circle',
        tiers: [
          { min: 0, max: 100000, price: 15000, perUnit: 0.02 },
          { min: 100001, max: Infinity, price: 25000, perUnit: 0.01 }
        ]
      },
      fireblocks: {
        name: 'Fireblocks',
        tiers: [
          { min: 0, max: Infinity, price: 12500, perUnit: 0.015 }
        ]
      },
      paxos: {
        name: 'Paxos',
        tiers: [
          { min: 0, max: Infinity, price: 10000, perUnit: 0.02 }
        ]
      }
    }
  },
  monayWaaS: {
    tiers: [
      { min: 0, max: 1000, price: 0, perUnit: 0 },
      { min: 1001, max: 10000, price: 299, perUnit: 0 },
      { min: 10001, max: 50000, price: 999, perUnit: 0 },
      { min: 50001, max: Infinity, price: 2999, perUnit: 0 }
    ],
    competitors: {
      synapse: {
        name: 'Synapse',
        tiers: [
          { min: 0, max: 1000, price: 1500, perUnit: 0.25 },
          { min: 1001, max: 10000, price: 3000, perUnit: 0.15 },
          { min: 10001, max: Infinity, price: 5000, perUnit: 0.10 }
        ]
      },
      marqeta: {
        name: 'Marqeta',
        tiers: [
          { min: 0, max: 5000, price: 2500, perUnit: 0.20 },
          { min: 5001, max: Infinity, price: 5000, perUnit: 0.15 }
        ]
      },
      unit: {
        name: 'Unit',
        tiers: [
          { min: 0, max: 1000, price: 500, perUnit: 0.15 },
          { min: 1001, max: 10000, price: 1500, perUnit: 0.10 },
          { min: 10001, max: Infinity, price: 3000, perUnit: 0.08 }
        ]
      }
    }
  }
};

function calculatePrice(product: string, volume: number, provider: string): number {
  const productData = pricingTiers[product as keyof typeof pricingTiers];
  if (!productData) return 0;
  
  let tierData;
  if (provider === 'monay') {
    tierData = productData.tiers;
  } else {
    const competitorData = productData.competitors[provider as keyof typeof productData.competitors];
    tierData = competitorData ? (competitorData as any).tiers : null;
  }
  
  if (!tierData) return 0;
  
  for (const tier of tierData) {
    if (volume >= tier.min && volume <= tier.max) {
      // For Firebase and similar per-unit pricing, calculate based on total volume
      if (provider === 'firebase' && product === 'monayID') {
        return volume * tier.perUnit;
      }
      
      const basePrice = tier.price;
      const additionalUnits = Math.max(0, volume - tier.min);
      const variablePrice = additionalUnits * tier.perUnit;
      return basePrice + variablePrice;
    }
  }
  
  return 0;
}

function calculateSavings(
  monayPrice: number,
  competitorPrice: number,
  includePilotProgram: boolean = false
): PricingData {
  const savings = competitorPrice - monayPrice;
  const savingsPercentage = competitorPrice > 0 ? (savings / competitorPrice) * 100 : 0;
  const pilotSavings = includePilotProgram ? monayPrice * 0.75 : 0;
  const totalSavings = savings + pilotSavings;
  
  return {
    monayMonthly: monayPrice,
    monayAnnual: monayPrice * 12,
    competitorMonthly: competitorPrice,
    competitorAnnual: competitorPrice * 12,
    savings,
    savingsPercentage,
    pilotSavings,
    totalSavings
  };
}

export default function PricingCalculator({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [selectedProduct, setSelectedProduct] = useState('monayID');
  const [volume, setVolume] = useState(10000);
  const [competitor, setCompetitor] = useState('auth0');
  const [results, setResults] = useState<PricingData | null>(null);
  const [showPilotProgram, setShowPilotProgram] = useState(true);

  useEffect(() => {
    const monayPrice = calculatePrice(selectedProduct, volume, 'monay');
    const competitorPrice = calculatePrice(selectedProduct, volume, competitor);
    const savings = calculateSavings(monayPrice, competitorPrice, showPilotProgram);
    setResults(savings);
  }, [selectedProduct, volume, competitor, showPilotProgram]);

  const getVolumeLabel = (product: string): string => {
    switch(product) {
      case 'monayID': return 'Monthly Active Users';
      case 'monayCaaS': return 'Monthly Transactions';
      case 'monayWaaS': return 'Active Wallets';
      default: return 'Volume';
    }
  };

  const getVolumeUnit = (product: string): string => {
    switch(product) {
      case 'monayID': return 'MAU';
      case 'monayCaaS': return 'transactions/month';
      case 'monayWaaS': return 'wallets';
      default: return 'units';
    }
  };

  const getCompetitors = (product: string) => {
    const productData = pricingTiers[product as keyof typeof pricingTiers];
    if (!productData) return [];
    return Object.entries(productData.competitors).map(([key, value]) => ({
      value: key,
      label: value.name
    }));
  };

  const getCompetitorName = (comp: string): string => {
    const productData = pricingTiers[selectedProduct as keyof typeof pricingTiers];
    if (!productData) return comp;
    const competitorData = productData.competitors[comp as keyof typeof productData.competitors];
    return competitorData ? (competitorData as any).name : comp;
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
      <h2 className={`text-3xl font-bold mb-6 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Calculate Your Savings
      </h2>
      
      {/* Step 1: Product Selection */}
      <div className="mb-8">
        <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 1: Select Your Product</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setSelectedProduct('monayID');
              setCompetitor('auth0');
              setVolume(10000);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedProduct === 'monayID' 
                ? 'border-blue-500 bg-blue-500 dark:bg-blue-900' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className={`font-semibold ${selectedProduct === 'monayID' ? 'text-white' : (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Monay ID</div>
            <div className={`text-sm ${selectedProduct === 'monayID' ? 'text-white/90' : (isDarkMode ? 'text-gray-400' : 'text-gray-800')}`}>Authentication</div>
          </button>
          <button
            onClick={() => {
              setSelectedProduct('monayCaaS');
              setCompetitor('circle');
              setVolume(100000);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedProduct === 'monayCaaS' 
                ? 'border-blue-500 bg-blue-500 dark:bg-blue-900' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className={`font-semibold ${selectedProduct === 'monayCaaS' ? 'text-white' : (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Monay CaaS</div>
            <div className={`text-sm ${selectedProduct === 'monayCaaS' ? 'text-white/90' : (isDarkMode ? 'text-gray-400' : 'text-gray-800')}`}>Stablecoin Platform</div>
          </button>
          <button
            onClick={() => {
              setSelectedProduct('monayWaaS');
              setCompetitor('synapse');
              setVolume(5000);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedProduct === 'monayWaaS' 
                ? 'border-blue-500 bg-blue-500 dark:bg-blue-900' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className={`font-semibold ${selectedProduct === 'monayWaaS' ? 'text-white' : (isDarkMode ? 'text-white' : 'text-gray-900')}`}>Monay WaaS</div>
            <div className={`text-sm ${selectedProduct === 'monayWaaS' ? 'text-white/90' : (isDarkMode ? 'text-gray-400' : 'text-gray-800')}`}>Wallet Infrastructure</div>
          </button>
        </div>
      </div>

      {/* Step 2: Volume Input */}
      <div className="mb-8">
        <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Step 2: Enter Your {getVolumeLabel(selectedProduct)}
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={100}
            max={selectedProduct === 'monayID' ? 1000000 : selectedProduct === 'monayCaaS' ? 10000000 : 100000}
            step={selectedProduct === 'monayID' ? 100 : selectedProduct === 'monayCaaS' ? 1000 : 10}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1"
          />
          <input
            type="number"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-32 px-3 py-2 border rounded-lg"
          />
        </div>
        <div className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-800'}`}>
          {volume.toLocaleString()} {getVolumeUnit(selectedProduct)}
        </div>
      </div>

      {/* Step 3: Competitor Selection */}
      <div className="mb-8">
        <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Step 3: Compare with Competitors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {getCompetitors(selectedProduct).map(comp => (
            <button
              key={comp.value}
              onClick={() => setCompetitor(comp.value)}
              className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                competitor === comp.value
                  ? 'border-purple-500 bg-purple-500 text-white'
                  : isDarkMode 
                    ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-purple-400'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-purple-400'
              }`}
            >
              {comp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Display */}
      {results && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl">
          <h3 className="text-2xl font-bold mb-4">Your Annual Cost Comparison</h3>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm opacity-90">Monay Annual Cost</div>
              <div className="text-3xl font-bold">
                ${results.monayAnnual.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-90">{getCompetitorName(competitor)} Annual Cost</div>
              <div className="text-3xl font-bold">
                ${results.competitorAnnual.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            <div className="text-xl mb-2">
              You Save: <span className="font-bold">
                ${(results.savings * 12).toLocaleString()} ({results.savingsPercentage.toFixed(1)}%)
              </span>
            </div>
            
            {showPilotProgram && results.pilotSavings > 0 && (
              <div className="bg-white/10 p-4 rounded-lg mt-4">
                <div className="text-lg font-semibold mb-2">
                  🎉 With Pilot Program (75% off Year 1)
                </div>
                <div className="text-2xl font-bold">
                  Total First Year Savings: ${(results.totalSavings * 12).toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <a href="#pilot-program" className="flex-1 text-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Join Pilot Program
            </a>
            <button className="flex-1 bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors">
              Get Custom Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}