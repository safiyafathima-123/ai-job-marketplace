const EXCHANGE_RATE = 1000; // 1 USD = 1000 COMPUTE tokens

let wallet = {
  connected: false,
  accountId: null,
  providerName: null,
  balanceTokens: 5000,
  allocatedTokens: 0,
  totalSpentTokens: 0,
  totalRefundedTokens: 0,
  connectedAt: null,
  transactionHistory: []
};

export function connectWallet(accountId, providerName) {
  if (!accountId) {
    return { success: false, error: 'Account ID is required.' };
  }

  if (!/^0\.0\.\d+$/.test(accountId)) {
    return { success: false, error: 'Invalid Account ID format. Use 0.0.XXXXX' };
  }

  wallet.connected = true;
  wallet.accountId = accountId;
  wallet.providerName = providerName || 'Local Wallet';
  wallet.connectedAt = new Date().toISOString();

  const { ...safeWallet } = wallet;
  return { success: true, wallet: safeWallet };
}

export function disconnectWallet() {
  wallet.connected = false;
  wallet.accountId = null;
  wallet.providerName = null;
  wallet.connectedAt = null;
  return { success: true };
}

export function getWallet() {
  const { ...safeWallet } = wallet;
  return safeWallet;
}

export default { 
  connectWallet, 
  disconnectWallet, 
  getWallet 
};
