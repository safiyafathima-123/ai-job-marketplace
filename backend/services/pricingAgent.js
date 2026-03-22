/**
 * pricingAgent.js — Autonomous Market Analysis & Dynamic Pricing
 */

const pricingLogs = [];
const submissionsPerType = {
  'gpu-training': 0,
  'model-inference': 0,
  'data-storage': 0
};
const providerJobCounts = new Map(); // providerId -> count in session

export function analyseMarket(resourceType) {
  submissionsPerType[resourceType] = (submissionsPerType[resourceType] || 0) + 1;
  const count = submissionsPerType[resourceType];

  let demandLevel = 'stable';
  let priceChange = 0;
  let reason = 'Market is stable for this resource type.';

  if (count > 3) {
    demandLevel = 'high';
    priceChange = 0.05; // 5% increase
    reason = `High demand detected (${count} submissions) — Provider prices increased 5%`;
  } else if (count < 2) {
    demandLevel = 'low';
    priceChange = -0.10; // 10% decrease
    reason = `Low demand detected — Prices decreased 10% to attract jobs`;
  }

  return {
    demandLevel,
    priceChange,
    reason,
    timestamp: new Date().toISOString()
  };
}

export function recordJobComplete(providerId, durationSeconds) {
  const currentCount = (providerJobCounts.get(providerId) || 0) + 1;
  providerJobCounts.set(providerId, currentCount);

  let status = 'active';
  if (currentCount > 3) status = 'high-demand';
  else if (currentCount <= 1) status = 'idle';

  const log = {
    providerId,
    durationSeconds,
    totalJobsInSession: currentCount,
    status,
    timestamp: new Date().toISOString()
  };

  pricingLogs.push(log);
  return log;
}

export function getPricingLogs() {
  return pricingLogs;
}

export function getMarketSummary() {
  return {
    submissions: { ...submissionsPerType },
    totalLogs: pricingLogs.length,
    activeAgent: true,
    timestamp: new Date().toISOString()
  };
}

export default {
  analyseMarket,
  recordJobComplete,
  getPricingLogs,
  getMarketSummary
};
