import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './index.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
import Home from './pages/Home';
import SubmitJob from './pages/SubmitJob';
import Dashboard from './pages/Dashboard';
import Providers from './pages/Providers';


// ── Wallet Modal Styling (Pop-in Animation) ──────────────────────────────────
function ModalStyles() {
  return (
    <style>{`
      @keyframes modalPop {
        0% { transform: scale(0.9) translateY(20px); opacity: 0; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
      }
      .modal-card-animate {
        animation: modalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
    `}</style>
  );
}

// ── Wallet Modal Component ────────────────────────────────────────────────────
function WalletModal({ onClose, onConnected }) {
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [accountId, setAccountId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const providers = [
    { id: 'HashPack', name: 'HashPack', icon: '🐺', desc: 'Leading Hedera Native Wallet' },
    { id: 'Blade', name: 'Blade Wallet', icon: '⚔️', desc: 'Secure Enterprise Wallet' },
    { id: 'MetaMask', name: 'MetaMask', icon: '🦊', desc: 'Hedera Web3 RPC Connector' },
  ];

  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider.id);
    setStep(2);
  };

  const handleConnect = async () => {
    if (!accountId) {
      setError('Account ID is required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/wallet/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, providerName: selectedProvider })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onConnected(data.wallet);
        onClose();
      } else {
        setError(data.error || 'Connection failed.');
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(12px)', padding: '20px' }}>
      <ModalStyles />
      <div className="card modal-card-animate" style={{ 
        background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 'var(--radius-lg)', 
        padding: '36px', width: '420px', maxWidth: '100%', position: 'relative', 
        boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 50px rgba(0, 229, 255, 0.15)',
        margin: 'auto'
      }}>
        {step === 1 && (
          <>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', marginBottom: '8px', letterSpacing: '-0.02em', textAlign: 'center' }}>Connect a Wallet</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '24px', lineHeight: 1.5, textAlign: 'center' }}>
              Select your preferred Web3 provider to interact with the Hedera network.
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {providers.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProvider(p)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px', width: '100%', padding: '16px 20px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <span style={{ fontSize: '1.8rem' }}>{p.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', marginBottom: '2px' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onClose}>Cancel</button>
          </>
        )}

        {step === 2 && (
          <>
            <button onClick={() => { setStep(1); setError(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', padding: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              ← <span style={{ textDecoration: 'underline' }}>Back</span>
            </button>
            <div style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '8px', letterSpacing: '-0.02em' }}>Link {selectedProvider}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '28px', lineHeight: 1.5 }}>
              Enter your Hedera Testnet Account ID. (Simulation Mode: No private key required).
            </div>
            
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontSize: '0.75rem', opacity: 0.8 }}>Account ID</label>
              <input className="form-input" placeholder="0.0.XXXXXX" value={accountId} onChange={e => setAccountId(e.target.value)} style={{ padding: '14px', fontSize: '1.1rem', fontFamily: 'var(--font-mono)' }} autoFocus />
            </div>

            {error && (
              <div style={{ padding: '14px', background: 'rgba(255, 69, 96, 0.12)', border: '1px solid var(--red)', borderRadius: '12px', color: 'var(--red)', fontSize: '0.82rem', marginBottom: '20px', fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', padding: '16px', fontWeight: 900, fontSize: '0.95rem', marginBottom: '16px' }} onClick={handleConnect} disabled={loading || !accountId}>
              {loading ? 'Connecting...' : '🔗 Authorize Header Connection'}
            </button>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', opacity: 0.6 }}>
              💡 Starting mock balance: 5,000 COMPUTE.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Nav() {
  const [wallet, setWallet] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkWallet = async () => {
      try {
        const res = await fetch(`${API_BASE}/wallet`);
        const data = await res.json();
        if (data.connected) {
          setWallet(data);
        } else {
          setWallet(null);
        }
      } catch (err) {
        console.error('Wallet fetch error:', err);
      }
    };

    checkWallet();
    const iv = setInterval(checkWallet, 3000);
    return () => clearInterval(iv);
  }, []);

  const handleDisconnect = async () => {
    try {
      await fetch(`${API_BASE}/wallet/disconnect`, { method: 'POST' });
      setWallet(null);
    } catch (err) {
      console.error('Disconnect error:', err);
    }
  };

  return (
    <nav className="global-nav">
      <div className="nav-container" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(200px, 280px) 1fr minmax(200px, 280px)', 
        alignItems: 'center',
        padding: '0 20px' 
      }}>
        <NavLink to="/" className="nav-brand" style={{ transition: 'transform 0.3s ease' }}>
          <span className="nav-brand-text" style={{ fontSize: '1.55rem' }}>AI Marketplace</span>
        </NavLink>
        
        <div className="nav-links" style={{ justifyContent: 'center', gap: '12px' }}>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} style={{ fontSize: '0.85rem', fontWeight: 900 }}>Protocol</NavLink>
          <NavLink to="/providers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} style={{ fontSize: '0.85rem', fontWeight: 900 }}>Providers</NavLink>
          <NavLink to="/submit" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} style={{ fontSize: '0.85rem', fontWeight: 900 }}>Execution</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} style={{ fontSize: '0.85rem', fontWeight: 900 }}>Terminal</NavLink>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          {!wallet ? (
            <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '8px 18px', fontWeight: 900 }} onClick={() => setShowModal(true)}>
              💳 Connect Wallet
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '6px 16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 800 }}>
                  {wallet.balanceTokens - wallet.allocatedTokens} COMPUTE
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600, opacity: 0.8 }}>
                  {wallet.providerName} • {wallet.accountId}
                </div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)', animation: 'pulse 2s infinite' }} />
              <button 
                onClick={handleDisconnect}
                style={{ 
                  fontSize: '0.65rem', padding: '4px 10px', background: 'rgba(255, 69, 96, 0.15)', border: '1px solid var(--red)', 
                  color: 'var(--red)', cursor: 'pointer', borderRadius: '6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' 
                }}
              >
                Exit
              </button>
            </div>
          )}
        </div>
      </div>
      {showModal && <WalletModal onClose={() => setShowModal(false)} onConnected={w => setWallet(w)} />}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Nav />
        <main className="page-content">
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/submit"    element={<SubmitJob />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
