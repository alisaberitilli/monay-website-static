'use client';

import React, { useState } from 'react';
import { Search, Users, Calendar, Clock, Star, ArrowLeft, Plus, Minus, ShoppingCart, Utensils, ChefHat, Truck } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface CateringService {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  pricePerPerson: {
    min: number;
    max: number;
  };
  image: string;
  minimumOrder: number;
  deliveryRadius: string;
  specialties: string[];
  description: string;
  services: string[];
  packages: CateringPackage[];
}

interface CateringPackage {
  id: string;
  name: string;
  pricePerPerson: number;
  description: string;
  minGuests: number;
  maxGuests: number;
  items: string[];
  includes: string[];
}

interface OrderItem {
  packageId: string;
  serviceName: string;
  packageName: string;
  pricePerPerson: number;
  guestCount: number;
}

const CateringPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [guestCount, setGuestCount] = useState(50);
  const [eventDate, setEventDate] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [budget, setBudget] = useState<[number, number]>([20, 200]);

  const cateringServices: CateringService[] = [
    {
      id: '1',
      name: 'Gourmet Occasions Catering',
      cuisine: 'American',
      rating: 4.9,
      reviews: 234,
      pricePerPerson: { min: 35, max: 85 },
      image: '/api/placeholder/400/300',
      minimumOrder: 25,
      deliveryRadius: '25 miles',
      specialties: ['Corporate Events', 'Weddings', 'Fine Dining'],
      description: 'Premium catering service specializing in elegant events and corporate functions with locally sourced ingredients.',
      services: ['Full Service Setup', 'Professional Staff', 'Equipment Rental', 'Event Planning'],
      packages: [
        {
          id: '1-1',
          name: 'Corporate Lunch Package',
          pricePerPerson: 28,
          description: 'Perfect for business meetings and corporate events',
          minGuests: 10,
          maxGuests: 100,
          items: ['Choice of 2 entrees', 'Garden salad', 'Bread rolls', 'Dessert', 'Beverages'],
          includes: ['Setup & cleanup', 'Serving utensils', 'Professional presentation']
        },
        {
          id: '1-2',
          name: 'Wedding Reception Package',
          pricePerPerson: 65,
          description: 'Elegant dining experience for your special day',
          minGuests: 50,
          maxGuests: 300,
          items: ['3-course plated dinner', 'Cocktail hour appetizers', 'Wedding cake', 'Open bar service'],
          includes: ['Professional wait staff', 'Linens & place settings', 'Cake cutting service', 'Coordination']
        },
        {
          id: '1-3',
          name: 'Executive Dinner Package',
          pricePerPerson: 85,
          description: 'Premium dining for high-end corporate events',
          minGuests: 20,
          maxGuests: 150,
          items: ['4-course gourmet meal', 'Wine pairing', 'Artisanal appetizers', 'Premium desserts'],
          includes: ['Executive chef on-site', 'Premium service staff', 'Upgraded linens', 'Custom menu options']
        }
      ]
    },
    {
      id: '2',
      name: 'Spice Route Catering',
      cuisine: 'Indian',
      rating: 4.7,
      reviews: 189,
      pricePerPerson: { min: 22, max: 45 },
      image: '/api/placeholder/400/300',
      minimumOrder: 20,
      deliveryRadius: '20 miles',
      specialties: ['Indian Cuisine', 'Vegetarian Options', 'Spice Blends'],
      description: 'Authentic Indian catering with traditional recipes and modern presentation, perfect for cultural events.',
      services: ['Traditional Setup', 'Cultural Decoration', 'Vegetarian Specialties', 'Custom Spice Levels'],
      packages: [
        {
          id: '2-1',
          name: 'Classic Indian Buffet',
          pricePerPerson: 25,
          description: 'Traditional Indian buffet with all the favorites',
          minGuests: 15,
          maxGuests: 200,
          items: ['3 curry dishes', 'Basmati rice', 'Naan bread', 'Appetizers', 'Dessert', 'Chai tea'],
          includes: ['Buffet setup', 'Serving staff', 'Traditional presentation', 'Warming equipment']
        },
        {
          id: '2-2',
          name: 'Wedding Feast Package',
          pricePerPerson: 42,
          description: 'Grand Indian wedding celebration menu',
          minGuests: 100,
          maxGuests: 500,
          items: ['6 curry varieties', 'Tandoor specialties', 'Street food station', 'Traditional sweets', 'Lassi bar'],
          includes: ['Traditional decor', 'Full service staff', 'Cultural entertainment coordination', 'Multiple stations']
        }
      ]
    },
    {
      id: '3',
      name: 'Mediterranean Delights',
      cuisine: 'Mediterranean',
      rating: 4.8,
      reviews: 156,
      pricePerPerson: { min: 30, max: 60 },
      image: '/api/placeholder/400/300',
      minimumOrder: 30,
      deliveryRadius: '30 miles',
      specialties: ['Fresh Ingredients', 'Healthy Options', 'Grilled Specialties'],
      description: 'Fresh Mediterranean cuisine featuring healthy, flavorful dishes perfect for health-conscious events.',
      services: ['Fresh Preparation', 'Dietary Accommodations', 'Outdoor Grilling', 'Healthy Options'],
      packages: [
        {
          id: '3-1',
          name: 'Mediterranean Lunch',
          pricePerPerson: 32,
          description: 'Light and fresh Mediterranean lunch experience',
          minGuests: 20,
          maxGuests: 150,
          items: ['Grilled protein selection', 'Fresh salads', 'Hummus & pita', 'Olives & feta', 'Baklava'],
          includes: ['Fresh preparation', 'Healthy options', 'Beautiful presentation', 'Dietary accommodations']
        },
        {
          id: '3-2',
          name: 'Sunset Dinner Package',
          pricePerPerson: 58,
          description: 'Elegant Mediterranean dinner with premium selections',
          minGuests: 40,
          maxGuests: 200,
          items: ['Premium grilled seafood & meats', 'Artisanal salads', 'Wine selection', 'Mediterranean desserts'],
          includes: ['Chef attendance', 'Premium service', 'Wine service', 'Elegant presentation']
        }
      ]
    },
    {
      id: '4',
      name: 'BBQ Masters Catering',
      cuisine: 'BBQ',
      rating: 4.6,
      reviews: 298,
      pricePerPerson: { min: 18, max: 40 },
      image: '/api/placeholder/400/300',
      minimumOrder: 25,
      deliveryRadius: '35 miles',
      specialties: ['Smoked Meats', 'Outdoor Events', 'Casual Dining'],
      description: 'Award-winning BBQ catering perfect for casual events, corporate picnics, and outdoor celebrations.',
      services: ['On-site Smoking', 'Outdoor Setup', 'Casual Service', 'Large Groups'],
      packages: [
        {
          id: '4-1',
          name: 'Classic BBQ Package',
          pricePerPerson: 22,
          description: 'Traditional BBQ favorites for any gathering',
          minGuests: 25,
          maxGuests: 300,
          items: ['Choice of 2 meats', 'BBQ sides', 'Cornbread', 'Coleslaw', 'Dessert'],
          includes: ['Buffet setup', 'Serving equipment', 'Casual presentation', 'Cleanup service']
        },
        {
          id: '4-2',
          name: 'Pitmaster Special',
          pricePerPerson: 38,
          description: 'Premium BBQ experience with all the fixings',
          minGuests: 50,
          maxGuests: 400,
          items: ['3 premium smoked meats', 'Gourmet sides', 'Artisan breads', 'Craft beer selection'],
          includes: ['Pitmaster on-site', 'Premium cuts', 'Beer service', 'Enhanced setup']
        }
      ]
    }
  ];

  const cuisines = ['All', 'American', 'Indian', 'Mediterranean', 'BBQ', 'Italian', 'Mexican', 'Asian', 'French'];

  const filteredServices = cateringServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || service.cuisine.toLowerCase() === selectedCuisine.toLowerCase();
    const matchesMinimum = service.minimumOrder <= guestCount;
    const matchesBudget = service.pricePerPerson.min <= budget[1] && service.pricePerPerson.max >= budget[0];

    return matchesSearch && matchesCuisine && matchesMinimum && matchesBudget;
  });

  const addToCart = (pkg: CateringPackage, service: CateringService) => {
    const orderItem: OrderItem = {
      packageId: pkg.id,
      serviceName: service.name,
      packageName: pkg.name,
      pricePerPerson: pkg.pricePerPerson,
      guestCount: guestCount
    };

    const existingItem = cart.find(item => item.packageId === pkg.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.packageId === pkg.id
          ? { ...item, guestCount: guestCount }
          : item
      ));
    } else {
      setCart([...cart, orderItem]);
    }
  };

  const removeFromCart = (packageId: string) => {
    setCart(cart.filter(item => item.packageId !== packageId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.pricePerPerson * item.guestCount), 0);
  };

  const selectedServiceData = cateringServices.find(s => s.id === selectedService);

  if (selectedService && selectedServiceData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Service Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedService(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{selectedServiceData.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    {selectedServiceData.rating} ({selectedServiceData.reviews} reviews)
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Min. {selectedServiceData.minimumOrder} guests
                  </span>
                  <span className="flex items-center">
                    <Truck className="h-4 w-4 mr-1" />
                    {selectedServiceData.deliveryRadius} radius
                  </span>
                </div>
              </div>
              {cart.length > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">{cart.length} packages</p>
                  <p className="font-semibold">${getCartTotal().toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Service Details & Packages */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <img
                  src={selectedServiceData.image}
                  alt={selectedServiceData.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About Our Catering</h2>
                <p className="text-gray-600 mb-4">{selectedServiceData.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedServiceData.specialties.map((specialty, index) => (
                        <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Services</h3>
                    <ul className="space-y-1">
                      {selectedServiceData.services.map((service, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Packages */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Catering Packages</h2>
                <div className="space-y-6">
                  {selectedServiceData.packages.map((pkg) => {
                    const isInCart = cart.some(item => item.packageId === pkg.id);
                    return (
                      <div key={pkg.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                            <p className="text-sm text-gray-600">{pkg.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">${pkg.pricePerPerson}</p>
                            <p className="text-sm text-gray-500">per person</p>
                            <p className="text-xs text-gray-500">{pkg.minGuests}-{pkg.maxGuests} guests</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Menu Items:</h4>
                            <ul className="space-y-1">
                              {pkg.items.map((item, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Includes:</h4>
                            <ul className="space-y-1">
                              {pkg.includes.map((include, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-center">
                                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
                                  {include}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            For {guestCount} guests: <strong>${(pkg.pricePerPerson * guestCount).toLocaleString()}</strong>
                          </div>
                          {guestCount >= pkg.minGuests && guestCount <= pkg.maxGuests ? (
                            <button
                              onClick={() => isInCart ? removeFromCart(pkg.id) : addToCart(pkg, selectedServiceData)}
                              className={`px-6 py-2 rounded-lg transition-colors ${
                                isInCart
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isInCart ? 'Remove from Cart' : 'Add to Cart'}
                            </button>
                          ) : (
                            <div className="text-sm text-red-600">
                              Guest count must be {pkg.minGuests}-{pkg.maxGuests}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Event Details Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                    <input
                      type="number"
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                      min={selectedServiceData.minimumOrder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option>Corporate Event</option>
                      <option>Wedding</option>
                      <option>Birthday Party</option>
                      <option>Anniversary</option>
                      <option>Graduation</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                {cart.length > 0 && (
                  <>
                    <div className="border-t pt-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-3">Your Order</h4>
                      <div className="space-y-2 mb-4">
                        {cart.map((item) => (
                          <div key={item.packageId} className="text-sm">
                            <div className="flex justify-between">
                              <span className="font-medium">{item.packageName}</span>
                              <button
                                onClick={() => removeFromCart(item.packageId)}
                                className="text-red-600 hover:text-red-800"
                              >
                                ×
                              </button>
                            </div>
                            <div className="text-gray-600">
                              {item.guestCount} guests × ${item.pricePerPerson} = ${(item.guestCount * item.pricePerPerson).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2 font-semibold">
                        Total: ${getCartTotal().toLocaleString()}
                      </div>
                    </div>

                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors mb-3">
                      Request Quote
                    </button>
                  </>
                )}

                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                  Contact Caterer
                </button>

                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  <p>• Quotes are custom based on menu, location, and services</p>
                  <p>• Minimum {selectedServiceData.minimumOrder} guests required</p>
                  <p>• Service area: {selectedServiceData.deliveryRadius}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Catering Services</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search catering services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine.toLowerCase()}>{cuisine}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  placeholder="Guests"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget per person ($)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={budget[0]}
                  onChange={(e) => setBudget([parseInt(e.target.value) || 0, budget[1]])}
                  className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  value={budget[1]}
                  onChange={(e) => setBudget([budget[0], parseInt(e.target.value) || 200])}
                  className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Catering Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-48 object-cover"
              />

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.cuisine} Cuisine</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600 ml-1">{service.rating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {service.specialties.slice(0, 2).map((specialty, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                  {service.specialties.length > 2 && (
                    <span className="text-xs text-gray-500">+{service.specialties.length - 2}</span>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      ${service.pricePerPerson.min} - ${service.pricePerPerson.max}
                    </p>
                    <p className="text-xs text-gray-500">per person</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Min. {service.minimumOrder}</p>
                    <p className="text-xs text-gray-500">guests</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No catering services found</h3>
            <p className="text-gray-600">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CateringPage;