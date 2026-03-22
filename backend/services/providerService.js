/**
 * providerService.js — AI Resource Marketplace Provider Registry
 */

const reputationStore = new Map();

const PROVIDERS = [
  {
    id: 'prov-gpu-001',
    name: 'TensorFleet Prime',
    description: 'A100 GPU cluster with NVLink — built for large model training runs.',
    resourceType: 'gpu-training',
    specialties: ['gpu-training', 'general'],
    specs: { gpus: 8, vram: '80GB', interconnect: 'NVLink', precision: 'BF16/FP32', cudaEnabled: true },
    costPerTask: 0.0120,
    accuracy: 99.1,
    avgLatency: 2.4,
    availability: 0.99,
    status: 'active',
    tier: 'premium',
    reputation: 9.8,
    jobsCompleted: 1284,
    successRate: 99.2,
    jobsThisSession: 0,
    lastPricingAction: null
  },
  {
    id: 'prov-gpu-002',
    name: 'CloudGPU Economy',
    description: 'RTX 4090 nodes for budget-conscious training and fine-tuning.',
    resourceType: 'gpu-training',
    specialties: ['gpu-training', 'general'],
    specs: { gpus: 2, vram: '24GB', interconnect: 'PCIe', precision: 'FP16', cudaEnabled: true },
    costPerTask: 0.0045,
    accuracy: 96.3,
    avgLatency: 3.8,
    availability: 0.95,
    status: 'active',
    tier: 'economy',
    reputation: 8.1,
    jobsCompleted: 876,
    successRate: 95.8,
    jobsThisSession: 0,
    lastPricingAction: null
  },
  {
    id: 'prov-inf-001',
    name: 'NeuralCore Alpha',
    description: 'High-throughput inference API with sub-second latency and 99.9% uptime.',
    resourceType: 'model-inference',
    specialties: ['model-inference', 'text-analysis', 'summarization', 'translation', 'general'],
    specs: { modelsHosted: 42, maxTokens: 32768, latencyP99: '320ms' },
    costPerTask: 0.0025,
    accuracy: 97.2,
    avgLatency: 0.32,
    availability: 0.999,
    status: 'active',
    tier: 'premium',
    reputation: 9.7,
    jobsCompleted: 3421,
    successRate: 98.9,
    jobsThisSession: 0,
    lastPricingAction: null
  },
  {
    id: 'prov-inf-002',
    name: 'VisionBot Pro',
    description: 'Specialised in computer vision inference — image classification, OCR, object detection.',
    resourceType: 'model-inference',
    specialties: ['model-inference', 'image-classification', 'ocr', 'object-detection'],
    specs: { modelsHosted: 18, maxImageSize: '20MB', latencyP99: '180ms' },
    costPerTask: 0.0018,
    accuracy: 95.8,
    avgLatency: 0.18,
    availability: 0.97,
    status: 'active',
    tier: 'standard',
    reputation: 8.9,
    jobsCompleted: 2108,
    successRate: 96.4,
    jobsThisSession: 0,
    lastPricingAction: null
  },
  {
    id: 'prov-inf-003',
    name: 'QuantumText Labs',
    description: 'State-of-the-art code generation and NLP inference, optimised for developers.',
    resourceType: 'model-inference',
    specialties: ['model-inference', 'code-generation', 'text-analysis', 'summarization'],
    specs: { modelsHosted: 12, maxTokens: 128000, latencyP99: '450ms' },
    costPerTask: 0.0045,
    accuracy: 98.3,
    avgLatency: 0.45,
    availability: 0.98,
    status: 'active',
    tier: 'premium',
    reputation: 9.9,
    jobsCompleted: 1897,
    successRate: 99.5,
    jobsThisSession: 0,
    lastPricingAction: null
  },
  {
    id: 'prov-sto-001',
    name: 'VaultAI Storage',
    description: 'Redundant distributed storage with instant retrieval — built for AI datasets.',
    resourceType: 'data-storage',
    specialties: ['data-storage', 'general'],
    specs: { redundancy: '3x', encryption: 'AES-256', retrievalTime: '<50ms', maxFileSize: '500GB' },
    costPerTask: 0.0008,
    accuracy: 99.9,
    avgLatency: 0.05,
    availability: 0.9999,
    status: 'active',
    tier: 'premium',
    reputation: 9.5,
    jobsCompleted: 5632,
    successRate: 99.8,
    jobsThisSession: 0,
    lastPricingAction: null
  },
  {
    id: 'prov-sto-002',
    name: 'DataMind Economy',
    description: 'Cost-effective cold storage for datasets and model checkpoints.',
    resourceType: 'data-storage',
    specialties: ['data-storage', 'data-processing', 'general'],
    specs: { redundancy: '2x', encryption: 'AES-128', retrievalTime: '<500ms', maxFileSize: '100GB' },
    costPerTask: 0.0003,
    accuracy: 98.1,
    avgLatency: 0.5,
    availability: 0.96,
    status: 'active',
    tier: 'economy',
    reputation: 7.8,
    jobsCompleted: 2341,
    successRate: 94.2,
    jobsThisSession: 0,
    lastPricingAction: null
  },
];

PROVIDERS.forEach(p => reputationStore.set(p.id, p.reputation));

export function getProviders() {
  return PROVIDERS.map(p => ({
    ...p,
    reputation: parseFloat((reputationStore.get(p.id) || p.reputation).toFixed(1)),
  }));
}

export function getProvider(id) {
  const p = PROVIDERS.find(p => p.id === id);
  if (!p) return null;
  return { ...p, reputation: parseFloat((reputationStore.get(p.id) || p.reputation).toFixed(1)) };
}

export function boostReputation(providerId) {
  const p = PROVIDERS.find(p => p.id === providerId);
  if (p) p.jobsThisSession = (p.jobsThisSession || 0) + 1;
  const current = reputationStore.get(providerId) || 8;
  reputationStore.set(providerId, Math.min(10, parseFloat((current + 0.1).toFixed(1))));
}

export function penaliseReputation(providerId) {
  const current = reputationStore.get(providerId) || 8;
  reputationStore.set(providerId, Math.max(1, parseFloat((current - 0.5).toFixed(1))));
}

export function registerProvider(data) {
  if (!data.name || !data.resourceType || !data.pricePerTask) {
    throw new Error('Missing required provider registry fields.');
  }

  const newProvider = {
    id: `prov-new-${Date.now()}`,
    name: data.name,
    description: data.description || 'New dynamic resource provider.',
    resourceType: data.resourceType,
    specialties: [data.resourceType, 'general'],
    specs: data.specs || { tier: 'standard latency' },
    costPerTask: parseFloat(data.pricePerTask),
    walletAddress: data.walletAddress || '0x0.mock.hedera',
    status: 'active',
    tier: 'standard',
    reputation: 7.0,
    jobsCompleted: 0,
    successRate: 100,
    jobsThisSession: 0,
    lastPricingAction: null
  };

  PROVIDERS.push(newProvider);
  reputationStore.set(newProvider.id, 7.0);
  return newProvider;
}