import express from 'express';
import { getProviders, getProvider, registerProvider } from '../services/providerService.js';
import pricingAgent from '../services/pricingAgent.js';

const router = express.Router();

router.get('/market-summary', (req, res) => {
  try {
    const summary = pricingAgent.getMarketSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pricing-logs', (req, res) => {
  try {
    const logs = pricingAgent.getPricingLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', (req, res) => {
  try {
    console.log('[DEBUG] Registering provider:', req.body.name);
    const provider = registerProvider(req.body);
    res.status(201).json(provider);
  } catch (err) {
    console.error('[DEBUG] Registration error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  const providers = getProviders();
  res.json({ providers, total: providers.length });
});

router.get('/:id', (req, res) => {
  const provider = getProvider(req.params.id);
  if (!provider) {
    return res.status(404).json({ error: 'Provider not found' });
  }
  res.json(provider);
});

export default router;
