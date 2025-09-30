/**
 * Super App Services Routes
 * Handles all consumer super app service integrations
 */

import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import amadeusService from '../services/amadeus.service.js';
import uberService from '../services/uber.service.js';

// Simple validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Placeholder auth middleware (in production, use proper JWT validation)
const authMiddleware = (req, res, next) => {
  // For testing, just pass through
  // In production, validate JWT token
  req.user = { id: 'test-user-001' };
  next();
};

const router = express.Router();

// ==================== TRAVEL SERVICES ====================

// Flight Search (LIVE with Amadeus)
router.post('/api/services/travel/flights/search',
  authMiddleware,
  [
    body('from').notEmpty().withMessage('Origin airport code required (e.g., JFK)'),
    body('to').notEmpty().withMessage('Destination airport code required (e.g., LAX)'),
    body('departDate').isISO8601().toDate(),
    body('returnDate').optional().isISO8601().toDate(),
    body('adults').optional().isInt({ min: 1, max: 9 }),
    body('children').optional().isInt({ min: 0, max: 9 }),
    body('infants').optional().isInt({ min: 0, max: 9 }),
    body('class').optional().isIn(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']),
    body('nonStop').optional().isBoolean(),
    body('maxPrice').optional().isFloat({ min: 0 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const searchParams = {
        originLocationCode: req.body.from.toUpperCase(),
        destinationLocationCode: req.body.to.toUpperCase(),
        departureDate: req.body.departDate,
        returnDate: req.body.returnDate,
        adults: req.body.adults || 1,
        children: req.body.children || 0,
        infants: req.body.infants || 0,
        travelClass: req.body.class || 'ECONOMY',
        nonStop: req.body.nonStop || false,
        maxPrice: req.body.maxPrice
      };

      const results = await amadeusService.searchFlights(searchParams);

      res.json({
        success: true,
        message: 'Flight search successful',
        data: {
          ...results,
          searchId: `SRCH-${Date.now()}`,
          searchParams
        }
      });
    } catch (error) {
      console.error('Flight search error:', error);
      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Failed to search flights'
      });
    }
  }
);

// Airport/City Autocomplete (LIVE with Amadeus)
router.get('/api/services/travel/flights/locations',
  authMiddleware,
  [
    query('keyword').notEmpty().isLength({ min: 2 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      const suggestions = await amadeusService.getLocationSuggestions(req.query.keyword);

      res.json({
        success: true,
        data: suggestions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Flight Price Confirmation (LIVE with Amadeus)
router.post('/api/services/travel/flights/confirm-price',
  authMiddleware,
  [
    body('flightOffer').notEmpty()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const confirmedOffer = await amadeusService.confirmFlightPrice(req.body.flightOffer);

      res.json({
        success: true,
        data: confirmedOffer
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

// Hotel Search
router.post('/api/services/travel/hotels/search',
  authMiddleware,
  [
    body('location').notEmpty(),
    body('checkIn').isISO8601().toDate(),
    body('checkOut').isISO8601().toDate(),
    body('guests').isInt({ min: 1, max: 10 }),
    body('rooms').isInt({ min: 1, max: 5 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      // TODO: Integrate with hotel booking APIs (Booking.com, Expedia, etc.)
      res.json({
        success: true,
        message: 'Hotel search endpoint - Requires Booking.com API key',
        requiredKeys: ['BOOKING_API_KEY', 'EXPEDIA_API_KEY'],
        data: {
          hotels: [],
          searchId: `HTLS-${Date.now()}`
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Car Rental Search
router.post('/api/services/travel/car-rental/search',
  authMiddleware,
  [
    body('pickupLocation').notEmpty(),
    body('pickupDate').isISO8601().toDate(),
    body('dropoffDate').isISO8601().toDate(),
    body('carType').optional().isIn(['economy', 'compact', 'midsize', 'fullsize', 'suv', 'luxury'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      // TODO: Integrate with car rental APIs (Hertz, Enterprise, etc.)
      res.json({
        success: true,
        message: 'Car rental search endpoint - Requires rental API keys',
        requiredKeys: ['HERTZ_API_KEY', 'ENTERPRISE_API_KEY', 'AVIS_API_KEY'],
        data: {
          vehicles: [],
          searchId: `CARS-${Date.now()}`
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ==================== TRANSPORT SERVICES ====================

// Uber OAuth Authorization URL
router.get('/api/services/transport/rideshare/uber/auth',
  authMiddleware,
  async (req, res) => {
    try {
      const state = `user_${req.user.id}_${Date.now()}`;
      const authUrl = uberService.getAuthorizationUrl(state);

      res.json({
        success: true,
        data: {
          authUrl,
          state
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Uber OAuth Callback
router.get('/api/services/transport/rideshare/callback',
  async (req, res) => {
    try {
      const { code, state } = req.query;

      if (!code) {
        throw new Error('Authorization code not provided');
      }

      const tokens = await uberService.getAccessToken(code);

      // In production, store tokens securely in database associated with user
      // For now, return to client to store in session
      res.redirect(`http://localhost:3003/services/transport/rideshare?auth=success&token=${tokens.accessToken}`);
    } catch (error) {
      res.redirect(`http://localhost:3003/services/transport/rideshare?auth=failed&error=${error.message}`);
    }
  }
);

// Get Rideshare Products (LIVE with Uber)
router.get('/api/services/transport/rideshare/products',
  authMiddleware,
  [
    query('lat').isFloat(),
    query('lng').isFloat(),
    query('uberToken').optional()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { lat, lng, uberToken } = req.query;

      if (!uberToken) {
        return res.json({
          success: false,
          message: 'Uber authentication required',
          data: { requiresAuth: true }
        });
      }

      const products = await uberService.getProducts(uberToken, lat, lng);

      res.json({
        success: true,
        data: {
          products,
          location: { latitude: lat, longitude: lng }
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get Price Estimates (LIVE with Uber)
router.post('/api/services/transport/rideshare/estimate',
  authMiddleware,
  [
    body('pickup.lat').isFloat(),
    body('pickup.lng').isFloat(),
    body('destination.lat').isFloat(),
    body('destination.lng').isFloat(),
    body('uberToken').optional()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { pickup, destination, uberToken } = req.body;
      const estimates = {};

      // Get Uber estimates if token provided
      if (uberToken) {
        try {
          const [priceEstimates, timeEstimates] = await Promise.all([
            uberService.getPriceEstimates(
              uberToken,
              pickup.lat,
              pickup.lng,
              destination.lat,
              destination.lng
            ),
            uberService.getTimeEstimates(uberToken, pickup.lat, pickup.lng)
          ]);

          estimates.uber = {
            prices: priceEstimates,
            times: timeEstimates
          };
        } catch (uberError) {
          console.error('Uber estimate error:', uberError);
          estimates.uber = { error: uberError.message };
        }
      }

      // Lyft integration would go here when available
      estimates.lyft = {
        message: 'Lyft integration coming soon',
        prices: [],
        times: []
      };

      res.json({
        success: true,
        data: {
          estimates,
          pickup,
          destination
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Request a Ride (LIVE with Uber)
router.post('/api/services/transport/rideshare/request',
  authMiddleware,
  [
    body('provider').isIn(['uber']),
    body('productId').notEmpty(),
    body('pickup.lat').isFloat(),
    body('pickup.lng').isFloat(),
    body('destination.lat').isFloat(),
    body('destination.lng').isFloat(),
    body('uberToken').notEmpty()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const {
        provider,
        productId,
        pickup,
        destination,
        uberToken,
        surgeConfirmationId
      } = req.body;

      if (provider !== 'uber') {
        return res.status(400).json({
          success: false,
          error: 'Only Uber is currently supported'
        });
      }

      const rideParams = {
        productId,
        startLat: pickup.lat,
        startLng: pickup.lng,
        startAddress: pickup.address,
        endLat: destination.lat,
        endLng: destination.lng,
        endAddress: destination.address,
        surgeConfirmationId
      };

      const ride = await uberService.requestRide(uberToken, rideParams);

      res.json({
        success: true,
        data: ride
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get Current Ride Status (LIVE with Uber)
router.get('/api/services/transport/rideshare/current',
  authMiddleware,
  [
    query('uberToken').notEmpty()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const ride = await uberService.getCurrentRide(req.query.uberToken);

      res.json({
        success: true,
        data: ride || { message: 'No active ride' }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Cancel Ride (LIVE with Uber)
router.delete('/api/services/transport/rideshare/cancel',
  authMiddleware,
  [
    body('uberToken').notEmpty(),
    body('rideId').optional()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const result = await uberService.cancelRide(req.body.uberToken, req.body.rideId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Transit Pass Purchase
router.post('/api/services/transport/transit/purchase',
  authMiddleware,
  [
    body('city').notEmpty(),
    body('passType').notEmpty(),
    body('duration').isIn(['single', 'day', 'week', 'month']),
    body('quantity').isInt({ min: 1, max: 10 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      // TODO: Integrate with city transit APIs (MUNI, BART, MTA, etc.)
      res.json({
        success: true,
        message: 'Transit pass purchase endpoint - Requires transit agency APIs',
        requiredKeys: ['MUNI_API_KEY', 'BART_API_KEY', 'MTA_API_KEY'],
        data: {
          passId: `PASS-${Date.now()}`,
          status: 'pending'
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Toll Payment
router.post('/api/services/transport/tolls/pay',
  authMiddleware,
  [
    body('tollId').notEmpty(),
    body('vehiclePlate').notEmpty(),
    body('amount').isFloat({ min: 0.01 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      // TODO: Integrate with toll road APIs (FasTrak, E-ZPass, etc.)
      res.json({
        success: true,
        message: 'Toll payment endpoint - Requires toll agency APIs',
        requiredKeys: ['FASTRAK_API_KEY', 'EZPASS_API_KEY'],
        data: {
          transactionId: `TOLL-${Date.now()}`,
          status: 'processed'
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ==================== SHOPPING SERVICES ====================

router.get('/api/services/shopping/deals',
  authMiddleware,
  [
    query('category').optional(),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      // TODO: Integrate with shopping APIs (Amazon, Target, Walmart, etc.)
      res.json({
        success: true,
        message: 'Shopping deals endpoint - Requires retail API keys',
        requiredKeys: ['AMAZON_API_KEY', 'TARGET_API_KEY', 'WALMART_API_KEY'],
        data: {
          deals: [],
          categories: ['electronics', 'clothing', 'home', 'groceries']
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ==================== HEALTHCARE SERVICES ====================

router.post('/api/services/healthcare/bill-pay',
  authMiddleware,
  [
    body('providerId').notEmpty(),
    body('accountNumber').notEmpty(),
    body('amount').isFloat({ min: 0.01 }),
    body('paymentMethod').isIn(['hsa', 'fsa', 'wallet', 'card'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      // TODO: Integrate with healthcare payment APIs
      res.json({
        success: true,
        message: 'Healthcare bill payment endpoint',
        data: {
          paymentId: `MED-${Date.now()}`,
          status: 'processing'
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// HSA/FSA Balance
router.get('/api/services/healthcare/accounts/:accountType',
  authMiddleware,
  [
    param('accountType').isIn(['hsa', 'fsa'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      // TODO: Integrate with HSA/FSA provider APIs
      res.json({
        success: true,
        message: 'HSA/FSA account endpoint - Requires provider APIs',
        requiredKeys: ['HSA_PROVIDER_API_KEY', 'FSA_PROVIDER_API_KEY'],
        data: {
          balance: 0,
          contributions: 0,
          accountType: req.params.accountType
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ==================== EDUCATION SERVICES ====================

router.post('/api/services/education/tuition-payment',
  authMiddleware,
  [
    body('institutionId').notEmpty(),
    body('studentId').notEmpty(),
    body('amount').isFloat({ min: 0.01 }),
    body('semester').notEmpty()
  ],
  validateRequest,
  async (req, res) => {
    try {
      // TODO: Integrate with education payment systems
      res.json({
        success: true,
        message: 'Tuition payment endpoint',
        data: {
          paymentId: `EDU-${Date.now()}`,
          status: 'pending'
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Student Loan Management
router.get('/api/services/education/loans',
  authMiddleware,
  async (req, res) => {
    try {
      // TODO: Integrate with student loan servicers
      res.json({
        success: true,
        message: 'Student loans endpoint - Requires loan servicer APIs',
        requiredKeys: ['NELNET_API_KEY', 'FEDLOAN_API_KEY', 'SALLIE_MAE_API_KEY'],
        data: {
          loans: [],
          totalBalance: 0
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ==================== ENTERTAINMENT SERVICES ====================

router.post('/api/services/entertainment/tickets/purchase',
  authMiddleware,
  [
    body('eventId').notEmpty(),
    body('quantity').isInt({ min: 1, max: 10 }),
    body('sectionId').notEmpty()
  ],
  validateRequest,
  async (req, res) => {
    try {
      // TODO: Integrate with ticketing APIs (Ticketmaster, StubHub, etc.)
      res.json({
        success: true,
        message: 'Event tickets endpoint - Requires ticketing API keys',
        requiredKeys: ['TICKETMASTER_API_KEY', 'STUBHUB_API_KEY'],
        data: {
          ticketId: `TKT-${Date.now()}`,
          status: 'reserved'
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Streaming Services Management
router.get('/api/services/entertainment/streaming',
  authMiddleware,
  async (req, res) => {
    try {
      // TODO: Integrate with streaming service APIs
      res.json({
        success: true,
        message: 'Streaming services endpoint',
        data: {
          subscriptions: [],
          providers: ['netflix', 'spotify', 'disney+', 'hulu']
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ==================== GOVERNMENT SERVICES ====================

router.post('/api/services/government/tax-payment',
  authMiddleware,
  [
    body('taxType').isIn(['federal', 'state', 'property']),
    body('amount').isFloat({ min: 0.01 }),
    body('taxYear').isInt({ min: 2020, max: 2030 })
  ],
  validateRequest,
  async (req, res) => {
    try {
      // TODO: Integrate with government payment systems
      res.json({
        success: true,
        message: 'Tax payment endpoint - Requires IRS/State APIs',
        requiredKeys: ['IRS_API_KEY', 'STATE_TAX_API_KEY'],
        data: {
          confirmationNumber: `TAX-${Date.now()}`,
          status: 'submitted'
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Benefits Management
router.get('/api/services/government/benefits',
  authMiddleware,
  async (req, res) => {
    try {
      // Already have government benefits routes in governmentBenefits.js
      res.json({
        success: true,
        message: 'Benefits endpoint - See /api/government-benefits routes',
        data: {
          benefitTypes: ['snap', 'tanf', 'unemployment', 'social-security'],
          existingRoutes: ['/api/government-benefits/*']
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ==================== API KEY STATUS ====================

router.get('/api/services/api-keys/status',
  authMiddleware,
  async (req, res) => {
    const requiredKeys = {
      travel: {
        flights: ['AMADEUS_CLIENT_ID', 'AMADEUS_CLIENT_SECRET', 'SABRE_API_KEY'],
        hotels: ['BOOKING_API_KEY', 'EXPEDIA_API_KEY', 'HOTELS_COM_API_KEY'],
        carRental: ['HERTZ_API_KEY', 'ENTERPRISE_API_KEY', 'AVIS_API_KEY']
      },
      transport: {
        rideshare: ['UBER_CLIENT_ID', 'UBER_CLIENT_SECRET', 'LYFT_CLIENT_ID', 'LYFT_CLIENT_SECRET'],
        transit: ['MUNI_API_KEY', 'BART_API_KEY', 'MTA_API_KEY'],
        tolls: ['FASTRAK_API_KEY', 'EZPASS_API_KEY']
      },
      shopping: ['AMAZON_API_KEY', 'TARGET_API_KEY', 'WALMART_API_KEY'],
      healthcare: ['HSA_PROVIDER_API_KEY', 'FSA_PROVIDER_API_KEY'],
      education: ['NELNET_API_KEY', 'FEDLOAN_API_KEY', 'SALLIE_MAE_API_KEY'],
      entertainment: ['TICKETMASTER_API_KEY', 'STUBHUB_API_KEY'],
      government: ['IRS_API_KEY', 'STATE_TAX_API_KEY']
    };

    const keyStatus = {};

    // Check which keys are configured
    Object.entries(requiredKeys).forEach(([category, keys]) => {
      if (typeof keys === 'object' && !Array.isArray(keys)) {
        keyStatus[category] = {};
        Object.entries(keys).forEach(([subcat, subkeys]) => {
          keyStatus[category][subcat] = subkeys.map(key => ({
            key,
            configured: !!process.env[key]
          }));
        });
      } else {
        keyStatus[category] = keys.map(key => ({
          key,
          configured: !!process.env[key]
        }));
      }
    });

    res.json({
      success: true,
      message: 'API key configuration status',
      data: keyStatus
    });
  }
);

export default router;