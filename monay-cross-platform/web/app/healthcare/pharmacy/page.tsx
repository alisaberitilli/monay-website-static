'use client';

import { useState } from 'react';
import { Search, MapPin, Clock, Star, ShoppingCart, Pill, FileText, Truck, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  strength: string;
  form: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'cream' | 'patch';
  price: number;
  insurancePrice?: number;
  inStock: boolean;
  prescription: boolean;
  description: string;
  sideEffects: string[];
  manufacturer: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviews: number;
  hours: string;
  phone: string;
  services: string[];
  acceptsInsurance: boolean;
  deliveryAvailable: boolean;
  estimatedPickup: string;
}

interface Prescription {
  id: string;
  medicationName: string;
  prescribingDoctor: string;
  datePrescribed: string;
  quantity: number;
  refillsRemaining: number;
  instructions: string;
  status: 'active' | 'expired' | 'filled' | 'pending';
  rxNumber: string;
}

interface CartItem {
  medication: Medication;
  quantity: number;
  pharmacy: Pharmacy;
}

export default function PharmacyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPharmacy, setSelectedPharmacy] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'search' | 'prescriptions' | 'cart'>('search');

  const medications: Medication[] = [
    {
      id: '1',
      name: 'Lisinopril',
      genericName: 'Lisinopril',
      strength: '10mg',
      form: 'tablet',
      price: 12.99,
      insurancePrice: 5.00,
      inStock: true,
      prescription: true,
      description: 'ACE inhibitor used to treat high blood pressure',
      sideEffects: ['Dry cough', 'Dizziness', 'Headache'],
      manufacturer: 'Generic'
    },
    {
      id: '2',
      name: 'Ibuprofen',
      genericName: 'Ibuprofen',
      strength: '200mg',
      form: 'tablet',
      price: 8.99,
      inStock: true,
      prescription: false,
      description: 'NSAID pain reliever and fever reducer',
      sideEffects: ['Stomach upset', 'Heartburn', 'Dizziness'],
      manufacturer: 'Advil'
    },
    {
      id: '3',
      name: 'Metformin',
      genericName: 'Metformin HCl',
      strength: '500mg',
      form: 'tablet',
      price: 15.99,
      insurancePrice: 3.00,
      inStock: true,
      prescription: true,
      description: 'Diabetes medication to control blood sugar',
      sideEffects: ['Nausea', 'Diarrhea', 'Metallic taste'],
      manufacturer: 'Generic'
    },
    {
      id: '4',
      name: 'Vitamin D3',
      strength: '2000 IU',
      form: 'capsule',
      price: 19.99,
      inStock: true,
      prescription: false,
      description: 'Vitamin D supplement for bone health',
      sideEffects: ['Rare: nausea', 'Constipation if overdosed'],
      manufacturer: 'Nature Made'
    }
  ];

  const pharmacies: Pharmacy[] = [
    {
      id: '1',
      name: 'CVS Pharmacy',
      address: '123 Main St, Downtown',
      distance: 0.8,
      rating: 4.2,
      reviews: 245,
      hours: '7 AM - 10 PM',
      phone: '(555) 123-4567',
      services: ['Drive-thru', '24/7 pickup', 'Vaccinations', 'Health screenings'],
      acceptsInsurance: true,
      deliveryAvailable: true,
      estimatedPickup: '15-30 min'
    },
    {
      id: '2',
      name: 'Walgreens',
      address: '456 Oak Ave, Midtown',
      distance: 1.2,
      rating: 4.0,
      reviews: 189,
      hours: '8 AM - 9 PM',
      phone: '(555) 234-5678',
      services: ['Drive-thru', 'Vaccinations', 'Photo services'],
      acceptsInsurance: true,
      deliveryAvailable: true,
      estimatedPickup: '20-45 min'
    },
    {
      id: '3',
      name: 'Local Health Pharmacy',
      address: '789 Pine St, Uptown',
      distance: 2.1,
      rating: 4.8,
      reviews: 156,
      hours: '9 AM - 7 PM',
      phone: '(555) 345-6789',
      services: ['Personal consultation', 'Compounding', 'Delivery'],
      acceptsInsurance: true,
      deliveryAvailable: true,
      estimatedPickup: '10-20 min'
    }
  ];

  const prescriptions: Prescription[] = [
    {
      id: '1',
      medicationName: 'Lisinopril 10mg',
      prescribingDoctor: 'Dr. Sarah Johnson',
      datePrescribed: '2024-09-15',
      quantity: 30,
      refillsRemaining: 5,
      instructions: 'Take 1 tablet daily with or without food',
      status: 'active',
      rxNumber: 'RX123456789'
    },
    {
      id: '2',
      medicationName: 'Metformin 500mg',
      prescribingDoctor: 'Dr. Michael Chen',
      datePrescribed: '2024-09-10',
      quantity: 60,
      refillsRemaining: 3,
      instructions: 'Take 1 tablet twice daily with meals',
      status: 'active',
      rxNumber: 'RX987654321'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Medications' },
    { id: 'prescription', name: 'Prescription' },
    { id: 'otc', name: 'Over-the-Counter' },
    { id: 'vitamins', name: 'Vitamins & Supplements' },
    { id: 'pain', name: 'Pain Relief' },
    { id: 'cold', name: 'Cold & Flu' }
  ];

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.genericName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
                           (selectedCategory === 'prescription' && medication.prescription) ||
                           (selectedCategory === 'otc' && !medication.prescription);
    return matchesSearch && matchesCategory;
  });

  const addToCart = (medication: Medication, pharmacy: Pharmacy, quantity: number = 1) => {
    setCart(prev => [...prev, { medication, quantity, pharmacy }]);
  };

  const removeFromCart = (medicationId: string) => {
    setCart(prev => prev.filter(item => item.medication.id !== medicationId));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = item.medication.insurancePrice || item.medication.price;
      return total + (price * item.quantity);
    }, 0);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pharmacy Services</h1>
          <p className="text-gray-600">Find medications, manage prescriptions, and compare pharmacy prices</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'search', label: 'Search Medications', icon: Search },
            { id: 'prescriptions', label: 'My Prescriptions', icon: FileText },
            { id: 'cart', label: `Cart (${cart.length})`, icon: ShoppingCart }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search medications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pharmacy Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Select Pharmacy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pharmacies.map(pharmacy => (
                  <div
                    key={pharmacy.id}
                    onClick={() => setSelectedPharmacy(pharmacy.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedPharmacy === pharmacy.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{pharmacy.name}</h4>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-600">{pharmacy.rating}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {pharmacy.address} ({pharmacy.distance} mi)
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {pharmacy.hours}
                      </div>
                      {pharmacy.deliveryAvailable && (
                        <div className="flex items-center">
                          <Truck className="h-4 w-4 mr-1" />
                          Delivery available
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-sm font-medium text-blue-600">
                      Ready in {pharmacy.estimatedPickup}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Medications List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Available Medications</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredMedications.map(medication => (
                  <div key={medication.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Pill className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="text-lg font-semibold">{medication.name}</h4>
                          {medication.prescription && (
                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Prescription Required
                            </span>
                          )}
                          {!medication.inStock && (
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        {medication.genericName && (
                          <p className="text-sm text-gray-600 mb-1">Generic: {medication.genericName}</p>
                        )}
                        <p className="text-sm text-gray-600 mb-2">
                          {medication.strength} {medication.form} • {medication.manufacturer}
                        </p>
                        <p className="text-sm text-gray-700 mb-3">{medication.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {medication.sideEffects.map((effect, index) => (
                            <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <div className="mb-2">
                          {medication.insurancePrice && (
                            <div className="text-sm text-gray-500 line-through">${medication.price.toFixed(2)}</div>
                          )}
                          <div className="text-lg font-bold text-green-600">
                            ${(medication.insurancePrice || medication.price).toFixed(2)}
                          </div>
                          {medication.insurancePrice && (
                            <div className="text-xs text-green-600">With insurance</div>
                          )}
                        </div>
                        <button
                          onClick={() => selectedPharmacy && addToCart(medication, pharmacies.find(p => p.id === selectedPharmacy)!)}
                          disabled={!medication.inStock || !selectedPharmacy}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">My Prescriptions</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {prescriptions.map(prescription => (
                  <div key={prescription.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <FileText className="h-5 w-5 text-blue-600 mr-2" />
                          <h4 className="text-lg font-semibold">{prescription.medicationName}</h4>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            prescription.status === 'active' ? 'bg-green-100 text-green-800' :
                            prescription.status === 'expired' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {prescription.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Prescribed by: {prescription.prescribingDoctor}</p>
                          <p>Date prescribed: {prescription.datePrescribed}</p>
                          <p>Instructions: {prescription.instructions}</p>
                          <p>Rx Number: {prescription.rxNumber}</p>
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <div className="text-sm text-gray-600 mb-2">
                          <div>Quantity: {prescription.quantity}</div>
                          <div>Refills: {prescription.refillsRemaining}</div>
                        </div>
                        <div className="space-y-2">
                          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Refill Now
                          </button>
                          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Transfer Rx
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Cart Tab */}
        {activeTab === 'cart' && (
          <div className="space-y-6">
            {cart.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600">Add medications to your cart to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Cart Items</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {cart.map(item => (
                      <div key={item.medication.id} className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.medication.name}</h4>
                            <p className="text-sm text-gray-600">{item.medication.strength} {item.medication.form}</p>
                            <p className="text-sm text-gray-600">Pharmacy: {item.pharmacy.name}</p>
                          </div>
                          <div className="ml-6 text-right">
                            <div className="text-lg font-bold">
                              ${((item.medication.insurancePrice || item.medication.price) * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                            <button
                              onClick={() => removeFromCart(item.medication.id)}
                              className="mt-2 text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-green-600">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}