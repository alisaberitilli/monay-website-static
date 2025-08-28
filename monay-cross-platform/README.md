# Monay Cross-Platform Ecosystem

A modern cross-platform wallet application built with React Native for mobile and Next.js for web.

## Project Structure

```
monay-cross-platform/
├── mobile/                 # React Native app (iOS + Android)
├── web/                   # Next.js web application
├── shared/                # Shared types and utilities
├── docs/                  # Documentation
└── README.md             # This file
```

## Applications

### Mobile App (React Native + Expo)
- **Platforms**: iOS and Android
- **Technology**: React Native with Expo
- **Features**: Full wallet functionality optimized for mobile

### Web App (Next.js)
- **Platform**: Web browsers
- **Technology**: Next.js with TypeScript
- **Features**: Desktop-optimized wallet management and analytics

### Shared Resources
- API types and interfaces
- Business logic utilities
- Constants and configurations
- Common validation functions

## API Integration

Both applications connect to the same backend API:
- **Dev**: `https://monay.codiantdev.com/api/`
- **Staging**: `https://monay-staging.codiantdev.com/api/`
- **Production**: `https://qa.monay.com/api/`

## Getting Started

1. **Clone and setup**:
   ```bash
   cd monay-cross-platform
   npm run setup    # Install dependencies for all projects
   ```

2. **Start development**:
   ```bash
   npm run dev      # Start both mobile and web in dev mode
   ```

3. **Individual projects**:
   ```bash
   npm run dev:mobile   # Start mobile app
   npm run dev:web      # Start web app
   ```

## Development Workflow

1. **Shared Changes**: Update types and utilities in `/shared`
2. **Mobile Development**: Work in `/mobile` for iOS/Android features
3. **Web Development**: Work in `/web` for browser-specific features
4. **API Changes**: Update API types in `/shared/types/api.ts`

## Deployment

- **Mobile**: Deploy via Expo Application Services (EAS)
- **Web**: Deploy via Vercel or similar platform
- **Shared**: Published as internal npm packages if needed