import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  Program,
  AnchorProvider,
  web3,
  BN,
  Idl
} from '@project-serum/anchor';
import {
  createTree,
  mintCompressedNFT,
  transferCompressedNFT,
  burnCompressedNFT
} from '@metaplex-foundation/mpl-bubblegum';
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';

// Program ID for the invoice system
export const INVOICE_PROGRAM_ID = new PublicKey('INVo1CEfT0KeN5M0NaY2025ENT3RPR1SE');

// Tempo and Circle USDC mint addresses on Solana
export const TEMPO_USDC_MINT = new PublicKey('TEMPoUSDCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
export const CIRCLE_USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

export enum InvoiceType {
  Enterprise = 'ENTERPRISE',
  P2PRequest = 'P2P_REQUEST',
  Government = 'GOVERNMENT',
  Utility = 'UTILITY',
  Healthcare = 'HEALTHCARE',
  Recurring = 'RECURRING'
}

export enum InvoiceStatus {
  Pending = 'PENDING',
  PartiallyPaid = 'PARTIALLY_PAID',
  Paid = 'PAID',
  Overdue = 'OVERDUE',
  Cancelled = 'CANCELLED'
}

export interface InvoiceData {
  recipient: PublicKey;
  amount: BN;
  dueDate: BN;
  invoiceNumber: BN;
  invoiceType: InvoiceType;
  metadataUri: string;
}

export interface PaymentData {
  invoiceId: PublicKey;
  amount: BN;
  provider: 'tempo' | 'circle';
}

export class MonayInvoiceSDK {
  private connection: Connection;
  private program: Program;
  private provider: AnchorProvider;
  private treeAuthority: PublicKey | null = null;
  private merkleTree: PublicKey | null = null;

  constructor(
    connection: Connection,
    wallet: any, // Wallet adapter or Keypair
    programId: PublicKey = INVOICE_PROGRAM_ID
  ) {
    this.connection = connection;
    this.provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );
    // Note: IDL would be loaded from generated file
    // this.program = new Program(idl as Idl, programId, this.provider);
  }

  /**
   * Initialize a new merkle tree for storing compressed invoice NFTs
   * This only needs to be done once per enterprise
   * Cost: ~$50 for a tree that can hold 1 million invoices
   */
  async initializeInvoiceTree(
    enterprise: PublicKey,
    maxDepth: number = 20,  // 2^20 = 1,048,576 invoices
    maxBufferSize: number = 64
  ): Promise<{ tree: PublicKey; cost: number }> {
    const tree = Keypair.generate();

    // Create merkle tree for compressed NFTs
    const createTreeTx = await createTree(
      this.connection,
      enterprise,
      tree,
      maxDepth,
      maxBufferSize,
      8  // Canopy depth for caching
    );

    await this.provider.sendAndConfirm(createTreeTx);

    this.merkleTree = tree.publicKey;

    // Calculate cost
    const treeSpace = 1_000_000; // Approximate space for tree account
    const rentExemption = await this.connection.getMinimumBalanceForRentExemption(treeSpace);
    const costInSOL = rentExemption / LAMPORTS_PER_SOL;
    const costInUSD = costInSOL * 150; // Assuming SOL = $150

    console.log(`✅ Invoice tree initialized: ${tree.publicKey.toString()}`);
    console.log(`📊 Capacity: ${Math.pow(2, maxDepth).toLocaleString()} invoices`);
    console.log(`💰 Total cost: $${costInUSD.toFixed(2)} (one-time)`);
    console.log(`💸 Cost per invoice: $${(costInUSD / Math.pow(2, maxDepth)).toFixed(6)}`);

    return {
      tree: tree.publicKey,
      cost: costInUSD
    };
  }

  /**
   * Create a new invoice as a compressed NFT
   * Cost: ~$0.00005 per invoice
   */
  async createInvoice(
    enterprise: PublicKey,
    invoiceData: InvoiceData
  ): Promise<{ invoiceId: PublicKey; txHash: string; cost: number }> {
    // Derive invoice PDA
    const [invoicePDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('invoice'),
        enterprise.toBuffer(),
        invoiceData.invoiceNumber.toArrayLike(Buffer, 'le', 8)
      ],
      this.program.programId
    );

    // Create invoice metadata for compressed NFT
    const metadata = {
      name: `Invoice #${invoiceData.invoiceNumber.toString()}`,
      symbol: 'INV',
      uri: invoiceData.metadataUri,
      sellerFeeBasisPoints: 0,
      collection: null,
      uses: null,
      creators: [
        {
          address: enterprise,
          verified: true,
          share: 100
        }
      ]
    };

    // Create the invoice (mints compressed NFT)
    const tx = await this.program.methods
      .createInvoice(invoiceData)
      .accounts({
        enterprise,
        invoiceTracker: invoicePDA,
        recipient: invoiceData.recipient,
        merkleTree: this.merkleTree!,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Calculate transaction cost
    const txCost = 0.00025; // Base Solana transaction cost
    const storageCost = 0.00005; // Compressed NFT storage
    const totalCostSOL = txCost + storageCost;
    const totalCostUSD = totalCostSOL * 150; // Assuming SOL = $150

    console.log(`✅ Invoice created: #${invoiceData.invoiceNumber}`);
    console.log(`🆔 Invoice ID: ${invoicePDA.toString()}`);
    console.log(`💰 Cost: $${totalCostUSD.toFixed(5)} (${totalCostSOL} SOL)`);
    console.log(`🔗 Transaction: https://explorer.solana.com/tx/${tx}`);

    return {
      invoiceId: invoicePDA,
      txHash: tx,
      cost: totalCostUSD
    };
  }

  /**
   * Pay an invoice using Tempo or Circle USDC
   * Everything happens atomically in one transaction
   */
  async payInvoice(
    payer: PublicKey,
    payment: PaymentData
  ): Promise<{ txHash: string; settlementTime: number }> {
    const startTime = Date.now();

    // Get token accounts
    const mint = payment.provider === 'tempo' ? TEMPO_USDC_MINT : CIRCLE_USDC_MINT;

    const payerTokenAccount = await getAssociatedTokenAddress(
      mint,
      payer
    );

    // Get invoice details to find recipient
    const invoiceAccount = await this.program.account.invoiceTracker.fetch(payment.invoiceId);

    const recipientTokenAccount = await getAssociatedTokenAddress(
      mint,
      invoiceAccount.issuer as PublicKey
    );

    // Execute payment
    const tx = await this.program.methods
      .payInvoiceWithTempo(payment.invoiceId)
      .accounts({
        payer,
        invoiceTracker: payment.invoiceId,
        payerTempoWallet: payerTokenAccount,
        recipientTempoWallet: recipientTokenAccount,
        tempoProgram: TOKEN_PROGRAM_ID,
        paymentAmount: payment.amount,
      })
      .rpc();

    const settlementTime = Date.now() - startTime;

    console.log(`✅ Invoice paid: ${payment.invoiceId.toString()}`);
    console.log(`💸 Amount: ${payment.amount.toString()} USDC`);
    console.log(`⚡ Settlement time: ${settlementTime}ms`);
    console.log(`🔗 Transaction: https://explorer.solana.com/tx/${tx}`);

    return {
      txHash: tx,
      settlementTime
    };
  }

  /**
   * Create a P2P payment request (consumer to consumer)
   */
  async createPaymentRequest(
    requester: PublicKey,
    payer: PublicKey,
    amount: BN,
    description: string
  ): Promise<{ requestId: PublicKey; qrCode: string }> {
    const timestamp = new BN(Date.now() / 1000);

    // Derive payment request PDA
    const [requestPDA] = await PublicKey.findProgramAddress(
      [
        Buffer.from('payment_request'),
        requester.toBuffer(),
        timestamp.toArrayLike(Buffer, 'le', 8)
      ],
      this.program.programId
    );

    // Create the payment request
    const tx = await this.program.methods
      .createPaymentRequest(amount, description)
      .accounts({
        requester,
        payer,
        paymentRequest: requestPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Generate QR code for easy payment
    const qrData = {
      action: 'pay_request',
      requestId: requestPDA.toString(),
      amount: amount.toString(),
      requester: requester.toString()
    };

    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(JSON.stringify(qrData))}`;

    console.log(`✅ Payment request created`);
    console.log(`💰 Amount: ${amount.toString()} USDC`);
    console.log(`🔗 Request ID: ${requestPDA.toString()}`);
    console.log(`📱 QR Code: ${qrCode}`);

    return {
      requestId: requestPDA,
      qrCode
    };
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: PublicKey): Promise<any> {
    const invoice = await this.program.account.invoiceTracker.fetch(invoiceId);

    return {
      issuer: invoice.issuer.toString(),
      recipient: invoice.recipient.toString(),
      amount: invoice.amount.toString(),
      paidAmount: invoice.paidAmount.toString(),
      customerCredit: invoice.customerCredit.toString(),
      dueDate: new Date(invoice.dueDate.toNumber() * 1000),
      status: invoice.status,
      invoiceNumber: invoice.invoiceNumber.toString(),
      invoiceType: invoice.invoiceType,
      remainingAmount: invoice.amount.sub(invoice.paidAmount).toString()
    };
  }

  /**
   * Query all invoices for an enterprise
   */
  async getEnterpriseInvoices(
    enterprise: PublicKey,
    status?: InvoiceStatus
  ): Promise<any[]> {
    const filters = [
      {
        memcmp: {
          offset: 8, // After discriminator
          bytes: enterprise.toBase58()
        }
      }
    ];

    if (status) {
      // Add status filter if provided
      // Note: This would need proper offset calculation
    }

    const accounts = await this.connection.getProgramAccounts(
      this.program.programId,
      { filters }
    );

    const invoices = await Promise.all(
      accounts.map(async ({ pubkey }) => {
        const invoice = await this.getInvoice(pubkey);
        return { id: pubkey.toString(), ...invoice };
      })
    );

    return invoices;
  }

  /**
   * Calculate total cost for invoice operations
   */
  calculateCosts(numInvoices: number): {
    treeSetup: number;
    perInvoice: number;
    total: number;
    comparison: { polygon: number; ethereum: number; stellar: number };
  } {
    const treeSetupCost = 50; // One-time cost for merkle tree
    const perInvoiceCost = 0.00005; // Compressed NFT cost
    const total = treeSetupCost + (numInvoices * perInvoiceCost);

    return {
      treeSetup: treeSetupCost,
      perInvoice: perInvoiceCost,
      total,
      comparison: {
        polygon: numInvoices * 0.001,     // $0.001 per invoice
        ethereum: numInvoices * 5,         // $5 per invoice
        stellar: numInvoices * 0.00001     // $0.00001 per invoice
      }
    };
  }

  /**
   * Enterprise treasury swap between Tempo and Circle
   */
  async swapTreasuryProvider(
    treasuryManager: PublicKey,
    amount: BN,
    fromProvider: 'tempo' | 'circle',
    toProvider: 'tempo' | 'circle'
  ): Promise<{ txHash: string; swapTime: number }> {
    const startTime = Date.now();

    // Get treasury token accounts
    const fromMint = fromProvider === 'tempo' ? TEMPO_USDC_MINT : CIRCLE_USDC_MINT;
    const toMint = toProvider === 'tempo' ? TEMPO_USDC_MINT : CIRCLE_USDC_MINT;

    const fromTreasury = await getAssociatedTokenAddress(fromMint, treasuryManager);
    const toTreasury = await getAssociatedTokenAddress(toMint, treasuryManager);

    const tx = await this.program.methods
      .swapTreasuryProvider(
        amount,
        fromProvider === 'tempo' ? { tempo: {} } : { circle: {} },
        toProvider === 'tempo' ? { tempo: {} } : { circle: {} }
      )
      .accounts({
        treasuryManager,
        tempoTreasury: fromProvider === 'tempo' ? fromTreasury : toTreasury,
        circleTreasury: fromProvider === 'circle' ? fromTreasury : toTreasury,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    const swapTime = Date.now() - startTime;

    console.log(`✅ Treasury swap completed`);
    console.log(`💱 ${amount} USDC: ${fromProvider} → ${toProvider}`);
    console.log(`⚡ Swap time: ${swapTime}ms`);

    return {
      txHash: tx,
      swapTime
    };
  }
}

// Export utility functions for invoice management
export const InvoiceUtils = {
  /**
   * Generate invoice metadata for IPFS storage
   */
  generateMetadata: (invoice: any) => {
    return {
      name: `Invoice #${invoice.number}`,
      description: invoice.description,
      image: 'https://monay.com/invoice-template.png',
      attributes: [
        { trait_type: 'Amount', value: invoice.amount },
        { trait_type: 'Due Date', value: invoice.dueDate },
        { trait_type: 'Type', value: invoice.type },
        { trait_type: 'Issuer', value: invoice.issuer },
        { trait_type: 'Status', value: 'PENDING' }
      ],
      properties: {
        lineItems: invoice.lineItems,
        terms: invoice.terms,
        notes: invoice.notes
      }
    };
  },

  /**
   * Validate invoice before creation
   */
  validateInvoice: (invoice: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!invoice.recipient) errors.push('Recipient is required');
    if (!invoice.amount || invoice.amount <= 0) errors.push('Valid amount is required');
    if (!invoice.dueDate) errors.push('Due date is required');
    if (invoice.dueDate < Date.now()) errors.push('Due date must be in the future');

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Format invoice for display
   */
  formatInvoice: (invoice: any) => {
    return {
      number: `INV-${invoice.invoiceNumber.toString().padStart(6, '0')}`,
      amount: `$${(invoice.amount / 100).toFixed(2)}`,
      dueDate: new Date(invoice.dueDate * 1000).toLocaleDateString(),
      status: invoice.status.replace('_', ' '),
      progress: ((invoice.paidAmount / invoice.amount) * 100).toFixed(1) + '%'
    };
  }
};

// Export example usage
export const exampleUsage = `
// Initialize SDK
const sdk = new MonayInvoiceSDK(connection, wallet);

// Create invoice tree (one-time setup)
const { tree } = await sdk.initializeInvoiceTree(enterprise);

// Create an invoice
const invoice = await sdk.createInvoice(enterprise, {
  recipient: customerPublicKey,
  amount: new BN(100000), // $1000.00 in cents
  dueDate: new BN(Date.now() / 1000 + 30 * 24 * 60 * 60), // 30 days
  invoiceNumber: new BN(1001),
  invoiceType: InvoiceType.Enterprise,
  metadataUri: 'ipfs://QmXxx...' // Full invoice on IPFS
});

// Pay the invoice
const payment = await sdk.payInvoice(customerPublicKey, {
  invoiceId: invoice.invoiceId,
  amount: new BN(100000),
  provider: 'tempo'
});

// Create P2P request
const request = await sdk.createPaymentRequest(
  requesterPublicKey,
  payerPublicKey,
  new BN(5000), // $50.00
  'Dinner split'
);

console.log('QR Code for payment:', request.qrCode);
`;