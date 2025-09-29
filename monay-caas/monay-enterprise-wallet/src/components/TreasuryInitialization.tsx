'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, DollarSign, Info, CheckCircle, AlertCircle, TrendingUp, Building, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface TreasuryStatus {
  initialized: boolean;
  walletAddress?: string;
  treeCapacity?: number;
  invoicesCreated?: number;
  tempoBalance?: number;
  circleBalance?: number;
  tempoWalletId?: string;
  circleWalletId?: string;
}

export default function TreasuryInitialization() {
  const [treasury, setTreasury] = useState<TreasuryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initStep, setInitStep] = useState(0);

  const initSteps = [
    'Creating Solana wallet',
    'Setting up merkle tree',
    'Initializing Tempo wallet',
    'Initializing Circle wallet',
    'Finalizing treasury setup'
  ];

  useEffect(() => {
    checkTreasuryStatus();
  }, []);

  const checkTreasuryStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3001/api/enterprise-treasury/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.treasury) {
          setTreasury({
            initialized: true,
            walletAddress: data.data.treasury.solana_tree_address,
            treeCapacity: data.data.treasury.tree_capacity || 1048576,
            invoicesCreated: data.data.treasury.invoices_created || 0,
            tempoBalance: data.data.treasury.tempo_balance || 0,
            circleBalance: data.data.treasury.circle_balance || 0,
            tempoWalletId: data.data.treasury.tempo_wallet_id,
            circleWalletId: data.data.treasury.circle_wallet_id
          });
        } else {
          setTreasury({ initialized: false });
        }
      } else if (response.status === 404 || response.status === 401) {
        setTreasury({ initialized: false });
      }
    } catch (err) {
      console.error('Error checking treasury status:', err);
      setTreasury({ initialized: false });
    } finally {
      setLoading(false);
    }
  };

  const initializeTreasury = async () => {
    setInitializing(true);
    setError(null);
    setSuccess(null);
    setInitStep(0);

    try {
      // Generate a mock Solana wallet address
      const walletAddress = 'Sol' + Math.random().toString(36).substring(2, 15).toUpperCase();

      // Simulate step progression
      for (let i = 0; i < initSteps.length; i++) {
        setInitStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/enterprise-treasury/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          walletAddress
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('🎉 Treasury initialized successfully! You can now create tokenized invoices on Solana.');
        setTimeout(() => {
          checkTreasuryStatus();
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initialize treasury');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize treasury. Please try again.');
    } finally {
      setInitializing(false);
      setInitStep(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!treasury?.initialized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Initialize Enterprise Treasury
            </CardTitle>
            <CardDescription className="text-lg mt-3">
              Set up your Solana-based treasury to tokenize invoices with ultra-low costs
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-3 p-3"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold">1 Million Invoice Capacity</p>
                  <p className="text-sm text-muted-foreground">Compressed NFTs on Solana</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-3 p-3"
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold">$0.00005 Per Invoice</p>
                  <p className="text-sm text-muted-foreground">15x cheaper than Polygon</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-3 p-3"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold">&lt;100ms Settlement</p>
                  <p className="text-sm text-muted-foreground">Instant with Tempo</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-3 p-3"
              >
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Globe className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="font-semibold">Dual Provider Support</p>
                  <p className="text-sm text-muted-foreground">Tempo & Circle USDC</p>
                </div>
              </motion.div>
            </div>

            {/* Cost Alert */}
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-900 dark:text-amber-200">One-Time Setup Cost</AlertTitle>
              <AlertDescription className="text-amber-800 dark:text-amber-300">
                $50 setup fee creates a merkle tree that can store up to 1,048,576 invoices
              </AlertDescription>
            </Alert>

            {/* Initialization Progress */}
            {initializing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3 p-4 bg-primary/5 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{initSteps[initStep]}</span>
                  <span className="text-sm text-muted-foreground">{initStep + 1}/{initSteps.length}</span>
                </div>
                <Progress value={(initStep + 1) * 20} className="h-2" />
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertTitle className="text-green-900 dark:text-green-200">Success!</AlertTitle>
                  <AlertDescription className="text-green-800 dark:text-green-300">{success}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Initialization Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Initialize Button */}
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={initializeTreasury}
                disabled={initializing}
                className="min-w-[250px] h-12 text-lg relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center">
                  {initializing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Initializing Treasury...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-5 w-5" />
                      Initialize Treasury
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Treasury is initialized - show summary
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-2xl">Treasury Initialized</CardTitle>
              <CardDescription className="text-base">
                Your enterprise treasury is ready for tokenized invoices
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Treasury Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Solana Address:</span>
                  <span className="font-mono text-sm">{treasury.walletAddress?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span>{(treasury.treeCapacity || 0).toLocaleString()} invoices</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Used:</span>
                  <span>{treasury.invoicesCreated || 0} invoices</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Provider Wallets</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tempo:</span>
                  <Badge variant="secondary">
                    ${(treasury.tempoBalance || 0).toFixed(2)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Circle:</span>
                  <Badge variant="outline">
                    ${(treasury.circleBalance || 0).toFixed(2)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Balance:</span>
                  <Badge className="bg-green-600">
                    ${((treasury.tempoBalance || 0) + (treasury.circleBalance || 0)).toFixed(2)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}