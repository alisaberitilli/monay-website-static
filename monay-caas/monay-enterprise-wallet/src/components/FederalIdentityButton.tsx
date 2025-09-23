'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  Shield,
  UserCheck,
  Building,
  CreditCard,
  FileCheck,
  Briefcase,
  Plane,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface IdentityProvider {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'available' | 'connected' | 'pending' | 'unavailable';
  endpoint: string;
  requiredFor?: string[];
}

interface FederalIdentityButtonProps {
  purpose?: 'login' | 'verification' | 'enrollment';
  requiredProviders?: string[];
  onVerificationComplete?: (data: any) => void;
}

const FederalIdentityButton: React.FC<FederalIdentityButtonProps> = ({
  purpose = 'verification',
  requiredProviders = [],
  onVerificationComplete
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [verifiedProviders, setVerifiedProviders] = useState<string[]>([]);

  // Federal identity providers that will be handled by Monay-ID service
  const providers: IdentityProvider[] = [
    {
      id: 'login-gov',
      name: 'Login.gov',
      description: 'Secure federal government identity verification',
      icon: Shield,
      status: 'available',
      endpoint: '/api/auth/federal/login-gov', // Proxies to Monay-ID
      requiredFor: ['government-benefits', 'federal-programs']
    },
    {
      id: 'id-me',
      name: 'ID.me',
      description: 'Military and veteran identity verification',
      icon: UserCheck,
      status: 'available',
      endpoint: '/api/auth/federal/id-me', // Proxies to Monay-ID
      requiredFor: ['veteran-benefits', 'military-discounts']
    },
    {
      id: 'usps-ipp',
      name: 'USPS In-Person Proofing',
      description: 'In-person identity verification at post offices',
      icon: Building,
      status: 'available',
      endpoint: '/api/auth/federal/usps-ipp', // Proxies to Monay-ID
      requiredFor: ['high-security-accounts']
    },
    {
      id: 'irs-verification',
      name: 'IRS Identity Verification',
      description: 'Tax-related identity confirmation',
      icon: FileCheck,
      status: 'available',
      endpoint: '/api/auth/federal/irs', // Proxies to Monay-ID
      requiredFor: ['tax-refunds', 'irs-programs']
    },
    {
      id: 'ssa-dmf',
      name: 'SSA Death Master File Check',
      description: 'Social Security Administration verification',
      icon: CreditCard,
      status: 'available',
      endpoint: '/api/auth/federal/ssa-dmf', // Proxies to Monay-ID
      requiredFor: ['social-security-benefits']
    },
    {
      id: 'e-verify',
      name: 'E-Verify Employment Check',
      description: 'Employment authorization verification',
      icon: Briefcase,
      status: 'available',
      endpoint: '/api/auth/federal/e-verify', // Proxies to Monay-ID
      requiredFor: ['employment-verification']
    },
    {
      id: 'tsa-precheck',
      name: 'TSA PreCheck',
      description: 'Transportation Security Administration verification',
      icon: Plane,
      status: 'available',
      endpoint: '/api/auth/federal/tsa-precheck', // Proxies to Monay-ID
      requiredFor: ['travel-programs']
    }
  ];

  const handleProviderClick = async (provider: IdentityProvider) => {
    setLoading(provider.id);

    try {
      // Call the backend which will proxy to Monay-ID service
      const response = await fetch(provider.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          purpose,
          provider: provider.id,
          returnUrl: window.location.href
        })
      });

      const data = await response.json();

      if (data.redirectUrl) {
        // Redirect to the federal provider's OAuth flow
        window.location.href = data.redirectUrl;
      } else if (data.verified) {
        // Verification completed
        setVerifiedProviders([...verifiedProviders, provider.id]);

        if (onVerificationComplete) {
          onVerificationComplete({
            provider: provider.id,
            verificationData: data
          });
        }
      }
    } catch (error) {
      console.error(`${provider.name} verification failed:`, error);
    } finally {
      setLoading(null);
    }
  };

  const getProviderStatus = (provider: IdentityProvider) => {
    if (verifiedProviders.includes(provider.id)) {
      return 'connected';
    }
    if (requiredProviders.includes(provider.id)) {
      return 'available';
    }
    return provider.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'available': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <>
      {/* Main Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
        variant={verifiedProviders.length > 0 ? 'default' : 'outline'}
      >
        <Shield className="h-4 w-4" />
        {verifiedProviders.length > 0 ? (
          <>
            Verified with {verifiedProviders.length} provider(s)
            <CheckCircle className="h-4 w-4 text-green-500" />
          </>
        ) : (
          <>
            Verify with Federal ID
            {requiredProviders.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {requiredProviders.length} Required
              </Badge>
            )}
          </>
        )}
      </Button>

      {/* Federal Identity Provider Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Federal Identity Verification</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Powered by Monay-ID secure authentication service
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </Button>
              </div>

              {requiredProviders.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">
                      You need to verify with {requiredProviders.length} provider(s) to continue
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {providers.map((provider) => {
                  const Icon = provider.icon;
                  const status = getProviderStatus(provider);
                  const isRequired = requiredProviders.includes(provider.id);
                  const isVerified = verifiedProviders.includes(provider.id);

                  return (
                    <motion.div
                      key={provider.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`
                        p-4 rounded-lg border cursor-pointer transition-all
                        ${isVerified
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
                        }
                      `}
                      onClick={() => !isVerified && handleProviderClick(provider)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isVerified
                              ? 'bg-green-100 dark:bg-green-900/20'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Icon className={`h-5 w-5 ${
                              isVerified
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{provider.name}</h3>
                              {isRequired && !isVerified && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                              {isVerified && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {provider.description}
                            </p>
                            {provider.requiredFor && provider.requiredFor.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {provider.requiredFor.map((req) => (
                                  <Badge
                                    key={req}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(status)}>
                            {status}
                          </Badge>
                          {loading === provider.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            !isVerified && (
                              <ExternalLink className="h-5 w-5 text-gray-400" />
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  About Monay-ID Federation
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Monay-ID provides secure authentication federation with federal identity providers.
                  Your credentials are never stored by Monay - authentication is handled directly
                  by the federal providers through secure OAuth 2.0 and SAML protocols.
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  disabled={requiredProviders.some(p => !verifiedProviders.includes(p))}
                >
                  Continue
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default FederalIdentityButton;