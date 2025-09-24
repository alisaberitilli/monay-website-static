-- Consumer Wallet Phase 3 Day 11: Recurring Payments System
-- Migration: 008_recurring_payments.sql

-- 1. Subscriptions Table (Main recurring payment records)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    
    -- Subscription Details
    subscription_name VARCHAR(255) NOT NULL,
    description TEXT,
    merchant_name VARCHAR(255) NOT NULL,
    merchant_category VARCHAR(100),
    merchant_identifier VARCHAR(255), -- For matching transactions
    
    -- Payment Configuration
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method_type VARCHAR(50) NOT NULL CHECK (
        payment_method_type IN ('card', 'bank_account', 'wallet_balance')
    ),
    payment_method_id UUID, -- References card or bank account
    
    -- Billing Cycle
    billing_cycle VARCHAR(20) NOT NULL CHECK (
        billing_cycle IN (
            'daily', 'weekly', 'biweekly', 'monthly', 
            'quarterly', 'semi_annually', 'annually', 'custom'
        )
    ),
    custom_interval_days INTEGER, -- For custom billing cycles
    billing_day INTEGER, -- Day of month (1-31) for monthly
    billing_weekday INTEGER, -- Day of week (0-6) for weekly
    
    -- Subscription Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending', 'active', 'paused', 'cancelled', 
            'expired', 'payment_failed', 'suspended'
        )
    ),
    
    -- Dates
    start_date DATE NOT NULL,
    next_billing_date DATE NOT NULL,
    last_billing_date DATE,
    end_date DATE, -- For fixed-term subscriptions
    trial_end_date DATE,
    
    -- Payment Processing
    auto_renew BOOLEAN DEFAULT TRUE,
    retry_failed_payments BOOLEAN DEFAULT TRUE,
    max_retry_attempts INTEGER DEFAULT 3,
    payment_grace_period_days INTEGER DEFAULT 3,
    
    -- Notification Settings
    notify_before_charge BOOLEAN DEFAULT TRUE,
    notify_days_before INTEGER DEFAULT 3,
    notify_on_success BOOLEAN DEFAULT TRUE,
    notify_on_failure BOOLEAN DEFAULT TRUE,
    
    -- Statistics
    total_payments_made INTEGER DEFAULT 0,
    total_amount_paid DECIMAL(15, 2) DEFAULT 0,
    failed_payment_count INTEGER DEFAULT 0,
    last_payment_status VARCHAR(20),
    last_payment_date TIMESTAMP,
    
    -- Metadata
    category VARCHAR(50), -- Entertainment, Utilities, etc.
    tags TEXT[], -- User-defined tags
    notes TEXT,
    external_subscription_id VARCHAR(255), -- Merchant's subscription ID
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_subscriptions_user (user_id),
    INDEX idx_subscriptions_status (status),
    INDEX idx_subscriptions_next_billing (next_billing_date),
    INDEX idx_subscriptions_merchant (merchant_name)
);

-- 2. Scheduled Payments Table (One-time and recurring scheduled payments)
CREATE TABLE IF NOT EXISTS scheduled_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    subscription_id UUID REFERENCES subscriptions(id),
    
    -- Payment Details
    payment_type VARCHAR(20) NOT NULL CHECK (
        payment_type IN ('one_time', 'recurring', 'subscription')
    ),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Payee Information
    payee_name VARCHAR(255) NOT NULL,
    payee_type VARCHAR(50) CHECK (
        payee_type IN ('merchant', 'individual', 'bill', 'loan', 'other')
    ),
    payee_account_details JSONB, -- Encrypted payment details
    
    -- Payment Method
    payment_method_type VARCHAR(50) NOT NULL,
    payment_method_id UUID,
    
    -- Schedule
    scheduled_date DATE NOT NULL,
    scheduled_time TIME,
    execute_at TIMESTAMP NOT NULL, -- Computed from date+time+timezone
    
    -- Processing Window
    processing_window_start TIME DEFAULT '08:00:00',
    processing_window_end TIME DEFAULT '20:00:00',
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (
        status IN (
            'scheduled', 'pending', 'processing', 'completed',
            'failed', 'cancelled', 'skipped', 'retry_pending'
        )
    ),
    
    -- Execution Details
    executed_at TIMESTAMP,
    transaction_id UUID REFERENCES transactions(id),
    execution_attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP,
    last_attempt_error TEXT,
    
    -- Retry Configuration
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP,
    
    -- Metadata
    reference_number VARCHAR(100),
    memo TEXT,
    category VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_scheduled_payments_user (user_id),
    INDEX idx_scheduled_payments_subscription (subscription_id),
    INDEX idx_scheduled_payments_execute (execute_at),
    INDEX idx_scheduled_payments_status (status)
);

-- 3. Payment Schedules Table (Recurring schedule definitions)
CREATE TABLE IF NOT EXISTS payment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id),
    
    -- Schedule Pattern
    schedule_type VARCHAR(20) NOT NULL CHECK (
        schedule_type IN ('fixed', 'variable', 'milestone')
    ),
    
    -- Recurrence Rules (RFC 5545 RRULE format)
    recurrence_rule TEXT, -- e.g., "FREQ=MONTHLY;BYMONTHDAY=15"
    
    -- Fixed Schedule
    frequency VARCHAR(20),
    interval_value INTEGER DEFAULT 1,
    
    -- Variable Schedule (for irregular payments)
    custom_dates DATE[],
    
    -- Milestone Schedule
    milestone_conditions JSONB, -- Conditions that trigger payment
    
    -- Schedule Constraints
    skip_weekends BOOLEAN DEFAULT FALSE,
    skip_holidays BOOLEAN DEFAULT FALSE,
    adjust_to_business_day VARCHAR(20) CHECK (
        adjust_to_business_day IN ('before', 'after', 'nearest')
    ),
    
    -- Amount Rules
    amount_type VARCHAR(20) CHECK (
        amount_type IN ('fixed', 'variable', 'percentage')
    ),
    fixed_amount DECIMAL(15, 2),
    percentage_of_balance DECIMAL(5, 2),
    min_amount DECIMAL(15, 2),
    max_amount DECIMAL(15, 2),
    
    -- Active Period
    effective_from DATE NOT NULL,
    effective_until DATE,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_payment_schedules_subscription (subscription_id)
);

-- 4. Subscription Transactions Table
CREATE TABLE IF NOT EXISTS subscription_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    scheduled_payment_id UUID REFERENCES scheduled_payments(id),
    transaction_id UUID REFERENCES transactions(id),
    
    -- Transaction Details
    amount DECIMAL(15, 2) NOT NULL,
    fee_amount DECIMAL(15, 2) DEFAULT 0,
    net_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Status
    status VARCHAR(20) NOT NULL CHECK (
        status IN (
            'pending', 'processing', 'success', 'failed',
            'reversed', 'refunded', 'disputed'
        )
    ),
    
    -- Processing Details
    payment_method_used VARCHAR(50),
    processor_reference VARCHAR(255),
    authorization_code VARCHAR(100),
    
    -- Failure Information
    failure_reason VARCHAR(100),
    failure_code VARCHAR(50),
    retry_eligible BOOLEAN DEFAULT TRUE,
    
    -- Billing Period
    billing_period_start DATE,
    billing_period_end DATE,
    
    -- Timestamps
    initiated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_subscription_trans_subscription (subscription_id),
    INDEX idx_subscription_trans_status (status),
    INDEX idx_subscription_trans_date (initiated_at DESC)
);

-- 5. Payment Retry Queue Table
CREATE TABLE IF NOT EXISTS payment_retry_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_payment_id UUID REFERENCES scheduled_payments(id),
    subscription_id UUID REFERENCES subscriptions(id),
    
    -- Retry Details
    retry_attempt INTEGER NOT NULL DEFAULT 1,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    
    -- Scheduling
    scheduled_for TIMESTAMP NOT NULL,
    processing_started_at TIMESTAMP,
    processing_completed_at TIMESTAMP,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending', 'processing', 'completed',
            'failed', 'cancelled', 'max_attempts_reached', 'archived'
        )
    ),
    
    -- Retry Strategy
    retry_strategy VARCHAR(50) DEFAULT 'exponential_backoff',
    backoff_minutes INTEGER[], -- e.g., [60, 240, 1440] for 1hr, 4hr, 24hr
    
    -- Last Attempt Details
    last_error_message TEXT,
    last_error_code VARCHAR(50),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_retry_queue_scheduled (scheduled_for),
    INDEX idx_retry_queue_status (status)
);

-- 6. Subscription Categories Table
CREATE TABLE IF NOT EXISTS subscription_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Category Details
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    color_hex VARCHAR(7),
    
    -- Category Type
    category_type VARCHAR(50) CHECK (
        category_type IN ('system', 'custom')
    ),
    parent_category_id UUID REFERENCES subscription_categories(id),
    
    -- Statistics
    usage_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_subscription_categories_active (is_active)
);

-- 7. Merchant Recognizers Table (For auto-detecting subscriptions)
CREATE TABLE IF NOT EXISTS merchant_recognizers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Recognition Patterns
    merchant_name_pattern VARCHAR(255) NOT NULL,
    transaction_description_pattern VARCHAR(255),
    mcc_codes VARCHAR(4)[],
    
    -- Subscription Hints
    likely_subscription BOOLEAN DEFAULT FALSE,
    typical_billing_cycle VARCHAR(20),
    typical_amount_range NUMRANGE,
    
    -- Categorization
    suggested_category VARCHAR(100),
    suggested_name VARCHAR(255),
    logo_url TEXT,
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
    
    -- Usage Statistics
    match_count INTEGER DEFAULT 0,
    last_matched_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_merchant_recognizers_pattern (merchant_name_pattern),
    INDEX idx_merchant_recognizers_verified (is_verified)
);

-- 8. Functions

-- Function to calculate next billing date
CREATE OR REPLACE FUNCTION calculate_next_billing_date(
    p_current_date DATE,
    p_billing_cycle VARCHAR(20),
    p_custom_interval_days INTEGER DEFAULT NULL,
    p_billing_day INTEGER DEFAULT NULL,
    p_billing_weekday INTEGER DEFAULT NULL
)
RETURNS DATE AS $$
DECLARE
    v_next_date DATE;
BEGIN
    CASE p_billing_cycle
        WHEN 'daily' THEN
            v_next_date := p_current_date + INTERVAL '1 day';
        WHEN 'weekly' THEN
            v_next_date := p_current_date + INTERVAL '1 week';
        WHEN 'biweekly' THEN
            v_next_date := p_current_date + INTERVAL '2 weeks';
        WHEN 'monthly' THEN
            IF p_billing_day IS NOT NULL THEN
                -- Set to specific day of next month
                v_next_date := DATE_TRUNC('month', p_current_date + INTERVAL '1 month') 
                    + (p_billing_day - 1) * INTERVAL '1 day';
            ELSE
                v_next_date := p_current_date + INTERVAL '1 month';
            END IF;
        WHEN 'quarterly' THEN
            v_next_date := p_current_date + INTERVAL '3 months';
        WHEN 'semi_annually' THEN
            v_next_date := p_current_date + INTERVAL '6 months';
        WHEN 'annually' THEN
            v_next_date := p_current_date + INTERVAL '1 year';
        WHEN 'custom' THEN
            IF p_custom_interval_days IS NOT NULL THEN
                v_next_date := p_current_date + (p_custom_interval_days * INTERVAL '1 day');
            ELSE
                RAISE EXCEPTION 'Custom interval days required for custom billing cycle';
            END IF;
        ELSE
            RAISE EXCEPTION 'Invalid billing cycle: %', p_billing_cycle;
    END CASE;
    
    RETURN v_next_date;
END;
$$ LANGUAGE plpgsql;

-- Function to check if payment should be processed
CREATE OR REPLACE FUNCTION should_process_payment(
    p_scheduled_payment_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_payment RECORD;
    v_wallet_balance DECIMAL(15, 2);
BEGIN
    -- Get payment details
    SELECT * INTO v_payment
    FROM scheduled_payments
    WHERE id = p_scheduled_payment_id
        AND status = 'scheduled'
        AND execute_at <= CURRENT_TIMESTAMP;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check wallet balance
    SELECT available_balance INTO v_wallet_balance
    FROM wallets
    WHERE id = v_payment.wallet_id;
    
    IF v_wallet_balance < v_payment.amount THEN
        -- Mark for retry if configured
        UPDATE scheduled_payments
        SET status = 'retry_pending',
            last_attempt_error = 'Insufficient funds'
        WHERE id = p_scheduled_payment_id;
        
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to create scheduled payments for subscription
CREATE OR REPLACE FUNCTION create_subscription_payment(
    p_subscription_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_subscription RECORD;
    v_payment_id UUID;
BEGIN
    -- Get subscription details
    SELECT * INTO v_subscription
    FROM subscriptions
    WHERE id = p_subscription_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription not found';
    END IF;
    
    -- Create scheduled payment
    INSERT INTO scheduled_payments (
        user_id,
        wallet_id,
        subscription_id,
        payment_type,
        amount,
        currency,
        payee_name,
        payee_type,
        payment_method_type,
        payment_method_id,
        scheduled_date,
        execute_at,
        status
    ) VALUES (
        v_subscription.user_id,
        v_subscription.wallet_id,
        v_subscription.id,
        'subscription',
        v_subscription.amount,
        v_subscription.currency,
        v_subscription.merchant_name,
        'merchant',
        v_subscription.payment_method_type,
        v_subscription.payment_method_id,
        v_subscription.next_billing_date,
        v_subscription.next_billing_date::TIMESTAMP,
        'scheduled'
    ) RETURNING id INTO v_payment_id;
    
    -- Update subscription next billing date
    UPDATE subscriptions
    SET next_billing_date = calculate_next_billing_date(
        v_subscription.next_billing_date,
        v_subscription.billing_cycle,
        v_subscription.custom_interval_days,
        v_subscription.billing_day,
        v_subscription.billing_weekday
    ),
    last_billing_date = v_subscription.next_billing_date
    WHERE id = p_subscription_id;
    
    RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to retry failed payment
CREATE OR REPLACE FUNCTION retry_failed_payment(
    p_scheduled_payment_id UUID,
    p_retry_attempt INTEGER
)
RETURNS VOID AS $$
DECLARE
    v_backoff_minutes INTEGER;
    v_next_retry TIMESTAMP;
BEGIN
    -- Calculate exponential backoff: 1hr, 4hr, 24hr
    CASE p_retry_attempt
        WHEN 1 THEN v_backoff_minutes := 60;
        WHEN 2 THEN v_backoff_minutes := 240;
        WHEN 3 THEN v_backoff_minutes := 1440;
        ELSE v_backoff_minutes := 1440;
    END CASE;
    
    v_next_retry := CURRENT_TIMESTAMP + (v_backoff_minutes * INTERVAL '1 minute');
    
    -- Add to retry queue
    INSERT INTO payment_retry_queue (
        scheduled_payment_id,
        retry_attempt,
        scheduled_for,
        backoff_minutes
    ) VALUES (
        p_scheduled_payment_id,
        p_retry_attempt,
        v_next_retry,
        ARRAY[v_backoff_minutes]
    );
    
    -- Update scheduled payment status
    UPDATE scheduled_payments
    SET status = 'retry_pending',
        retry_count = p_retry_attempt,
        next_retry_at = v_next_retry
    WHERE id = p_scheduled_payment_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update subscription stats after transaction
CREATE OR REPLACE FUNCTION update_subscription_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'success' THEN
        UPDATE subscriptions
        SET total_payments_made = total_payments_made + 1,
            total_amount_paid = total_amount_paid + NEW.amount,
            last_payment_status = 'success',
            last_payment_date = CURRENT_TIMESTAMP,
            failed_payment_count = 0 -- Reset on success
        WHERE id = NEW.subscription_id;
    ELSIF NEW.status = 'failed' THEN
        UPDATE subscriptions
        SET failed_payment_count = failed_payment_count + 1,
            last_payment_status = 'failed',
            status = CASE 
                WHEN failed_payment_count >= 3 THEN 'payment_failed'
                ELSE status
            END
        WHERE id = NEW.subscription_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_stats_trigger
    AFTER INSERT OR UPDATE ON subscription_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_stats();

-- Insert default subscription categories
INSERT INTO subscription_categories (name, display_name, category_type, icon_name, color_hex) VALUES
('streaming', 'Streaming Services', 'system', 'play-circle', '#FF6B6B'),
('utilities', 'Utilities', 'system', 'home', '#4ECDC4'),
('software', 'Software & Apps', 'system', 'cpu', '#45B7D1'),
('fitness', 'Fitness & Health', 'system', 'activity', '#96CEB4'),
('news', 'News & Media', 'system', 'book-open', '#FFEAA7'),
('gaming', 'Gaming', 'system', 'gamepad-2', '#DDA0DD'),
('music', 'Music', 'system', 'music', '#FF8C69'),
('cloud_storage', 'Cloud Storage', 'system', 'cloud', '#70A1D7'),
('education', 'Education', 'system', 'graduation-cap', '#A29BFE'),
('insurance', 'Insurance', 'system', 'shield', '#55A3FF'),
('telecom', 'Telecom', 'system', 'phone', '#00D2D3'),
('other', 'Other', 'system', 'tag', '#B2B2B2')
ON CONFLICT (name) DO NOTHING;

-- Insert common merchant recognizers
INSERT INTO merchant_recognizers (
    merchant_name_pattern, 
    likely_subscription, 
    typical_billing_cycle,
    suggested_category,
    suggested_name,
    is_verified,
    confidence_score
) VALUES
('NETFLIX%', TRUE, 'monthly', 'streaming', 'Netflix', TRUE, 1.00),
('SPOTIFY%', TRUE, 'monthly', 'music', 'Spotify', TRUE, 1.00),
('AMAZON PRIME%', TRUE, 'monthly', 'streaming', 'Amazon Prime', TRUE, 1.00),
('HULU%', TRUE, 'monthly', 'streaming', 'Hulu', TRUE, 1.00),
('DISNEY+%', TRUE, 'monthly', 'streaming', 'Disney+', TRUE, 1.00),
('APPLE.COM/BILL%', TRUE, 'monthly', 'software', 'Apple Services', TRUE, 0.95),
('GOOGLE%STORAGE%', TRUE, 'monthly', 'cloud_storage', 'Google Storage', TRUE, 0.90),
('DROPBOX%', TRUE, 'monthly', 'cloud_storage', 'Dropbox', TRUE, 1.00),
('ADOBE%', TRUE, 'monthly', 'software', 'Adobe Creative Cloud', TRUE, 1.00),
('MICROSOFT%365%', TRUE, 'monthly', 'software', 'Microsoft 365', TRUE, 1.00),
('GYM%', TRUE, 'monthly', 'fitness', 'Gym Membership', FALSE, 0.75),
('INSURANCE%', TRUE, 'monthly', 'insurance', 'Insurance', FALSE, 0.70)
ON CONFLICT DO NOTHING;