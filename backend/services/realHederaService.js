import 'dotenv/config';
import {
  Client,
  TransferTransaction,
  AccountId,
  PrivateKey,
  Hbar,
  HbarUnit,
} from '@hashgraph/sdk';

const ACCOUNT_ID  = process.env.HEDERA_ACCOUNT_ID;
const PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY;
const NETWORK     = process.env.HEDERA_NETWORK || 'testnet';

export function getClient() {
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

export async function sendCompletionPayment(jobId, jobTitle) {
  const client = getClient();

  console.log(`\n[Hedera] Sending real transaction for job: ${jobTitle}`);
  console.log(`[Hedera] Account: ${ACCOUNT_ID} | Network: ${NETWORK}`);

  try {
    const transaction = await new TransferTransaction()
      .addHbarTransfer(ACCOUNT_ID, new Hbar(-1, HbarUnit.Tinybar))
      .addHbarTransfer(ACCOUNT_ID, new Hbar(1, HbarUnit.Tinybar))
      .setTransactionMemo(`AIMarket job complete: ${jobId.slice(0, 8)}`)
      .execute(client);

    console.log(`[Hedera] Transaction submitted. Waiting for consensus...`);
    const receipt = await transaction.getReceipt(client);

    const txId = transaction.transactionId.toString();
    const status = receipt.status.toString();
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

export async function checkConnection() {
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