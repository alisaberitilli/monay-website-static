'use client';

import { useState } from 'react';
import { Gamepad2, Search, Star, Download, Trophy, Users, Clock, Zap, Gift, ShoppingCart, Play, Pause } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Game {
  id: string;
  title: string;
  developer: string;
  publisher: string;
  genre: string[];
  platform: string[];
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  releaseDate: string;
  description: string;
  features: string[];
  screenshots: string[];
  trailer: boolean;
  esrbRating: string;
  size: string;
  multiplayer: boolean;
  inLibrary: boolean;
  wishlist: boolean;
  downloadProgress?: number;
  playing?: boolean;
  hoursPlayed?: number;
}

interface GameLibrary {
  id: string;
  gameTitle: string;
  platform: string;
  purchaseDate: string;
  hoursPlayed: number;
  lastPlayed: string;
  status: 'installed' | 'not_installed' | 'downloading' | 'updating';
  downloadProgress?: number;
  achievements: number;
  totalAchievements: number;
}

interface Gaming Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  monthlyPrice: number;
  features: string[];
  gamesIncluded: number;
  active: boolean;
}

export default function GamingPage() {
  const [activeTab, setActiveTab] = useState<'store' | 'library' | 'platforms'>('store');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const genres = [
    'all', 'Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Racing',
    'Puzzle', 'Simulation', 'Horror', 'Fighting', 'Platform', 'Indie'
  ];

  const platforms = [
    'all', 'PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile', 'VR'
  ];

  const priceFilters = [
    { id: 'all', name: 'All Prices' },
    { id: 'free', name: 'Free to Play' },
    { id: 'under-20', name: 'Under $20' },
    { id: 'under-40', name: 'Under $40' },
    { id: 'under-60', name: 'Under $60' }
  ];

  const games: Game[] = [
    {
      id: '1',
      title: 'Cyberpunk 2077',
      developer: 'CD Projekt Red',
      publisher: 'CD Projekt',
      genre: ['RPG', 'Action', 'Adventure'],
      platform: ['PC', 'PlayStation', 'Xbox'],
      price: 29.99,
      originalPrice: 59.99,
      rating: 4.2,
      reviews: 18453,
      releaseDate: '2020-12-10',
      description: 'An open-world action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.',
      features: ['Single-player', 'Ray Tracing', 'DLSS Support', 'Mod Support'],
      screenshots: ['/api/placeholder/800/450'],
      trailer: true,
      esrbRating: 'M',
      size: '70 GB',
      multiplayer: false,
      inLibrary: true,
      wishlist: false,
      hoursPlayed: 45
    },
    {
      id: '2',
      title: 'Fortnite',
      developer: 'Epic Games',
      publisher: 'Epic Games',
      genre: ['Action', 'Battle Royale'],
      platform: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'],
      price: 0,
      rating: 4.5,
      reviews: 245672,
      releaseDate: '2017-07-25',
      description: 'A free-to-play battle royale game where 100 players fight to be the last one standing.',
      features: ['Multiplayer', 'Cross-platform', 'Creative Mode', 'Regular Updates'],
      screenshots: ['/api/placeholder/800/450'],
      trailer: true,
      esrbRating: 'T',
      size: '26 GB',
      multiplayer: true,
      inLibrary: true,
      wishlist: false,
      downloadProgress: 75,
      playing: true,
      hoursPlayed: 127
    },
    {
      id: '3',
      title: 'The Legend of Zelda: Tears of the Kingdom',
      developer: 'Nintendo EPD',
      publisher: 'Nintendo',
      genre: ['Adventure', 'Action', 'RPG'],
      platform: ['Nintendo Switch'],
      price: 59.99,
      rating: 4.9,
      reviews: 87234,
      releaseDate: '2023-05-12',
      description: 'Explore the vast land and skies of Hyrule in this sequel to Breath of the Wild.',
      features: ['Single-player', 'Open World', 'Physics-based Gameplay'],
      screenshots: ['/api/placeholder/800/450'],
      trailer: true,
      esrbRating: 'E10+',
      size: '18.2 GB',
      multiplayer: false,
      inLibrary: false,
      wishlist: true
    },
    {
      id: '4',
      title: 'Minecraft',
      developer: 'Mojang Studios',
      publisher: 'Microsoft',
      genre: ['Sandbox', 'Adventure', 'Survival'],
      platform: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'],
      price: 26.95,
      rating: 4.8,
      reviews: 156789,
      releaseDate: '2011-11-18',
      description: 'A sandbox game where players can build, explore, and survive in procedurally generated worlds.',
      features: ['Multiplayer', 'Cross-platform', 'Mods', 'Creative Mode'],
      screenshots: ['/api/placeholder/800/450'],
      trailer: true,
      esrbRating: 'E10+',
      size: '1 GB',
      multiplayer: true,
      inLibrary: true,
      wishlist: false,
      hoursPlayed: 234
    }
  ];

  const gameLibrary: GameLibrary[] = [
    {
      id: '1',
      gameTitle: 'Cyberpunk 2077',
      platform: 'PC',
      purchaseDate: '2023-08-15',
      hoursPlayed: 45,
      lastPlayed: '2024-09-28',
      status: 'installed',
      achievements: 12,
      totalAchievements: 45
    },
    {
      id: '2',
      gameTitle: 'Fortnite',
      platform: 'PC',
      purchaseDate: '2023-01-10',
      hoursPlayed: 127,
      lastPlayed: '2024-09-30',
      status: 'downloading',
      downloadProgress: 75,
      achievements: 8,
      totalAchievements: 25
    },
    {
      id: '3',
      gameTitle: 'Minecraft',
      platform: 'PC',
      purchaseDate: '2022-12-05',
      hoursPlayed: 234,
      lastPlayed: '2024-09-29',
      status: 'installed',
      achievements: 34,
      totalAchievements: 50
    }
  ];

  const gamingPlatforms: Gaming Platform[] = [
    {
      id: '1',
      name: 'Xbox Game Pass',
      icon: '/api/placeholder/60/60',
      color: 'bg-green-600',
      monthlyPrice: 14.99,
      features: ['400+ games', 'Day one releases', 'Cloud gaming', 'PC & Console'],
      gamesIncluded: 450,
      active: true
    },
    {
      id: '2',
      name: 'PlayStation Plus',
      icon: '/api/placeholder/60/60',
      color: 'bg-blue-600',
      monthlyPrice: 17.99,
      features: ['Monthly games', 'Online multiplayer', 'Exclusive discounts', 'Cloud saves'],
      gamesIncluded: 25,
      active: false
    },
    {
      id: '3',
      name: 'Epic Games Store',
      icon: '/api/placeholder/60/60',
      color: 'bg-gray-800',
      monthlyPrice: 0,
      features: ['Weekly free games', 'No subscription fee', 'Exclusive titles'],
      gamesIncluded: 0,
      active: true
    },
    {
      id: '4',
      name: 'Apple Arcade',
      icon: '/api/placeholder/60/60',
      color: 'bg-black',
      monthlyPrice: 6.99,
      features: ['200+ premium games', 'No ads', 'Family sharing', 'Offline play'],
      gamesIncluded: 200,
      active: false
    }
  ];

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.developer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || game.genre.includes(selectedGenre);
    const matchesPlatform = selectedPlatform === 'all' || game.platform.includes(selectedPlatform);
    const matchesPrice = priceFilter === 'all' ||
                        (priceFilter === 'free' && game.price === 0) ||
                        (priceFilter === 'under-20' && game.price < 20) ||
                        (priceFilter === 'under-40' && game.price < 40) ||
                        (priceFilter === 'under-60' && game.price < 60);
    return matchesSearch && matchesGenre && matchesPlatform && matchesPrice;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'installed': return 'bg-green-100 text-green-800';
      case 'downloading': return 'bg-blue-100 text-blue-800';
      case 'updating': return 'bg-yellow-100 text-yellow-800';
      case 'not_installed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleWishlist = (gameId: string) => {
    console.log('Toggle wishlist for game:', gameId);
  };

  const purchaseGame = (game: Game) => {
    console.log('Purchase game:', game.title, 'for $', game.price);
    setSelectedGame(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gaming Hub</h1>
          <p className="text-gray-600">Discover, purchase, and manage your gaming library</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'store', label: 'Game Store', icon: ShoppingCart },
            { id: 'library', label: 'My Library', icon: Gamepad2 },
            { id: 'platforms', label: 'Gaming Platforms', icon: Zap }
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

        {/* Game Store Tab */}
        {activeTab === 'store' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search games..."
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
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform === 'all' ? 'All Platforms' : platform}
                    </option>
                  ))}
                </select>
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priceFilters.map(filter => (
                    <option key={filter.id} value={filter.id}>{filter.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map(game => (
                <div key={game.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <Gamepad2 className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      {game.inLibrary && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                          Owned
                        </span>
                      )}
                      {game.playing && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded flex items-center">
                          <Play className="h-3 w-3 mr-1" />
                          Playing
                        </span>
                      )}
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
                        {game.esrbRating}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{game.rating}</span>
                      <span className="text-sm text-gray-500">({game.reviews.toLocaleString()})</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{game.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {game.developer}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {game.genre.slice(0, 3).map(genre => (
                        <span key={genre} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {genre}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {game.platform.slice(0, 3).map(platform => (
                        <span key={platform} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {platform}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Users className="h-4 w-4" />
                      <span>{game.multiplayer ? 'Multiplayer' : 'Single-player'}</span>
                      <span>•</span>
                      <span>{game.size}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        {game.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">${game.originalPrice}</span>
                        )}
                        <span className="text-lg font-bold text-green-600 ml-2">
                          {game.price === 0 ? 'Free' : `$${game.price}`}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedGame(game)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Library Tab */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            {gameLibrary.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Gamepad2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No games in library</h3>
                <p className="text-gray-600 mb-4">Purchase games to see them here</p>
                <button
                  onClick={() => setActiveTab('store')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Games
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {gameLibrary.map(game => (
                  <div key={game.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Gamepad2 className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{game.gameTitle}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(game.status)}`}>
                              {game.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{game.platform}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {game.hoursPlayed} hours played
                            </div>
                            <div className="flex items-center">
                              <Trophy className="h-4 w-4 mr-1" />
                              {game.achievements}/{game.totalAchievements} achievements
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Last played: {game.lastPlayed}</p>
                          {game.status === 'downloading' && game.downloadProgress && (
                            <div className="mt-2">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Downloading...</span>
                                <span>{game.downloadProgress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${game.downloadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-6 space-y-2">
                        {game.status === 'installed' && (
                          <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            <Play className="h-4 w-4 inline mr-2" />
                            Play
                          </button>
                        )}
                        {game.status === 'not_installed' && (
                          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Download className="h-4 w-4 inline mr-2" />
                            Install
                          </button>
                        )}
                        {game.status === 'downloading' && (
                          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <Pause className="h-4 w-4 inline mr-2" />
                            Pause
                          </button>
                        )}
                        <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gaming Platforms Tab */}
        {activeTab === 'platforms' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gamingPlatforms.map(platform => (
                <div key={platform.id} className={`p-6 rounded-lg border-2 ${
                  platform.active ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 ${platform.color} rounded-lg flex items-center justify-center`}>
                      <Gamepad2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{platform.name}</h3>
                      {platform.active && (
                        <span className="text-sm text-green-600 font-medium">Active Subscription</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">
                        {platform.monthlyPrice === 0 ? 'Free' : `$${platform.monthlyPrice}/month`}
                      </span>
                      {platform.gamesIncluded > 0 && (
                        <span className="text-sm text-gray-600">
                          {platform.gamesIncluded}+ games included
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Features:</h4>
                    <div className="space-y-1">
                      {platform.features.map(feature => (
                        <div key={feature} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    platform.active
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : platform.monthlyPrice === 0
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    {platform.active ? 'Manage Subscription' :
                     platform.monthlyPrice === 0 ? 'Join Free' : 'Subscribe'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Details Modal */}
        {selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedGame.title}</h2>
                    <p className="text-lg text-gray-600 mb-2">by {selectedGame.developer}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        {selectedGame.rating} ({selectedGame.reviews.toLocaleString()} reviews)
                      </div>
                      <span>Released: {selectedGame.releaseDate}</span>
                      <span className="px-2 py-1 bg-black text-white text-xs rounded">{selectedGame.esrbRating}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="lg:col-span-2">
                    <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <Gamepad2 className="h-24 w-24 text-gray-400" />
                    </div>
                    <p className="text-gray-700 mb-4">{selectedGame.description}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Platforms</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedGame.platform.map(platform => (
                          <span key={platform} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Genres</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedGame.genre.map(genre => (
                          <span key={genre} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Features</h4>
                      <div className="space-y-1">
                        {selectedGame.features.map(feature => (
                          <div key={feature} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <div>Size: {selectedGame.size}</div>
                      <div>Type: {selectedGame.multiplayer ? 'Multiplayer' : 'Single-player'}</div>
                      {selectedGame.hoursPlayed && (
                        <div>Played: {selectedGame.hoursPlayed} hours</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  {selectedGame.inLibrary ? (
                    <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <Play className="h-4 w-4 inline mr-2" />
                      Play Now
                    </button>
                  ) : (
                    <button
                      onClick={() => purchaseGame(selectedGame)}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {selectedGame.price === 0 ? 'Download Free' : `Buy for $${selectedGame.price}`}
                    </button>
                  )}
                  <button
                    onClick={() => toggleWishlist(selectedGame.id)}
                    className={`px-6 py-3 rounded-lg transition-colors ${
                      selectedGame.wishlist
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedGame.wishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </button>
                  {selectedGame.trailer && (
                    <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Play className="h-4 w-4 inline mr-2" />
                      Watch Trailer
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