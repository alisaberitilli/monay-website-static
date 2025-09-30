/**
 * Amadeus API Service
 * Handles flight search and booking through Amadeus API
 */

import axios from 'axios';

class AmadeusService {
  constructor() {
    this.clientId = process.env.AMADEUS_CLIENT_ID;
    this.clientSecret = process.env.AMADEUS_CLIENT_SECRET;
    this.baseURL = process.env.AMADEUS_ENV === 'production'
      ? 'https://api.amadeus.com'
      : 'https://test.api.amadeus.com';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get access token from Amadeus
   */
  async authenticate() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken;
      }

      const response = await axios.post(
        `${this.baseURL}/v1/security/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry to 30 minutes from now (tokens last 30 min)
      this.tokenExpiry = new Date(Date.now() + 29 * 60 * 1000);

      console.log('Amadeus authentication successful');
      return this.accessToken;
    } catch (error) {
      console.error('Amadeus authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  /**
   * Search for flight offers
   */
  async searchFlights(searchParams) {
    try {
      const token = await this.authenticate();

      const {
        originLocationCode,
        destinationLocationCode,
        departureDate,
        returnDate,
        adults = 1,
        children = 0,
        infants = 0,
        travelClass = 'ECONOMY',
        nonStop = false,
        currencyCode = 'USD',
        maxPrice
      } = searchParams;

      const params = {
        originLocationCode,
        destinationLocationCode,
        departureDate,
        adults,
        currencyCode,
        max: 50  // Maximum results
      };

      // Add optional parameters
      if (returnDate) params.returnDate = returnDate;
      if (children > 0) params.children = children;
      if (infants > 0) params.infants = infants;
      if (travelClass) params.travelClass = travelClass;
      if (nonStop) params.nonStop = nonStop;
      if (maxPrice) params.maxPrice = maxPrice;

      const response = await axios.get(
        `${this.baseURL}/v2/shopping/flight-offers`,
        {
          params,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      return this.formatFlightResults(response.data);
    } catch (error) {
      console.error('Flight search failed:', error.response?.data || error.message);

      // Return user-friendly error
      if (error.response?.status === 400) {
        throw new Error('Invalid search parameters. Please check your dates and locations.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please try again.');
      }

      throw new Error('Failed to search flights. Please try again later.');
    }
  }

  /**
   * Get flight price confirmation
   */
  async confirmFlightPrice(flightOffer) {
    try {
      const token = await this.authenticate();

      const response = await axios.post(
        `${this.baseURL}/v1/shopping/flight-offers/pricing`,
        {
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [flightOffer]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('Price confirmation failed:', error.response?.data || error.message);
      throw new Error('Failed to confirm flight price');
    }
  }

  /**
   * Format flight results for frontend
   */
  formatFlightResults(amadeusData) {
    if (!amadeusData.data) {
      return { flights: [], dictionaries: {} };
    }

    const flights = amadeusData.data.map(offer => {
      const firstSegment = offer.itineraries[0]?.segments[0];
      const lastSegment = offer.itineraries[0]?.segments[offer.itineraries[0].segments.length - 1];

      return {
        id: offer.id,
        source: offer.source,
        instantTicketingRequired: offer.instantTicketingRequired,
        nonHomogeneous: offer.nonHomogeneous,
        oneWay: offer.oneWay,
        lastTicketingDate: offer.lastTicketingDate,
        numberOfBookableSeats: offer.numberOfBookableSeats,
        itineraries: offer.itineraries.map(itinerary => ({
          duration: itinerary.duration,
          segments: itinerary.segments.map(segment => ({
            departure: {
              iataCode: segment.departure.iataCode,
              terminal: segment.departure.terminal,
              at: segment.departure.at
            },
            arrival: {
              iataCode: segment.arrival.iataCode,
              terminal: segment.arrival.terminal,
              at: segment.arrival.at
            },
            carrierCode: segment.carrierCode,
            number: segment.number,
            aircraft: segment.aircraft,
            duration: segment.duration,
            id: segment.id,
            numberOfStops: segment.numberOfStops || 0,
            blacklistedInEU: segment.blacklistedInEU || false
          }))
        })),
        price: {
          currency: offer.price.currency,
          total: offer.price.total,
          base: offer.price.base,
          fees: offer.price.fees,
          grandTotal: offer.price.grandTotal
        },
        pricingOptions: offer.pricingOptions,
        validatingAirlineCodes: offer.validatingAirlineCodes,
        travelerPricings: offer.travelerPricings
      };
    });

    return {
      flights,
      dictionaries: amadeusData.dictionaries || {},
      meta: amadeusData.meta || {}
    };
  }

  /**
   * Get airport/city suggestions for autocomplete
   */
  async getLocationSuggestions(keyword) {
    try {
      const token = await this.authenticate();

      const response = await axios.get(
        `${this.baseURL}/v1/reference-data/locations`,
        {
          params: {
            subType: 'AIRPORT,CITY',
            keyword: keyword,
            'page[limit]': 10
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      return response.data.data.map(location => ({
        iataCode: location.iataCode,
        name: location.name,
        cityName: location.address?.cityName,
        countryName: location.address?.countryName,
        type: location.subType
      }));
    } catch (error) {
      console.error('Location search failed:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get airline name from carrier code
   */
  async getAirlineName(carrierCode) {
    try {
      const token = await this.authenticate();

      const response = await axios.get(
        `${this.baseURL}/v1/reference-data/airlines`,
        {
          params: { airlineCodes: carrierCode },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      return response.data.data[0]?.businessName || carrierCode;
    } catch (error) {
      console.error('Airline lookup failed:', error.response?.data || error.message);
      return carrierCode;
    }
  }
}

export default new AmadeusService();