/**
 * Booking.com API Service
 * Handles hotel search and booking through Booking.com API
 */

import axios from 'axios';

class BookingService {
  constructor() {
    this.apiKey = process.env.BOOKING_API_KEY;
    this.baseURL = process.env.BOOKING_ENV === 'production'
      ? 'https://api.booking.com'
      : 'https://api.booking.com'; // Booking.com doesn't have a separate test environment

    // Note: Booking.com uses different endpoints for different services
    this.endpoints = {
      locations: '/api/v1/static/locations',
      hotels: '/api/v1/static/hotels',
      search: '/api/v2/search/hotels',
      availability: '/api/v1/hotels/availability',
      facilities: '/api/v1/static/facilities',
      roomTypes: '/api/v1/static/room_types'
    };
  }

  /**
   * Create axios instance with auth headers
   */
  getAxiosInstance() {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Search for hotels
   * Note: Booking.com's actual API structure may vary - this is based on typical patterns
   */
  async searchHotels(searchParams) {
    try {
      const {
        location,
        checkIn,
        checkOut,
        guests = 1,
        rooms = 1,
        priceMin,
        priceMax,
        rating,
        facilities
      } = searchParams;

      // For testing, return mock data since Booking.com API requires approval
      // In production, this would make actual API calls
      console.log('Booking.com search params:', searchParams);

      // Mock response structure
      const mockHotels = [
        {
          hotelId: 'mock-001',
          name: 'Grand Plaza Hotel',
          location: location,
          rating: 4.5,
          price: {
            amount: 150,
            currency: 'USD',
            total: 150 * this.getNights(checkIn, checkOut)
          },
          availability: true,
          images: ['https://example.com/hotel1.jpg'],
          amenities: ['WiFi', 'Pool', 'Gym', 'Parking'],
          roomsAvailable: 5,
          checkIn: checkIn,
          checkOut: checkOut
        },
        {
          hotelId: 'mock-002',
          name: 'Comfort Inn & Suites',
          location: location,
          rating: 4.0,
          price: {
            amount: 120,
            currency: 'USD',
            total: 120 * this.getNights(checkIn, checkOut)
          },
          availability: true,
          images: ['https://example.com/hotel2.jpg'],
          amenities: ['WiFi', 'Breakfast', 'Parking'],
          roomsAvailable: 8,
          checkIn: checkIn,
          checkOut: checkOut
        },
        {
          hotelId: 'mock-003',
          name: 'Luxury Resort & Spa',
          location: location,
          rating: 5.0,
          price: {
            amount: 350,
            currency: 'USD',
            total: 350 * this.getNights(checkIn, checkOut)
          },
          availability: true,
          images: ['https://example.com/hotel3.jpg'],
          amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Gym'],
          roomsAvailable: 3,
          checkIn: checkIn,
          checkOut: checkOut
        }
      ];

      // Filter by price if specified
      let results = mockHotels;
      if (priceMin) {
        results = results.filter(h => h.price.amount >= priceMin);
      }
      if (priceMax) {
        results = results.filter(h => h.price.amount <= priceMax);
      }
      if (rating) {
        results = results.filter(h => h.rating >= rating);
      }

      return {
        hotels: results,
        totalResults: results.length,
        searchCriteria: searchParams,
        message: 'Note: Using mock data. Production requires Booking.com API approval.'
      };

      // Actual API call (when approved):
      /*
      const api = this.getAxiosInstance();
      const response = await api.get(this.endpoints.search, {
        params: {
          dest_id: location,
          checkin_date: checkIn,
          checkout_date: checkOut,
          room_number: rooms,
          guest_number: guests,
          price_min: priceMin,
          price_max: priceMax,
          review_score_min: rating,
          facilities: facilities?.join(','),
          order_by: 'popularity',
          units: 'metric',
          language: 'en-US'
        }
      });

      return this.formatHotelResults(response.data);
      */
    } catch (error) {
      console.error('Hotel search failed:', error.response?.data || error.message);
      throw new Error('Failed to search hotels. ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Get hotel details
   */
  async getHotelDetails(hotelId) {
    try {
      // Mock response for testing
      return {
        hotelId: hotelId,
        name: 'Grand Plaza Hotel',
        description: 'A luxurious hotel in the heart of the city',
        address: '123 Main Street, City, State 12345',
        location: {
          latitude: 40.7128,
          longitude: -74.0060
        },
        rating: 4.5,
        reviewCount: 1250,
        images: [
          'https://example.com/hotel-main.jpg',
          'https://example.com/hotel-room.jpg',
          'https://example.com/hotel-pool.jpg'
        ],
        amenities: [
          'Free WiFi',
          'Swimming Pool',
          'Fitness Center',
          'Restaurant',
          'Bar',
          'Room Service',
          'Parking',
          'Business Center'
        ],
        rooms: [
          {
            roomId: 'room-001',
            type: 'Standard King',
            price: 150,
            maxOccupancy: 2,
            bedType: 'King',
            size: '300 sq ft'
          },
          {
            roomId: 'room-002',
            type: 'Deluxe Double',
            price: 180,
            maxOccupancy: 4,
            bedType: 'Two Queens',
            size: '400 sq ft'
          }
        ],
        policies: {
          checkIn: '3:00 PM',
          checkOut: '11:00 AM',
          cancellation: 'Free cancellation up to 24 hours before check-in',
          pets: 'Pets allowed with fee'
        },
        message: 'Note: Using mock data. Production requires Booking.com API approval.'
      };

      // Actual API call (when approved):
      /*
      const api = this.getAxiosInstance();
      const response = await api.get(`${this.endpoints.hotels}/${hotelId}`, {
        params: {
          language: 'en-US',
          extras: 'facilities,photos,description,policies'
        }
      });

      return this.formatHotelDetails(response.data);
      */
    } catch (error) {
      console.error('Get hotel details failed:', error.response?.data || error.message);
      throw new Error('Failed to get hotel details');
    }
  }

  /**
   * Check hotel availability
   */
  async checkAvailability(hotelId, checkIn, checkOut, guests = 1, rooms = 1) {
    try {
      // Mock response
      return {
        hotelId: hotelId,
        available: true,
        checkIn: checkIn,
        checkOut: checkOut,
        nights: this.getNights(checkIn, checkOut),
        rooms: [
          {
            roomId: 'room-001',
            type: 'Standard King',
            available: 3,
            price: {
              perNight: 150,
              total: 150 * this.getNights(checkIn, checkOut),
              taxes: 15 * this.getNights(checkIn, checkOut),
              fees: 10,
              currency: 'USD'
            }
          },
          {
            roomId: 'room-002',
            type: 'Deluxe Double',
            available: 2,
            price: {
              perNight: 180,
              total: 180 * this.getNights(checkIn, checkOut),
              taxes: 18 * this.getNights(checkIn, checkOut),
              fees: 10,
              currency: 'USD'
            }
          }
        ],
        message: 'Note: Using mock data. Production requires Booking.com API approval.'
      };

      // Actual API call (when approved):
      /*
      const api = this.getAxiosInstance();
      const response = await api.get(this.endpoints.availability, {
        params: {
          hotel_ids: hotelId,
          checkin_date: checkIn,
          checkout_date: checkOut,
          room_number: rooms,
          guest_number: guests
        }
      });

      return this.formatAvailability(response.data);
      */
    } catch (error) {
      console.error('Availability check failed:', error.response?.data || error.message);
      throw new Error('Failed to check availability');
    }
  }

  /**
   * Get location suggestions for autocomplete
   */
  async getLocationSuggestions(query) {
    try {
      // Mock response
      const mockLocations = [
        {
          destId: 'city-001',
          name: 'New York City, New York, United States',
          type: 'city',
          country: 'United States',
          region: 'New York'
        },
        {
          destId: 'city-002',
          name: 'Newark, New Jersey, United States',
          type: 'city',
          country: 'United States',
          region: 'New Jersey'
        },
        {
          destId: 'city-003',
          name: 'New Orleans, Louisiana, United States',
          type: 'city',
          country: 'United States',
          region: 'Louisiana'
        }
      ];

      // Filter by query
      const filtered = mockLocations.filter(loc =>
        loc.name.toLowerCase().includes(query.toLowerCase())
      );

      return {
        suggestions: filtered,
        query: query,
        message: 'Note: Using mock data. Production requires Booking.com API approval.'
      };

      // Actual API call (when approved):
      /*
      const api = this.getAxiosInstance();
      const response = await api.get(this.endpoints.locations, {
        params: {
          query: query,
          language: 'en-US'
        }
      });

      return response.data.result.map(location => ({
        destId: location.dest_id,
        name: location.name,
        type: location.dest_type,
        country: location.country,
        region: location.region
      }));
      */
    } catch (error) {
      console.error('Location search failed:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Calculate number of nights
   */
  getNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  }

  /**
   * Test API connectivity
   */
  async testConnection() {
    try {
      // For now, just verify we have an API key
      if (!this.apiKey) {
        throw new Error('Booking.com API key not configured');
      }

      // In production, make a test API call
      // const api = this.getAxiosInstance();
      // const response = await api.get('/api/v1/static/countries');

      return {
        success: true,
        message: 'Booking.com API key is configured',
        apiKey: this.apiKey ? 'Configured' : 'Missing',
        note: 'Full integration requires API approval from Booking.com'
      };
    } catch (error) {
      throw new Error(`Booking.com test failed: ${error.message}`);
    }
  }
}

export default new BookingService();