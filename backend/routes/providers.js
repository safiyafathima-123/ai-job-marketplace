/**
 * routes/providers.js
 *
 * GET /api/providers       — List all providers
 * GET /api/providers/:id   — Get single provider details
 */

const express = require('express');
const router = express.Router();
const { getProviders, getProvider } = require('../services/providerService');

router.get('/', (_req, res) => {
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

module.exports = router;
