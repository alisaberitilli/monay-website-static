/**
 * SAP Connector Service
 * Integrates with SAP ERP systems via RFC, BAPI, and IDoc
 * Created: 2025-01-21
 */

const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');

class SAPConnector extends EventEmitter {
  constructor() {
    super();

    this.connectionStatus = {
      DISCONNECTED: 'DISCONNECTED',
      CONNECTING: 'CONNECTING',
      CONNECTED: 'CONNECTED',
      ERROR: 'ERROR'
    };

    this.status = this.connectionStatus.DISCONNECTED;

    // SAP system configuration
    this.sapConfig = {
      ashost: process.env.SAP_HOST || 'sap.monay.com',
      sysnr: process.env.SAP_SYSTEM_NUMBER || '00',
      client: process.env.SAP_CLIENT || '100',
      user: process.env.SAP_USER || 'RFC_USER',
      passwd: process.env.SAP_PASSWORD || '',
      lang: process.env.SAP_LANGUAGE || 'EN',
      pool_size: 10,
      peak_limit: 50
    };

    // BAPI function modules
    this.bapiModules = {
      GL_POSTING: 'BAPI_ACC_DOCUMENT_POST',
      GL_CHECK: 'BAPI_ACC_DOCUMENT_CHECK',
      CUSTOMER_CREATE: 'BAPI_CUSTOMER_CREATEFROMDATA1',
      VENDOR_CREATE: 'BAPI_VENDOR_CREATEFROMDATA1',
      COST_CENTER_READ: 'BAPI_COSTCENTER_GETDETAIL',
      PROFIT_CENTER_READ: 'BAPI_PROFITCENTER_GETDETAIL',
      MATERIAL_GET: 'BAPI_MATERIAL_GET_ALL',
      PAYMENT_POST: 'BAPI_ACC_INVOICE_RECEIPT_POST',
      COMMIT: 'BAPI_TRANSACTION_COMMIT',
      ROLLBACK: 'BAPI_TRANSACTION_ROLLBACK'
    };

    // IDoc types
    this.iDocTypes = {
      FIDCCP02: 'FI Document Posting',
      CREMAS04: 'Vendor Master',
      DEBMAS06: 'Customer Master',
      MATMAS05: 'Material Master',
      ORDERS05: 'Purchase Order',
      INVOIC02: 'Invoice'
    };

    // Field mapping for SAP
    this.fieldMapping = {
      customer: {
        internal: 'customerId',
        sap: 'KUNNR'
      },
      vendor: {
        internal: 'vendorId',
        sap: 'LIFNR'
      },
      material: {
        internal: 'productId',
        sap: 'MATNR'
      },
      glAccount: {
        internal: 'accountCode',
        sap: 'HKONT'
      },
      costCenter: {
        internal: 'costCenter',
        sap: 'KOSTL'
      },
      profitCenter: {
        internal: 'profitCenter',
        sap: 'PRCTR'
      },
      companyCode: {
        internal: 'organizationId',
        sap: 'BUKRS'
      }
    };

    // Government benefit program mapping to SAP
    this.benefitToSAPMapping = {
      'SNAP': { glAccount: '2120100', costCenter: 'GOV001' },
      'TANF': { glAccount: '2120200', costCenter: 'GOV002' },
      'MEDICAID': { glAccount: '2120300', costCenter: 'GOV003' },
      'WIC': { glAccount: '2120400', costCenter: 'GOV004' },
      'SECTION_8': { glAccount: '2120500', costCenter: 'GOV005' },
      'LIHEAP': { glAccount: '2120600', costCenter: 'GOV006' },
      'UNEMPLOYMENT': { glAccount: '2120700', costCenter: 'GOV007' },
      'SCHOOL_CHOICE': { glAccount: '2120800', costCenter: 'GOV008' },
      'CHILD_CARE': { glAccount: '2120900', costCenter: 'GOV009' },
      'VETERANS': { glAccount: '2121000', costCenter: 'GOV010' },
      'TRANSPORTATION': { glAccount: '2121100', costCenter: 'GOV011' },
      'EMERGENCY_RENTAL': { glAccount: '2121200', costCenter: 'GOV012' },
      'FREE_MEALS': { glAccount: '2121300', costCenter: 'GOV013' },
      'EITC': { glAccount: '2121400', costCenter: 'GOV014' }
    };
  }

  /**
   * Connect to SAP system
   */
  async connect() {
    try {
      this.status = this.connectionStatus.CONNECTING;

      // Simulate RFC connection (in production, use node-rfc)
      await this.simulateRFCConnection();

      this.status = this.connectionStatus.CONNECTED;
      this.emit('connected', { system: this.sapConfig.ashost });

      return { success: true, status: this.status };
    } catch (error) {
      this.status = this.connectionStatus.ERROR;
      console.error('SAP connection error:', error);
      throw error;
    }
  }

  /**
   * Post GL document to SAP
   */
  async postGLDocument(journalEntry) {
    try {
      // Prepare BAPI structure
      const documentHeader = {
        USERNAME: journalEntry.createdBy,
        COMP_CODE: this.mapToSAP('companyCode', journalEntry.organizationId),
        DOC_DATE: this.formatSAPDate(journalEntry.date),
        PSTNG_DATE: this.formatSAPDate(new Date()),
        DOC_TYPE: 'SA', // Standard document type
        REF_DOC_NO: journalEntry.reference || journalEntry.id,
        HEADER_TXT: journalEntry.description
      };

      const accountGLItems = [];
      const currencyAmounts = [];

      // Process journal lines
      for (let i = 0; i < journalEntry.lines.length; i++) {
        const line = journalEntry.lines[i];
        const itemNo = (i + 1).toString().padStart(6, '0');

        accountGLItems.push({
          ITEMNO_ACC: itemNo,
          GL_ACCOUNT: this.mapToSAP('glAccount', line.accountCode),
          ITEM_TEXT: line.description,
          DOC_TYPE: 'SA',
          COMP_CODE: this.mapToSAP('companyCode', journalEntry.organizationId),
          PSTNG_DATE: this.formatSAPDate(journalEntry.date),
          VALUE_DATE: this.formatSAPDate(journalEntry.date),
          COSTCENTER: line.costCenter || '',
          PROFIT_CTR: line.profitCenter || ''
        });

        currencyAmounts.push({
          ITEMNO_ACC: itemNo,
          CURRENCY: line.currency || 'USD',
          AMT_DOCCUR: line.debitAmount > 0 ? line.debitAmount : -line.creditAmount,
          AMT_BASE: line.debitAmount > 0 ? line.debitAmount : -line.creditAmount
        });
      }

      // Call BAPI
      const result = await this.callBAPI(this.bapiModules.GL_POSTING, {
        DOCUMENTHEADER: documentHeader,
        ACCOUNTGL: accountGLItems,
        CURRENCYAMOUNT: currencyAmounts
      });

      if (result.success) {
        // Commit transaction
        await this.callBAPI(this.bapiModules.COMMIT);

        // Store SAP document number
        await this.storeSAPDocument({
          internalId: journalEntry.id,
          sapDocNumber: result.documentNumber,
          fiscalYear: result.fiscalYear,
          companyCode: documentHeader.COMP_CODE
        });

        this.emit('document_posted', {
          journalEntryId: journalEntry.id,
          sapDocument: result.documentNumber
        });

        return {
          success: true,
          documentNumber: result.documentNumber,
          fiscalYear: result.fiscalYear
        };
      } else {
        // Rollback transaction
        await this.callBAPI(this.bapiModules.ROLLBACK);
        throw new Error(result.message || 'SAP posting failed');
      }

    } catch (error) {
      console.error('SAP GL posting error:', error);
      throw error;
    }
  }

  /**
   * Process benefit disbursement in SAP
   */
  async processBenefitDisbursement(transaction) {
    try {
      const sapMapping = this.benefitToSAPMapping[transaction.programType];

      if (!sapMapping) {
        throw new Error(`No SAP mapping for program: ${transaction.programType}`);
      }

      // Create accounting document
      const documentHeader = {
        USERNAME: 'BENEFIT_SYS',
        COMP_CODE: '1000', // Default company code
        DOC_DATE: this.formatSAPDate(transaction.date),
        PSTNG_DATE: this.formatSAPDate(new Date()),
        DOC_TYPE: 'KZ', // Vendor payment
        REF_DOC_NO: transaction.id,
        HEADER_TXT: `${transaction.programType} disbursement`
      };

      const accountGLItems = [
        {
          ITEMNO_ACC: '000001',
          GL_ACCOUNT: sapMapping.glAccount,
          ITEM_TEXT: `${transaction.programType} benefit payment`,
          COMP_CODE: '1000',
          PSTNG_DATE: this.formatSAPDate(new Date()),
          COSTCENTER: sapMapping.costCenter
        },
        {
          ITEMNO_ACC: '000002',
          GL_ACCOUNT: '1000100', // Cash account
          ITEM_TEXT: 'Cash disbursement',
          COMP_CODE: '1000',
          PSTNG_DATE: this.formatSAPDate(new Date())
        }
      ];

      const currencyAmounts = [
        {
          ITEMNO_ACC: '000001',
          CURRENCY: 'USD',
          AMT_DOCCUR: transaction.amount,
          AMT_BASE: transaction.amount
        },
        {
          ITEMNO_ACC: '000002',
          CURRENCY: 'USD',
          AMT_DOCCUR: -transaction.amount,
          AMT_BASE: -transaction.amount
        }
      ];

      const result = await this.callBAPI(this.bapiModules.GL_POSTING, {
        DOCUMENTHEADER: documentHeader,
        ACCOUNTGL: accountGLItems,
        CURRENCYAMOUNT: currencyAmounts
      });

      if (result.success) {
        await this.callBAPI(this.bapiModules.COMMIT);
        return {
          success: true,
          sapDocument: result.documentNumber
        };
      } else {
        await this.callBAPI(this.bapiModules.ROLLBACK);
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('SAP benefit disbursement error:', error);
      throw error;
    }
  }

  /**
   * Create or update customer master in SAP
   */
  async syncCustomerMaster(customer) {
    try {
      const customerData = {
        CUSTOMERNO: this.mapToSAP('customer', customer.id),
        CUSTOMER_GENERAL: {
          NAME1: customer.firstName || '',
          NAME2: customer.lastName || '',
          STREET: customer.address?.street || '',
          CITY: customer.address?.city || '',
          POSTL_CODE: customer.address?.zipCode || '',
          COUNTRY: customer.address?.country || 'US',
          TELEPHONE: customer.phone || '',
          EMAIL: customer.email || ''
        },
        CUSTOMER_COMPANY: {
          COMP_CODE: '1000',
          ACCOUNT_GROUP: 'ZBEN', // Beneficiary account group
          RECON_ACCOUNT: '1100100' // AR reconciliation account
        }
      };

      const result = await this.callBAPI(
        this.bapiModules.CUSTOMER_CREATE,
        customerData
      );

      if (result.success) {
        await this.callBAPI(this.bapiModules.COMMIT);

        // Store mapping
        await this.storeCustomerMapping({
          internalId: customer.id,
          sapCustomerNo: result.customerNumber
        });

        return {
          success: true,
          customerNumber: result.customerNumber
        };
      } else {
        await this.callBAPI(this.bapiModules.ROLLBACK);
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('SAP customer sync error:', error);
      throw error;
    }
  }

  /**
   * Read cost center details from SAP
   */
  async getCostCenterDetails(costCenter) {
    try {
      const result = await this.callBAPI(this.bapiModules.COST_CENTER_READ, {
        COSTCENTER: costCenter,
        CONTROLLINGAREA: '1000',
        DATE: this.formatSAPDate(new Date())
      });

      if (result.success) {
        return {
          costCenter: result.costCenterData.COSTCENTER,
          name: result.costCenterData.NAME,
          description: result.costCenterData.DESCRIPTION,
          responsiblePerson: result.costCenterData.PERSON_IN_CHARGE,
          validFrom: result.costCenterData.VALID_FROM,
          validTo: result.costCenterData.VALID_TO
        };
      } else {
        throw new Error(`Cost center ${costCenter} not found`);
      }

    } catch (error) {
      console.error('SAP cost center read error:', error);
      throw error;
    }
  }

  /**
   * Process IDoc for asynchronous integration
   */
  async processIDoc(iDocType, data) {
    try {
      const iDoc = {
        id: uuidv4(),
        type: iDocType,
        control: {
          IDOCTYP: iDocType,
          MESTYP: this.getMessageType(iDocType),
          SNDPOR: 'MONAYSYS',
          SNDPRT: 'LS',
          SNDPRN: 'MONAY',
          RCVPOR: 'SAPCLNT100',
          RCVPRT: 'LS',
          RCVPRN: 'SAP'
        },
        data: data,
        status: 'CREATED',
        createdAt: new Date()
      };

      // Process based on IDoc type
      switch (iDocType) {
        case 'FIDCCP02':
          iDoc.segments = this.buildFIDCCP02Segments(data);
          break;
        case 'DEBMAS06':
          iDoc.segments = this.buildDEBMAS06Segments(data);
          break;
        case 'CREMAS04':
          iDoc.segments = this.buildCREMAS04Segments(data);
          break;
      }

      // Send IDoc to SAP
      const result = await this.sendIDocToSAP(iDoc);

      if (result.success) {
        iDoc.status = 'SENT';
        iDoc.sapIDocNumber = result.iDocNumber;

        // Store IDoc record
        await this.storeIDocRecord(iDoc);

        this.emit('idoc_processed', {
          iDocId: iDoc.id,
          sapIDocNumber: result.iDocNumber
        });

        return {
          success: true,
          iDocNumber: result.iDocNumber
        };
      } else {
        iDoc.status = 'ERROR';
        throw new Error(result.message);
      }

    } catch (error) {
      console.error('IDoc processing error:', error);
      throw error;
    }
  }

  /**
   * Build FI document posting IDoc segments
   */
  buildFIDCCP02Segments(data) {
    const segments = [];

    // Header segment
    segments.push({
      SEGMENT: 'E1FIKPF',
      FIELDS: {
        BUKRS: data.companyCode,
        BLDAT: this.formatSAPDate(data.documentDate),
        BUDAT: this.formatSAPDate(data.postingDate),
        BLART: data.documentType || 'SA',
        WAERS: data.currency || 'USD',
        XBLNR: data.reference,
        BKTXT: data.headerText
      }
    });

    // Line item segments
    data.lineItems.forEach((item, index) => {
      segments.push({
        SEGMENT: 'E1FISEG',
        FIELDS: {
          BUZEI: (index + 1).toString().padStart(3, '0'),
          BSCHL: item.postingKey,
          HKONT: item.glAccount,
          WRBTR: item.amount,
          KOSTL: item.costCenter,
          PRCTR: item.profitCenter,
          SGTXT: item.text
        }
      });
    });

    return segments;
  }

  /**
   * Monitor SAP connection health
   */
  async healthCheck() {
    try {
      if (this.status !== this.connectionStatus.CONNECTED) {
        await this.connect();
      }

      // Ping SAP system
      const result = await this.callRFC('RFC_PING');

      return {
        status: 'HEALTHY',
        connected: true,
        system: this.sapConfig.ashost,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        status: 'UNHEALTHY',
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Batch process multiple GL documents
   */
  async batchPostGLDocuments(documents) {
    const results = {
      successful: [],
      failed: [],
      totalProcessed: 0
    };

    for (const doc of documents) {
      try {
        const result = await this.postGLDocument(doc);
        results.successful.push({
          internalId: doc.id,
          sapDocument: result.documentNumber
        });
      } catch (error) {
        results.failed.push({
          internalId: doc.id,
          error: error.message
        });
      }
      results.totalProcessed++;
    }

    return results;
  }

  /**
   * Map internal field to SAP field
   */
  mapToSAP(fieldType, internalValue) {
    const mapping = this.fieldMapping[fieldType];
    if (!mapping) return internalValue;

    // Additional transformation logic based on field type
    switch (fieldType) {
      case 'companyCode':
        return '1000'; // Default company code
      case 'glAccount':
        return internalValue.padStart(10, '0');
      case 'costCenter':
        return internalValue ? internalValue.padStart(10, '0') : '';
      default:
        return internalValue;
    }
  }

  /**
   * Format date for SAP
   */
  formatSAPDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0].replace(/-/g, '');
  }

  /**
   * Simulate RFC connection (replace with actual node-rfc in production)
   */
  async simulateRFCConnection() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ connected: true });
      }, 100);
    });
  }

  /**
   * Call SAP BAPI (simulated)
   */
  async callBAPI(bapiName, parameters = {}) {
    // Simulate BAPI call
    console.log(`Calling BAPI: ${bapiName}`, parameters);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          documentNumber: `SAP${Date.now()}`,
          fiscalYear: new Date().getFullYear().toString(),
          message: 'Document posted successfully'
        });
      }, 200);
    });
  }

  /**
   * Call RFC function module (simulated)
   */
  async callRFC(functionName, parameters = {}) {
    console.log(`Calling RFC: ${functionName}`, parameters);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 100);
    });
  }

  /**
   * Send IDoc to SAP (simulated)
   */
  async sendIDocToSAP(iDoc) {
    console.log(`Sending IDoc: ${iDoc.type}`, iDoc);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          iDocNumber: `IDOC${Date.now()}`
        });
      }, 150);
    });
  }

  /**
   * Store SAP document mapping
   */
  async storeSAPDocument(mapping) {
    await global.db.query(
      `INSERT INTO sap_document_mappings
       (internal_id, sap_doc_number, fiscal_year, company_code, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [mapping.internalId, mapping.sapDocNumber, mapping.fiscalYear,
       mapping.companyCode, new Date()]
    );
  }

  /**
   * Store customer mapping
   */
  async storeCustomerMapping(mapping) {
    await global.db.query(
      `INSERT INTO sap_customer_mappings
       (internal_id, sap_customer_no, created_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (internal_id)
       DO UPDATE SET sap_customer_no = $2, updated_at = $3`,
      [mapping.internalId, mapping.sapCustomerNo, new Date()]
    );
  }

  /**
   * Store IDoc record
   */
  async storeIDocRecord(iDoc) {
    await global.db.query(
      `INSERT INTO sap_idoc_log
       (id, idoc_type, sap_idoc_number, status, data, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [iDoc.id, iDoc.type, iDoc.sapIDocNumber, iDoc.status,
       JSON.stringify(iDoc.data), iDoc.createdAt]
    );
  }

  /**
   * Get message type for IDoc
   */
  getMessageType(iDocType) {
    const messageTypes = {
      'FIDCCP02': 'FIDCC2',
      'DEBMAS06': 'DEBMAS',
      'CREMAS04': 'CREMAS',
      'MATMAS05': 'MATMAS',
      'ORDERS05': 'ORDERS',
      'INVOIC02': 'INVOIC'
    };
    return messageTypes[iDocType] || 'UNKNOWN';
  }
}

module.exports = SAPConnector;