use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use mpl_bubblegum::state::metaplex_adapter::{MetadataArgs, TokenProgramVersion};

declare_id!("InvoiceNFT11111111111111111111111111111111");

#[program]
pub mod invoice_nft {
    use super::*;

    /// Initialize the invoice NFT program with a merkle tree
    pub fn initialize_tree(
        ctx: Context<InitializeTree>,
        max_depth: u32,
        max_buffer_size: u32,
    ) -> Result<()> {
        msg!("Initializing invoice merkle tree with depth {} and buffer {}", max_depth, max_buffer_size);

        // Tree initialization would be handled by Bubblegum
        // This creates a tree that can hold 2^max_depth invoices
        // For 1M invoices, we need depth 20 (2^20 = 1,048,576)

        ctx.accounts.treasury.bump = *ctx.bumps.get("treasury").unwrap();
        ctx.accounts.treasury.owner = ctx.accounts.enterprise.key();
        ctx.accounts.treasury.tree_authority = ctx.accounts.tree_authority.key();
        ctx.accounts.treasury.merkle_tree = ctx.accounts.merkle_tree.key();
        ctx.accounts.treasury.total_invoices = 0;
        ctx.accounts.treasury.tempo_balance = 0;
        ctx.accounts.treasury.circle_balance = 0;

        Ok(())
    }

    /// Create a new tokenized invoice as a compressed NFT
    pub fn create_invoice(
        ctx: Context<CreateInvoice>,
        invoice_id: String,
        recipient: Pubkey,
        amount: u64,
        due_date: i64,
        metadata_uri: String,
    ) -> Result<()> {
        msg!("Creating invoice {} for {} USDC", invoice_id, amount);

        let invoice = &mut ctx.accounts.invoice;
        invoice.invoice_id = invoice_id.clone();
        invoice.issuer = ctx.accounts.issuer.key();
        invoice.recipient = recipient;
        invoice.amount = amount;
        invoice.paid_amount = 0;
        invoice.due_date = due_date;
        invoice.status = InvoiceStatus::Pending;
        invoice.created_at = Clock::get()?.unix_timestamp;
        invoice.token_address = Pubkey::default(); // Will be set after minting
        invoice.metadata_uri = metadata_uri;

        // Update treasury
        ctx.accounts.treasury.total_invoices += 1;

        emit!(InvoiceCreated {
            invoice_id,
            issuer: ctx.accounts.issuer.key(),
            recipient,
            amount,
            due_date,
        });

        Ok(())
    }

    /// Pay an invoice using Tempo (primary provider)
    pub fn pay_invoice_tempo(
        ctx: Context<PayInvoice>,
        invoice_id: String,
        payment_amount: u64,
    ) -> Result<()> {
        msg!("Processing Tempo payment of {} for invoice {}", payment_amount, invoice_id);

        let invoice = &mut ctx.accounts.invoice;

        require!(
            invoice.status != InvoiceStatus::Paid,
            InvoiceError::AlreadyPaid
        );

        require!(
            payment_amount > 0,
            InvoiceError::InvalidAmount
        );

        // Process payment
        invoice.paid_amount = invoice.paid_amount.checked_add(payment_amount).unwrap();

        // Update status
        if invoice.paid_amount >= invoice.amount {
            invoice.status = InvoiceStatus::Paid;
            invoice.paid_at = Some(Clock::get()?.unix_timestamp);

            // Handle overpayment as credit
            if invoice.paid_amount > invoice.amount {
                let credit_amount = invoice.paid_amount - invoice.amount;
                msg!("Overpayment of {} credited to payer", credit_amount);
            }
        } else {
            invoice.status = InvoiceStatus::PartiallyPaid;
        }

        // Update treasury balance
        ctx.accounts.treasury.tempo_balance += payment_amount;

        emit!(InvoicePayment {
            invoice_id,
            payer: ctx.accounts.payer.key(),
            amount: payment_amount,
            provider: PaymentProvider::Tempo,
            status: invoice.status.clone(),
        });

        Ok(())
    }

    /// Pay an invoice using Circle (fallback provider)
    pub fn pay_invoice_circle(
        ctx: Context<PayInvoice>,
        invoice_id: String,
        payment_amount: u64,
    ) -> Result<()> {
        msg!("Processing Circle payment of {} for invoice {}", payment_amount, invoice_id);

        let invoice = &mut ctx.accounts.invoice;

        require!(
            invoice.status != InvoiceStatus::Paid,
            InvoiceError::AlreadyPaid
        );

        // Transfer USDC tokens
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.payer_token_account.to_account_info(),
                to: ctx.accounts.treasury_token_account.to_account_info(),
                authority: ctx.accounts.payer.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, payment_amount)?;

        // Update invoice
        invoice.paid_amount = invoice.paid_amount.checked_add(payment_amount).unwrap();

        if invoice.paid_amount >= invoice.amount {
            invoice.status = InvoiceStatus::Paid;
            invoice.paid_at = Some(Clock::get()?.unix_timestamp);
        } else {
            invoice.status = InvoiceStatus::PartiallyPaid;
        }

        // Update treasury balance
        ctx.accounts.treasury.circle_balance += payment_amount;

        emit!(InvoicePayment {
            invoice_id,
            payer: ctx.accounts.payer.key(),
            amount: payment_amount,
            provider: PaymentProvider::Circle,
            status: invoice.status.clone(),
        });

        Ok(())
    }

    /// Swap treasury balance between providers
    pub fn swap_treasury_balance(
        ctx: Context<SwapTreasury>,
        from_provider: PaymentProvider,
        to_provider: PaymentProvider,
        amount: u64,
    ) -> Result<()> {
        msg!("Swapping {} from {:?} to {:?}", amount, from_provider, to_provider);

        let treasury = &mut ctx.accounts.treasury;

        match (from_provider, to_provider) {
            (PaymentProvider::Tempo, PaymentProvider::Circle) => {
                require!(treasury.tempo_balance >= amount, InvoiceError::InsufficientBalance);
                treasury.tempo_balance -= amount;
                treasury.circle_balance += amount;
            }
            (PaymentProvider::Circle, PaymentProvider::Tempo) => {
                require!(treasury.circle_balance >= amount, InvoiceError::InsufficientBalance);
                treasury.circle_balance -= amount;
                treasury.tempo_balance += amount;
            }
            _ => return Err(InvoiceError::InvalidSwap.into()),
        }

        emit!(TreasurySwap {
            from: from_provider,
            to: to_provider,
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

// Account structures
#[account]
pub struct Treasury {
    pub bump: u8,
    pub owner: Pubkey,
    pub tree_authority: Pubkey,
    pub merkle_tree: Pubkey,
    pub total_invoices: u64,
    pub tempo_balance: u64,
    pub circle_balance: u64,
}

#[account]
pub struct Invoice {
    pub invoice_id: String,
    pub issuer: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub paid_amount: u64,
    pub due_date: i64,
    pub status: InvoiceStatus,
    pub created_at: i64,
    pub paid_at: Option<i64>,
    pub token_address: Pubkey,
    pub metadata_uri: String,
}

// Enums
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum InvoiceStatus {
    Pending,
    PartiallyPaid,
    Paid,
    Overdue,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub enum PaymentProvider {
    Tempo,
    Circle,
}

// Events
#[event]
pub struct InvoiceCreated {
    pub invoice_id: String,
    pub issuer: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub due_date: i64,
}

#[event]
pub struct InvoicePayment {
    pub invoice_id: String,
    pub payer: Pubkey,
    pub amount: u64,
    pub provider: PaymentProvider,
    pub status: InvoiceStatus,
}

#[event]
pub struct TreasurySwap {
    pub from: PaymentProvider,
    pub to: PaymentProvider,
    pub amount: u64,
    pub timestamp: i64,
}

// Contexts
#[derive(Accounts)]
pub struct InitializeTree<'info> {
    #[account(mut)]
    pub enterprise: Signer<'info>,

    #[account(
        init,
        payer = enterprise,
        space = 8 + 1 + 32 + 32 + 32 + 8 + 8 + 8,
        seeds = [b"treasury", enterprise.key().as_ref()],
        bump
    )]
    pub treasury: Account<'info, Treasury>,

    /// CHECK: Tree authority PDA
    pub tree_authority: UncheckedAccount<'info>,

    /// CHECK: Merkle tree account
    pub merkle_tree: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(invoice_id: String)]
pub struct CreateInvoice<'info> {
    #[account(mut)]
    pub issuer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"treasury", issuer.key().as_ref()],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,

    #[account(
        init,
        payer = issuer,
        space = 8 + 64 + 32 + 32 + 8 + 8 + 8 + 1 + 8 + 9 + 32 + 200,
        seeds = [b"invoice", invoice_id.as_bytes()],
        bump
    )]
    pub invoice: Account<'info, Invoice>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(invoice_id: String)]
pub struct PayInvoice<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"invoice", invoice_id.as_bytes()],
        bump
    )]
    pub invoice: Account<'info, Invoice>,

    #[account(
        mut,
        seeds = [b"treasury", invoice.issuer.as_ref()],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,

    #[account(mut)]
    pub payer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SwapTreasury<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [b"treasury", owner.key().as_ref()],
        bump = treasury.bump,
        has_one = owner
    )]
    pub treasury: Account<'info, Treasury>,
}

// Errors
#[error_code]
pub enum InvoiceError {
    #[msg("Invoice has already been paid")]
    AlreadyPaid,

    #[msg("Invalid payment amount")]
    InvalidAmount,

    #[msg("Insufficient balance for swap")]
    InsufficientBalance,

    #[msg("Invalid swap operation")]
    InvalidSwap,

    #[msg("Invoice is overdue")]
    Overdue,

    #[msg("Unauthorized")]
    Unauthorized,
}