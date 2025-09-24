-- ============================================================
-- MIGRATION: Circle Wallet Integration for Consumer Wallet
-- Date: January 2025
-- Description: Adds support for dual-wallet architecture with Circle USDC
-- ============================================================

-- ============================================================
-- 1. USER CIRCLE WALLETS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_circle_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    circle_wallet_id VARCHAR(255) UNIQUE NOT NULL,
    circle_address VARCHAR(255) UNIQUE NOT NULL,
    wallet_type VARCHAR(50) DEFAULT 'end_user_wallet',
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'inactive', 'suspended', 'pending', 'archived')
    ),

    -- Balances
    usdc_balance DECIMAL(20,6) DEFAULT 0,
    pending_balance DECIMAL(20,6) DEFAULT 0,
    available_balance DECIMAL(20,6) DEFAULT 0,

    -- Configuration
    auto_convert_enabled BOOLEAN DEFAULT FALSE,
    min_usdc_balance DECIMAL(20,6) DEFAULT 0,
    max_usdc_balance DECIMAL(20,6) DEFAULT 1000000,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id),
    INDEX idx_circle_wallet_user (user_id),
    INDEX idx_circle_wallet_status (status),
    INDEX idx_circle_wallet_address (circle_address)
);

-- ============================================================
-- 2. WALLET LINKING
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    monay_wallet_id UUID NOT NULL REFERENCES wallets(id),
    circle_wallet_id UUID NOT NULL REFERENCES user_circle_wallets(id),

    -- Link Configuration
    link_status VARCHAR(20) DEFAULT 'active' CHECK (
        link_status IN ('active', 'inactive', 'pending', 'failed', 'archived')
    ),
    auto_bridge_enabled BOOLEAN DEFAULT TRUE,
    preferred_wallet VARCHAR(20) DEFAULT 'smart' CHECK (
        preferred_wallet IN ('monay', 'circle', 'smart')
    ),

    -- Bridge Settings
    bridge_threshold DECIMAL(20,2) DEFAULT 100.00, -- Auto-bridge when balance exceeds
    min_bridge_amount DECIMAL(20,2) DEFAULT 10.00,
    max_bridge_amount DECIMAL(20,2) DEFAULT 10000.00,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id),
    INDEX idx_wallet_link_user (user_id),
    INDEX idx_wallet_link_status (link_status)
);

-- ============================================================
-- 3. CIRCLE TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS circle_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    circle_wallet_id UUID NOT NULL REFERENCES user_circle_wallets(id),
    circle_transaction_id VARCHAR(255) UNIQUE,

    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL CHECK (
        transaction_type IN (
            'deposit', 'withdrawal', 'transfer_in', 'transfer_out',
            'bridge_to_monay', 'bridge_from_monay', 'payment',
            'mint', 'burn', 'swap'
        )
    ),
    amount DECIMAL(20,6) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'archived')
    ),

    -- Related Entities
    source_address VARCHAR(255),
    destination_address VARCHAR(255),
    related_transaction_id UUID, -- Link to monay transactions
    blockchain_hash VARCHAR(255),

    -- Fees
    circle_fee DECIMAL(20,6) DEFAULT 0,
    network_fee DECIMAL(20,6) DEFAULT 0,
    bridge_fee DECIMAL(20,6) DEFAULT 0,
    total_fee DECIMAL(20,6) GENERATED ALWAYS AS (circle_fee + network_fee + bridge_fee) STORED,

    -- Metadata
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    INDEX idx_circle_tx_user (user_id),
    INDEX idx_circle_tx_wallet (circle_wallet_id),
    INDEX idx_circle_tx_status (status),
    INDEX idx_circle_tx_type (transaction_type),
    INDEX idx_circle_tx_created (created_at DESC)
);

-- ============================================================
-- 4. BRIDGE TRANSFERS
-- ============================================================
CREATE TABLE IF NOT EXISTS bridge_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Transfer Direction
    direction VARCHAR(20) NOT NULL CHECK (
        direction IN ('monay_to_circle', 'circle_to_monay')
    ),

    -- Amounts
    source_amount DECIMAL(20,6) NOT NULL,
    source_currency VARCHAR(10) NOT NULL,
    destination_amount DECIMAL(20,6) NOT NULL,
    destination_currency VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(20,10) DEFAULT 1.0,

    -- Status
    status VARCHAR(20) DEFAULT 'initiated' CHECK (
        status IN ('initiated', 'processing', 'completed', 'failed', 'reversed', 'archived')
    ),

    -- Related Transactions
    monay_transaction_id UUID,
    circle_transaction_id UUID,

    -- Fees
    bridge_fee DECIMAL(20,6) DEFAULT 0,

    -- Timing
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,

    -- Metadata
    failure_reason TEXT,
    metadata JSONB,

    INDEX idx_bridge_user (user_id),
    INDEX idx_bridge_status (status),
    INDEX idx_bridge_direction (direction),
    INDEX idx_bridge_initiated (initiated_at DESC)
);

-- ============================================================
-- 5. SMART ROUTING DECISIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS routing_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Decision Context
    transaction_id UUID,
    decision_type VARCHAR(50) NOT NULL CHECK (
        decision_type IN (
            'payment', 'transfer', 'withdrawal', 'deposit',
            'bill_pay', 'card_payment', 'p2p'
        )
    ),

    -- Decision Details
    selected_wallet VARCHAR(20) NOT NULL CHECK (
        selected_wallet IN ('monay', 'circle', 'split')
    ),
    routing_reason VARCHAR(100),

    -- Amounts
    total_amount DECIMAL(20,6) NOT NULL,
    monay_amount DECIMAL(20,6) DEFAULT 0,
    circle_amount DECIMAL(20,6) DEFAULT 0,

    -- Cost Analysis
    monay_fee_estimate DECIMAL(20,6),
    circle_fee_estimate DECIMAL(20,6),
    selected_fee DECIMAL(20,6),
    fee_savings DECIMAL(20,6),

    -- Speed Analysis
    monay_time_estimate INTEGER, -- seconds
    circle_time_estimate INTEGER, -- seconds
    selected_time INTEGER, -- seconds

    -- Factors Considered
    factors JSONB DEFAULT '{}',
    score_monay DECIMAL(5,2),
    score_circle DECIMAL(5,2),

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_routing_user (user_id),
    INDEX idx_routing_type (decision_type),
    INDEX idx_routing_selected (selected_wallet),
    INDEX idx_routing_created (created_at DESC)
);

-- ============================================================
-- 6. CIRCLE WEBHOOKS
-- ============================================================
CREATE TABLE IF NOT EXISTS circle_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id VARCHAR(255) UNIQUE NOT NULL,
    webhook_type VARCHAR(100) NOT NULL,

    -- Webhook Data
    payload JSONB NOT NULL,
    signature VARCHAR(500),

    -- Processing
    status VARCHAR(20) DEFAULT 'received' CHECK (
        status IN ('received', 'processing', 'processed', 'failed', 'ignored')
    ),
    processed_at TIMESTAMP,

    -- Related Entities
    user_id UUID,
    wallet_id UUID,
    transaction_id UUID,

    -- Metadata
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_webhook_type (webhook_type),
    INDEX idx_webhook_status (status),
    INDEX idx_webhook_created (created_at DESC)
);

-- ============================================================
-- 7. USDC BALANCE HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS usdc_balance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    circle_wallet_id UUID NOT NULL REFERENCES user_circle_wallets(id),

    -- Balance Snapshot
    balance_before DECIMAL(20,6) NOT NULL,
    balance_after DECIMAL(20,6) NOT NULL,
    change_amount DECIMAL(20,6) GENERATED ALWAYS AS (balance_after - balance_before) STORED,

    -- Trigger
    trigger_type VARCHAR(50) NOT NULL,
    trigger_id VARCHAR(255),

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_balance_history_user (user_id),
    INDEX idx_balance_history_wallet (circle_wallet_id),
    INDEX idx_balance_history_created (created_at DESC)
);

-- ============================================================
-- 8. CIRCLE API AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS circle_api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Request Info
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_id VARCHAR(255) UNIQUE,

    -- User Context
    user_id UUID,
    admin_id UUID,

    -- Request/Response
    request_body JSONB,
    response_body JSONB,
    status_code INTEGER,

    -- Timing
    request_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_at TIMESTAMP,
    duration_ms INTEGER,

    -- Error Handling
    error_code VARCHAR(100),
    error_message TEXT,

    -- Rate Limiting
    rate_limit_remaining INTEGER,
    rate_limit_reset_at TIMESTAMP,

    INDEX idx_api_log_endpoint (endpoint),
    INDEX idx_api_log_user (user_id),
    INDEX idx_api_log_status (status_code),
    INDEX idx_api_log_created (request_at DESC)
);

-- ============================================================
-- 9. STORED PROCEDURES
-- ============================================================

-- Function to get combined wallet balance
CREATE OR REPLACE FUNCTION get_combined_balance(p_user_id UUID)
RETURNS TABLE (
    monay_balance DECIMAL(20,2),
    circle_balance DECIMAL(20,6),
    total_usd_value DECIMAL(20,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(w.balance, 0) as monay_balance,
        COALESCE(ucw.usdc_balance, 0) as circle_balance,
        COALESCE(w.balance, 0) + COALESCE(ucw.usdc_balance, 0) as total_usd_value
    FROM users u
    LEFT JOIN wallets w ON u.id = w.user_id AND w.status = 'active'
    LEFT JOIN user_circle_wallets ucw ON u.id = ucw.user_id AND ucw.status = 'active'
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process bridge transfer
CREATE OR REPLACE FUNCTION process_bridge_transfer(
    p_user_id UUID,
    p_direction VARCHAR(20),
    p_amount DECIMAL(20,6)
) RETURNS UUID AS $$
DECLARE
    v_transfer_id UUID;
    v_monay_balance DECIMAL(20,2);
    v_circle_balance DECIMAL(20,6);
BEGIN
    -- Create bridge transfer record
    INSERT INTO bridge_transfers (
        user_id, direction, source_amount, source_currency,
        destination_amount, destination_currency, status
    ) VALUES (
        p_user_id, p_direction, p_amount,
        CASE WHEN p_direction = 'monay_to_circle' THEN 'USD' ELSE 'USDC' END,
        p_amount,
        CASE WHEN p_direction = 'circle_to_monay' THEN 'USD' ELSE 'USDC' END,
        'initiated'
    ) RETURNING id INTO v_transfer_id;

    -- Check sufficient balance
    IF p_direction = 'monay_to_circle' THEN
        SELECT balance INTO v_monay_balance FROM wallets
        WHERE user_id = p_user_id AND status = 'active';

        IF v_monay_balance < p_amount THEN
            UPDATE bridge_transfers
            SET status = 'failed', failure_reason = 'Insufficient Monay balance'
            WHERE id = v_transfer_id;
            RETURN NULL;
        END IF;
    ELSE
        SELECT usdc_balance INTO v_circle_balance FROM user_circle_wallets
        WHERE user_id = p_user_id AND status = 'active';

        IF v_circle_balance < p_amount THEN
            UPDATE bridge_transfers
            SET status = 'failed', failure_reason = 'Insufficient USDC balance'
            WHERE id = v_transfer_id;
            RETURN NULL;
        END IF;
    END IF;

    -- Update status to processing
    UPDATE bridge_transfers
    SET status = 'processing', processing_at = CURRENT_TIMESTAMP
    WHERE id = v_transfer_id;

    RETURN v_transfer_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 10. TRIGGERS
-- ============================================================

-- Trigger to update wallet balance history
CREATE OR REPLACE FUNCTION log_usdc_balance_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.usdc_balance != NEW.usdc_balance THEN
        INSERT INTO usdc_balance_history (
            user_id, circle_wallet_id, balance_before, balance_after,
            trigger_type, trigger_id
        ) VALUES (
            NEW.user_id, NEW.id, OLD.usdc_balance, NEW.usdc_balance,
            'update', NEW.id::VARCHAR
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usdc_balance_history
    AFTER UPDATE ON user_circle_wallets
    FOR EACH ROW
    EXECUTE FUNCTION log_usdc_balance_change();

-- ============================================================
-- 11. INDEXES FOR PERFORMANCE
-- ============================================================

-- Composite indexes for common queries
CREATE INDEX idx_circle_tx_user_status ON circle_transactions(user_id, status);
CREATE INDEX idx_circle_tx_wallet_type ON circle_transactions(circle_wallet_id, transaction_type);
CREATE INDEX idx_bridge_user_status ON bridge_transfers(user_id, status);
CREATE INDEX idx_routing_user_type ON routing_decisions(user_id, decision_type);

-- ============================================================
-- 12. INITIAL DATA
-- ============================================================

-- Add Circle wallet type to wallet_types if not exists
INSERT INTO wallet_types (name, description, features)
VALUES ('circle_usdc', 'Circle USDC Wallet', '{"currency": "USDC", "instant_settlement": true, "global": true}')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- END OF MIGRATION
-- ============================================================