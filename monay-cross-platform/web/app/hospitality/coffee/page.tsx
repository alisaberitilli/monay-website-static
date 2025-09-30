'use client';

import { useState } from 'react';
import {
  Coffee,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Wifi,
  Volume2,
  Users,
  Phone,
  CreditCard,
  Heart,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  Flame,
  Snowflake
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import PaymentFlow from '@/components/PaymentFlow';
import paymentService, { PaymentRequest, PaymentResult } from '@/lib/payment-service';

interface CoffeeShop {
  id: string;
  name: string;
  type: string;
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$';
  distance: number;
  address: string;
  phone: string;
  hours: string;
  wifi: boolean;
  quietLevel: 'Quiet' | 'Moderate' | 'Lively';
  seating: number;
  isOpen: boolean;
  specialties: string[];
  amenities: string[];
  orderAhead: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  sizes?: { size: string; price: number }[];
  temperature?: string[];
  customizations: string[];
  description: string;
  caffeine?: 'High' | 'Medium' | 'Low' | 'None';
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  temperature?: string;
  customizations: string[];
  shop: string;
}

export default function CoffeePage() {
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [customizations, setCustomizations] = useState<{[key: string]: string[]}>({});

  // Payment flow state
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [currentPaymentRequest, setCurrentPaymentRequest] = useState<PaymentRequest | null>(null);

  const coffeeShops: CoffeeShop[] = [
    {
      id: '1',
      name: 'Artisan Coffee Roasters',
      type: 'Specialty Coffee',
      rating: 4.8,
      reviewCount: 890,
      priceRange: '$$$',
      distance: 0.3,
      address: '123 Valencia St, San Francisco, CA',
      phone: '(415) 555-0123',
      hours: '6:00 AM - 8:00 PM',
      wifi: true,
      quietLevel: 'Moderate',
      seating: 45,
      isOpen: true,
      specialties: ['Single Origin', 'Pour Over', 'Cold Brew', 'Espresso'],
      amenities: ['WiFi', 'Outdoor Seating', 'Laptop Friendly', 'Charging Ports'],
      orderAhead: true
    },
    {
      id: '2',
      name: 'Morning Rush Café',
      type: 'Quick Service',
      rating: 4.3,
      reviewCount: 1250,
      priceRange: '$$',
      distance: 0.7,
      address: '456 Market St, San Francisco, CA',
      phone: '(415) 555-0456',
      hours: '5:30 AM - 7:00 PM',
      wifi: true,
      quietLevel: 'Lively',
      seating: 20,
      isOpen: true,
      specialties: ['Espresso Drinks', 'Breakfast Pastries', 'Quick Service'],
      amenities: ['Mobile Order', 'Drive-thru', 'Loyalty Program'],
      orderAhead: true
    },
    {
      id: '3',
      name: 'Quiet Corner Books & Brew',
      type: 'Café & Bookstore',
      rating: 4.6,
      reviewCount: 670,
      priceRange: '$$',
      distance: 1.1,
      address: '789 Castro St, San Francisco, CA',
      phone: '(415) 555-0789',
      hours: '7:00 AM - 9:00 PM',
      wifi: true,
      quietLevel: 'Quiet',
      seating: 60,
      isOpen: true,
      specialties: ['Artisan Teas', 'Book Pairings', 'Study Space'],
      amenities: ['Bookstore', 'Study Rooms', 'Events', 'Reading Nooks'],
      orderAhead: false
    }
  ];

  const menuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Americano',
      category: 'Espresso Drinks',
      price: 3.75,
      sizes: [
        { size: 'Small', price: 3.75 },
        { size: 'Medium', price: 4.25 },
        { size: 'Large', price: 4.75 }
      ],
      temperature: ['Hot', 'Iced'],
      customizations: ['Extra Shot', 'Decaf', 'Half Caff', 'Extra Hot', 'Light Ice'],
      description: 'Rich espresso with hot water',
      caffeine: 'High'
    },
    {
      id: '2',
      name: 'Cappuccino',
      category: 'Espresso Drinks',
      price: 4.50,
      sizes: [
        { size: 'Small', price: 4.50 },
        { size: 'Medium', price: 5.00 },
        { size: 'Large', price: 5.50 }
      ],
      temperature: ['Hot'],
      customizations: ['Extra Foam', 'Light Foam', 'Extra Shot', 'Cinnamon', 'Cocoa Powder'],
      description: 'Espresso with steamed milk and foam',
      caffeine: 'High'
    },
    {
      id: '3',
      name: 'Cold Brew',
      category: 'Cold Coffee',
      price: 4.25,
      sizes: [
        { size: 'Medium', price: 4.25 },
        { size: 'Large', price: 4.75 }
      ],
      temperature: ['Cold'],
      customizations: ['Vanilla Syrup', 'Caramel Syrup', 'Oat Milk', 'Almond Milk', 'Extra Strong'],
      description: 'Smooth cold-brewed coffee, never bitter',
      caffeine: 'Medium'
    },
    {
      id: '4',
      name: 'Matcha Latte',
      category: 'Tea & Alternatives',
      price: 5.25,
      sizes: [
        { size: 'Small', price: 5.25 },
        { size: 'Medium', price: 5.75 },
        { size: 'Large', price: 6.25 }
      ],
      temperature: ['Hot', 'Iced'],
      customizations: ['Oat Milk', 'Coconut Milk', 'Extra Matcha', 'Vanilla Syrup', 'Light Sweetener'],
      description: 'Premium Japanese matcha with steamed milk',
      caffeine: 'Medium'
    }
  ];

  const addToOrder = (item: MenuItem, size?: string, temperature?: string, selectedCustomizations: string[] = []) => {
    const sizePrice = size ? item.sizes?.find(s => s.size === size)?.price || item.price : item.price;
    const customizationFee = selectedCustomizations.length * 0.75;
    const totalPrice = sizePrice + customizationFee;

    const orderItem: OrderItem = {
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      price: totalPrice,
      quantity: 1,
      size: size,
      temperature: temperature,
      customizations: selectedCustomizations,
      shop: selectedShop || 'Unknown'
    };

    setOrder([...order, orderItem]);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setOrder(order.filter(item => item.id !== itemId));
    } else {
      setOrder(order.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const orderTotal = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderItemCount = order.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (order.length > 0 && selectedShop) {
      const coffeeShop = coffeeShops.find(s => s.id === selectedShop);
      if (coffeeShop) {
        const paymentRequest = paymentService.createRestaurantPaymentRequest(coffeeShop, order);
        setCurrentPaymentRequest(paymentRequest);
        setShowPaymentFlow(true);
      }
    }
  };

  const handlePaymentSuccess = (result: PaymentResult) => {
    setShowPaymentFlow(false);
    setCurrentPaymentRequest(null);
    setOrder([]); // Clear order after successful payment
    alert(`Payment successful! Transaction ID: ${result.transactionId}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentFlow(false);
    setCurrentPaymentRequest(null);
  };

  const getCaffeineIcon = (level?: string) => {
    switch (level) {
      case 'High': return <Zap className="h-4 w-4 text-red-500" />;
      case 'Medium': return <Flame className="h-4 w-4 text-orange-500" />;
      case 'Low': return <Snowflake className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Coffee className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Coffee & Cafés
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find your perfect coffee spot and order ahead with Monay
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coffee Shops */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedShop ? (
              // Shop List View
              coffeeShops.map((shop) => (
                <div key={shop.id} className="bg-white rounded-3xl shadow-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{shop.name}</h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          shop.isOpen
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {shop.isOpen ? 'Open' : 'Closed'}
                        </span>
                        {shop.orderAhead && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg">
                            Order Ahead
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{shop.rating}</span>
                          <span>({shop.reviewCount})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>{shop.priceRange}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{shop.distance} mi</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{shop.hours}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mb-3">{shop.address}</p>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        {shop.wifi && (
                          <div className="flex items-center space-x-1">
                            <Wifi className="h-4 w-4 text-blue-500" />
                            <span>WiFi</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Volume2 className="h-4 w-4" />
                          <span>{shop.quietLevel}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{shop.seating} seats</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{shop.phone}</span>
                        </div>
                      </div>

                      {/* Specialties */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Specialties:</h4>
                        <div className="flex flex-wrap gap-2">
                          {shop.specialties.map((specialty, index) => (
                            <span key={index} className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-lg">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Amenities:</h4>
                        <div className="flex flex-wrap gap-2">
                          {shop.amenities.map((amenity, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-lg">
                        {shop.type}
                      </span>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedShop(shop.id)}
                      className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                        shop.isOpen
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!shop.isOpen}
                    >
                      {shop.isOpen ? 'View Menu' : 'Closed'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              // Menu View
              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {coffeeShops.find(s => s.id === selectedShop)?.name} Menu
                    </h2>
                    <button
                      onClick={() => setSelectedShop(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      ← Back to Shops
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {menuItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-2xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{item.name}</h4>
                              {getCaffeineIcon(item.caffeine)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <p className="text-sm font-medium text-amber-600">
                              Starting at ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Size Options */}
                        {item.sizes && (
                          <div className="mb-3">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Size:</label>
                            <div className="flex space-x-2">
                              {item.sizes.map((sizeOption) => (
                                <button
                                  key={sizeOption.size}
                                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:border-amber-500 transition-colors"
                                >
                                  {sizeOption.size} (+${(sizeOption.price - item.price).toFixed(2)})
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Temperature Options */}
                        {item.temperature && (
                          <div className="mb-3">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Temperature:</label>
                            <div className="flex space-x-2">
                              {item.temperature.map((temp) => (
                                <button
                                  key={temp}
                                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:border-amber-500 transition-colors"
                                >
                                  {temp}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => addToOrder(item)}
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all"
                        >
                          Add to Order
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Your Order ({orderItemCount})</span>
              </h3>

              {order.length === 0 ? (
                <div className="text-center py-8">
                  <Coffee className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your order is empty</p>
                  <p className="text-sm text-gray-400">Add items from the menu</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {order.map((item) => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="bg-gray-200 p-1 rounded hover:bg-gray-300 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="bg-amber-500 text-white p-1 rounded hover:bg-amber-600 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                        {item.temperature && <p className="text-sm text-gray-600">Temperature: {item.temperature}</p>}
                        {item.customizations.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Customizations: {item.customizations.join(', ')}
                          </p>
                        )}

                        <p className="text-sm font-medium text-amber-600 mt-1">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">${orderTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">${(orderTotal * 0.0875).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4 text-lg font-bold">
                      <span>Total:</span>
                      <span>${(orderTotal * 1.0875).toFixed(2)}</span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all flex items-center justify-center space-x-2"
                    >
                      <CreditCard className="h-5 w-5" />
                      <span>Pay with Monay</span>
                    </button>
                  </div>
                </>
              )}
            </div>
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