# Icon Usage Guide - @monay/icons

## Quick Start

### Installation
```bash
# In each application, add the dependency:
npm install @monay/icons@file:../../shared/icons
```

### Basic Usage

#### Import Individual Icons
```typescript
import { Shield, Users, Settings } from '@monay/icons';

// Use directly in your components
<Shield size={24} className="text-blue-500" />
<Users size={32} />
<Settings className="w-6 h-6" />
```

#### Dynamic Icon Usage
```typescript
import { Icon } from '@monay/icons';
import type { IconName } from '@monay/icons';

// Use icon by name
<Icon name="shield" size={24} />

// With TypeScript
const iconName: IconName = 'users';
<Icon name={iconName} className="text-green-500" />
```

## Common Patterns

### 1. Navigation Menu with Icons
```typescript
import { Home, Users, Settings, CreditCard } from '@monay/icons';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const NavMenu = () => (
  <nav>
    {navigation.map((item) => (
      <a key={item.name} href={item.href} className="flex items-center gap-3">
        <item.icon size={20} />
        <span>{item.name}</span>
      </a>
    ))}
  </nav>
);
```

### 2. Status Icons with Colors
```typescript
import { CheckCircle, AlertCircle, XCircle, Info } from '@monay/icons';

type Status = 'success' | 'error' | 'warning' | 'info';

const statusConfig = {
  success: { icon: CheckCircle, color: 'text-green-500' },
  error: { icon: XCircle, color: 'text-red-500' },
  warning: { icon: AlertCircle, color: 'text-yellow-500' },
  info: { icon: Info, color: 'text-blue-500' },
};

export const StatusIndicator = ({ status }: { status: Status }) => {
  const { icon: Icon, color } = statusConfig[status];
  return <Icon size={20} className={color} />;
};
```

### 3. Button with Icon
```typescript
import { Download, Plus, Trash } from '@monay/icons';

export const IconButtons = () => (
  <div className="flex gap-2">
    <button className="btn btn-primary">
      <Plus size={16} />
      <span>Add New</span>
    </button>

    <button className="btn btn-secondary">
      <Download size={16} />
      <span>Download</span>
    </button>

    <button className="btn btn-danger">
      <Trash size={16} />
      <span>Delete</span>
    </button>
  </div>
);
```

### 4. Loading State with Animated Icon
```typescript
import { Loader2 } from '@monay/icons';

export const LoadingButton = ({ loading }: { loading: boolean }) => (
  <button disabled={loading}>
    {loading && <Loader2 size={16} className="animate-spin" />}
    <span>{loading ? 'Loading...' : 'Submit'}</span>
  </button>
);
```

### 5. Card with Icon Header
```typescript
import { Shield, TrendingUp, Users } from '@monay/icons';

const metrics = [
  { label: 'Security Score', value: '98%', icon: Shield },
  { label: 'Growth Rate', value: '+12%', icon: TrendingUp },
  { label: 'Active Users', value: '1,234', icon: Users },
];

export const MetricCards = () => (
  <div className="grid grid-cols-3 gap-4">
    {metrics.map((metric) => (
      <div key={metric.label} className="card">
        <div className="flex items-center justify-between">
          <metric.icon size={24} className="text-primary" />
          <span className="text-2xl font-bold">{metric.value}</span>
        </div>
        <p className="text-sm text-gray-600">{metric.label}</p>
      </div>
    ))}
  </div>
);
```

### 6. Form with Icon Labels
```typescript
import { Mail, Lock, User, Phone } from '@monay/icons';

export const IconForm = () => (
  <form>
    <div className="input-group">
      <User size={20} className="text-gray-400" />
      <input type="text" placeholder="Username" />
    </div>

    <div className="input-group">
      <Mail size={20} className="text-gray-400" />
      <input type="email" placeholder="Email" />
    </div>

    <div className="input-group">
      <Phone size={20} className="text-gray-400" />
      <input type="tel" placeholder="Phone" />
    </div>

    <div className="input-group">
      <Lock size={20} className="text-gray-400" />
      <input type="password" placeholder="Password" />
    </div>
  </form>
);
```

### 7. Dropdown Menu with Icons
```typescript
import { Settings, User, LogOut, Bell } from '@monay/icons';

const menuItems = [
  { label: 'Profile', icon: User, action: 'profile' },
  { label: 'Settings', icon: Settings, action: 'settings' },
  { label: 'Notifications', icon: Bell, action: 'notifications' },
  { label: 'Sign Out', icon: LogOut, action: 'logout' },
];

export const UserMenu = () => (
  <div className="dropdown">
    {menuItems.map((item) => (
      <button key={item.action} className="dropdown-item">
        <item.icon size={16} />
        <span>{item.label}</span>
      </button>
    ))}
  </div>
);
```

### 8. Alert with Icon
```typescript
import { AlertCircle, CheckCircle, Info, AlertTriangle } from '@monay/icons';

type AlertType = 'info' | 'success' | 'warning' | 'error';

const alertConfig = {
  info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200' },
  success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-50', border: 'border-yellow-200' },
  error: { icon: AlertCircle, bg: 'bg-red-50', border: 'border-red-200' },
};

export const Alert = ({ type, message }: { type: AlertType; message: string }) => {
  const { icon: Icon, bg, border } = alertConfig[type];

  return (
    <div className={`p-4 rounded-lg ${bg} ${border} border`}>
      <div className="flex items-start gap-3">
        <Icon size={20} className="flex-shrink-0" />
        <p>{message}</p>
      </div>
    </div>
  );
};
```

## Icon Props Reference

All icons accept these props:

```typescript
interface IconProps {
  size?: number;          // Icon size in pixels (default: 24)
  color?: string;         // Icon color (default: 'currentColor')
  strokeWidth?: number;   // Stroke width (default: 2)
  className?: string;     // Additional CSS classes
  // Plus all standard SVG props
}
```

## Size Guidelines

```typescript
// Recommended sizes for consistency
const ICON_SIZES = {
  xs: 12,    // Tiny icons in tight spaces
  sm: 16,    // Small buttons, form inputs
  md: 20,    // Default for most uses
  lg: 24,    // Headers, important actions
  xl: 32,    // Feature cards, hero sections
  '2xl': 48, // Large feature displays
};

// Usage
<Shield size={ICON_SIZES.lg} />
```

## Color Patterns

```typescript
// Use Tailwind classes for consistency
<Shield className="text-blue-500" />        // Primary actions
<AlertCircle className="text-red-500" />    // Errors
<CheckCircle className="text-green-500" />  // Success
<AlertTriangle className="text-yellow-500" /> // Warnings
<Info className="text-gray-500" />          // Information

// Or use color prop for specific values
<Shield color="#FF5733" />
```

## Accessibility Best Practices

### 1. Add ARIA Labels
```typescript
<button aria-label="Download report">
  <Download size={20} />
</button>
```

### 2. Use with Text (Preferred)
```typescript
<button>
  <Download size={16} />
  <span>Download</span>
</button>
```

### 3. Screen Reader Text
```typescript
<button>
  <Settings size={20} />
  <span className="sr-only">Settings</span>
</button>
```

## Migration from lucide-react

### Before (lucide-react)
```typescript
import { Shield, Users } from 'lucide-react';
```

### After (@monay/icons)
```typescript
import { Shield, Users } from '@monay/icons';
```

That's it! The API is identical, just change the import source.

## Available Icons (75+)

### Core UI
Shield, Lock, Key, User, Users, UserCheck, Home, Settings, Menu, Search, Filter, Plus, Minus, X, Check, CheckCircle, XCircle

### Navigation
ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, ArrowLeftRight

### Dashboard
LayoutDashboard, Activity, TrendingUp, BarChart3, PieChart, Database, Calculator, Receipt

### Finance
DollarSign, CreditCard, Wallet, Coins, Building, Briefcase, Package, Globe, Server

### Communication
Bell, Mail, Phone, MessageSquare, HeadphonesIcon, AlertCircle, AlertTriangle, Info, Eye, EyeOff

### Actions
Download, Upload, Copy, Edit, Trash, Calendar, Clock, RefreshCw, FileText, BookOpen

### Developer
GitBranch, Layers, Zap

## TypeScript Support

```typescript
import type { IconProps, IconName } from '@monay/icons';

// Type-safe icon names
const validIcon: IconName = 'shield'; // ✅
const invalidIcon: IconName = 'foo';  // ❌ TypeScript error

// Type-safe props
const props: IconProps = {
  size: 24,
  className: 'text-blue-500',
  onClick: () => console.log('clicked'),
};
```

## Performance Tips

1. **Import only what you need** - Tree shaking will remove unused icons
2. **Use consistent sizes** - Helps with visual consistency
3. **Prefer className over inline styles** - Better performance
4. **Cache icon components** - Use React.memo for frequently rendered icons

## Troubleshooting

### Icon not found
Make sure the icon name is in PascalCase when importing:
```typescript
// ✅ Correct
import { ChevronRight } from '@monay/icons';

// ❌ Wrong
import { chevronRight } from '@monay/icons';
```

### TypeScript errors
Ensure @monay/icons is in your package.json:
```json
{
  "dependencies": {
    "@monay/icons": "file:../../shared/icons"
  }
}
```

### Icon not rendering
Check that you're passing valid props:
```typescript
// ✅ Correct
<Shield size={24} />

// ❌ Wrong - size should be number
<Shield size="24px" />
```

---

For questions or to add new icons, see `/shared/icons/Icon.tsx`