# Pricing Calculator Implementation Guide

## Overview
Interactive pricing calculator that demonstrates Monay's cost advantages compared to competitors, with real-time savings calculations and visual comparisons.

## Technical Implementation

### Calculator Component Structure
```typescript
// /src/components/PricingCalculator.tsx
interface PricingCalculatorProps {
  product: 'id' | 'caas' | 'waas';
  showComparison: boolean;
  includePilotProgram: boolean;
}

interface CalculatorState {
  selectedProduct: string;
  volume: number;
  competitor: string;
  monayPrice: number;
  competitorPrice: number;
  savings: number;
  savingsPercentage: number;
}
```

### Pricing Data Structure
```typescript
// /src/data/pricingData.ts
export const pricingTiers = {
  monayID: {
    tiers: [
      { min: 0, max: 2500, price: 0, perUnit: 0 },
      { min: 2501, max: 25000, price: 149, perUnit: 0.006 },
      { min: 25001, max: 100000, price: 499, perUnit: 0.005 },
      { min: 100001, max: Infinity, price: 999, perUnit: 0.003 }
    ],
    competitors: {
      auth0: {
        tiers: [
          { min: 0, max: 7000, price: 0, perUnit: 0 },
          { min: 7001, max: 10000, price: 240, perUnit: 0.024 },
          { min: 10001, max: 50000, price: 700, perUnit: 0.014 },
          { min: 50001, max: Infinity, price: 2100, perUnit: 0.008 }
        ]
      },
      okta: {
        tiers: [
          { min: 0, max: 0, price: 0, perUnit: 0 },
          { min: 1, max: 1000, price: 1500, perUnit: 1.5 },
          { min: 1001, max: 10000, price: 3000, perUnit: 0.3 },
          { min: 10001, max: Infinity, price: 5000, perUnit: 0.15 }
        ]
      },
      firebase: {
        tiers: [
          { min: 0, max: 50000, price: 0, perUnit: 0 },
          { min: 50001, max: 100000, price: 0, perUnit: 0.0006 },
          { min: 100001, max: Infinity, price: 0, perUnit: 0.0001 }
        ]
      }
    }
  },
  monayCaaS: {
    tiers: [
      { min: 0, max: 50000, price: 2499, perUnit: 0.05 },
      { min: 50001, max: 500000, price: 9999, perUnit: 0.02 },
      { min: 500001, max: Infinity, price: 24999, perUnit: 0.01 }
    ],
    competitors: {
      circle: {
        tiers: [
          { min: 0, max: 100000, price: 50000, perUnit: 0.5 },
          { min: 100001, max: Infinity, price: 100000, perUnit: 0.25 }
        ]
      },
      fireblocks: {
        tiers: [
          { min: 0, max: Infinity, price: 150000, perUnit: 0.1 }
        ]
      }
    }
  },
  monayWaaS: {
    tiers: [
      { min: 0, max: 1000, price: 0, perUnit: 0.15 },
      { min: 1001, max: 10000, price: 299, perUnit: 0.10 },
      { min: 10001, max: 50000, price: 999, perUnit: 0.05 },
      { min: 50001, max: Infinity, price: 2999, perUnit: 0.02 }
    ],
    competitors: {
      synapse: {
        tiers: [
          { min: 0, max: 1000, price: 1500, perUnit: 0.50 },
          { min: 1001, max: 10000, price: 5000, perUnit: 0.35 },
          { min: 10001, max: Infinity, price: 10000, perUnit: 0.25 }
        ]
      },
      marqeta: {
        tiers: [
          { min: 0, max: 5000, price: 5000, perUnit: 0.45 },
          { min: 5001, max: Infinity, price: 15000, perUnit: 0.30 }
        ]
      }
    }
  }
};
```

### Calculator Logic
```typescript
// /src/utils/pricingCalculator.ts
export function calculatePrice(
  product: string,
  volume: number,
  provider: string
): number {
  const productData = pricingTiers[product];
  const tierData = provider === 'monay' 
    ? productData.tiers 
    : productData.competitors[provider].tiers;
  
  for (const tier of tierData) {
    if (volume >= tier.min && volume <= tier.max) {
      const basePrice = tier.price;
      const additionalUnits = Math.max(0, volume - tier.min);
      const variablePrice = additionalUnits * tier.perUnit;
      return basePrice + variablePrice;
    }
  }
  
  return 0;
}

export function calculateSavings(
  monayPrice: number,
  competitorPrice: number,
  includePilotProgram: boolean = false
): {
  savings: number;
  savingsPercentage: number;
  pilotSavings: number;
  totalSavings: number;
} {
  const savings = competitorPrice - monayPrice;
  const savingsPercentage = (savings / competitorPrice) * 100;
  const pilotSavings = includePilotProgram ? monayPrice * 0.75 : 0;
  const totalSavings = savings + pilotSavings;
  
  return {
    savings,
    savingsPercentage,
    pilotSavings,
    totalSavings
  };
}
```

### React Component
```tsx
// /src/components/PricingCalculator.tsx
import React, { useState, useEffect } from 'react';
import { calculatePrice, calculateSavings } from '@/utils/pricingCalculator';
import { motion } from 'framer-motion';

export default function PricingCalculator() {
  const [selectedProduct, setSelectedProduct] = useState('monayID');
  const [volume, setVolume] = useState(10000);
  const [competitor, setCompetitor] = useState('auth0');
  const [results, setResults] = useState(null);
  const [showPilotProgram, setShowPilotProgram] = useState(true);

  useEffect(() => {
    const monayPrice = calculatePrice(selectedProduct, volume, 'monay');
    const competitorPrice = calculatePrice(selectedProduct, volume, competitor);
    const savings = calculateSavings(monayPrice, competitorPrice, showPilotProgram);
    
    setResults({
      monayMonthly: monayPrice,
      monayAnnual: monayPrice * 12,
      competitorMonthly: competitorPrice,
      competitorAnnual: competitorPrice * 12,
      ...savings
    });
  }, [selectedProduct, volume, competitor, showPilotProgram]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Calculate Your Savings
      </h2>
      
      {/* Step 1: Product Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Step 1: Select Your Product</h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedProduct('monayID')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedProduct === 'monayID' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">Monay ID</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Authentication</div>
          </button>
          <button
            onClick={() => setSelectedProduct('monayCaaS')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedProduct === 'monayCaaS' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">Monay CaaS</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Stablecoin Platform</div>
          </button>
          <button
            onClick={() => setSelectedProduct('monayWaaS')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedProduct === 'monayWaaS' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="font-semibold">Monay WaaS</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Wallet Infrastructure</div>
          </button>
        </div>
      </div>

      {/* Step 2: Volume Input */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">
          Step 2: Enter Your {getVolumeLabel(selectedProduct)}
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={getMinVolume(selectedProduct)}
            max={getMaxVolume(selectedProduct)}
            step={getStepVolume(selectedProduct)}
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
        <div className="text-sm text-gray-600 mt-2">
          {volume.toLocaleString()} {getVolumeUnit(selectedProduct)}
        </div>
      </div>

      {/* Step 3: Competitor Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Step 3: Compare with Competitors</h3>
        <select
          value={competitor}
          onChange={(e) => setCompetitor(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          {getCompetitors(selectedProduct).map(comp => (
            <option key={comp.value} value={comp.value}>
              {comp.label}
            </option>
          ))}
        </select>
      </div>

      {/* Results Display */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl"
        >
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
            
            {showPilotProgram && (
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
            <button className="flex-1 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Join Pilot Program
            </button>
            <button className="flex-1 bg-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors">
              Get Custom Quote
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Helper functions
function getVolumeLabel(product: string): string {
  switch(product) {
    case 'monayID': return 'Monthly Active Users';
    case 'monayCaaS': return 'Monthly Transactions';
    case 'monayWaaS': return 'Active Wallets';
    default: return 'Volume';
  }
}

function getVolumeUnit(product: string): string {
  switch(product) {
    case 'monayID': return 'MAU';
    case 'monayCaaS': return 'transactions/month';
    case 'monayWaaS': return 'wallets';
    default: return 'units';
  }
}

function getMinVolume(product: string): number {
  switch(product) {
    case 'monayID': return 100;
    case 'monayCaaS': return 1000;
    case 'monayWaaS': return 10;
    default: return 1;
  }
}

function getMaxVolume(product: string): number {
  switch(product) {
    case 'monayID': return 1000000;
    case 'monayCaaS': return 10000000;
    case 'monayWaaS': return 100000;
    default: return 100000;
  }
}

function getStepVolume(product: string): number {
  switch(product) {
    case 'monayID': return 100;
    case 'monayCaaS': return 1000;
    case 'monayWaaS': return 10;
    default: return 1;
  }
}

function getCompetitors(product: string): Array<{value: string, label: string}> {
  switch(product) {
    case 'monayID': 
      return [
        { value: 'auth0', label: 'Auth0' },
        { value: 'okta', label: 'Okta' },
        { value: 'firebase', label: 'Firebase Auth' }
      ];
    case 'monayCaaS':
      return [
        { value: 'circle', label: 'Circle' },
        { value: 'fireblocks', label: 'Fireblocks' },
        { value: 'paxos', label: 'Paxos' }
      ];
    case 'monayWaaS':
      return [
        { value: 'synapse', label: 'Synapse' },
        { value: 'marqeta', label: 'Marqeta' },
        { value: 'unit', label: 'Unit' }
      ];
    default:
      return [];
  }
}

function getCompetitorName(competitor: string): string {
  const names = {
    auth0: 'Auth0',
    okta: 'Okta',
    firebase: 'Firebase',
    circle: 'Circle',
    fireblocks: 'Fireblocks',
    paxos: 'Paxos',
    synapse: 'Synapse',
    marqeta: 'Marqeta',
    unit: 'Unit'
  };
  return names[competitor] || competitor;
}
```

### Pricing Page Implementation
```tsx
// /src/app/pricing/page.tsx
import PricingCalculator from '@/components/PricingCalculator';
import PricingTabs from '@/components/PricingTabs';
import ComparisonTables from '@/components/ComparisonTables';
import ROICalculator from '@/components/ROICalculator';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold text-center mb-4">
            Save 50-90% Compared to Traditional Providers
          </h1>
          <p className="text-xl text-center opacity-90">
            Transparent pricing that scales with your business
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 -mt-10">
        <div className="container mx-auto px-4">
          <PricingCalculator />
        </div>
      </section>

      {/* Pricing Tabs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Detailed Pricing Plans
          </h2>
          <PricingTabs />
        </div>
      </section>

      {/* Comparison Tables */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Feature Comparison
          </h2>
          <ComparisonTables />
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Calculate Your ROI
          </h2>
          <ROICalculator />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Customers Save
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <p className="text-lg mb-4">
                "Saved $500K annually switching from Auth0"
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                - Enterprise SaaS Company
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <p className="text-lg mb-4">
                "Reduced payment costs by 80%"
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                - Fintech Startup
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
              <p className="text-lg mb-4">
                "Cut development time by 6 months"
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                - Digital Bank
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Save?
          </h2>
          <p className="text-xl mb-8">
            Join the Pilot Program and get 75% off your first year
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Join Pilot Program
            </button>
            <button className="bg-transparent border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
```

## Features to Implement

### 1. Real-time Price Updates
- Live calculation as user adjusts volume slider
- Smooth animations for price changes
- Currency formatting with locale support

### 2. Visual Comparisons
- Bar charts showing price differences
- Line graphs for scaling costs
- Pie charts for feature comparisons

### 3. Export Functionality
- Download comparison as PDF
- Email quote to stakeholders
- Save calculation for later

### 4. Advanced Features
- Multi-product bundle calculator
- Annual vs monthly toggle
- Custom enterprise inputs
- API cost estimator

### 5. Integrations
- HubSpot form submission for quotes
- Calendly scheduling for demos
- Segment analytics tracking
- A/B testing different calculator layouts

## Deployment Checklist

- [ ] Implement calculator component
- [ ] Add pricing data management
- [ ] Create comparison visualizations
- [ ] Set up form validations
- [ ] Add analytics tracking
- [ ] Implement responsive design
- [ ] Test across browsers
- [ ] Optimize for performance
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Create unit tests
- [ ] Add E2E tests
- [ ] Deploy to Vercel
- [ ] Monitor conversion rates
- [ ] A/B test variations

## Success Metrics

- Calculator engagement rate > 60%
- Completion rate > 40%
- Pilot Program conversion > 15%
- Average time on page > 5 minutes
- Quote requests > 100/month

## SEO Optimization

### Target Keywords
- "auth0 pricing calculator"
- "okta alternative pricing"
- "stablecoin platform cost"
- "wallet infrastructure pricing"
- "authentication cost comparison"

### Meta Tags
```html
<title>Pricing Calculator | Save 50-90% vs Auth0, Okta | Monay</title>
<meta name="description" content="Calculate your savings with Monay. Compare pricing with Auth0, Okta, Circle, and more. Save 50-90% on authentication, stablecoin, and wallet infrastructure.">
<meta property="og:title" content="Monay Pricing Calculator - Save 50-90% on Digital Infrastructure">
<meta property="og:description" content="Interactive pricing calculator. Compare costs with Auth0, Okta, Circle, Marqeta. Join Pilot Program for 75% off.">
```

### Schema Markup
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Monay Pricing Calculator",
  "description": "Calculate and compare pricing for authentication, stablecoin, and wallet infrastructure",
  "applicationCategory": "FinanceApplication",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "0",
    "highPrice": "24999"
  }
}
```