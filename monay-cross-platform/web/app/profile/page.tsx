'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  User,
  Camera,
  Edit3,
  Shield,
  Award,
  Star,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Briefcase,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Upload,
  Download,
  Share2,
  LogOut,
  CreditCard,
  DollarSign,
  Activity,
  Target,
  Trophy,
  Zap,
  Gift,
  Users
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  earned: boolean;
  progress?: number;
  total?: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    username: '@johndoe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    bio: 'Digital payments enthusiast. Making finance simple and accessible.',
    location: 'San Francisco, CA',
    occupation: 'Software Engineer',
    website: 'johndoe.com',
    joinDate: 'January 2024',
    verificationStatus: 'verified',
    kycStatus: 'completed'
  });

  const stats = {
    totalTransactions: 342,
    totalSent: 45678.90,
    totalReceived: 52340.50,
    savedThisMonth: 1250.00,
    cashbackEarned: 234.56,
    referrals: 12
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Early Adopter',
      description: 'Joined in the first month',
      icon: Star,
      earned: true
    },
    {
      id: '2',
      title: 'Power User',
      description: '100+ transactions completed',
      icon: Zap,
      earned: true
    },
    {
      id: '3',
      title: 'Money Saver',
      description: 'Saved $1000 in a month',
      icon: Trophy,
      earned: true
    },
    {
      id: '4',
      title: 'Social Butterfly',
      description: 'Refer 20 friends',
      icon: Gift,
      earned: false,
      progress: 12,
      total: 20
    },
    {
      id: '5',
      title: 'Big Spender',
      description: 'Spend $10,000 total',
      icon: CreditCard,
      earned: false,
      progress: 7500,
      total: 10000
    }
  ];

  const handleLogout = () => {
    // Handle logout
    router.push('/');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle image upload
      console.log('Uploading image:', file);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-all">
                    <Camera className="h-4 w-4 text-gray-700" />
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                </div>

                {/* Profile Info */}
                <div>
                  <h1 className="text-3xl font-bold mb-1">{profileData.name}</h1>
                  <p className="text-white/80 mb-2">{profileData.username}</p>
                  <div className="flex items-center space-x-4">
                    {profileData.verificationStatus === 'verified' && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm">Verified</span>
                      </div>
                    )}
                    {profileData.kycStatus === 'completed' && (
                      <div className="flex items-center space-x-1">
                        <Shield className="h-5 w-5" />
                        <span className="text-sm">KYC Complete</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-5 w-5" />
                      <span className="text-sm">Joined {profileData.joinDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all flex items-center"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
                <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bio */}
            {profileData.bio && (
              <p className="mt-6 text-white/90 max-w-2xl">{profileData.bio}</p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <span className="text-xs text-green-600 font-medium">+12%</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            <p className="text-xs text-gray-600">Transactions</p>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">${(stats.totalSent / 1000).toFixed(1)}k</p>
            <p className="text-xs text-gray-600">Total Sent</p>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">${(stats.totalReceived / 1000).toFixed(1)}k</p>
            <p className="text-xs text-gray-600">Total Received</p>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">${stats.savedThisMonth}</p>
            <p className="text-xs text-gray-600">Saved</p>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Gift className="h-5 w-5 text-pink-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">${stats.cashbackEarned}</p>
            <p className="text-xs text-gray-600">Cashback</p>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.referrals}</p>
            <p className="text-xs text-gray-600">Referrals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-purple-600 font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="flex-1 px-4 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="flex-1 px-4 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          className="flex-1 px-4 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.location}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.occupation}
                          onChange={(e) => setProfileData({...profileData, occupation: e.target.value})}
                          className="flex-1 px-4 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.occupation}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-2xl border-2 ${
                        achievement.earned
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          achievement.earned
                            ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                            : 'bg-gray-300'
                        }`}>
                          <Icon className={`h-5 w-5 ${achievement.earned ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                            {achievement.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                          {!achievement.earned && achievement.progress && achievement.total && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{achievement.progress}/{achievement.total}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                                  style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-all flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <Download className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Download Statement</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </button>

                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-all flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Privacy Settings</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </button>

                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-all flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Rewards Program</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </button>
              </div>
            </div>

            {/* Referral Program */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 text-white">
              <Gift className="h-8 w-8 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Refer & Earn</h3>
              <p className="text-sm text-white/90 mb-4">
                Get $10 for every friend who joins and makes their first transaction.
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-4">
                <p className="text-xs text-white/80 mb-1">Your referral code</p>
                <p className="font-mono font-bold">JOHN2024</p>
              </div>
              <button className="w-full py-3 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium hover:bg-white/30 transition-all">
                Share Referral Link
              </button>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-3xl p-6">
              <button
                onClick={handleLogout}
                className="w-full p-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all flex items-center justify-center"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}