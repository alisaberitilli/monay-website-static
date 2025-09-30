'use client';

import { useState } from 'react';
import { Calendar, MapPin, Search, Clock, Star, Users, Filter, Ticket, Music, Camera, Trophy } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Event {
  id: string;
  title: string;
  category: 'concert' | 'sports' | 'theater' | 'comedy' | 'festival' | 'conference';
  artist?: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  ticketTypes: TicketType[];
  tags: string[];
  ageRestriction?: string;
  duration?: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  available: number;
  section?: string;
  benefits: string[];
  color: string;
}

interface Ticket {
  id: string;
  eventTitle: string;
  venue: string;
  date: string;
  time: string;
  section: string;
  seat: string;
  ticketType: string;
  price: number;
  qrCode: string;
  status: 'active' | 'used' | 'cancelled' | 'transferred';
  transferable: boolean;
  resellable: boolean;
}

export default function TicketsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [activeTab, setActiveTab] = useState<'browse' | 'mytickets'>('browse');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);

  const categories = [
    { id: 'all', name: 'All Events', icon: Calendar },
    { id: 'concert', name: 'Concerts', icon: Music },
    { id: 'sports', name: 'Sports', icon: Trophy },
    { id: 'theater', name: 'Theater', icon: Camera },
    { id: 'comedy', name: 'Comedy', icon: Users },
    { id: 'festival', name: 'Festivals', icon: Star },
    { id: 'conference', name: 'Conferences', icon: Users }
  ];

  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'new-york', name: 'New York, NY' },
    { id: 'los-angeles', name: 'Los Angeles, CA' },
    { id: 'chicago', name: 'Chicago, IL' },
    { id: 'miami', name: 'Miami, FL' },
    { id: 'nashville', name: 'Nashville, TN' }
  ];

  const dateRanges = [
    { id: 'all', name: 'All Dates' },
    { id: 'today', name: 'Today' },
    { id: 'this-week', name: 'This Week' },
    { id: 'this-month', name: 'This Month' },
    { id: 'next-month', name: 'Next Month' }
  ];

  const events: Event[] = [
    {
      id: '1',
      title: 'Taylor Swift - Eras Tour',
      category: 'concert',
      artist: 'Taylor Swift',
      venue: 'Madison Square Garden',
      location: 'New York, NY',
      date: '2024-10-15',
      time: '8:00 PM',
      image: '/api/placeholder/400/300',
      description: 'Experience the musical journey through all of Taylor Swift\'s eras in this spectacular concert.',
      rating: 4.9,
      reviews: 2547,
      ageRestriction: 'All ages',
      duration: '3 hours',
      tags: ['Pop', 'Country', 'Acoustic'],
      ticketTypes: [
        {
          id: '1',
          name: 'General Admission',
          price: 85,
          originalPrice: 95,
          available: 245,
          benefits: ['Standing room', 'Merch discount'],
          color: 'bg-blue-500'
        },
        {
          id: '2',
          name: 'Reserved Seating',
          price: 125,
          available: 89,
          section: 'Lower Bowl',
          benefits: ['Assigned seat', 'Early entry'],
          color: 'bg-green-500'
        },
        {
          id: '3',
          name: 'VIP Package',
          price: 450,
          available: 12,
          section: 'VIP Section',
          benefits: ['Meet & greet', 'Premium seating', 'Exclusive merch', 'Complimentary drinks'],
          color: 'bg-purple-500'
        }
      ]
    },
    {
      id: '2',
      title: 'Lakers vs Warriors',
      category: 'sports',
      venue: 'Crypto.com Arena',
      location: 'Los Angeles, CA',
      date: '2024-10-20',
      time: '7:30 PM',
      image: '/api/placeholder/400/300',
      description: 'Classic NBA rivalry game between the Los Angeles Lakers and Golden State Warriors.',
      rating: 4.7,
      reviews: 1834,
      duration: '2.5 hours',
      tags: ['NBA', 'Basketball', 'Rivalry'],
      ticketTypes: [
        {
          id: '1',
          name: 'Upper Level',
          price: 95,
          available: 156,
          section: '300 Level',
          benefits: ['Great view', 'Concession discount'],
          color: 'bg-blue-500'
        },
        {
          id: '2',
          name: 'Lower Level',
          price: 245,
          available: 67,
          section: '100 Level',
          benefits: ['Close to action', 'Premium entrance'],
          color: 'bg-green-500'
        },
        {
          id: '3',
          name: 'Courtside',
          price: 1250,
          available: 4,
          section: 'Courtside',
          benefits: ['Courtside seats', 'Player tunnel access', 'Premium dining'],
          color: 'bg-purple-500'
        }
      ]
    },
    {
      id: '3',
      title: 'Hamilton',
      category: 'theater',
      venue: 'Richard Rodgers Theatre',
      location: 'New York, NY',
      date: '2024-10-25',
      time: '2:00 PM',
      image: '/api/placeholder/400/300',
      description: 'The revolutionary musical about Alexander Hamilton that\'s taking Broadway by storm.',
      rating: 4.8,
      reviews: 3421,
      duration: '2 hours 45 minutes',
      tags: ['Musical', 'Historical', 'Broadway'],
      ticketTypes: [
        {
          id: '1',
          name: 'Mezzanine',
          price: 145,
          available: 34,
          section: 'Mezzanine',
          benefits: ['Good view', 'Intermission lounge access'],
          color: 'bg-blue-500'
        },
        {
          id: '2',
          name: 'Orchestra',
          price: 285,
          available: 18,
          section: 'Orchestra',
          benefits: ['Best view', 'Premium location'],
          color: 'bg-green-500'
        },
        {
          id: '3',
          name: 'Premium Orchestra',
          price: 395,
          available: 8,
          section: 'Front Orchestra',
          benefits: ['Front row', 'Cast meet & greet', 'Playbill signing'],
          color: 'bg-purple-500'
        }
      ]
    }
  ];

  const myTickets: Ticket[] = [
    {
      id: '1',
      eventTitle: 'Taylor Swift - Eras Tour',
      venue: 'Madison Square Garden',
      date: '2024-10-15',
      time: '8:00 PM',
      section: 'Lower Bowl',
      seat: 'Section 105, Row F, Seat 12',
      ticketType: 'Reserved Seating',
      price: 125,
      qrCode: 'QR123456789',
      status: 'active',
      transferable: true,
      resellable: true
    },
    {
      id: '2',
      eventTitle: 'Jazz Festival 2024',
      venue: 'Central Park',
      date: '2024-09-20',
      time: '6:00 PM',
      section: 'General Admission',
      seat: 'GA Standing',
      ticketType: 'General Admission',
      price: 75,
      qrCode: 'QR987654321',
      status: 'used',
      transferable: false,
      resellable: false
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || event.location.toLowerCase().includes(selectedLocation.toLowerCase());
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    return categoryData ? categoryData.icon : Calendar;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'transferred': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const purchaseTickets = () => {
    if (selectedEvent && selectedTicketType) {
      console.log('Purchasing tickets:', {
        event: selectedEvent.title,
        ticketType: selectedTicketType.name,
        quantity: quantity,
        total: selectedTicketType.price * quantity
      });
      setSelectedEvent(null);
      setSelectedTicketType(null);
      setQuantity(1);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Tickets</h1>
          <p className="text-gray-600">Discover and purchase tickets for concerts, sports, theater, and more</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'browse', label: 'Browse Events', icon: Search },
            { id: 'mytickets', label: 'My Tickets', icon: Ticket }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Browse Events Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search events, artists, or venues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dateRanges.map(range => (
                    <option key={range.id} value={range.id}>{range.name}</option>
                  ))}
                </select>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => {
                const CategoryIcon = getCategoryIcon(event.category);
                return (
                  <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <Camera className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-600 font-medium capitalize">{event.category}</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                      {event.artist && (
                        <p className="text-gray-600 mb-2">by {event.artist}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {event.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {event.time}
                        </div>
                      </div>
                      <div className="flex items-center mb-3">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{event.venue}, {event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm font-medium">{event.rating}</span>
                        </div>
                        <span className="text-sm text-gray-600">({event.reviews} reviews)</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {event.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-lg font-bold text-green-600">
                            From ${Math.min(...event.ticketTypes.map(t => t.price))}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          View Tickets
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'mytickets' && (
          <div className="space-y-6">
            {myTickets.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets yet</h3>
                <p className="text-gray-600 mb-4">Purchase tickets to see them here</p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map(ticket => (
                  <div key={ticket.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{ticket.eventTitle}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {ticket.venue}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {ticket.date} at {ticket.time}
                          </div>
                          <div>
                            <strong>Seat:</strong> {ticket.seat}
                          </div>
                          <div>
                            <strong>Type:</strong> {ticket.ticketType}
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <div className="text-lg font-bold text-green-600 mb-2">${ticket.price}</div>
                        <div className="space-y-2">
                          {ticket.status === 'active' && (
                            <>
                              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                View QR Code
                              </button>
                              {ticket.transferable && (
                                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                  Transfer
                                </button>
                              )}
                              {ticket.resellable && (
                                <button className="w-full px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors">
                                  Resell
                                </button>
                              )}
                            </>
                          )}
                          {ticket.status === 'used' && (
                            <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                              View Receipt
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedEvent.title}</h2>
                    {selectedEvent.artist && (
                      <p className="text-lg text-gray-600 mb-2">by {selectedEvent.artist}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {selectedEvent.date} at {selectedEvent.time}
                      </div>
                      {selectedEvent.duration && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {selectedEvent.duration}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">{selectedEvent.venue}, {selectedEvent.location}</span>
                  </div>
                  <p className="text-gray-700 mb-4">{selectedEvent.description}</p>
                  {selectedEvent.ageRestriction && (
                    <p className="text-sm text-gray-600">Age restriction: {selectedEvent.ageRestriction}</p>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Select Tickets</h3>
                  <div className="space-y-3">
                    {selectedEvent.ticketTypes.map(ticketType => (
                      <div
                        key={ticketType.id}
                        onClick={() => setSelectedTicketType(ticketType)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedTicketType?.id === ticketType.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-3 h-3 rounded-full ${ticketType.color}`}></div>
                              <h4 className="font-semibold">{ticketType.name}</h4>
                              {ticketType.section && (
                                <span className="text-sm text-gray-600">• {ticketType.section}</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {ticketType.benefits.map(benefit => (
                                <span key={benefit} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {benefit}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-gray-600">{ticketType.available} tickets available</p>
                          </div>
                          <div className="text-right">
                            {ticketType.originalPrice && (
                              <div className="text-sm text-gray-500 line-through">${ticketType.originalPrice}</div>
                            )}
                            <div className="text-xl font-bold text-green-600">${ticketType.price}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTicketType && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">Quantity</h4>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="text-lg font-medium">{quantity}</span>
                      <button
                        onClick={() => setQuantity(Math.min(selectedTicketType.available, quantity + 1))}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={purchaseTickets}
                    disabled={!selectedTicketType}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {selectedTicketType ?
                      `Purchase ${quantity} ticket${quantity > 1 ? 's' : ''} • $${selectedTicketType.price * quantity}` :
                      'Select a ticket type'
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}