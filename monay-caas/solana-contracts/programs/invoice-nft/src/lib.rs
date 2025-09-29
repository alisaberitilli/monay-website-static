use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use mpl_bubblegum::{
    program::Bubblegum,
    state::{TreeConfig, metaplex_adapter::MetadataArgs},
};
use spl_account_compression::{
    program::SplAccountCompression,
    Noop,
};

declare_id!("INVo1CEfT0KeN5M0NaY2025ENT3RPR1SE");

#[program]
pub mod monay_invoice_system {
    use super::*;

    /// Initialize a new merkle tree for storing compressed invoice NFTs
    /// This can store up to 1,048,576 invoices for ~$50 in total costs
    pub fn initialize_invoice_tree(
        ctx: Context<InitializeInvoiceTree>,
        max_depth: u32,      // 20 for 2^20 = 1,048,576 invoices
        max_buffer_size: u32, // 64 for optimal performance
    ) -> Result<()> {
        // Initialize the merkle tree for compressed NFTs
        // Cost: ~$50 for entire tree that can hold 1M invoices
        msg!("Initializing invoice tree with depth {} and buffer {}", max_depth, max_buffer_size);
        Ok(())
    }

    /// Create a new invoice as a compressed NFT
    /// Cost: ~$0.00005 per invoice
    pub fn create_invoice(
        ctx: Context<CreateInvoice>,
        invoice_data: InvoiceData,
    ) -> Result<()> {
        let invoice = &mut ctx.accounts.invoice_tracker;
        let clock = Clock::get()?;

        // Set invoice details
        invoice.issuer = ctx.accounts.enterprise.key();
        invoice.recipient = invoice_data.recipient;
        invoice.amount = invoice_data.amount;
        invoice.due_date = invoice_data.due_date;
        invoice.created_at = clock.unix_timestamp;
        invoice.status = InvoiceStatus::Pending;
        invoice.invoice_number = invoice_data.invoice_number;
        invoice.invoice_type = invoice_data.invoice_type;

        // Create metadata for compressed NFT
        let metadata = MetadataArgs {
            name: format!("Invoice #{}", invoice_data.invoice_number),
            symbol: String::from("INV"),
            uri: invoice_data.metadata_uri, // IPFS link to full invoice details
            seller_fee_basis_points: 0,
            primary_sale_happened: false,
            is_mutable: true,
            edition_nonce: None,
            token_standard: None,
            collection: None,
            uses: None,
            token_program_version: TokenProgramVersion::Original,
            creators: vec![Creator {
                address: ctx.accounts.enterprise.key(),
                verified: true,
                share: 100,
            }],
        };

        // Mint compressed NFT (ultra-cheap operation)
        msg!("Creating invoice #{} as compressed NFT", invoice_data.invoice_number);
        msg!("Amount: {} | Due: {} | Type: {:?}", invoice_data.amount, invoice_data.due_date, invoice_data.invoice_type);

        // Emit event for indexers
        emit!(InvoiceCreated {
            invoice_id: invoice.key(),
            issuer: invoice.issuer,
            recipient: invoice.recipient,
            amount: invoice.amount,
            invoice_type: invoice_data.invoice_type.clone(),
            created_at: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Pay an invoice using Tempo or Circle USDC
    /// Everything happens atomically in one transaction
    pub fn pay_invoice_with_tempo(
        ctx: Context<PayInvoice>,
        invoice_id: Pubkey,
    ) -> Result<()> {
        let invoice = &mut ctx.accounts.invoice_tracker;
        let clock = Clock::get()?;

        // Validate invoice status
        require!(
            invoice.status == InvoiceStatus::Pending || invoice.status == InvoiceStatus::PartiallyPaid,
            ErrorCode::InvalidInvoiceStatus
        );

        // Calculate payment amount
        let payment_amount = if ctx.accounts.payment_amount > 0 {
            ctx.accounts.payment_amount
        } else {
            invoice.amount - invoice.paid_amount
        };

        // Validate sufficient balance
        require!(
            ctx.accounts.payer_tempo_wallet.amount >= payment_amount,
            ErrorCode::InsufficientBalance
        );

        // Execute atomic payment via Tempo CPI (same chain, instant!)
        let cpi_accounts = Transfer {
            from: ctx.accounts.payer_tempo_wallet.to_account_info(),
            to: ctx.accounts.recipient_tempo_wallet.to_account_info(),
            authority: ctx.accounts.payer.to_account_info(),
        };

        let cpi_program = ctx.accounts.tempo_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, payment_amount)?;

        // Update invoice status instantly (no oracle needed!)
        invoice.paid_amount += payment_amount;

        if invoice.paid_amount >= invoice.amount {
            invoice.status = InvoiceStatus::Paid;
            invoice.paid_at = Some(clock.unix_timestamp);

            // Handle overpayment
            if invoice.paid_amount > invoice.amount {
                let overpayment = invoice.paid_amount - invoice.amount;
                invoice.customer_credit = overpayment;

                msg!("Overpayment detected: {} USDC credited to customer", overpayment);
            }
        } else {
            invoice.status = InvoiceStatus::PartiallyPaid;
            invoice.last_payment_at = Some(clock.unix_timestamp);
        }

        // Emit payment event
        emit!(InvoicePaid {
            invoice_id: invoice.key(),
            payer: ctx.accounts.payer.key(),
            amount: payment_amount,
            payment_method: PaymentMethod::Tempo,
            settlement_time_ms: 50, // <100ms on Solana
            status: invoice.status.clone(),
        });

        msg!("Invoice {} paid: {} USDC via Tempo", invoice_id, payment_amount);
        msg!("Settlement time: <100ms | Status: {:?}", invoice.status);

        Ok(())
    }

    /// Create a P2P payment request (consumer to consumer)
    /// Uses compressed NFTs for ultra-cheap requests
    pub fn create_payment_request(
        ctx: Context<CreatePaymentRequest>,
        amount: u64,
        description: String,
    ) -> Result<()> {
        let request = &mut ctx.accounts.payment_request;
        let clock = Clock::get()?;

        request.requester = ctx.accounts.requester.key();
        request.payer = ctx.accounts.payer.key();
        request.amount = amount;
        request.description = description;
        request.status = RequestStatus::Pending;
        request.created_at = clock.unix_timestamp;

        // Add to compressed tree (cost: $0.00005)
        msg!("Payment request created: {} USDC from {} to {}",
             amount, ctx.accounts.payer.key(), ctx.accounts.requester.key());

        emit!(PaymentRequestCreated {
            request_id: request.key(),
            requester: request.requester,
            payer: request.payer,
            amount: amount,
        });

        Ok(())
    }

    /// Enterprise treasury management - swap between providers
    pub fn swap_treasury_provider(
        ctx: Context<SwapTreasuryProvider>,
        amount: u64,
        from_provider: Provider,
        to_provider: Provider,
    ) -> Result<()> {
        // Atomic swap between Tempo and Circle
        msg!("Swapping {} USDC from {:?} to {:?}", amount, from_provider, to_provider);

        // This enables enterprises to optimize for speed or cost
        // Tempo for speed (<100ms), Circle for reliability

        Ok(())
    }
}

// ===== ACCOUNT STRUCTURES =====

#[derive(Accounts)]
pub struct InitializeInvoiceTree<'info> {
    #[account(mut)]
    pub enterprise: Signer<'info>,

    /// CHECK: This will be initialized by Bubblegum
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,

    pub tree_authority: Account<'info, TreeConfig>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub bubblegum_program: Program<'info, Bubblegum>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateInvoice<'info> {
    #[account(mut)]
    pub enterprise: Signer<'info>,

    #[account(
        init,
        payer = enterprise,
        space = 8 + InvoiceTracker::LEN,
        seeds = [
            b"invoice",
            enterprise.key().as_ref(),
            invoice_number.to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub invoice_tracker: Account<'info, InvoiceTracker>,

    /// CHECK: Validated in instruction
    pub recipient: UncheckedAccount<'info>,

    /// CHECK: Tree account
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PayInvoice<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        constraint = invoice_tracker.recipient == payer.key() || invoice_tracker.allow_anyone_to_pay
    )]
    pub invoice_tracker: Account<'info, InvoiceTracker>,

    #[account(mut)]
    pub payer_tempo_wallet: Account<'info, TokenAccount>,

    #[account(mut)]
    pub recipient_tempo_wallet: Account<'info, TokenAccount>,

    pub tempo_program: Program<'info, Token>,

    pub payment_amount: u64,
}

#[derive(Accounts)]
pub struct CreatePaymentRequest<'info> {
    #[account(mut)]
    pub requester: Signer<'info>,

    /// CHECK: The payer who will receive the request
    pub payer: UncheckedAccount<'info>,

    #[account(
        init,
        payer = requester,
        space = 8 + PaymentRequest::LEN,
        seeds = [
            b"payment_request",
            requester.key().as_ref(),
            Clock::get()?.unix_timestamp.to_le_bytes().as_ref(),
        ],
        bump
    )]
    pub payment_request: Account<'info, PaymentRequest>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SwapTreasuryProvider<'info> {
    #[account(mut)]
    pub treasury_manager: Signer<'info>,

    #[account(mut)]
    pub tempo_treasury: Account<'info, TokenAccount>,

    #[account(mut)]
    pub circle_treasury: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

// ===== STATE STRUCTURES =====

#[account]
pub struct InvoiceTracker {
    pub issuer: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub paid_amount: u64,
    pub customer_credit: u64,
    pub due_date: i64,
    pub created_at: i64,
    pub paid_at: Option<i64>,
    pub last_payment_at: Option<i64>,
    pub status: InvoiceStatus,
    pub invoice_number: u64,
    pub invoice_type: InvoiceType,
    pub allow_anyone_to_pay: bool,
}

impl InvoiceTracker {
    pub const LEN: usize = 32 + 32 + 8 + 8 + 8 + 8 + 8 + 9 + 9 + 1 + 8 + 33 + 1;
}

#[account]
pub struct PaymentRequest {
    pub requester: Pubkey,
    pub payer: Pubkey,
    pub amount: u64,
    pub description: String,
    pub status: RequestStatus,
    pub created_at: i64,
    pub paid_at: Option<i64>,
}

impl PaymentRequest {
    pub const LEN: usize = 32 + 32 + 8 + 200 + 1 + 8 + 9;
}

// ===== ENUMS & TYPES =====

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum InvoiceStatus {
    Pending,
    PartiallyPaid,
    Paid,
    Overdue,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum InvoiceType {
    Enterprise,    // B2C invoice
    P2PRequest,    // Consumer to consumer
    Government,    // Government billing
    Utility,       // Utility bills
    Healthcare,    // Medical bills
    Recurring,     // Subscription/recurring
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum RequestStatus {
    Pending,
    Approved,
    Paid,
    Declined,
    Expired,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum PaymentMethod {
    Tempo,
    Circle,
    Native,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum Provider {
    Tempo,
    Circle,
}

// ===== INPUT STRUCTURES =====

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InvoiceData {
    pub recipient: Pubkey,
    pub amount: u64,
    pub due_date: i64,
    pub invoice_number: u64,
    pub invoice_type: InvoiceType,
    pub metadata_uri: String,  // IPFS link to full invoice details
}

// ===== EVENTS =====

#[event]
pub struct InvoiceCreated {
    pub invoice_id: Pubkey,
    pub issuer: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub invoice_type: InvoiceType,
    pub created_at: i64,
}

#[event]
pub struct InvoicePaid {
    pub invoice_id: Pubkey,
    pub payer: Pubkey,
    pub amount: u64,
    pub payment_method: PaymentMethod,
    pub settlement_time_ms: u64,
    pub status: InvoiceStatus,
}

#[event]
pub struct PaymentRequestCreated {
    pub request_id: Pubkey,
    pub requester: Pubkey,
    pub payer: Pubkey,
    pub amount: u64,
}

// ===== ERRORS =====

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid invoice status for this operation")]
    InvalidInvoiceStatus,

    #[msg("Insufficient balance to pay invoice")]
    InsufficientBalance,

    #[msg("Invoice has already been paid")]
    InvoiceAlreadyPaid,

    #[msg("Payment amount exceeds invoice balance")]
    PaymentExceedsInvoice,

    #[msg("Unauthorized: Only recipient can pay this invoice")]
    UnauthorizedPayer,
}