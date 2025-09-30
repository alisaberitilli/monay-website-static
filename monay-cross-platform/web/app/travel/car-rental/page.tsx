'use client';

import { useState } from 'react';
import { Car, CreditCard, Calendar, MapPin, Users, Star } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import PaymentFlow from '@/components/PaymentFlow';
import paymentService, { PaymentRequest, PaymentResult } from '@/lib/payment-service';

export default function CarRentalPage() {
  // Payment flow state
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [currentPaymentRequest, setCurrentPaymentRequest] = useState<PaymentRequest | null>(null);

  const handlePayment = (car: any) => {
    const days = 3; // Default rental period
    const paymentRequest = paymentService.createRetailPaymentRequest(car, days);
    setCurrentPaymentRequest(paymentRequest);
    setShowPaymentFlow(true);
  };

  const handlePaymentSuccess = (result: PaymentResult) => {
    setShowPaymentFlow(false);
    setCurrentPaymentRequest(null);
    alert(`Payment successful! Transaction ID: ${result.transactionId}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentFlow(false);
    setCurrentPaymentRequest(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Car className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Car Rental</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Rent cars from top providers and pay instantly with Monay
          </p>
        </div>

        {/* Car Rental Options */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Available Rental Cars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: '1',
                name: 'Toyota Camry',
                type: 'Midsize Sedan',
                rating: 4.7,
                price: 55,
                features: ['Automatic', 'AC', 'Bluetooth', '5 Seats'],
                mpg: '32 MPG',
                company: 'Enterprise'
              },
              {
                id: '2',
                name: 'Honda CR-V',
                type: 'Compact SUV',
                rating: 4.6,
                price: 68,
                features: ['AWD', 'AC', 'Backup Camera', '5 Seats'],
                mpg: '28 MPG',
                company: 'Hertz'
              },
              {
                id: '3',
                name: 'Tesla Model 3',
                type: 'Electric Sedan',
                rating: 4.9,
                price: 89,
                features: ['Electric', 'Autopilot', 'Premium Audio', '5 Seats'],
                mpg: '120 MPGe',
                company: 'Turo'
              }
            ].map((car) => (
              <div key={car.id} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <Car className="h-16 w-16 text-gray-400" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{car.name}</h3>
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-lg">
                      {car.company}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{car.type}</p>
                  <div className="flex items-center space-x-2 mb-3">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{car.rating}</span>
                    <span className="text-sm text-gray-500">• {car.mpg}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {car.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-lg">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">${car.price}</span>
                      <span className="text-sm text-gray-500">/day</span>
                    </div>
                    <button
                      onClick={() => handlePayment(car)}
                      className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all"
                    >
                      Rent with Monay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Flow Modal */}
      {currentPaymentRequest && (
        <PaymentFlow
          paymentRequest={currentPaymentRequest}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
          isOpen={showPaymentFlow}
        />
      )}
    </DashboardLayout>
  );
}