-- =====================================================
-- PHASE 3 - DAY 17: ANALYTICS & REPORTING SYSTEM
-- =====================================================
-- Comprehensive analytics and reporting for consumer wallet
-- Tracks user behavior, financial metrics, and business KPIs
-- Database Safety: No DROP/DELETE/TRUNCATE operations
-- =====================================================

-- =====================================================
-- USER ANALYTICS
-- =====================================================

-- User activity tracking
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Session Data
    session_id VARCHAR(255),
    session_start TIMESTAMP,
    session_end TIMESTAMP,
    session_duration_seconds INTEGER,

    -- Activity Metrics
    page_views INTEGER DEFAULT 0,
    actions_count INTEGER DEFAULT 0,
    transactions_count INTEGER DEFAULT 0,

    -- Device Information
    device_type VARCHAR(50),
    platform VARCHAR(50),
    browser VARCHAR(100),
    ip_address INET,
    country_code VARCHAR(2),
    city VARCHAR(100),

    -- Engagement Metrics
    bounce_rate DECIMAL(5, 2),
    engagement_score DECIMAL(5, 2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_analytics_user_date (user_id, created_at),
    INDEX idx_user_analytics_session (session_id)
);

-- =====================================================
-- TRANSACTION ANALYTICS
-- =====================================================

-- Aggregated transaction metrics
CREATE TABLE IF NOT EXISTS transaction_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time Dimensions
    date DATE NOT NULL,
    hour INTEGER CHECK (hour >= 0 AND hour < 24),
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week < 7),
    week_of_year INTEGER,
    month INTEGER CHECK (month >= 1 AND month <= 12),
    quarter INTEGER CHECK (quarter >= 1 AND quarter <= 4),
    year INTEGER,

    -- Transaction Metrics
    total_transactions INTEGER DEFAULT 0,
    total_volume DECIMAL(20, 2) DEFAULT 0.00,
    average_transaction_size DECIMAL(15, 2) DEFAULT 0.00,

    -- Transaction Types
    deposits_count INTEGER DEFAULT 0,
    deposits_volume DECIMAL(20, 2) DEFAULT 0.00,
    withdrawals_count INTEGER DEFAULT 0,
    withdrawals_volume DECIMAL(20, 2) DEFAULT 0.00,
    transfers_count INTEGER DEFAULT 0,
    transfers_volume DECIMAL(20, 2) DEFAULT 0.00,
    payments_count INTEGER DEFAULT 0,
    payments_volume DECIMAL(20, 2) DEFAULT 0.00,

    -- Payment Methods
    card_transactions INTEGER DEFAULT 0,
    card_volume DECIMAL(20, 2) DEFAULT 0.00,
    ach_transactions INTEGER DEFAULT 0,
    ach_volume DECIMAL(20, 2) DEFAULT 0.00,
    wire_transactions INTEGER DEFAULT 0,
    wire_volume DECIMAL(20, 2) DEFAULT 0.00,

    -- User Segments
    new_users_transactions INTEGER DEFAULT 0,
    active_users_transactions INTEGER DEFAULT 0,
    premium_users_transactions INTEGER DEFAULT 0,

    -- Geographic Data
    domestic_transactions INTEGER DEFAULT 0,
    international_transactions INTEGER DEFAULT 0,

    -- Status Metrics
    successful_transactions INTEGER DEFAULT 0,
    failed_transactions INTEGER DEFAULT 0,
    pending_transactions INTEGER DEFAULT 0,

    -- Fraud Metrics
    flagged_transactions INTEGER DEFAULT 0,
    blocked_transactions INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(date, hour)
);

-- =====================================================
-- REVENUE ANALYTICS
-- =====================================================

-- Revenue and fee tracking
CREATE TABLE IF NOT EXISTS revenue_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time Period
    date DATE NOT NULL,
    period_type VARCHAR(20) CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),

    -- Revenue Streams
    transaction_fees DECIMAL(20, 2) DEFAULT 0.00,
    subscription_revenue DECIMAL(20, 2) DEFAULT 0.00,
    interchange_revenue DECIMAL(20, 2) DEFAULT 0.00,
    interest_revenue DECIMAL(20, 2) DEFAULT 0.00,
    card_revenue DECIMAL(20, 2) DEFAULT 0.00,
    investment_fees DECIMAL(20, 2) DEFAULT 0.00,
    fx_revenue DECIMAL(20, 2) DEFAULT 0.00,
    other_revenue DECIMAL(20, 2) DEFAULT 0.00,

    -- Total Revenue
    gross_revenue DECIMAL(20, 2) DEFAULT 0.00,
    net_revenue DECIMAL(20, 2) DEFAULT 0.00,

    -- Costs
    processing_costs DECIMAL(20, 2) DEFAULT 0.00,
    operational_costs DECIMAL(20, 2) DEFAULT 0.00,
    fraud_losses DECIMAL(20, 2) DEFAULT 0.00,

    -- Margins
    gross_margin DECIMAL(5, 2),
    net_margin DECIMAL(5, 2),

    -- Customer Metrics
    arpu DECIMAL(15, 2), -- Average Revenue Per User
    ltv DECIMAL(15, 2), -- Lifetime Value

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(date, period_type)
);

-- =====================================================
-- USER BEHAVIOR ANALYTICS
-- =====================================================

-- User behavior patterns and cohort analysis
CREATE TABLE IF NOT EXISTS user_behavior_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),

    -- Cohort Information
    cohort_date DATE,
    cohort_type VARCHAR(50),

    -- Engagement Metrics
    days_active INTEGER DEFAULT 0,
    last_active_date DATE,
    churn_probability DECIMAL(5, 2),
    retention_score DECIMAL(5, 2),

    -- Usage Patterns
    preferred_transaction_type VARCHAR(50),
    average_transaction_frequency DECIMAL(10, 2),
    preferred_time_of_day INTEGER,
    preferred_day_of_week INTEGER,

    -- Financial Behavior
    average_balance DECIMAL(15, 2),
    balance_volatility DECIMAL(5, 2),
    spending_category_preference JSONB,

    -- Product Usage
    features_used JSONB,
    cards_active INTEGER DEFAULT 0,
    investment_accounts INTEGER DEFAULT 0,
    bills_configured INTEGER DEFAULT 0,

    -- Risk Profile
    risk_score DECIMAL(5, 2),
    fraud_score DECIMAL(5, 2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id)
);

-- =====================================================
-- PRODUCT ANALYTICS
-- =====================================================

-- Product feature usage and adoption
CREATE TABLE IF NOT EXISTS product_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time Period
    date DATE NOT NULL,

    -- Feature Adoption
    feature_name VARCHAR(100) NOT NULL,
    feature_category VARCHAR(50),

    -- Usage Metrics
    unique_users INTEGER DEFAULT 0,
    total_usage_count INTEGER DEFAULT 0,
    average_usage_per_user DECIMAL(10, 2),

    -- Conversion Metrics
    feature_activation_rate DECIMAL(5, 2),
    feature_retention_rate DECIMAL(5, 2),
    feature_churn_rate DECIMAL(5, 2),

    -- Performance Metrics
    average_response_time_ms DECIMAL(10, 2),
    error_rate DECIMAL(5, 2),
    success_rate DECIMAL(5, 2),

    -- Business Impact
    revenue_impact DECIMAL(20, 2),
    cost_per_usage DECIMAL(10, 2),
    roi DECIMAL(10, 2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(date, feature_name)
);

-- =====================================================
-- FUNNEL ANALYTICS
-- =====================================================

-- Conversion funnel tracking
CREATE TABLE IF NOT EXISTS funnel_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Funnel Definition
    funnel_name VARCHAR(100) NOT NULL,
    funnel_type VARCHAR(50),
    step_number INTEGER NOT NULL,
    step_name VARCHAR(100) NOT NULL,

    -- Time Period
    date DATE NOT NULL,

    -- Metrics
    users_entered INTEGER DEFAULT 0,
    users_completed INTEGER DEFAULT 0,
    users_dropped INTEGER DEFAULT 0,

    -- Conversion Rates
    step_conversion_rate DECIMAL(5, 2),
    overall_conversion_rate DECIMAL(5, 2),

    -- Time Metrics
    average_time_to_complete_seconds INTEGER,
    median_time_to_complete_seconds INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(date, funnel_name, step_number)
);

-- =====================================================
-- COHORT ANALYTICS
-- =====================================================

-- Cohort retention and behavior analysis
CREATE TABLE IF NOT EXISTS cohort_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Cohort Definition
    cohort_date DATE NOT NULL,
    cohort_type VARCHAR(50) NOT NULL,
    cohort_size INTEGER NOT NULL,

    -- Time Period
    period_number INTEGER NOT NULL, -- Days/Weeks/Months since cohort date
    period_type VARCHAR(20) CHECK (period_type IN ('day', 'week', 'month')),

    -- Retention Metrics
    users_retained INTEGER DEFAULT 0,
    retention_rate DECIMAL(5, 2),

    -- Activity Metrics
    transactions_count INTEGER DEFAULT 0,
    transaction_volume DECIMAL(20, 2) DEFAULT 0.00,
    average_transaction_size DECIMAL(15, 2),

    -- Revenue Metrics
    revenue_generated DECIMAL(20, 2) DEFAULT 0.00,
    average_revenue_per_user DECIMAL(15, 2),
    lifetime_value DECIMAL(15, 2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(cohort_date, cohort_type, period_number, period_type)
);

-- =====================================================
-- KPI TRACKING
-- =====================================================

-- Key Performance Indicators
CREATE TABLE IF NOT EXISTS kpi_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time Period
    date DATE NOT NULL,
    kpi_name VARCHAR(100) NOT NULL,
    kpi_category VARCHAR(50),

    -- KPI Values
    target_value DECIMAL(20, 2),
    actual_value DECIMAL(20, 2),
    previous_value DECIMAL(20, 2),

    -- Performance
    achievement_rate DECIMAL(5, 2),
    growth_rate DECIMAL(10, 2),
    trend VARCHAR(20) CHECK (trend IN ('up', 'down', 'stable')),

    -- Additional Context
    department VARCHAR(50),
    responsible_team VARCHAR(50),
    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(date, kpi_name)
);

-- =====================================================
-- REPORT DEFINITIONS
-- =====================================================

-- Saved report configurations
CREATE TABLE IF NOT EXISTS report_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (
        report_type IN ('dashboard', 'detailed', 'summary', 'executive', 'operational', 'custom')
    ),

    -- Configuration
    query_definition JSONB NOT NULL,
    filters JSONB,
    grouping JSONB,
    sorting JSONB,

    -- Visualization
    chart_type VARCHAR(50),
    chart_config JSONB,

    -- Schedule
    is_scheduled BOOLEAN DEFAULT false,
    schedule_frequency VARCHAR(20) CHECK (
        schedule_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'on_demand')
    ),
    schedule_time TIME,
    schedule_day_of_week INTEGER,
    schedule_day_of_month INTEGER,

    -- Distribution
    recipients JSONB,
    delivery_format VARCHAR(20) CHECK (
        delivery_format IN ('email', 'dashboard', 'api', 'webhook')
    ),

    -- Metadata
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    last_run_at TIMESTAMP,
    next_run_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- REPORT EXECUTIONS
-- =====================================================

-- Report execution history
CREATE TABLE IF NOT EXISTS report_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_definition_id UUID REFERENCES report_definitions(id),

    -- Execution Details
    execution_status VARCHAR(20) CHECK (
        execution_status IN ('pending', 'running', 'completed', 'failed', 'cancelled')
    ),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    execution_time_ms INTEGER,

    -- Results
    row_count INTEGER,
    result_data JSONB,
    result_url TEXT,

    -- Error Handling
    error_message TEXT,
    error_code VARCHAR(50),

    -- Distribution
    delivered_to JSONB,
    delivery_status VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DASHBOARD WIDGETS
-- =====================================================

-- Dashboard widget configurations
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),

    widget_name VARCHAR(255) NOT NULL,
    widget_type VARCHAR(50) NOT NULL CHECK (
        widget_type IN ('chart', 'metric', 'table', 'list', 'map', 'custom')
    ),

    -- Configuration
    data_source VARCHAR(100),
    query_config JSONB,
    refresh_interval_seconds INTEGER DEFAULT 300,

    -- Display
    position_x INTEGER,
    position_y INTEGER,
    width INTEGER,
    height INTEGER,
    color_scheme VARCHAR(50),

    -- Settings
    is_visible BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CUSTOM METRICS
-- =====================================================

-- User-defined custom metrics
CREATE TABLE IF NOT EXISTS custom_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    metric_name VARCHAR(255) NOT NULL,
    metric_type VARCHAR(50),
    calculation_formula TEXT,

    -- Data Points
    timestamp TIMESTAMP NOT NULL,
    value DECIMAL(20, 4),

    -- Dimensions
    dimension1_name VARCHAR(50),
    dimension1_value VARCHAR(255),
    dimension2_name VARCHAR(50),
    dimension2_value VARCHAR(255),
    dimension3_name VARCHAR(50),
    dimension3_value VARCHAR(255),

    -- Metadata
    tags JSONB,
    source VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_custom_metrics_name_time (metric_name, timestamp)
);

-- =====================================================
-- DATA EXPORT LOGS
-- =====================================================

-- Track data exports for compliance
CREATE TABLE IF NOT EXISTS data_export_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Export Details
    export_type VARCHAR(50),
    export_format VARCHAR(20) CHECK (
        export_format IN ('csv', 'excel', 'json', 'pdf', 'xml')
    ),

    -- Data Scope
    date_from DATE,
    date_to DATE,
    record_count INTEGER,
    file_size_bytes BIGINT,

    -- User Information
    exported_by UUID REFERENCES users(id),
    export_reason TEXT,

    -- File Information
    file_name VARCHAR(255),
    file_path TEXT,
    download_url TEXT,
    expires_at TIMESTAMP,

    -- Compliance
    contains_pii BOOLEAN DEFAULT false,
    data_classification VARCHAR(50),
    retention_days INTEGER DEFAULT 30,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate user engagement score
CREATE OR REPLACE FUNCTION calculate_user_engagement_score(
    p_user_id UUID,
    p_period_days INTEGER DEFAULT 30
) RETURNS DECIMAL AS $$
DECLARE
    v_score DECIMAL(5, 2);
    v_login_count INTEGER;
    v_transaction_count INTEGER;
    v_feature_usage_count INTEGER;
BEGIN
    -- Get login count
    SELECT COUNT(*) INTO v_login_count
    FROM user_analytics
    WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE - INTERVAL '1 day' * p_period_days;

    -- Get transaction count
    SELECT COUNT(*) INTO v_transaction_count
    FROM transactions
    WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE - INTERVAL '1 day' * p_period_days;

    -- Calculate engagement score (simplified formula)
    v_score := LEAST(100,
        (v_login_count * 2) +
        (v_transaction_count * 5) +
        (v_feature_usage_count * 3)
    );

    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Function to generate transaction analytics
CREATE OR REPLACE FUNCTION generate_transaction_analytics(
    p_date DATE
) RETURNS VOID AS $$
BEGIN
    INSERT INTO transaction_analytics (
        date, hour, day_of_week, week_of_year, month, quarter, year,
        total_transactions, total_volume, average_transaction_size,
        deposits_count, deposits_volume,
        withdrawals_count, withdrawals_volume,
        successful_transactions, failed_transactions
    )
    SELECT
        p_date,
        EXTRACT(HOUR FROM created_at) as hour,
        EXTRACT(DOW FROM p_date),
        EXTRACT(WEEK FROM p_date),
        EXTRACT(MONTH FROM p_date),
        EXTRACT(QUARTER FROM p_date),
        EXTRACT(YEAR FROM p_date),
        COUNT(*),
        SUM(amount),
        AVG(amount),
        COUNT(*) FILTER (WHERE transaction_type = 'deposit'),
        COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'deposit'), 0),
        COUNT(*) FILTER (WHERE transaction_type = 'withdrawal'),
        COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'withdrawal'), 0),
        COUNT(*) FILTER (WHERE status = 'completed'),
        COUNT(*) FILTER (WHERE status = 'failed')
    FROM transactions
    WHERE DATE(created_at) = p_date
    GROUP BY EXTRACT(HOUR FROM created_at)
    ON CONFLICT (date, hour) DO UPDATE
    SET total_transactions = EXCLUDED.total_transactions,
        total_volume = EXCLUDED.total_volume,
        average_transaction_size = EXCLUDED.average_transaction_size,
        deposits_count = EXCLUDED.deposits_count,
        deposits_volume = EXCLUDED.deposits_volume,
        withdrawals_count = EXCLUDED.withdrawals_count,
        withdrawals_volume = EXCLUDED.withdrawals_volume,
        successful_transactions = EXCLUDED.successful_transactions,
        failed_transactions = EXCLUDED.failed_transactions,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate cohort retention
CREATE OR REPLACE FUNCTION calculate_cohort_retention(
    p_cohort_date DATE,
    p_cohort_type VARCHAR(50)
) RETURNS VOID AS $$
DECLARE
    v_cohort_size INTEGER;
    v_period INTEGER;
BEGIN
    -- Get cohort size
    SELECT COUNT(DISTINCT user_id) INTO v_cohort_size
    FROM users
    WHERE DATE(created_at) = p_cohort_date;

    -- Calculate retention for different periods
    FOR v_period IN 0..30 LOOP
        INSERT INTO cohort_analytics (
            cohort_date, cohort_type, cohort_size,
            period_number, period_type,
            users_retained, retention_rate
        )
        SELECT
            p_cohort_date,
            p_cohort_type,
            v_cohort_size,
            v_period,
            'day',
            COUNT(DISTINCT t.user_id),
            CASE
                WHEN v_cohort_size > 0
                THEN (COUNT(DISTINCT t.user_id)::DECIMAL / v_cohort_size) * 100
                ELSE 0
            END
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id
            AND DATE(t.created_at) = p_cohort_date + INTERVAL '1 day' * v_period
        WHERE DATE(u.created_at) = p_cohort_date
        ON CONFLICT (cohort_date, cohort_type, period_number, period_type) DO UPDATE
        SET users_retained = EXCLUDED.users_retained,
            retention_rate = EXCLUDED.retention_rate;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to track KPI
CREATE OR REPLACE FUNCTION track_kpi(
    p_kpi_name VARCHAR(100),
    p_value DECIMAL(20, 2),
    p_date DATE DEFAULT CURRENT_DATE
) RETURNS VOID AS $$
DECLARE
    v_previous_value DECIMAL(20, 2);
    v_target_value DECIMAL(20, 2);
BEGIN
    -- Get previous value
    SELECT actual_value INTO v_previous_value
    FROM kpi_tracking
    WHERE kpi_name = p_kpi_name
    AND date = p_date - INTERVAL '1 day';

    -- Get target value (would be from configuration)
    v_target_value := p_value * 1.1; -- Placeholder

    INSERT INTO kpi_tracking (
        date, kpi_name, actual_value, previous_value,
        target_value, achievement_rate, growth_rate, trend
    ) VALUES (
        p_date,
        p_kpi_name,
        p_value,
        v_previous_value,
        v_target_value,
        CASE WHEN v_target_value > 0 THEN (p_value / v_target_value) * 100 ELSE 0 END,
        CASE WHEN v_previous_value > 0
            THEN ((p_value - v_previous_value) / v_previous_value) * 100
            ELSE 0
        END,
        CASE
            WHEN p_value > COALESCE(v_previous_value, 0) THEN 'up'
            WHEN p_value < COALESCE(v_previous_value, 0) THEN 'down'
            ELSE 'stable'
        END
    )
    ON CONFLICT (date, kpi_name) DO UPDATE
    SET actual_value = EXCLUDED.actual_value,
        previous_value = EXCLUDED.previous_value,
        achievement_rate = EXCLUDED.achievement_rate,
        growth_rate = EXCLUDED.growth_rate,
        trend = EXCLUDED.trend;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MATERIALIZED VIEWS
-- =====================================================

-- Daily active users
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_active_users AS
SELECT
    DATE(created_at) as date,
    COUNT(DISTINCT user_id) as dau,
    COUNT(*) as total_sessions
FROM user_analytics
GROUP BY DATE(created_at);

CREATE INDEX idx_mv_dau_date ON mv_daily_active_users(date);

-- Monthly active users
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_active_users AS
SELECT
    DATE_TRUNC('month', created_at) as month,
    COUNT(DISTINCT user_id) as mau
FROM user_analytics
GROUP BY DATE_TRUNC('month', created_at);

CREATE INDEX idx_mv_mau_month ON mv_monthly_active_users(month);

-- Revenue summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_revenue_summary AS
SELECT
    DATE_TRUNC('month', date) as month,
    SUM(gross_revenue) as total_gross_revenue,
    SUM(net_revenue) as total_net_revenue,
    AVG(gross_margin) as avg_gross_margin,
    AVG(arpu) as avg_arpu
FROM revenue_analytics
WHERE period_type = 'daily'
GROUP BY DATE_TRUNC('month', date);

CREATE INDEX idx_mv_revenue_month ON mv_revenue_summary(month);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update user behavior analytics
CREATE OR REPLACE FUNCTION update_user_behavior_analytics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_behavior_analytics (
        user_id,
        last_active_date,
        days_active
    ) VALUES (
        NEW.user_id,
        CURRENT_DATE,
        1
    )
    ON CONFLICT (user_id) DO UPDATE
    SET last_active_date = CURRENT_DATE,
        days_active = user_behavior_analytics.days_active + 1,
        updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_behavior
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_behavior_analytics();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_transaction_analytics_date ON transaction_analytics(date);
CREATE INDEX idx_revenue_analytics_date ON revenue_analytics(date, period_type);
CREATE INDEX idx_user_behavior_user ON user_behavior_analytics(user_id);
CREATE INDEX idx_product_analytics_feature ON product_analytics(feature_name, date);
CREATE INDEX idx_funnel_analytics_funnel ON funnel_analytics(funnel_name, date);
CREATE INDEX idx_cohort_analytics_cohort ON cohort_analytics(cohort_date, cohort_type);
CREATE INDEX idx_kpi_tracking_kpi ON kpi_tracking(kpi_name, date);
CREATE INDEX idx_report_definitions_active ON report_definitions(is_active, next_run_at);
CREATE INDEX idx_custom_metrics_lookup ON custom_metrics(metric_name, timestamp);

-- =====================================================
-- SAMPLE DATA - REPORT DEFINITIONS
-- =====================================================

INSERT INTO report_definitions (
    report_name, report_type, query_definition, schedule_frequency, is_scheduled
) VALUES
    ('Daily Transaction Summary', 'summary',
     '{"table": "transaction_analytics", "metrics": ["total_volume", "total_transactions"]}',
     'daily', true),

    ('Monthly Revenue Report', 'detailed',
     '{"table": "revenue_analytics", "period": "monthly", "metrics": ["gross_revenue", "net_revenue", "margins"]}',
     'monthly', true),

    ('User Engagement Dashboard', 'dashboard',
     '{"tables": ["user_analytics", "user_behavior_analytics"], "metrics": ["dau", "mau", "engagement_score"]}',
     'daily', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE user_analytics IS 'User activity and session tracking';
COMMENT ON TABLE transaction_analytics IS 'Aggregated transaction metrics and trends';
COMMENT ON TABLE revenue_analytics IS 'Revenue, costs, and margin tracking';
COMMENT ON TABLE user_behavior_analytics IS 'User behavior patterns and cohort analysis';
COMMENT ON TABLE product_analytics IS 'Product feature usage and adoption metrics';
COMMENT ON TABLE funnel_analytics IS 'Conversion funnel tracking and optimization';
COMMENT ON TABLE cohort_analytics IS 'Cohort retention and lifetime value analysis';
COMMENT ON TABLE kpi_tracking IS 'Key performance indicator tracking';
COMMENT ON TABLE report_definitions IS 'Saved report configurations and schedules';
COMMENT ON TABLE dashboard_widgets IS 'Customizable dashboard widget configurations';

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
-- Phase 3 - Day 17: Analytics & Reporting System
-- Total Tables: 13
-- Total Functions: 4
-- Total Materialized Views: 3
-- Total Triggers: 1
-- Database Safety: ✅ Compliant (No DROP/DELETE/TRUNCATE)