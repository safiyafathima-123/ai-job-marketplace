/**
 * hederaService.js — Hedera Simulation Layer
 *
 * Simulates Hedera Hashgraph services:
 *   - HTS  (Hedera Token Service)   → ComputeToken balances & transfers
 *   - HSC  (Hedera Smart Contract)  → Escrow + milestone release logic
 *   - HCS  (Hedera Consensus Service) → Immutable on-chain log topic
 *
 * Architecture note:
 *   Every function here has the SAME signature it would have
 *   against the real Hedera JS SDK. To go live, replace the
 *   mock bodies with real SDK calls — nothing else changes.
 */

const { v4: uuidv4 } = require('uuid');

// ── Constants ─────────────────────────────────────────────────────────────────
const TOKEN_SYMBOL   = 'COMPUTE';
const TOKEN_NAME     = 'ComputeToken (HTS)';
const TOKEN_ID       = '0.0.4821903';          // mock HTS token ID
const NETWORK        = 'testnet';
const HCS_TOPIC_ID   = '0.0.5193847';          // mock HCS topic for job logs
const EXCHANGE_RATE  = 1000;                    // 1 USD = 1000 COMPUTE tokens

// ── Helpers ───────────────────────────────────────────────────────────────────
function mockTxId() {
  // Hedera TX IDs look like: 0.0.ACCOUNTID@SECONDS.NANOS
  const account = Math.floor(Math.random() * 900000 + 100000);
  const secs    = Math.floor(Date.now() / 1000);
  const nanos   = Math.floor(Math.random() * 999999999);
  return `0.0.${account}@${secs}.${nanos}`;
}

function mockSeqNum() {
  return Math.floor(Math.random() * 900000 + 100000);
}

/**
 * Convert USD → COMPUTE tokens (integer, no decimals)
 */
function usdToTokens(usd) {
  return Math.round(parseFloat(usd) * EXCHANGE_RATE);
}

// ── Smart Contract: Escrow ────────────────────────────────────────────────────
/**
 * Deploy a milestone-based escrow contract for a job.
 *
 * Milestones release tokens progressively:
 *   25% on provider selection
 *   25% at 50% progress
 *   25% at 80% progress
 *   25% on completion
 *
 * Returns the contract state object stored on the job.
 */
function createEscrowContract(jobId, budgetUsd) {
  const totalTokens = usdToTokens(budgetUsd);
  const contractId  = `0.0.${Math.floor(Math.random() * 9000000 + 1000000)}`;
  const deployTx    = mockTxId();

  const milestones = [
    { id: 'M1', label: 'Provider Selected',  pct: 25, tokens: Math.round(totalTokens * 0.25), released: false, txId: null },
    { id: 'M2', label: '50% Progress',        pct: 25, tokens: Math.round(totalTokens * 0.25), released: false, txId: null },
    { id: 'M3', label: '80% Progress',        pct: 25, tokens: Math.round(totalTokens * 0.25), released: false, txId: null },
    { id: 'M4', label: 'Job Completed',       pct: 25, tokens: Math.round(totalTokens * 0.25), released: false, txId: null },
  ];

  return {
    contractId,
    deployTxId:     deployTx,
    deployStatus:   'SUCCESS',
    network:        NETWORK,
    tokenId:        TOKEN_ID,
    tokenSymbol:    TOKEN_SYMBOL,
    tokenName:      TOKEN_NAME,
    totalTokens,
    escrowedTokens: totalTokens,
    releasedTokens: 0,
    refundedTokens: 0,
    contractStatus: 'ACTIVE',   // ACTIVE | COMPLETED | TERMINATED
    milestones,
    hcsTopicId:     HCS_TOPIC_ID,
    hcsMessages:    [],
    createdAt:      new Date().toISOString(),
  };
}

/**
 * Release tokens for a specific milestone.
 * Returns updated contract state.
 */
function releaseMilestone(contract, milestoneId) {
  const ms = contract.milestones.find(m => m.id === milestoneId);
  if (!ms || ms.released) return contract;

  const txId = mockTxId();
  ms.released  = true;
  ms.txId      = txId;
  ms.releasedAt = new Date().toISOString();

  contract.releasedTokens += ms.tokens;
  contract.escrowedTokens -= ms.tokens;

  return { ...contract, milestones: [...contract.milestones] };
}

/**
 * Terminate contract early and refund remaining escrowed tokens to buyer.
 */
function terminateContract(contract, reason) {
  const refundTxId      = mockTxId();
  contract.contractStatus = 'TERMINATED';
  contract.refundedTokens = contract.escrowedTokens;
  contract.escrowedTokens = 0;
  contract.terminatedAt   = new Date().toISOString();
  contract.terminationReason = reason;
  contract.refundTxId     = refundTxId;
  return { ...contract };
}

/**
 * Finalise a successfully completed contract.
 */
function completeContract(contract) {
  contract.contractStatus = 'COMPLETED';
  contract.completedAt    = new Date().toISOString();
  return { ...contract };
}

// ── HCS: Consensus Log ────────────────────────────────────────────────────────
/**
 * Append a message to the HCS topic log.
 * In production: TopicMessageSubmitTransaction to HCS_TOPIC_ID.
 */
function appendHcsMessage(contract, message) {
  const entry = {
    seqNum:    mockSeqNum(),
    topicId:   contract.hcsTopicId,
    message,
    txId:      mockTxId(),
    consensusTimestamp: new Date().toISOString(),
    status:    'REACHED_CONSENSUS',
  };
  contract.hcsMessages = [...(contract.hcsMessages || []), entry];
  return { ...contract };
}

module.exports = {
  createEscrowContract,
  releaseMilestone,
  terminateContract,
  completeContract,
  appendHcsMessage,
  usdToTokens,
  TOKEN_SYMBOL,
  TOKEN_NAME,
  TOKEN_ID,
  HCS_TOPIC_ID,
  EXCHANGE_RATE,
};