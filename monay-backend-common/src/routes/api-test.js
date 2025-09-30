/**
 * API Test Routes
 * Test endpoints for verifying third-party API integrations
 */

import express from 'express';
import amadeusService from '../services/amadeus.service.js';
import uberService from '../services/uber.service.js';
import bookingService from '../services/booking.service.js';

const router = express.Router();

/**
 * Test Amadeus Flight Search
 * GET /api/test/amadeus/flights
 */
router.get('/api/test/amadeus/flights', async (req, res) => {
  try {
    console.log('Testing Amadeus flight search...');

    // Test with a sample search: NYC to LAX, one week from now
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 7);
    const departureDate = testDate.toISOString().split('T')[0];

    const searchParams = {
      originLocationCode: 'JFK',
      destinationLocationCode: 'LAX',
      departureDate: departureDate,
      adults: 1,
      travelClass: 'ECONOMY',
      currencyCode: 'USD',
      max: 5 // Just get 5 results for testing
    };

    const results = await amadeusService.searchFlights(searchParams);

    res.json({
      success: true,
      message: 'Amadeus API is working!',
      testSearch: {
        from: 'JFK (New York)',
        to: 'LAX (Los Angeles)',
        date: departureDate,
        resultsFound: results.flights.length
      },
      sample: results.flights.length > 0 ? results.flights[0] : null,
      totalResults: results.flights.length
    });
  } catch (error) {
    console.error('Amadeus test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Amadeus API test failed',
      error: error.message,
      hint: 'Check if API credentials are correct and you have test data access'
    });
  }
});

/**
 * Test Amadeus Airport Autocomplete
 * GET /api/test/amadeus/airports?keyword=new
 */
router.get('/api/test/amadeus/airports', async (req, res) => {
  try {
    const keyword = req.query.keyword || 'new';
    console.log(`Testing Amadeus airport search for: ${keyword}`);

    const suggestions = await amadeusService.getLocationSuggestions(keyword);

    res.json({
      success: true,
      message: 'Amadeus location search working!',
      keyword: keyword,
      resultsFound: suggestions.length,
      locations: suggestions
    });
  } catch (error) {
    console.error('Amadeus location test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Amadeus location search failed',
      error: error.message
    });
  }
});

/**
 * Test Uber OAuth URL Generation
 * GET /api/test/uber/auth-url
 */
router.get('/api/test/uber/auth-url', async (req, res) => {
  try {
    console.log('Testing Uber OAuth URL generation...');

    const state = 'test_' + Date.now();
    const authUrl = uberService.getAuthorizationUrl(state);

    res.json({
      success: true,
      message: 'Uber OAuth URL generated successfully',
      authUrl: authUrl,
      state: state,
      note: 'Open the authUrl in a browser to test Uber OAuth flow'
    });
  } catch (error) {
    console.error('Uber OAuth test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Uber OAuth URL generation failed',
      error: error.message
    });
  }
});

/**
 * Test Booking.com Hotel Search
 * GET /api/test/booking/hotels
 */
router.get('/api/test/booking/hotels', async (req, res) => {
  try {
    console.log('Testing Booking.com hotel search...');

    // Test with sample search: New York, one week from now
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 7);
    const checkIn = testDate.toISOString().split('T')[0];

    const checkOutDate = new Date(testDate);
    checkOutDate.setDate(checkOutDate.getDate() + 2);
    const checkOut = checkOutDate.toISOString().split('T')[0];

    const searchParams = {
      location: 'New York',
      checkIn: checkIn,
      checkOut: checkOut,
      guests: 2,
      rooms: 1
    };

    const results = await bookingService.searchHotels(searchParams);

    res.json({
      success: true,
      message: 'Booking.com API test completed',
      testSearch: {
        location: 'New York',
        checkIn: checkIn,
        checkOut: checkOut,
        nights: 2
      },
      results: results
    });
  } catch (error) {
    console.error('Booking.com test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Booking.com API test failed',
      error: error.message
    });
  }
});

/**
 * Test Booking.com Location Search
 * GET /api/test/booking/locations?query=new
 */
router.get('/api/test/booking/locations', async (req, res) => {
  try {
    const query = req.query.query || 'new york';
    console.log(`Testing Booking.com location search for: ${query}`);

    const suggestions = await bookingService.getLocationSuggestions(query);

    res.json({
      success: true,
      message: 'Booking.com location search completed',
      query: query,
      results: suggestions
    });
  } catch (error) {
    console.error('Booking.com location test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Booking.com location search failed',
      error: error.message
    });
  }
});

/**
 * Test Booking.com Connection
 * GET /api/test/booking/connection
 */
router.get('/api/test/booking/connection', async (req, res) => {
  try {
    console.log('Testing Booking.com connection...');

    const result = await bookingService.testConnection();

    res.json({
      success: true,
      message: 'Booking.com connection test completed',
      result: result
    });
  } catch (error) {
    console.error('Booking.com connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Booking.com connection test failed',
      error: error.message
    });
  }
});

/**
 * Check API Configuration Status
 * GET /api/test/status
 */
router.get('/api/test/status', async (req, res) => {
  const apiStatus = {
    amadeus: {
      configured: !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET),
      clientId: process.env.AMADEUS_CLIENT_ID ? '✓ Configured' : '✗ Missing',
      clientSecret: process.env.AMADEUS_CLIENT_SECRET ? '✓ Configured' : '✗ Missing',
      environment: process.env.AMADEUS_ENV || 'test'
    },
    booking: {
      configured: !!process.env.BOOKING_API_KEY,
      apiKey: process.env.BOOKING_API_KEY ? '✓ Configured' : '✗ Missing',
      environment: process.env.BOOKING_ENV || 'test'
    },
    uber: {
      configured: !!(process.env.UBER_CLIENT_ID && process.env.UBER_CLIENT_SECRET),
      clientId: process.env.UBER_CLIENT_ID ? '✓ Configured' : '✗ Missing',
      clientSecret: process.env.UBER_CLIENT_SECRET ? '✓ Configured' : '✗ Missing',
      redirectUri: process.env.UBER_REDIRECT_URI || 'Not set',
      environment: process.env.UBER_ENV || 'sandbox'
    }
  };

  // Test Amadeus connectivity
  let amadeusConnectivity = 'Not tested';
  if (apiStatus.amadeus.configured) {
    try {
      await amadeusService.authenticate();
      amadeusConnectivity = '✓ Connected';
    } catch (error) {
      amadeusConnectivity = `✗ Failed: ${error.message}`;
    }
  }

  res.json({
    success: true,
    message: 'API Configuration Status',
    apis: {
      amadeus: {
        ...apiStatus.amadeus,
        connectivity: amadeusConnectivity,
        testEndpoint: '/api/test/amadeus/flights'
      },
      booking: {
        ...apiStatus.booking,
        connectivity: 'Not implemented yet'
      },
      uber: {
        ...apiStatus.uber,
        testEndpoint: '/api/test/uber/auth-url'
      }
    },
    summary: {
      totalConfigured: Object.values(apiStatus).filter(api => api.configured).length,
      totalAvailable: Object.keys(apiStatus).length
    }
  });
});

/**
 * Test All APIs
 * GET /api/test/all
 */
router.get('/api/test/all', async (req, res) => {
  const results = {};

  // Test Amadeus
  try {
    await amadeusService.authenticate();
    const locations = await amadeusService.getLocationSuggestions('JFK');
    results.amadeus = {
      status: '✓ Working',
      authentication: '✓ Success',
      sampleData: locations.length > 0 ? '✓ Data retrieved' : '✗ No data'
    };
  } catch (error) {
    results.amadeus = {
      status: '✗ Failed',
      error: error.message
    };
  }

  // Test Uber OAuth
  try {
    const authUrl = uberService.getAuthorizationUrl('test');
    results.uber = {
      status: '✓ Configuration OK',
      oauthUrl: authUrl ? '✓ Generated' : '✗ Failed',
      note: 'Full test requires OAuth flow completion'
    };
  } catch (error) {
    results.uber = {
      status: '✗ Failed',
      error: error.message
    };
  }

  // Booking.com
  results.booking = {
    status: process.env.BOOKING_API_KEY ? '✓ API Key Configured' : '✗ Not configured',
    note: 'Integration pending'
  };

  res.json({
    success: true,
    message: 'API Integration Test Results',
    timestamp: new Date().toISOString(),
    results
  });
});

export default router;