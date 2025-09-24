-- =====================================================
-- PHASE 3 - DAY 16: NOTIFICATIONS & ALERTS SYSTEM
-- =====================================================
-- Complete notification and alerting system for consumer wallet
-- Supports email, SMS, push, and in-app notifications
-- Database Safety: No DROP/DELETE/TRUNCATE operations
-- =====================================================

-- =====================================================
-- NOTIFICATION PREFERENCES
-- =====================================================

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),

    -- Channel Preferences
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT true,
    push_enabled BOOLEAN DEFAULT true,
    in_app_enabled BOOLEAN DEFAULT true,

    -- Transaction Notifications
    transaction_alerts BOOLEAN DEFAULT true,
    transaction_threshold DECIMAL(15, 2),
    large_transaction_alert BOOLEAN DEFAULT true,
    international_transaction_alert BOOLEAN DEFAULT true,

    -- Security Notifications
    login_alerts BOOLEAN DEFAULT true,
    password_change_alerts BOOLEAN DEFAULT true,
    device_change_alerts BOOLEAN DEFAULT true,
    suspicious_activity_alerts BOOLEAN DEFAULT true,

    -- Account Notifications
    low_balance_alerts BOOLEAN DEFAULT true,
    low_balance_threshold DECIMAL(15, 2) DEFAULT 100.00,
    deposit_alerts BOOLEAN DEFAULT true,
    withdrawal_alerts BOOLEAN DEFAULT true,

    -- Payment Notifications
    payment_due_reminders BOOLEAN DEFAULT true,
    payment_success_alerts BOOLEAN DEFAULT true,
    payment_failure_alerts BOOLEAN DEFAULT true,
    recurring_payment_alerts BOOLEAN DEFAULT true,

    -- Card Notifications
    card_transaction_alerts BOOLEAN DEFAULT true,
    card_expiry_reminders BOOLEAN DEFAULT true,
    card_limit_alerts BOOLEAN DEFAULT true,

    -- P2P Notifications
    money_request_alerts BOOLEAN DEFAULT true,
    money_received_alerts BOOLEAN DEFAULT true,
    split_bill_alerts BOOLEAN DEFAULT true,

    -- Investment Notifications
    trade_execution_alerts BOOLEAN DEFAULT true,
    dividend_alerts BOOLEAN DEFAULT true,
    portfolio_alerts BOOLEAN DEFAULT true,
    market_alerts BOOLEAN DEFAULT false,

    -- Rewards Notifications
    points_earned_alerts BOOLEAN DEFAULT true,
    reward_expiry_alerts BOOLEAN DEFAULT true,
    tier_change_alerts BOOLEAN DEFAULT true,
    offer_alerts BOOLEAN DEFAULT true,

    -- Marketing Notifications
    promotional_emails BOOLEAN DEFAULT false,
    product_updates BOOLEAN DEFAULT true,
    newsletter BOOLEAN DEFAULT false,

    -- Quiet Hours
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone VARCHAR(50) DEFAULT 'UTC',

    -- Frequency Settings
    digest_frequency VARCHAR(20) DEFAULT 'immediate' CHECK (
        digest_frequency IN ('immediate', 'hourly', 'daily', 'weekly')
    ),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id)
);

-- =====================================================
-- NOTIFICATION TEMPLATES
-- =====================================================

-- Notification template definitions
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    template_code VARCHAR(100) UNIQUE NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    template_category VARCHAR(50) NOT NULL CHECK (
        template_category IN ('transaction', 'security', 'account', 'payment',
                             'card', 'p2p', 'investment', 'rewards', 'marketing', 'system')
    ),

    -- Channel-specific templates
    email_subject VARCHAR(500),
    email_body_html TEXT,
    email_body_text TEXT,

    sms_body VARCHAR(500),

    push_title VARCHAR(255),
    push_body VARCHAR(500),
    push_action VARCHAR(255),

    in_app_title VARCHAR(255),
    in_app_body TEXT,
    in_app_action VARCHAR(255),

    -- Template variables (JSON array of required variables)
    required_variables JSONB,
    optional_variables JSONB,

    -- Settings
    priority VARCHAR(20) DEFAULT 'normal' CHECK (
        priority IN ('low', 'normal', 'high', 'critical')
    ),
    is_active BOOLEAN DEFAULT true,
    requires_action BOOLEAN DEFAULT false,
    expires_in_hours INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

-- Individual notification records
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    template_id UUID REFERENCES notification_templates(id),

    -- Notification Details
    notification_type VARCHAR(50) NOT NULL,
    notification_category VARCHAR(50) NOT NULL,
    title VARCHAR(500),
    message TEXT NOT NULL,

    -- Channel Information
    channel VARCHAR(20) NOT NULL CHECK (
        channel IN ('email', 'sms', 'push', 'in_app', 'all')
    ),

    -- Delivery Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'queued', 'sending', 'sent', 'delivered',
                  'failed', 'bounced', 'opened', 'clicked', 'archived')
    ),

    -- Tracking
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    failed_at TIMESTAMP,

    -- Error Handling
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    error_code VARCHAR(50),

    -- Message IDs from providers
    email_message_id VARCHAR(255),
    sms_message_id VARCHAR(255),
    push_message_id VARCHAR(255),

    -- Priority and Expiry
    priority VARCHAR(20) DEFAULT 'normal',
    expires_at TIMESTAMP,

    -- Action and Context
    action_url TEXT,
    action_data JSONB,
    metadata JSONB,

    -- Related Entity
    entity_type VARCHAR(50),
    entity_id UUID,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ALERT RULES
-- =====================================================

-- Custom alert rules configuration
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),

    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL CHECK (
        rule_type IN ('transaction', 'balance', 'security', 'spending',
                     'investment', 'custom')
    ),

    -- Rule Conditions (JSON)
    conditions JSONB NOT NULL,
    /* Example conditions:
    {
        "operator": "AND",
        "rules": [
            {"field": "amount", "operator": ">", "value": 1000},
            {"field": "merchant_category", "operator": "IN", "value": ["gambling", "casino"]}
        ]
    }
    */

    -- Actions
    notification_channels JSONB DEFAULT '["in_app"]',
    template_id UUID REFERENCES notification_templates(id),
    custom_message TEXT,

    -- Settings
    is_active BOOLEAN DEFAULT true,
    priority VARCHAR(20) DEFAULT 'normal',
    cooldown_minutes INTEGER DEFAULT 60,
    last_triggered_at TIMESTAMP,
    trigger_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DEVICE TOKENS
-- =====================================================

-- Device tokens for push notifications
CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),

    device_id VARCHAR(255) NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (
        platform IN ('ios', 'android', 'web', 'macos', 'windows')
    ),

    -- Push Notification Token
    push_token TEXT NOT NULL,
    token_type VARCHAR(20) DEFAULT 'fcm' CHECK (
        token_type IN ('fcm', 'apns', 'web_push')
    ),

    -- Device Information
    device_name VARCHAR(255),
    device_model VARCHAR(255),
    os_version VARCHAR(50),
    app_version VARCHAR(50),

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    last_used_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, device_id)
);

-- =====================================================
-- NOTIFICATION QUEUE
-- =====================================================

-- Queue for batch processing notifications
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id),

    channel VARCHAR(20) NOT NULL,
    recipient VARCHAR(500) NOT NULL, -- email, phone, or device token

    -- Queue Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'processing', 'sent', 'failed', 'cancelled', 'archived')
    ),

    -- Processing
    scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processor_id VARCHAR(100),

    -- Retry Logic
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP,

    -- Error Tracking
    error_message TEXT,
    error_code VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- NOTIFICATION HISTORY
-- =====================================================

-- Historical record of all notifications
CREATE TABLE IF NOT EXISTS notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID,
    user_id UUID NOT NULL,

    -- Snapshot of notification data
    notification_data JSONB NOT NULL,

    -- Delivery Information
    channels_attempted JSONB,
    channels_succeeded JSONB,

    -- Performance Metrics
    total_attempts INTEGER DEFAULT 0,
    first_sent_at TIMESTAMP,
    last_sent_at TIMESTAMP,
    delivered_at TIMESTAMP,

    -- User Interaction
    opened BOOLEAN DEFAULT false,
    clicked BOOLEAN DEFAULT false,
    dismissed BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- EMAIL SUPPRESSION LIST
-- =====================================================

-- Email addresses that should not receive emails
CREATE TABLE IF NOT EXISTS email_suppression_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_address VARCHAR(255) UNIQUE NOT NULL,

    suppression_type VARCHAR(20) NOT NULL CHECK (
        suppression_type IN ('bounce', 'complaint', 'unsubscribe', 'manual')
    ),

    reason TEXT,
    source VARCHAR(100),

    is_permanent BOOLEAN DEFAULT false,
    expires_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SMS BLACKLIST
-- =====================================================

-- Phone numbers that opted out of SMS
CREATE TABLE IF NOT EXISTS sms_blacklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,

    blacklist_reason VARCHAR(50) CHECK (
        blacklist_reason IN ('opt_out', 'invalid', 'complaint', 'carrier_block', 'manual')
    ),

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- NOTIFICATION ANALYTICS
-- =====================================================

-- Analytics and metrics for notifications
CREATE TABLE IF NOT EXISTS notification_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Time Window
    date DATE NOT NULL,
    hour INTEGER CHECK (hour >= 0 AND hour < 24),

    -- Dimensions
    channel VARCHAR(20),
    notification_type VARCHAR(50),
    template_id UUID REFERENCES notification_templates(id),

    -- Metrics
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,

    -- Performance
    avg_delivery_time_seconds DECIMAL(10, 2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(date, hour, channel, notification_type, template_id)
);

-- =====================================================
-- IN-APP MESSAGES
-- =====================================================

-- In-app messages and announcements
CREATE TABLE IF NOT EXISTS in_app_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),

    message_type VARCHAR(50) NOT NULL CHECK (
        message_type IN ('alert', 'announcement', 'promotion', 'tip', 'warning', 'success')
    ),

    title VARCHAR(255),
    message TEXT NOT NULL,

    -- Display Settings
    icon VARCHAR(100),
    color VARCHAR(20),
    position VARCHAR(20) DEFAULT 'top' CHECK (
        position IN ('top', 'bottom', 'center', 'toast')
    ),

    -- Interaction
    is_dismissible BOOLEAN DEFAULT true,
    requires_acknowledgment BOOLEAN DEFAULT false,
    action_button_text VARCHAR(100),
    action_url TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'unread' CHECK (
        status IN ('unread', 'read', 'acknowledged', 'dismissed', 'archived')
    ),

    read_at TIMESTAMP,
    acknowledged_at TIMESTAMP,
    dismissed_at TIMESTAMP,

    -- Validity
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to create notification from template
CREATE OR REPLACE FUNCTION create_notification_from_template(
    p_user_id UUID,
    p_template_code VARCHAR(100),
    p_variables JSONB,
    p_channel VARCHAR(20) DEFAULT 'all'
) RETURNS UUID AS $$
DECLARE
    v_template notification_templates;
    v_notification_id UUID;
    v_message TEXT;
BEGIN
    -- Get template
    SELECT * INTO v_template
    FROM notification_templates
    WHERE template_code = p_template_code AND is_active = true;

    IF v_template IS NULL THEN
        RAISE EXCEPTION 'Template not found or inactive: %', p_template_code;
    END IF;

    -- Process template with variables
    v_message := v_template.in_app_body;

    -- Simple variable replacement (in production, use more sophisticated templating)
    FOR key, value IN SELECT * FROM jsonb_each_text(p_variables)
    LOOP
        v_message := REPLACE(v_message, '{{' || key || '}}', value);
    END LOOP;

    -- Create notification
    INSERT INTO notifications (
        user_id, template_id, notification_type, notification_category,
        title, message, channel, priority, action_url
    ) VALUES (
        p_user_id, v_template.id, v_template.template_code, v_template.template_category,
        v_template.in_app_title, v_message, p_channel, v_template.priority,
        v_template.in_app_action
    ) RETURNING id INTO v_notification_id;

    -- Queue for sending
    INSERT INTO notification_queue (notification_id, channel, recipient, status)
    SELECT v_notification_id,
           CASE
               WHEN p_channel = 'all' THEN unnest(ARRAY['email', 'sms', 'push', 'in_app'])
               ELSE p_channel
           END,
           p_user_id::TEXT,
           'pending';

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check alert rules
CREATE OR REPLACE FUNCTION check_alert_rules(
    p_user_id UUID,
    p_event_type VARCHAR(50),
    p_event_data JSONB
) RETURNS VOID AS $$
DECLARE
    v_rule alert_rules;
BEGIN
    -- Check all active rules for the user
    FOR v_rule IN
        SELECT * FROM alert_rules
        WHERE (user_id = p_user_id OR user_id IS NULL)
        AND is_active = true
        AND rule_type = p_event_type
    LOOP
        -- Check cooldown
        IF v_rule.last_triggered_at IS NULL OR
           v_rule.last_triggered_at < CURRENT_TIMESTAMP - INTERVAL '1 minute' * v_rule.cooldown_minutes THEN

            -- Evaluate conditions (simplified - in production use more sophisticated rule engine)
            -- For now, we'll trigger all matching rules

            -- Create notification
            PERFORM create_notification_from_template(
                p_user_id,
                'ALERT_' || UPPER(v_rule.rule_type),
                jsonb_build_object(
                    'rule_name', v_rule.rule_name,
                    'event_data', p_event_data
                )
            );

            -- Update rule
            UPDATE alert_rules
            SET last_triggered_at = CURRENT_TIMESTAMP,
                trigger_count = trigger_count + 1
            WHERE id = v_rule.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to update notification analytics
CREATE OR REPLACE FUNCTION update_notification_analytics(
    p_notification_id UUID,
    p_event_type VARCHAR(20)
) RETURNS VOID AS $$
DECLARE
    v_notification notifications;
BEGIN
    SELECT * INTO v_notification FROM notifications WHERE id = p_notification_id;

    IF v_notification IS NOT NULL THEN
        INSERT INTO notification_analytics (
            date, hour, channel, notification_type, template_id,
            sent_count, delivered_count, opened_count, clicked_count, failed_count
        ) VALUES (
            CURRENT_DATE, EXTRACT(HOUR FROM CURRENT_TIMESTAMP),
            v_notification.channel, v_notification.notification_type, v_notification.template_id,
            CASE WHEN p_event_type = 'sent' THEN 1 ELSE 0 END,
            CASE WHEN p_event_type = 'delivered' THEN 1 ELSE 0 END,
            CASE WHEN p_event_type = 'opened' THEN 1 ELSE 0 END,
            CASE WHEN p_event_type = 'clicked' THEN 1 ELSE 0 END,
            CASE WHEN p_event_type = 'failed' THEN 1 ELSE 0 END
        )
        ON CONFLICT (date, hour, channel, notification_type, template_id) DO UPDATE
        SET sent_count = notification_analytics.sent_count + CASE WHEN p_event_type = 'sent' THEN 1 ELSE 0 END,
            delivered_count = notification_analytics.delivered_count + CASE WHEN p_event_type = 'delivered' THEN 1 ELSE 0 END,
            opened_count = notification_analytics.opened_count + CASE WHEN p_event_type = 'opened' THEN 1 ELSE 0 END,
            clicked_count = notification_analytics.clicked_count + CASE WHEN p_event_type = 'clicked' THEN 1 ELSE 0 END,
            failed_count = notification_analytics.failed_count + CASE WHEN p_event_type = 'failed' THEN 1 ELSE 0 END;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update notification status
CREATE OR REPLACE FUNCTION update_notification_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update main notification when queue item is processed
    IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
        UPDATE notifications
        SET status = 'sent',
            sent_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.notification_id;

        -- Update analytics
        PERFORM update_notification_analytics(NEW.notification_id, 'sent');
    END IF;

    IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
        UPDATE notifications
        SET status = 'failed',
            failed_at = CURRENT_TIMESTAMP,
            error_message = NEW.error_message,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.notification_id;

        -- Update analytics
        PERFORM update_notification_analytics(NEW.notification_id, 'failed');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_on_queue_change
    AFTER UPDATE ON notification_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_status();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_created_channel ON notifications(created_at DESC, channel);
CREATE INDEX idx_notification_queue_status ON notification_queue(status, scheduled_for);
CREATE INDEX idx_device_tokens_user ON device_tokens(user_id, is_active);
CREATE INDEX idx_alert_rules_user_type ON alert_rules(user_id, rule_type, is_active);
CREATE INDEX idx_in_app_messages_user_status ON in_app_messages(user_id, status);
CREATE INDEX idx_notification_analytics_date ON notification_analytics(date, hour);

-- =====================================================
-- SAMPLE DATA - NOTIFICATION TEMPLATES
-- =====================================================

-- Transaction notifications
INSERT INTO notification_templates (template_code, template_name, template_category,
    email_subject, email_body_text, sms_body, push_title, push_body,
    in_app_title, in_app_body, priority)
VALUES
    ('TRANSACTION_SUCCESS', 'Transaction Success', 'transaction',
     'Transaction Successful', 'Your transaction of {{amount}} to {{recipient}} was successful.',
     'Transaction of {{amount}} to {{recipient}} successful.',
     'Payment Sent', '{{amount}} sent successfully',
     'Transaction Complete', 'Your payment of {{amount}} to {{recipient}} has been processed successfully.',
     'normal'),

    ('LARGE_TRANSACTION_ALERT', 'Large Transaction Alert', 'security',
     'Large Transaction Alert', 'A large transaction of {{amount}} was just made from your account.',
     'Alert: Large transaction of {{amount}} on your account.',
     'Security Alert', 'Large transaction detected',
     'Large Transaction Alert', 'A transaction of {{amount}} was just processed. If this wasn''t you, please contact support immediately.',
     'high'),

    ('LOW_BALANCE_WARNING', 'Low Balance Warning', 'account',
     'Low Balance Alert', 'Your account balance is low: {{balance}}',
     'Your balance is low: {{balance}}',
     'Low Balance', 'Account balance: {{balance}}',
     'Low Balance Warning', 'Your account balance has fallen below {{threshold}}. Current balance: {{balance}}',
     'normal');

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE notification_preferences IS 'User preferences for notification channels and types';
COMMENT ON TABLE notification_templates IS 'Reusable templates for notifications across channels';
COMMENT ON TABLE notifications IS 'Individual notification records with delivery tracking';
COMMENT ON TABLE alert_rules IS 'Custom alert rules configured by users';
COMMENT ON TABLE device_tokens IS 'Push notification tokens for mobile and web devices';
COMMENT ON TABLE notification_queue IS 'Queue for batch processing and retry logic';
COMMENT ON TABLE notification_history IS 'Historical archive of all notifications';
COMMENT ON TABLE in_app_messages IS 'In-app messages and announcements';

-- =====================================================
-- MIGRATION COMPLETED
-- =====================================================
-- Phase 3 - Day 16: Notifications & Alerts System
-- Total Tables: 11
-- Total Functions: 3
-- Total Triggers: 1
-- Database Safety: ✅ Compliant (No DROP/DELETE/TRUNCATE)