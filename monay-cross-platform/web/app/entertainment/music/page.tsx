'use client';

import { useState } from 'react';
import { Music, Search, Play, Pause, SkipForward, SkipBack, Volume2, Heart, Download, Shuffle, Repeat, Radio, Headphones, List } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  coverArt: string;
  genre: string;
  year: number;
  price: number;
  isLiked: boolean;
  isDownloaded: boolean;
  playCount: number;
  isExplicit: boolean;
}

interface Album {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  year: number;
  genre: string;
  trackCount: number;
  duration: string;
  price: number;
  songs: Song[];
  isLiked: boolean;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  creator: string;
  coverArt: string;
  songCount: number;
  duration: string;
  isPublic: boolean;
  followers?: number;
  songs: Song[];
}

interface MusicService {
  id: string;
  name: string;
  logo: string;
  monthlyPrice: number;
  features: string[];
  trialDays: number;
  active: boolean;
  color: string;
}

export default function MusicPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'library' | 'playlists' | 'services'>('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [volume, setVolume] = useState(75);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  const genres = [
    'all', 'Pop', 'Rock', 'Hip Hop', 'R&B', 'Country', 'Electronic',
    'Jazz', 'Classical', 'Alternative', 'Indie', 'Folk', 'Reggae'
  ];

  const musicServices: MusicService[] = [
    {
      id: '1',
      name: 'Spotify Premium',
      logo: '/api/placeholder/60/60',
      monthlyPrice: 10.99,
      features: ['Ad-free music', 'Download songs', 'High quality audio', 'Unlimited skips'],
      trialDays: 30,
      active: true,
      color: 'bg-green-600'
    },
    {
      id: '2',
      name: 'Apple Music',
      logo: '/api/placeholder/60/60',
      monthlyPrice: 10.99,
      features: ['100M+ songs', 'Spatial Audio', 'Lossless quality', 'Live radio'],
      trialDays: 7,
      active: false,
      color: 'bg-black'
    },
    {
      id: '3',
      name: 'YouTube Music',
      logo: '/api/placeholder/60/60',
      monthlyPrice: 10.99,
      features: ['Ad-free videos', 'Background play', 'Music & videos', 'YouTube Premium'],
      trialDays: 30,
      active: false,
      color: 'bg-red-600'
    },
    {
      id: '4',
      name: 'Amazon Music',
      logo: '/api/placeholder/60/60',
      monthlyPrice: 9.99,
      features: ['HD & Ultra HD', 'Alexa integration', 'Offline listening', 'Prime benefits'],
      trialDays: 30,
      active: false,
      color: 'bg-orange-600'
    }
  ];

  const songs: Song[] = [
    {
      id: '1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      duration: '3:20',
      coverArt: '/api/placeholder/300/300',
      genre: 'Pop',
      year: 2019,
      price: 1.29,
      isLiked: true,
      isDownloaded: true,
      playCount: 45,
      isExplicit: false
    },
    {
      id: '2',
      title: 'Good 4 U',
      artist: 'Olivia Rodrigo',
      album: 'SOUR',
      duration: '2:58',
      coverArt: '/api/placeholder/300/300',
      genre: 'Pop',
      year: 2021,
      price: 1.29,
      isLiked: false,
      isDownloaded: false,
      playCount: 12,
      isExplicit: false
    },
    {
      id: '3',
      title: 'Industry Baby',
      artist: 'Lil Nas X ft. Jack Harlow',
      album: 'MONTERO',
      duration: '3:32',
      coverArt: '/api/placeholder/300/300',
      genre: 'Hip Hop',
      year: 2021,
      price: 1.29,
      isLiked: true,
      isDownloaded: false,
      playCount: 28,
      isExplicit: true
    },
    {
      id: '4',
      title: 'Stay',
      artist: 'The Kid LAROI & Justin Bieber',
      album: 'F*CK LOVE 3',
      duration: '2:21',
      coverArt: '/api/placeholder/300/300',
      genre: 'Pop',
      year: 2021,
      price: 1.29,
      isLiked: false,
      isDownloaded: true,
      playCount: 67,
      isExplicit: true
    }
  ];

  const albums: Album[] = [
    {
      id: '1',
      title: 'After Hours',
      artist: 'The Weeknd',
      coverArt: '/api/placeholder/300/300',
      year: 2020,
      genre: 'Pop',
      trackCount: 14,
      duration: '56:16',
      price: 12.99,
      songs: [songs[0]],
      isLiked: true
    },
    {
      id: '2',
      title: 'SOUR',
      artist: 'Olivia Rodrigo',
      coverArt: '/api/placeholder/300/300',
      year: 2021,
      genre: 'Pop',
      trackCount: 11,
      duration: '34:46',
      price: 10.99,
      songs: [songs[1]],
      isLiked: false
    }
  ];

  const playlists: Playlist[] = [
    {
      id: '1',
      name: 'My Favorites',
      description: 'Songs I love to listen to',
      creator: 'You',
      coverArt: '/api/placeholder/300/300',
      songCount: 25,
      duration: '1h 23m',
      isPublic: false,
      songs: [songs[0], songs[2]]
    },
    {
      id: '2',
      name: 'Workout Mix',
      description: 'High-energy tracks for exercise',
      creator: 'You',
      coverArt: '/api/placeholder/300/300',
      songCount: 42,
      duration: '2h 18m',
      isPublic: true,
      followers: 156,
      songs: [songs[2], songs[3]]
    },
    {
      id: '3',
      name: 'Today\'s Top Hits',
      description: 'The most played songs today',
      creator: 'Spotify',
      coverArt: '/api/placeholder/300/300',
      songCount: 50,
      duration: '2h 45m',
      isPublic: true,
      followers: 28500000,
      songs: songs
    }
  ];

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         song.album.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || song.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const likedSongs = songs.filter(song => song.isLiked);
  const downloadedSongs = songs.filter(song => song.isDownloaded);

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleLike = (songId: string) => {
    console.log('Toggle like for song:', songId);
  };

  const downloadSong = (songId: string) => {
    console.log('Download song:', songId);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Music Hub</h1>
          <p className="text-gray-600">Stream, purchase, and manage your music collection</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'browse', label: 'Browse Music', icon: Search },
            { id: 'library', label: 'My Library', icon: Music },
            { id: 'playlists', label: 'Playlists', icon: List },
            { id: 'services', label: 'Music Services', icon: Headphones }
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

        {/* Browse Music Tab */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search songs, artists, or albums..."
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
              </div>
            </div>

            {/* Featured Albums */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Featured Albums</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {albums.map(album => (
                  <div key={album.id} className="group cursor-pointer">
                    <div className="relative mb-3">
                      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                        <Music className="h-12 w-12 text-gray-400" />
                      </div>
                      <button
                        onClick={() => playSong(album.songs[0])}
                        className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Play className="h-5 w-5 text-white ml-0.5" />
                      </button>
                    </div>
                    <h4 className="font-medium truncate">{album.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{album.artist}</p>
                    <p className="text-sm text-gray-500">{album.year}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Songs List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Popular Songs</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredSongs.map((song, index) => (
                  <div key={song.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => playSong(song)}
                          className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors group"
                        >
                          {currentSong?.id === song.id && isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4 ml-0.5" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">{song.title}</h4>
                            {song.isExplicit && (
                              <span className="text-xs bg-gray-600 text-white px-1 rounded">E</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                        </div>
                      </div>
                      <div className="hidden md:block text-sm text-gray-600 w-48 truncate">
                        {song.album}
                      </div>
                      <div className="text-sm text-gray-600 w-16">
                        {song.duration}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleLike(song.id)}
                          className={`p-2 rounded-full transition-colors ${
                            song.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${song.isLiked ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => downloadSong(song.id)}
                          className={`p-2 rounded-full transition-colors ${
                            song.isDownloaded ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <div className="text-right w-16">
                          <div className="text-lg font-bold text-green-600">${song.price}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Library Tab */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Music className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold">{songs.length}</div>
                <div className="text-gray-600">Total Songs</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Heart className="h-12 w-12 text-red-600 mx-auto mb-3" />
                <div className="text-2xl font-bold">{likedSongs.length}</div>
                <div className="text-gray-600">Liked Songs</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Download className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold">{downloadedSongs.length}</div>
                <div className="text-gray-600">Downloaded</div>
              </div>
            </div>

            {/* Recently Played */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Recently Played</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {songs.slice(0, 6).map(song => (
                  <div key={song.id} className="group cursor-pointer">
                    <div className="relative mb-3">
                      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                        <Music className="h-8 w-8 text-gray-400" />
                      </div>
                      <button
                        onClick={() => playSong(song)}
                        className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="h-4 w-4 text-white ml-0.5" />
                      </button>
                    </div>
                    <h4 className="text-sm font-medium truncate">{song.title}</h4>
                    <p className="text-xs text-gray-600 truncate">{song.artist}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Liked Songs */}
            {likedSongs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Liked Songs</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {likedSongs.map(song => (
                    <div key={song.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => playSong(song)}
                          className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-green-500 hover:text-white transition-colors"
                        >
                          <Play className="h-4 w-4 ml-0.5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{song.title}</h4>
                          <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                        </div>
                        <div className="text-sm text-gray-600">{song.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">My Playlists</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Playlist
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {playlists.map(playlist => (
                  <div key={playlist.id} className="group cursor-pointer">
                    <div className="relative mb-4">
                      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                        <List className="h-16 w-16 text-gray-400" />
                      </div>
                      <button className="absolute bottom-3 right-3 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <Play className="h-6 w-6 text-white ml-0.5" />
                      </button>
                    </div>
                    <h4 className="font-semibold mb-1">{playlist.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{playlist.description}</p>
                    <div className="text-sm text-gray-500">
                      {playlist.songCount} songs • {playlist.duration}
                    </div>
                    <div className="text-sm text-gray-500">
                      by {playlist.creator}
                      {playlist.followers && (
                        <span> • {playlist.followers.toLocaleString()} followers</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Music Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {musicServices.map(service => (
                <div key={service.id} className={`p-6 rounded-lg border-2 ${
                  service.active ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 ${service.color} rounded-lg flex items-center justify-center`}>
                      <Music className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{service.name}</h3>
                      {service.active && (
                        <span className="text-sm text-green-600 font-medium">Active Subscription</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-2xl font-bold mb-2">${service.monthlyPrice}/month</div>
                    {service.trialDays > 0 && (
                      <div className="text-sm text-green-600">
                        {service.trialDays} days free trial
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Features:</h4>
                    <div className="space-y-1">
                      {service.features.map(feature => (
                        <div key={feature} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    service.active
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    {service.active ? 'Manage Subscription' : 'Start Free Trial'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Now Playing Bar */}
        {currentSong && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center gap-4">
              {/* Song Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <Music className="h-6 w-6 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-medium truncate">{currentSong.title}</h4>
                  <p className="text-sm text-gray-600 truncate">{currentSong.artist}</p>
                </div>
                <button
                  onClick={() => toggleLike(currentSong.id)}
                  className={`p-2 rounded-full transition-colors ${
                    currentSong.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${currentSong.isLiked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsShuffled(!isShuffled)}
                  className={`p-2 rounded-full transition-colors ${
                    isShuffled ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Shuffle className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <SkipBack className="h-5 w-5" />
                </button>
                <button
                  onClick={togglePlayPause}
                  className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-white" />
                  ) : (
                    <Play className="h-5 w-5 text-white ml-0.5" />
                  )}
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <SkipForward className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setRepeatMode(
                    repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off'
                  )}
                  className={`p-2 rounded-full transition-colors ${
                    repeatMode !== 'off' ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Repeat className="h-4 w-4" />
                  {repeatMode === 'one' && (
                    <span className="absolute text-xs font-bold">1</span>
                  )}
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2 w-32">
                <Volume2 className="h-4 w-4 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}