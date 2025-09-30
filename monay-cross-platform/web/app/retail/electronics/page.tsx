'use client';

import React, { useState } from 'react';
import { Search, Filter, Grid, List, Heart, ShoppingCart, Star, Truck, ArrowLeft, Eye, Share2, SlidersHorizontal, Zap, Monitor, Smartphone, Headphones, Camera, Gamepad2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface ElectronicsItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: 'smartphones' | 'laptops' | 'tablets' | 'audio' | 'gaming' | 'accessories' | 'smart-home';
  features: string[];
  inStock: boolean;
  fastShipping: boolean;
  warranty: string;
  specifications: Record<string, string>;
}

const ElectronicsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [sortBy, setSortBy] = useState('featured');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<{id: string, quantity: number}[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const electronicsItems: ElectronicsItem[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      brand: 'Apple',
      price: 1199.99,
      image: '/api/placeholder/300/300',
      rating: 4.8,
      reviews: 2847,
      category: 'smartphones',
      features: ['5G', 'Face ID', '256GB Storage', 'Triple Camera'],
      inStock: true,
      fastShipping: true,
      warranty: '1 Year AppleCare+',
      specifications: {
        'Display': '6.7" Super Retina XDR',
        'Processor': 'A17 Pro',
        'Storage': '256GB',
        'Camera': '48MP Main + 12MP Ultra Wide'
      }
    },
    {
      id: '2',
      name: 'MacBook Air M3',
      brand: 'Apple',
      price: 1299.99,
      originalPrice: 1399.99,
      image: '/api/placeholder/300/300',
      rating: 4.9,
      reviews: 1563,
      category: 'laptops',
      features: ['M3 Chip', '16GB RAM', '512GB SSD', 'All-day Battery'],
      inStock: true,
      fastShipping: true,
      warranty: '1 Year Limited Warranty',
      specifications: {
        'Display': '13.6" Liquid Retina',
        'Processor': 'Apple M3',
        'Memory': '16GB Unified Memory',
        'Storage': '512GB SSD'
      }
    },
    {
      id: '3',
      name: 'Samsung Galaxy S24 Ultra',
      brand: 'Samsung',
      price: 1299.99,
      image: '/api/placeholder/300/300',
      rating: 4.7,
      reviews: 1892,
      category: 'smartphones',
      features: ['S Pen', '200MP Camera', '512GB Storage', '5000mAh Battery'],
      inStock: true,
      fastShipping: true,
      warranty: '1 Year Manufacturer Warranty',
      specifications: {
        'Display': '6.8" Dynamic AMOLED 2X',
        'Processor': 'Snapdragon 8 Gen 3',
        'Storage': '512GB',
        'Camera': '200MP Main + 50MP + 12MP + 10MP'
      }
    },
    {
      id: '4',
      name: 'Sony WH-1000XM5',
      brand: 'Sony',
      price: 399.99,
      originalPrice: 449.99,
      image: '/api/placeholder/300/300',
      rating: 4.6,
      reviews: 987,
      category: 'audio',
      features: ['Noise Canceling', '30hr Battery', 'Hi-Res Audio', 'Touch Controls'],
      inStock: true,
      fastShipping: true,
      warranty: '1 Year Limited Warranty',
      specifications: {
        'Driver': '30mm',
        'Battery': '30 hours',
        'Connectivity': 'Bluetooth 5.2',
        'Weight': '250g'
      }
    },
    {
      id: '5',
      name: 'PlayStation 5',
      brand: 'Sony',
      price: 499.99,
      image: '/api/placeholder/300/300',
      rating: 4.8,
      reviews: 3421,
      category: 'gaming',
      features: ['4K Gaming', 'Ray Tracing', 'SSD Storage', 'DualSense Controller'],
      inStock: false,
      fastShipping: false,
      warranty: '1 Year Limited Warranty',
      specifications: {
        'Processor': 'Custom AMD Zen 2',
        'Graphics': 'Custom AMD RDNA 2',
        'Storage': '825GB SSD',
        'Resolution': 'Up to 4K'
      }
    },
    {
      id: '6',
      name: 'iPad Pro 12.9"',
      brand: 'Apple',
      price: 1099.99,
      image: '/api/placeholder/300/300',
      rating: 4.7,
      reviews: 1245,
      category: 'tablets',
      features: ['M2 Chip', 'Liquid Retina Display', 'Face ID', 'Apple Pencil Support'],
      inStock: true,
      fastShipping: true,
      warranty: '1 Year Limited Warranty',
      specifications: {
        'Display': '12.9" Liquid Retina XDR',
        'Processor': 'Apple M2',
        'Storage': '256GB',
        'Connectivity': 'Wi-Fi 6E + 5G'
      }
    },
    {
      id: '7',
      name: 'ASUS ROG Strix Gaming Laptop',
      brand: 'ASUS',
      price: 1799.99,
      originalPrice: 1999.99,
      image: '/api/placeholder/300/300',
      rating: 4.5,
      reviews: 789,
      category: 'laptops',
      features: ['RTX 4070', '16GB RAM', '1TB SSD', '165Hz Display'],
      inStock: true,
      fastShipping: true,
      warranty: '1 Year International Warranty',
      specifications: {
        'Display': '15.6" FHD 165Hz',
        'Processor': 'Intel Core i7-13700H',
        'Graphics': 'NVIDIA RTX 4070',
        'Memory': '16GB DDR5'
      }
    },
    {
      id: '8',
      name: 'AirPods Pro (3rd Gen)',
      brand: 'Apple',
      price: 249.99,
      image: '/api/placeholder/300/300',
      rating: 4.6,
      reviews: 2156,
      category: 'audio',
      features: ['Active Noise Cancellation', 'Spatial Audio', 'MagSafe Charging', 'Sweat Resistant'],
      inStock: true,
      fastShipping: true,
      warranty: '1 Year Limited Warranty',
      specifications: {
        'Driver': 'Custom',
        'Battery': '6 hours + 24 hours case',
        'Connectivity': 'Bluetooth 5.3',
        'Features': 'Active Noise Cancellation'
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Electronics', count: electronicsItems.length, icon: Zap },
    { id: 'smartphones', name: 'Smartphones', count: electronicsItems.filter(item => item.category === 'smartphones').length, icon: Smartphone },
    { id: 'laptops', name: 'Laptops', count: electronicsItems.filter(item => item.category === 'laptops').length, icon: Monitor },
    { id: 'tablets', name: 'Tablets', count: electronicsItems.filter(item => item.category === 'tablets').length, icon: Monitor },
    { id: 'audio', name: 'Audio', count: electronicsItems.filter(item => item.category === 'audio').length, icon: Headphones },
    { id: 'gaming', name: 'Gaming', count: electronicsItems.filter(item => item.category === 'gaming').length, icon: Gamepad2 },
    { id: 'accessories', name: 'Accessories', count: electronicsItems.filter(item => item.category === 'accessories').length, icon: Camera }
  ];

  const brands = ['Apple', 'Samsung', 'Sony', 'ASUS', 'Dell', 'HP', 'LG', 'Microsoft'];

  const filteredItems = electronicsItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    const matchesBrand = !selectedBrand || item.brand === selectedBrand;

    return matchesSearch && matchesCategory && matchesPrice && matchesBrand;
  });

  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavorites(newFavorites);
  };

  const addToCart = (itemId: string) => {
    const existingItem = cart.find(item => item.id === itemId);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { id: itemId, quantity: 1 }]);
    }
  };

  const ElectronicsItemCard = ({ item }: { item: ElectronicsItem }) => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
      viewMode === 'list' ? 'flex' : ''
    }`}>
      <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'aspect-square'}`}>
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {item.originalPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
            SALE
          </div>
        )}
        {item.fastShipping && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
            <Truck className="h-3 w-3 inline mr-1" />
            Fast
          </div>
        )}
        {!item.inStock && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded font-semibold">Out of Stock</span>
          </div>
        )}
        <button
          onClick={() => toggleFavorite(item.id)}
          className="absolute bottom-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <Heart className={`h-4 w-4 ${favorites.has(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>

      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.brand}</p>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">${item.price.toLocaleString()}</span>
          {item.originalPrice && (
            <span className="text-sm text-gray-500 line-through">${item.originalPrice.toLocaleString()}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {item.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
          {item.features.length > 3 && (
            <span className="text-xs text-gray-500">+{item.features.length - 3} more</span>
          )}
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-600">
            <strong>Warranty:</strong> {item.warranty}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => addToCart(item.id)}
            disabled={!item.inStock}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              item.inStock
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            {item.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">{item.reviews.toLocaleString()} reviews</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-sm -mx-6 -mt-6 mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Electronics</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items in cart
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`bg-white p-6 rounded-lg shadow-sm h-fit ${
            showFilters ? 'block' : 'hidden'
          } lg:block w-full lg:w-80`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                ×
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-3 ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{category.name}</span>
                      <span className="text-sm text-gray-500">({category.count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Brand</h3>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search electronics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest</option>
                  </select>

                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredItems.length} of {electronicsItems.length} items
                {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
              </p>
            </div>

            {/* Electronics Items Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {filteredItems.map(item => (
                <ElectronicsItemCard key={item.id} item={item} />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Zap className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No electronics found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, 5000]);
                    setSelectedBrand('');
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ElectronicsPage;