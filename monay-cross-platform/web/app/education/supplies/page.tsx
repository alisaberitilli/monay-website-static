'use client';

import React, { useState } from 'react';
import { Search, ShoppingCart, Heart, ArrowLeft, Filter, Star, Truck, DollarSign, Eye, Share2, Grid, List, Package, Users } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface SchoolSupply {
  id: string;
  name: string;
  brand: string;
  category: 'writing' | 'notebooks' | 'binders' | 'art' | 'technology' | 'backpacks' | 'classroom';
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  ageGroup: 'elementary' | 'middle' | 'high' | 'college' | 'all';
  inStock: boolean;
  quantity: number;
  bulkDiscount?: {
    minQuantity: number;
    discount: number;
  };
  freeShipping: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface SupplyList {
  id: string;
  name: string;
  grade: string;
  school: string;
  items: string[];
  completed: number;
  total: number;
}

const SuppliesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'browse' | 'lists'>('browse');

  const supplies: SchoolSupply[] = [
    {
      id: '1',
      name: 'BIC Cristal Medium Ballpoint Pens (Pack of 50)',
      brand: 'BIC',
      category: 'writing',
      price: 12.99,
      originalPrice: 16.99,
      image: '/api/placeholder/200/200',
      rating: 4.6,
      reviews: 2847,
      description: 'Reliable everyday ballpoint pens with smooth writing and long-lasting ink.',
      features: ['Medium point', '1.0mm tip', 'Blue ink', 'Bulk pack'],
      ageGroup: 'all',
      inStock: true,
      quantity: 150,
      bulkDiscount: { minQuantity: 5, discount: 0.15 },
      freeShipping: true
    },
    {
      id: '2',
      name: 'Five Star Spiral Notebooks (5-Pack)',
      brand: 'Five Star',
      category: 'notebooks',
      price: 24.99,
      image: '/api/placeholder/200/200',
      rating: 4.8,
      reviews: 1234,
      description: 'College-ruled spiral notebooks with reinforced covers for durability.',
      features: ['College ruled', '100 sheets each', 'Perforated pages', 'Reinforced covers'],
      ageGroup: 'college',
      inStock: true,
      quantity: 89,
      freeShipping: true
    },
    {
      id: '3',
      name: 'Crayola Colored Pencils (64 Count)',
      brand: 'Crayola',
      category: 'art',
      price: 8.97,
      originalPrice: 12.99,
      image: '/api/placeholder/200/200',
      rating: 4.7,
      reviews: 1567,
      description: 'Vibrant colored pencils perfect for art projects and creative expression.',
      features: ['64 colors', 'Pre-sharpened', 'Built-in sharpener', 'Non-toxic'],
      ageGroup: 'elementary',
      inStock: true,
      quantity: 245,
      freeShipping: false
    },
    {
      id: '4',
      name: 'JanSport SuperBreak Backpack',
      brand: 'JanSport',
      category: 'backpacks',
      price: 39.99,
      image: '/api/placeholder/200/200',
      rating: 4.5,
      reviews: 892,
      description: 'Classic backpack with large main compartment and front utility pocket.',
      features: ['600 denier polyester', 'Padded shoulder straps', 'Web haul handle', 'Lifetime warranty'],
      ageGroup: 'all',
      inStock: true,
      quantity: 67,
      freeShipping: true
    },
    {
      id: '5',
      name: 'Texas Instruments TI-84 Plus CE Graphing Calculator',
      brand: 'Texas Instruments',
      category: 'technology',
      price: 119.99,
      originalPrice: 149.99,
      image: '/api/placeholder/200/200',
      rating: 4.4,
      reviews: 2156,
      description: 'High-resolution color display graphing calculator for advanced mathematics.',
      features: ['Color display', 'Rechargeable battery', 'Pre-loaded apps', 'Python programming'],
      ageGroup: 'high',
      inStock: true,
      quantity: 34,
      freeShipping: true
    },
    {
      id: '6',
      name: 'Avery Heavy-Duty Binders (3-Pack)',
      brand: 'Avery',
      category: 'binders',
      price: 29.99,
      image: '/api/placeholder/200/200',
      rating: 4.3,
      reviews: 678,
      description: 'Durable 3-ring binders with EZD ring for easy document insertion.',
      features: ['3-inch capacity', 'EZD ring', 'Heavy-duty construction', 'Clear overlay'],
      ageGroup: 'all',
      inStock: true,
      quantity: 123,
      freeShipping: true
    },
    {
      id: '7',
      name: 'Elmer\'s School Glue Sticks (12-Pack)',
      brand: 'Elmer\'s',
      category: 'classroom',
      price: 15.99,
      originalPrice: 19.99,
      image: '/api/placeholder/200/200',
      rating: 4.6,
      reviews: 1345,
      description: 'Washable, non-toxic glue sticks perfect for school projects.',
      features: ['Washable', 'Non-toxic', 'Goes on smooth', 'Dries clear'],
      ageGroup: 'elementary',
      inStock: true,
      quantity: 198,
      bulkDiscount: { minQuantity: 3, discount: 0.10 },
      freeShipping: false
    },
    {
      id: '8',
      name: 'Post-it Super Sticky Notes Variety Pack',
      brand: 'Post-it',
      category: 'writing',
      price: 18.99,
      image: '/api/placeholder/200/200',
      rating: 4.8,
      reviews: 934,
      description: 'Assorted sizes and colors of super sticky notes for organization.',
      features: ['Super sticky adhesive', 'Multiple sizes', 'Bright colors', 'Repositionable'],
      ageGroup: 'all',
      inStock: true,
      quantity: 156,
      freeShipping: true
    }
  ];

  const supplyLists: SupplyList[] = [
    {
      id: '1',
      name: 'Ms. Johnson\'s 5th Grade Class',
      grade: '5th Grade',
      school: 'Lincoln Elementary',
      items: ['24 #2 pencils', 'Colored pencils (24 count)', '5 composition notebooks', 'Glue sticks (4)', 'Scissors', 'Ruler', 'Erasers (pink pearl)', 'Markers (washable)', 'Folders (5)', 'Tissues (2 boxes)'],
      completed: 6,
      total: 10
    },
    {
      id: '2',
      name: 'High School Freshman Essentials',
      grade: '9th Grade',
      school: 'Central High School',
      items: ['Binders (5)', 'Notebook paper (500 sheets)', 'Pens (blue/black)', 'Highlighters', 'Calculator (scientific)', 'USB flash drive', 'Backpack', 'Planner/agenda'],
      completed: 3,
      total: 8
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', count: supplies.length },
    { id: 'writing', name: 'Writing', count: supplies.filter(s => s.category === 'writing').length },
    { id: 'notebooks', name: 'Notebooks & Paper', count: supplies.filter(s => s.category === 'notebooks').length },
    { id: 'binders', name: 'Binders & Organization', count: supplies.filter(s => s.category === 'binders').length },
    { id: 'art', name: 'Art Supplies', count: supplies.filter(s => s.category === 'art').length },
    { id: 'technology', name: 'Technology', count: supplies.filter(s => s.category === 'technology').length },
    { id: 'backpacks', name: 'Backpacks & Bags', count: supplies.filter(s => s.category === 'backpacks').length },
    { id: 'classroom', name: 'Classroom Essentials', count: supplies.filter(s => s.category === 'classroom').length }
  ];

  const ageGroups = [
    { id: 'all', name: 'All Ages' },
    { id: 'elementary', name: 'Elementary (K-5)' },
    { id: 'middle', name: 'Middle School (6-8)' },
    { id: 'high', name: 'High School (9-12)' },
    { id: 'college', name: 'College/University' }
  ];

  const filteredSupplies = supplies.filter(supply => {
    const matchesSearch = supply.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         supply.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || supply.category === selectedCategory;
    const matchesAge = selectedAge === 'all' || supply.ageGroup === selectedAge || supply.ageGroup === 'all';
    const matchesPrice = supply.price >= priceRange[0] && supply.price <= priceRange[1];
    const inStock = supply.inStock;

    return matchesSearch && matchesCategory && matchesAge && matchesPrice && inStock;
  });

  const addToCart = (supply: SchoolSupply, quantity: number = 1) => {
    const existingItem = cart.find(item => item.id === supply.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === supply.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        id: supply.id,
        name: supply.name,
        price: supply.price,
        quantity,
        image: supply.image
      }]);
    }
  };

  const toggleFavorite = (supplyId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(supplyId)) {
      newFavorites.delete(supplyId);
    } else {
      newFavorites.add(supplyId);
    }
    setFavorites(newFavorites);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const SupplyCard = ({ supply }: { supply: SchoolSupply }) => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
      viewMode === 'list' ? 'flex' : ''
    }`}>
      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
        <img
          src={supply.image}
          alt={supply.name}
          className="w-full h-full object-cover"
        />
        {supply.originalPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
            SALE
          </div>
        )}
        {supply.freeShipping && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
            <Truck className="h-3 w-3 inline mr-1" />
            Free Ship
          </div>
        )}
        <button
          onClick={() => toggleFavorite(supply.id)}
          className="absolute bottom-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <Heart className={`h-4 w-4 ${favorites.has(supply.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>

      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{supply.name}</h3>
            <p className="text-sm text-gray-600">{supply.brand}</p>
          </div>
          <div className="flex items-center ml-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600 ml-1">{supply.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">${supply.price}</span>
          {supply.originalPrice && (
            <span className="text-sm text-gray-500 line-through">${supply.originalPrice}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {supply.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
          {supply.features.length > 3 && (
            <span className="text-xs text-gray-500">+{supply.features.length - 3} more</span>
          )}
        </div>

        {supply.bulkDiscount && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
            <p className="text-xs text-yellow-800">
              <strong>{(supply.bulkDiscount.discount * 100)}% off</strong> when you buy {supply.bulkDiscount.minQuantity}+
            </p>
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <button
            onClick={() => addToCart(supply)}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">{supply.reviews} reviews</span>
          <span className={`font-medium ${supply.quantity > 10 ? 'text-green-600' : 'text-orange-600'}`}>
            {supply.quantity} in stock
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">School Supplies</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items in cart
              </span>
              <span className="text-sm font-semibold text-gray-900">
                ${getCartTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'browse'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="h-4 w-4 inline mr-2" />
              Browse Supplies
            </button>
            <button
              onClick={() => setActiveTab('lists')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'lists'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              School Lists ({supplyLists.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'browse' && (
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <div className="w-80 bg-white p-6 rounded-lg shadow-sm h-fit">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Filters</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search supplies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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

              {/* Age Group */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
                <select
                  value={selectedAge}
                  onChange={(e) => setSelectedAge(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {ageGroups.map(age => (
                    <option key={age.id} value={age.id}>{age.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="200"
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

              {/* Quick Filters */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Free shipping</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Bulk discounts available</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Highly rated (4+ stars)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">In stock</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Controls */}
              <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {filteredSupplies.length} supplies found
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>

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

              {/* Supplies Grid */}
              <div className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}>
                {filteredSupplies.map(supply => (
                  <SupplyCard key={supply.id} supply={supply} />
                ))}
              </div>

              {filteredSupplies.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No supplies found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedAge('all');
                      setPriceRange([0, 200]);
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lists' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">School Supply Lists</h2>

              <div className="space-y-6">
                {supplyLists.map((list) => (
                  <div key={list.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                        <p className="text-gray-600">{list.grade} • {list.school}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(list.completed / list.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {list.completed}/{list.total}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {Math.round((list.completed / list.total) * 100)}% complete
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {list.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={index < list.completed}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            readOnly
                          />
                          <span className={index < list.completed ? 'text-gray-500 line-through' : 'text-gray-900'}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Shop This List
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                        Print List
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {supplyLists.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No supply lists yet</h3>
                  <p className="text-gray-600 mb-4">Add your school's supply list to get started</p>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Add Supply List
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Cart Summary</h3>
            <ShoppingCart className="h-5 w-5 text-gray-600" />
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} items
          </div>
          <div className="text-lg font-bold text-gray-900 mb-3">
            ${getCartTotal().toFixed(2)}
          </div>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            View Cart & Checkout
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SuppliesPage;