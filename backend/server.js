require('dotenv').config();   // ← load .env FIRST, before anything else

const express = require('express');
const cors    = require('cors');
const jobRoutes      = require('./routes/jobs');
const providerRoutes = require('./routes/providers');
const { checkConnection } = require('./services/realHederaService');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/jobs',      jobRoutes);
app.use('/api/providers', providerRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🚀 AI Job Marketplace API running on http://localhost:${PORT}`);
  console.log(`──────────────────────────────────────────`);

  // Check if real Hedera credentials exist
  await checkConnection();

  console.log(`──────────────────────────────────────────\n`);
});

module.exports = app;