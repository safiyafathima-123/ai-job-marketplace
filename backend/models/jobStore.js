/**
 * jobStore.js — In-memory data store
 *
 * Abstraction layer over raw storage.
 * Swap this file for a real DB — all routes stay the same.
 */

const { v4: uuidv4 } = require('uuid');

const jobs = new Map();

const JOB_STATUS = {
  PENDING:    'pending',
  MATCHING:   'matching',
  RUNNING:    'running',
  COMPLETED:  'completed',
  FAILED:     'failed',
};

function createJob({ title, description, jobType, budget, requiredAccuracy }) {
  const id = uuidv4();
  const job = {
    id,
    title,
    description,
    jobType,
    budget: parseFloat(budget),
    requiredAccuracy: parseFloat(requiredAccuracy) || 90,
    status: JOB_STATUS.PENDING,
    progress: 0,
    selectedProvider:     null,
    selectedProviderId:   null,
    providerTier:         null,
    providerReputation:   null,
    providerResourceType: null,
    providerSpecs:        null,
    providerScore:        null,
    estimatedCost:        null,
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
    completedAt: null,
    output:      null,
    // ── Hedera fields ──────────────────────────────────────────────────────
    hedera:      null,   // full contract + HCS state (set after escrow deploy)
    logs:        [`Job created at ${new Date().toISOString()}`],
  };

  jobs.set(id, job);
  return job;
}

function getJob(id)    { return jobs.get(id) || null; }
function getAllJobs()   {
  return [...jobs.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function updateJob(id, updates) {
  const job = jobs.get(id);
  if (!job) return null;
  const updated = { ...job, ...updates, updatedAt: new Date().toISOString() };
  jobs.set(id, updated);
  return updated;
}

function appendLog(id, message) {
  const job = jobs.get(id);
  if (!job) return null;
  job.logs = [...(job.logs || []), `[${new Date().toISOString()}] ${message}`];
  job.updatedAt = new Date().toISOString();
  jobs.set(id, job);
  return job;
}

module.exports = { createJob, getJob, getAllJobs, updateJob, appendLog, JOB_STATUS };