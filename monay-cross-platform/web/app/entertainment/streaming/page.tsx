'use client';

import { useState } from 'react';
import { Play, Search, Star, Clock, Calendar, Download, Heart, Plus, Filter, Tv, Film, Music, Headphones } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface StreamingService {
  id: string;
  name: string;
  logo: string;
  monthlyPrice: number;
  yearlyPrice: number;
  trialDays: number;
  features: string[];
  categories: string[];
  rating: number;
  subscribers: string;
  color: string;
  active: boolean;
}

interface Content {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'documentary' | 'music' | 'podcast';
  genre: string[];
  rating: number;
  year: number;
  duration?: string;
  seasons?: number;
  description: string;
  cast: string[];
  director?: string;
  service: string;
  thumbnail: string;
  trailer: boolean;
  watchLater: boolean;
  watched: boolean;
  progress?: number;
}

interface Subscription {
  id: string;
  serviceName: string;
  plan: string;
  monthlyPrice: number;
  nextBilling: string;
  status: 'active' | 'cancelled' | 'paused';
  autoRenew: boolean;
  devicesUsed: number;
  maxDevices: number;
}

export default function StreamingPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'subscriptions' | 'watchlist'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  const streamingServices: StreamingService[] = [
    {
      id: '1',
      name: 'Netflix',
      logo: '/api/placeholder/60/60',
      monthlyPrice: 15.49,
      yearlyPrice: 155.88,
      trialDays: 0,
      features: ['4K Ultra HD', 'Download', '4 screens', 'No ads'],
      categories: ['Movies', 'TV Shows', 'Documentaries', 'Originals'],
      rating: 4.3,
      subscribers: '260M',
      color: 'bg-red-600',
      active: true
    },
    {
      id: '2',
      name: 'Disney+',
      logo: '/api/placeholder/60/60',
      monthlyPrice: 10.99,
      yearlyPrice: 109.99,
      trialDays: 7,
      features: ['4K Ultra HD', 'Download', '4 screens', 'Family-friendly'],
      categories: ['Movies', 'TV Shows', 'Originals', 'Kids'],
      rating: 4.5,
      subscribers: '150M',
      color: 'bg-blue-600',
      active: false
    },
    {
      id: '3',
      name: 'HBO Max',
      logo: '/api/placeholder/60/60',
      monthlyPrice: 14.99,
      yearlyPrice: 149.99,
      trialDays: 7,
      features: ['4K Ultra HD', 'Download', '3 screens', 'Same-day releases'],
      categories: ['Movies', 'TV Shows', 'Originals', 'Sports'],
      rating: 4.2,
      subscribers: '95M',
      color: 'bg-purple-600',
      active: true
    },
    {
      id: '4',
      name: 'Spotify Premium',
      logo: '/api/placeholder/60/60',
      monthlyPrice: 10.99,
      yearlyPrice: 109.99,
      trialDays: 30,
      features: ['No ads', 'Download', 'High quality', 'Unlimited skips'],
      categories: ['Music', 'Podcasts', 'Audiobooks'],
      rating: 4.4,
      subscribers: '500M',
      color: 'bg-green-600',
      active: true
    }
  ];

  const content: Content[] = [
    {
      id: '1',
      title: 'Stranger Things',
      type: 'series',
      genre: ['Sci-Fi', 'Horror', 'Drama'],
      rating: 4.7,
      year: 2016,
      seasons: 4,
      description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments and supernatural forces.',
      cast: ['Millie Bobby Brown', 'Finn Wolfhard', 'David Harbour'],
      service: 'Netflix',
      thumbnail: '/api/placeholder/300/400',
      trailer: true,
      watchLater: false,
      watched: false
    },
    {
      id: '2',
      title: 'The Mandalorian',
      type: 'series',
      genre: ['Sci-Fi', 'Adventure', 'Action'],
      rating: 4.6,
      year: 2019,
      seasons: 3,
      description: 'A lone gunfighter makes his way through the outer reaches of the galaxy.',
      cast: ['Pedro Pascal', 'Gina Carano', 'Carl Weathers'],
      service: 'Disney+',
      thumbnail: '/api/placeholder/300/400',
      trailer: true,
      watchLater: true,
      watched: false
    },
    {
      id: '3',
      title: 'Dune',
      type: 'movie',
      genre: ['Sci-Fi', 'Adventure', 'Drama'],
      rating: 4.3,
      year: 2021,
      duration: '2h 35m',
      description: 'A noble family becomes embroiled in a war for control over the most valuable asset in the galaxy.',
      cast: ['Timothée Chalamet', 'Rebecca Ferguson', 'Oscar Isaac'],
      director: 'Denis Villeneuve',
      service: 'HBO Max',
      thumbnail: '/api/placeholder/300/400',
      trailer: true,
      watchLater: false,
      watched: true,
      progress: 85
    },
    {
      id: '4',
      title: 'My Life in Music',
      type: 'podcast',
      genre: ['Music', 'Interview', 'Biography'],
      rating: 4.5,
      year: 2024,
      duration: '45m episodes',
      description: 'Musicians share their personal stories and the songs that shaped their lives.',
      cast: ['Various Artists'],
      service: 'Spotify Premium',
      thumbnail: '/api/placeholder/300/400',
      trailer: false,
      watchLater: true,
      watched: false
    }
  ];

  const subscriptions: Subscription[] = [
    {
      id: '1',
      serviceName: 'Netflix',
      plan: 'Premium',
      monthlyPrice: 15.49,
      nextBilling: '2024-10-15',
      status: 'active',
      autoRenew: true,
      devicesUsed: 3,
      maxDevices: 4
    },
    {
      id: '2',
      serviceName: 'HBO Max',
      plan: 'Ad-Free',
      monthlyPrice: 14.99,
      nextBilling: '2024-10-20',
      status: 'active',
      autoRenew: true,
      devicesUsed: 2,
      maxDevices: 3
    },
    {
      id: '3',
      serviceName: 'Spotify Premium',
      plan: 'Individual',
      monthlyPrice: 10.99,
      nextBilling: '2024-10-12',
      status: 'active',
      autoRenew: true,
      devicesUsed: 1,
      maxDevices: 1
    }
  ];

  const genres = [
    'all', 'Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Sci-Fi',
    'Romance', 'Thriller', 'Documentary', 'Music', 'Kids'
  ];

  const types = [
    { id: 'all', name: 'All Content', icon: Tv },
    { id: 'movie', name: 'Movies', icon: Film },
    { id: 'series', name: 'TV Shows', icon: Tv },
    { id: 'music', name: 'Music', icon: Music },
    { id: 'podcast', name: 'Podcasts', icon: Headphones }
  ];

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.cast.some(actor => actor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGenre = selectedGenre === 'all' || item.genre.includes(selectedGenre);
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesService = selectedService === 'all' || item.service === selectedService;
    return matchesSearch && matchesGenre && matchesType && matchesService;
  });

  const watchList = content.filter(item => item.watchLater);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movie': return Film;
      case 'series': return Tv;
      case 'music': return Music;
      case 'podcast': return Headphones;
      default: return Play;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleWatchLater = (contentId: string) => {
    console.log('Toggle watch later for:', contentId);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Streaming Services</h1>
          <p className="text-gray-600">Manage your streaming subscriptions and discover new content</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'browse', label: 'Browse Content', icon: Search },
            { id: 'subscriptions', label: 'My Subscriptions', icon: Tv },
            { id: 'watchlist', label: 'Watch Later', icon: Heart }
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

        {/* Browse Content Tab */}
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
                      placeholder="Search movies, shows, music, or podcasts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre === 'all' ? 'All Genres' : genre}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Services</option>
                  {streamingServices.map(service => (
                    <option key={service.id} value={service.name}>{service.name}</option>
                  ))}
                </select>
              </div>

              {/* Type Filters */}
              <div className="flex flex-wrap gap-2">
                {types.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                        selectedType === type.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {type.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredContent.map(item => {
                const TypeIcon = getTypeIcon(item.type);
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                        <TypeIcon className="h-16 w-16 text-gray-400" />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => toggleWatchLater(item.id)}
                          className={`p-1 rounded-full ${
                            item.watchLater ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'
                          }`}
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                        {item.trailer && (
                          <button className="p-1 bg-white/80 rounded-full text-gray-600">
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {item.watched && (
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 h-1">
                          <div
                            className="bg-blue-400 h-full"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{item.rating}</span>
                        <span className="text-sm text-gray-500">• {item.year}</span>
                      </div>
                      <h3 className="font-semibold mb-1 line-clamp-2">{item.title}</h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-600">{item.service}</span>
                        <span className="text-xs text-gray-500 capitalize">{item.type}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.genre.slice(0, 2).map(genre => (
                          <span key={genre} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {genre}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => setSelectedContent(item)}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {/* Available Services */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Available Streaming Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {streamingServices.map(service => (
                  <div key={service.id} className={`p-4 rounded-lg border-2 ${
                    service.active ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center`}>
                        <Tv className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{service.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{service.rating} • {service.subscribers}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Monthly</span>
                        <span className="font-semibold">${service.monthlyPrice}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Yearly</span>
                        <span className="font-semibold">${service.yearlyPrice}</span>
                      </div>
                      {service.trialDays > 0 && (
                        <div className="text-sm text-green-600">
                          {service.trialDays} days free trial
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {service.features.slice(0, 3).map(feature => (
                        <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <button className={`w-full py-2 rounded-lg transition-colors ${
                      service.active
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}>
                      {service.active ? 'Subscribed' : 'Subscribe'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Subscriptions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">My Subscriptions</h3>
              <div className="space-y-4">
                {subscriptions.map(sub => (
                  <div key={sub.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{sub.serviceName}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(sub.status)}`}>
                            {sub.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{sub.plan} Plan</p>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Next billing: {sub.nextBilling}</div>
                          <div>Devices: {sub.devicesUsed}/{sub.maxDevices}</div>
                          <div>Auto-renew: {sub.autoRenew ? 'On' : 'Off'}</div>
                        </div>
                      </div>
                      <div className="ml-6 text-right">
                        <div className="text-lg font-bold text-green-600 mb-2">${sub.monthlyPrice}/mo</div>
                        <div className="space-y-2">
                          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Manage
                          </button>
                          <button className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Watch Later Tab */}
        {activeTab === 'watchlist' && (
          <div className="space-y-6">
            {watchList.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No items in watch list</h3>
                <p className="text-gray-600 mb-4">Add content to your watch list to see it here</p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Content
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {watchList.map(item => {
                  const TypeIcon = getTypeIcon(item.type);
                  return (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="relative">
                        <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                          <TypeIcon className="h-16 w-16 text-gray-400" />
                        </div>
                        <button
                          onClick={() => toggleWatchLater(item.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-blue-600 mb-2">{item.service}</p>
                        <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Watch Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Content Details Modal */}
        {selectedContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedContent.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        {selectedContent.rating}
                      </div>
                      <span>{selectedContent.year}</span>
                      {selectedContent.duration && <span>{selectedContent.duration}</span>}
                      {selectedContent.seasons && <span>{selectedContent.seasons} seasons</span>}
                      <span className="capitalize">{selectedContent.type}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedContent.genre.map(genre => (
                        <span key={genre} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedContent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-gray-700 mb-6">{selectedContent.description}</p>

                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Cast</h4>
                  <p className="text-gray-600">{selectedContent.cast.join(', ')}</p>
                  {selectedContent.director && (
                    <>
                      <h4 className="font-semibold mt-3 mb-2">Director</h4>
                      <p className="text-gray-600">{selectedContent.director}</p>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Play className="h-4 w-4 inline mr-2" />
                    Watch on {selectedContent.service}
                  </button>
                  <button
                    onClick={() => toggleWatchLater(selectedContent.id)}
                    className={`px-6 py-3 rounded-lg transition-colors ${
                      selectedContent.watchLater
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                  {selectedContent.trailer && (
                    <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Play className="h-4 w-4 inline mr-2" />
                      Trailer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}