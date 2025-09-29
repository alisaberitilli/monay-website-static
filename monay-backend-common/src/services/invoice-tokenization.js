/**
 * Invoice Tokenization Service
 * Creates blockchain tokens for every invoice as the primary transaction method
 * Implements invoice-first model where all transactions start as tokenized invoices
 */

import { ethers } from 'ethers';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import crypto from 'crypto';
import db from '../models/index.js';

class InvoiceTokenizationService {
    constructor() {
        this.evmProvider = null;
        this.evmSigner = null;
        this.solanaConnection = null;
        this.invoiceTokenContract = null;
        this.tokenMetadata = new Map();
        this.initialize();
    }

    async initialize() {
        try {
            // Initialize EVM connection for invoice NFTs
            this.evmProvider = new ethers.JsonRpcProvider(
                process.env.BASE_RPC_URL || 'https://sepolia.base.org'
            );

            // Initialize Solana connection for high-speed invoice processing
            this.solanaConnection = new Connection(
                process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
                'confirmed'
            );

            // Deploy or connect to invoice token contracts
            await this.initializeContracts();

            console.log('Invoice Tokenization Service initialized');
            console.log('- EVM Network: Base Sepolia');
            console.log('- Solana Network: Devnet');
            console.log('- Invoice-first model: ACTIVE');
        } catch (error) {
            console.error('Failed to initialize Invoice Tokenization:', error);
        }
    }

    async initializeContracts() {
        // Invoice NFT contract ABI (ERC-1155 for batch minting)
        const invoiceNFTABI = [
            "function mintInvoice(address to, uint256 amount, string memory ipfsHash) public returns (uint256)",
            "function getInvoice(uint256 tokenId) public view returns (tuple(address issuer, address recipient, uint256 amount, string ipfsHash, uint256 timestamp, bool paid))",
            "function payInvoice(uint256 tokenId) public payable",
            "function batchMintInvoices(address[] memory recipients, uint256[] memory amounts, string[] memory hashes) public returns (uint256[])",
            "event InvoiceCreated(uint256 indexed tokenId, address indexed issuer, address indexed recipient, uint256 amount)",
            "event InvoicePaid(uint256 indexed tokenId, address indexed payer, uint256 amount)"
        ];

        // Use existing deployed contract or deploy new one
        const contractAddress = process.env.INVOICE_NFT_CONTRACT || '0x0000000000000000000000000000000000000000';

        if (contractAddress !== '0x0000000000000000000000000000000000000000') {
            this.invoiceTokenContract = new ethers.Contract(
                contractAddress,
                invoiceNFTABI,
                this.evmProvider
            );
        }
    }

    /**
     * Create a tokenized invoice - the foundation of all transactions
     */
    async createInvoiceToken(invoiceData) {
        const {
            fromUserId,
            toUserId,
            amount,
            currency,
            description,
            dueDate,
            lineItems = [],
            metadata = {}
        } = invoiceData;

        try {
            // Generate unique invoice ID
            const invoiceId = this.generateInvoiceId();

            // Store invoice metadata on IPFS (or similar)
            const ipfsHash = await this.storeInvoiceMetadata({
                invoiceId,
                fromUserId,
                toUserId,
                amount,
                currency,
                description,
                lineItems,
                dueDate,
                timestamp: Date.now(),
                metadata
            });

            // Determine which chain to use based on amount and urgency
            const chain = this.selectOptimalChain(amount, metadata.urgency);

            let tokenId;
            let txHash;

            if (chain === 'evm') {
                // Mint invoice NFT on EVM (Base)
                const result = await this.mintEVMInvoice(
                    toUserId,
                    amount,
                    ipfsHash
                );
                tokenId = result.tokenId;
                txHash = result.txHash;
            } else {
                // Create invoice token on Solana for faster processing
                const result = await this.mintSolanaInvoice(
                    toUserId,
                    amount,
                    ipfsHash
                );
                tokenId = result.tokenId;
                txHash = result.signature;
            }

            // Store in database
            await db.query(
                `INSERT INTO invoice_tokens (
                    invoice_id, token_id, chain, tx_hash,
                    from_user_id, to_user_id, amount, currency,
                    description, due_date, ipfs_hash, status,
                    metadata, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
                RETURNING *`,
                [
                    invoiceId, tokenId, chain, txHash,
                    fromUserId, toUserId, amount, currency,
                    description, dueDate, ipfsHash, 'pending',
                    JSON.stringify(metadata)
                ]
            );

            // Cache metadata for quick access
            this.tokenMetadata.set(invoiceId, {
                tokenId,
                chain,
                amount,
                currency,
                status: 'pending'
            });

            return {
                success: true,
                invoiceId,
                tokenId,
                chain,
                txHash,
                ipfsHash,
                amount,
                currency,
                status: 'pending'
            };
        } catch (error) {
            console.error('Failed to create invoice token:', error);
            throw error;
        }
    }

    /**
     * Mint invoice NFT on EVM chain
     */
    async mintEVMInvoice(recipient, amount, ipfsHash) {
        try {
            // Mock implementation for now
            const tokenId = Math.floor(Math.random() * 1000000);
            const txHash = '0x' + crypto.randomBytes(32).toString('hex');

            console.log(`Minted EVM invoice NFT: ${tokenId}`);

            return { tokenId, txHash };
        } catch (error) {
            console.error('Failed to mint EVM invoice:', error);
            throw error;
        }
    }

    /**
     * Create invoice token on Solana
     */
    async mintSolanaInvoice(recipient, amount, ipfsHash) {
        try {
            // Mock implementation for now
            const tokenId = Math.floor(Math.random() * 1000000).toString();
            const signature = crypto.randomBytes(64).toString('base64');

            console.log(`Created Solana invoice token: ${tokenId}`);

            return { tokenId, signature };
        } catch (error) {
            console.error('Failed to mint Solana invoice:', error);
            throw error;
        }
    }

    /**
     * Pay an invoice by transferring the tokenized value
     */
    async payInvoiceToken(invoiceId, payerUserId, paymentMethod = 'wallet') {
        try {
            // Get invoice details
            const invoice = await db.query(
                'SELECT * FROM invoice_tokens WHERE invoice_id = $1',
                [invoiceId]
            );

            if (!invoice.rows[0]) {
                throw new Error('Invoice not found');
            }

            const invoiceData = invoice.rows[0];

            if (invoiceData.status === 'paid') {
                throw new Error('Invoice already paid');
            }

            // Process payment based on method
            let paymentResult;

            if (paymentMethod === 'wallet') {
                paymentResult = await this.processWalletPayment(
                    invoiceData,
                    payerUserId
                );
            } else if (paymentMethod === 'card') {
                paymentResult = await this.processCardPayment(
                    invoiceData,
                    payerUserId
                );
            } else if (paymentMethod === 'bank') {
                paymentResult = await this.processBankPayment(
                    invoiceData,
                    payerUserId
                );
            }

            // Update invoice status
            await db.query(
                `UPDATE invoice_tokens
                 SET status = 'paid',
                     paid_at = NOW(),
                     payment_tx_hash = $1,
                     paid_by_user_id = $2
                 WHERE invoice_id = $3`,
                [paymentResult.txHash, payerUserId, invoiceId]
            );

            // Transfer the NFT to indicate payment completion
            if (invoiceData.chain === 'evm') {
                await this.transferEVMInvoice(invoiceData.token_id, payerUserId);
            } else {
                await this.transferSolanaInvoice(invoiceData.token_id, payerUserId);
            }

            return {
                success: true,
                invoiceId,
                paymentTxHash: paymentResult.txHash,
                amount: invoiceData.amount,
                currency: invoiceData.currency,
                paidAt: new Date()
            };
        } catch (error) {
            console.error('Failed to pay invoice:', error);
            throw error;
        }
    }

    /**
     * Batch create invoices for efficiency
     */
    async batchCreateInvoices(invoices) {
        try {
            const results = [];
            const batchSize = 100; // Process 100 at a time

            for (let i = 0; i < invoices.length; i += batchSize) {
                const batch = invoices.slice(i, i + batchSize);

                // Prepare batch data
                const recipients = batch.map(inv => inv.toUserId);
                const amounts = batch.map(inv => inv.amount);
                const metadataHashes = await Promise.all(
                    batch.map(inv => this.storeInvoiceMetadata(inv))
                );

                // Batch mint on blockchain
                const tokenIds = await this.batchMintInvoices(
                    recipients,
                    amounts,
                    metadataHashes
                );

                // Store in database
                for (let j = 0; j < batch.length; j++) {
                    const invoice = batch[j];
                    const invoiceId = this.generateInvoiceId();

                    await db.query(
                        `INSERT INTO invoice_tokens (
                            invoice_id, token_id, chain,
                            from_user_id, to_user_id, amount,
                            currency, status, ipfs_hash
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                        [
                            invoiceId, tokenIds[j], 'evm',
                            invoice.fromUserId, invoice.toUserId,
                            invoice.amount, invoice.currency,
                            'pending', metadataHashes[j]
                        ]
                    );

                    results.push({
                        invoiceId,
                        tokenId: tokenIds[j],
                        amount: invoice.amount
                    });
                }
            }

            return {
                success: true,
                count: results.length,
                invoices: results
            };
        } catch (error) {
            console.error('Failed to batch create invoices:', error);
            throw error;
        }
    }

    /**
     * Get invoice token details
     */
    async getInvoiceToken(invoiceId) {
        try {
            const result = await db.query(
                `SELECT it.*,
                        u1.email as from_email,
                        u2.email as to_email
                 FROM invoice_tokens it
                 LEFT JOIN users u1 ON it.from_user_id = u1.id
                 LEFT JOIN users u2 ON it.to_user_id = u2.id
                 WHERE it.invoice_id = $1`,
                [invoiceId]
            );

            if (!result.rows[0]) {
                throw new Error('Invoice not found');
            }

            const invoice = result.rows[0];

            // Get on-chain data if available
            let chainData = null;
            if (invoice.token_id && invoice.chain === 'evm') {
                chainData = await this.getEVMInvoiceData(invoice.token_id);
            }

            return {
                ...invoice,
                chainData,
                paymentUrl: this.generatePaymentUrl(invoiceId),
                qrCode: await this.generateQRCode(invoiceId)
            };
        } catch (error) {
            console.error('Failed to get invoice token:', error);
            throw error;
        }
    }

    /**
     * Generate unique invoice ID
     */
    generateInvoiceId() {
        return 'INV-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    }

    /**
     * Store invoice metadata (mock IPFS)
     */
    async storeInvoiceMetadata(metadata) {
        // In production, this would upload to IPFS
        const hash = crypto.createHash('sha256')
            .update(JSON.stringify(metadata))
            .digest('hex');
        return 'ipfs://' + hash;
    }

    /**
     * Select optimal blockchain based on requirements
     */
    selectOptimalChain(amount, urgency) {
        // Use Solana for small, urgent transactions
        if (amount < 1000 && urgency === 'instant') {
            return 'solana';
        }
        // Use EVM for larger amounts or when compliance is needed
        return 'evm';
    }

    /**
     * Generate payment URL for invoice
     */
    generatePaymentUrl(invoiceId) {
        const baseUrl = process.env.PAYMENT_BASE_URL || 'https://pay.monay.com';
        return `${baseUrl}/invoice/${invoiceId}`;
    }

    /**
     * Generate QR code for invoice payment
     */
    async generateQRCode(invoiceId) {
        // Mock QR code generation
        return `data:image/png;base64,${Buffer.from(invoiceId).toString('base64')}`;
    }

    /**
     * Process wallet payment
     */
    async processWalletPayment(invoice, payerUserId) {
        // Mock wallet payment
        return {
            txHash: '0x' + crypto.randomBytes(32).toString('hex'),
            success: true
        };
    }

    /**
     * Process card payment
     */
    async processCardPayment(invoice, payerUserId) {
        // Mock card payment
        return {
            txHash: 'card_' + crypto.randomBytes(16).toString('hex'),
            success: true
        };
    }

    /**
     * Process bank payment
     */
    async processBankPayment(invoice, payerUserId) {
        // Mock bank payment
        return {
            txHash: 'ach_' + crypto.randomBytes(16).toString('hex'),
            success: true
        };
    }

    /**
     * Transfer EVM invoice NFT
     */
    async transferEVMInvoice(tokenId, newOwner) {
        console.log(`Transferring EVM invoice ${tokenId} to ${newOwner}`);
        return true;
    }

    /**
     * Transfer Solana invoice token
     */
    async transferSolanaInvoice(tokenId, newOwner) {
        console.log(`Transferring Solana invoice ${tokenId} to ${newOwner}`);
        return true;
    }

    /**
     * Get EVM invoice data from blockchain
     */
    async getEVMInvoiceData(tokenId) {
        // Mock blockchain data
        return {
            tokenId,
            owner: '0x' + crypto.randomBytes(20).toString('hex'),
            amount: 1000,
            paid: false
        };
    }

    /**
     * Batch mint invoices on blockchain
     */
    async batchMintInvoices(recipients, amounts, hashes) {
        // Mock batch minting
        return recipients.map(() => Math.floor(Math.random() * 1000000));
    }
}

// Export singleton instance
let instance;
export default {
    getInstance() {
        if (!instance) {
            instance = new InvoiceTokenizationService();
        }
        return instance;
    }
};