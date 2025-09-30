'use client';

import React, { useState } from 'react';
import { Search, Filter, Grid, List, Heart, ShoppingCart, Star, Truck, ArrowLeft, Eye, Share2, SlidersHorizontal } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface FashionItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  sizes: string[];
  colors: string[];
  category: 'clothing' | 'shoes' | 'accessories' | 'bags';
  tags: string[];
  inStock: boolean;
  fastShipping: boolean;
}

const FashionPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [sortBy, setSortBy] = useState('featured');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<{id: string, size: string, color: string, quantity: number}[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const fashionItems: FashionItem[] = [
    {
      id: '1',
      name: 'Premium Cotton T-Shirt',
      brand: 'Urban Essentials',
      price: 29.99,
      originalPrice: 39.99,
      image: '/api/placeholder/300/400',
      rating: 4.5,
      reviews: 128,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['White', 'Black', 'Navy', 'Gray'],
      category: 'clothing',
      tags: ['casual', 'cotton', 'sustainable'],
      inStock: true,
      fastShipping: true
    },
    {
      id: '2',
      name: 'Designer Sneakers',
      brand: 'Style Runner',
      price: 149.99,
      image: '/api/placeholder/300/400',
      rating: 4.8,
      reviews: 89,
      sizes: ['7', '8', '9', '10', '11', '12'],
      colors: ['White', 'Black', 'Blue'],
      category: 'shoes',
      tags: ['sneakers', 'athletic', 'designer'],
      inStock: true,
      fastShipping: true
    },
    {
      id: '3',
      name: 'Leather Crossbody Bag',
      brand: 'Crafted Co.',
      price: 89.99,
      originalPrice: 129.99,
      image: '/api/placeholder/300/400',
      rating: 4.6,
      reviews: 67,
      sizes: ['One Size'],
      colors: ['Brown', 'Black', 'Tan'],
      category: 'bags',
      tags: ['leather', 'crossbody', 'handcrafted'],
      inStock: true,
      fastShipping: false
    },
    {
      id: '4',
      name: 'Classic Denim Jacket',
      brand: 'Vintage Vibes',
      price: 79.99,
      image: '/api/placeholder/300/400',
      rating: 4.4,
      reviews: 156,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Light Blue', 'Dark Blue', 'Black'],
      category: 'clothing',
      tags: ['denim', 'classic', 'unisex'],
      inStock: true,
      fastShipping: true
    },
    {
      id: '5',
      name: 'Minimalist Watch',
      brand: 'Time & Co.',
      price: 199.99,
      originalPrice: 249.99,
      image: '/api/placeholder/300/400',
      rating: 4.7,
      reviews: 92,
      sizes: ['38mm', '42mm'],
      colors: ['Silver', 'Gold', 'Black'],
      category: 'accessories',
      tags: ['watch', 'minimalist', 'luxury'],
      inStock: true,
      fastShipping: true
    },
    {
      id: '6',
      name: 'High-Waisted Jeans',
      brand: 'Denim Dreams',
      price: 69.99,
      image: '/api/placeholder/300/400',
      rating: 4.3,
      reviews: 203,
      sizes: ['24', '26', '28', '30', '32'],
      colors: ['Blue', 'Black', 'Light Wash'],
      category: 'clothing',
      tags: ['jeans', 'high-waisted', 'sustainable'],
      inStock: true,
      fastShipping: true
    }
  ];

  const categories = [
    { id: 'all', name: 'All Items', count: fashionItems.length },
    { id: 'clothing', name: 'Clothing', count: fashionItems.filter(item => item.category === 'clothing').length },
    { id: 'shoes', name: 'Shoes', count: fashionItems.filter(item => item.category === 'shoes').length },
    { id: 'accessories', name: 'Accessories', count: fashionItems.filter(item => item.category === 'accessories').length },
    { id: 'bags', name: 'Bags', count: fashionItems.filter(item => item.category === 'bags').length }
  ];

  const filteredItems = fashionItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    const matchesSize = !selectedSize || item.sizes.includes(selectedSize);

    return matchesSearch && matchesCategory && matchesPrice && matchesSize;
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

  const addToCart = (itemId: string, size: string, color: string) => {
    const existingItem = cart.find(item => item.id === itemId && item.size === size && item.color === color);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === itemId && item.size === size && item.color === color
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { id: itemId, size, color, quantity: 1 }]);
    }
  };

  const FashionItemCard = ({ item }: { item: FashionItem }) => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
      viewMode === 'list' ? 'flex' : ''
    }`}>
      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-[3/4]'}`}>
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
            <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.brand}</p>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600 ml-1">{item.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">${item.price}</span>
          {item.originalPrice && (
            <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {item.colors.slice(0, 4).map((color, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: color.toLowerCase() === 'white' ? '#f3f4f6' : color.toLowerCase() }}
              title={color}
            />
          ))}
          {item.colors.length > 4 && (
            <span className="text-xs text-gray-500">+{item.colors.length - 4}</span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => addToCart(item.id, item.sizes[0], item.colors[0])}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Share2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">{item.reviews} reviews</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Fashion</h1>
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
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="float-right text-sm text-gray-500">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                    className={`py-2 px-3 border rounded-lg text-sm transition-colors ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-3">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
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
                    placeholder="Search fashion items..."
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
                Showing {filteredItems.length} of {fashionItems.length} items
                {selectedCategory !== 'all' && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
              </p>
            </div>

            {/* Fashion Items Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {filteredItems.map(item => (
                <FashionItemCard key={item.id} item={item} />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, 1000]);
                    setSelectedSize('');
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

export default FashionPage;