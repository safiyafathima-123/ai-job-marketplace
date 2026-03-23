/**
 * models/jobStore.js
 * In-memory job store (replace with real DB later).
 */

const jobs = new Map();

export const JOB_STATUS = {
  PENDING: 'pending',
  MATCHING: 'matching',
  RUNNING: 'running',
  DISTRIBUTED: 'distributed', // parallel multi-provider execution
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export function createJob(data) {
  const id = `job-${Date.now()}`;
  const job = {
    id,
    ...data,
    status: JOB_STATUS.PENDING,
    progress: 0,
    logs: [],
    subTasks: [],       // populated by Orchestrator Agent for heavy jobs
    isDistributed: false,
    createdAt: new Date().toISOString(),
  };
  jobs.set(id, job);
  return job;
}

export function getJob(id) {
  return jobs.get(id);
}

export function getAllJobs() {
  return Array.from(jobs.values());
}

export function updateJob(id, data) {
  const job = jobs.get(id);
  if (job) {
    Object.assign(job, data, { updatedAt: new Date().toISOString() });
    return job;
  }
  return null;
}

export function appendLog(id, message) {
  const job = jobs.get(id);
  if (job) {
    job.logs.push({
      timestamp: new Date().toISOString(),
      message,
    });
  }
}