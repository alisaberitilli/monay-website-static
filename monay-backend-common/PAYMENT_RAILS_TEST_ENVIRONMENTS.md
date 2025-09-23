# Payment Rails Test Environments Guide

## 🏦 FedNow Service (Federal Reserve)

### Official Test Environment
**FedNow Pilot Program**
- **Access**: Through participating Financial Institutions (FIs)
- **Requirements**:
  - Must be a depository institution or service provider
  - Need to partner with a FedNow participant bank
  - Complete onboarding and certification process
- **Test Environment**: FedNow Test Environment (separate from production)
- **Documentation**: https://www.frbservices.org/financial-services/fednow

### How to Get Access:
1. **Direct Access** (if you're a bank):
   - Register with Federal Reserve Financial Services
   - Complete technical readiness checklist
   - Pass certification testing

2. **Indirect Access** (for fintechs like Monay):
   - Partner with a FedNow participant bank (e.g., JPMorgan Chase, Wells Fargo, US Bank)
   - Use a Banking-as-a-Service (BaaS) provider with FedNow access:
     - **Synctera**: Offers FedNow connectivity
     - **Treasury Prime**: FedNow integration
     - **Moov**: Payment rails orchestration with FedNow

### Test Environment Features:
- Simulated instant payments (< 20 seconds)
- ISO 20022 message format testing
- Request for Payment (RfP) testing
- Settlement testing
- 24/7/365 availability testing

---

## 💳 RTP Network (The Clearing House)

### Official Test Environment
**RTP Sandbox Environment**
- **Access**: Through TCH participant banks
- **Requirements**:
  - Partnership with RTP participant bank
  - Technical integration certification
- **Test Environment**: RTP Certification Environment
- **Documentation**: https://www.theclearinghouse.org/payment-systems/rtp

### How to Get Access:
1. **Direct Access** (banks only):
   - Become TCH participant
   - Complete technical integration
   - Pass certification

2. **Indirect Access** (for fintechs):
   - Partner with RTP participant banks
   - Use certified service providers:
     - **Jack Henry**: RTP gateway services
     - **FIS**: RTP connectivity
     - **Fiserv**: RTP integration
     - **Modern Treasury**: RTP API access

### Test Environment Features:
- Real-time payment simulation
- ISO 20022 messaging
- Payment status tracking
- Request for Payment
- Instant payment confirmation

---

## 🚀 Recommended Test Approach for Monay

### Phase 1: Simulation (Immediate)
```javascript
// Create local simulators for development
- FedNow Simulator Service
- RTP Simulator Service
- Configurable latency (50ms - 5s)
- Error scenario testing
- ISO 20022 message validation
```

### Phase 2: Partner Integration (1-2 months)
**Recommended Partners for Testing:**

1. **Synctera** (Recommended for startups)
   - Provides FedNow access
   - Test environment available
   - API-first approach
   - Contact: sales@synctera.com

2. **Modern Treasury**
   - RTP and FedNow connectivity
   - Sandbox environment
   - Good documentation
   - Contact: sales@moderntreasury.com

3. **Dwolla**
   - ACH and RTP access
   - Sandbox with test credentials
   - Well-documented APIs
   - Free sandbox: https://www.dwolla.com/get-started/

4. **Moov**
   - Multi-rail payment orchestration
   - Includes RTP access
   - Developer-friendly sandbox
   - Sign up: https://moov.io/

### Phase 3: Direct Bank Partnership (3-6 months)
**Banks with Developer Programs:**

1. **Cross River Bank**
   - Fintech-friendly
   - API banking platform
   - FedNow participant

2. **The Bancorp Bank**
   - Strong fintech partnerships
   - Payment innovation focus

3. **Evolve Bank & Trust**
   - Open to fintech partnerships
   - Multiple payment rails

---

## 🔧 Technical Integration Requirements

### FedNow Requirements:
- ISO 20022 message format support
- TLS 1.2+ encryption
- Digital signatures (X.509 certificates)
- 99.95% uptime SLA capability
- Sub-second processing capability

### RTP Requirements:
- ISO 20022 compliance
- Real-time message processing
- Cryptographic message signing
- 24/7 availability
- Immediate payment finality

---

## 💰 Costs

### Test Environment Costs:
- **FedNow Test**: Free for participants (need bank partnership)
- **RTP Sandbox**: Free with bank partnership
- **Third-party providers**: $500-$5,000/month for sandbox access

### Production Costs:
- **FedNow**: ~$0.045 per transaction (through bank)
- **RTP**: ~$0.045 per transaction
- **Partner markup**: Additional 0.25% - 1% typically

---

## 📞 Contacts for Test Access

### Banking-as-a-Service Providers:
1. **Synctera**: partnerships@synctera.com
2. **Treasury Prime**: sales@treasuryprime.com
3. **Synapse**: (Note: Currently in bankruptcy - avoid)

### Payment Orchestrators:
1. **Modern Treasury**: sales@moderntreasury.com
2. **Moov**: partnerships@moov.io
3. **Dwolla**: sales@dwolla.com

### Direct Bank Contacts:
1. **Cross River Bank**: fintech@crossriver.com
2. **The Bancorp**: bdteam@thebancorp.com
3. **Evolve Bank**: partnerships@getevolved.com

---

## 🎯 Recommended Next Steps for Monay

1. **Immediate (Week 1)**:
   - Sign up for Dwolla Sandbox (free, immediate access)
   - Create internal payment rail simulators
   - Implement ISO 20022 message handling

2. **Short-term (Month 1)**:
   - Contact Modern Treasury or Moov for sandbox access
   - Begin integration with their test environments
   - Test payment flows end-to-end

3. **Medium-term (Month 2-3)**:
   - Establish partnership with Cross River or Evolve Bank
   - Apply for FedNow/RTP certification through partner
   - Complete compliance requirements

4. **Long-term (Month 4-6)**:
   - Complete production certification
   - Launch with limited beta users
   - Scale to full production

---

## 🔗 Useful Resources

- **FedNow Service Provider Showcase**: https://www.frbservices.org/financial-services/fednow/service-provider-showcase
- **RTP Participant List**: https://www.theclearinghouse.org/payment-systems/rtp/institution-list
- **ISO 20022 Documentation**: https://www.iso20022.org/
- **Fed Test Environment Guide**: https://www.frbservices.org/binaries/content/assets/coreservices/fednow/fednow-pilot-program-guide.pdf

---

## ⚠️ Important Notes

1. **Regulatory Compliance**: Ensure you have proper Money Transmitter Licenses (MTL) before going live
2. **Partner Due Diligence**: Thoroughly vet any banking partner (check recent Synapse bankruptcy)
3. **Testing Timeline**: Allow 3-6 months for full certification and go-live
4. **Backup Rails**: Always have multiple payment rails (ACH as backup to RTP/FedNow)

---

*Last Updated: January 2025*
*Note: Contact information and requirements subject to change*