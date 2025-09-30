'use client';

import { useState } from 'react';
import {
  ChefHat,
  MapPin,
  Star,
  Clock,
  DollarSign,
  Users,
  Phone,
  CreditCard,
  Heart,
  Filter,
  Search,
  Plus,
  Minus,
  ShoppingCart
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import PaymentFlow from '@/components/PaymentFlow';
import paymentService, { PaymentRequest, PaymentResult } from '@/lib/payment-service';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  distance: number;
  address: string;
  phone: string;
  hours: string;
  image: string;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  isOpen: boolean;
  featuredItems: string[];
  offers: string[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurant: string;
}

export default function RestaurantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Payment flow state
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [currentPaymentRequest, setCurrentPaymentRequest] = useState<PaymentRequest | null>(null);

  const restaurants: Restaurant[] = [
    {
      id: '1',
      name: 'Bella Vista Italian',
      cuisine: 'Italian',
      rating: 4.7,
      reviewCount: 1250,
      priceRange: '$$$',
      distance: 0.8,
      address: '456 Mission St, San Francisco, CA',
      phone: '(415) 555-0123',
      hours: '11:30 AM - 10:00 PM',
      image: '/api/placeholder/300/200',
      deliveryTime: '25-35 min',
      deliveryFee: 2.99,
      minimumOrder: 25,
      isOpen: true,
      featuredItems: ['Margherita Pizza', 'Pasta Carbonara', 'Tiramisu'],
      offers: ['Free delivery on orders $40+', '20% off first order']
    },
    {
      id: '2',
      name: 'Dragon Palace',
      cuisine: 'Chinese',
      rating: 4.5,
      reviewCount: 890,
      priceRange: '$$',
      distance: 1.2,
      address: '789 Grant Ave, San Francisco, CA',
      phone: '(415) 555-0456',
      hours: '11:00 AM - 9:30 PM',
      image: '/api/placeholder/300/200',
      deliveryTime: '20-30 min',
      deliveryFee: 1.99,
      minimumOrder: 20,
      isOpen: true,
      featuredItems: ['General Tso Chicken', 'Beef and Broccoli', 'Fried Rice'],
      offers: ['Buy 2 get 1 free appetizer']
    },
    {
      id: '3',
      name: 'Taco Libre',
      cuisine: 'Mexican',
      rating: 4.8,
      reviewCount: 2100,
      priceRange: '$',
      distance: 0.5,
      address: '321 Valencia St, San Francisco, CA',
      phone: '(415) 555-0789',
      hours: '10:00 AM - 11:00 PM',
      image: '/api/placeholder/300/200',
      deliveryTime: '15-25 min',
      deliveryFee: 0.99,
      minimumOrder: 15,
      isOpen: true,
      featuredItems: ['Carnitas Tacos', 'Guacamole & Chips', 'Burrito Bowl'],
      offers: ['$5 off orders $30+', 'Free guac Tuesday']
    },
    {
      id: '4',
      name: 'Sakura Sushi',
      cuisine: 'Japanese',
      rating: 4.6,
      reviewCount: 650,
      priceRange: '$$$',
      distance: 1.5,
      address: '567 Fillmore St, San Francisco, CA',
      phone: '(415) 555-0321',
      hours: '5:00 PM - 10:00 PM',
      image: '/api/placeholder/300/200',
      deliveryTime: '30-40 min',
      deliveryFee: 3.99,
      minimumOrder: 35,
      isOpen: false,
      featuredItems: ['Dragon Roll', 'Salmon Sashimi', 'Miso Soup'],
      offers: ['Happy hour 5-7 PM']
    }
  ];

  const cuisines = ['All', 'Italian', 'Chinese', 'Mexican', 'Japanese', 'American', 'Thai', 'Indian'];
  const priceRanges = ['All', '$', '$$', '$$$', '$$$$'];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'All' || restaurant.cuisine === selectedCuisine;
    const matchesPrice = priceFilter === 'All' || restaurant.priceRange === priceFilter;

    return matchesSearch && matchesCuisine && matchesPrice;
  });

  const addToCart = (restaurant: Restaurant, itemName: string, price: number) => {
    const existingItem = cart.find(item => item.name === itemName && item.restaurant === restaurant.name);

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === existingItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: `${restaurant.id}-${itemName}-${Date.now()}`,
        name: itemName,
        price: price,
        quantity: 1,
        restaurant: restaurant.name
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length > 0) {
      const restaurant = restaurants.find(r => r.name === cart[0].restaurant);
      if (restaurant) {
        const paymentRequest = paymentService.createRestaurantPaymentRequest(restaurant, cart);
        setCurrentPaymentRequest(paymentRequest);
        setShowPaymentFlow(true);
      }
    }
  };

  const handlePaymentSuccess = (result: PaymentResult) => {
    setShowPaymentFlow(false);
    setCurrentPaymentRequest(null);
    setCart([]); // Clear cart after successful payment
    alert(`Payment successful! Transaction ID: ${result.transactionId}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentFlow(false);
    setCurrentPaymentRequest(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Restaurant Delivery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Order from your favorite restaurants and pay seamlessly with Monay
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants or cuisine"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>

            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              {cuisines.map(cuisine => (
                <option key={cuisine} value={cuisine}>{cuisine}</option>
              ))}
            </select>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              {priceRanges.map(range => (
                <option key={range} value={range}>
                  {range === 'All' ? 'All Prices' : `Price ${range}`}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              <option value="rating">Sort by Rating</option>
              <option value="distance">Sort by Distance</option>
              <option value="deliveryTime">Sort by Delivery Time</option>
              <option value="deliveryFee">Sort by Delivery Fee</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Restaurant List */}
          <div className="lg:col-span-2 space-y-6">
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          restaurant.isOpen
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {restaurant.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{restaurant.rating}</span>
                          <span>({restaurant.reviewCount})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>{restaurant.priceRange}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{restaurant.distance} mi</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{restaurant.deliveryTime}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mb-3">{restaurant.address}</p>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <span>Delivery: ${restaurant.deliveryFee}</span>
                        <span>Min: ${restaurant.minimumOrder}</span>
                        <span className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{restaurant.phone}</span>
                        </span>
                      </div>

                      {/* Featured Items */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Popular Items:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {restaurant.featuredItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium">{item}</span>
                              <button
                                onClick={() => addToCart(restaurant, item, 12.99 + (index * 2))}
                                className="bg-orange-500 text-white p-1 rounded-lg hover:bg-orange-600 transition-all"
                                disabled={!restaurant.isOpen}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Offers */}
                      {restaurant.offers.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Current Offers:</h4>
                          <div className="space-y-1">
                            {restaurant.offers.map((offer, index) => (
                              <div key={index} className="bg-green-50 text-green-700 text-sm px-3 py-1 rounded-lg">
                                {offer}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-lg">
                        {restaurant.cuisine}
                      </span>
                      <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>

                    <button
                      className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                        restaurant.isOpen
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!restaurant.isOpen}
                    >
                      {restaurant.isOpen ? 'View Menu' : 'Closed'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Your Order ({cartItemCount})</span>
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ChefHat className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Add items from restaurants</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.restaurant}</p>
                          <p className="text-sm font-medium text-orange-600">${item.price.toFixed(2)}</p>
                        </div>
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
                            className="bg-orange-500 text-white p-1 rounded hover:bg-orange-600 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span className="font-medium">$2.99</span>
                    </div>
                    <div className="flex items-center justify-between mb-4 text-lg font-bold">
                      <span>Total:</span>
                      <span>${(cartTotal + 2.99).toFixed(2)}</span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center space-x-2"
                    >
                      <CreditCard className="h-5 w-5" />
                      <span>Checkout with Monay</span>
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