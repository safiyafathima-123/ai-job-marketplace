import express from 'express';
import walletService from '../services/walletService.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json(walletService.getWallet());
});

router.post('/connect', (req, res) => {
  const { accountId, providerName } = req.body;
  const result = walletService.connectWallet(accountId, providerName);
  
  if (!result.success) {
    return res.status(400).json(result);
  }
  
  res.json(result);
});

router.post('/disconnect', (req, res) => {
  const result = walletService.disconnectWallet();
  res.json(result);
});

export default router;
