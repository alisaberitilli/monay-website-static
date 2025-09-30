'use client';

import React, { useState } from 'react';
import { Search, BookOpen, ShoppingCart, Heart, ArrowLeft, Filter, Star, Truck, DollarSign, Eye, Share2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Textbook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  edition: number;
  subject: string;
  price: {
    new: number;
    used: number;
    rental: number;
    digital: number;
  };
  image: string;
  rating: number;
  reviews: number;
  publisher: string;
  condition: 'new' | 'like-new' | 'good' | 'acceptable';
  availability: {
    new: boolean;
    used: boolean;
    rental: boolean;
    digital: boolean;
  };
  description: string;
  required: boolean;
  dueDate?: string;
}

interface CartItem {
  id: string;
  title: string;
  type: 'new' | 'used' | 'rental' | 'digital';
  price: number;
  quantity: number;
  dueDate?: string;
}

const BooksPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState('relevance');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const textbooks: Textbook[] = [
    {
      id: '1',
      title: 'Calculus: Early Transcendentals',
      author: 'James Stewart',
      isbn: '978-1285741550',
      edition: 8,
      subject: 'Mathematics',
      price: {
        new: 319.95,
        used: 189.99,
        rental: 89.99,
        digital: 239.99
      },
      image: '/api/placeholder/200/280',
      rating: 4.3,
      reviews: 1247,
      publisher: 'Cengage Learning',
      condition: 'new',
      availability: {
        new: true,
        used: true,
        rental: true,
        digital: true
      },
      description: 'Comprehensive calculus textbook covering differential and integral calculus with applications.',
      required: true,
      dueDate: '2024-12-15'
    },
    {
      id: '2',
      title: 'Campbell Biology',
      author: 'Jane B. Reece, Lisa A. Urry',
      isbn: '978-0134093413',
      edition: 11,
      subject: 'Biology',
      price: {
        new: 398.67,
        used: 299.99,
        rental: 129.99,
        digital: 279.99
      },
      image: '/api/placeholder/200/280',
      rating: 4.6,
      reviews: 892,
      publisher: 'Pearson',
      condition: 'new',
      availability: {
        new: true,
        used: true,
        rental: true,
        digital: true
      },
      description: 'The world\'s most successful majors biology textbook and teaching program.',
      required: true,
      dueDate: '2024-12-20'
    },
    {
      id: '3',
      title: 'Principles of Economics',
      author: 'N. Gregory Mankiw',
      isbn: '978-1305585126',
      edition: 8,
      subject: 'Economics',
      price: {
        new: 289.95,
        used: 159.99,
        rental: 79.99,
        digital: 199.99
      },
      image: '/api/placeholder/200/280',
      rating: 4.2,
      reviews: 678,
      publisher: 'Cengage Learning',
      condition: 'new',
      availability: {
        new: true,
        used: true,
        rental: true,
        digital: true
      },
      description: 'Introduction to microeconomics and macroeconomics with real-world applications.',
      required: false
    },
    {
      id: '4',
      title: 'Organic Chemistry',
      author: 'Paula Yurkanis Bruice',
      isbn: '978-0321803221',
      edition: 7,
      subject: 'Chemistry',
      price: {
        new: 356.67,
        used: 249.99,
        rental: 119.99,
        digital: 249.99
      },
      image: '/api/placeholder/200/280',
      rating: 4.1,
      reviews: 543,
      publisher: 'Pearson',
      condition: 'new',
      availability: {
        new: true,
        used: false,
        rental: true,
        digital: true
      },
      description: 'Comprehensive organic chemistry textbook with mechanisms and synthesis.',
      required: true,
      dueDate: '2024-12-18'
    },
    {
      id: '5',
      title: 'Psychology: The Science of Mind and Behaviour',
      author: 'Michael W. Passer, Ronald E. Smith',
      isbn: '978-0077861872',
      edition: 6,
      subject: 'Psychology',
      price: {
        new: 278.99,
        used: 149.99,
        rental: 69.99,
        digital: 189.99
      },
      image: '/api/placeholder/200/280',
      rating: 4.4,
      reviews: 721,
      publisher: 'McGraw-Hill',
      condition: 'new',
      availability: {
        new: true,
        used: true,
        rental: true,
        digital: true
      },
      description: 'Comprehensive introduction to psychological science and research methods.',
      required: false
    },
    {
      id: '6',
      title: 'Computer Science: An Overview',
      author: 'J. Glenn Brookshear, Dennis Brylow',
      isbn: '978-0133760064',
      edition: 12,
      subject: 'Computer Science',
      price: {
        new: 245.99,
        used: 139.99,
        rental: 89.99,
        digital: 169.99
      },
      image: '/api/placeholder/200/280',
      rating: 4.0,
      reviews: 456,
      publisher: 'Pearson',
      condition: 'new',
      availability: {
        new: true,
        used: true,
        rental: true,
        digital: true
      },
      description: 'Broad introduction to computer science concepts and programming fundamentals.',
      required: true,
      dueDate: '2024-12-22'
    }
  ];

  const subjects = [
    'All Subjects',
    'Mathematics',
    'Biology',
    'Chemistry',
    'Physics',
    'Economics',
    'Psychology',
    'Computer Science',
    'English',
    'History',
    'Engineering'
  ];

  const formats = [
    'All Formats',
    'New',
    'Used',
    'Rental',
    'Digital'
  ];

  const filteredBooks = textbooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.isbn.includes(searchQuery);
    const matchesSubject = selectedSubject === 'all' || book.subject.toLowerCase() === selectedSubject.toLowerCase();
    const lowestPrice = Math.min(book.price.new, book.price.used, book.price.rental, book.price.digital);
    const matchesPrice = lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];

    return matchesSearch && matchesSubject && matchesPrice;
  });

  const addToCart = (book: Textbook, type: 'new' | 'used' | 'rental' | 'digital') => {
    if (!book.availability[type]) return;

    const existingItem = cart.find(item => item.id === book.id && item.type === type);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === book.id && item.type === type
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: book.id,
        title: book.title,
        type,
        price: book.price[type],
        quantity: 1,
        dueDate: type === 'rental' ? book.dueDate : undefined
      }]);
    }
  };

  const toggleFavorite = (bookId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(bookId)) {
      newFavorites.delete(bookId);
    } else {
      newFavorites.add(bookId);
    }
    setFavorites(newFavorites);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const BookCard = ({ book }: { book: Textbook }) => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
      viewMode === 'list' ? 'flex' : ''
    }`}>
      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-[2/3]'}`}>
        <img
          src={book.image}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        {book.required && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            REQUIRED
          </div>
        )}
        <button
          onClick={() => toggleFavorite(book.id)}
          className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
        >
          <Heart className={`h-4 w-4 ${favorites.has(book.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>

      <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
            <p className="text-sm text-gray-600">{book.author}</p>
            <p className="text-xs text-gray-500">Edition {book.edition} • {book.publisher}</p>
          </div>
          <div className="flex items-center ml-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600 ml-1">{book.rating}</span>
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">ISBN: {book.isbn}</p>
          {book.dueDate && (
            <p className="text-xs text-orange-600">Rental due: {new Date(book.dueDate).toLocaleDateString()}</p>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {book.availability.new && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">${book.price.new}</span>
                <button
                  onClick={() => addToCart(book, 'new')}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}
          {book.availability.used && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Used:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-600">${book.price.used}</span>
                <button
                  onClick={() => addToCart(book, 'used')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          )}
          {book.availability.rental && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rental:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-purple-600">${book.price.rental}</span>
                <button
                  onClick={() => addToCart(book, 'rental')}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
                >
                  Rent
                </button>
              </div>
            </div>
          )}
          {book.availability.digital && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Digital:</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-orange-600">${book.price.digital}</span>
                <button
                  onClick={() => addToCart(book, 'digital')}
                  className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 transition-colors"
                >
                  Buy
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm">
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm">
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">{book.reviews} reviews</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Textbooks</h1>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
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
                  placeholder="Title, author, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject === 'All Subjects' ? 'all' : subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Format */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {formats.map(format => (
                  <option key={format} value={format === 'All Formats' ? 'all' : format.toLowerCase()}>
                    {format}
                  </option>
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
                  max="500"
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
                  <span className="ml-2 text-sm text-gray-700">Required textbooks only</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Rental available</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Digital version available</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Free shipping eligible</span>
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
                    {filteredBooks.length} books found
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="title">Title A-Z</option>
                  </select>
                </div>

                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    <div className="grid grid-cols-2 gap-1 w-4 h-4">
                      <div className="bg-current w-1.5 h-1.5 rounded-sm"></div>
                      <div className="bg-current w-1.5 h-1.5 rounded-sm"></div>
                      <div className="bg-current w-1.5 h-1.5 rounded-sm"></div>
                      <div className="bg-current w-1.5 h-1.5 rounded-sm"></div>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                  >
                    <div className="space-y-1 w-4 h-4">
                      <div className="bg-current w-4 h-1 rounded-sm"></div>
                      <div className="bg-current w-4 h-1 rounded-sm"></div>
                      <div className="bg-current w-4 h-1 rounded-sm"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Books Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {filteredBooks.map(book => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No textbooks found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSubject('all');
                    setSelectedFormat('all');
                    setPriceRange([0, 500]);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
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
      </div>
    </DashboardLayout>
  );
};

export default BooksPage;