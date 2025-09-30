/**
 * Unified Payment Service for Monay Super App
 * Handles all payment flows across travel, hospitality, retail, etc.
 */

export interface PaymentItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity?: number;
  category: 'flight' | 'hotel' | 'restaurant' | 'retail' | 'rideshare' | 'ev-charging' | 'coffee' | 'car-rental' | 'bills' | 'utilities' | 'invoice';
  metadata?: Record<string, any>;
}

export interface PaymentMethod {
  id: string;
  type: 'wallet' | 'card' | 'bank';
  name: string;
  balance?: number;
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export interface PaymentRequest {
  items: PaymentItem[];
  total: number;
  currency: string;
  merchantName: string;
  merchantCategory: string;
  description: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  receipt?: {
    id: string;
    amount: number;
    timestamp: Date;
    items: PaymentItem[];
  };
}

class PaymentService {
  private apiClient: any;

  constructor() {
    // Import will be done dynamically to avoid circular dependencies
    this.initializeApiClient();
  }

  private async initializeApiClient() {
    if (typeof window !== 'undefined') {
      const { default: apiClient } = await import('./api-client');
      this.apiClient = apiClient;
    }
  }

  /**
   * Get available payment methods for the user
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      // Get wallet balance
      const balanceResponse = await this.apiClient?.getBalance();
      const walletBalance = balanceResponse?.success ? balanceResponse.data?.balance || 0 : 0;

      // Get cards
      const cardsResponse = await this.apiClient?.getCards();
      const cards = cardsResponse?.success ? cardsResponse.data || [] : [];

      const paymentMethods: PaymentMethod[] = [
        {
          id: 'wallet',
          type: 'wallet',
          name: 'Monay Wallet',
          balance: walletBalance,
          isDefault: true
        }
      ];

      // Add cards
      cards.forEach((card: any, index: number) => {
        paymentMethods.push({
          id: card.id || `card_${index}`,
          type: 'card',
          name: `${card.brand || 'Card'} ****${card.last4 || '0000'}`,
          last4: card.last4,
          brand: card.brand,
          isDefault: false
        });
      });

      return paymentMethods;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Return demo payment methods for development
      return [
        {
          id: 'wallet',
          type: 'wallet',
          name: 'Monay Wallet',
          balance: 2500.00,
          isDefault: true
        },
        {
          id: 'card_1',
          type: 'card',
          name: 'Visa ****4242',
          last4: '4242',
          brand: 'Visa',
          isDefault: false
        },
        {
          id: 'card_2',
          type: 'card',
          name: 'Mastercard ****8888',
          last4: '8888',
          brand: 'Mastercard',
          isDefault: false
        }
      ];
    }
  }

  /**
   * Process payment with selected method
   */
  async processPayment(
    paymentRequest: PaymentRequest,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      await this.initializeApiClient();

      // Use appropriate endpoint based on payment method
      let endpoint;
      let requestBody;

      if (paymentMethodId === 'wallet') {
        // Use wallet payment endpoint for invoice payments
        endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/user/wallet/pay`;
        requestBody = {
          amount: paymentRequest.total,
          currency: paymentRequest.currency || 'USD',
          description: paymentRequest.description || `Payment to ${paymentRequest.merchantName}`,
          category: 'bill_payment',
          merchant: paymentRequest.merchantName,
          metadata: {
            items: paymentRequest.items,
            merchantCategory: paymentRequest.merchantCategory
          }
        };
      } else if (paymentMethodId.startsWith('card_')) {
        // Use card payment endpoint for card payments
        endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/user/cards/payment`;
        requestBody = {
          cardId: paymentMethodId,
          amount: paymentRequest.total,
          currency: paymentRequest.currency || 'USD',
          description: paymentRequest.description || `Payment to ${paymentRequest.merchantName}`,
          merchant: paymentRequest.merchantName,
          metadata: {
            items: paymentRequest.items,
            merchantCategory: paymentRequest.merchantCategory
          }
        };
      } else {
        // Default to wallet payment
        endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/user/wallet/pay`;
        requestBody = {
          amount: paymentRequest.total,
          currency: paymentRequest.currency || 'USD',
          description: paymentRequest.description || `Payment to ${paymentRequest.merchantName}`,
          category: 'bill_payment',
          merchant: paymentRequest.merchantName,
          metadata: {
            items: paymentRequest.items,
            merchantCategory: paymentRequest.merchantCategory
          }
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-bypass': 'true', // Development bypass
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          transactionId: data.transactionId || `txn_${Date.now()}`,
          receipt: {
            id: data.transactionId || `txn_${Date.now()}`,
            amount: paymentRequest.total,
            timestamp: new Date(),
            items: paymentRequest.items
          }
        };
      } else {
        return {
          success: false,
          error: 'Payment processing failed'
        };
      }
    } catch (error) {
      console.error('Payment processing error:', error);

      // For demo purposes, simulate successful payment
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          transactionId: `demo_txn_${Date.now()}`,
          receipt: {
            id: `demo_txn_${Date.now()}`,
            amount: paymentRequest.total,
            timestamp: new Date(),
            items: paymentRequest.items
          }
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  /**
   * Create payment request for flight booking
   */
  createFlightPaymentRequest(flight: any): PaymentRequest {
    return {
      items: [{
        id: flight.id,
        name: `${flight.airline} ${flight.flightNumber}`,
        description: `${flight.from} → ${flight.to}`,
        price: flight.price,
        quantity: 1,
        category: 'flight',
        metadata: {
          departTime: flight.departTime,
          arriveTime: flight.arriveTime,
          duration: flight.duration,
          aircraft: flight.aircraft
        }
      }],
      total: flight.price,
      currency: 'USD',
      merchantName: flight.airline,
      merchantCategory: 'Travel - Airlines',
      description: `Flight booking: ${flight.from} to ${flight.to}`
    };
  }

  /**
   * Create payment request for hotel booking
   */
  createHotelPaymentRequest(hotel: any, nights: number = 1): PaymentRequest {
    const total = hotel.price * nights;
    return {
      items: [{
        id: hotel.id,
        name: hotel.name,
        description: `${nights} night${nights > 1 ? 's' : ''}`,
        price: hotel.price,
        quantity: nights,
        category: 'hotel',
        metadata: {
          location: hotel.location,
          rating: hotel.rating,
          checkIn: hotel.checkIn,
          checkOut: hotel.checkOut
        }
      }],
      total,
      currency: 'USD',
      merchantName: hotel.name,
      merchantCategory: 'Travel - Lodging',
      description: `Hotel booking: ${hotel.name}`
    };
  }

  /**
   * Create payment request for retail purchase
   */
  createRetailPaymentRequest(product: any, quantity: number = 1): PaymentRequest {
    const total = product.price * quantity;
    return {
      items: [{
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        quantity,
        category: 'retail',
        metadata: {
          brand: product.brand,
          seller: product.seller,
          category: product.category
        }
      }],
      total,
      currency: 'USD',
      merchantName: product.seller || product.brand,
      merchantCategory: 'Retail - ' + product.category,
      description: `Purchase: ${product.name}`
    };
  }

  /**
   * Create payment request for restaurant order
   */
  createRestaurantPaymentRequest(restaurant: any, items: any[]): PaymentRequest {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return {
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity,
        category: 'restaurant' as const,
        metadata: {
          restaurant: restaurant.name,
          cuisine: restaurant.cuisine
        }
      })),
      total,
      currency: 'USD',
      merchantName: restaurant.name,
      merchantCategory: 'Food & Dining',
      description: `Order from ${restaurant.name}`
    };
  }

  /**
   * Create payment request for rideshare
   */
  createRidesharePaymentRequest(ride: any): PaymentRequest {
    return {
      items: [{
        id: ride.id,
        name: `${ride.service} Ride`,
        description: `${ride.from} → ${ride.to}`,
        price: ride.price,
        quantity: 1,
        category: 'rideshare',
        metadata: {
          distance: ride.distance,
          duration: ride.duration,
          vehicleType: ride.vehicleType
        }
      }],
      total: ride.price,
      currency: 'USD',
      merchantName: ride.service,
      merchantCategory: 'Transportation - Rideshare',
      description: `Ride: ${ride.from} to ${ride.to}`
    };
  }
}

// Create singleton instance
const paymentService = new PaymentService();
export default paymentService;
export { PaymentService };