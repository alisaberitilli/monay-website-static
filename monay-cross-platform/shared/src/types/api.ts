// API Types based on your Android application
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  userType: 'user' | 'merchant' | 'secondary';
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  type: 'send' | 'receive' | 'deposit' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  userId: string;
  cardNumber: string;
  last4Digits: string;
  cardHolderName: string;
  expiryMonth: string;
  expiryYear: string;
  cardType: string;
  bankName: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  routingNumber?: string;
  ifscCode?: string;
  swiftCode?: string;
  accountType: 'savings' | 'checking';
  isVerified: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  isMonayUser: boolean;
  avatarUrl?: string;
}

// API Request/Response Types
export interface LoginRequest {
  email?: string;
  mobileNumber?: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
  message: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  userType: 'user' | 'merchant';
  countryCode: string;
}

export interface SignupResponse {
  success: boolean;
  data: {
    user: User;
    requiresVerification: boolean;
  };
  message: string;
}

export interface SendMoneyRequest {
  recipientId: string;
  amount: number;
  description?: string;
  pin: string;
}

export interface SendMoneyResponse {
  success: boolean;
  data: {
    transaction: Transaction;
    remainingBalance: number;
  };
  message: string;
}

export interface GetTransactionsResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
  message: string;
}

export interface GetWalletResponse {
  success: boolean;
  data: {
    wallet: Wallet;
    recentTransactions: Transaction[];
  };
  message: string;
}

// Error Response Type
export interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
  };
}

// Generic API Response
export type ApiResponse<T> = {
  success: true;
  data: T;
  message: string;
} | ApiError;