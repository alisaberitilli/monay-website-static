# Monay CaaS UI/UX Design Guide
## Version 2.0 - Updated January 2025

## 🎨 Design Philosophy

The Monay CaaS platform embodies a modern, professional design language that emphasizes clarity, trust, and efficiency. Our design system features contemporary glass morphism effects, smooth animations, and a comprehensive dark mode, building upon enterprise-focused enhancements.

## 🎯 Design Principles

### 1. **Modern Elegance**
- Glass morphism with backdrop blur effects
- Gradient accents throughout the interface
- Smooth Framer Motion animations
- Contemporary rounded corners (0.75rem default)

### 2. **Trust & Security**
- Visual indicators for security features
- Clear compliance status displays
- Transparent transaction states
- Professional, banking-grade aesthetics
- Real-time blockchain status monitoring

### 3. **User-Centric**
- Vertical collapsible sidebar for better navigation
- Dark mode with system preference detection
- Minimal clicks to complete tasks
- Smart defaults and automation
- Contextual quick actions

### 4. **Responsive & Accessible**
- Mobile-first approach
- WCAG 2.1 AA compliance
- Touch-optimized interactions (min 44px tap targets)
- Keyboard navigation support
- Screen reader friendly

## 🎨 Visual Design System

### Color Palette

#### Primary Brand Colors
```css
/* Blue to Indigo Gradient - Main Brand */
--primary-gradient: linear-gradient(135deg, #3B82F6, #6366F1);
--primary-blue: #3B82F6;
--primary-indigo: #6366F1;
--primary-blue-dark: #2563EB;
--primary-indigo-dark: #4F46E5;

/* Extended Blues */
--blue-50: #EFF6FF;
--blue-100: #DBEAFE;
--blue-200: #BFDBFE;
--blue-300: #93C5FD;
--blue-400: #60A5FA;
--blue-500: #3B82F6;
--blue-600: #2563EB;
--blue-700: #1D4ED8;
--blue-800: #1E40AF;
--blue-900: #1E3A8A;
```

#### Secondary Gradients
```css
/* Success - Green to Emerald */
--success-gradient: linear-gradient(135deg, #10B981, #059669);

/* Warning - Orange to Red */
--warning-gradient: linear-gradient(135deg, #F97316, #EF4444);

/* Info - Purple to Pink */
--info-gradient: linear-gradient(135deg, #A855F7, #EC4899);

/* Neutral - Teal to Cyan */
--neutral-gradient: linear-gradient(135deg, #14B8A6, #06B6D4);
```

#### Semantic Colors
```css
/* Success States */
--success: #10B981;
--success-light: #D1FAE5;
--success-dark: #065F46;
--success-bg: rgba(16, 185, 129, 0.1);

/* Warning States */
--warning: #F59E0B;
--warning-light: #FEF3C7;
--warning-dark: #92400E;
--warning-bg: rgba(245, 158, 11, 0.1);

/* Error States */
--error: #EF4444;
--error-light: #FEE2E2;
--error-dark: #991B1B;
--error-bg: rgba(239, 68, 68, 0.1);

/* Info States */
--info: #3B82F6;
--info-light: #DBEAFE;
--info-dark: #1E40AF;
--info-bg: rgba(59, 130, 246, 0.1);
```

#### Theme Colors
```css
/* Light Mode */
--background: #FFFFFF;
--surface: #F9FAFB;
--surface-hover: #F3F4F6;
--text-primary: #111827;
--text-secondary: #6B7280;
--text-tertiary: #9CA3AF;
--border: #E5E7EB;
--border-hover: #D1D5DB;

/* Dark Mode */
--dark-background: #111827;
--dark-surface: #1F2937;
--dark-surface-hover: #374151;
--dark-text-primary: #F9FAFB;
--dark-text-secondary: #9CA3AF;
--dark-text-tertiary: #6B7280;
--dark-border: #374151;
--dark-border-hover: #4B5563;

/* Glass Morphism */
--glass-white: rgba(255, 255, 255, 0.7);
--glass-dark: rgba(31, 41, 55, 0.7);
--glass-border: rgba(255, 255, 255, 0.3);
--glass-border-dark: rgba(75, 85, 99, 0.3);
--blur-amount: 20px;
```

### Typography

#### Font Stack
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
```

#### Font Sizes & Line Heights
```css
--text-xs: 0.75rem;     /* 12px - Line height: 1rem */
--text-sm: 0.875rem;    /* 14px - Line height: 1.25rem */
--text-base: 1rem;      /* 16px - Line height: 1.5rem */
--text-lg: 1.125rem;    /* 18px - Line height: 1.75rem */
--text-xl: 1.25rem;     /* 20px - Line height: 1.75rem */
--text-2xl: 1.5rem;     /* 24px - Line height: 2rem */
--text-3xl: 1.875rem;   /* 30px - Line height: 2.25rem */
--text-4xl: 2.25rem;    /* 36px - Line height: 2.5rem */
```

#### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System
```css
--space-0: 0;
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

### Border Radius
```css
--radius-sm: 0.25rem;   /* 4px - Small elements */
--radius-md: 0.5rem;    /* 8px - Medium elements */
--radius-lg: 0.75rem;   /* 12px - Cards, buttons */
--radius-xl: 1rem;      /* 16px - Modals */
--radius-2xl: 1.5rem;   /* 24px - Large cards */
--radius-full: 9999px;  /* Pills, avatars */
```

### Shadows & Elevation
```css
/* Elevation Levels */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Glass Shadow */
--shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
```

## 📐 Layout System

### Navigation Structure
```
┌─────────────────────────────────────────────────────┐
│                    Top Header                        │
│  Logo | Page Title              Search | Theme | User│
├────────┬────────────────────────────────────────────┤
│        │                                            │
│   Nav  │              Main Content Area             │
│  Side  │                                            │
│   bar  │   ┌──────────────────────────────────┐    │
│   280  │   │                                  │    │
│   px   │   │       Page Components           │    │
│    ↕   │   │                                  │    │
│   80   │   └──────────────────────────────────┘    │
│   px   │                                            │
│        │                                            │
└────────┴────────────────────────────────────────────┘
```

### Grid System
- 12-column grid for complex layouts
- 4-column grid for cards on desktop
- 2-column grid for cards on tablet
- Single column on mobile
- Gap: 1.5rem (24px) default

### Responsive Breakpoints
```css
--screen-sm: 640px;    /* Small devices */
--screen-md: 768px;    /* Tablets */
--screen-lg: 1024px;   /* Small desktops */
--screen-xl: 1280px;   /* Desktops */
--screen-2xl: 1536px;  /* Large desktops */
```

## 🧩 Component Patterns

### Glass Morphism Cards
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.75rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

.glass-card-dark {
  background: rgba(31, 41, 55, 0.7);
  border: 1px solid rgba(75, 85, 99, 0.3);
}
```

### Button Styles
```css
/* Primary Gradient Button */
.btn-primary {
  background: linear-gradient(135deg, #3B82F6, #6366F1);
  color: white;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563EB, #4F46E5);
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* Outline Button */
.btn-outline {
  border: 1px solid var(--border);
  background: transparent;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  padding: 0.5rem 1rem;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: rgba(0, 0, 0, 0.05);
}
```

### Status Indicators
```css
/* Status Badges */
.badge-success {
  background: var(--success-bg);
  color: var(--success-dark);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-warning {
  background: var(--warning-bg);
  color: var(--warning-dark);
}

.badge-error {
  background: var(--error-bg);
  color: var(--error-dark);
}

/* Status Dots */
.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Form Controls
```css
/* Input Fields */
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--background);
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.input:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Select Dropdowns */
.select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3e%3cpath fill='%236B7280' d='M7 10l5 5 5-5z'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
```

## 🎭 Animation Guidelines

### Framer Motion Patterns
```javascript
// Container animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

// Item animation
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

// Page transition
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};
```

### Hover Effects
```css
/* Scale on hover */
.hover-scale {
  transition: transform 0.2s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
}

/* Lift on hover */
.hover-lift {
  transition: all 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.15);
}

/* Glow on hover */
.hover-glow {
  transition: all 0.2s ease;
}
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}
```

### Loading States
```css
/* Skeleton loader */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface) 0%,
    var(--surface-hover) 50%,
    var(--surface) 100%
  );
  background-size: 200% 100%;
  animation: skeleton 1.5s ease-in-out infinite;
}

@keyframes skeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Spinner */
.spinner {
  border: 2px solid var(--border);
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## 📱 Mobile Considerations

### Touch Targets
- Minimum size: 44px × 44px
- Spacing between targets: 8px minimum
- Visual feedback on touch (scale: 0.98)

### Mobile Navigation
- Collapsible sidebar slides from left
- Bottom navigation for key actions
- Swipe gestures for navigation
- Pull-to-refresh on lists

### Mobile Optimizations
```css
@media (max-width: 768px) {
  /* Stack cards vertically */
  .grid { grid-template-columns: 1fr; }
  
  /* Larger touch targets */
  .btn { min-height: 44px; }
  
  /* Simplified tables */
  .table-mobile { display: block; }
  
  /* Full-width modals */
  .modal { max-width: 100%; margin: 0; }
}
```

## ♿ Accessibility Guidelines

### Focus Management
```css
/* Focus visible */
.focus-visible:focus {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}

/* Skip to content */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary-blue);
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-to-content:focus {
  top: 0;
}
```

### ARIA Labels
- All buttons have descriptive labels
- Form inputs have associated labels
- Icons have aria-hidden or aria-label
- Live regions for dynamic content
- Proper heading hierarchy

### Color Contrast
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 minimum
- Focus indicators: 3:1 minimum

## 🎨 Icon System

### Lucide React Icons
```jsx
// Navigation icons
<Home className="h-5 w-5" />
<TrendingUp className="h-5 w-5" />
<Wallet className="h-5 w-5" />
<FileText className="h-5 w-5" />

// Action icons
<Plus className="h-4 w-4" />
<Send className="h-4 w-4" />
<Download className="h-4 w-4" />
<Filter className="h-4 w-4" />

// Status icons
<CheckCircle className="h-5 w-5 text-green-500" />
<Clock className="h-5 w-5 text-yellow-500" />
<XCircle className="h-5 w-5 text-red-500" />
<AlertCircle className="h-5 w-5 text-blue-500" />
```

## 📊 Data Visualization

### Chart Color Schemes
```javascript
const chartColors = {
  primary: ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7'],
  success: ['#10B981', '#059669', '#047857', '#065F46'],
  semantic: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'],
  gradient: [
    'rgba(59, 130, 246, 0.8)',
    'rgba(99, 102, 241, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(168, 85, 247, 0.8)'
  ]
};
```

### Chart Types
- **Area Chart**: Time-series data with gradient fill
- **Line Chart**: Trends and comparisons
- **Pie/Donut**: Distribution and percentages
- **Bar Chart**: Categorical comparisons
- **Radar Chart**: Multi-dimensional analysis

## 🚀 Performance Guidelines

### CSS Optimization
- Use CSS variables for theming
- Prefer transforms over position changes
- Minimize reflows and repaints
- Use will-change sparingly
- Implement CSS containment

### Image Optimization
- WebP format with fallbacks
- Lazy loading below fold
- Blur-up placeholders
- Responsive images with srcset
- CDN delivery

### Animation Performance
- Use GPU-accelerated properties
- Implement requestAnimationFrame
- Respect prefers-reduced-motion
- Debounce scroll handlers
- Virtual scrolling for long lists

## 📝 Component Examples

### Dashboard Stats Card
```jsx
<motion.div
  variants={itemVariants}
  whileHover={{ scale: 1.02 }}
  className="glass-card p-6 relative overflow-hidden"
>
  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-600/10" />
  <div className="relative">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Total Balance</p>
        <p className="text-3xl font-bold mt-1">$2,450,000</p>
      </div>
      <Wallet className="h-8 w-8 text-blue-600" />
    </div>
    <div className="flex items-center gap-2">
      <ArrowUpRight className="h-4 w-4 text-green-500" />
      <span className="text-sm text-green-500 font-medium">+12.5%</span>
      <span className="text-sm text-gray-500">from last month</span>
    </div>
  </div>
</motion.div>
```

### Transaction Row
```jsx
<motion.div
  whileHover={{ x: 4 }}
  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
>
  <div className="flex items-center gap-4">
    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-600/20">
      <ArrowUpRight className="h-5 w-5 text-blue-600" />
    </div>
    <div>
      <p className="font-medium">Payment to Vendor</p>
      <p className="text-sm text-gray-500">2 hours ago</p>
    </div>
  </div>
  <div className="text-right">
    <p className="font-semibold">$1,250.00</p>
    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
      Completed
    </span>
  </div>
</motion.div>
```

## 🔄 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Oct 2024 | Initial design system | Monay Team |
| 2.0 | Jan 2025 | Complete redesign with glass morphism, animations, dark mode | Claude Assistant |

---
**Document Status**: APPROVED
**Last Updated**: January 26, 2025
**Next Review**: February 2025