const EXCHANGE_RATE = 1000; // 1 USD = 1000 COMPUTE tokens

let wallet = {
  connected: false,
  accountId: null,
  privateKeyMasked: null,
  balanceTokens: 5000,
  allocatedTokens: 0,
  totalSpentTokens: 0,
  totalRefundedTokens: 0,
  connectedAt: null,
  transactionHistory: []
};

export function connectWallet(accountId, privateKey) {
  if (!accountId || !privateKey) {
    return { success: false, error: 'Account ID and Private Key are required.' };
  }

  if (!/^0\.0\.\d+$/.test(accountId)) {
    return { success: false, error: 'Invalid Account ID format. Use 0.0.XXXXX' };
  }

  if (privateKey.length < 10) {
    return { success: false, error: 'Private Key too short.' };
  }

  wallet.connected = true;
  wallet.accountId = accountId;
  wallet.privateKeyMasked = '****' + privateKey.slice(-4);
  wallet.connectedAt = new Date().toISOString();

  const { ...safeWallet } = wallet;
  return { success: true, wallet: safeWallet };
}

export function disconnectWallet() {
  wallet.connected = false;
  wallet.accountId = null;
  wallet.privateKeyMasked = null;
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
