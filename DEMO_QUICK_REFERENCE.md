# Demo Quick Reference Card

**Demo Date:** Tomorrow | **Status:** ✅ READY

---

## 🚀 Start All Services (One Command)

```bash
# Terminal 1: Backend
cd ~/Data/0ProductBuild/monay/monay-backend-common && npm run dev

# Terminal 2: Consumer Wallet
cd ~/Data/0ProductBuild/monay/monay-cross-platform/web && npm run dev

# Terminal 3: Enterprise Wallet
cd ~/Data/0ProductBuild/monay/monay-caas/monay-enterprise-wallet && npm run dev

# Terminal 4: Admin Portal (if needed)
cd ~/Data/0ProductBuild/monay/monay-admin && npm run dev
```

---

## 🌐 Application URLs

| Application | URL | Port |
|------------|-----|------|
| Backend API | http://localhost:3001 | 3001 |
| Admin Portal | http://localhost:3002 | 3002 |
| Consumer Wallet | http://localhost:3003 | 3003 |
| Enterprise Wallet | http://localhost:3007 | 3007 |

---

## 🔑 Demo Credentials

### Platform Admin (Works Everywhere)
```
Email: admin@monay.com
Password: admin123
Balance: $2,500.00
```

---

## 🎬 Demo Script (5 Minutes)

### 1. Cross-Rail Payment (2 min)
```
1. Open Consumer Wallet: http://localhost:3003
2. Login as admin@monay.com
3. Dashboard → See wallet addresses (Solana + Base L2)
4. Click "Send/Transfer"
5. Paste Enterprise Base L2 address
6. Amount: $100
7. Confirm → See success
8. Go to Transactions → See cross-rail transfer
```

### 2. Registration Demo (1.5 min)
```
CONSUMER:
1. http://localhost:3003/auth/register-with-account-type
2. Fill form → Submit → Account created

ENTERPRISE:
3. http://localhost:3007/auth/register
4. Fill form with org name → Submit → Account created
```

### 3. Enterprise Features (1.5 min)
```
1. Login to http://localhost:3007
2. Navigate to Payments → Payroll
3. Show payroll processing UI
4. Navigate to Payments → Vendors
5. Show vendor invoice management
6. Navigate to Payments → Cross-Border
7. Show international payments
```

---

## 🧪 Quick Test Before Demo

```bash
# Run this 5 minutes before demo
/tmp/test-all-registrations.sh

# Should see: ✅ All 12 tests passing
```

---

## ⚡ Quick Port Check

```bash
for port in 3001 3002 3003 3007; do
  lsof -ti :$port >/dev/null && echo "✅ $port" || echo "❌ $port"
done
```

---

## 🔧 Emergency Reset

### Kill Everything
```bash
pkill -9 node
lsof -ti :3001 | xargs kill -9 2>/dev/null
lsof -ti :3003 | xargs kill -9 2>/dev/null
lsof -ti :3007 | xargs kill -9 2>/dev/null
```

### Restart Services
```bash
cd ~/Data/0ProductBuild/monay/monay-backend-common && npm run dev &
sleep 3
cd ~/Data/0ProductBuild/monay/monay-cross-platform/web && npm run dev &
cd ~/Data/0ProductBuild/monay/monay-caas/monay-enterprise-wallet && npm run dev &
```

---

## 📊 Key Demo Points

### Technical Highlights
- ✅ **Dual-Rail Architecture** (Solana + Base L2)
- ✅ **Cross-Rail Transfers** (Instant)
- ✅ **12 Registration Types** (All working)
- ✅ **Enterprise Features** (Payroll, Vendors, Cross-border)

### Business Value
- ✅ **Consumer-Friendly** (Simple UX)
- ✅ **Enterprise-Ready** (Full feature set)
- ✅ **Compliance-Built-In** (Validation, audit trails)
- ✅ **Scalable** (Multi-tenant architecture)

---

## 📝 Talking Points

1. **"We support both consumer and enterprise use cases"**
   - Show Consumer Wallet for individuals
   - Show Enterprise Wallet for businesses

2. **"Cross-rail payments work seamlessly"**
   - Demonstrate Solana → Base L2 transfer
   - Show transaction in both wallets

3. **"Complete payment management for enterprises"**
   - Show Payroll processing
   - Show Vendor payments
   - Show Cross-border capabilities

4. **"Comprehensive onboarding"**
   - 12 different registration scenarios
   - All validation working
   - Great user experience

---

## 🎯 Success Checklist

Before starting demo:
- [ ] All 4 services running
- [ ] Port check passes (3001, 3003, 3007)
- [ ] Can login to Consumer Wallet
- [ ] Can login to Enterprise Wallet
- [ ] Ran `/tmp/test-all-registrations.sh` successfully
- [ ] Browser tabs ready
- [ ] Screen sharing tested

---

## 📞 Support

**Full Documentation:**
- `/monay/DEMO_READY_SUMMARY.md`
- `/monay-backend-common/REGISTRATION_TESTING_COMPLETE.md`

**Test Scripts:**
- `/tmp/test-all-registrations.sh`
- `/tmp/test-consumer-registrations.sh`
- `/tmp/test-enterprise-registrations.sh`

---

## ✨ Confidence Boosters

- ✅ **12/12 tests passing**
- ✅ **Cross-rail transfer validated**
- ✅ **All UIs polished**
- ✅ **Error handling robust**
- ✅ **Demo script ready**

**You've got this! 🚀**
