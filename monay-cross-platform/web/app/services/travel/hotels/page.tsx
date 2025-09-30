'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Hotel,
  Calendar,
  Users,
  Search,
  MapPin,
  Star,
  Wifi,
  Car,
  Dumbbell,
  Coffee,
  Waves,
  Utensils,
  Clock,
  CreditCard,
  Filter
} from 'lucide-react';

export default function HotelsPage() {
  const [searchForm, setSearchForm] = useState({
    destination: '',
    checkin: '',
    checkout: '',
    guests: '2',
    rooms: '1'
  });
  const [priceRange, setPriceRange] = useState([50, 500]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const mockHotels = [
    {
      id: 1,
      name: 'Grand Plaza Hotel',
      location: 'Downtown Manhattan, New York',
      rating: 4.5,
      reviews: 1247,
      pricePerNight: 299,
      image: '🏨',
      amenities: ['wifi', 'gym', 'parking', 'restaurant', 'pool'],
      description: 'Luxury hotel in the heart of Manhattan with stunning city views',
      roomType: 'Deluxe King Room',
      availability: 'Last 2 rooms!'
    },
    {
      id: 2,
      name: 'Boutique Garden Inn',
      location: 'SoHo, New York',
      rating: 4.3,
      reviews: 892,
      pricePerNight: 249,
      image: '🌆',
      amenities: ['wifi', 'restaurant', 'spa', 'business'],
      description: 'Charming boutique hotel with garden courtyard',
      roomType: 'Superior Queen Room',
      availability: 'Available'
    },
    {
      id: 3,
      name: 'Metropolitan Suites',
      location: 'Midtown, New York',
      rating: 4.7,
      reviews: 1589,
      pricePerNight: 399,
      image: '🏙️',
      amenities: ['wifi', 'gym', 'pool', 'spa', 'restaurant', 'business'],
      description: 'Modern suites with kitchenette and panoramic views',
      roomType: 'Executive Suite',
      availability: 'Available'
    }
  ];

  const popularDestinations = [
    { name: 'New York', hotels: '1,247 hotels', image: '🗽' },
    { name: 'Los Angeles', hotels: '892 hotels', image: '🌴' },
    { name: 'Miami', hotels: '634 hotels', image: '🏖️' },
    { name: 'Las Vegas', hotels: '456 hotels', image: '🎰' },
    { name: 'San Francisco', hotels: '723 hotels', image: '🌉' },
    { name: 'Chicago', hotels: '567 hotels', image: '🏢' }
  ];

  const amenityOptions = [
    { id: 'wifi', label: 'Free WiFi', icon: Wifi },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'gym', label: 'Fitness Center', icon: Dumbbell },
    { id: 'pool', label: 'Swimming Pool', icon: Waves },
    { id: 'spa', label: 'Spa Services', icon: Star },
    { id: 'restaurant', label: 'Restaurant', icon: Utensils },
    { id: 'business', label: 'Business Center', icon: Coffee }
  ];

  const handleSearch = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSearchResults(mockHotels);
    setIsLoading(false);
  };

  const handleBookHotel = (hotelId: number) => {
    console.log('Booking hotel:', hotelId);
  };

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityMap: { [key: string]: any } = {
      wifi: Wifi,
      parking: Car,
      gym: Dumbbell,
      pool: Waves,
      spa: Star,
      restaurant: Utensils,
      business: Coffee
    };
    const IconComponent = amenityMap[amenity];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Hotel className="h-8 w-8 text-purple-600" />
            Hotel Booking
          </h1>
          <p className="text-lg text-gray-600">
            Find and book accommodations worldwide with instant payment
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Search Hotels</CardTitle>
            <CardDescription>Find the perfect accommodation for your stay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Where are you going?"
                    value={searchForm.destination}
                    onChange={(e) => setSearchForm({...searchForm, destination: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={searchForm.checkin}
                    onChange={(e) => setSearchForm({...searchForm, checkin: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={searchForm.checkout}
                    onChange={(e) => setSearchForm({...searchForm, checkout: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Guests & Rooms</label>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={searchForm.guests} onValueChange={(value) => setSearchForm({...searchForm, guests: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={searchForm.rooms} onValueChange={(value) => setSearchForm({...searchForm, rooms: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Room' : 'Rooms'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button onClick={handleSearch} disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <Clock className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search Hotels
            </Button>
          </CardContent>
        </Card>

        {/* Popular Destinations */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Destinations</CardTitle>
            <CardDescription>Top destinations with great hotel options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularDestinations.map((destination, index) => (
                <div key={index} className="text-center space-y-2 p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="text-3xl">{destination.image}</div>
                  <h3 className="font-semibold">{destination.name}</h3>
                  <p className="text-sm text-gray-600">{destination.hotels}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Results */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div className="space-y-4">
                  <label className="text-sm font-medium">Price per night</label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    min={0}
                    step={25}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}+</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                  <label className="text-sm font-medium">Amenities</label>
                  <div className="space-y-2">
                    {amenityOptions.map((amenity) => (
                      <label key={amenity.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity.id)}
                          onChange={() => toggleAmenity(amenity.id)}
                          className="rounded border-gray-300"
                        />
                        <amenity.icon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{amenity.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Search Results</h2>
                <p className="text-sm text-gray-600">{searchResults.length} hotels found</p>
              </div>

              {searchResults.map((hotel: any) => (
                <Card key={hotel.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Hotel Image */}
                      <div className="md:col-span-1">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-6xl">
                          {hotel.image}
                        </div>
                      </div>

                      {/* Hotel Info */}
                      <div className="md:col-span-2 space-y-3">
                        <div>
                          <h3 className="text-xl font-semibold">{hotel.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {hotel.location}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{hotel.rating}</span>
                          </div>
                          <span className="text-sm text-gray-600">({hotel.reviews} reviews)</span>
                        </div>

                        <p className="text-sm text-gray-700">{hotel.description}</p>

                        <div className="flex flex-wrap gap-2">
                          {hotel.amenities.slice(0, 4).map((amenity: string, index: number) => (
                            <div key={index} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                              {getAmenityIcon(amenity)}
                              <span className="capitalize">{amenity}</span>
                            </div>
                          ))}
                          {hotel.amenities.length > 4 && (
                            <Badge variant="outline">+{hotel.amenities.length - 4} more</Badge>
                          )}
                        </div>

                        <div className="text-sm">
                          <p className="font-medium">{hotel.roomType}</p>
                          {hotel.availability === 'Last 2 rooms!' ? (
                            <p className="text-red-600 font-medium">{hotel.availability}</p>
                          ) : (
                            <p className="text-green-600">{hotel.availability}</p>
                          )}
                        </div>
                      </div>

                      {/* Price and Book */}
                      <div className="md:col-span-1 text-center md:text-right space-y-4">
                        <div>
                          <div className="text-2xl font-bold text-purple-600">${hotel.pricePerNight}</div>
                          <div className="text-sm text-gray-600">per night</div>
                        </div>

                        <Button onClick={() => handleBookHotel(hotel.id)} className="w-full">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Book Now
                        </Button>

                        <p className="text-xs text-gray-500">Includes taxes and fees</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Hotel Booking Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Book Hotels with Monay?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Instant Confirmation</h3>
                <p className="text-sm text-gray-600">
                  Pay with your Monay wallet and get instant booking confirmation
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Best Rate Guarantee</h3>
                <p className="text-sm text-gray-600">
                  Find a lower price elsewhere? We'll match it and give you an extra 10% off
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Hotel className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Flexible Booking</h3>
                <p className="text-sm text-gray-600">
                  Free cancellation on most bookings and easy date changes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}