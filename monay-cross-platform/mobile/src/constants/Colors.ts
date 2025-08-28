// Color scheme based on your Android app
export const Colors = {
  // Primary colors
  primary: '#2196F3',
  primaryDark: '#1976D2',
  primaryLight: '#BBDEFB',
  
  // Secondary colors  
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFE0B2',
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  
  // Gray scale
  gray50: '#FAFAFA',
  gray100: '#F5F5F5', 
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Text colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  textHint: '#9E9E9E',
  
  // Component colors
  border: '#E0E0E0',
  divider: '#EEEEEE',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Button colors
  buttonPrimary: '#2196F3',
  buttonSecondary: '#E0E0E0',
  buttonDisabled: '#BDBDBD',
  
  // Input colors
  inputBackground: '#FFFFFF',
  inputBorder: '#E0E0E0',
  inputFocused: '#2196F3',
  inputError: '#F44336',
  
  // Card colors
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  
  // Transaction colors
  income: '#4CAF50',
  expense: '#F44336',
  pending: '#FF9800',
  
  // Gradient colors
  gradientPrimary: ['#2196F3', '#1976D2'],
  gradientSecondary: ['#FF9800', '#F57C00'],
  gradientSuccess: ['#4CAF50', '#388E3C'],
  gradientError: ['#F44336', '#D32F2F'],
  
  // Wallet specific
  walletCardGradient: ['#667eea', '#764ba2'],
  balancePositive: '#4CAF50',
  balanceNegative: '#F44336',
  
  // Status bar
  statusBarBackground: '#1976D2',
  statusBarContent: 'light-content',
} as const;

export type ColorKey = keyof typeof Colors;