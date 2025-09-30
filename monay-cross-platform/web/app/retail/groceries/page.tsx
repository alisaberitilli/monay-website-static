'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Clock,
  MapPin,
  Star,
  Truck,
  Plus,
  Minus,
  CreditCard,
  Leaf,
  Snowflake,
  Zap,
  Package
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface GroceryItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  brand: string;
  image: string;
  isOrganic: boolean;
  isFrozen: boolean;
  isLocal: boolean;
  inStock: boolean;
  sale?: {
    originalPrice: number;
    discount: string;
  };
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export default function GroceriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryTime, setDeliveryTime] = useState('1-hour');

  const categories = [
    'All', 'Fresh Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry Staples',
    'Frozen Foods', 'Beverages', 'Snacks', 'Organic', 'Local Products'
  ];

  const groceryItems: GroceryItem[] = [
    {
      id: '1',
      name: 'Organic Bananas',
      description: 'Fresh organic bananas from local farms',
      price: 2.99,
      unit: 'per bunch',
      category: 'Fresh Produce',
      brand: 'Local Farm',
      image: '/api/placeholder/200/200',
      isOrganic: true,
      isFrozen: false,
      isLocal: true,
      inStock: true,
      sale: {
        originalPrice: 3.49,
        discount: '15% off'
      }
    },
    {
      id: '2',
      name: 'Whole Milk',
      description: 'Fresh whole milk, 1 gallon',
      price: 4.29,
      unit: 'per gallon',
      category: 'Dairy & Eggs',
      brand: 'Dairy Fresh',
      image: '/api/placeholder/200/200',
      isOrganic: false,
      isFrozen: false,
      isLocal: false,
      inStock: true
    },
    {
      id: '3',
      name: 'Atlantic Salmon Fillet',
      description: 'Fresh wild-caught salmon, sustainably sourced',
      price: 12.99,
      unit: 'per lb',
      category: 'Meat & Seafood',
      brand: 'Ocean Fresh',
      image: '/api/placeholder/200/200',
      isOrganic: false,
      isFrozen: false,
      isLocal: false,
      inStock: true
    },
    {
      id: '4',
      name: 'Quinoa',
      description: 'Organic tri-color quinoa, 2 lb bag',
      price: 8.99,
      unit: 'per 2 lb bag',
      category: 'Pantry Staples',
      brand: 'Healthy Grains',
      image: '/api/placeholder/200/200',
      isOrganic: true,
      isFrozen: false,
      isLocal: false,
      inStock: true
    },
    {
      id: '5',
      name: 'Frozen Blueberries',
      description: 'Wild organic blueberries, 16 oz bag',
      price: 5.99,
      unit: 'per 16 oz bag',
      category: 'Frozen Foods',
      brand: 'Nature\'s Best',
      image: '/api/placeholder/200/200',
      isOrganic: true,
      isFrozen: true,
      isLocal: false,
      inStock: true
    },
    {
      id: '6',
      name: 'Free-Range Eggs',
      description: 'Pasture-raised free-range eggs, dozen',
      price: 6.49,
      unit: 'per dozen',
      category: 'Dairy & Eggs',
      brand: 'Happy Hens',
      image: '/api/placeholder/200/200',
      isOrganic: true,
      isFrozen: false,
      isLocal: true,
      inStock: true
    }
  ];

  const filteredItems = groceryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' ||
                          item.category === selectedCategory ||
                          (selectedCategory === 'Organic' && item.isOrganic) ||
                          (selectedCategory === 'Local Products' && item.isLocal);

    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: GroceryItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      const newItem: CartItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        unit: item.unit
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.id !== itemId));
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Grocery Delivery
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fresh groceries delivered to your door. Pay seamlessly with Monay
          </p>
        </div>

        {/* Delivery Options */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="1-hour">1-Hour Delivery</option>
              <option value="2-hour">2-Hour Delivery</option>
              <option value="same-day">Same Day</option>
              <option value="next-day">Next Day</option>
            </select>
          </div>

          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>Delivery in {deliveryTime === '1-hour' ? '60 minutes' : deliveryTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>San Francisco, CA</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-purple-600" />
              <span>Free delivery over $35</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Product Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {filteredItems.length} Items Available
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Organic Options</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">Local Products</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className="relative h-48 bg-gray-100">
                    {item.sale && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold z-10">
                        {item.sale.discount}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col space-y-1">
                      {item.isOrganic && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1">
                          <Leaf className="h-3 w-3" />
                          <span>Organic</span>
                        </div>
                      )}
                      {item.isFrozen && (
                        <div className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1">
                          <Snowflake className="h-3 w-3" />
                          <span>Frozen</span>
                        </div>
                      )}
                      {item.isLocal && (
                        <div className="bg-purple-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>Local</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-gray-600">{item.brand}</span>
                      <span className="text-sm text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{item.category}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">${item.price}</span>
                          {item.sale && (
                            <span className="text-sm text-gray-500 line-through">${item.sale.originalPrice}</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{item.unit}</span>
                      </div>

                      <button
                        onClick={() => addToCart(item)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center space-x-2"
                        disabled={!item.inStock}
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shopping Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Cart ({cartItemCount})</span>
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Add groceries to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.unit}</p>
                          <p className="text-sm font-medium text-green-600">${item.price.toFixed(2)}</p>
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
                            className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition-colors"
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
                      <span className="font-medium text-green-600">
                        {cartTotal >= 35 ? 'FREE' : '$4.99'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4 text-lg font-bold">
                      <span>Total:</span>
                      <span>${(cartTotal + (cartTotal >= 35 ? 0 : 4.99)).toFixed(2)}</span>
                    </div>

                    {cartTotal < 35 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          Add ${(35 - cartTotal).toFixed(2)} more for free delivery!
                        </p>
                      </div>
                    )}

                    <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-600 transition-all flex items-center justify-center space-x-2 mb-3">
                      <CreditCard className="h-5 w-5" />
                      <span>Checkout with Monay</span>
                    </button>

                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span>Delivery in {deliveryTime === '1-hour' ? '60 minutes' : deliveryTime}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}