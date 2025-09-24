const { Pool } = require('pg');
const crypto = require('crypto');
const EventEmitter = require('events');

class CapitalMarketsComplianceEngine extends EventEmitter {
  constructor(dbConfig) {
    super();
    this.pool = new Pool(dbConfig);

    // Regulatory rules
    this.regulations = {
      SEC_RULE_144: 'sec_rule_144',
      REG_SHO: 'reg_sho',
      REG_T: 'reg_t',
      REG_D_506B: 'reg_d_506b',
      REG_D_506C: 'reg_d_506c',
      REG_S: 'reg_s',
      RULE_10B5: 'rule_10b5',
      FINRA_4210: 'finra_4210',
      FINRA_2111: 'finra_2111', // Suitability
      FINRA_5130: 'finra_5130', // IPO restrictions
      DODD_FRANK: 'dodd_frank',
      MIFID_II: 'mifid_ii',
      CAT: 'cat' // Consolidated Audit Trail
    };

    // Investor classifications
    this.investorTypes = {
      RETAIL: 'retail',
      ACCREDITED: 'accredited',
      QUALIFIED_PURCHASER: 'qualified_purchaser',
      QIB: 'qib', // Qualified Institutional Buyer
      INSTITUTIONAL: 'institutional',
      MARKET_MAKER: 'market_maker',
      FOREIGN: 'foreign'
    };

    // Restriction types
    this.restrictionTypes = {
      BLACKOUT: 'blackout',
      LOCK_UP: 'lock_up',
      INSIDER: 'insider',
      AFFILIATE: 'affiliate',
      CONTROL_PERSON: 'control_person',
      RESTRICTED_SECURITY: 'restricted_security',
      LEGEND_STOCK: 'legend_stock'
    };

    // Market manipulation patterns
    this.manipulationPatterns = {
      WASH_TRADING: 'wash_trading',
      SPOOFING: 'spoofing',
      LAYERING: 'layering',
      CHURNING: 'churning',
      PUMP_AND_DUMP: 'pump_and_dump',
      FRONT_RUNNING: 'front_running',
      MARKING_THE_CLOSE: 'marking_the_close',
      QUOTE_STUFFING: 'quote_stuffing'
    };

    // Compliance thresholds
    this.thresholds = {
      ACCREDITED_INCOME: 200000, // $200k individual or $300k joint
      ACCREDITED_NET_WORTH: 1000000, // $1M excluding primary residence
      QP_INVESTABLE_ASSETS: 5000000, // $5M qualified purchaser
      QIB_SECURITIES_VALUE: 100000000, // $100M QIB
      RULE_144_HOLDING: 6, // 6 months for reporting companies
      PDT_MINIMUM_EQUITY: 25000, // $25k pattern day trader
      POSITION_LIMIT_EQUITY: 100000, // Default position limit
      LARGE_TRADER: 2000000 // $2M or 20M shares per day
    };
  }

  /**
   * Validate investor accreditation status
   */
  async validateAccreditedInvestor(investorData) {
    const checks = [];

    // Income test
    if (investorData.annualIncome >= this.thresholds.ACCREDITED_INCOME) {
      checks.push({
        criterion: 'income_test',
        passed: true,
        value: investorData.annualIncome
      });
    } else if (investorData.jointIncome >= 300000) {
      checks.push({
        criterion: 'joint_income_test',
        passed: true,
        value: investorData.jointIncome
      });
    }

    // Net worth test
    const netWorth = (investorData.totalAssets || 0) - (investorData.totalLiabilities || 0);
    if (netWorth >= this.thresholds.ACCREDITED_NET_WORTH) {
      checks.push({
        criterion: 'net_worth_test',
        passed: true,
        value: netWorth
      });
    }

    // Professional certifications
    if (investorData.certifications) {
      const qualifyingCerts = ['Series 7', 'Series 65', 'Series 82'];
      const hasCert = investorData.certifications.some(cert =>
        qualifyingCerts.includes(cert)
      );

      if (hasCert) {
        checks.push({
          criterion: 'professional_certification',
          passed: true,
          certifications: investorData.certifications
        });
      }
    }

    // Entity qualifications
    if (investorData.entityType) {
      const qualifyingEntities = ['bank', 'insurance_company', 'registered_investment_company'];
      if (qualifyingEntities.includes(investorData.entityType)) {
        checks.push({
          criterion: 'entity_qualification',
          passed: true,
          entityType: investorData.entityType
        });
      }
    }

    const isAccredited = checks.some(c => c.passed);

    // Store verification
    if (investorData.accountId) {
      await this.storeAccreditationVerification(investorData.accountId, checks, isAccredited);
    }

    return {
      isAccredited,
      checks,
      verificationDate: new Date(),
      expiresIn: '365 days'
    };
  }

  /**
   * Check Rule 144 restrictions
   */
  async checkRule144Restrictions(securityId, accountId, quantity) {
    const client = await this.pool.connect();
    try {
      // Get security details
      const securityQuery = `
        SELECT * FROM capital_markets_securities
        WHERE id = $1`;
      const securityResult = await client.query(securityQuery, [securityId]);
      const security = securityResult.rows[0];

      if (!security || !security.restricted) {
        return { allowed: true };
      }

      // Check holding period (6 months for reporting companies, 1 year for non-reporting)
      const holdingQuery = `
        SELECT
          MIN(executed_at) as first_purchase,
          SUM(CASE WHEN o.side = 'buy' THEN e.quantity ELSE 0 END) as total_purchased
        FROM capital_markets_executions e
        JOIN capital_markets_orders o ON e.order_id = o.id
        WHERE o.account_id = $1 AND o.security_id = $2`;

      const holdingResult = await client.query(holdingQuery, [accountId, securityId]);
      const holding = holdingResult.rows[0];

      if (!holding.first_purchase) {
        return { allowed: false, reason: 'No holding found' };
      }

      const monthsHeld = this.calculateMonthsHeld(holding.first_purchase);
      const requiredMonths = security.is_reporting_company ? 6 : 12;

      if (monthsHeld < requiredMonths) {
        return {
          allowed: false,
          reason: `Holding period not met. Required: ${requiredMonths} months, Held: ${monthsHeld} months`
        };
      }

      // Volume limitations (greater of 1% of outstanding or average weekly volume)
      const volumeLimit = await this.calculateRule144VolumeLimit(security);

      if (quantity > volumeLimit) {
        return {
          allowed: false,
          reason: `Exceeds Rule 144 volume limit. Maximum: ${volumeLimit} shares`
        };
      }

      // Check if affiliate
      const isAffiliate = await this.checkAffiliateStatus(accountId, security.symbol);

      if (isAffiliate) {
        // Additional restrictions for affiliates
        const lastSaleQuery = `
          SELECT MAX(executed_at) as last_sale
          FROM capital_markets_executions e
          JOIN capital_markets_orders o ON e.order_id = o.id
          WHERE o.account_id = $1 AND o.security_id = $2 AND o.side = 'sell'`;

        const lastSaleResult = await client.query(lastSaleQuery, [accountId, securityId]);
        const lastSale = lastSaleResult.rows[0].last_sale;

        if (lastSale) {
          const daysSinceLastSale = this.calculateDaysSince(lastSale);
          if (daysSinceLastSale < 90) {
            return {
              allowed: false,
              reason: 'Affiliate must wait 90 days between sales'
            };
          }
        }

        // Form 144 filing required
        return {
          allowed: true,
          restrictions: {
            requiresForm144: true,
            volumeLimit,
            isAffiliate: true
          }
        };
      }

      return { allowed: true, volumeLimit };
    } finally {
      client.release();
    }
  }

  /**
   * Validate Reg D offering compliance
   */
  async validateRegDCompliance(offeringType, investorData, offeringData) {
    const validations = [];

    if (offeringType === this.regulations.REG_D_506B) {
      // Rule 506(b) - Up to 35 non-accredited, no general solicitation

      // Check investor limits
      if (!investorData.isAccredited) {
        const nonAccreditedCount = offeringData.nonAccreditedInvestors || 0;
        if (nonAccreditedCount >= 35) {
          validations.push({
            rule: 'investor_limit',
            passed: false,
            reason: 'Maximum 35 non-accredited investors allowed'
          });
        }

        // Sophistication requirement for non-accredited
        if (!investorData.isSophisticated && !investorData.hasPurchaserRep) {
          validations.push({
            rule: 'sophistication',
            passed: false,
            reason: 'Non-accredited investors must be sophisticated or have purchaser representative'
          });
        }
      }

      // No general solicitation
      if (offeringData.generalSolicitation) {
        validations.push({
          rule: 'solicitation',
          passed: false,
          reason: '506(b) prohibits general solicitation'
        });
      }
    } else if (offeringType === this.regulations.REG_D_506C) {
      // Rule 506(c) - Only accredited, allows general solicitation

      // All investors must be accredited
      if (!investorData.isAccredited) {
        validations.push({
          rule: 'accreditation',
          passed: false,
          reason: '506(c) requires all investors to be accredited'
        });
      }

      // Verification required
      if (!investorData.accreditationVerified) {
        validations.push({
          rule: 'verification',
          passed: false,
          reason: '506(c) requires verification of accredited status'
        });
      }
    }

    // Common Reg D requirements
    // Bad actor check
    if (investorData.hasBadActorDisqualification) {
      validations.push({
        rule: 'bad_actor',
        passed: false,
        reason: 'Bad actor disqualification applies'
      });
    }

    // Integration limit ($5M in 12 months for multiple offerings)
    if (offeringData.totalRaisedLast12Months > 5000000) {
      validations.push({
        rule: 'integration',
        passed: false,
        reason: 'Exceeds $5M integration limit'
      });
    }

    const passed = validations.every(v => v.passed !== false);

    return {
      compliant: passed,
      validations,
      offeringType,
      filingRequired: 'Form D within 15 days of first sale'
    };
  }

  /**
   * Check for market manipulation patterns
   */
  async detectMarketManipulation(accountId, timeWindow = '1 hour') {
    const client = await this.pool.connect();
    try {
      const detections = [];

      // Wash trading detection
      const washTrades = await this.detectWashTrading(client, accountId, timeWindow);
      if (washTrades.detected) {
        detections.push(washTrades);
      }

      // Spoofing detection
      const spoofing = await this.detectSpoofing(client, accountId, timeWindow);
      if (spoofing.detected) {
        detections.push(spoofing);
      }

      // Layering detection
      const layering = await this.detectLayering(client, accountId, timeWindow);
      if (layering.detected) {
        detections.push(layering);
      }

      // Marking the close
      const markingClose = await this.detectMarkingTheClose(client, accountId);
      if (markingClose.detected) {
        detections.push(markingClose);
      }

      // Generate alerts if patterns detected
      if (detections.length > 0) {
        await this.generateComplianceAlert(accountId, detections);
      }

      return {
        suspicious: detections.length > 0,
        patterns: detections,
        riskScore: this.calculateManipulationRiskScore(detections),
        requiresReview: detections.some(d => d.severity === 'high')
      };
    } finally {
      client.release();
    }
  }

  /**
   * Detect wash trading pattern
   */
  async detectWashTrading(client, accountId, timeWindow) {
    const query = `
      WITH trade_pairs AS (
        SELECT
          o1.security_id,
          o1.id as buy_order,
          o2.id as sell_order,
          o1.quantity,
          o1.price as buy_price,
          o2.price as sell_price,
          ABS(EXTRACT(EPOCH FROM (o2.created_at - o1.created_at))) as seconds_between
        FROM capital_markets_orders o1
        JOIN capital_markets_orders o2 ON o1.security_id = o2.security_id
        WHERE o1.account_id = $1
        AND o2.account_id = $1
        AND o1.side = 'buy'
        AND o2.side = 'sell'
        AND o1.status = 'filled'
        AND o2.status = 'filled'
        AND o2.created_at > o1.created_at
        AND o2.created_at < o1.created_at + INTERVAL '${timeWindow}'
      )
      SELECT * FROM trade_pairs
      WHERE seconds_between < 300  -- Within 5 minutes
      AND ABS(buy_price - sell_price) / buy_price < 0.01`; // Similar prices

    const result = await client.query(query, [accountId]);

    if (result.rows.length > 0) {
      return {
        detected: true,
        pattern: this.manipulationPatterns.WASH_TRADING,
        severity: 'high',
        instances: result.rows,
        description: 'Buy and sell orders for same security within short timeframe'
      };
    }

    return { detected: false };
  }

  /**
   * Detect spoofing pattern
   */
  async detectSpoofing(client, accountId, timeWindow) {
    const query = `
      WITH cancelled_orders AS (
        SELECT
          security_id,
          side,
          COUNT(*) as cancelled_count,
          SUM(quantity) as cancelled_volume,
          AVG(quantity) as avg_order_size
        FROM capital_markets_orders
        WHERE account_id = $1
        AND status = 'cancelled'
        AND created_at > NOW() - INTERVAL '${timeWindow}'
        GROUP BY security_id, side
      ),
      executed_orders AS (
        SELECT
          security_id,
          side,
          COUNT(*) as executed_count,
          SUM(quantity) as executed_volume
        FROM capital_markets_orders
        WHERE account_id = $1
        AND status = 'filled'
        AND created_at > NOW() - INTERVAL '${timeWindow}'
        GROUP BY security_id, side
      )
      SELECT
        c.*,
        e.executed_count,
        e.executed_volume,
        c.cancelled_volume / NULLIF(e.executed_volume, 0) as cancel_to_execute_ratio
      FROM cancelled_orders c
      LEFT JOIN executed_orders e ON c.security_id = e.security_id
      WHERE c.cancelled_count > 10  -- Many cancellations
      AND c.cancelled_volume / NULLIF(e.executed_volume, 0) > 10`; // High cancel ratio

    const result = await client.query(query, [accountId]);

    if (result.rows.length > 0) {
      return {
        detected: true,
        pattern: this.manipulationPatterns.SPOOFING,
        severity: 'high',
        instances: result.rows,
        description: 'Large volume of cancelled orders to manipulate market'
      };
    }

    return { detected: false };
  }

  /**
   * Detect layering pattern
   */
  async detectLayering(client, accountId, timeWindow) {
    const query = `
      WITH order_layers AS (
        SELECT
          security_id,
          side,
          price,
          COUNT(*) as order_count,
          SUM(quantity) as total_quantity,
          ARRAY_AGG(id) as order_ids
        FROM capital_markets_orders
        WHERE account_id = $1
        AND created_at > NOW() - INTERVAL '${timeWindow}'
        AND status IN ('pending', 'cancelled')
        GROUP BY security_id, side, price
        HAVING COUNT(*) >= 3  -- Multiple orders at same price
      )
      SELECT * FROM order_layers
      ORDER BY order_count DESC`;

    const result = await client.query(query, [accountId]);

    if (result.rows.length > 0) {
      // Check for pattern of multiple price levels
      const grouped = {};
      result.rows.forEach(row => {
        const key = `${row.security_id}_${row.side}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(row);
      });

      const layeringDetected = Object.values(grouped).some(layers => layers.length >= 3);

      if (layeringDetected) {
        return {
          detected: true,
          pattern: this.manipulationPatterns.LAYERING,
          severity: 'medium',
          instances: result.rows,
          description: 'Multiple orders at different price levels to create false depth'
        };
      }
    }

    return { detected: false };
  }

  /**
   * Detect marking the close
   */
  async detectMarkingTheClose(client, accountId) {
    const query = `
      SELECT
        DATE(created_at) as trade_date,
        security_id,
        COUNT(*) as trades_near_close,
        SUM(quantity) as volume_near_close,
        AVG(price) as avg_price,
        MAX(price) - MIN(price) as price_range
      FROM capital_markets_orders
      WHERE account_id = $1
      AND status = 'filled'
      AND EXTRACT(HOUR FROM created_at) = 15
      AND EXTRACT(MINUTE FROM created_at) >= 45  -- Last 15 minutes
      AND created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at), security_id
      HAVING COUNT(*) > 5`; // Multiple trades near close

    const result = await client.query(query, [accountId]);

    if (result.rows.length > 0) {
      return {
        detected: true,
        pattern: this.manipulationPatterns.MARKING_THE_CLOSE,
        severity: 'medium',
        instances: result.rows,
        description: 'Concentrated trading activity near market close'
      };
    }

    return { detected: false };
  }

  /**
   * Perform suitability check (FINRA Rule 2111)
   */
  async checkSuitability(accountId, orderData) {
    const client = await this.pool.connect();
    try {
      // Get account profile
      const accountQuery = `
        SELECT * FROM capital_markets_accounts WHERE id = $1`;
      const accountResult = await client.query(accountQuery, [accountId]);
      const account = accountResult.rows[0];

      // Get security details
      const securityQuery = `
        SELECT * FROM capital_markets_securities WHERE id = $1`;
      const securityResult = await client.query(securityQuery, [orderData.securityId]);
      const security = securityResult.rows[0];

      const suitabilityChecks = [];

      // Risk tolerance check
      const riskScore = this.calculateSecurityRiskScore(security);
      if (riskScore > (account.risk_tolerance || 5)) {
        suitabilityChecks.push({
          factor: 'risk_tolerance',
          suitable: false,
          reason: 'Security risk exceeds investor risk tolerance'
        });
      }

      // Investment objectives alignment
      if (account.investment_objectives) {
        const suitable = this.checkObjectivesAlignment(
          account.investment_objectives,
          security
        );
        if (!suitable) {
          suitabilityChecks.push({
            factor: 'objectives',
            suitable: false,
            reason: 'Does not align with investment objectives'
          });
        }
      }

      // Concentration risk
      const concentrationCheck = await this.checkConcentrationRisk(
        client,
        accountId,
        orderData
      );
      if (!concentrationCheck.suitable) {
        suitabilityChecks.push(concentrationCheck);
      }

      // Complex product suitability
      if (this.isComplexProduct(security)) {
        const complexCheck = this.checkComplexProductSuitability(account, security);
        if (!complexCheck.suitable) {
          suitabilityChecks.push(complexCheck);
        }
      }

      const suitable = suitabilityChecks.every(c => c.suitable !== false);

      return {
        suitable,
        checks: suitabilityChecks,
        recommendation: suitable ? 'proceed' : 'review_required',
        timestamp: new Date()
      };
    } finally {
      client.release();
    }
  }

  /**
   * Check Reg SHO compliance
   */
  async checkRegSHO(securityId, orderData) {
    const client = await this.pool.connect();
    try {
      const checks = [];

      // Get security status
      const securityQuery = `
        SELECT * FROM capital_markets_securities WHERE id = $1`;
      const securityResult = await client.query(securityQuery, [securityId]);
      const security = securityResult.rows[0];

      // Check if on threshold list
      if (security.reg_sho_threshold) {
        checks.push({
          rule: 'threshold_security',
          status: 'restricted',
          requirement: 'Close-out requirement applies'
        });

        // Check for SSR (Short Sale Restriction)
        const ssrQuery = `
          SELECT * FROM capital_markets_market_data
          WHERE security_id = $1`;
        const ssrResult = await client.query(ssrQuery, [securityId]);
        const marketData = ssrResult.rows[0];

        if (marketData && marketData.ssr_triggered) {
          checks.push({
            rule: 'ssr_triggered',
            status: 'restricted',
            requirement: 'Uptick rule applies - short sales must be at price above NBB'
          });

          // Validate uptick requirement
          if (orderData.side === 'sell_short') {
            if (!orderData.price || orderData.price <= marketData.bid_price) {
              return {
                compliant: false,
                reason: 'Short sale price must be above national best bid',
                checks
              };
            }
          }
        }
      }

      // Locate requirement
      if (orderData.side === 'sell_short') {
        if (!orderData.locateId) {
          checks.push({
            rule: 'locate_requirement',
            status: 'failed',
            requirement: 'Must have locate before short sale'
          });
        }

        // Check if hard to borrow
        if (security.hard_to_borrow) {
          checks.push({
            rule: 'hard_to_borrow',
            status: 'warning',
            requirement: 'Security is hard to borrow - higher fees apply'
          });
        }
      }

      const compliant = !checks.some(c => c.status === 'failed');

      return {
        compliant,
        checks,
        security: security.symbol
      };
    } finally {
      client.release();
    }
  }

  /**
   * Generate CAT (Consolidated Audit Trail) report
   */
  async generateCATReport(date = new Date()) {
    const client = await this.pool.connect();
    try {
      // Get all orders for the day
      const ordersQuery = `
        SELECT
          o.*,
          s.symbol,
          s.cusip,
          s.isin,
          a.account_number
        FROM capital_markets_orders o
        JOIN capital_markets_securities s ON o.security_id = s.id
        JOIN capital_markets_accounts a ON o.account_id = a.id
        WHERE DATE(o.created_at) = DATE($1)
        ORDER BY o.created_at`;

      const orders = await client.query(ordersQuery, [date]);

      // Get all executions
      const executionsQuery = `
        SELECT e.*, o.order_number
        FROM capital_markets_executions e
        JOIN capital_markets_orders o ON e.order_id = o.id
        WHERE DATE(e.executed_at) = DATE($1)
        ORDER BY e.executed_at`;

      const executions = await client.query(executionsQuery, [date]);

      // Format for CAT submission
      const catRecords = [];

      // Order events
      orders.rows.forEach(order => {
        catRecords.push(this.formatCATOrderEvent(order));

        // Route events
        if (order.route) {
          catRecords.push(this.formatCATRouteEvent(order));
        }
      });

      // Execution events
      executions.rows.forEach(execution => {
        catRecords.push(this.formatCATExecutionEvent(execution));
      });

      // Store report
      const reportQuery = `
        INSERT INTO capital_markets_regulatory_reports (
          report_type, report_date, total_trades,
          total_volume, total_value, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id`;

      const totalVolume = executions.rows.reduce((sum, e) => sum + parseFloat(e.quantity), 0);
      const totalValue = executions.rows.reduce((sum, e) =>
        sum + (parseFloat(e.quantity) * parseFloat(e.price)), 0);

      const reportResult = await client.query(reportQuery, [
        'CAT',
        date,
        orders.rows.length,
        totalVolume,
        totalValue
      ]);

      return {
        reportId: reportResult.rows[0].id,
        recordCount: catRecords.length,
        records: catRecords,
        reportDate: date
      };
    } finally {
      client.release();
    }
  }

  /**
   * Check insider trading restrictions
   */
  async checkInsiderRestrictions(accountId, securityId) {
    const client = await this.pool.connect();
    try {
      // Check if account holder is insider
      const insiderQuery = `
        SELECT *
        FROM insider_list
        WHERE account_id = $1 AND security_id = $2`;

      const insiderResult = await client.query(insiderQuery, [accountId, securityId]);

      if (insiderResult.rows.length === 0) {
        return { restricted: false };
      }

      const insider = insiderResult.rows[0];
      const restrictions = [];

      // Check blackout period
      const blackoutQuery = `
        SELECT *
        FROM blackout_periods
        WHERE company_id = $1
        AND start_date <= CURRENT_DATE
        AND end_date >= CURRENT_DATE`;

      const blackoutResult = await client.query(blackoutQuery, [insider.company_id]);

      if (blackoutResult.rows.length > 0) {
        restrictions.push({
          type: this.restrictionTypes.BLACKOUT,
          reason: 'Trading window closed',
          endDate: blackoutResult.rows[0].end_date
        });
      }

      // Check pre-clearance requirement
      if (insider.requires_preclearance) {
        restrictions.push({
          type: 'preclearance',
          reason: 'Pre-clearance required from compliance',
          required: true
        });
      }

      // Check 10b5-1 plan
      if (insider.has_10b5_1_plan) {
        // Trades must follow predetermined plan
        restrictions.push({
          type: 'plan_restricted',
          reason: 'Trades must follow 10b5-1 plan',
          planId: insider.plan_id
        });
      }

      return {
        restricted: restrictions.length > 0,
        isInsider: true,
        restrictions,
        reportingRequired: true
      };
    } finally {
      client.release();
    }
  }

  /**
   * Helper methods
   */
  async storeAccreditationVerification(accountId, checks, isAccredited) {
    const query = `
      UPDATE capital_markets_accounts
      SET accredited_investor = $1,
          metadata = metadata || $2::jsonb,
          updated_at = NOW()
      WHERE id = $3`;

    await this.pool.query(query, [
      isAccredited,
      JSON.stringify({ accreditation_checks: checks }),
      accountId
    ]);
  }

  calculateMonthsHeld(firstPurchase) {
    const months = Math.floor(
      (Date.now() - new Date(firstPurchase).getTime()) / (30 * 24 * 60 * 60 * 1000)
    );
    return months;
  }

  calculateDaysSince(date) {
    return Math.floor(
      (Date.now() - new Date(date).getTime()) / (24 * 60 * 60 * 1000)
    );
  }

  async calculateRule144VolumeLimit(security) {
    // Greater of 1% of outstanding shares or average weekly volume
    const outstandingLimit = (security.outstanding_shares || 0) * 0.01;

    const volumeQuery = `
      SELECT AVG(volume) as avg_weekly_volume
      FROM capital_markets_market_data
      WHERE security_id = $1
      AND updated_at > NOW() - INTERVAL '4 weeks'`;

    const volumeResult = await this.pool.query(volumeQuery, [security.id]);
    const avgVolume = volumeResult.rows[0]?.avg_weekly_volume || 0;

    return Math.max(outstandingLimit, avgVolume);
  }

  async checkAffiliateStatus(accountId, symbol) {
    // Check if account holder is affiliate (officer, director, or 10%+ owner)
    const query = `
      SELECT *
      FROM affiliate_list
      WHERE account_id = $1 AND symbol = $2`;

    const result = await this.pool.query(query, [accountId, symbol]);
    return result.rows.length > 0;
  }

  calculateManipulationRiskScore(detections) {
    const severityScores = {
      high: 10,
      medium: 5,
      low: 2
    };

    let score = 0;
    detections.forEach(d => {
      score += severityScores[d.severity] || 0;
    });

    return Math.min(100, score * 10);
  }

  async generateComplianceAlert(accountId, detections) {
    const query = `
      INSERT INTO compliance_alerts (
        account_id, alert_type, severity,
        details, created_at
      ) VALUES ($1, $2, $3, $4, NOW())`;

    const severity = detections.some(d => d.severity === 'high') ? 'high' : 'medium';

    await this.pool.query(query, [
      accountId,
      'market_manipulation',
      severity,
      JSON.stringify(detections)
    ]);

    this.emit('compliance:alert', {
      accountId,
      type: 'market_manipulation',
      severity,
      patterns: detections.map(d => d.pattern)
    });
  }

  calculateSecurityRiskScore(security) {
    let score = 5; // Base score

    // Adjust based on security type
    const riskAdjustments = {
      option: 3,
      future: 3,
      forex: 2,
      crypto: 4,
      bond: -2,
      etf: -1
    };

    score += riskAdjustments[security.security_type] || 0;

    // Volatility adjustment
    if (security.implied_volatility > 0.5) score += 2;
    if (security.implied_volatility > 1.0) score += 2;

    return Math.min(10, Math.max(1, score));
  }

  checkObjectivesAlignment(objectives, security) {
    // Simplified objectives matching
    const objectiveMap = {
      growth: ['equity', 'etf', 'option'],
      income: ['bond', 'dividend_equity'],
      preservation: ['bond', 'money_market'],
      speculation: ['option', 'future', 'crypto']
    };

    return objectives.some(obj =>
      objectiveMap[obj]?.includes(security.security_type)
    );
  }

  async checkConcentrationRisk(client, accountId, orderData) {
    const query = `
      SELECT
        SUM(p.market_value) as total_portfolio,
        SUM(CASE WHEN p.security_id = $1 THEN p.market_value ELSE 0 END) as position_value
      FROM capital_markets_positions p
      WHERE p.account_id = $2`;

    const result = await client.query(query, [orderData.securityId, accountId]);
    const portfolio = result.rows[0];

    const newPositionValue = portfolio.position_value +
                           (orderData.quantity * orderData.price);
    const concentration = newPositionValue / (portfolio.total_portfolio || 1);

    if (concentration > 0.2) { // 20% concentration limit
      return {
        factor: 'concentration',
        suitable: false,
        reason: `Position would exceed 20% concentration limit (${(concentration * 100).toFixed(1)}%)`
      };
    }

    return { suitable: true };
  }

  isComplexProduct(security) {
    const complexTypes = ['option', 'future', 'structured_product', 'derivative'];
    return complexTypes.includes(security.security_type);
  }

  checkComplexProductSuitability(account, security) {
    if (security.security_type === 'option' && account.options_level < 2) {
      return {
        factor: 'complex_product',
        suitable: false,
        reason: 'Insufficient options trading level for this strategy'
      };
    }

    if (security.security_type === 'future' && !account.futures_approved) {
      return {
        factor: 'complex_product',
        suitable: false,
        reason: 'Futures trading not approved'
      };
    }

    return { suitable: true };
  }

  formatCATOrderEvent(order) {
    return {
      eventType: 'MEOR', // Manual Order Event
      eventTimestamp: order.created_at,
      orderID: order.order_number,
      symbol: order.symbol,
      orderType: order.order_type,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
      timeInForce: order.time_in_force,
      accountNumber: order.account_number
    };
  }

  formatCATRouteEvent(order) {
    return {
      eventType: 'MEIR', // Manual Internal Route
      eventTimestamp: order.submitted_at,
      orderID: order.order_number,
      routedOrderID: order.order_number + '-R',
      destination: order.route
    };
  }

  formatCATExecutionEvent(execution) {
    return {
      eventType: 'MEOT', // Manual Order Trade
      eventTimestamp: execution.executed_at,
      orderID: execution.order_number,
      executionID: execution.execution_id,
      quantity: execution.quantity,
      price: execution.price,
      capacity: 'Agency'
    };
  }

  /**
   * Check FINRA 5130 IPO restrictions
   */
  async checkIPORestrictions(accountId, securityId) {
    const client = await this.pool.connect();
    try {
      // Check if security is new issue
      const securityQuery = `
        SELECT * FROM capital_markets_securities
        WHERE id = $1`;
      const securityResult = await client.query(securityQuery, [securityId]);
      const security = securityResult.rows[0];

      if (!security.is_new_issue) {
        return { allowed: true };
      }

      // Check if account is restricted person under FINRA 5130
      const accountQuery = `
        SELECT * FROM capital_markets_accounts
        WHERE id = $1`;
      const accountResult = await client.query(accountQuery, [accountId]);
      const account = accountResult.rows[0];

      const restrictedPersonTypes = [
        'broker_dealer',
        'finra_member',
        'portfolio_manager',
        'immediate_family'
      ];

      if (restrictedPersonTypes.includes(account.account_type)) {
        return {
          allowed: false,
          reason: 'Restricted person under FINRA Rule 5130',
          rule: this.regulations.FINRA_5130
        };
      }

      return { allowed: true };
    } finally {
      client.release();
    }
  }
}

export default CapitalMarketsComplianceEngine;