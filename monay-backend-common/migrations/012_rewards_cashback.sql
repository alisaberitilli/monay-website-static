-- Rewards & Cashback System Database Schema
-- Consumer Wallet Phase 3 Day 15 Implementation
-- Focus: Points, cashback, rewards redemption, partner programs, tier benefits

-- ==================== REWARDS ACCOUNTS ====================

-- User rewards accounts
CREATE TABLE IF NOT EXISTS rewards_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Points balances
    points_balance DECIMAL(15, 2) DEFAULT 0.00,
    lifetime_points_earned DECIMAL(15, 2) DEFAULT 0.00,
    lifetime_points_redeemed DECIMAL(15, 2) DEFAULT 0.00,

    -- Cashback balances
    cashback_balance DECIMAL(15, 2) DEFAULT 0.00,
    lifetime_cashback_earned DECIMAL(15, 2) DEFAULT 0.00,
    lifetime_cashback_redeemed DECIMAL(15, 2) DEFAULT 0.00,

    -- Tier information
    current_tier VARCHAR(50) DEFAULT 'bronze' CHECK (
        current_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')
    ),
    tier_progress DECIMAL(10, 2) DEFAULT 0.00,
    tier_qualification_amount DECIMAL(15, 2) DEFAULT 0.00,
    tier_expiry_date DATE,

    -- Stats
    total_transactions INT DEFAULT 0,
    current_month_spending DECIMAL(15, 2) DEFAULT 0.00,
    current_year_spending DECIMAL(15, 2) DEFAULT 0.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id),
    INDEX idx_tier (current_tier),
    CONSTRAINT positive_balances CHECK (
        points_balance >= 0 AND cashback_balance >= 0
    )
);

-- ==================== REWARDS PROGRAMS ====================

-- Rewards program definitions
CREATE TABLE IF NOT EXISTS rewards_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Program type
    program_type VARCHAR(50) NOT NULL CHECK (
        program_type IN ('cashback', 'points', 'miles', 'crypto', 'mixed')
    ),

    -- Base earning rates
    base_earn_rate DECIMAL(10, 4) NOT NULL DEFAULT 1.00,
    points_per_dollar DECIMAL(10, 4) DEFAULT 1.00,
    cashback_percentage DECIMAL(5, 2) DEFAULT 1.00,

    -- Program settings
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    requires_enrollment BOOLEAN DEFAULT false,
    auto_enroll BOOLEAN DEFAULT false,

    -- Limits
    max_earning_per_transaction DECIMAL(15, 2),
    max_earning_per_month DECIMAL(15, 2),
    max_earning_per_year DECIMAL(15, 2),

    -- Dates
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_active (is_active),
    INDEX idx_program_code (program_code)
);

-- ==================== EARNING RULES ====================

-- Category-based earning rules
CREATE TABLE IF NOT EXISTS earning_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES rewards_programs(id),

    -- Rule details
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (
        rule_type IN ('category', 'merchant', 'time_based', 'amount_based', 'frequency_based')
    ),

    -- Category/merchant matching
    mcc_codes TEXT[], -- Array of MCC codes
    merchant_ids TEXT[], -- Array of merchant IDs
    categories TEXT[], -- Array of categories

    -- Multipliers and rates
    points_multiplier DECIMAL(10, 2) DEFAULT 1.00,
    cashback_rate DECIMAL(5, 2) DEFAULT 1.00,
    bonus_points DECIMAL(15, 2) DEFAULT 0.00,

    -- Conditions
    min_transaction_amount DECIMAL(15, 2),
    max_transaction_amount DECIMAL(15, 2),

    -- Time restrictions
    valid_days_of_week INT[], -- 0=Sunday, 6=Saturday
    valid_hours_start TIME,
    valid_hours_end TIME,

    -- Limits
    max_earnings_per_period DECIMAL(15, 2),
    earning_cap_period VARCHAR(20) CHECK (
        earning_cap_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')
    ),

    -- Status
    is_active BOOLEAN DEFAULT true,
    priority INT DEFAULT 100, -- Higher priority rules apply first

    -- Validity
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_program (program_id),
    INDEX idx_active_priority (is_active, priority DESC)
);

-- ==================== POINTS & CASHBACK TRANSACTIONS ====================

-- Points and cashback earning transactions
CREATE TABLE IF NOT EXISTS rewards_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    account_id UUID NOT NULL REFERENCES rewards_accounts(id),

    -- Transaction details
    transaction_type VARCHAR(50) NOT NULL CHECK (
        transaction_type IN ('earn', 'redeem', 'expire', 'adjust', 'transfer', 'bonus', 'reversal')
    ),
    reward_type VARCHAR(50) NOT NULL CHECK (
        reward_type IN ('points', 'cashback', 'miles', 'crypto')
    ),

    -- Amounts
    amount DECIMAL(15, 4) NOT NULL,
    points_amount DECIMAL(15, 2),
    cashback_amount DECIMAL(15, 2),

    -- Source transaction
    source_transaction_id UUID,
    source_transaction_type VARCHAR(50), -- 'card_payment', 'p2p_transfer', 'bill_pay', etc.
    source_amount DECIMAL(15, 2),

    -- Applied rule
    program_id UUID REFERENCES rewards_programs(id),
    rule_id UUID REFERENCES earning_rules(id),
    multiplier_applied DECIMAL(10, 2),

    -- Merchant info
    merchant_name VARCHAR(255),
    merchant_category VARCHAR(100),
    mcc_code VARCHAR(4),

    -- Status
    status VARCHAR(20) DEFAULT 'completed' CHECK (
        status IN ('pending', 'completed', 'reversed', 'expired', 'cancelled')
    ),

    -- Expiry
    expires_at TIMESTAMP,
    expired_amount DECIMAL(15, 2),

    -- Metadata
    description TEXT,
    metadata JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reversed_at TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_account (account_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at DESC),
    INDEX idx_expires (expires_at)
);

-- ==================== REWARDS CATALOG ====================

-- Rewards redemption catalog
CREATE TABLE IF NOT EXISTS rewards_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Item details
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),

    -- Redemption type
    redemption_type VARCHAR(50) NOT NULL CHECK (
        redemption_type IN ('gift_card', 'merchandise', 'travel', 'cash_back', 'statement_credit', 'charity', 'experience')
    ),

    -- Cost
    points_cost DECIMAL(15, 2),
    cash_value DECIMAL(15, 2),

    -- Partner info
    partner_id UUID REFERENCES rewards_partners(id),
    partner_sku VARCHAR(100),

    -- Inventory
    available_quantity INT,
    unlimited_inventory BOOLEAN DEFAULT false,

    -- Images
    image_url TEXT,
    thumbnail_url TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,

    -- Restrictions
    min_tier VARCHAR(50),
    required_points_balance DECIMAL(15, 2),

    -- Validity
    available_from DATE DEFAULT CURRENT_DATE,
    available_until DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_active (is_active),
    INDEX idx_category (category),
    INDEX idx_redemption_type (redemption_type)
);

-- ==================== REDEMPTIONS ====================

-- Reward redemptions
CREATE TABLE IF NOT EXISTS rewards_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    account_id UUID NOT NULL REFERENCES rewards_accounts(id),
    catalog_item_id UUID REFERENCES rewards_catalog(id),

    -- Redemption details
    redemption_type VARCHAR(50) NOT NULL,
    points_redeemed DECIMAL(15, 2),
    cashback_redeemed DECIMAL(15, 2),
    cash_value DECIMAL(15, 2),

    -- Delivery details
    delivery_method VARCHAR(50) CHECK (
        delivery_method IN ('email', 'physical', 'account_credit', 'instant', 'partner_transfer')
    ),
    delivery_status VARCHAR(50) DEFAULT 'pending' CHECK (
        delivery_status IN ('pending', 'processing', 'shipped', 'delivered', 'failed', 'cancelled')
    ),

    -- For physical items
    shipping_address JSONB,
    tracking_number VARCHAR(255),

    -- For digital items
    redemption_code VARCHAR(255),
    redemption_url TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'approved', 'completed', 'cancelled', 'refunded')
    ),

    -- Dates
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,

    -- Metadata
    notes TEXT,
    metadata JSONB,

    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at DESC)
);

-- ==================== PARTNER PROGRAMS ====================

-- Partner merchants and programs
CREATE TABLE IF NOT EXISTS rewards_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Partner details
    partner_code VARCHAR(50) UNIQUE NOT NULL,
    partner_name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(50) CHECK (
        partner_type IN ('merchant', 'airline', 'hotel', 'retailer', 'restaurant', 'entertainment', 'other')
    ),

    -- Integration details
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    webhook_url TEXT,

    -- Earning rates
    base_points_multiplier DECIMAL(10, 2) DEFAULT 1.00,
    base_cashback_rate DECIMAL(5, 2) DEFAULT 1.00,

    -- Special offers
    has_special_offers BOOLEAN DEFAULT false,
    offer_description TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,
    integration_status VARCHAR(50) DEFAULT 'active' CHECK (
        integration_status IN ('pending', 'active', 'suspended', 'terminated')
    ),

    -- Dates
    partnership_start_date DATE,
    partnership_end_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_active (is_active),
    INDEX idx_partner_code (partner_code)
);

-- Partner offers and promotions
CREATE TABLE IF NOT EXISTS partner_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID NOT NULL REFERENCES rewards_partners(id),

    -- Offer details
    offer_code VARCHAR(100) UNIQUE NOT NULL,
    offer_name VARCHAR(255) NOT NULL,
    description TEXT,
    terms_conditions TEXT,

    -- Offer type
    offer_type VARCHAR(50) NOT NULL CHECK (
        offer_type IN ('bonus_points', 'increased_cashback', 'discount', 'free_item', 'experience')
    ),

    -- Bonus details
    bonus_points DECIMAL(15, 2),
    bonus_multiplier DECIMAL(10, 2),
    cashback_bonus DECIMAL(5, 2),
    discount_percentage DECIMAL(5, 2),

    -- Requirements
    min_purchase_amount DECIMAL(15, 2),
    required_items TEXT[],

    -- Limits
    max_uses_per_user INT,
    total_redemption_limit INT,
    current_redemption_count INT DEFAULT 0,

    -- Validity
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,

    -- Status
    is_active BOOLEAN DEFAULT true,
    requires_activation BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_partner (partner_id),
    INDEX idx_active (is_active),
    INDEX idx_valid_dates (valid_from, valid_until)
);

-- ==================== TIER BENEFITS ====================

-- Tier definitions and benefits
CREATE TABLE IF NOT EXISTS reward_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tier details
    tier_name VARCHAR(50) UNIQUE NOT NULL,
    tier_level INT UNIQUE NOT NULL,
    description TEXT,

    -- Qualification criteria
    min_annual_spending DECIMAL(15, 2),
    min_transactions_per_year INT,
    min_points_earned DECIMAL(15, 2),

    -- Benefits
    points_multiplier DECIMAL(10, 2) DEFAULT 1.00,
    cashback_bonus DECIMAL(5, 2) DEFAULT 0.00,

    -- Perks
    perks JSONB, -- Array of perk descriptions

    -- Partner benefits
    partner_benefits JSONB,

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_level (tier_level),
    INDEX idx_active (is_active)
);

-- User tier history
CREATE TABLE IF NOT EXISTS user_tier_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    account_id UUID NOT NULL REFERENCES rewards_accounts(id),

    -- Tier change
    previous_tier VARCHAR(50),
    new_tier VARCHAR(50) NOT NULL,

    -- Reason
    change_reason VARCHAR(100),
    qualification_amount DECIMAL(15, 2),
    qualification_transactions INT,

    -- Dates
    effective_date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user (user_id),
    INDEX idx_effective (effective_date DESC)
);

-- ==================== CASHBACK CATEGORIES ====================

-- Rotating cashback categories
CREATE TABLE IF NOT EXISTS cashback_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Category details
    category_name VARCHAR(100) NOT NULL,
    quarter INT NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    year INT NOT NULL,

    -- MCC codes for this category
    mcc_codes TEXT[],
    merchant_names TEXT[],

    -- Cashback rate
    cashback_rate DECIMAL(5, 2) NOT NULL,
    max_cashback_amount DECIMAL(15, 2),

    -- Status
    is_active BOOLEAN DEFAULT true,
    requires_activation BOOLEAN DEFAULT true,

    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(quarter, year),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_active (is_active)
);

-- User category activations
CREATE TABLE IF NOT EXISTS user_cashback_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    category_id UUID NOT NULL REFERENCES cashback_categories(id),

    -- Activation details
    activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,

    -- Usage
    total_earned DECIMAL(15, 2) DEFAULT 0.00,
    transactions_count INT DEFAULT 0,

    UNIQUE(user_id, category_id),
    INDEX idx_user_active (user_id, is_active)
);

-- ==================== BONUS CAMPAIGNS ====================

-- Bonus earning campaigns
CREATE TABLE IF NOT EXISTS bonus_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Campaign details
    campaign_code VARCHAR(100) UNIQUE NOT NULL,
    campaign_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Campaign type
    campaign_type VARCHAR(50) NOT NULL CHECK (
        campaign_type IN ('signup', 'spending', 'referral', 'milestone', 'seasonal', 'partner')
    ),

    -- Requirements
    requirements JSONB,

    -- Rewards
    bonus_points DECIMAL(15, 2),
    bonus_cashback DECIMAL(15, 2),

    -- Limits
    max_participants INT,
    current_participants INT DEFAULT 0,

    -- Validity
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_active (is_active),
    INDEX idx_dates (start_date, end_date)
);

-- User campaign participation
CREATE TABLE IF NOT EXISTS user_campaign_participation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    campaign_id UUID NOT NULL REFERENCES bonus_campaigns(id),

    -- Participation details
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress JSONB,

    -- Completion
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,

    -- Rewards
    points_earned DECIMAL(15, 2) DEFAULT 0.00,
    cashback_earned DECIMAL(15, 2) DEFAULT 0.00,

    UNIQUE(user_id, campaign_id),
    INDEX idx_user (user_id),
    INDEX idx_campaign (campaign_id)
);

-- ==================== FUNCTIONS ====================

-- Calculate points for transaction
CREATE OR REPLACE FUNCTION calculate_transaction_points(
    p_user_id UUID,
    p_amount DECIMAL,
    p_mcc_code VARCHAR,
    p_merchant_name VARCHAR
) RETURNS DECIMAL AS $$
DECLARE
    v_points DECIMAL := 0;
    v_multiplier DECIMAL := 1;
    v_rule RECORD;
BEGIN
    -- Get applicable earning rules
    FOR v_rule IN
        SELECT er.*, rp.points_per_dollar
        FROM earning_rules er
        JOIN rewards_programs rp ON er.program_id = rp.id
        WHERE er.is_active = true
        AND (er.mcc_codes IS NULL OR p_mcc_code = ANY(er.mcc_codes))
        AND (er.merchant_names IS NULL OR p_merchant_name = ANY(er.merchant_names))
        AND (er.min_transaction_amount IS NULL OR p_amount >= er.min_transaction_amount)
        ORDER BY er.priority DESC
        LIMIT 1
    LOOP
        v_multiplier := v_rule.points_multiplier;
        v_points := p_amount * v_rule.points_per_dollar * v_multiplier;
        v_points := v_points + COALESCE(v_rule.bonus_points, 0);
    END LOOP;

    -- If no specific rule, use base rate
    IF v_points = 0 THEN
        SELECT points_per_dollar INTO v_points
        FROM rewards_programs
        WHERE is_default = true;

        v_points := p_amount * COALESCE(v_points, 1);
    END IF;

    RETURN v_points;
END;
$$ LANGUAGE plpgsql;

-- Calculate cashback for transaction
CREATE OR REPLACE FUNCTION calculate_transaction_cashback(
    p_user_id UUID,
    p_amount DECIMAL,
    p_mcc_code VARCHAR,
    p_merchant_name VARCHAR,
    p_quarter INT DEFAULT NULL
) RETURNS DECIMAL AS $$
DECLARE
    v_cashback DECIMAL := 0;
    v_rate DECIMAL := 1;
BEGIN
    -- Check rotating categories first
    IF p_quarter IS NOT NULL THEN
        SELECT cashback_rate INTO v_rate
        FROM cashback_categories cc
        JOIN user_cashback_activations uca ON cc.id = uca.category_id
        WHERE uca.user_id = p_user_id
        AND uca.is_active = true
        AND cc.is_active = true
        AND cc.quarter = p_quarter
        AND p_mcc_code = ANY(cc.mcc_codes)
        AND CURRENT_DATE BETWEEN cc.start_date AND cc.end_date;
    END IF;

    -- If no rotating category match, use standard rules
    IF v_rate = 1 THEN
        SELECT er.cashback_rate INTO v_rate
        FROM earning_rules er
        JOIN rewards_programs rp ON er.program_id = rp.id
        WHERE er.is_active = true
        AND (er.mcc_codes IS NULL OR p_mcc_code = ANY(er.mcc_codes))
        ORDER BY er.priority DESC
        LIMIT 1;
    END IF;

    -- Calculate cashback
    v_cashback := p_amount * (COALESCE(v_rate, 1) / 100);

    RETURN v_cashback;
END;
$$ LANGUAGE plpgsql;

-- Update user tier based on spending
CREATE OR REPLACE FUNCTION update_user_tier(p_user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_annual_spending DECIMAL;
    v_new_tier VARCHAR;
    v_current_tier VARCHAR;
BEGIN
    -- Get current annual spending
    SELECT SUM(source_amount)
    INTO v_annual_spending
    FROM rewards_transactions
    WHERE user_id = p_user_id
    AND transaction_type = 'earn'
    AND created_at >= CURRENT_DATE - INTERVAL '1 year';

    -- Determine new tier
    SELECT tier_name INTO v_new_tier
    FROM reward_tiers
    WHERE is_active = true
    AND min_annual_spending <= v_annual_spending
    ORDER BY tier_level DESC
    LIMIT 1;

    -- Get current tier
    SELECT current_tier INTO v_current_tier
    FROM rewards_accounts
    WHERE user_id = p_user_id;

    -- Update if tier changed
    IF v_new_tier != v_current_tier THEN
        UPDATE rewards_accounts
        SET current_tier = v_new_tier,
            tier_qualification_amount = v_annual_spending,
            tier_expiry_date = CURRENT_DATE + INTERVAL '1 year',
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id;

        -- Record tier change
        INSERT INTO user_tier_history (
            user_id,
            account_id,
            previous_tier,
            new_tier,
            change_reason,
            qualification_amount
        )
        SELECT
            p_user_id,
            id,
            v_current_tier,
            v_new_tier,
            'Annual spending qualification',
            v_annual_spending
        FROM rewards_accounts
        WHERE user_id = p_user_id;
    END IF;

    RETURN v_new_tier;
END;
$$ LANGUAGE plpgsql;

-- Process points expiry
CREATE OR REPLACE FUNCTION process_points_expiry()
RETURNS INT AS $$
DECLARE
    v_expired_count INT := 0;
BEGIN
    -- Mark expired points
    UPDATE rewards_transactions
    SET status = 'expired',
        expired_amount = amount
    WHERE status = 'completed'
    AND reward_type = 'points'
    AND expires_at < CURRENT_TIMESTAMP;

    GET DIAGNOSTICS v_expired_count = ROW_COUNT;

    -- Update user balances
    UPDATE rewards_accounts ra
    SET points_balance = (
        SELECT COALESCE(SUM(
            CASE
                WHEN rt.transaction_type = 'earn' AND rt.status = 'completed' THEN rt.points_amount
                WHEN rt.transaction_type = 'redeem' THEN -rt.points_amount
                ELSE 0
            END
        ), 0)
        FROM rewards_transactions rt
        WHERE rt.user_id = ra.user_id
        AND rt.status IN ('completed', 'redeemed')
    );

    RETURN v_expired_count;
END;
$$ LANGUAGE plpgsql;

-- ==================== TRIGGERS ====================

-- Update rewards account balances
CREATE OR REPLACE FUNCTION update_rewards_balances()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_type IN ('earn', 'bonus') THEN
        UPDATE rewards_accounts
        SET points_balance = points_balance + COALESCE(NEW.points_amount, 0),
            cashback_balance = cashback_balance + COALESCE(NEW.cashback_amount, 0),
            lifetime_points_earned = lifetime_points_earned + COALESCE(NEW.points_amount, 0),
            lifetime_cashback_earned = lifetime_cashback_earned + COALESCE(NEW.cashback_amount, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id;
    ELSIF NEW.transaction_type = 'redeem' THEN
        UPDATE rewards_accounts
        SET points_balance = points_balance - COALESCE(NEW.points_amount, 0),
            cashback_balance = cashback_balance - COALESCE(NEW.cashback_amount, 0),
            lifetime_points_redeemed = lifetime_points_redeemed + COALESCE(NEW.points_amount, 0),
            lifetime_cashback_redeemed = lifetime_cashback_redeemed + COALESCE(NEW.cashback_amount, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_balances_on_transaction
AFTER INSERT ON rewards_transactions
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION update_rewards_balances();

-- Update spending totals
CREATE OR REPLACE FUNCTION update_spending_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE rewards_accounts
    SET current_month_spending = (
            SELECT COALESCE(SUM(source_amount), 0)
            FROM rewards_transactions
            WHERE user_id = NEW.user_id
            AND transaction_type = 'earn'
            AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
        ),
        current_year_spending = (
            SELECT COALESCE(SUM(source_amount), 0)
            FROM rewards_transactions
            WHERE user_id = NEW.user_id
            AND transaction_type = 'earn'
            AND created_at >= DATE_TRUNC('year', CURRENT_DATE)
        ),
        total_transactions = total_transactions + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id;

    -- Check for tier upgrade
    PERFORM update_user_tier(NEW.user_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_spending_on_earn
AFTER INSERT ON rewards_transactions
FOR EACH ROW
WHEN (NEW.transaction_type = 'earn' AND NEW.status = 'completed')
EXECUTE FUNCTION update_spending_totals();

-- ==================== INDEXES ====================

CREATE INDEX idx_rewards_accounts_user ON rewards_accounts(user_id);
CREATE INDEX idx_rewards_transactions_user_date ON rewards_transactions(user_id, created_at DESC);
CREATE INDEX idx_rewards_transactions_expires ON rewards_transactions(expires_at)
    WHERE status = 'completed' AND expires_at IS NOT NULL;
CREATE INDEX idx_earning_rules_mcc ON earning_rules USING GIN (mcc_codes);
CREATE INDEX idx_redemptions_user_status ON rewards_redemptions(user_id, status);
CREATE INDEX idx_partner_offers_valid ON partner_offers(valid_from, valid_until)
    WHERE is_active = true;
CREATE INDEX idx_user_campaigns ON user_campaign_participation(user_id, is_completed);

-- ==================== INITIAL DATA ====================

-- Insert default tiers
INSERT INTO reward_tiers (tier_name, tier_level, min_annual_spending, points_multiplier, cashback_bonus, description)
VALUES
    ('bronze', 1, 0, 1.0, 0, 'Base tier for all members'),
    ('silver', 2, 5000, 1.25, 0.25, '25% more points on all purchases'),
    ('gold', 3, 15000, 1.5, 0.5, '50% more points and bonus cashback'),
    ('platinum', 4, 30000, 2.0, 1.0, 'Double points and premium benefits'),
    ('diamond', 5, 50000, 3.0, 2.0, 'Triple points and exclusive perks')
ON CONFLICT (tier_name) DO NOTHING;

-- Insert default rewards program
INSERT INTO rewards_programs (
    program_code,
    name,
    description,
    program_type,
    base_earn_rate,
    points_per_dollar,
    cashback_percentage,
    is_default,
    auto_enroll
)
VALUES (
    'DEFAULT',
    'Monay Rewards',
    'Earn points and cashback on every purchase',
    'mixed',
    1.0,
    1.0,
    1.0,
    true,
    true
)
ON CONFLICT (program_code) DO NOTHING;

-- Insert base earning rules
INSERT INTO earning_rules (program_id, rule_name, rule_type, categories, points_multiplier, cashback_rate, priority)
SELECT
    id,
    'Dining',
    'category',
    ARRAY['restaurants', 'food_delivery'],
    3.0,
    3.0,
    200
FROM rewards_programs WHERE program_code = 'DEFAULT'
ON CONFLICT DO NOTHING;

INSERT INTO earning_rules (program_id, rule_name, rule_type, categories, points_multiplier, cashback_rate, priority)
SELECT
    id,
    'Travel',
    'category',
    ARRAY['airlines', 'hotels', 'car_rental'],
    2.0,
    2.0,
    190
FROM rewards_programs WHERE program_code = 'DEFAULT'
ON CONFLICT DO NOTHING;

INSERT INTO earning_rules (program_id, rule_name, rule_type, categories, points_multiplier, cashback_rate, priority)
SELECT
    id,
    'Groceries',
    'category',
    ARRAY['grocery_stores', 'supermarkets'],
    2.0,
    2.0,
    180
FROM rewards_programs WHERE program_code = 'DEFAULT'
ON CONFLICT DO NOTHING;

INSERT INTO earning_rules (program_id, rule_name, rule_type, categories, points_multiplier, cashback_rate, priority)
SELECT
    id,
    'Gas Stations',
    'category',
    ARRAY['gas_stations'],
    2.0,
    2.0,
    170
FROM rewards_programs WHERE program_code = 'DEFAULT'
ON CONFLICT DO NOTHING;

-- ==================== COMMENTS ====================

COMMENT ON TABLE rewards_accounts IS 'User rewards and cashback account balances and tier information';
COMMENT ON TABLE rewards_programs IS 'Reward program definitions and earning structures';
COMMENT ON TABLE earning_rules IS 'Category and merchant-specific earning rules and multipliers';
COMMENT ON TABLE rewards_transactions IS 'All points and cashback earning/redemption transactions';
COMMENT ON TABLE rewards_catalog IS 'Available rewards for redemption';
COMMENT ON TABLE rewards_redemptions IS 'User reward redemption history';
COMMENT ON TABLE rewards_partners IS 'Partner merchants and their reward programs';
COMMENT ON TABLE reward_tiers IS 'Membership tier definitions and benefits';
COMMENT ON TABLE cashback_categories IS 'Rotating quarterly cashback categories';
COMMENT ON TABLE bonus_campaigns IS 'Special bonus earning campaigns and promotions';