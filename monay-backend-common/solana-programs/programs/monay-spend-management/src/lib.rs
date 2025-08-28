use anchor_lang::prelude::*;
use anchor_spl::token_2022::{self, Token2022, TokenAccount};
use anchor_spl::token_interface::{Mint, TokenInterface};

declare_id!("MonaySpendMgmt11111111111111111111111111111");

#[program]
pub mod monay_spend_management {
    use super::*;

    /// Initialize the spend management program
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let spend_manager = &mut ctx.accounts.spend_manager;
        spend_manager.authority = ctx.accounts.authority.key();
        spend_manager.bump = ctx.bumps.spend_manager;
        Ok(())
    }

    /// Create business rule
    pub fn create_business_rule(
        ctx: Context<CreateBusinessRule>,
        rule_id: u64,
        name: String,
        category: BusinessRuleCategory,
        conditions: Vec<u8>,
        actions: Vec<u8>,
        priority: u16,
    ) -> Result<()> {
        let business_rule = &mut ctx.accounts.business_rule;
        business_rule.rule_id = rule_id;
        business_rule.name = name;
        business_rule.category = category;
        business_rule.conditions = conditions;
        business_rule.actions = actions;
        business_rule.priority = priority;
        business_rule.is_active = true;
        business_rule.created_at = Clock::get()?.unix_timestamp;
        business_rule.bump = ctx.bumps.business_rule;
        Ok(())
    }

    /// Assign business rule to user
    pub fn assign_rule_to_user(
        ctx: Context<AssignRuleToUser>,
        effective_from: i64,
        effective_to: Option<i64>,
    ) -> Result<()> {
        let user_rule = &mut ctx.accounts.user_business_rule;
        user_rule.user = ctx.accounts.user.key();
        user_rule.business_rule = ctx.accounts.business_rule.key();
        user_rule.effective_from = effective_from;
        user_rule.effective_to = effective_to;
        user_rule.is_active = true;
        user_rule.assigned_at = Clock::get()?.unix_timestamp;
        user_rule.bump = ctx.bumps.user_business_rule;
        Ok(())
    }

    /// Set spend limits for user
    pub fn set_spend_limits(
        ctx: Context<SetSpendLimits>,
        daily_limit: u64,
        monthly_limit: u64,
        transaction_limit: u64,
    ) -> Result<()> {
        let spend_limit = &mut ctx.accounts.spend_limit;
        spend_limit.user = ctx.accounts.user.key();
        spend_limit.daily_limit = daily_limit;
        spend_limit.monthly_limit = monthly_limit;
        spend_limit.transaction_limit = transaction_limit;
        spend_limit.daily_spent = 0;
        spend_limit.monthly_spent = 0;
        spend_limit.last_reset_day = Clock::get()?.unix_timestamp / 86400; // Days since epoch
        spend_limit.last_reset_month = Clock::get()?.unix_timestamp / (86400 * 30); // Months since epoch
        spend_limit.is_active = true;
        spend_limit.bump = ctx.bumps.spend_limit;
        Ok(())
    }

    /// Update KYC data
    pub fn update_kyc_data(
        ctx: Context<UpdateKycData>,
        kyc_level: KycLevel,
        is_verified: bool,
        expires_at: Option<i64>,
        risk_score: u8,
    ) -> Result<()> {
        let kyc_profile = &mut ctx.accounts.kyc_profile;
        kyc_profile.user = ctx.accounts.user.key();
        kyc_profile.kyc_level = kyc_level;
        kyc_profile.is_verified = is_verified;
        kyc_profile.verified_at = Clock::get()?.unix_timestamp;
        kyc_profile.expires_at = expires_at;
        kyc_profile.risk_score = risk_score;
        kyc_profile.bump = ctx.bumps.kyc_profile;
        Ok(())
    }

    /// Transfer with business rules enforcement
    pub fn transfer_with_rules(
        ctx: Context<TransferWithRules>,
        amount: u64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        
        // Check KYC eligibility
        require!(
            check_kyc_eligibility(&ctx.accounts.sender_kyc, clock.unix_timestamp),
            SpendError::KycNotEligible
        );
        
        if let Some(recipient_kyc) = &ctx.accounts.recipient_kyc {
            require!(
                check_kyc_eligibility(recipient_kyc, clock.unix_timestamp),
                SpendError::RecipientKycNotEligible
            );
        }

        // Check spend limits
        let spend_limit = &mut ctx.accounts.spend_limit;
        require!(
            check_spend_limits(spend_limit, amount, clock.unix_timestamp),
            SpendError::SpendLimitExceeded
        );

        // Update spend tracking
        update_spend_tracking(spend_limit, amount, clock.unix_timestamp);

        // Execute token transfer
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token_2022::Transfer {
                from: ctx.accounts.sender_token_account.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.sender.to_account_info(),
            },
        );
        
        token_2022::transfer(transfer_ctx, amount)?;

        // Emit transfer event
        emit!(TransferWithRulesEvent {
            sender: ctx.accounts.sender.key(),
            recipient: ctx.accounts.recipient.key(),
            amount,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Create spend violation record
    pub fn record_spend_violation(
        ctx: Context<RecordSpendViolation>,
        attempted_amount: u64,
        limit_amount: u64,
        violation_type: SpendViolationType,
    ) -> Result<()> {
        let violation = &mut ctx.accounts.spend_violation;
        violation.user = ctx.accounts.user.key();
        violation.spend_limit = ctx.accounts.spend_limit.key();
        violation.attempted_amount = attempted_amount;
        violation.limit_amount = limit_amount;
        violation.excess_amount = attempted_amount.saturating_sub(limit_amount);
        violation.violation_type = violation_type;
        violation.occurred_at = Clock::get()?.unix_timestamp;
        violation.status = ViolationStatus::Open;
        violation.bump = ctx.bumps.spend_violation;
        Ok(())
    }
}

// Helper functions
fn check_kyc_eligibility(kyc_profile: &KycProfile, current_time: i64) -> bool {
    if !kyc_profile.is_verified {
        return false;
    }
    
    if let Some(expires_at) = kyc_profile.expires_at {
        if expires_at < current_time {
            return false;
        }
    }
    
    if kyc_profile.risk_score > 80 {
        return false;
    }
    
    true
}

fn check_spend_limits(spend_limit: &SpendLimit, amount: u64, current_time: i64) -> bool {
    if !spend_limit.is_active {
        return true;
    }

    // Check transaction limit
    if amount > spend_limit.transaction_limit {
        return false;
    }

    // Check daily limit
    let current_day = current_time / 86400;
    let daily_spent = if current_day > spend_limit.last_reset_day {
        0
    } else {
        spend_limit.daily_spent
    };
    
    if daily_spent + amount > spend_limit.daily_limit {
        return false;
    }

    // Check monthly limit
    let current_month = current_time / (86400 * 30);
    let monthly_spent = if current_month > spend_limit.last_reset_month {
        0
    } else {
        spend_limit.monthly_spent
    };
    
    if monthly_spent + amount > spend_limit.monthly_limit {
        return false;
    }

    true
}

fn update_spend_tracking(spend_limit: &mut SpendLimit, amount: u64, current_time: i64) {
    let current_day = current_time / 86400;
    let current_month = current_time / (86400 * 30);

    // Reset daily if new day
    if current_day > spend_limit.last_reset_day {
        spend_limit.daily_spent = 0;
        spend_limit.last_reset_day = current_day;
    }

    // Reset monthly if new month
    if current_month > spend_limit.last_reset_month {
        spend_limit.monthly_spent = 0;
        spend_limit.last_reset_month = current_month;
    }

    spend_limit.daily_spent += amount;
    spend_limit.monthly_spent += amount;
}

// Account structures
#[account]
pub struct SpendManager {
    pub authority: Pubkey,
    pub bump: u8,
}

#[account]
pub struct BusinessRule {
    pub rule_id: u64,
    pub name: String,
    pub category: BusinessRuleCategory,
    pub conditions: Vec<u8>,
    pub actions: Vec<u8>,
    pub priority: u16,
    pub is_active: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct UserBusinessRule {
    pub user: Pubkey,
    pub business_rule: Pubkey,
    pub effective_from: i64,
    pub effective_to: Option<i64>,
    pub is_active: bool,
    pub assigned_at: i64,
    pub bump: u8,
}

#[account]
pub struct SpendLimit {
    pub user: Pubkey,
    pub daily_limit: u64,
    pub monthly_limit: u64,
    pub transaction_limit: u64,
    pub daily_spent: u64,
    pub monthly_spent: u64,
    pub last_reset_day: i64,
    pub last_reset_month: i64,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
pub struct KycProfile {
    pub user: Pubkey,
    pub kyc_level: KycLevel,
    pub is_verified: bool,
    pub verified_at: i64,
    pub expires_at: Option<i64>,
    pub risk_score: u8,
    pub bump: u8,
}

#[account]
pub struct SpendViolation {
    pub user: Pubkey,
    pub spend_limit: Pubkey,
    pub attempted_amount: u64,
    pub limit_amount: u64,
    pub excess_amount: u64,
    pub violation_type: SpendViolationType,
    pub occurred_at: i64,
    pub status: ViolationStatus,
    pub bump: u8,
}

// Context structures
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1,
        seeds = [b"spend_manager"],
        bump
    )]
    pub spend_manager: Account<'info, SpendManager>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(rule_id: u64)]
pub struct CreateBusinessRule<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 8 + 32 + 100 + 1 + 200 + 200 + 2 + 1 + 8 + 1,
        seeds = [b"business_rule", rule_id.to_le_bytes().as_ref()],
        bump
    )]
    pub business_rule: Account<'info, BusinessRule>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AssignRuleToUser<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 9 + 1 + 8 + 1,
        seeds = [
            b"user_business_rule",
            user.key().as_ref(),
            business_rule.key().as_ref()
        ],
        bump
    )]
    pub user_business_rule: Account<'info, UserBusinessRule>,
    
    /// CHECK: User account
    pub user: AccountInfo<'info>,
    
    pub business_rule: Account<'info, BusinessRule>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetSpendLimits<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 1 + 1,
        seeds = [b"spend_limit", user.key().as_ref()],
        bump
    )]
    pub spend_limit: Account<'info, SpendLimit>,
    
    /// CHECK: User account
    pub user: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateKycData<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + 32 + 1 + 1 + 8 + 9 + 1 + 1,
        seeds = [b"kyc_profile", user.key().as_ref()],
        bump
    )]
    pub kyc_profile: Account<'info, KycProfile>,
    
    /// CHECK: User account
    pub user: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferWithRules<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    
    /// CHECK: Recipient account
    pub recipient: AccountInfo<'info>,
    
    #[account(mut)]
    pub sender_token_account: InterfaceAccount<'info, TokenAccount>,
    
    #[account(mut)]
    pub recipient_token_account: InterfaceAccount<'info, TokenAccount>,
    
    pub sender_kyc: Account<'info, KycProfile>,
    
    pub recipient_kyc: Option<Account<'info, KycProfile>>,
    
    #[account(mut)]
    pub spend_limit: Account<'info, SpendLimit>,
    
    pub token_program: Program<'info, Token2022>,
}

#[derive(Accounts)]
pub struct RecordSpendViolation<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 8 + 1 + 1,
        seeds = [
            b"spend_violation",
            user.key().as_ref(),
            Clock::get()?.unix_timestamp.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub spend_violation: Account<'info, SpendViolation>,
    
    /// CHECK: User account
    pub user: AccountInfo<'info>,
    
    pub spend_limit: Account<'info, SpendLimit>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// Enums and Events
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BusinessRuleCategory {
    KycEligibility,
    SpendManagement,
    TransactionMonitoring,
    Compliance,
    RiskManagement,
    GeographicRestrictions,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum KycLevel {
    None,
    Basic,
    Enhanced,
    Premium,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum SpendViolationType {
    DailyLimit,
    MonthlyLimit,
    TransactionLimit,
    CategoryLimit,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ViolationStatus {
    Open,
    UnderReview,
    Resolved,
    Dismissed,
}

#[event]
pub struct TransferWithRulesEvent {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

// Error codes
#[error_code]
pub enum SpendError {
    #[msg("KYC requirements not met")]
    KycNotEligible,
    
    #[msg("Recipient KYC requirements not met")]
    RecipientKycNotEligible,
    
    #[msg("Spend limit exceeded")]
    SpendLimitExceeded,
    
    #[msg("Transaction limit exceeded")]
    TransactionLimitExceeded,
    
    #[msg("Daily limit exceeded")]
    DailyLimitExceeded,
    
    #[msg("Monthly limit exceeded")]
    MonthlyLimitExceeded,
}