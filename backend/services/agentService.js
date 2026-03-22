/**
 * agentService.js — AI Agent Orchestrator with Hedera + Reputation
 */

import { getProviders, boostReputation, penaliseReputation } from './providerService.js';
import { updateJob, appendLog, JOB_STATUS, getJob } from '../models/jobStore.js';
import * as hedera from './hederaService.js';
import * as realHedera from './realHederaService.js';
import pricingAgent from './pricingAgent.js';

const RESOURCE_CATEGORY = {
  'gpu-training':         'gpu-training',
  'model-inference':      'model-inference',
  'data-storage':         'data-storage',
  'text-analysis':        'model-inference',
  'summarization':        'model-inference',
  'image-classification': 'model-inference',
  'data-processing':      'data-storage',
  'code-generation':      'model-inference',
  'transcription':        'model-inference',
  'translation':          'model-inference',
  'general':              'model-inference',
};

export function scoreProvider(provider, job) {
  let score = 0;
  const category = RESOURCE_CATEGORY[job.jobType] || 'model-inference';
  if (provider.resourceType === category)              score += 35;
  else if (provider.specialties.includes('general'))   score += 10;
  if (provider.specialties.includes(job.jobType))      score += 25;
  const costRatio = provider.costPerTask / job.budget;
  if (costRatio <= 1) score += 25 * (1 - costRatio * 0.5);
  if (provider.accuracy >= (job.requiredAccuracy || 90)) score += 10;
  // Reputation now contributes to score (up to 5 pts)
  score += (provider.reputation / 10) * 5;
  return Math.round(score);
}

export function selectProvider(job) {
  const providers = getProviders().filter(p => p.status === 'active');
  return providers
    .map(p => ({ ...p, score: scoreProvider(p, job) }))
    .sort((a, b) => b.score - a.score)[0] || null;
}

function generateOutput(jobType, provider) {
  const category = RESOURCE_CATEGORY[jobType] || 'model-inference';
  if (category === 'gpu-training') {
    return {
      type: 'gpu-training', summary: 'Model trained successfully',
      finalAccuracy: 91.2, finalLoss: 0.447, trainingTime: '38s',
      checkpointSaved: `model_checkpoint_epoch8_acc91.2.pt`,
      gpusUsed: provider.specs?.gpus || 2, totalTokens: '1.2B',
      epochs: [
        { epoch:1, loss:2.431, accuracy:58.2 }, { epoch:2, loss:1.872, accuracy:66.7 },
        { epoch:3, loss:1.341, accuracy:73.1 }, { epoch:4, loss:0.987, accuracy:79.4 },
        { epoch:5, loss:0.742, accuracy:84.8 }, { epoch:6, loss:0.601, accuracy:87.3 },
        { epoch:7, loss:0.512, accuracy:89.6 }, { epoch:8, loss:0.447, accuracy:91.2 },
      ],
    };
  }
  if (category === 'model-inference') {
    const map = {
      'image-classification': { input:'uploaded_image_product_001.jpg (2.4MB)', predictions:[{ label:'Running Shoe', confidence:94.7 },{ label:'Sneaker', confidence:91.2 },{ label:'Athletic Wear', confidence:87.6 }], processingTime:'182ms', modelUsed:'ViT-L/14' },
      'text-analysis':        { input:'"The product quality exceeded my expectations. Delivery was fast."', sentiment:'POSITIVE', sentimentScore:0.97, keywords:['exceeded','expectations','fast','excellent'], processingTime:'94ms', modelUsed:'BERT-large' },
      'code-generation':      { input:'Generate a Python function to validate email addresses', output:`def validate_email(email: str) -> bool:\n    import re\n    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'\n    return bool(re.match(pattern, email))`, language:'Python', tokensGenerated:64, processingTime:'312ms', modelUsed:'CodeLlama-34B' },
      'summarization':        { input:'Research paper: "Attention Is All You Need" (8 pages)', summary:'Introduces the Transformer architecture, replacing recurrence with self-attention. Achieves state-of-the-art results on translation tasks with greater parallelisability.', compressionRatio:'94%', processingTime:'228ms', modelUsed:'BART-large' },
      'translation':          { input:'"Hello, how are you today? I hope you are doing well."', sourceLang:'English', targetLang:'Spanish', output:'"Hola, ¿cómo estás hoy? Espero que estés bien."', bleuScore:0.91, processingTime:'156ms', modelUsed:'NLLB-200' },
    };
    return { type:'model-inference', summary:'Inference completed', ...(map[jobType] || { input:'Query processed', output:'Done', processingTime:'210ms', modelUsed:'GPT-J-6B' }) };
  }
  if (category === 'data-storage') {
    const hash = Array.from({ length:12 }, () => Math.floor(Math.random()*16).toString(16)).join('');
    return { type:'data-storage', summary:'Data stored and verified', fileName:`dataset_${Date.now()}.parquet`, fileSize:`${(Math.random()*900+100).toFixed(1)} MB`, storageId:`vslt-${hash}`, redundancy:provider.specs?.redundancy||'2x', encryption:provider.specs?.encryption||'AES-256', retrievalUrl:`https://storage.vaultai.io/${hash}`, checksumVerified:true, storedAt:new Date().toISOString() };
  }
}

function getExecutionSteps(jobType) {
  const category = RESOURCE_CATEGORY[jobType] || 'model-inference';
  const steps = {
    'gpu-training': [
      { progress:28, delay:2000, milestone:null, log:'Provider Agent: Initializing job environment...' },
      { progress:35, delay:2500, milestone:null, log:'Provider Agent: Allocating GPU cluster — 8× A100 80GB VRAM...' },
      { progress:42, delay:2000, milestone:null, log:'Provider Agent: Loading dataset into GPU memory...' },
      { progress:50, delay:3000, milestone:'M2',  log:'Provider Agent: Running computation — epoch 1–3 complete, acc: 73.1%' },
      { progress:58, delay:2500, milestone:null, log:'Provider Agent: Updating metrics — epoch 4–5, acc: 84.8%' },
      { progress:66, delay:2500, milestone:null, log:'Provider Agent: Running computation — epoch 6–7, acc: 89.6%' },
      { progress:74, delay:2000, milestone:null, log:'Provider Agent: Updating metrics — epoch 8, final acc: 91.2%' },
      { progress:80, delay:2000, milestone:'M3',  log:'Provider Agent: Saving model checkpoint to distributed storage...' },
      { progress:87, delay:2000, milestone:null, log:'Validator Agent: Reviewing output — checking accuracy and loss convergence...' },
      { progress:93, delay:2000, milestone:null, log:'Validator Agent: Proof of Useful Work — verifying computation integrity via Hedera HCS...' },
      { progress:96, delay:1500, milestone:null, log:'Validator Agent: ✔ Proof of Useful Work Verified via Hedera Logs' },
    ],
    'model-inference': [
      { progress:28, delay:1500, milestone:null, log:'Provider Agent: Initializing job...' },
      { progress:36, delay:2000, milestone:null, log:'Provider Agent: Allocating resource — loading model endpoint...' },
      { progress:45, delay:2000, milestone:null, log:'Provider Agent: Running execution — sending input to model...' },
      { progress:55, delay:2500, milestone:'M2',  log:'Provider Agent: Running computation — inference in progress...' },
      { progress:65, delay:2000, milestone:null, log:'Provider Agent: Updating metrics — processing model output...' },
      { progress:75, delay:1500, milestone:null, log:'Provider Agent: Formatting results for delivery...' },
      { progress:82, delay:2000, milestone:'M3',  log:'Validator Agent: Reviewing output quality...' },
      { progress:90, delay:1500, milestone:null, log:'Validator Agent: Proof of Useful Work — logging verification to Hedera HCS...' },
      { progress:95, delay:1500, milestone:null, log:'Validator Agent: ✔ Proof of Useful Work Verified via Hedera Logs' },
    ],
    'data-storage': [
      { progress:28, delay:1500, milestone:null, log:'Provider Agent: Initializing job...' },
      { progress:38, delay:2000, milestone:null, log:'Provider Agent: Allocating resource — connecting to storage nodes...' },
      { progress:50, delay:2000, milestone:null, log:'Provider Agent: Running execution — encrypting data (AES-256)...' },
      { progress:62, delay:2500, milestone:'M2',  log:'Provider Agent: Uploading to primary and replica nodes...' },
      { progress:72, delay:2000, milestone:null, log:'Provider Agent: Updating metrics — verifying data integrity...' },
      { progress:81, delay:1500, milestone:'M3',  log:'Provider Agent: All replicas confirmed...' },
      { progress:89, delay:1500, milestone:null, log:'Validator Agent: Running checksum verification...' },
      { progress:94, delay:1500, milestone:null, log:'Validator Agent: Proof of Useful Work — logging storage proof to Hedera HCS...' },
      { progress:97, delay:1000, milestone:null, log:'Validator Agent: ✔ Proof of Useful Work Verified via Hedera Logs' },
    ],
  };
  return steps[category] || steps['model-inference'];
}

export async function runJob(jobId, job) {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  let selectedProviderId = null;

  try {
    updateJob(jobId, { status: JOB_STATUS.MATCHING, progress: 0 });
    appendLog(jobId, 'Buyer Agent: Job received. Validating requirements...');
    const startTime = Date.now();
    updateJob(jobId, { startedAt: new Date().toISOString() });
    await delay(1500);

    const category = RESOURCE_CATEGORY[job.jobType] || 'model-inference';
    const pricingAnalysis = pricingAgent.analyseMarket(category);
    updateJob(jobId, { pricingAnalysis });
    appendLog(jobId, `Pricing Agent: ${pricingAnalysis.reason}`);

    let contract = hedera.createEscrowContract(jobId, job.budget);
    contract = hedera.appendHcsMessage(contract, `[HCS] Job ${jobId} created. Escrow deployed: ${contract.contractId}`);
    updateJob(jobId, { hedera: contract });
    appendLog(jobId, `Buyer Agent: Smart contract deployed on Hedera. Contract: ${contract.contractId}`);
    appendLog(jobId, `Buyer Agent: ${contract.totalTokens} ${hedera.TOKEN_SYMBOL} locked in escrow.`);
    await delay(1500);

    updateJob(jobId, { status: JOB_STATUS.MATCHING, progress: 10 });
    appendLog(jobId, 'Selector Agent: Scoring providers by price, performance, and reputation...');
    await delay(2000);

    const provider = selectProvider(job);
    if (!provider) throw new Error('No suitable provider found for this job type and budget.');
    selectedProviderId = provider.id;

    const estimatedCost = (provider.costPerTask * (0.85 + Math.random() * 0.3)).toFixed(4);
    updateJob(jobId, {
      status: JOB_STATUS.MATCHING, progress: 20,
      selectedProvider: provider.name,
      selectedProviderId: provider.id,
      providerTier: provider.tier,
      providerReputation: provider.reputation,
      providerJobsCompleted: provider.jobsCompleted,
      providerSuccessRate: provider.successRate,
      providerResourceType: provider.resourceType,
      providerSpecs: provider.specs,
      providerScore: scoreProvider(provider, job),
      estimatedCost,
    });
    appendLog(jobId, `Selector Agent: Selected → ${provider.name} | Reputation: ${provider.reputation}/10 | Success: ${provider.successRate}% | Score: ${scoreProvider(provider, job)}`);
    await delay(1000);

    contract = hedera.releaseMilestone(contract, 'M1');
    contract = hedera.appendHcsMessage(contract, `[HCS] M1 released: ${contract.milestones[0].tokens} ${hedera.TOKEN_SYMBOL} → ${provider.name}. TX: ${contract.milestones[0].txId}`);
    updateJob(jobId, { hedera: contract });
    appendLog(jobId, `Hedera: M1 payment — ${contract.milestones[0].tokens} ${hedera.TOKEN_SYMBOL} released to provider.`);
    await delay(800);

    const steps = getExecutionSteps(job.jobType);
    for (const step of steps) {
      await delay(step.delay);
      if (step.milestone) {
        contract = hedera.releaseMilestone(contract, step.milestone);
        const ms = contract.milestones.find(m => m.id === step.milestone);
        contract = hedera.appendHcsMessage(contract, `[HCS] ${step.milestone} released: ${ms.tokens} ${hedera.TOKEN_SYMBOL} → ${provider.name}. TX: ${ms.txId}`);
        updateJob(jobId, { status: JOB_STATUS.RUNNING, progress: step.progress, hedera: contract });
        appendLog(jobId, step.log);
        appendLog(jobId, `Hedera: ${step.milestone} — ${ms.tokens} ${hedera.TOKEN_SYMBOL} released. TX: ${ms.txId}`);
      } else {
        updateJob(jobId, { status: step.progress < 30 ? JOB_STATUS.MATCHING : JOB_STATUS.RUNNING, progress: step.progress, hedera: contract });
        appendLog(jobId, step.log);
      }
    }

    await delay(1000);
    const output = generateOutput(job.jobType, provider);

    appendLog(jobId, 'Hedera: Sending real on-chain completion transaction...');
    const realTx = await realHedera.sendCompletionPayment(jobId, job.title);
    const realTxData = realTx.success
      ? { realTxId: realTx.transactionId, realTxStatus: realTx.status, realTxNetwork: realTx.network, realTxUrl: realTx.explorerUrl, realTxSentAt: realTx.sentAt }
      : { realTxId: null, realTxStatus: 'SIMULATION_MODE', realTxError: realTx.error };

    contract = hedera.releaseMilestone(contract, 'M4');
    const m4 = contract.milestones.find(m => m.id === 'M4');
    contract = hedera.appendHcsMessage(contract, `[HCS] M4 (final) released: ${m4.tokens} ${hedera.TOKEN_SYMBOL} → ${provider.name}. TX: ${m4.txId}`);
    contract = hedera.completeContract(contract);
    contract = hedera.appendHcsMessage(contract, `[HCS] Contract ${contract.contractId} COMPLETED. ${contract.releasedTokens} ${hedera.TOKEN_SYMBOL} disbursed. Payment settled.`);

    updateJob(jobId, { status: JOB_STATUS.COMPLETED, progress: 100, completedAt: new Date().toISOString(), output, hedera: contract, ...realTxData });
    appendLog(jobId, `Validator Agent: Output verified. M4 payment released — ${m4.tokens} ${hedera.TOKEN_SYMBOL}.`);
    appendLog(jobId, `Validator Agent: Contract closed. All payments settled on Hedera.`);
    if (realTx.success) {
      appendLog(jobId, `✅ Real Hedera TX: ${realTx.transactionId} | ${realTx.status}`);
      appendLog(jobId, `🔗 HashScan: ${realTx.explorerUrl}`);
    }

    boostReputation(provider.id);
    appendLog(jobId, `System: Provider reputation updated (+0.1) → ${provider.name}`);

    const actualDurationSeconds = Math.round((Date.now() - startTime) / 1000);
    const pricingLog = pricingAgent.recordJobComplete(provider.id, actualDurationSeconds);
    updateJob(jobId, { actualDurationSeconds, pricingLog });
    appendLog(jobId, `Pricing Agent: Job recorded. Provider status: ${pricingLog.status}.`);

  } catch (err) {
    if (selectedProviderId) penaliseReputation(selectedProviderId);
    const currentJob = getJob(jobId);
    if (currentJob?.hedera) {
      let contract = currentJob.hedera;
      contract = hedera.terminateContract(contract, err.message);
      contract = hedera.appendHcsMessage(contract, `[HCS] Contract TERMINATED. Reason: ${err.message}. Refund: ${contract.refundedTokens} ${hedera.TOKEN_SYMBOL} → buyer.`);
      updateJob(jobId, { status: JOB_STATUS.FAILED, hedera: contract });
      appendLog(jobId, `System: Contract terminated. ${contract.refundedTokens} ${hedera.TOKEN_SYMBOL} refunded to buyer.`);
      if (selectedProviderId) appendLog(jobId, `System: Provider reputation reduced (-0.5) due to failure.`);
    } else {
      updateJob(jobId, { status: JOB_STATUS.FAILED });
    }
    appendLog(jobId, `Error: ${err.message}`);
  }
}

export async function simulateFailure(jobId) {
  const job = getJob(jobId);
  if (!job || job.status === JOB_STATUS.COMPLETED || job.status === JOB_STATUS.FAILED) return;

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  appendLog(jobId, 'SYSTEM: ⚠ Failure detected — metrics stopped improving.');
  await delay(800);
  appendLog(jobId, 'Validator Agent: Job stalled. Triggering contract termination...');
  await delay(800);

  let contract = job.hedera;
  if (contract) {
    if (job.selectedProviderId) penaliseReputation(job.selectedProviderId);
    contract = hedera.terminateContract(contract, 'Simulated failure: progress stalled, no metric improvement detected.');
    contract = hedera.appendHcsMessage(contract, `[HCS] Contract TERMINATED (simulated failure). ${contract.refundedTokens} ${hedera.TOKEN_SYMBOL} refunded → buyer.`);
    updateJob(jobId, { status: JOB_STATUS.FAILED, hedera: contract });
    appendLog(jobId, `Hedera: Contract terminated. ${contract.refundedTokens} ${hedera.TOKEN_SYMBOL} refunded to buyer.`);
    if (job.selectedProvider) appendLog(jobId, `System: Provider reputation penalised (-0.5) → ${job.selectedProvider}`);
  } else {
    updateJob(jobId, { status: JOB_STATUS.FAILED });
  }
  appendLog(jobId, 'System: Further payments halted. Escrow settlement complete.');
}