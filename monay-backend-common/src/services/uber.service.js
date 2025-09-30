/**
 * Uber API Service
 * Handles rideshare booking through Uber API
 */

import axios from 'axios';

class UberService {
  constructor() {
    this.clientId = process.env.UBER_CLIENT_ID;
    this.clientSecret = process.env.UBER_CLIENT_SECRET;
    this.redirectUri = process.env.UBER_REDIRECT_URI || 'http://localhost:3003/api/services/transport/rideshare/callback';
    this.baseURL = process.env.UBER_ENV === 'production'
      ? 'https://api.uber.com'
      : 'https://sandbox-api.uber.com';
    this.authURL = 'https://login.uber.com/oauth/v2';
  }

  /**
   * Generate OAuth authorization URL for user login
   */
  getAuthorizationUrl(state) {
    const scopes = [
      'profile',
      'ride_widgets',
      'request',
      'request_receipt',
      'places',
      'history'
    ].join(' ');

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes,
      state: state || 'monay_' + Date.now()
    });

    return `${this.authURL}/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(authorizationCode) {
    try {
      const response = await axios.post(
        `${this.authURL}/token`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
          code: authorizationCode
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
        scope: response.data.scope
      };
    } catch (error) {
      console.error('Uber token exchange failed:', error.response?.data || error.message);
      throw new Error('Failed to get Uber access token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(
        `${this.authURL}/token`,
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in
      };
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data || error.message);
      throw new Error('Failed to refresh Uber token');
    }
  }

  /**
   * Get available products at location
   */
  async getProducts(accessToken, latitude, longitude) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v1.2/products`,
        {
          params: {
            latitude,
            longitude
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      return response.data.products.map(product => ({
        productId: product.product_id,
        displayName: product.display_name,
        description: product.description,
        capacity: product.capacity,
        image: product.image,
        priceDetails: product.price_details,
        shared: product.shared,
        shortDescription: product.short_description
      }));
    } catch (error) {
      console.error('Get products failed:', error.response?.data || error.message);
      throw new Error('Failed to get available Uber products');
    }
  }

  /**
   * Get price estimates
   */
  async getPriceEstimates(accessToken, startLat, startLng, endLat, endLng) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v1.2/estimates/price`,
        {
          params: {
            start_latitude: startLat,
            start_longitude: startLng,
            end_latitude: endLat,
            end_longitude: endLng
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      return response.data.prices.map(price => ({
        productId: price.product_id,
        displayName: price.display_name,
        currency: price.currency_code,
        estimate: price.estimate,
        lowEstimate: price.low_estimate,
        highEstimate: price.high_estimate,
        surgeMultiplier: price.surge_multiplier,
        duration: price.duration,
        distance: price.distance
      }));
    } catch (error) {
      console.error('Price estimate failed:', error.response?.data || error.message);
      throw new Error('Failed to get price estimates');
    }
  }

  /**
   * Get time estimates
   */
  async getTimeEstimates(accessToken, startLat, startLng, productId = null) {
    try {
      const params = {
        start_latitude: startLat,
        start_longitude: startLng
      };

      if (productId) {
        params.product_id = productId;
      }

      const response = await axios.get(
        `${this.baseURL}/v1.2/estimates/time`,
        {
          params,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      return response.data.times.map(time => ({
        productId: time.product_id,
        displayName: time.display_name,
        estimate: time.estimate // ETA in seconds
      }));
    } catch (error) {
      console.error('Time estimate failed:', error.response?.data || error.message);
      throw new Error('Failed to get time estimates');
    }
  }

  /**
   * Request a ride
   */
  async requestRide(accessToken, rideParams) {
    try {
      const {
        productId,
        startLat,
        startLng,
        startAddress,
        endLat,
        endLng,
        endAddress,
        surgeConfirmationId,
        paymentMethodId,
        fareId
      } = rideParams;

      const requestBody = {
        product_id: productId,
        start_latitude: startLat,
        start_longitude: startLng,
        end_latitude: endLat,
        end_longitude: endLng
      };

      // Optional parameters
      if (startAddress) requestBody.start_address = startAddress;
      if (endAddress) requestBody.end_address = endAddress;
      if (surgeConfirmationId) requestBody.surge_confirmation_id = surgeConfirmationId;
      if (paymentMethodId) requestBody.payment_method_id = paymentMethodId;
      if (fareId) requestBody.fare_id = fareId;

      const response = await axios.post(
        `${this.baseURL}/v1.2/requests`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return this.formatRideDetails(response.data);
    } catch (error) {
      console.error('Ride request failed:', error.response?.data || error.message);

      // Handle surge pricing
      if (error.response?.status === 409 && error.response?.data?.meta?.surge_confirmation) {
        return {
          requiresSurgeConfirmation: true,
          surgeConfirmationId: error.response.data.meta.surge_confirmation.surge_confirmation_id,
          href: error.response.data.meta.surge_confirmation.href,
          surgeMultiplier: error.response.data.meta.surge_confirmation.multiplier
        };
      }

      throw new Error(error.response?.data?.message || 'Failed to request ride');
    }
  }

  /**
   * Get current ride details
   */
  async getCurrentRide(accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v1.2/requests/current`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      return this.formatRideDetails(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No current ride
      }
      console.error('Get current ride failed:', error.response?.data || error.message);
      throw new Error('Failed to get current ride');
    }
  }

  /**
   * Cancel a ride
   */
  async cancelRide(accessToken, rideId) {
    try {
      await axios.delete(
        `${this.baseURL}/v1.2/requests/${rideId || 'current'}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      return { success: true, message: 'Ride cancelled successfully' };
    } catch (error) {
      console.error('Cancel ride failed:', error.response?.data || error.message);
      throw new Error('Failed to cancel ride');
    }
  }

  /**
   * Get ride receipt
   */
  async getRideReceipt(accessToken, rideId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v1.2/requests/${rideId}/receipt`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      return {
        rideId: response.data.request_id,
        totalCharged: response.data.total_charged,
        currency: response.data.currency_code,
        duration: response.data.duration,
        distance: response.data.distance,
        distanceUnit: response.data.distance_label
      };
    } catch (error) {
      console.error('Get receipt failed:', error.response?.data || error.message);
      throw new Error('Failed to get ride receipt');
    }
  }

  /**
   * Format ride details response
   */
  formatRideDetails(ride) {
    return {
      rideId: ride.request_id,
      status: ride.status,
      product: ride.product_id,
      driver: ride.driver ? {
        name: ride.driver.name,
        phoneNumber: ride.driver.phone_number,
        rating: ride.driver.rating,
        pictureUrl: ride.driver.picture_url
      } : null,
      vehicle: ride.vehicle ? {
        make: ride.vehicle.make,
        model: ride.vehicle.model,
        licensePlate: ride.vehicle.license_plate,
        pictureUrl: ride.vehicle.picture_url
      } : null,
      location: ride.location,
      eta: ride.eta,
      pickup: {
        latitude: ride.pickup.latitude,
        longitude: ride.pickup.longitude,
        address: ride.pickup.address,
        eta: ride.pickup.eta
      },
      destination: {
        latitude: ride.destination.latitude,
        longitude: ride.destination.longitude,
        address: ride.destination.address,
        eta: ride.destination.eta
      },
      surge: ride.surge_multiplier || 1,
      shared: ride.shared || false
    };
  }

  /**
   * Get user profile
   */
  async getUserProfile(accessToken) {
    try {
      const response = await axios.get(
        `${this.baseURL}/v1.2/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      return {
        riderId: response.data.rider_id,
        firstName: response.data.first_name,
        lastName: response.data.last_name,
        email: response.data.email,
        mobile: response.data.mobile_verified ? response.data.mobile : null,
        picture: response.data.picture,
        promoCode: response.data.promo_code
      };
    } catch (error) {
      console.error('Get profile failed:', error.response?.data || error.message);
      throw new Error('Failed to get user profile');
    }
  }
}

export default new UberService();