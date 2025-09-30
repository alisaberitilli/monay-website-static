'use client';

import { useState } from 'react';
import { Trophy, Calendar, Clock, MapPin, Star, Users, Play, Ticket, Target, Activity } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface SportsEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  sport: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'completed';
  homeScore?: number;
  awayScore?: number;
  ticketsAvailable: boolean;
  ticketPrices: TicketPrice[];
  description: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
}

interface TicketPrice {
  section: string;
  price: number;
  available: number;
}

interface Team {
  id: string;
  name: string;
  league: string;
  sport: string;
  city: string;
  logo: string;
  wins: number;
  losses: number;
  rank: number;
  following: boolean;
  nextGame: string;
  record: string;
}

interface SportsContent {
  id: string;
  title: string;
  type: 'highlights' | 'documentary' | 'analysis' | 'live';
  sport: string;
  duration: string;
  thumbnail: string;
  description: string;
  views: number;
  uploadDate: string;
  channel: string;
  premium: boolean;
}

interface Subscription {
  id: string;
  serviceName: string;
  description: string;
  monthlyPrice: number;
  features: string[];
  sportsIncluded: string[];
  active: boolean;
  trialDays: number;
  color: string;
}

export default function SportsPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'teams' | 'content' | 'subscriptions'>('events');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<SportsEvent | null>(null);

  const sports = [
    'all', 'Football', 'Basketball', 'Baseball', 'Hockey', 'Soccer',
    'Tennis', 'Golf', 'Boxing', 'MMA', 'Racing', 'Olympics'
  ];

  const leagues = [
    'all', 'NFL', 'NBA', 'MLB', 'NHL', 'MLS', 'Premier League',
    'Champions League', 'PGA Tour', 'UFC', 'NASCAR', 'Formula 1'
  ];

  const sportsEvents: SportsEvent[] = [
    {
      id: '1',
      homeTeam: 'Los Angeles Lakers',
      awayTeam: 'Golden State Warriors',
      league: 'NBA',
      sport: 'Basketball',
      venue: 'Crypto.com Arena',
      location: 'Los Angeles, CA',
      date: '2024-10-15',
      time: '7:30 PM',
      status: 'upcoming',
      ticketsAvailable: true,
      ticketPrices: [
        { section: 'Upper Level', price: 95, available: 156 },
        { section: 'Lower Level', price: 245, available: 67 },
        { section: 'Courtside', price: 1250, available: 4 }
      ],
      description: 'Classic rivalry matchup between two of the Western Conference\'s top teams.',
      homeTeamLogo: '/api/placeholder/80/80',
      awayTeamLogo: '/api/placeholder/80/80'
    },
    {
      id: '2',
      homeTeam: 'Dallas Cowboys',
      awayTeam: 'Green Bay Packers',
      league: 'NFL',
      sport: 'Football',
      venue: 'AT&T Stadium',
      location: 'Arlington, TX',
      date: '2024-10-13',
      time: '1:00 PM',
      status: 'live',
      homeScore: 14,
      awayScore: 10,
      ticketsAvailable: false,
      ticketPrices: [],
      description: 'NFC showdown between two historic franchises.',
      homeTeamLogo: '/api/placeholder/80/80',
      awayTeamLogo: '/api/placeholder/80/80'
    },
    {
      id: '3',
      homeTeam: 'New York Yankees',
      awayTeam: 'Boston Red Sox',
      league: 'MLB',
      sport: 'Baseball',
      venue: 'Yankee Stadium',
      location: 'New York, NY',
      date: '2024-09-28',
      time: '7:05 PM',
      status: 'completed',
      homeScore: 8,
      awayScore: 3,
      ticketsAvailable: false,
      ticketPrices: [],
      description: 'The Yankees defeated the Red Sox in a crucial late-season matchup.',
      homeTeamLogo: '/api/placeholder/80/80',
      awayTeamLogo: '/api/placeholder/80/80'
    }
  ];

  const teams: Team[] = [
    {
      id: '1',
      name: 'Los Angeles Lakers',
      league: 'NBA',
      sport: 'Basketball',
      city: 'Los Angeles',
      logo: '/api/placeholder/60/60',
      wins: 42,
      losses: 28,
      rank: 7,
      following: true,
      nextGame: '2024-10-15 vs Warriors',
      record: '42-28'
    },
    {
      id: '2',
      name: 'Dallas Cowboys',
      league: 'NFL',
      sport: 'Football',
      city: 'Dallas',
      logo: '/api/placeholder/60/60',
      wins: 8,
      losses: 3,
      rank: 2,
      following: true,
      nextGame: '2024-10-13 vs Packers',
      record: '8-3'
    },
    {
      id: '3',
      name: 'Real Madrid',
      league: 'La Liga',
      sport: 'Soccer',
      city: 'Madrid',
      logo: '/api/placeholder/60/60',
      wins: 25,
      losses: 3,
      rank: 1,
      following: false,
      nextGame: '2024-10-14 vs Barcelona',
      record: '25-3-2'
    }
  ];

  const sportsContent: SportsContent[] = [
    {
      id: '1',
      title: 'Lakers vs Warriors - Game Highlights',
      type: 'highlights',
      sport: 'Basketball',
      duration: '8:45',
      thumbnail: '/api/placeholder/320/180',
      description: 'Best moments from last night\'s thrilling Lakers victory over the Warriors.',
      views: 1250000,
      uploadDate: '2024-09-30',
      channel: 'NBA',
      premium: false
    },
    {
      id: '2',
      title: 'Tom Brady: The GOAT Documentary',
      type: 'documentary',
      sport: 'Football',
      duration: '1:32:15',
      thumbnail: '/api/placeholder/320/180',
      description: 'An in-depth look at the career of the greatest quarterback of all time.',
      views: 3450000,
      uploadDate: '2024-09-25',
      channel: 'NFL Films',
      premium: true
    },
    {
      id: '3',
      title: 'Live: Premier League Match',
      type: 'live',
      sport: 'Soccer',
      duration: 'Live',
      thumbnail: '/api/placeholder/320/180',
      description: 'Manchester United vs Liverpool - Live from Old Trafford',
      views: 850000,
      uploadDate: '2024-09-30',
      channel: 'Premier League',
      premium: true
    }
  ];

  const subscriptions: Subscription[] = [
    {
      id: '1',
      serviceName: 'ESPN+',
      description: 'Premium sports streaming service',
      monthlyPrice: 10.99,
      features: ['Live games', 'Original shows', 'UFC fights', '30 for 30 documentaries'],
      sportsIncluded: ['UFC', 'MLB', 'NHL', 'Soccer', 'College Sports'],
      active: true,
      trialDays: 7,
      color: 'bg-red-600'
    },
    {
      id: '2',
      serviceName: 'NBA League Pass',
      description: 'Watch every NBA game live',
      monthlyPrice: 14.99,
      features: ['All games live', 'No blackouts', 'Multiple camera angles', 'Classic games'],
      sportsIncluded: ['NBA'],
      active: false,
      trialDays: 7,
      color: 'bg-blue-600'
    },
    {
      id: '3',
      serviceName: 'NFL RedZone',
      description: 'Commercial-free NFL action',
      monthlyPrice: 11.99,
      features: ['RedZone coverage', 'Multiple games', 'No commercials', 'Fantasy integration'],
      sportsIncluded: ['NFL'],
      active: true,
      trialDays: 0,
      color: 'bg-green-600'
    },
    {
      id: '4',
      serviceName: 'DAZN',
      description: 'Global sports streaming platform',
      monthlyPrice: 19.99,
      features: ['Boxing & MMA', 'Soccer', 'Tennis', 'Motorsports'],
      sportsIncluded: ['Boxing', 'MMA', 'Soccer', 'Tennis', 'Formula 1'],
      active: false,
      trialDays: 30,
      color: 'bg-yellow-600'
    }
  ];

  const filteredEvents = sportsEvents.filter(event => {
    const matchesSport = selectedSport === 'all' || event.sport === selectedSport;
    const matchesLeague = selectedLeague === 'all' || event.league === selectedLeague;
    const matchesDate = dateFilter === 'all' ||
                       (dateFilter === 'today' && event.date === '2024-09-30') ||
                       (dateFilter === 'upcoming' && event.status === 'upcoming');
    return matchesSport && matchesLeague && matchesDate;
  });

  const followingTeams = teams.filter(team => team.following);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-100 text-red-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'live': return Activity;
      case 'highlights': return Play;
      case 'documentary': return Star;
      case 'analysis': return Target;
      default: return Play;
    }
  };

  const toggleFollowTeam = (teamId: string) => {
    console.log('Toggle follow team:', teamId);
  };

  const purchaseTickets = (event: SportsEvent) => {
    console.log('Purchase tickets for:', event.homeTeam, 'vs', event.awayTeam);
    setSelectedEvent(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sports Hub</h1>
          <p className="text-gray-600">Live games, highlights, teams, and sports content</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'events', label: 'Games & Events', icon: Calendar },
            { id: 'teams', label: 'My Teams', icon: Trophy },
            { id: 'content', label: 'Sports Content', icon: Play },
            { id: 'subscriptions', label: 'Sports Packages', icon: Ticket }
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

        {/* Games & Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sports.map(sport => (
                    <option key={sport} value={sport}>
                      {sport === 'all' ? 'All Sports' : sport}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {leagues.map(league => (
                    <option key={league} value={league}>
                      {league === 'all' ? 'All Leagues' : league}
                    </option>
                  ))}
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {filteredEvents.map(event => (
                <div key={event.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {event.league}
                      </span>
                      <span className={`px-2 py-1 text-sm rounded ${getStatusColor(event.status)}`}>
                        {event.status.toUpperCase()}
                      </span>
                      {event.status === 'live' && (
                        <div className="flex items-center text-red-600">
                          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-1"></div>
                          LIVE
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.date} • {event.time}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-6 flex-1">
                      {/* Away Team */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{event.awayTeam}</h3>
                          {event.status === 'completed' || event.status === 'live' ? (
                            <div className="text-lg font-bold">{event.awayScore}</div>
                          ) : (
                            <div className="text-sm text-gray-600">Away</div>
                          )}
                        </div>
                      </div>

                      {/* VS / Score */}
                      <div className="text-center px-4">
                        {event.status === 'upcoming' ? (
                          <div className="text-gray-400 font-bold">VS</div>
                        ) : (
                          <div className="text-2xl font-bold">
                            {event.awayScore} - {event.homeScore}
                          </div>
                        )}
                      </div>

                      {/* Home Team */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{event.homeTeam}</h3>
                          {event.status === 'completed' || event.status === 'live' ? (
                            <div className="text-lg font-bold">{event.homeScore}</div>
                          ) : (
                            <div className="text-sm text-gray-600">Home</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 text-right">
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.venue}, {event.location}
                      </div>
                      {event.ticketsAvailable && event.status === 'upcoming' && (
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Buy Tickets
                        </button>
                      )}
                      {event.status === 'live' && (
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                          Watch Live
                        </button>
                      )}
                      {event.status === 'completed' && (
                        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                          Watch Highlights
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Teams Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            {/* Following Teams */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Following ({followingTeams.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followingTeams.map(team => (
                  <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{team.name}</h4>
                        <p className="text-sm text-gray-600">{team.league}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Record:</span>
                        <span className="font-medium">{team.record}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rank:</span>
                        <span className="font-medium">#{team.rank}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Next: {team.nextGame}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFollowTeam(team.id)}
                      className="w-full mt-3 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Unfollow
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* All Teams */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Discover Teams</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.filter(team => !team.following).map(team => (
                  <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{team.name}</h4>
                        <p className="text-sm text-gray-600">{team.league}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Record:</span>
                        <span className="font-medium">{team.record}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rank:</span>
                        <span className="font-medium">#{team.rank}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFollowTeam(team.id)}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sports Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sportsContent.map(content => {
                const TypeIcon = getContentTypeIcon(content.type);
                return (
                  <div key={content.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <Play className="h-16 w-16 text-gray-400" />
                      </div>
                      <div className="absolute top-2 left-2 flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded text-white ${
                          content.type === 'live' ? 'bg-red-600' :
                          content.type === 'highlights' ? 'bg-blue-600' :
                          content.type === 'documentary' ? 'bg-purple-600' :
                          'bg-gray-600'
                        }`}>
                          {content.type.toUpperCase()}
                        </span>
                        {content.premium && (
                          <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                        {content.duration}
                      </div>
                      <button className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="h-8 w-8 text-gray-800 ml-1" />
                        </div>
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <TypeIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-600">{content.sport}</span>
                      </div>
                      <h3 className="font-semibold mb-2 line-clamp-2">{content.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{content.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{content.channel}</span>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{(content.views / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sports Packages Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptions.map(subscription => (
                <div key={subscription.id} className={`p-6 rounded-lg border-2 ${
                  subscription.active ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 ${subscription.color} rounded-lg flex items-center justify-center`}>
                      <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{subscription.serviceName}</h3>
                      <p className="text-gray-600">{subscription.description}</p>
                      {subscription.active && (
                        <span className="text-sm text-green-600 font-medium">Active Subscription</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-2xl font-bold mb-2">${subscription.monthlyPrice}/month</div>
                    {subscription.trialDays > 0 && (
                      <div className="text-sm text-green-600">
                        {subscription.trialDays} days free trial
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Features:</h4>
                    <div className="space-y-1">
                      {subscription.features.map(feature => (
                        <div key={feature} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Sports Included:</h4>
                    <div className="flex flex-wrap gap-1">
                      {subscription.sportsIncluded.map(sport => (
                        <span key={sport} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {sport}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    subscription.active
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}>
                    {subscription.active ? 'Manage Subscription' : 'Start Free Trial'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Ticket Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      {selectedEvent.awayTeam} vs {selectedEvent.homeTeam}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {selectedEvent.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {selectedEvent.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedEvent.venue}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-gray-700 mb-6">{selectedEvent.description}</p>

                <h3 className="text-lg font-semibold mb-4">Select Tickets</h3>
                <div className="space-y-3 mb-6">
                  {selectedEvent.ticketPrices.map((ticket, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 cursor-pointer transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{ticket.section}</h4>
                          <p className="text-sm text-gray-600">{ticket.available} tickets available</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">${ticket.price}</div>
                          <div className="text-sm text-gray-600">per ticket</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => purchaseTickets(selectedEvent)}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Purchase Tickets
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