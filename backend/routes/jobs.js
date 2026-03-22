import express from 'express';
import { createJob, getJob, getAllJobs } from '../models/jobStore.js';
import { runJob, simulateFailure } from '../services/agentService.js';

const router = express.Router();

function validateJobPayload(req, res, next) {
  const { title, jobType, budget } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3)
    errors.push('title must be at least 3 characters');
  if (!jobType)
    errors.push('jobType is required');
  if (!budget || isNaN(budget) || parseFloat(budget) <= 0)
    errors.push('budget must be a positive number');

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
}

router.post('/', validateJobPayload, (req, res) => {
  const { title, description, jobType, budget, requiredAccuracy } = req.body;
  const job = createJob({ title, description, jobType, budget, requiredAccuracy });

  runJob(job.id, job).catch(err =>
    console.error(`Agent error on job ${job.id}:`, err)
  );

  res.status(201).json({
    message: 'Job submitted. AI Agent is processing.',
    job,
  });
});

router.get('/', (_req, res) => {
  const jobs = getAllJobs();
  res.json({ jobs, total: jobs.length });
});

router.get('/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

router.post('/:id/simulate-failure', async (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  await simulateFailure(req.params.id);
  res.json({ message: 'Failure simulated', jobId: req.params.id });
});

export default router;