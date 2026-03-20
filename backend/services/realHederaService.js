/**
 * realHederaService.js — Real Hedera Testnet Integration
 *
 * This file handles ONE real transaction when a job completes:
 *   → Transfer a small amount of HBAR from your account to yourself
 *     (buyer "pays" the marketplace wallet as proof of completion)
 *
 * Uses: @hashgraph/sdk + .env for credentials
 *
 * To use: called from agentService.js when job status = COMPLETED
 */

require('dotenv').config();

const {
  Client,
  TransferTransaction,
  AccountId,
  PrivateKey,
  Hbar,
  HbarUnit,
} = require('@hashgraph/sdk');

// ── Read credentials from .env ────────────────────────────────────────────────
const ACCOUNT_ID  = process.env.HEDERA_ACCOUNT_ID;
const PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;
const NETWORK     = process.env.HEDERA_NETWORK || 'testnet';

/**
 * Build and return a connected Hedera client.
 * Throws clearly if .env is missing.
 */
function getClient() {
  if (!ACCOUNT_ID || !PRIVATE_KEY) {
    throw new Error(
      'Missing Hedera credentials. Check HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY in your .env file.'
    );
  }

  const client = NETWORK === 'mainnet'
    ? Client.forMainnet()
    : Client.forTestnet();

  client.setOperator(
    AccountId.fromString(ACCOUNT_ID),
    PrivateKey.fromStringECDSA(PRIVATE_KEY)
  );

  return client;
}

/**
 * sendCompletionPayment()
 *
 * Sends a real HBAR transaction on Hedera Testnet when a job completes.
 *
 * What it does:
 *   - Transfers 1 tinybar (0.00000001 HBAR) from your account back to itself
 *   - This is the simplest possible real transaction — proves the system works
 *   - In production: replace with actual provider payment logic
 *
 * Returns:
 *   {
 *     success: true,
 *     transactionId: "0.0.XXXXX@1234567890.000",
 *     status: "SUCCESS",
 *     network: "testnet",
 *     explorerUrl: "https://hashscan.io/testnet/tx/..."
 *   }
 */
async function sendCompletionPayment(jobId, jobTitle) {
  const client = getClient();

  console.log(`\n[Hedera] Sending real transaction for job: ${jobTitle}`);
  console.log(`[Hedera] Account: ${ACCOUNT_ID} | Network: ${NETWORK}`);

  try {
    // Build the transaction
    // Transferring 1 tinybar to ourselves — simplest valid HBAR transfer
    const transaction = await new TransferTransaction()
      .addHbarTransfer(ACCOUNT_ID, new Hbar(-1, HbarUnit.Tinybar))  // sender (you)
      .addHbarTransfer(ACCOUNT_ID, new Hbar(1, HbarUnit.Tinybar))   // receiver (also you)
      .setTransactionMemo(`AIMarket job complete: ${jobId.slice(0, 8)}`)
      .execute(client);

    // Wait for consensus (usually 3-5 seconds on testnet)
    console.log(`[Hedera] Transaction submitted. Waiting for consensus...`);
    const receipt = await transaction.getReceipt(client);

    // Format the transaction ID for display
    // Hedera format: 0.0.ACCOUNTID@SECONDS-NANOS
    const txId = transaction.transactionId.toString();
    const status = receipt.status.toString();

    // HashScan explorer URL (free Hedera block explorer)
    const explorerUrl = `https://hashscan.io/${NETWORK}/transaction/${txId}`;

    console.log(`[Hedera] ✅ Transaction SUCCESS`);
    console.log(`[Hedera] TX ID:     ${txId}`);
    console.log(`[Hedera] Status:    ${status}`);
    console.log(`[Hedera] Explorer:  ${explorerUrl}`);

    client.close();

    return {
      success:       true,
      transactionId: txId,
      status,
      network:       NETWORK,
      explorerUrl,
      sentAt:        new Date().toISOString(),
    };

  } catch (err) {
    console.error(`[Hedera] ❌ Transaction FAILED:`, err.message);
    client.close();

    return {
      success:       false,
      error:         err.message,
      transactionId: null,
      status:        'FAILED',
      network:       NETWORK,
      sentAt:        new Date().toISOString(),
    };
  }
}

/**
 * checkConnection()
 * Quick test to verify credentials work — call this on server startup.
 */
async function checkConnection() {
  try {
    getClient();
    console.log(`[Hedera] ✅ Credentials loaded. Account: ${ACCOUNT_ID} | Network: ${NETWORK}`);
    return true;
  } catch (err) {
    console.warn(`[Hedera] ⚠️  ${err.message}`);
    console.warn(`[Hedera] Real transactions disabled. Simulation mode active.`);
    return false;
  }
}

module.exports = { sendCompletionPayment, checkConnection };