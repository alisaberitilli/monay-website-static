'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Star,
  Heart,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  Truck,
  Shield,
  TrendingUp,
  Grid3X3,
  List,
  MapPin,
  Clock,
  DollarSign,
  Award,
  Package
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import PaymentFlow from '@/components/PaymentFlow';
import paymentService, { PaymentRequest, PaymentResult } from '@/lib/payment-service';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  brand: string;
  seller: string;
  inStock: boolean;
  isOnSale: boolean;
  isPremium: boolean;
  shippingTime: string;
  badges: string[];
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  seller: string;
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Payment flow state
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [currentPaymentRequest, setCurrentPaymentRequest] = useState<PaymentRequest | null>(null);

  const categories = [
    'All', 'Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Books',
    'Health & Beauty', 'Toys', 'Automotive', 'Groceries', 'Tools'
  ];

  const products: Product[] = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      description: 'Premium noise-canceling headphones with 30-hour battery life',
      price: 149.99,
      originalPrice: 199.99,
      rating: 4.7,
      reviewCount: 2847,
      image: '/api/placeholder/300/300',
      category: 'Electronics',
      brand: 'AudioMax',
      seller: 'TechWorld',
      inStock: true,
      isOnSale: true,
      isPremium: true,
      shippingTime: '1-2 days',
      badges: ['Best Seller', 'Prime Eligible']
    },
    {
      id: '2',
      name: 'Organic Cotton T-Shirt',
      description: 'Sustainable, comfortable cotton t-shirt in multiple colors',
      price: 24.99,
      rating: 4.4,
      reviewCount: 892,
      image: '/api/placeholder/300/300',
      category: 'Fashion',
      brand: 'EcoWear',
      seller: 'Green Clothing Co',
      inStock: true,
      isOnSale: false,
      isPremium: false,
      shippingTime: '3-5 days',
      badges: ['Eco-Friendly', 'Local Seller']
    },
    {
      id: '3',
      name: 'Smart Home Security Camera',
      description: '4K HD camera with motion detection and night vision',
      price: 89.99,
      originalPrice: 129.99,
      rating: 4.6,
      reviewCount: 1543,
      image: '/api/placeholder/300/300',
      category: 'Electronics',
      brand: 'SecureHome',
      seller: 'SmartLiving',
      inStock: true,
      isOnSale: true,
      isPremium: true,
      shippingTime: '1-2 days',
      badges: ['Top Rated', 'Fast Shipping']
    },
    {
      id: '4',
      name: 'Ceramic Plant Pot Set',
      description: 'Beautiful handcrafted ceramic pots for indoor plants',
      price: 34.99,
      rating: 4.8,
      reviewCount: 567,
      image: '/api/placeholder/300/300',
      category: 'Home & Garden',
      brand: 'HomeDecor',
      seller: 'Garden Paradise',
      inStock: true,
      isOnSale: false,
      isPremium: false,
      shippingTime: '2-4 days',
      badges: ['Handmade', 'Artisan']
    },
    {
      id: '5',
      name: 'Yoga Mat Premium',
      description: 'Non-slip premium yoga mat with carrying strap',
      price: 45.99,
      rating: 4.5,
      reviewCount: 1234,
      image: '/api/placeholder/300/300',
      category: 'Sports',
      brand: 'FlexFit',
      seller: 'Wellness Store',
      inStock: true,
      isOnSale: false,
      isPremium: true,
      shippingTime: '2-3 days',
      badges: ['Recommended', 'Premium Quality']
    },
    {
      id: '6',
      name: 'Bestselling Novel',
      description: 'Award-winning fiction novel by acclaimed author',
      price: 16.99,
      originalPrice: 24.99,
      rating: 4.9,
      reviewCount: 3421,
      image: '/api/placeholder/300/300',
      category: 'Books',
      brand: 'ReadMore',
      seller: 'BookHaven',
      inStock: true,
      isOnSale: true,
      isPremium: false,
      shippingTime: '1-3 days',
      badges: ['Award Winner', 'Bestseller']
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        seller: product.seller
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const toggleFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length > 0) {
      // For marketplace, we'll process each item as a separate retail payment
      const groupedByProduct = cart.reduce((acc, item) => {
        const product = products.find(p => p.id === item.id);
        if (product) {
          acc.push({ product, quantity: item.quantity });
        }
        return acc;
      }, [] as { product: Product; quantity: number }[]);

      if (groupedByProduct.length > 0) {
        // For simplicity, we'll process the first item. In a real app, you'd handle multiple items
        const { product, quantity } = groupedByProduct[0];
        const paymentRequest = paymentService.createRetailPaymentRequest(product, quantity);
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
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Monay Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Shop millions of products from trusted sellers and pay instantly with Monay
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, brands, or categories"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </span>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-32"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Product Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {filteredProducts.length} Products Found
              </h2>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Trending Now</span>
              </div>
            </div>

            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
              {filteredProducts.map((product) => (
                <div key={product.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all ${
                  viewMode === 'list' ? 'flex items-center p-4' : 'flex flex-col'
                }`}>
                  <div className={viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'relative'}>
                    <div className={`${viewMode === 'list' ? 'w-full h-full' : 'h-48'} bg-gray-100 rounded-lg overflow-hidden`}>
                      {product.isOnSale && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold z-10">
                          SALE
                        </div>
                      )}
                      {product.isPremium && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-lg text-xs font-semibold z-10">
                          PREMIUM
                        </div>
                      )}
                      <button
                        onClick={() => toggleFavorite(product.id)}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all z-10"
                      >
                        <Heart className={`h-4 w-4 ${
                          favorites.includes(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <div className={`${viewMode === 'list' ? 'flex-1 ml-4' : 'p-4'} flex flex-col`}>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                        {viewMode === 'grid' && (
                          <button
                            onClick={() => toggleFavorite(product.id)}
                            className="p-1"
                          >
                            <Heart className={`h-4 w-4 ${
                              favorites.includes(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                            }`} />
                          </button>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{product.rating}</span>
                          <span className="text-sm text-gray-500">({product.reviewCount})</span>
                        </div>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{product.seller}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.badges.map((badge, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">
                            {badge}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-600">{product.shippingTime} shipping</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                          )}
                        </div>
                        {product.originalPrice && (
                          <span className="text-sm text-green-600 font-medium">
                            Save ${(product.originalPrice - product.price).toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(product)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center space-x-2"
                        disabled={!product.inStock}
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
                  <p className="text-sm text-gray-400">Add items to get started</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-gray-500">{item.seller}</p>
                          <p className="text-sm font-medium text-blue-600">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="bg-gray-200 p-1 rounded hover:bg-gray-300 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
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
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                    <div className="flex items-center justify-between mb-4 text-lg font-bold">
                      <span>Total:</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center space-x-2 mb-3"
                    >
                      <CreditCard className="h-5 w-5" />
                      <span>Pay with Monay</span>
                    </button>

                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Secure checkout</span>
                    </div>
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