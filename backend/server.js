import 'dotenv/config'; // load .env FIRST
import http from 'node:http';
import express from 'express';
import cors from 'cors';
import jobRoutes from './routes/jobs.js';
import providerRoutes from './routes/providers.js';
import walletRoutes from './routes/wallet.js';
import { checkConnection } from './services/realHederaService.js';

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_RETRIES = 10;

// -- Middleware --
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// -- Routes --
app.get('/', (_req, res) => {
  res.json({
    name: 'AI Job Marketplace Backend',
    message: 'API server is running',
    apiBase: '/api',
    health: '/api/health',
  });
});

app.get('/api', (_req, res) => {
  res.json({
    message: 'Welcome to AI Job Marketplace API',
    endpoints: [
      '/api/health',
      '/api/jobs',
      '/api/providers',
      '/api/wallet',
    ],
  });
});

app.use('/api/jobs', jobRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/wallet', walletRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// -- Start --
function startServer(port, retries = 0) {
  const server = http.createServer(app);

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && retries < MAX_PORT_RETRIES) {
      const nextPort = port + 1;
      console.warn(`⚠ Port ${port} is in use. Retrying on ${nextPort}...`);
      startServer(nextPort, retries + 1);
      return;
    }

    console.error('❌ Failed to start API server:', err.message);
    process.exit(1);
  });

  server.listen(port, async () => {
    console.log(`\n🚀 AI Job Marketplace API running on http://localhost:${port}`);
    console.log(`──────────────────────────────────────────`);

    // Check if real Hedera credentials exist
    await checkConnection();

    console.log(`──────────────────────────────────────────\n`);
  });
}

startServer(DEFAULT_PORT);

export default app;