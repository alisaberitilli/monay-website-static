/**
 * Test file to verify icon system TypeScript compilation
 * This file tests all aspects of the icon library
 */

import React from 'react';
import {
  // Test individual icon imports
  Shield,
  Users,
  Settings,
  LayoutDashboard,
  Wallet,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  // Test Icon component for dynamic usage
  Icon,
  // Test type imports
  type IconProps,
  type IconName,
} from './Icon';

// Test 1: Individual icon usage with props
export const TestIndividualIcons: React.FC = () => {
  return (
    <div>
      <Shield size={24} className="text-blue-500" />
      <Users size={32} color="red" />
      <Settings strokeWidth={3} />
      <LayoutDashboard className="w-6 h-6" />
      <Wallet size={16} />
    </div>
  );
};

// Test 2: Dynamic icon usage
export const TestDynamicIcon: React.FC = () => {
  const iconName: IconName = 'shield';

  return (
    <div>
      <Icon name={iconName} size={24} />
      <Icon name="users" className="text-green-500" />
      <Icon name="creditCard" size={32} />
    </div>
  );
};

// Test 3: Icon with custom props
export const TestCustomProps: React.FC = () => {
  const customProps: IconProps = {
    size: 28,
    color: '#FF5733',
    strokeWidth: 2.5,
    className: 'custom-icon',
  };

  return (
    <div>
      <TrendingUp {...customProps} />
      <AlertCircle {...customProps} />
    </div>
  );
};

// Test 4: Icon array mapping
export const TestIconMapping: React.FC = () => {
  const icons: IconName[] = [
    'shield',
    'users',
    'settings',
    'wallet',
    'layoutDashboard',
  ];

  return (
    <div className="flex gap-4">
      {icons.map((name) => (
        <Icon key={name} name={name} size={24} />
      ))}
    </div>
  );
};

// Test 5: Conditional icon rendering
export const TestConditionalIcons: React.FC<{ status: 'success' | 'error' | 'warning' }> = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" />;
      case 'error':
        return <AlertCircle className="text-red-500" />;
      case 'warning':
        return <AlertCircle className="text-yellow-500" />;
    }
  };

  return <div>{getStatusIcon()}</div>;
};

// Test 6: Icon with event handlers
export const TestIconWithEvents: React.FC = () => {
  const handleClick = (iconName: string) => {
    console.log(`Clicked on ${iconName}`);
  };

  return (
    <div>
      <Shield
        size={24}
        onClick={() => handleClick('shield')}
        className="cursor-pointer hover:text-blue-500"
      />
      <Settings
        size={24}
        onClick={() => handleClick('settings')}
        className="cursor-pointer hover:text-gray-500"
      />
    </div>
  );
};

// Test 7: Type safety verification
const testTypeSafety = () => {
  // This should compile successfully
  const validIcon: IconName = 'shield';

  // TypeScript should catch invalid icon names
  // @ts-expect-error - Testing type safety
  const invalidIcon: IconName = 'invalidIconName';

  // Test IconProps type
  const props: IconProps = {
    size: 24,
    color: 'currentColor',
    strokeWidth: 2,
    className: 'test-class',
    onClick: () => console.log('clicked'),
  };

  return { validIcon, invalidIcon, props };
};

// Export all test components
export default {
  TestIndividualIcons,
  TestDynamicIcon,
  TestCustomProps,
  TestIconMapping,
  TestConditionalIcons,
  TestIconWithEvents,
  testTypeSafety,
};