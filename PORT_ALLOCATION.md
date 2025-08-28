# Monay Platform Port Allocation Guide

**Version:** 1.0  
**Date:** January 2025  
**Status:** Official Port Registry

---

## Production Port Assignments

### Core Applications (3000-3005)
```
3000 → monay-website         (Public Marketing Site)
3001 → monay-backend-common  (Central API Server)
3002 → monay-admin           (Admin Dashboard)
3003 → monay-web            (User Web App)
3004 → monay-enterprise-wallet (CaaS Enterprise Wallet)
3005 → [Reserved]           (Future: Webhook Service)
```

### Database & Cache Services (Standard Ports)
```
5432 → PostgreSQL           (Primary Database)
6379 → Redis                (Cache & Session Store)
```

### Message Queue & Monitoring (If Implemented)
```
9092 → Kafka                (Message Queue)
9090 → Prometheus           (Metrics)
3006 → Grafana              (Monitoring Dashboard)
```

---

## Development Port Assignments

### Development Instances (4000-4005)
```
4000 → monay-website-dev    (Website Development)
4001 → monay-backend-dev    (Backend Development)
4002 → monay-admin-dev      (Admin Development)
4003 → monay-web-dev        (Web App Development)
4004 → [Reserved]           (Mobile API Development)
4005 → [Reserved]           (Webhook Development)
```

### Testing Instances (5000-5005)
```
5000 → monay-website-test   (Website Testing)
5001 → monay-backend-test   (Backend Testing)
5002 → monay-admin-test     (Admin Testing)
5003 → monay-web-test       (Web App Testing)
```

---

## Mobile Application Endpoints

### iOS Application
- **Development**: `http://localhost:3001`
- **Staging**: `https://api-staging.monay.com`
- **Production**: `https://api.monay.com`

### Android Application
- **Emulator**: `http://10.0.2.2:3001`
- **Device (Local)**: `http://[YOUR_IP]:3001`
- **Staging**: `https://api-staging.monay.com`
- **Production**: `https://api.monay.com`

---

## Environment Variable Configuration

### Backend Services
```bash
# monay-backend-common/.env
PORT=3001
NODE_ENV=production
API_PREFIX=/api/v1
```

### Frontend Applications
```bash
# monay-website/.env
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# monay-admin/.env
PORT=3002
NEXT_PUBLIC_API_URL=http://localhost:3001

# monay-web/.env
PORT=3003
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Port Conflict Resolution

### Check Port Availability
```bash
# Check if port is in use (Mac/Linux)
lsof -i :3001

# Kill process using port (if needed)
kill -9 $(lsof -ti:3001)

# Check all Monay ports
for port in 3000 3001 3002 3003; do
  echo "Checking port $port:"
  lsof -i :$port
done
```

### Override Ports (Emergency)
```bash
# Start with custom port
PORT=3999 npm run dev

# Or use environment file
echo "PORT=3999" >> .env.local
```

---

## Docker Compose Port Mapping

```yaml
version: '3.8'
services:
  backend:
    container_name: monay-backend
    ports:
      - "3001:3001"
  
  website:
    container_name: monay-website
    ports:
      - "3000:3000"
  
  admin:
    container_name: monay-admin
    ports:
      - "3002:3002"
  
  web:
    container_name: monay-web
    ports:
      - "3003:3003"
  
  postgres:
    container_name: monay-postgres
    ports:
      - "5432:5432"
  
  redis:
    container_name: monay-redis
    ports:
      - "6379:6379"
```

---

## Nginx Reverse Proxy Configuration

```nginx
# Production setup with subdomains
server {
    listen 80;
    server_name api.monay.com;
    location / {
        proxy_pass http://localhost:3001;
    }
}

server {
    listen 80;
    server_name monay.com www.monay.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}

server {
    listen 80;
    server_name admin.monay.com;
    location / {
        proxy_pass http://localhost:3002;
    }
}

server {
    listen 80;
    server_name app.monay.com;
    location / {
        proxy_pass http://localhost:3003;
    }
}
```

---

## Important Rules

1. **Never change production ports** without team approval
2. **Always use environment variables** for port configuration
3. **Document any port changes** in this file
4. **Check for conflicts** before starting services
5. **Use standard ports** for databases and cache services

---

## Troubleshooting

### Port Already in Use
```bash
Error: listen EADDRINUSE :::3001
```
**Solution**: 
1. Find process: `lsof -i :3001`
2. Kill process: `kill -9 [PID]`
3. Or use different port: `PORT=4001 npm run dev`

### Cannot Connect to Backend
```bash
Error: ECONNREFUSED 127.0.0.1:3001
```
**Solution**:
1. Check backend is running: `ps aux | grep node`
2. Check correct port: `echo $PORT`
3. Check firewall settings

### Mobile App Cannot Connect
**Solution**:
1. iOS Simulator: Use `localhost`
2. Android Emulator: Use `10.0.2.2`
3. Physical Device: Use computer's IP address

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-01-25 | Initial port allocation | Monay Team |

---

*This document is the single source of truth for port assignments. Any changes must be approved and documented.*