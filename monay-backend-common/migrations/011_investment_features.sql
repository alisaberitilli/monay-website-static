-- Investment Features Database Schema
-- Consumer Wallet Phase 3 Day 14 Implementation
-- Focus: Stock trading, mutual funds, ETFs, portfolio management, and market data

-- ==================== INVESTMENT ACCOUNTS ====================

-- Investment accounts for users
CREATE TABLE IF NOT EXISTS investment_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    account_number VARCHAR(50) UNIQUE NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (
        account_type IN ('individual', 'joint', 'ira', 'roth_ira', '401k', 'education', 'custodial')
    ),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (
        status IN ('pending_approval', 'active', 'suspended', 'closed', 'archived')
    ),
    risk_profile VARCHAR(20) CHECK (
        risk_profile IN ('conservative', 'moderate', 'aggressive', 'very_aggressive')
    ),

    -- Balances
    cash_balance DECIMAL(15, 2) DEFAULT 0.00,
    invested_balance DECIMAL(15, 2) DEFAULT 0.00,
    total_value DECIMAL(15, 2) DEFAULT 0.00,

    -- Settings
    margin_enabled BOOLEAN DEFAULT false,
    options_enabled BOOLEAN DEFAULT false,
    crypto_enabled BOOLEAN DEFAULT false,
    fractional_shares_enabled BOOLEAN DEFAULT true,
    dividend_reinvestment BOOLEAN DEFAULT true,

    -- Compliance
    pattern_day_trader BOOLEAN DEFAULT false,
    kyc_verified BOOLEAN DEFAULT false,
    accredited_investor BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT positive_balances CHECK (
        cash_balance >= 0 AND invested_balance >= 0
    )
);

-- ==================== SECURITIES & ASSETS ====================

-- Master list of tradeable securities
CREATE TABLE IF NOT EXISTS securities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    security_type VARCHAR(50) NOT NULL CHECK (
        security_type IN ('stock', 'etf', 'mutual_fund', 'bond', 'option', 'crypto', 'commodity')
    ),
    exchange VARCHAR(50),

    -- Identification
    cusip VARCHAR(9),
    isin VARCHAR(12),
    sedol VARCHAR(7),

    -- Current data
    current_price DECIMAL(15, 4),
    previous_close DECIMAL(15, 4),
    market_cap BIGINT,
    volume BIGINT,

    -- Trading info
    tradeable BOOLEAN DEFAULT true,
    fractional_allowed BOOLEAN DEFAULT true,
    options_available BOOLEAN DEFAULT false,
    margin_eligible BOOLEAN DEFAULT false,

    -- Metadata
    sector VARCHAR(100),
    industry VARCHAR(100),
    country VARCHAR(2),
    currency VARCHAR(3) DEFAULT 'USD',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(symbol, security_type),
    INDEX idx_symbol (symbol),
    INDEX idx_type (security_type)
);

-- ==================== PORTFOLIO & HOLDINGS ====================

-- User's security holdings
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES investment_accounts(id),
    security_id UUID NOT NULL REFERENCES securities(id),

    -- Position details
    quantity DECIMAL(20, 8) NOT NULL,
    average_cost DECIMAL(15, 4) NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL,
    current_value DECIMAL(15, 2),

    -- P&L
    unrealized_gain_loss DECIMAL(15, 2),
    unrealized_gain_loss_pct DECIMAL(10, 4),
    realized_gain_loss DECIMAL(15, 2) DEFAULT 0.00,

    -- Dates
    first_acquired DATE,
    last_acquired DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(account_id, security_id),
    INDEX idx_account_holdings (account_id),
    CONSTRAINT positive_quantity CHECK (quantity >= 0)
);

-- ==================== ORDERS & TRADES ====================

-- Investment orders
CREATE TABLE IF NOT EXISTS investment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES investment_accounts(id),
    security_id UUID NOT NULL REFERENCES securities(id),

    -- Order details
    order_type VARCHAR(20) NOT NULL CHECK (
        order_type IN ('market', 'limit', 'stop', 'stop_limit', 'trailing_stop')
    ),
    side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
    quantity DECIMAL(20, 8) NOT NULL,
    limit_price DECIMAL(15, 4),
    stop_price DECIMAL(15, 4),

    -- Execution
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'submitted', 'partial', 'filled', 'cancelled', 'rejected', 'expired')
    ),
    filled_quantity DECIMAL(20, 8) DEFAULT 0,
    average_fill_price DECIMAL(15, 4),
    total_amount DECIMAL(15, 2),
    commission DECIMAL(10, 2) DEFAULT 0.00,

    -- Time in force
    time_in_force VARCHAR(10) DEFAULT 'day' CHECK (
        time_in_force IN ('day', 'gtc', 'ioc', 'fok', 'extended')
    ),

    -- Tracking
    order_reference VARCHAR(100) UNIQUE,
    broker_order_id VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    filled_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    expires_at TIMESTAMP,

    INDEX idx_account_orders (account_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at DESC)
);

-- Trade executions
CREATE TABLE IF NOT EXISTS trade_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES investment_orders(id),
    account_id UUID NOT NULL REFERENCES investment_accounts(id),
    security_id UUID NOT NULL REFERENCES securities(id),

    -- Execution details
    side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(15, 4) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    commission DECIMAL(10, 2) DEFAULT 0.00,

    -- Settlement
    settlement_date DATE,
    settled BOOLEAN DEFAULT false,

    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_order (order_id),
    INDEX idx_account (account_id),
    INDEX idx_executed (executed_at DESC)
);

-- ==================== WATCHLISTS ====================

-- User watchlists
CREATE TABLE IF NOT EXISTS watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, name)
);

-- Watchlist items
CREATE TABLE IF NOT EXISTS watchlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id UUID NOT NULL REFERENCES watchlists(id),
    security_id UUID NOT NULL REFERENCES securities(id),

    -- Alerts
    price_alert_above DECIMAL(15, 4),
    price_alert_below DECIMAL(15, 4),
    volume_alert_above BIGINT,

    notes TEXT,
    sort_order INT DEFAULT 0,

    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(watchlist_id, security_id),
    INDEX idx_watchlist (watchlist_id)
);

-- ==================== MARKET DATA ====================

-- Price history
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    security_id UUID NOT NULL REFERENCES securities(id),

    -- OHLCV data
    date DATE NOT NULL,
    open DECIMAL(15, 4),
    high DECIMAL(15, 4),
    low DECIMAL(15, 4),
    close DECIMAL(15, 4) NOT NULL,
    adjusted_close DECIMAL(15, 4),
    volume BIGINT,

    -- Additional metrics
    change_amount DECIMAL(15, 4),
    change_percent DECIMAL(10, 4),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(security_id, date),
    INDEX idx_security_date (security_id, date DESC)
);

-- Real-time quotes
CREATE TABLE IF NOT EXISTS market_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    security_id UUID NOT NULL REFERENCES securities(id),

    -- Bid/Ask
    bid_price DECIMAL(15, 4),
    bid_size INT,
    ask_price DECIMAL(15, 4),
    ask_size INT,

    -- Latest trade
    last_price DECIMAL(15, 4) NOT NULL,
    last_size INT,
    last_timestamp TIMESTAMP,

    -- Day stats
    open DECIMAL(15, 4),
    high DECIMAL(15, 4),
    low DECIMAL(15, 4),
    previous_close DECIMAL(15, 4),
    volume BIGINT,

    -- Change
    change_amount DECIMAL(15, 4),
    change_percent DECIMAL(10, 4),

    quote_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(security_id),
    INDEX idx_timestamp (quote_timestamp DESC)
);

-- ==================== DIVIDENDS & CORPORATE ACTIONS ====================

-- Dividend payments
CREATE TABLE IF NOT EXISTS dividends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    security_id UUID NOT NULL REFERENCES securities(id),

    -- Dividend details
    amount_per_share DECIMAL(10, 4) NOT NULL,
    dividend_type VARCHAR(20) CHECK (
        dividend_type IN ('regular', 'special', 'return_of_capital')
    ),

    -- Dates
    ex_dividend_date DATE NOT NULL,
    record_date DATE,
    payment_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_security (security_id),
    INDEX idx_ex_date (ex_dividend_date)
);

-- User dividend receipts
CREATE TABLE IF NOT EXISTS dividend_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES investment_accounts(id),
    dividend_id UUID NOT NULL REFERENCES dividends(id),
    security_id UUID NOT NULL REFERENCES securities(id),

    -- Receipt details
    shares_held DECIMAL(20, 8) NOT NULL,
    amount_per_share DECIMAL(10, 4) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,

    -- Tax
    tax_withheld DECIMAL(15, 2) DEFAULT 0.00,
    net_amount DECIMAL(15, 2) NOT NULL,

    -- Reinvestment
    reinvested BOOLEAN DEFAULT false,
    reinvestment_price DECIMAL(15, 4),
    reinvestment_shares DECIMAL(20, 8),

    payment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_account (account_id),
    INDEX idx_payment_date (payment_date DESC)
);

-- ==================== INVESTMENT ANALYTICS ====================

-- Portfolio performance snapshots
CREATE TABLE IF NOT EXISTS portfolio_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES investment_accounts(id),

    -- Values
    date DATE NOT NULL,
    total_value DECIMAL(15, 2) NOT NULL,
    cash_value DECIMAL(15, 2) NOT NULL,
    invested_value DECIMAL(15, 2) NOT NULL,

    -- Daily changes
    daily_gain_loss DECIMAL(15, 2),
    daily_gain_loss_pct DECIMAL(10, 4),

    -- Cumulative
    total_gain_loss DECIMAL(15, 2),
    total_gain_loss_pct DECIMAL(10, 4),

    -- Contributions
    deposits DECIMAL(15, 2) DEFAULT 0.00,
    withdrawals DECIMAL(15, 2) DEFAULT 0.00,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(account_id, date),
    INDEX idx_account_date (account_id, date DESC)
);

-- Asset allocation
CREATE TABLE IF NOT EXISTS asset_allocation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES investment_accounts(id),

    -- Allocation by type
    stocks_pct DECIMAL(5, 2),
    bonds_pct DECIMAL(5, 2),
    etfs_pct DECIMAL(5, 2),
    mutual_funds_pct DECIMAL(5, 2),
    cash_pct DECIMAL(5, 2),
    crypto_pct DECIMAL(5, 2),

    -- Allocation by sector
    allocation_data JSONB,

    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_account (account_id),
    INDEX idx_calculated (calculated_at DESC)
);

-- ==================== AUTOMATED INVESTING ====================

-- Recurring investment plans
CREATE TABLE IF NOT EXISTS recurring_investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES investment_accounts(id),

    -- Schedule
    name VARCHAR(100),
    frequency VARCHAR(20) NOT NULL CHECK (
        frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly')
    ),
    day_of_month INT CHECK (day_of_month BETWEEN 1 AND 31),
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),

    -- Investment details
    amount DECIMAL(15, 2) NOT NULL,
    investment_type VARCHAR(20) CHECK (
        investment_type IN ('fixed_amount', 'percentage_of_balance')
    ),

    -- Allocation
    allocation_strategy VARCHAR(50) CHECK (
        allocation_strategy IN ('single_security', 'portfolio', 'etf_basket', 'custom')
    ),
    allocation_data JSONB,

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (
        status IN ('active', 'paused', 'cancelled', 'archived')
    ),

    next_investment_date DATE,
    last_investment_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,

    INDEX idx_account (account_id),
    INDEX idx_status (status),
    INDEX idx_next_date (next_investment_date)
);

-- ==================== TAX REPORTING ====================

-- Tax lots for cost basis tracking
CREATE TABLE IF NOT EXISTS tax_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES investment_accounts(id),
    security_id UUID NOT NULL REFERENCES securities(id),

    -- Lot details
    acquisition_date DATE NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    remaining_quantity DECIMAL(20, 8) NOT NULL,
    cost_per_share DECIMAL(15, 4) NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL,

    -- Tax info
    holding_period VARCHAR(20) CHECK (
        holding_period IN ('short_term', 'long_term')
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_account_security (account_id, security_id),
    INDEX idx_acquisition (acquisition_date)
);

-- Capital gains/losses
CREATE TABLE IF NOT EXISTS capital_gains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES investment_accounts(id),
    security_id UUID NOT NULL REFERENCES securities(id),

    -- Transaction details
    sale_date DATE NOT NULL,
    acquisition_date DATE NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,

    -- Amounts
    sale_proceeds DECIMAL(15, 2) NOT NULL,
    cost_basis DECIMAL(15, 2) NOT NULL,
    gain_loss DECIMAL(15, 2) NOT NULL,

    -- Tax classification
    holding_period VARCHAR(20) CHECK (
        holding_period IN ('short_term', 'long_term')
    ),

    tax_year INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_account_year (account_id, tax_year),
    INDEX idx_sale_date (sale_date DESC)
);

-- ==================== FUNCTIONS ====================

-- Generate account number
CREATE OR REPLACE FUNCTION generate_investment_account_number()
RETURNS VARCHAR(50) AS $$
BEGIN
    RETURN 'INV' || LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0');
END;
$$ LANGUAGE plpgsql;

-- Calculate portfolio value
CREATE OR REPLACE FUNCTION calculate_portfolio_value(p_account_id UUID)
RETURNS TABLE(
    cash_balance DECIMAL(15, 2),
    invested_value DECIMAL(15, 2),
    total_value DECIMAL(15, 2),
    unrealized_gain_loss DECIMAL(15, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ia.cash_balance,
        COALESCE(SUM(ph.current_value), 0) as invested_value,
        ia.cash_balance + COALESCE(SUM(ph.current_value), 0) as total_value,
        COALESCE(SUM(ph.unrealized_gain_loss), 0) as unrealized_gain_loss
    FROM investment_accounts ia
    LEFT JOIN portfolio_holdings ph ON ia.id = ph.account_id
    WHERE ia.id = p_account_id
    GROUP BY ia.id, ia.cash_balance;
END;
$$ LANGUAGE plpgsql;

-- Update holding values
CREATE OR REPLACE FUNCTION update_holding_values()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE portfolio_holdings ph
    SET
        current_value = ph.quantity * s.current_price,
        unrealized_gain_loss = (ph.quantity * s.current_price) - ph.total_cost,
        unrealized_gain_loss_pct = ((ph.quantity * s.current_price) - ph.total_cost) / ph.total_cost * 100,
        updated_at = CURRENT_TIMESTAMP
    FROM securities s
    WHERE ph.security_id = s.id
    AND s.id = NEW.security_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate tax lot holding period
CREATE OR REPLACE FUNCTION calculate_holding_period(p_acquisition_date DATE, p_sale_date DATE)
RETURNS VARCHAR(20) AS $$
BEGIN
    IF p_sale_date - p_acquisition_date > 365 THEN
        RETURN 'long_term';
    ELSE
        RETURN 'short_term';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ==================== TRIGGERS ====================

-- Update portfolio holding values when prices change
CREATE TRIGGER update_holdings_on_price_change
AFTER UPDATE OF current_price ON securities
FOR EACH ROW
EXECUTE FUNCTION update_holding_values();

-- Update account total value
CREATE TRIGGER update_account_value
AFTER INSERT OR UPDATE OR DELETE ON portfolio_holdings
FOR EACH ROW
EXECUTE FUNCTION update_account_total_value();

-- Generate account number on insert
CREATE TRIGGER generate_account_number
BEFORE INSERT ON investment_accounts
FOR EACH ROW
WHEN (NEW.account_number IS NULL)
EXECUTE FUNCTION generate_investment_account_number();

-- ==================== INDEXES ====================

CREATE INDEX idx_investment_accounts_user ON investment_accounts(user_id);
CREATE INDEX idx_investment_accounts_status ON investment_accounts(status);
CREATE INDEX idx_securities_tradeable ON securities(tradeable) WHERE tradeable = true;
CREATE INDEX idx_orders_pending ON investment_orders(account_id, status)
    WHERE status IN ('pending', 'submitted', 'partial');
CREATE INDEX idx_portfolio_performance ON portfolio_performance(account_id, date DESC);
CREATE INDEX idx_price_history_recent ON price_history(security_id, date DESC)
    WHERE date >= CURRENT_DATE - INTERVAL '1 year';

-- ==================== INITIAL DATA ====================

-- Insert default securities (sample popular stocks and ETFs)
INSERT INTO securities (symbol, name, security_type, exchange, current_price, tradeable, fractional_allowed)
VALUES
    ('AAPL', 'Apple Inc.', 'stock', 'NASDAQ', 180.00, true, true),
    ('MSFT', 'Microsoft Corporation', 'stock', 'NASDAQ', 400.00, true, true),
    ('GOOGL', 'Alphabet Inc.', 'stock', 'NASDAQ', 150.00, true, true),
    ('AMZN', 'Amazon.com Inc.', 'stock', 'NASDAQ', 170.00, true, true),
    ('SPY', 'SPDR S&P 500 ETF', 'etf', 'NYSE', 450.00, true, true),
    ('QQQ', 'Invesco QQQ Trust', 'etf', 'NASDAQ', 380.00, true, true),
    ('VTI', 'Vanguard Total Stock Market ETF', 'etf', 'NYSE', 240.00, true, true),
    ('VOO', 'Vanguard S&P 500 ETF', 'etf', 'NYSE', 420.00, true, true)
ON CONFLICT (symbol, security_type) DO NOTHING;

-- ==================== COMMENTS ====================

COMMENT ON TABLE investment_accounts IS 'User investment accounts for trading stocks, ETFs, and other securities';
COMMENT ON TABLE securities IS 'Master list of all tradeable securities';
COMMENT ON TABLE portfolio_holdings IS 'User holdings and positions in various securities';
COMMENT ON TABLE investment_orders IS 'Buy and sell orders for securities';
COMMENT ON TABLE watchlists IS 'User-created lists for tracking securities';
COMMENT ON TABLE price_history IS 'Historical price data for securities';
COMMENT ON TABLE dividends IS 'Dividend payment information';
COMMENT ON TABLE recurring_investments IS 'Automated investment plans for dollar-cost averaging';
COMMENT ON TABLE tax_lots IS 'Tax lot tracking for cost basis calculation';
COMMENT ON TABLE capital_gains IS 'Realized capital gains and losses for tax reporting';