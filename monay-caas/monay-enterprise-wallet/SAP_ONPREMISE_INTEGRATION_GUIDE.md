# SAP S/4HANA On-Premise Integration Guide

## 🏢 Overview

Complete guide for connecting Monay Enterprise Wallet to on-premise SAP S/4HANA systems using four different connectivity methods.

---

## 🔌 **4 Connection Methods Available**

### 1. ⭐ **SAP Cloud Connector** (Recommended for Production)
**Best for**: Secure, enterprise-grade connectivity without VPN complexity

**How it works:**
- Install SAP Cloud Connector on your internal network
- Creates secure tunnel to SAP BTP (Business Technology Platform)
- Routes traffic from Monay → BTP → Cloud Connector → SAP

**Requirements:**
- SAP Cloud Connector installed on-premise (Java application)
- SAP BTP subaccount (free trial available)
- Network access from Cloud Connector to S/4HANA server

**Configuration Fields:**
- Cloud Connector Host (e.g., `scc.your-company.com`)
- Port (default: `8443`)
- SAP Client ID (3-digit MANDT)
- System Number (2-digit instance)
- SSL/TLS encryption (recommended: enabled)

**Setup Time**: ~30-45 minutes
**Cost**: FREE (SAP Cloud Connector is free software)

**Setup Steps:**
1. Download SAP Cloud Connector from SAP
2. Install on server with network access to S/4HANA
3. Configure connection to SAP BTP subaccount
4. Add S/4HANA as backend system
5. Expose OData services and RFC destinations
6. Configure in Monay integration portal

**Use Case**: Production environments, regulated industries, security-conscious organizations

---

### 2. 🔐 **VPN Tunnel** (IPSec/OpenVPN/WireGuard)
**Best for**: Organizations with existing VPN infrastructure

**How it works:**
- Site-to-site VPN between Monay cloud and your datacenter
- Direct encrypted tunnel for all traffic
- No intermediary services required

**Requirements:**
- VPN gateway in your network
- VPN concentrator/firewall (Cisco ASA, Palo Alto, pfSense, etc.)
- Network team to configure tunnel

**Supported VPN Types:**
- IPSec (most common)
- OpenVPN (flexible, cross-platform)
- WireGuard (modern, high performance)
- SSL VPN (application-level)

**Configuration Fields:**
- VPN Gateway Address
- VPN Type selection
- Pre-Shared Key (PSK)
- Local Subnet (Monay side)
- Remote Subnet (SAP network)
- SAP Server IP address

**Setup Time**: ~1-2 hours (with network team)
**Cost**: Typically included in existing firewall/VPN infrastructure

**Setup Steps:**
1. Coordinate with Monay DevOps for VPN parameters
2. Configure VPN gateway with provided settings
3. Establish tunnel and verify connectivity
4. Add firewall rules for SAP ports (3200, 8000, 44300)
5. Test with ping/traceroute to SAP server
6. Configure in Monay integration portal

**Use Case**: Existing VPN infrastructure, multiple system integrations, hybrid cloud

---

### 3. 🚀 **AWS Direct Connect / Azure ExpressRoute** (Enterprise Grade)
**Best for**: High-throughput, low-latency requirements, large enterprises

**How it works:**
- Dedicated fiber optic connection between cloud and datacenter
- Bypasses public internet entirely
- BGP routing for private connectivity

**Requirements:**
- AWS Direct Connect or Azure ExpressRoute circuit
- BGP peering capability
- Network team with BGP experience

**Supported Providers:**
- AWS Direct Connect
- Azure ExpressRoute
- GCP Dedicated Interconnect

**Configuration Fields:**
- Connection Provider selection
- Virtual Interface ID
- BGP ASN (Autonomous System Number)
- VLAN ID
- Peer IP Address (BGP peering)
- SAP System IP/Hostname

**Setup Time**: ~2-4 weeks (circuit provisioning)
**Cost**: $300-$3000/month (circuit fees)

**Setup Steps:**
1. Provision Direct Connect circuit with cloud provider
2. Configure virtual interface (VIF) for private connectivity
3. Set up BGP peering with Monay's cloud infrastructure
4. Advertise SAP network routes via BGP
5. Test with traceroute and latency monitoring
6. Configure in Monay integration portal

**Use Case**: High-volume invoice processing, real-time ERP sync, mission-critical integrations

---

### 4. ⚠️ **Direct Public Access** (Testing/Development Only)
**Best for**: Development, testing, quick demos (NOT production)

**How it works:**
- SAP S/4HANA accessible via public IP with strict firewall rules
- Direct HTTPS connection from Monay to SAP
- IP whitelisting for security

**Requirements:**
- Public IP or hostname for SAP server
- Firewall with IP whitelisting capability
- Strong authentication controls

**⚠️ SECURITY WARNINGS:**
- **NOT recommended for production**
- Exposes SAP to internet (even with firewall)
- Increased attack surface
- Requires strict security controls

**Configuration Fields:**
- SAP Public IP/Hostname
- OData Port (default: 44300 HTTPS)
- RFC Port (default: 3300)
- Allowed IP Ranges (CIDR notation)

**Mandatory Security Controls:**
1. **SSL/TLS Encryption**: All traffic must use HTTPS (port 44300)
2. **IP Whitelisting**: Restrict to Monay infrastructure IPs only
3. **Strong Authentication**: Complex passwords, regular rotation
4. **Firewall Rules**: Block all ports except required SAP services
5. **DDoS Protection**: Enable DDoS mitigation on gateway
6. **Audit Logging**: Enable SAP Security Audit Log (transaction SM20)

**Setup Time**: ~15-30 minutes
**Cost**: FREE (uses existing infrastructure)

**Use Case**: Development environments, quick testing, proof of concept

---

## 📊 **Connection Method Comparison**

| Method | Security | Setup Time | Cost | Throughput | Latency | Production Ready |
|--------|----------|------------|------|------------|---------|------------------|
| **SAP Cloud Connector** | ⭐⭐⭐⭐⭐ | 30-45 min | FREE | Medium | Low | ✅ Yes |
| **VPN Tunnel** | ⭐⭐⭐⭐ | 1-2 hours | Low | Medium | Medium | ✅ Yes |
| **Direct Connect** | ⭐⭐⭐⭐⭐ | 2-4 weeks | High | Very High | Very Low | ✅ Yes |
| **Direct Access** | ⭐⭐ | 15-30 min | FREE | Low | High | ❌ No (Dev only) |

---

## 🔧 **Additional Configuration (All Methods)**

### SAP-Specific Settings

**SAP Client ID (MANDT)**:
- 3-digit identifier (e.g., 100, 200, 800)
- Determines which SAP client to connect to
- Usually 100 for production, 200 for QA

**System Number**:
- 2-digit instance number (e.g., 00, 01, 02)
- Used for port calculation: HTTP=80<nr>, HTTPS=443<nr>
- Example: System 00 → Port 8000 (HTTP), 44300 (HTTPS)

**RFC Connections** (Optional):
- Enables real-time BAPI calls
- Direct table access (faster than OData)
- Requires SAProuter configuration for routing

**SAProuter String Format**:
```
/H/saprouter.company.com/S/3299/H/sap-server.company.com/S/3300
```

### Network Security

**Required SAP Ports**:
- **3200**: SAP Gateway (RFC)
- **3300**: SAPGUI (optional)
- **8000**: HTTP (dev only)
- **44300**: HTTPS/OData (primary)

**Firewall Rules**:
- Inbound: Allow Monay IPs to SAP ports
- Outbound: Allow SAP to respond to Monay
- Logging: Enable for audit trail

**SSL/TLS Configuration**:
- Minimum TLS 1.2 (TLS 1.3 recommended)
- Valid SSL certificate (not self-signed)
- Certificate chain verification

---

## 🎯 **Recommended Setup by Use Case**

### **Scenario 1: Production Enterprise**
**Requirements**: High security, reliability, compliance
**Recommended Method**: SAP Cloud Connector or Direct Connect
**Why**: Zero internet exposure, enterprise-grade security

### **Scenario 2: SMB Production**
**Requirements**: Good security, cost-effective
**Recommended Method**: VPN Tunnel or SAP Cloud Connector
**Why**: Secure, affordable, proven technology

### **Scenario 3: Development/Testing**
**Requirements**: Quick setup, flexibility
**Recommended Method**: Direct Access (with security controls)
**Why**: Fast setup, easy to change, no infrastructure

### **Scenario 4: High-Volume Processing**
**Requirements**: Low latency, high throughput
**Recommended Method**: AWS Direct Connect / Azure ExpressRoute
**Why**: Dedicated bandwidth, consistent performance

---

## 🧪 **Testing & Validation**

### Connection Test Checklist

1. **Network Connectivity**
   ```bash
   # Test from Monay infrastructure
   ping <sap-server-ip>
   traceroute <sap-server-ip>
   nc -zv <sap-server-ip> 44300
   ```

2. **OData Service Test**
   ```bash
   curl -k -u "username:password" \
     https://<sap-server>:44300/sap/opu/odata/sap/API_SALES_ORDER_SRV/\$metadata
   ```

3. **RFC Connection Test** (if enabled)
   ```bash
   # Use SAP RFC SDK or SAProuter test
   /usr/sap/rfcsdk/bin/rfcping -d <sid> -h <host> -s <sysnr>
   ```

4. **Invoice API Test**
   ```bash
   curl -X GET \
     "https://<sap-server>:44300/sap/opu/odata/sap/API_INVOICING_SRV/Invoice" \
     -H "Authorization: Basic <base64-creds>" \
     -H "Content-Type: application/json"
   ```

### Expected Results
- ✅ HTTP 200 OK for metadata requests
- ✅ Valid OData XML/JSON response
- ✅ No SSL certificate errors
- ✅ Response time < 500ms for local networks
- ✅ Authentication successful

---

## 🚨 **Troubleshooting Guide**

### Issue: Connection Timeout
**Causes**:
- Firewall blocking traffic
- Incorrect IP/port configuration
- Network routing issue

**Solutions**:
1. Verify firewall rules on both sides
2. Check network connectivity with ping/traceroute
3. Confirm SAP server is listening on configured port
4. Review VPN/Cloud Connector status

### Issue: Authentication Failed
**Causes**:
- Wrong username/password
- SAP user locked or expired
- Insufficient SAP authorizations

**Solutions**:
1. Verify credentials in SAP (transaction SU01)
2. Check user lock status
3. Assign required authorization objects (S_RFC, S_SERVICE)
4. Test with SAP GUI first to confirm credentials

### Issue: SSL Certificate Error
**Causes**:
- Self-signed certificate
- Certificate chain incomplete
- Hostname mismatch

**Solutions**:
1. Install valid SSL certificate on SAP server
2. Include intermediate certificates in chain
3. Ensure certificate CN matches hostname
4. Update certificate in Monay trust store if needed

### Issue: RFC Connection Failed
**Causes**:
- SAProuter misconfiguration
- RFC ports blocked
- Gateway service not running

**Solutions**:
1. Check SAProuter string format
2. Verify SAP Gateway service is running (transaction SMGW)
3. Test RFC connection from SAP GUI first
4. Review SAP Gateway logs (dev_rd, dev_ms)

---

## 📞 **Support & Resources**

### SAP Documentation
- SAP Cloud Connector: https://help.sap.com/viewer/cca91383641e40ffbe03bdc78f00f681
- OData Services: https://help.sap.com/viewer/odata
- SAProuter: https://support.sap.com/en/tools/connectivity-tools/saprouter.html

### Network Requirements
- Monay Infrastructure IPs: Contact DevOps for current ranges
- Required Ports: See "Network Security" section above
- Bandwidth Requirements: 10 Mbps minimum, 100 Mbps recommended

### Technical Support
- Monay Integration Support: integrations@monay.com
- SAP Basis Team: (Your SAP team contact)
- Network/Security Team: (Your network team contact)

---

## ✅ **Production Readiness Checklist**

Before going live, ensure:

- [ ] Connection method selected and configured
- [ ] Network connectivity tested and verified
- [ ] SSL/TLS certificates installed and valid
- [ ] Firewall rules documented and applied
- [ ] SAP user accounts created with proper authorizations
- [ ] RFC destinations configured (if using RFC)
- [ ] OData services activated and tested
- [ ] Backup connection method available (failover)
- [ ] Monitoring and alerting configured
- [ ] Change management process completed
- [ ] Runbook documented for operations team
- [ ] Security review completed
- [ ] Performance baseline established

---

**Last Updated**: October 2025
**Version**: 1.0
**Maintained By**: Monay Platform Team
