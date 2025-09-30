'use client';

import React, { useState } from 'react';
import { Search, Calendar, MapPin, Clock, Users, Star, ArrowLeft, Filter, Heart, Ticket, Music, Camera, Utensils } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Event {
  id: string;
  name: string;
  venue: string;
  date: string;
  time: string;
  location: string;
  price: {
    min: number;
    max: number;
  };
  image: string;
  category: 'wedding' | 'corporate' | 'birthday' | 'anniversary' | 'graduation' | 'other';
  capacity: number;
  rating: number;
  reviews: number;
  features: string[];
  description: string;
  packages: EventPackage[];
}

interface EventPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  inclusions: string[];
  maxGuests: number;
}

const EventsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('featured');
  const [guestCount, setGuestCount] = useState(50);

  const events: Event[] = [
    {
      id: '1',
      name: 'Grand Ballroom at The Plaza',
      venue: 'The Plaza Hotel',
      date: '2024-02-15',
      time: '6:00 PM - 12:00 AM',
      location: 'Downtown Manhattan, NY',
      price: { min: 5000, max: 15000 },
      image: '/api/placeholder/400/300',
      category: 'wedding',
      capacity: 200,
      rating: 4.9,
      reviews: 156,
      features: ['Full Service Bar', 'Live Music Setup', 'Professional Lighting', 'Wedding Coordinator'],
      description: 'Elegant ballroom perfect for weddings and special occasions with stunning city views.',
      packages: [
        {
          id: '1-1',
          name: 'Classic Wedding Package',
          price: 8500,
          description: 'Complete wedding package with all essentials',
          inclusions: ['6-hour venue rental', 'Tables & chairs', 'Basic lighting', 'Sound system', 'Bridal suite'],
          maxGuests: 100
        },
        {
          id: '1-2',
          name: 'Premium Wedding Package',
          price: 12500,
          description: 'Luxury wedding experience with premium amenities',
          inclusions: ['8-hour venue rental', 'Premium decor', 'Professional lighting', 'Live music setup', 'Bridal & groom suites', 'Wedding coordinator'],
          maxGuests: 150
        }
      ]
    },
    {
      id: '2',
      name: 'Corporate Conference Center',
      venue: 'Business Tower',
      date: '2024-02-20',
      time: '9:00 AM - 6:00 PM',
      location: 'Financial District, NY',
      price: { min: 2000, max: 8000 },
      image: '/api/placeholder/400/300',
      category: 'corporate',
      capacity: 300,
      rating: 4.7,
      reviews: 89,
      features: ['AV Equipment', 'High-Speed WiFi', 'Catering Kitchen', 'Parking Available'],
      description: 'Modern conference center ideal for corporate events, meetings, and business gatherings.',
      packages: [
        {
          id: '2-1',
          name: 'Half-Day Corporate',
          price: 3500,
          description: 'Perfect for meetings and small corporate events',
          inclusions: ['4-hour venue rental', 'AV equipment', 'WiFi', 'Coffee service', 'Parking'],
          maxGuests: 50
        },
        {
          id: '2-2',
          name: 'Full-Day Corporate',
          price: 6500,
          description: 'Complete corporate event package',
          inclusions: ['8-hour venue rental', 'Premium AV setup', 'Catering service', 'Break rooms', 'Parking', 'Event coordinator'],
          maxGuests: 150
        }
      ]
    },
    {
      id: '3',
      name: 'Garden Party Pavilion',
      venue: 'Botanical Gardens',
      date: '2024-02-25',
      time: '2:00 PM - 8:00 PM',
      location: 'Central Park Area, NY',
      price: { min: 1500, max: 5000 },
      image: '/api/placeholder/400/300',
      category: 'birthday',
      capacity: 100,
      rating: 4.6,
      reviews: 74,
      features: ['Outdoor Setting', 'Garden Views', 'Tent Available', 'Natural Lighting'],
      description: 'Beautiful garden setting perfect for birthdays, anniversaries, and intimate celebrations.',
      packages: [
        {
          id: '3-1',
          name: 'Garden Party Basic',
          price: 2500,
          description: 'Charming outdoor celebration package',
          inclusions: ['4-hour venue rental', 'Garden access', 'Basic seating', 'Sound system'],
          maxGuests: 50
        },
        {
          id: '3-2',
          name: 'Garden Party Deluxe',
          price: 4000,
          description: 'Enhanced garden party with premium amenities',
          inclusions: ['6-hour venue rental', 'Decorated pavilion', 'Premium seating', 'Catering setup', 'Photography area'],
          maxGuests: 80
        }
      ]
    },
    {
      id: '4',
      name: 'Rooftop Celebration Space',
      venue: 'Sky Lounge',
      date: '2024-03-01',
      time: '7:00 PM - 1:00 AM',
      location: 'Midtown Manhattan, NY',
      price: { min: 3000, max: 10000 },
      image: '/api/placeholder/400/300',
      category: 'graduation',
      capacity: 150,
      rating: 4.8,
      reviews: 127,
      features: ['City Skyline Views', 'Open Bar Available', 'DJ Setup', 'Climate Controlled'],
      description: 'Stunning rooftop venue with panoramic city views, perfect for graduations and milestone celebrations.',
      packages: [
        {
          id: '4-1',
          name: 'Graduation Celebration',
          price: 5500,
          description: 'Perfect for graduation parties and achievements',
          inclusions: ['5-hour venue rental', 'Skyline views', 'Sound system', 'Basic bar setup', 'Graduation decor'],
          maxGuests: 75
        },
        {
          id: '4-2',
          name: 'Premium Rooftop Experience',
          price: 8500,
          description: 'Luxury rooftop celebration with all amenities',
          inclusions: ['7-hour venue rental', 'Premium bar service', 'DJ setup', 'Professional lighting', 'Photo booth', 'Event planner'],
          maxGuests: 120
        }
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'All Events', count: events.length },
    { id: 'wedding', name: 'Weddings', count: events.filter(e => e.category === 'wedding').length },
    { id: 'corporate', name: 'Corporate', count: events.filter(e => e.category === 'corporate').length },
    { id: 'birthday', name: 'Birthdays', count: events.filter(e => e.category === 'birthday').length },
    { id: 'graduation', name: 'Graduations', count: events.filter(e => e.category === 'graduation').length },
    { id: 'anniversary', name: 'Anniversaries', count: events.filter(e => e.category === 'anniversary').length }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesCapacity = event.capacity >= guestCount;
    const matchesDate = !selectedDate || event.date >= selectedDate;

    return matchesSearch && matchesCategory && matchesCapacity && matchesDate;
  });

  const toggleFavorite = (eventId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(eventId)) {
      newFavorites.delete(eventId);
    } else {
      newFavorites.add(eventId);
    }
    setFavorites(newFavorites);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wedding': return <Heart className="h-4 w-4" />;
      case 'corporate': return <Users className="h-4 w-4" />;
      case 'birthday': return <Calendar className="h-4 w-4" />;
      case 'graduation': return <Star className="h-4 w-4" />;
      case 'anniversary': return <Heart className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const selectedEventData = events.find(e => e.id === selectedEvent);

  if (selectedEvent && selectedEventData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Event Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{selectedEventData.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {selectedEventData.location}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Up to {selectedEventData.capacity} guests
                  </span>
                  <span className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    {selectedEventData.rating} ({selectedEventData.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Event Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <img
                  src={selectedEventData.image}
                  alt={selectedEventData.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Venue</h2>
                  <p className="text-gray-600 mb-4">{selectedEventData.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Features</h3>
                      <ul className="space-y-1">
                        {selectedEventData.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Venue Details</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Capacity:</strong> {selectedEventData.capacity} guests</p>
                        <p><strong>Venue:</strong> {selectedEventData.venue}</p>
                        <p><strong>Category:</strong> {selectedEventData.category}</p>
                        <p><strong>Available:</strong> {selectedEventData.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Packages */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Packages</h2>
                <div className="space-y-4">
                  {selectedEventData.packages.map((pkg) => (
                    <div key={pkg.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                          <p className="text-sm text-gray-600">{pkg.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">${pkg.price.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Up to {pkg.maxGuests} guests</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">What's Included:</h4>
                          <ul className="space-y-1">
                            {pkg.inclusions.map((inclusion, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
                                {inclusion}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-end">
                          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            Book This Package
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Booking</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedEventData.capacity}
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="wedding">Wedding</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="birthday">Birthday Party</option>
                      <option value="graduation">Graduation</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Price Range</span>
                      <span>${selectedEventData.price.min.toLocaleString()} - ${selectedEventData.price.max.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <span>Capacity</span>
                      <span>Up to {selectedEventData.capacity} guests</span>
                    </div>
                  </div>

                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                    Request Quote
                  </button>

                  <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                    Schedule Tour
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-xs text-gray-500 text-center">
                    Free cancellation up to 30 days before event
                  </p>
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
            <h1 className="text-2xl font-bold text-gray-900">Event Venues</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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

          {/* Category Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getCategoryIcon(category.id)}
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event.id)}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="relative">
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(event.id);
                  }}
                  className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
                >
                  <Heart className={`h-4 w-4 ${favorites.has(event.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </button>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 px-2 py-1 rounded">
                  {getCategoryIcon(event.category)}
                  <span className="text-xs font-medium capitalize">{event.category}</span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{event.name}</h3>
                    <p className="text-sm text-gray-600">{event.venue}</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600 ml-1">{event.rating}</span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="truncate">{event.location}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      ${event.price.min.toLocaleString()}+
                    </p>
                    <p className="text-xs text-gray-500">Starting price</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Up to {event.capacity}</p>
                    <p className="text-xs text-gray-500">guests</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or guest count</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EventsPage;