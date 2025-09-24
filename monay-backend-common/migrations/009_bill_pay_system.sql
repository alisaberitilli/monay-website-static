-- Consumer Wallet Phase 3 Day 12: Bill Pay System
-- Migration: 009_bill_pay_system.sql
-- Database Safety: No DROP/DELETE/TRUNCATE operations

-- 1. Payees Table (Bill recipients)
CREATE TABLE IF NOT EXISTS payees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Payee Information
    payee_name VARCHAR(255) NOT NULL,
    payee_nickname VARCHAR(100),
    payee_type VARCHAR(50) NOT NULL CHECK (
        payee_type IN (
            'utility', 'telecom', 'insurance', 'loan',
            'credit_card', 'mortgage', 'rent', 'government',
            'education', 'healthcare', 'business', 'personal', 'other'
        )
    ),
    
    -- Account Information
    account_number VARCHAR(100),
    account_number_encrypted TEXT,
    routing_number VARCHAR(9),
    reference_number VARCHAR(100),
    
    -- Payment Details
    payment_method VARCHAR(50) CHECK (
        payment_method IN ('ach', 'wire', 'check', 'electronic')
    ),
    preferred_payment_type VARCHAR(50) DEFAULT 'electronic',
    
    -- Address Information
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    country VARCHAR(2) DEFAULT 'US',
    
    -- Contact Information
    phone_number VARCHAR(20),
    email VARCHAR(255),
    website_url TEXT,
    
    -- Electronic Billing
    is_electronic BOOLEAN DEFAULT TRUE,
    ebill_provider VARCHAR(100),
    ebill_account_id VARCHAR(255),
    ebill_credentials_encrypted TEXT,
    last_ebill_fetch TIMESTAMP,
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    verification_method VARCHAR(50),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN ('active', 'inactive', 'suspended', 'archived')
    ),
    
    -- Statistics
    payment_count INTEGER DEFAULT 0,
    total_paid DECIMAL(15, 2) DEFAULT 0,
    last_payment_date DATE,
    last_payment_amount DECIMAL(15, 2),
    
    -- Metadata
    logo_url TEXT,
    category VARCHAR(50),
    tags TEXT[],
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_payees_user (user_id),
    INDEX idx_payees_type (payee_type),
    INDEX idx_payees_status (status),
    UNIQUE INDEX idx_payees_user_account (user_id, account_number, payee_name)
);

-- 2. Bills Table (Individual bills to be paid)
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    payee_id UUID NOT NULL REFERENCES payees(id),
    
    -- Bill Information
    bill_number VARCHAR(100),
    statement_date DATE,
    due_date DATE NOT NULL,
    
    -- Amounts
    amount_due DECIMAL(15, 2) NOT NULL,
    minimum_payment DECIMAL(15, 2),
    total_amount DECIMAL(15, 2),
    past_due_amount DECIMAL(15, 2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (
        status IN (
            'unpaid', 'scheduled', 'processing', 'paid',
            'partial', 'overdue', 'disputed', 'cancelled', 'archived'
        )
    ),
    
    -- Payment Information
    payment_status VARCHAR(20),
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    paid_date TIMESTAMP,
    payment_confirmation VARCHAR(255),
    
    -- Electronic Bill Details
    is_ebill BOOLEAN DEFAULT FALSE,
    ebill_url TEXT,
    pdf_url TEXT,
    auto_pay_enabled BOOLEAN DEFAULT FALSE,
    
    -- Scheduling
    scheduled_payment_id UUID,
    scheduled_payment_date DATE,
    scheduled_payment_amount DECIMAL(15, 2),
    
    -- Reminders
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP,
    days_before_due_reminder INTEGER DEFAULT 3,
    
    -- Metadata
    category VARCHAR(50),
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_bills_user (user_id),
    INDEX idx_bills_payee (payee_id),
    INDEX idx_bills_due_date (due_date),
    INDEX idx_bills_status (status)
);

-- 3. Bill Payments Table (Payment transactions for bills)
CREATE TABLE IF NOT EXISTS bill_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    bill_id UUID REFERENCES bills(id),
    payee_id UUID NOT NULL REFERENCES payees(id),
    wallet_id UUID NOT NULL REFERENCES wallets(id),
    
    -- Payment Details
    payment_method VARCHAR(50) NOT NULL CHECK (
        payment_method IN (
            'ach', 'wire', 'check', 'debit_card', 'wallet_balance'
        )
    ),
    payment_source_id UUID, -- References payment method ID
    
    -- Amounts
    amount DECIMAL(15, 2) NOT NULL,
    fee_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Processing
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending', 'processing', 'completed', 'failed',
            'cancelled', 'reversed', 'refunded'
        )
    ),
    
    -- Transaction References
    transaction_id UUID REFERENCES transactions(id),
    processor_reference VARCHAR(255),
    confirmation_number VARCHAR(100),
    
    -- Check Details (if applicable)
    check_number VARCHAR(20),
    check_memo VARCHAR(255),
    check_status VARCHAR(20) CHECK (
        check_status IN (
            'pending', 'printed', 'mailed', 'delivered',
            'cashed', 'returned', 'stopped', 'void'
        )
    ),
    check_mailed_date DATE,
    check_cleared_date DATE,
    
    -- Processing Details
    processing_date DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Error Handling
    failure_reason TEXT,
    retry_count INTEGER DEFAULT 0,
    retry_after TIMESTAMP,
    
    -- Metadata
    reference_number VARCHAR(100),
    memo TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_bill_payments_user (user_id),
    INDEX idx_bill_payments_bill (bill_id),
    INDEX idx_bill_payments_payee (payee_id),
    INDEX idx_bill_payments_status (status),
    INDEX idx_bill_payments_date (created_at DESC)
);

-- 4. Recurring Bills Table (Auto-pay setup)
CREATE TABLE IF NOT EXISTS recurring_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    payee_id UUID NOT NULL REFERENCES payees(id),
    
    -- Recurrence Settings
    recurrence_pattern VARCHAR(20) NOT NULL CHECK (
        recurrence_pattern IN (
            'monthly', 'quarterly', 'semi_annually', 'annually', 'custom'
        )
    ),
    custom_interval_days INTEGER,
    
    -- Payment Settings
    payment_day INTEGER CHECK (payment_day >= 1 AND payment_day <= 31),
    payment_timing VARCHAR(20) CHECK (
        payment_timing IN ('on_due_date', 'days_before', 'fixed_day')
    ),
    days_before_due INTEGER DEFAULT 2,
    
    -- Amount Settings
    amount_type VARCHAR(20) NOT NULL CHECK (
        amount_type IN ('fixed', 'full_balance', 'minimum', 'percentage')
    ),
    fixed_amount DECIMAL(15, 2),
    percentage_amount DECIMAL(5, 2),
    max_amount DECIMAL(15, 2),
    
    -- Payment Method
    payment_method VARCHAR(50) NOT NULL,
    payment_source_id UUID,
    
    -- Auto-pay Control
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE,
    next_payment_date DATE,
    
    -- Limits and Controls
    monthly_limit DECIMAL(15, 2),
    require_approval_above DECIMAL(15, 2),
    auto_increase_limit BOOLEAN DEFAULT FALSE,
    max_auto_increase_percent DECIMAL(5, 2) DEFAULT 10,
    
    -- Statistics
    payments_made INTEGER DEFAULT 0,
    total_amount_paid DECIMAL(15, 2) DEFAULT 0,
    last_payment_date DATE,
    last_payment_amount DECIMAL(15, 2),
    failed_payments INTEGER DEFAULT 0,
    
    -- Notification Settings
    notify_before_payment BOOLEAN DEFAULT TRUE,
    notify_days_before INTEGER DEFAULT 2,
    notify_on_payment BOOLEAN DEFAULT TRUE,
    notify_on_failure BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paused_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_recurring_bills_user (user_id),
    INDEX idx_recurring_bills_payee (payee_id),
    INDEX idx_recurring_bills_next_payment (next_payment_date),
    INDEX idx_recurring_bills_active (is_active)
);

-- 5. Check Register Table (Physical check tracking)
CREATE TABLE IF NOT EXISTS check_register (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    bill_payment_id UUID REFERENCES bill_payments(id),
    
    -- Check Details
    check_number VARCHAR(20) NOT NULL,
    check_amount DECIMAL(15, 2) NOT NULL,
    payee_name VARCHAR(255) NOT NULL,
    
    -- Status Tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending', 'printed', 'signed', 'mailed',
            'in_transit', 'delivered', 'deposited', 'cleared',
            'returned', 'stopped', 'void', 'lost', 'reissued'
        )
    ),
    
    -- Dates
    issue_date DATE NOT NULL,
    mail_date DATE,
    expected_delivery_date DATE,
    deposited_date DATE,
    cleared_date DATE,
    void_date DATE,
    
    -- Tracking
    tracking_number VARCHAR(100),
    delivery_confirmation VARCHAR(100),
    
    -- Stop Payment
    stop_payment_requested BOOLEAN DEFAULT FALSE,
    stop_payment_date TIMESTAMP,
    stop_payment_reason TEXT,
    stop_payment_fee DECIMAL(10, 2),
    
    -- Reissue
    is_reissue BOOLEAN DEFAULT FALSE,
    original_check_id UUID REFERENCES check_register(id),
    reissue_reason TEXT,
    
    -- Images
    check_image_front_url TEXT,
    check_image_back_url TEXT,
    
    -- Metadata
    memo TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_check_register_user (user_id),
    INDEX idx_check_register_number (check_number),
    INDEX idx_check_register_status (status),
    INDEX idx_check_register_date (issue_date DESC)
);

-- 6. Payee Templates Table (Common payees for quick setup)
CREATE TABLE IF NOT EXISTS payee_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Template Information
    template_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    
    -- Common Details
    typical_account_prefix VARCHAR(50),
    account_number_format VARCHAR(100), -- Regex pattern
    routing_number VARCHAR(9),
    
    -- Payment Information
    supported_payment_methods TEXT[],
    preferred_payment_method VARCHAR(50),
    
    -- Address
    payment_address_line1 VARCHAR(255),
    payment_address_line2 VARCHAR(255),
    payment_city VARCHAR(100),
    payment_state VARCHAR(2),
    payment_zip VARCHAR(10),
    
    -- Electronic Billing
    supports_ebill BOOLEAN DEFAULT FALSE,
    ebill_provider VARCHAR(100),
    ebill_url TEXT,
    
    -- Verification
    is_verified BOOLEAN DEFAULT TRUE,
    verification_source VARCHAR(100),
    
    -- Usage
    usage_count INTEGER DEFAULT 0,
    popularity_score DECIMAL(5, 2) DEFAULT 0,
    
    -- Metadata
    logo_url TEXT,
    website_url TEXT,
    customer_service_phone VARCHAR(20),
    notes TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_payee_templates_category (category),
    INDEX idx_payee_templates_company (company_name),
    INDEX idx_payee_templates_active (is_active)
);

-- 7. Bill Reminders Table
CREATE TABLE IF NOT EXISTS bill_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    bill_id UUID REFERENCES bills(id),
    recurring_bill_id UUID REFERENCES recurring_bills(id),
    
    -- Reminder Settings
    reminder_type VARCHAR(20) NOT NULL CHECK (
        reminder_type IN ('due_date', 'overdue', 'upcoming', 'custom')
    ),
    days_before_due INTEGER,
    reminder_date DATE NOT NULL,
    reminder_time TIME DEFAULT '10:00:00',
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'sent', 'failed', 'cancelled', 'archived')
    ),
    
    -- Delivery
    delivery_method VARCHAR(20) CHECK (
        delivery_method IN ('email', 'sms', 'push', 'all')
    ),
    sent_at TIMESTAMP,
    
    -- Content
    subject VARCHAR(255),
    message TEXT,
    
    -- Response
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP,
    action_taken VARCHAR(50),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_bill_reminders_user (user_id),
    INDEX idx_bill_reminders_bill (bill_id),
    INDEX idx_bill_reminders_date (reminder_date),
    INDEX idx_bill_reminders_status (status)
);

-- 8. Functions

-- Function to calculate next bill payment date
CREATE OR REPLACE FUNCTION calculate_next_bill_date(
    p_recurrence_pattern VARCHAR(20),
    p_current_date DATE,
    p_payment_day INTEGER DEFAULT NULL
)
RETURNS DATE AS $$
DECLARE
    v_next_date DATE;
BEGIN
    CASE p_recurrence_pattern
        WHEN 'monthly' THEN
            IF p_payment_day IS NOT NULL THEN
                v_next_date := DATE_TRUNC('month', p_current_date + INTERVAL '1 month')
                    + (p_payment_day - 1) * INTERVAL '1 day';
            ELSE
                v_next_date := p_current_date + INTERVAL '1 month';
            END IF;
        WHEN 'quarterly' THEN
            v_next_date := p_current_date + INTERVAL '3 months';
        WHEN 'semi_annually' THEN
            v_next_date := p_current_date + INTERVAL '6 months';
        WHEN 'annually' THEN
            v_next_date := p_current_date + INTERVAL '1 year';
        ELSE
            v_next_date := p_current_date + INTERVAL '1 month';
    END CASE;
    
    RETURN v_next_date;
END;
$$ LANGUAGE plpgsql;

-- Function to update payee statistics
CREATE OR REPLACE FUNCTION update_payee_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE payees
        SET payment_count = payment_count + 1,
            total_paid = total_paid + NEW.amount,
            last_payment_date = CURRENT_DATE,
            last_payment_amount = NEW.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.payee_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating payee stats
CREATE TRIGGER update_payee_stats_on_payment
    AFTER UPDATE ON bill_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payee_stats();

-- Function to check for overdue bills
CREATE OR REPLACE FUNCTION mark_overdue_bills()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE bills
    SET status = 'overdue',
        updated_at = CURRENT_TIMESTAMP
    WHERE status = 'unpaid'
    AND due_date < CURRENT_DATE;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to validate check number format
CREATE OR REPLACE FUNCTION validate_check_number(
    p_check_number VARCHAR(20)
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check number should be numeric and between 1-10 digits
    RETURN p_check_number ~ '^[0-9]{1,10}$';
END;
$$ LANGUAGE plpgsql;

-- Insert common payee templates
INSERT INTO payee_templates (
    template_name, company_name, category,
    supported_payment_methods, preferred_payment_method,
    supports_ebill, is_verified
) VALUES
('Electric Company', 'Generic Electric Co', 'utility',
 ARRAY['ach', 'check', 'electronic'], 'electronic', TRUE, TRUE),
('Gas Company', 'Generic Gas Co', 'utility',
 ARRAY['ach', 'check', 'electronic'], 'electronic', TRUE, TRUE),
('Water Company', 'Generic Water Co', 'utility',
 ARRAY['ach', 'check'], 'ach', FALSE, TRUE),
('Internet Provider', 'Generic ISP', 'telecom',
 ARRAY['ach', 'electronic'], 'electronic', TRUE, TRUE),
('Mobile Carrier', 'Generic Mobile', 'telecom',
 ARRAY['ach', 'electronic'], 'electronic', TRUE, TRUE),
('Auto Insurance', 'Generic Insurance Co', 'insurance',
 ARRAY['ach', 'check', 'electronic'], 'ach', TRUE, TRUE),
('Mortgage Company', 'Generic Mortgage', 'mortgage',
 ARRAY['ach', 'check'], 'ach', FALSE, TRUE),
('Credit Card', 'Generic Bank', 'credit_card',
 ARRAY['ach', 'electronic'], 'electronic', TRUE, TRUE),
('Student Loan', 'Generic Student Loans', 'loan',
 ARRAY['ach', 'check'], 'ach', TRUE, TRUE),
('Property Management', 'Generic Property Mgmt', 'rent',
 ARRAY['ach', 'check'], 'check', FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bills_user_due_date ON bills(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_bill_payments_user_created ON bill_payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_active_next ON recurring_bills(is_active, next_payment_date)
 WHERE is_active = TRUE;