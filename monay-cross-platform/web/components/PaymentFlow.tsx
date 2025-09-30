'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Wallet,
  Building,
  Check,
  ArrowLeft,
  Shield,
  DollarSign,
  Clock,
  Receipt
} from 'lucide-react';
import paymentService, { PaymentRequest, PaymentMethod, PaymentResult } from '@/lib/payment-service';

interface PaymentFlowProps {
  paymentRequest: PaymentRequest;
  onSuccess: (result: PaymentResult) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export default function PaymentFlow({
  paymentRequest,
  onSuccess,
  onCancel,
  isOpen
}: PaymentFlowProps) {
  const [step, setStep] = useState<'methods' | 'confirm' | 'processing' | 'success' | 'error'>('methods');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<PaymentResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
      setStep('methods');
      setError('');
      setResult(null);
    }
  }, [isOpen]);

  const loadPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const methods = await paymentService.getPaymentMethods();
      setPaymentMethods(methods);
      setSelectedMethod(methods.find(m => m.isDefault) || methods[0] || null);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) return;

    try {
      setStep('processing');
      setError('');

      const paymentResult = await paymentService.processPayment(paymentRequest, selectedMethod.id);

      if (paymentResult.success) {
        setResult(paymentResult);
        setStep('success');
        setTimeout(() => {
          onSuccess(paymentResult);
        }, 2000); // Show success for 2 seconds before closing
      } else {
        setError(paymentResult.error || 'Payment failed');
        setStep('error');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment processing failed');
      setStep('error');
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'wallet': return <Wallet className="h-6 w-6" />;
      case 'card': return <CreditCard className="h-6 w-6" />;
      case 'bank': return <Building className="h-6 w-6" />;
      default: return <CreditCard className="h-6 w-6" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Pay with Monay</h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span className="text-2xl font-bold">
              ${paymentRequest.total.toFixed(2)}
            </span>
          </div>
          <p className="text-blue-100 text-sm mt-1">{paymentRequest.description}</p>
        </div>

        <div className="p-6">
          {/* Payment Methods Step */}
          {step === 'methods' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Choose Payment Method</h3>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method)}
                      className={`w-full p-4 rounded-xl border-2 transition-all ${
                        selectedMethod?.id === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            selectedMethod?.id === method.id ? 'bg-blue-500 text-white' : 'bg-gray-100'
                          }`}>
                            {getPaymentMethodIcon(method.type)}
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{method.name}</div>
                            {method.type === 'wallet' && method.balance !== undefined && (
                              <div className="text-sm text-gray-500">
                                Balance: ${method.balance.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedMethod?.id === method.id && (
                          <Check className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Order Summary */}
              <div className="border-t pt-4 mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  {paymentRequest.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} {item.quantity && item.quantity > 1 && `(×${item.quantity})`}
                      </span>
                      <span className="font-medium">
                        ${(item.price * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${paymentRequest.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={() => setStep('confirm')}
                disabled={!selectedMethod || isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                Continue
              </button>

              <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                <Shield className="h-4 w-4" />
                <span>Secure payment powered by Monay</span>
              </div>
            </div>
          )}

          {/* Confirmation Step */}
          {step === 'confirm' && selectedMethod && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Payment</h3>
                <p className="text-gray-600">Review your payment details</p>
              </div>

              {/* Selected Payment Method */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 text-white rounded-lg">
                    {getPaymentMethodIcon(selectedMethod.type)}
                  </div>
                  <div>
                    <div className="font-medium">{selectedMethod.name}</div>
                    {selectedMethod.type === 'wallet' && selectedMethod.balance !== undefined && (
                      <div className="text-sm text-gray-500">
                        Balance: ${selectedMethod.balance.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    ${paymentRequest.total.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {paymentRequest.merchantName}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('methods')}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  className="flex-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl"
                >
                  Pay Now
                </button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-semibold">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we process your payment...</p>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && result && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
              <p className="text-gray-600">Your payment has been processed successfully.</p>

              {result.receipt && (
                <div className="bg-green-50 rounded-xl p-4 text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <Receipt className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Receipt</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-mono">{result.receipt.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>${result.receipt.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">×</span>
              </div>
              <h3 className="text-lg font-semibold text-red-600">Payment Failed</h3>
              <p className="text-gray-600">{error}</p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep('methods')}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}