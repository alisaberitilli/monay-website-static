-- Consumer Wallet Phase 3 Day 13: Peer-to-Peer Transfer System
-- Migration: 010_p2p_transfers.sql
-- Database Safety: No DROP/DELETE/TRUNCATE operations

-- 1. P2P Transfers Table
CREATE TABLE IF NOT EXISTS p2p_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID REFERENCES users(id),
    sender_wallet_id UUID NOT NULL REFERENCES wallets(id),
    recipient_wallet_id UUID REFERENCES wallets(id),
    
    -- Transfer Details
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    fee_amount DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(15, 2) NOT NULL,
    
    -- Transfer Type
    transfer_type VARCHAR(20) NOT NULL CHECK (
        transfer_type IN ('instant', 'standard', 'request', 'split')
    ),
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending', 'processing', 'completed', 'failed',
            'cancelled', 'reversed', 'held', 'expired'
        )
    ),
    
    -- Recipient Information (for external transfers)
    recipient_identifier VARCHAR(255), -- Email, phone, or username
    recipient_identifier_type VARCHAR(20) CHECK (
        recipient_identifier_type IN ('email', 'phone', 'username', 'wallet_address')
    ),
    recipient_name VARCHAR(255),
    is_external BOOLEAN DEFAULT FALSE,
    
    -- Transfer Details
    memo TEXT,
    reference_number VARCHAR(100) UNIQUE,
    category VARCHAR(50),
    
    -- Security
    security_code VARCHAR(20),
    security_code_expires_at TIMESTAMP,
    verification_attempts INTEGER DEFAULT 0,
    max_verification_attempts INTEGER DEFAULT 3,
    
    -- Processing
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    failure_reason TEXT,
    
    -- Reversal Information
    is_reversed BOOLEAN DEFAULT FALSE,
    reversed_at TIMESTAMP,
    reversal_reason TEXT,
    original_transfer_id UUID REFERENCES p2p_transfers(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    device_info JSONB DEFAULT '{}',
    location_info JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_p2p_transfers_sender (sender_id),
    INDEX idx_p2p_transfers_recipient (recipient_id),
    INDEX idx_p2p_transfers_status (status),
    INDEX idx_p2p_transfers_created (created_at DESC),
    INDEX idx_p2p_transfers_reference (reference_number)
);

-- 2. Money Requests Table
CREATE TABLE IF NOT EXISTS money_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id),
    payer_id UUID REFERENCES users(id),
    
    -- Request Details
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending', 'viewed', 'accepted', 'declined',
            'cancelled', 'expired', 'paid', 'partial'
        )
    ),
    
    -- Payer Information
    payer_identifier VARCHAR(255),
    payer_identifier_type VARCHAR(20) CHECK (
        payer_identifier_type IN ('email', 'phone', 'username')
    ),
    payer_name VARCHAR(255),
    
    -- Request Details
    reason TEXT,
    memo TEXT,
    due_date DATE,
    category VARCHAR(50),
    
    -- Payment Information
    transfer_id UUID REFERENCES p2p_transfers(id),
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    paid_at TIMESTAMP,
    
    -- Reminder Settings
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_frequency VARCHAR(20) CHECK (
        reminder_frequency IN ('daily', 'every_3_days', 'weekly', 'none')
    ),
    last_reminder_sent TIMESTAMP,
    reminder_count INTEGER DEFAULT 0,
    max_reminders INTEGER DEFAULT 3,
    
    -- Response
    viewed_at TIMESTAMP,
    responded_at TIMESTAMP,
    decline_reason TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_money_requests_requester (requester_id),
    INDEX idx_money_requests_payer (payer_id),
    INDEX idx_money_requests_status (status),
    INDEX idx_money_requests_due (due_date)
);

-- 3. Split Bills Table
CREATE TABLE IF NOT EXISTS split_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id),
    
    -- Bill Details
    total_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Split Configuration
    split_type VARCHAR(20) NOT NULL CHECK (
        split_type IN ('equal', 'percentage', 'amount', 'custom')
    ),
    include_creator BOOLEAN DEFAULT TRUE,
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN (
            'draft', 'active', 'partial', 'settled',
            'cancelled', 'expired'
        )
    ),
    
    -- Settlement
    settled_amount DECIMAL(15, 2) DEFAULT 0,
    settled_at TIMESTAMP,
    
    -- Bill Information
    category VARCHAR(50),
    merchant_name VARCHAR(255),
    bill_date DATE,
    receipt_url TEXT,
    
    -- Settings
    allow_partial_payment BOOLEAN DEFAULT TRUE,
    auto_remind BOOLEAN DEFAULT TRUE,
    reminder_frequency VARCHAR(20) DEFAULT 'every_3_days',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags TEXT[],
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_split_bills_creator (creator_id),
    INDEX idx_split_bills_status (status),
    INDEX idx_split_bills_created (created_at DESC)
);

-- 4. Split Participants Table
CREATE TABLE IF NOT EXISTS split_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    split_bill_id UUID NOT NULL REFERENCES split_bills(id),
    user_id UUID REFERENCES users(id),
    
    -- Participant Information
    participant_identifier VARCHAR(255),
    participant_identifier_type VARCHAR(20) CHECK (
        participant_identifier_type IN ('email', 'phone', 'username', 'user_id')
    ),
    participant_name VARCHAR(255),
    
    -- Split Details
    split_amount DECIMAL(15, 2) NOT NULL,
    split_percentage DECIMAL(5, 2),
    custom_amount DECIMAL(15, 2),
    
    -- Payment Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending', 'notified', 'viewed', 'paid',
            'declined', 'cancelled', 'exempted'
        )
    ),
    
    -- Payment Information
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    transfer_id UUID REFERENCES p2p_transfers(id),
    paid_at TIMESTAMP,
    
    -- Response
    notified_at TIMESTAMP,
    viewed_at TIMESTAMP,
    responded_at TIMESTAMP,
    decline_reason TEXT,
    
    -- Reminder
    last_reminder_sent TIMESTAMP,
    reminder_count INTEGER DEFAULT 0,
    
    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_split_participants_bill (split_bill_id),
    INDEX idx_split_participants_user (user_id),
    INDEX idx_split_participants_status (status),
    UNIQUE INDEX idx_split_participants_unique (split_bill_id, user_id)
);

-- 5. P2P Contacts Table (Frequent Recipients)
CREATE TABLE IF NOT EXISTS p2p_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    contact_user_id UUID REFERENCES users(id),
    
    -- Contact Information
    contact_identifier VARCHAR(255),
    contact_identifier_type VARCHAR(20) CHECK (
        contact_identifier_type IN ('email', 'phone', 'username', 'user_id')
    ),
    contact_name VARCHAR(255),
    nickname VARCHAR(100),
    
    -- Relationship
    relationship_type VARCHAR(50),
    is_favorite BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    
    -- Statistics
    transaction_count INTEGER DEFAULT 0,
    total_sent DECIMAL(15, 2) DEFAULT 0,
    total_received DECIMAL(15, 2) DEFAULT 0,
    last_transaction_date TIMESTAMP,
    
    -- Trust Score
    trust_score DECIMAL(3, 2) DEFAULT 0, -- 0.00 to 1.00
    verified_contact BOOLEAN DEFAULT FALSE,
    
    -- Settings
    auto_accept_requests BOOLEAN DEFAULT FALSE,
    notification_enabled BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    blocked_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_p2p_contacts_user (user_id),
    INDEX idx_p2p_contacts_contact (contact_user_id),
    INDEX idx_p2p_contacts_favorite (is_favorite),
    UNIQUE INDEX idx_p2p_contacts_unique (user_id, contact_user_id)
);

-- 6. P2P Transfer Limits Table
CREATE TABLE IF NOT EXISTS p2p_transfer_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Daily Limits
    daily_limit DECIMAL(15, 2) DEFAULT 2000,
    daily_used DECIMAL(15, 2) DEFAULT 0,
    daily_reset_at TIMESTAMP,
    
    -- Weekly Limits
    weekly_limit DECIMAL(15, 2) DEFAULT 10000,
    weekly_used DECIMAL(15, 2) DEFAULT 0,
    weekly_reset_at TIMESTAMP,
    
    -- Monthly Limits
    monthly_limit DECIMAL(15, 2) DEFAULT 20000,
    monthly_used DECIMAL(15, 2) DEFAULT 0,
    monthly_reset_at TIMESTAMP,
    
    -- Per Transaction Limits
    per_transaction_limit DECIMAL(15, 2) DEFAULT 1000,
    instant_transfer_limit DECIMAL(15, 2) DEFAULT 500,
    
    -- Request Limits
    max_pending_requests INTEGER DEFAULT 20,
    current_pending_requests INTEGER DEFAULT 0,
    
    -- Velocity Limits
    max_transfers_per_day INTEGER DEFAULT 20,
    max_transfers_per_hour INTEGER DEFAULT 5,
    transfers_today INTEGER DEFAULT 0,
    transfers_this_hour INTEGER DEFAULT 0,
    
    -- Security Settings
    require_2fa_above DECIMAL(15, 2) DEFAULT 500,
    require_pin_above DECIMAL(15, 2) DEFAULT 100,
    
    -- Override Settings
    limit_override_reason TEXT,
    limit_override_expires TIMESTAMP,
    limit_override_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    UNIQUE INDEX idx_p2p_limits_user (user_id)
);

-- 7. P2P Search Directory Table (User Discovery)
CREATE TABLE IF NOT EXISTS p2p_user_directory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Searchable Identifiers
    username VARCHAR(50) UNIQUE,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    
    -- Display Information
    display_name VARCHAR(100),
    profile_picture_url TEXT,
    bio TEXT,
    
    -- Privacy Settings
    is_discoverable BOOLEAN DEFAULT TRUE,
    discoverable_by VARCHAR(20) CHECK (
        discoverable_by IN ('everyone', 'contacts', 'nobody')
    ),
    show_real_name BOOLEAN DEFAULT FALSE,
    show_profile_picture BOOLEAN DEFAULT TRUE,
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    verification_type VARCHAR(50),
    
    -- Search Optimization
    search_tags TEXT[],
    qr_code_data TEXT,
    
    -- Statistics
    search_appearance_count INTEGER DEFAULT 0,
    connection_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    suspended_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_p2p_directory_user (user_id),
    INDEX idx_p2p_directory_username (username),
    INDEX idx_p2p_directory_phone (phone_number),
    INDEX idx_p2p_directory_email (email),
    INDEX idx_p2p_directory_discoverable (is_discoverable)
);

-- 8. Functions

-- Function to generate transfer reference number
CREATE OR REPLACE FUNCTION generate_transfer_reference()
RETURNS TEXT AS $$
BEGIN
    RETURN 'P2P-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || '-' || 
           LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to calculate split amounts
CREATE OR REPLACE FUNCTION calculate_split_amounts(
    p_total_amount DECIMAL(15, 2),
    p_participant_count INTEGER,
    p_split_type VARCHAR(20)
)
RETURNS DECIMAL(15, 2) AS $$
BEGIN
    IF p_split_type = 'equal' THEN
        RETURN ROUND(p_total_amount / p_participant_count, 2);
    ELSE
        RETURN 0; -- Custom calculation needed
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update transfer limits
CREATE OR REPLACE FUNCTION update_p2p_limit_usage(
    p_user_id UUID,
    p_amount DECIMAL(15, 2)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_limits RECORD;
BEGIN
    -- Get current limits
    SELECT * INTO v_limits
    FROM p2p_transfer_limits
    WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        -- Create default limits for user
        INSERT INTO p2p_transfer_limits (user_id)
        VALUES (p_user_id);
        
        SELECT * INTO v_limits
        FROM p2p_transfer_limits
        WHERE user_id = p_user_id;
    END IF;
    
    -- Check limits
    IF v_limits.daily_used + p_amount > v_limits.daily_limit THEN
        RETURN FALSE;
    END IF;
    
    IF v_limits.weekly_used + p_amount > v_limits.weekly_limit THEN
        RETURN FALSE;
    END IF;
    
    IF v_limits.monthly_used + p_amount > v_limits.monthly_limit THEN
        RETURN FALSE;
    END IF;
    
    -- Update usage
    UPDATE p2p_transfer_limits
    SET daily_used = daily_used + p_amount,
        weekly_used = weekly_used + p_amount,
        monthly_used = monthly_used + p_amount,
        transfers_today = transfers_today + 1,
        transfers_this_hour = transfers_this_hour + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to reset transfer limits
CREATE OR REPLACE FUNCTION reset_p2p_limits()
RETURNS VOID AS $$
BEGIN
    -- Reset daily limits
    UPDATE p2p_transfer_limits
    SET daily_used = 0,
        transfers_today = 0,
        daily_reset_at = CURRENT_TIMESTAMP + INTERVAL '1 day'
    WHERE daily_reset_at <= CURRENT_TIMESTAMP;
    
    -- Reset weekly limits
    UPDATE p2p_transfer_limits
    SET weekly_used = 0,
        weekly_reset_at = CURRENT_TIMESTAMP + INTERVAL '1 week'
    WHERE weekly_reset_at <= CURRENT_TIMESTAMP;
    
    -- Reset monthly limits
    UPDATE p2p_transfer_limits
    SET monthly_used = 0,
        monthly_reset_at = CURRENT_TIMESTAMP + INTERVAL '1 month'
    WHERE monthly_reset_at <= CURRENT_TIMESTAMP;
    
    -- Reset hourly velocity
    UPDATE p2p_transfer_limits
    SET transfers_this_hour = 0
    WHERE updated_at < CURRENT_TIMESTAMP - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to update contact statistics
CREATE OR REPLACE FUNCTION update_p2p_contact_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update sender's contact
        INSERT INTO p2p_contacts (
            user_id, contact_user_id, transaction_count, 
            total_sent, last_transaction_date
        ) VALUES (
            NEW.sender_id, NEW.recipient_id, 1, 
            NEW.amount, CURRENT_TIMESTAMP
        )
        ON CONFLICT (user_id, contact_user_id) DO UPDATE
        SET transaction_count = p2p_contacts.transaction_count + 1,
            total_sent = p2p_contacts.total_sent + NEW.amount,
            last_transaction_date = CURRENT_TIMESTAMP;
        
        -- Update recipient's contact
        INSERT INTO p2p_contacts (
            user_id, contact_user_id, transaction_count, 
            total_received, last_transaction_date
        ) VALUES (
            NEW.recipient_id, NEW.sender_id, 1, 
            NEW.amount, CURRENT_TIMESTAMP
        )
        ON CONFLICT (user_id, contact_user_id) DO UPDATE
        SET transaction_count = p2p_contacts.transaction_count + 1,
            total_received = p2p_contacts.total_received + NEW.amount,
            last_transaction_date = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating contact stats
CREATE TRIGGER update_contact_stats_on_transfer
    AFTER UPDATE ON p2p_transfers
    FOR EACH ROW
    EXECUTE FUNCTION update_p2p_contact_stats();

-- Function to check if users are connected
CREATE OR REPLACE FUNCTION check_p2p_connection(
    p_user1_id UUID,
    p_user2_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_connection_exists BOOLEAN;
BEGIN
    SELECT EXISTS(
        SELECT 1 FROM p2p_contacts
        WHERE user_id = p_user1_id
        AND contact_user_id = p_user2_id
        AND is_blocked = FALSE
    ) INTO v_connection_exists;
    
    RETURN v_connection_exists;
END;
$$ LANGUAGE plpgsql;

-- Function to settle split bill
CREATE OR REPLACE FUNCTION settle_split_bill(
    p_split_bill_id UUID
)
RETURNS VOID AS $$
DECLARE
    v_total_paid DECIMAL(15, 2);
    v_total_amount DECIMAL(15, 2);
BEGIN
    -- Calculate total paid
    SELECT SUM(paid_amount) INTO v_total_paid
    FROM split_participants
    WHERE split_bill_id = p_split_bill_id;
    
    -- Get total amount
    SELECT total_amount INTO v_total_amount
    FROM split_bills
    WHERE id = p_split_bill_id;
    
    -- Update split bill status
    IF v_total_paid >= v_total_amount THEN
        UPDATE split_bills
        SET status = 'settled',
            settled_amount = v_total_paid,
            settled_at = CURRENT_TIMESTAMP
        WHERE id = p_split_bill_id;
    ELSIF v_total_paid > 0 THEN
        UPDATE split_bills
        SET status = 'partial',
            settled_amount = v_total_paid
        WHERE id = p_split_bill_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_p2p_transfers_sender_date 
    ON p2p_transfers(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_p2p_transfers_recipient_date 
    ON p2p_transfers(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_money_requests_pending 
    ON money_requests(payer_id, status) 
    WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_split_participants_unpaid 
    ON split_participants(user_id, status) 
    WHERE status IN ('pending', 'notified');