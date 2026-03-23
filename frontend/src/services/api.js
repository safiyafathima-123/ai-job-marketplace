/**
 * api.js — Centralised API client
 */

const BASE_URL = 'http://localhost:5003/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const submitJob       = (payload) => request('/jobs', { method: 'POST', body: JSON.stringify(payload) });
export const fetchJobs       = ()         => request('/jobs');
export const fetchJob        = (id)       => request(`/jobs/${id}`);
export const fetchProviders  = ()         => request('/providers');
export const simulateJobFailure = (id)    => request(`/jobs/${id}/simulate-failure`, { method: 'POST' });

// Pricing Agent & Provider Management
export const registerProvider   = (data) => request('/providers/register', { method: 'POST', body: JSON.stringify(data) });
export const fetchMarketSummary = ()     => request('/providers/market-summary');
export const fetchPricingLogs   = ()     => request('/providers/pricing-logs');