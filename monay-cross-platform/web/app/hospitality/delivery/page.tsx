'use client';

import React, { useState } from 'react';
import { Search, Filter, MapPin, Clock, Star, ShoppingCart, Truck, ArrowLeft, Plus, Minus, Heart } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface DeliveryRestaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  image: string;
  distance: string;
  isOpen: boolean;
  featured: boolean;
  menu: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurant: string;
}

const DeliveryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  const restaurants: DeliveryRestaurant[] = [
    {
      id: '1',
      name: 'Mario\'s Italian Kitchen',
      cuisine: 'Italian',
      rating: 4.8,
      reviews: 1250,
      deliveryTime: '25-35 min',
      deliveryFee: 2.99,
      minimumOrder: 15,
      image: '/api/placeholder/300/200',
      distance: '0.8 mi',
      isOpen: true,
      featured: true,
      menu: [
        {
          id: '1-1',
          name: 'Margherita Pizza',
          description: 'Fresh mozzarella, basil, and tomato sauce',
          price: 18.99,
          image: '/api/placeholder/150/150',
          category: 'Pizza',
          popular: true
        },
        {
          id: '1-2',
          name: 'Chicken Alfredo',
          description: 'Grilled chicken with creamy alfredo sauce',
          price: 22.99,
          image: '/api/placeholder/150/150',
          category: 'Pasta',
          popular: false
        }
      ]
    },
    {
      id: '2',
      name: 'Dragon Palace',
      cuisine: 'Chinese',
      rating: 4.6,
      reviews: 890,
      deliveryTime: '30-45 min',
      deliveryFee: 3.99,
      minimumOrder: 20,
      image: '/api/placeholder/300/200',
      distance: '1.2 mi',
      isOpen: true,
      featured: false,
      menu: [
        {
          id: '2-1',
          name: 'General Tso\'s Chicken',
          description: 'Crispy chicken in sweet and tangy sauce',
          price: 16.99,
          image: '/api/placeholder/150/150',
          category: 'Main',
          popular: true
        },
        {
          id: '2-2',
          name: 'Beef Lo Mein',
          description: 'Stir-fried noodles with beef and vegetables',
          price: 14.99,
          image: '/api/placeholder/150/150',
          category: 'Noodles',
          popular: false
        }
      ]
    },
    {
      id: '3',
      name: 'Taco Fiesta',
      cuisine: 'Mexican',
      rating: 4.5,
      reviews: 675,
      deliveryTime: '20-30 min',
      deliveryFee: 1.99,
      minimumOrder: 12,
      image: '/api/placeholder/300/200',
      distance: '0.5 mi',
      isOpen: true,
      featured: true,
      menu: [
        {
          id: '3-1',
          name: 'Carne Asada Burrito',
          description: 'Grilled steak with rice, beans, and salsa',
          price: 12.99,
          image: '/api/placeholder/150/150',
          category: 'Burritos',
          popular: true
        },
        {
          id: '3-2',
          name: 'Chicken Quesadilla',
          description: 'Grilled chicken with cheese and peppers',
          price: 9.99,
          image: '/api/placeholder/150/150',
          category: 'Quesadillas',
          popular: false
        }
      ]
    },
    {
      id: '4',
      name: 'Sakura Sushi',
      cuisine: 'Japanese',
      rating: 4.7,
      reviews: 445,
      deliveryTime: '35-50 min',
      deliveryFee: 4.99,
      minimumOrder: 25,
      image: '/api/placeholder/300/200',
      distance: '1.5 mi',
      isOpen: false,
      featured: false,
      menu: [
        {
          id: '4-1',
          name: 'California Roll',
          description: 'Crab, avocado, and cucumber',
          price: 8.99,
          image: '/api/placeholder/150/150',
          category: 'Rolls',
          popular: true
        },
        {
          id: '4-2',
          name: 'Salmon Teriyaki',
          description: 'Grilled salmon with teriyaki glaze',
          price: 19.99,
          image: '/api/placeholder/150/150',
          category: 'Entrees',
          popular: false
        }
      ]
    }
  ];

  const cuisines = ['All', 'Italian', 'Chinese', 'Mexican', 'Japanese', 'American', 'Indian', 'Thai'];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || restaurant.cuisine.toLowerCase() === selectedCuisine.toLowerCase();
    return matchesSearch && matchesCuisine && restaurant.isOpen;
  });

  const addToCart = (item: MenuItem, restaurant: DeliveryRestaurant) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        restaurant: restaurant.name
      }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const toggleFavorite = (restaurantId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(restaurantId)) {
      newFavorites.delete(restaurantId);
    } else {
      newFavorites.add(restaurantId);
    }
    setFavorites(newFavorites);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = (itemId: string) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant);

  if (selectedRestaurant && selectedRestaurantData) {
    return (
      <DashboardLayout>
        {/* Restaurant Header */}
        <div className="bg-white shadow-sm -mx-6 -mt-6 mb-6">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{selectedRestaurantData.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    {selectedRestaurantData.rating} ({selectedRestaurantData.reviews} reviews)
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {selectedRestaurantData.deliveryTime}
                  </span>
                  <span className="flex items-center">
                    <Truck className="h-4 w-4 mr-1" />
                    ${selectedRestaurantData.deliveryFee} delivery
                  </span>
                </div>
              </div>
              {cart.length > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                  <p className="font-semibold">${getCartTotal().toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Menu */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Menu</h2>
              <div className="space-y-4">
                {selectedRestaurantData.menu.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              {item.name}
                              {item.popular && (
                                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                  Popular
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            <p className="text-lg font-bold text-gray-900 mt-2">${item.price}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getCartItemCount(item.id) > 0 ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="font-semibold text-gray-900">{getCartItemCount(item.id)}</span>
                                <button
                                  onClick={() => addToCart(item, selectedRestaurantData)}
                                  className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(item, selectedRestaurantData)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart */}
            {cart.length > 0 && (
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Order</h3>
                  <div className="space-y-3 mb-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">${item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-medium">{item.quantity}</span>
                          <button
                            onClick={() => {
                              const menuItem = selectedRestaurantData.menu.find(m => m.id === item.id);
                              if (menuItem) addToCart(menuItem, selectedRestaurantData);
                            }}
                            className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>${selectedRestaurantData.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>${(getCartTotal() + selectedRestaurantData.deliveryFee).toFixed(2)}</span>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-sm -mx-6 -mt-6 mb-6">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Food Delivery</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                Deliver to: Home
              </div>
              {cart.length > 0 && (
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants or dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine.toLowerCase()}>{cuisine}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="featured">Featured</option>
                <option value="rating">Highest Rated</option>
                <option value="delivery-time">Fastest Delivery</option>
                <option value="delivery-fee">Lowest Delivery Fee</option>
              </select>
            </div>
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              onClick={() => setSelectedRestaurant(restaurant.id)}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="relative">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover"
                />
                {restaurant.featured && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-sm font-bold">
                    Featured
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(restaurant.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                >
                  <Heart className={`h-4 w-4 ${favorites.has(restaurant.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600 ml-1">{restaurant.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {restaurant.deliveryTime}
                  </span>
                  <span className="flex items-center">
                    <Truck className="h-4 w-4 mr-1" />
                    ${restaurant.deliveryFee} fee
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Min. order: ${restaurant.minimumOrder}
                  </p>
                  <p className="text-xs text-gray-500">{restaurant.distance}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No restaurants found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DeliveryPage;