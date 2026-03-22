import { v4 as uuidv4 } from 'uuid';

export const TOKEN_SYMBOL   = 'COMPUTE';
export const TOKEN_NAME     = 'ComputeToken (HTS)';
export const TOKEN_ID       = '0.0.4821903';          // mock HTS token ID
export const NETWORK        = 'testnet';
export const HCS_TOPIC_ID   = '0.0.5193847';          // mock HCS topic for job logs
export const EXCHANGE_RATE  = 1000;                    // 1 USD = 1000 COMPUTE tokens

function mockTxId() {
  const account = Math.floor(Math.random() * 900000 + 100000);
  const secs    = Math.floor(Date.now() / 1000);
  const nanos   = Math.floor(Math.random() * 999999999);
  return `0.0.${account}@${secs}.${nanos}`;
}

function mockSeqNum() {
  return Math.floor(Math.random() * 900000 + 100000);
}

export function usdToTokens(usd) {
  return Math.round(parseFloat(usd) * EXCHANGE_RATE);
}

export function createEscrowContract(jobId, budgetUsd) {
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
    contractStatus: 'ACTIVE',
    milestones,
    hcsTopicId:     HCS_TOPIC_ID,
    hcsMessages:    [],
    createdAt:      new Date().toISOString(),
  };
}

export function releaseMilestone(contract, milestoneId) {
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

export function terminateContract(contract, reason) {
  const refundTxId      = mockTxId();
  contract.contractStatus = 'TERMINATED';
  contract.refundedTokens = contract.escrowedTokens;
  contract.escrowedTokens = 0;
  contract.terminatedAt   = new Date().toISOString();
  contract.terminationReason = reason;
  contract.refundTxId     = refundTxId;
  return { ...contract };
}

export function completeContract(contract) {
  contract.contractStatus = 'COMPLETED';
  contract.completedAt    = new Date().toISOString();
  return { ...contract };
}

export function appendHcsMessage(contract, message) {
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