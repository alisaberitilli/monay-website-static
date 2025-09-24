const pool = require('../models');
const EventEmitter = require('events');

class MCCRestrictionEngine extends EventEmitter {
  constructor() {
    super();
    this.restrictionCache = new Map();
    this.mccDescriptions = new Map();
    this.lastCacheUpdate = null;
    this.cacheTimeout = 300000; // 5 minutes
  }

  /**
   * Initialize MCC Restriction Engine
   */
  async initialize() {
    console.log('Initializing MCC Restriction Engine...');

    // Load MCC descriptions
    await this.loadMCCDescriptions();

    // Load restriction rules
    await this.loadRestrictionRules();

    // Schedule cache refresh
    setInterval(() => this.refreshCache(), this.cacheTimeout);

    console.log('MCC Restriction Engine initialized');
  }

  /**
   * Validate transaction against MCC restrictions
   */
  async validateMCC(programType, mccCode, merchantInfo = {}) {
    try {
      // Get restrictions for program
      const restrictions = await this.getRestrictions(programType);

      // Check if MCC is explicitly allowed
      if (restrictions.allowed_codes && restrictions.allowed_codes.length > 0) {
        if (!restrictions.allowed_codes.includes(mccCode)) {
          return {
            allowed: false,
            reason: `MCC ${mccCode} (${this.getMCCDescription(mccCode)}) not in allowed list`,
            code: 'MCC_NOT_ALLOWED'
          };
        }
      }

      // Check if MCC is explicitly prohibited
      if (restrictions.prohibited_codes && restrictions.prohibited_codes.includes(mccCode)) {
        return {
          allowed: false,
          reason: `MCC ${mccCode} (${this.getMCCDescription(mccCode)}) is prohibited`,
          code: 'MCC_PROHIBITED'
        };
      }

      // Check category-level restrictions
      const categoryCheck = await this.checkCategoryRestrictions(
        programType,
        mccCode,
        merchantInfo
      );

      if (!categoryCheck.allowed) {
        return categoryCheck;
      }

      // Check item-level restrictions if applicable
      if (merchantInfo.items) {
        const itemCheck = await this.checkItemRestrictions(
          programType,
          merchantInfo.items
        );

        if (!itemCheck.allowed) {
          return itemCheck;
        }
      }

      // Check time-based restrictions
      const timeCheck = this.checkTimeRestrictions(programType, mccCode);
      if (!timeCheck.allowed) {
        return timeCheck;
      }

      // Check location-based restrictions
      if (merchantInfo.location) {
        const locationCheck = await this.checkLocationRestrictions(
          programType,
          mccCode,
          merchantInfo.location
        );

        if (!locationCheck.allowed) {
          return locationCheck;
        }
      }

      return {
        allowed: true,
        mcc_description: this.getMCCDescription(mccCode)
      };

    } catch (error) {
      console.error('MCC validation error:', error);
      // Default to restrictive on error
      return {
        allowed: false,
        reason: 'Validation error occurred',
        code: 'VALIDATION_ERROR'
      };
    }
  }

  /**
   * Get restrictions for a program
   */
  async getRestrictions(programType) {
    // Check cache first
    if (this.restrictionCache.has(programType)) {
      return this.restrictionCache.get(programType);
    }

    const client = await pool.connect();
    try {
      // Get program-specific restrictions
      const result = await client.query(
        `SELECT * FROM mcc_restrictions WHERE program_type = $1 AND active = true`,
        [programType]
      );

      const restrictions = {
        allowed_codes: [],
        prohibited_codes: [],
        category_restrictions: [],
        item_restrictions: [],
        time_restrictions: [],
        location_restrictions: []
      };

      for (const row of result.rows) {
        switch (row.restriction_type) {
          case 'ALLOWED':
            restrictions.allowed_codes.push(...(row.mcc_codes || []));
            break;
          case 'PROHIBITED':
            restrictions.prohibited_codes.push(...(row.mcc_codes || []));
            break;
          case 'CATEGORY':
            restrictions.category_restrictions.push(row);
            break;
          case 'ITEM':
            restrictions.item_restrictions.push(row);
            break;
          case 'TIME':
            restrictions.time_restrictions.push(row);
            break;
          case 'LOCATION':
            restrictions.location_restrictions.push(row);
            break;
        }
      }

      // Cache the restrictions
      this.restrictionCache.set(programType, restrictions);

      return restrictions;

    } finally {
      client.release();
    }
  }

  /**
   * Check category-level restrictions
   */
  async checkCategoryRestrictions(programType, mccCode, merchantInfo) {
    const category = this.getMCCCategory(mccCode);

    // Special rules for different programs
    switch (programType) {
      case 'SNAP':
        return this.checkSNAPCategoryRestrictions(category, mccCode, merchantInfo);

      case 'WIC':
        return this.checkWICCategoryRestrictions(category, mccCode, merchantInfo);

      case 'TANF':
        return this.checkTANFCategoryRestrictions(category, mccCode);

      case 'SCHOOL_CHOICE_ESA':
        return this.checkSchoolChoiceRestrictions(category, mccCode);

      default:
        return { allowed: true };
    }
  }

  /**
   * SNAP category restrictions
   */
  checkSNAPCategoryRestrictions(category, mccCode, merchantInfo) {
    // SNAP allowed MCCs
    const allowedMCCs = [
      '5411', // Grocery Stores, Supermarkets
      '5422', // Freezer and Meat Provisioners
      '5441', // Candy, Nut, and Confectionery Stores
      '5451', // Dairy Products Stores
      '5462', // Bakeries
      '5499', // Miscellaneous Food Stores
      '5921'  // Package Stores (only for food items)
    ];

    // Prohibited merchant types
    const prohibitedTypes = [
      'RESTAURANT',
      'BAR',
      'CASINO',
      'LIQUOR_STORE',
      'TOBACCO_SHOP'
    ];

    if (!allowedMCCs.includes(mccCode)) {
      return {
        allowed: false,
        reason: 'SNAP benefits can only be used at authorized food retailers',
        code: 'SNAP_INVALID_MERCHANT'
      };
    }

    if (merchantInfo.type && prohibitedTypes.includes(merchantInfo.type)) {
      return {
        allowed: false,
        reason: `SNAP cannot be used at ${merchantInfo.type}`,
        code: 'SNAP_PROHIBITED_TYPE'
      };
    }

    // Check for hot/prepared food restriction
    if (merchantInfo.has_hot_food_bar) {
      return {
        allowed: false,
        reason: 'SNAP cannot be used for hot/prepared foods',
        code: 'SNAP_HOT_FOOD'
      };
    }

    return { allowed: true };
  }

  /**
   * WIC category restrictions
   */
  checkWICCategoryRestrictions(category, mccCode, merchantInfo) {
    // WIC authorized vendors only
    const wicAuthorizedMCCs = [
      '5411', // Grocery Stores
      '5422', // Freezer and Meat Provisioners
      '5451', // Dairy Products Stores
      '5462', // Bakeries
      '5499', // Miscellaneous Food Stores
      '5912'  // Drug Stores and Pharmacies (for formula)
    ];

    if (!wicAuthorizedMCCs.includes(mccCode)) {
      return {
        allowed: false,
        reason: 'WIC can only be used at authorized WIC vendors',
        code: 'WIC_UNAUTHORIZED_VENDOR'
      };
    }

    // Check WIC vendor authorization
    if (merchantInfo.merchant_id && !merchantInfo.wic_authorized) {
      return {
        allowed: false,
        reason: 'Merchant is not WIC authorized',
        code: 'WIC_NOT_AUTHORIZED'
      };
    }

    return { allowed: true };
  }

  /**
   * TANF category restrictions
   */
  checkTANFCategoryRestrictions(category, mccCode) {
    // TANF prohibited MCCs
    const prohibitedMCCs = [
      '5813', // Drinking Places (Alcoholic Beverages)
      '5921', // Package Stores-Beer, Wine, and Liquor
      '7273', // Dating Services
      '7297', // Massage Parlors
      '7299', // Miscellaneous Personal Services
      '7800', // Government-Owned Lotteries
      '7801', // Government-Licensed Casinos (Online)
      '7802', // Government-Licensed Horse/Dog Racing
      '7995', // Betting/Casino Gambling
      '8999', // Professional Services (tattoo/piercing)
      '5993', // Cigar Stores and Stands
      '5122', // Drugs, Proprietaries, and Sundries (tobacco)
      '7841', // Video Entertainment Rental (adult)
      '5735', // Record Shops (adult entertainment)
      '7994', // Video Game Arcades
      '7911', // Dance Halls, Studios, Schools
      '7922', // Theatrical Producers
      '7929', // Bands, Orchestras, Entertainers
      '7932', // Pool and Billiard Establishments
      '7933', // Bowling Alleys
      '7941', // Athletic Fields
      '7991', // Tourist Attractions and Exhibits
      '7992', // Golf Courses
      '7993', // Video Amusement Game Supplies
      '7996', // Amusement Parks, Carnivals, Circuses
      '7997', // Membership Clubs
      '7998', // Aquariums, Seaquariums, Dolphinariums
      '7999'  // Recreation Services
    ];

    if (prohibitedMCCs.includes(mccCode)) {
      return {
        allowed: false,
        reason: 'TANF cannot be used at this type of establishment',
        code: 'TANF_PROHIBITED_MCC'
      };
    }

    // Additional category checks
    const prohibitedCategories = [
      'ADULT_ENTERTAINMENT',
      'GAMBLING',
      'ALCOHOL',
      'TOBACCO',
      'FIREARMS',
      'CRUISE_LINES'
    ];

    if (prohibitedCategories.includes(category)) {
      return {
        allowed: false,
        reason: `TANF cannot be used for ${category.toLowerCase().replace('_', ' ')}`,
        code: 'TANF_PROHIBITED_CATEGORY'
      };
    }

    return { allowed: true };
  }

  /**
   * School Choice/ESA restrictions
   */
  checkSchoolChoiceRestrictions(category, mccCode) {
    // Educational expenses only
    const allowedMCCs = [
      '8211', // Elementary and Secondary Schools
      '8220', // Colleges, Universities
      '8241', // Correspondence Schools
      '8244', // Business and Secretarial Schools
      '8249', // Trade and Vocational Schools
      '8299', // Schools and Educational Services
      '5942', // Book Stores
      '5943', // Office, School Supply and Stationery
      '5945', // Hobby, Toy, and Game Shops
      '5947', // Gift, Card, Novelty and Souvenir Shops
      '5111', // Stationery, Office Supplies
      '5734', // Computer Software Stores
      '7372', // Computer Programming, Data Processing
      '8351'  // Child Care Services
    ];

    if (!allowedMCCs.includes(mccCode)) {
      return {
        allowed: false,
        reason: 'School Choice funds can only be used for educational expenses',
        code: 'ESA_NON_EDUCATIONAL'
      };
    }

    return { allowed: true };
  }

  /**
   * Check item-level restrictions
   */
  async checkItemRestrictions(programType, items) {
    const prohibitedItems = {
      SNAP: [
        'alcohol',
        'tobacco',
        'cigarettes',
        'vaping',
        'e-cigarettes',
        'hot_food',
        'prepared_food',
        'restaurant_meal',
        'pet_food',
        'vitamins',
        'medicines',
        'supplements',
        'household_supplies',
        'paper_products',
        'cosmetics'
      ],
      WIC: [
        // WIC has specific allowed items list
        'non_wic_approved'
      ],
      TANF: [
        'alcohol',
        'tobacco',
        'lottery',
        'gambling',
        'adult_entertainment',
        'firearms',
        'ammunition'
      ]
    };

    const programProhibited = prohibitedItems[programType] || [];

    for (const item of items) {
      const itemName = (item.name || '').toLowerCase();
      const itemCategory = (item.category || '').toLowerCase();

      for (const prohibited of programProhibited) {
        if (itemName.includes(prohibited) || itemCategory.includes(prohibited)) {
          return {
            allowed: false,
            reason: `${item.name} is not eligible under ${programType}`,
            code: 'PROHIBITED_ITEM',
            prohibited_item: item.name
          };
        }
      }

      // Special WIC check - must be on approved list
      if (programType === 'WIC' && !item.wic_approved) {
        return {
          allowed: false,
          reason: `${item.name} is not WIC approved`,
          code: 'WIC_UNAPPROVED_ITEM',
          item: item.name
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check time-based restrictions
   */
  checkTimeRestrictions(programType, mccCode) {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    // Example: Some states restrict SNAP purchases at certain times
    if (programType === 'SNAP') {
      // Check if it's a convenience store (5499) during restricted hours
      if (mccCode === '5499' && (hour < 6 || hour > 23)) {
        return {
          allowed: false,
          reason: 'SNAP purchases at convenience stores restricted during these hours',
          code: 'TIME_RESTRICTION'
        };
      }
    }

    // TANF ATM restrictions
    if (programType === 'TANF' && mccCode === '6011') { // ATM
      // Some states restrict ATM withdrawals at night
      if (hour >= 2 && hour < 6) {
        return {
          allowed: false,
          reason: 'TANF ATM withdrawals not allowed between 2 AM and 6 AM',
          code: 'ATM_TIME_RESTRICTION'
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check location-based restrictions
   */
  async checkLocationRestrictions(programType, mccCode, location) {
    const client = await pool.connect();
    try {
      // Check if location is in restricted area
      const result = await client.query(
        `SELECT * FROM location_restrictions
         WHERE program_type = $1
           AND (mcc_code = $2 OR mcc_code IS NULL)
           AND active = true`,
        [programType, mccCode]
      );

      for (const restriction of result.rows) {
        if (this.isLocationRestricted(location, restriction)) {
          return {
            allowed: false,
            reason: restriction.reason || 'Location is restricted for this program',
            code: 'LOCATION_RESTRICTED'
          };
        }
      }

      // Check cross-state restrictions
      if (programType === 'WIC' || programType === 'SECTION_8') {
        // These programs may have state-specific restrictions
        const stateCheck = await this.checkStateRestrictions(programType, location);
        if (!stateCheck.allowed) {
          return stateCheck;
        }
      }

      return { allowed: true };

    } finally {
      client.release();
    }
  }

  /**
   * Check if location is restricted
   */
  isLocationRestricted(location, restriction) {
    if (!restriction.restricted_areas) {
      return false;
    }

    // Simple implementation - would use proper geospatial in production
    for (const area of restriction.restricted_areas) {
      if (area.type === 'RADIUS') {
        const distance = this.calculateDistance(
          location.lat,
          location.lng,
          area.center_lat,
          area.center_lng
        );

        if (distance <= area.radius_miles) {
          return true;
        }
      }

      if (area.type === 'ZIP_CODE' && location.zip_code === area.zip_code) {
        return true;
      }

      if (area.type === 'CITY' && location.city === area.city) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check state-specific restrictions
   */
  async checkStateRestrictions(programType, location) {
    // WIC is state-specific
    if (programType === 'WIC' && location.state !== location.user_state) {
      return {
        allowed: false,
        reason: 'WIC benefits cannot be used outside of issuing state',
        code: 'OUT_OF_STATE'
      };
    }

    return { allowed: true };
  }

  /**
   * Get MCC category
   */
  getMCCCategory(mccCode) {
    const categories = {
      // Food and Grocery
      '5411': 'GROCERY',
      '5422': 'MEAT_MARKETS',
      '5441': 'CANDY_STORES',
      '5451': 'DAIRY_STORES',
      '5462': 'BAKERIES',
      '5499': 'FOOD_STORES',

      // Restaurants
      '5812': 'RESTAURANTS',
      '5813': 'BARS',
      '5814': 'FAST_FOOD',

      // Entertainment
      '7832': 'MOVIES',
      '7841': 'VIDEO_RENTAL',
      '7911': 'DANCE',
      '7922': 'THEATER',
      '7929': 'ENTERTAINMENT',
      '7932': 'BILLIARDS',
      '7933': 'BOWLING',
      '7941': 'SPORTS',
      '7991': 'TOURIST',
      '7992': 'GOLF',
      '7993': 'ARCADE',
      '7994': 'VIDEO_ARCADE',
      '7995': 'GAMBLING',
      '7996': 'AMUSEMENT',
      '7997': 'CLUBS',
      '7998': 'AQUARIUM',
      '7999': 'RECREATION',

      // Prohibited
      '5813': 'ALCOHOL',
      '5921': 'LIQUOR',
      '5993': 'TOBACCO',
      '7273': 'DATING',
      '7297': 'MASSAGE',
      '7800': 'LOTTERY',
      '7801': 'CASINO',
      '7802': 'RACING',

      // Education
      '8211': 'SCHOOLS',
      '8220': 'COLLEGES',
      '8241': 'CORRESPONDENCE',
      '8244': 'BUSINESS_SCHOOL',
      '8249': 'VOCATIONAL',
      '8299': 'EDUCATION',
      '8351': 'CHILD_CARE',

      // Healthcare
      '8011': 'DOCTORS',
      '8021': 'DENTISTS',
      '8031': 'OSTEOPATHS',
      '8041': 'CHIROPRACTORS',
      '8042': 'OPTOMETRISTS',
      '8043': 'OPTICIANS',
      '8049': 'HEALTHCARE',
      '8050': 'NURSING',
      '8062': 'HOSPITALS',
      '8071': 'MEDICAL_LABS',
      '8099': 'MEDICAL_SERVICES',

      // Retail
      '5200': 'HOME_SUPPLY',
      '5300': 'WHOLESALE',
      '5309': 'DUTY_FREE',
      '5310': 'DISCOUNT',
      '5311': 'DEPARTMENT',
      '5331': 'VARIETY',
      '5399': 'MERCHANDISE',
      '5611': 'CLOTHING_MENS',
      '5621': 'CLOTHING_WOMENS',
      '5631': 'ACCESSORIES',
      '5641': 'CLOTHING_CHILDREN',
      '5651': 'CLOTHING_FAMILY',
      '5655': 'SPORTS_APPAREL',
      '5661': 'SHOES',
      '5681': 'FURRIERS',
      '5691': 'CLOTHING',
      '5697': 'TAILORS',
      '5698': 'WIGS',
      '5699': 'APPAREL',
      '5712': 'FURNITURE',
      '5713': 'FLOORING',
      '5714': 'DRAPERY',
      '5715': 'ALCOHOL_STORES',
      '5718': 'FIREPLACES',
      '5719': 'SPECIALTY',
      '5722': 'APPLIANCES',
      '5732': 'ELECTRONICS',
      '5733': 'MUSIC',
      '5734': 'SOFTWARE',
      '5735': 'RECORDS',
      '5811': 'CATERERS',
      '5912': 'PHARMACY',
      '5940': 'BICYCLES',
      '5941': 'SPORTING_GOODS',
      '5942': 'BOOKS',
      '5943': 'OFFICE_SUPPLIES',
      '5944': 'JEWELRY',
      '5945': 'TOYS',
      '5946': 'CAMERAS',
      '5947': 'GIFTS',
      '5948': 'LUGGAGE',
      '5949': 'SEWING',
      '5950': 'GLASS',
      '5960': 'DIRECT_MARKETING',
      '5962': 'TELEMARKETING',
      '5963': 'DOOR_TO_DOOR',
      '5964': 'CATALOG',
      '5965': 'CATALOG_COMBO',
      '5966': 'OUTBOUND',
      '5967': 'INBOUND',
      '5968': 'SUBSCRIPTION',
      '5969': 'DIRECT_OTHER',
      '5970': 'ARTISTS',
      '5971': 'ART_DEALERS',
      '5972': 'STAMPS',
      '5973': 'RELIGIOUS',
      '5975': 'HEARING_AIDS',
      '5976': 'ORTHOPEDIC',
      '5977': 'COSMETICS',
      '5978': 'TYPEWRITERS',
      '5983': 'FUEL_OIL',
      '5992': 'FLORISTS',
      '5994': 'NEWS',
      '5995': 'PET',
      '5996': 'POOLS',
      '5997': 'RAZORS',
      '5998': 'TENTS',
      '5999': 'MISCELLANEOUS',

      // Services
      '7210': 'LAUNDRY',
      '7211': 'LAUNDRY_FAMILY',
      '7216': 'DRY_CLEANERS',
      '7217': 'CARPET',
      '7221': 'PHOTO',
      '7230': 'BEAUTY',
      '7251': 'SHOE_REPAIR',
      '7261': 'FUNERAL',
      '7276': 'TAX_PREP',
      '7277': 'COUNSELING',
      '7278': 'BUYING',
      '7296': 'RENTALS',
      '7298': 'HEALTH_SPA',
      '7299': 'PERSONAL_SERVICES'
    };

    return categories[mccCode] || 'OTHER';
  }

  /**
   * Get MCC description
   */
  getMCCDescription(mccCode) {
    if (this.mccDescriptions.has(mccCode)) {
      return this.mccDescriptions.get(mccCode);
    }

    // Common descriptions
    const descriptions = {
      '5411': 'Grocery Stores, Supermarkets',
      '5422': 'Freezer and Meat Provisioners',
      '5441': 'Candy, Nut, and Confectionery Stores',
      '5451': 'Dairy Products Stores',
      '5462': 'Bakeries',
      '5499': 'Miscellaneous Food Stores',
      '5812': 'Eating Places, Restaurants',
      '5813': 'Drinking Places (Alcoholic Beverages)',
      '5814': 'Fast Food Restaurants',
      '5912': 'Drug Stores and Pharmacies',
      '5921': 'Package Stores-Beer, Wine, and Liquor',
      '5993': 'Cigar Stores and Stands',
      '6011': 'ATMs',
      '7273': 'Dating Services',
      '7297': 'Massage Parlors',
      '7800': 'Government-Owned Lotteries',
      '7801': 'Government-Licensed Casinos',
      '7802': 'Government-Licensed Horse/Dog Racing',
      '7995': 'Betting/Casino Gambling',
      '8211': 'Elementary and Secondary Schools',
      '8220': 'Colleges, Universities',
      '8299': 'Schools and Educational Services'
    };

    return descriptions[mccCode] || `MCC ${mccCode}`;
  }

  /**
   * Load MCC descriptions from database
   */
  async loadMCCDescriptions() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT mcc_code, description FROM mcc_codes`
      );

      for (const row of result.rows) {
        this.mccDescriptions.set(row.mcc_code, row.description);
      }

      console.log(`Loaded ${this.mccDescriptions.size} MCC descriptions`);

    } catch (error) {
      console.error('Error loading MCC descriptions:', error);
      // Continue with hardcoded descriptions
    } finally {
      client.release();
    }
  }

  /**
   * Load restriction rules from database
   */
  async loadRestrictionRules() {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT DISTINCT program_type FROM mcc_restrictions WHERE active = true`
      );

      for (const row of result.rows) {
        await this.getRestrictions(row.program_type);
      }

      console.log(`Loaded restrictions for ${result.rows.length} programs`);

    } catch (error) {
      console.error('Error loading restriction rules:', error);
    } finally {
      client.release();
    }
  }

  /**
   * Add custom restriction rule
   */
  async addRestrictionRule(programType, restrictionType, mccCodes, metadata = {}) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO mcc_restrictions
         (program_type, restriction_type, mcc_codes, metadata, active, created_at)
         VALUES ($1, $2, $3, $4, true, NOW())
         RETURNING *`,
        [programType, restrictionType, mccCodes, metadata]
      );

      // Clear cache for this program
      this.restrictionCache.delete(programType);

      this.emit('restriction_added', {
        program_type: programType,
        restriction: result.rows[0]
      });

      return result.rows[0];

    } finally {
      client.release();
    }
  }

  /**
   * Update restriction rule
   */
  async updateRestrictionRule(restrictionId, updates) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE mcc_restrictions
         SET mcc_codes = COALESCE($2, mcc_codes),
             metadata = COALESCE($3, metadata),
             active = COALESCE($4, active),
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [restrictionId, updates.mcc_codes, updates.metadata, updates.active]
      );

      if (result.rows.length > 0) {
        // Clear cache for affected program
        this.restrictionCache.delete(result.rows[0].program_type);

        this.emit('restriction_updated', {
          restriction: result.rows[0]
        });
      }

      return result.rows[0];

    } finally {
      client.release();
    }
  }

  /**
   * Get restriction audit log
   */
  async getRestrictionAuditLog(programType, startDate, endDate) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT ral.*, u.email as modified_by_email
         FROM restriction_audit_logs ral
         LEFT JOIN users u ON ral.modified_by = u.id
         WHERE ral.program_type = $1
           AND ral.created_at BETWEEN $2 AND $3
         ORDER BY ral.created_at DESC`,
        [programType, startDate, endDate]
      );

      return result.rows;

    } finally {
      client.release();
    }
  }

  /**
   * Calculate distance between two coordinates
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  /**
   * Refresh cache
   */
  async refreshCache() {
    if (Date.now() - this.lastCacheUpdate < this.cacheTimeout) {
      return;
    }

    console.log('Refreshing MCC restriction cache...');
    this.restrictionCache.clear();
    await this.loadRestrictionRules();
    this.lastCacheUpdate = Date.now();
  }

  /**
   * Export restrictions for reporting
   */
  async exportRestrictions(programType = null) {
    const client = await pool.connect();
    try {
      let query = `
        SELECT mr.*,
               COUNT(bt.id) as transaction_count,
               SUM(CASE WHEN bt.status = 'BLOCKED' THEN 1 ELSE 0 END) as blocked_count
        FROM mcc_restrictions mr
        LEFT JOIN benefit_transactions bt ON bt.mcc_code = ANY(mr.mcc_codes)
      `;

      const params = [];
      if (programType) {
        query += ' WHERE mr.program_type = $1';
        params.push(programType);
      }

      query += ' GROUP BY mr.id ORDER BY mr.program_type, mr.restriction_type';

      const result = await client.query(query, params);
      return result.rows;

    } finally {
      client.release();
    }
  }

  /**
   * Shutdown the engine
   */
  shutdown() {
    console.log('Shutting down MCC Restriction Engine');
    this.restrictionCache.clear();
    this.mccDescriptions.clear();
  }
}

// Export singleton instance
export default new MCCRestrictionEngine();