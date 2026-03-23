import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { submitJob, fetchProviders, fetchMarketSummary } from '../services/api';

const RESOURCE_CATEGORIES = [
  {
    category: 'gpu-training',
    label: '🖥️ GPU Training',
    description: 'High-performance clusters for deep learning and fine-tuning.',
    color: '#3b82f6',
    types: [{ value: 'gpu-training', label: 'GPU Model Training' }],
  },
  {
    category: 'model-inference',
    label: '⚡ AI Inference',
    description: 'Real-time predictions via distributed selector agents.',
    color: '#a855f7',
    types: [
      { value: 'image-classification', label: 'Image Classification' },
      { value: 'text-analysis',        label: 'Sentiment Analysis' },
      { value: 'summarization',        label: 'Summarization' },
      { value: 'code-generation',      label: 'Code Generation' },
    ],
  },
  {
    category: 'data-storage',
    label: '🗄️ Zero-Knowledge Storage',
    description: 'Cryptographically secure dataset and checkpoint escrow.',
    color: '#10b981',
    types: [{ value: 'data-storage', label: 'Encrypted Storage' }],
  },
];

const INITIAL_FORM = {
  title: '',
  description: '',
  jobType: '',
  budget: '',
  requiredAccuracy: '92.5',
};

function getCategoryForType(jobType) {
  for (const cat of RESOURCE_CATEGORIES) {
    if (cat.types.find(t => t.value === jobType)) return cat.category;
  }
  return null;
}

function CustomSelect({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.flatMap(o => o.types).find(t => t.value === value)?.label || 'Select Protocol...';

  return (
    <div className="custom-select-container" style={{ position: 'relative', width: '100%' }}>
      <div 
        className="custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: 'rgba(0,0,0,0.2)', height: 54, padding: '0 18px', fontSize: '1rem', 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderRadius: '12px', border: isOpen ? '1px solid var(--accent)' : '1px solid var(--border)',
          cursor: 'pointer', transition: 'all 0.3s ease', color: value ? '#fff' : 'var(--text-muted)'
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: value ? 700 : 400 }}>{selectedLabel}</span>
        <span style={{ fontSize: '0.8rem', opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>▼</span>
      </div>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setIsOpen(false)} />
          <div className="custom-select-menu" style={{ 
            position: 'absolute', top: '110%', left: 0, right: 0, 
            background: '#0f172a', border: '1px solid var(--border)', borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', zIndex: 999, overflow: 'hidden',
            animation: 'dropdownFade 0.2s ease-out'
          }}>
            {options.map(cat => (
              <div key={cat.category}>
                <div style={{ 
                  padding: '12px 18px 6px', fontSize: '0.65rem', fontWeight: 900, 
                  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' 
                }}>{cat.label}</div>
                {cat.types.map(t => (
                  <div 
                    key={t.value} 
                    className="custom-select-option"
                    onClick={() => { onChange(t.value); setIsOpen(false); }}
                    style={{ 
                      padding: '12px 18px', fontSize: '0.95rem', cursor: 'pointer', 
                      fontFamily: 'var(--font-display)', color: value === t.value ? 'var(--accent)' : '#fff',
                      background: value === t.value ? 'rgba(0,229,255,0.05)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = value === t.value ? 'rgba(0,229,255,0.05)' : 'transparent'}
                  >
                    {t.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Wallet Modal (Local Definition) ──────────────────────────────────────────
function WalletModal({ onClose, onConnected }) {
  const [accountId, setAccountId] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!accountId || !privateKey) return setError('Account ID and Private Key are required.');
    if (!/^0\.0\.\d+$/.test(accountId)) return setError('Invalid Account ID format. Use 0.0.XXXXX');
    if (privateKey.length < 10) return setError('Private Key too short.');

    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, privateKey })
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
      <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '400px', maxWidth: '92vw' }}>
        <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>💳 Connect Your Wallet</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '24px' }}>Enter your Hedera Testnet details to fund jobs with COMPUTE tokens.</div>
        
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label">Account ID</label>
          <input className="form-input" placeholder="0.0.XXXXXX" value={accountId} onChange={e => setAccountId(e.target.value)} />
        </div>
        
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label className="form-label">Private Key</label>
          <input className="form-input" type="password" placeholder="Your Hedera private key…" value={privateKey} onChange={e => setPrivateKey(e.target.value)} />
        </div>

        {error && (
          <div style={{ padding: '12px', background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: '8px', color: 'var(--red)', fontSize: '0.8rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConnect} disabled={loading}>{loading ? 'Connecting...' : '🔗 Connect Wallet'}</button>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
        </div>

        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          💡 Starting balance: 5,000 COMPUTE • 1 USD = 1,000 COMPUTE
        </div>
      </div>
    </div>
  );
}

// ── Wallet Status Panel ───────────────────────────────────────────────────────
function WalletStatusPanel({ budget }) {
  const [wallet, setWallet] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/wallet');
        const data = await res.json();
        setWallet(data.connected ? data : null);
      } catch (err) { console.error('Wallet fetch error:', err); }
    };
    check();
    const iv = setInterval(check, 2000);
    return () => clearInterval(iv);
  }, []);

  const available = wallet ? wallet.balanceTokens - wallet.allocatedTokens : 0;
  const jobCost = budget ? Math.round(parseFloat(budget) * 1000) : 0;
  const remaining = available - jobCost;
  const insufficient = jobCost > 0 && jobCost > available;

  if (!wallet) {
    return (
      <div style={{ background: 'var(--amber-dim)', border: '1px solid var(--amber)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 20 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--amber)' }}>⚠ Wallet Not Connected</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Connect your Hedera wallet to fund this job with COMPUTE tokens.</div>
        <button className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '6px 14px', marginTop: 10 }} onClick={() => setShowModal(true)}>
          💳 Connect Wallet →
        </button>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
          You can still submit a job — wallet enables COMPUTE token payments.
        </div>
        {showModal && <WalletModal onClose={() => setShowModal(false)} onConnected={() => setShowModal(false)} />}
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--green-dim)', border: '1px solid var(--green)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--green)' }}>✅ Wallet Connected</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{wallet.accountId}</div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'Available', value: available, color: 'var(--green)' },
            { label: 'Locked',    value: wallet.allocatedTokens, color: 'var(--accent)' },
            { label: 'Spent',     value: wallet.totalSpentTokens, color: 'var(--amber)' }
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: s.color }}>{s.value} COMPUTE</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      {budget && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid rgba(0,255,136,0.1)' }}>
          {insufficient ? (
            <div style={{ fontSize: '0.7rem', color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>⚠ Insufficient balance — need {jobCost - available} more COMPUTE</div>
          ) : (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              This job will use: <span style={{ color: 'var(--green)', fontWeight: 700 }}>{jobCost} COMPUTE</span> • Remaining after: {remaining} COMPUTE
            </div>
          )}
        </div>
      )}
      {showModal && <WalletModal onClose={() => setShowModal(false)} onConnected={() => setShowModal(false)} />}
    </div>
  );
}

export default function SubmitJob() {
  const navigate = useNavigate();
  const [form, setForm]           = useState(INITIAL_FORM);
  const [providers, setProviders] = useState([]);
  const [eligible, setEligible]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [hoveredCat, setHoveredCat] = useState(null);
  const [marketSummary, setMarketSummary] = useState(null);

  useEffect(() => {
    fetchProviders().then(d => setProviders(d.providers)).catch(console.error);
    fetchMarketSummary().then(setMarketSummary).catch(console.error);
  }, []);

  useEffect(() => {
    if (!form.budget || !form.jobType) { setEligible([]); return; }
    const budget = parseFloat(form.budget);
    const category = getCategoryForType(form.jobType);
    const list = providers.filter(p =>
      p.costPerTask <= budget &&
      (p.resourceType === category || p.specialties.includes(form.jobType))
    );
    setEligible(list);
  }, [form.budget, form.jobType, providers]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitJob(form);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = RESOURCE_CATEGORIES.find(c => c.types.find(t => t.value === form.jobType));

  return (
    <div style={{ position:'relative', minHeight:'100vh', paddingBottom:80 }}>
      {/* Background Ambience */}
      <div style={{ position:'fixed', inset:0, background:'radial-gradient(circle at top right, rgba(0,229,255,0.05) 0%, transparent 60%), radial-gradient(circle at bottom left, rgba(139,92,246,0.05) 0%, transparent 60%)', zIndex:0, pointerEvents:'none' }} />

      <div style={{ maxWidth:1240, margin:'0 auto', position:'relative', zIndex:1 }}>
        <WalletStatusPanel budget={form.budget} />
        
        {/* Header Section */}
        <div style={{ marginBottom:48, textAlign:'center' }}>
          <h1 className="page-title" style={{ fontSize:'5.2rem', marginBottom:0 }}>Submit AI Job</h1>
          <p className="page-subtitle" style={{ margin:'0 auto', marginTop:8 }}>
            Orchestrate autonomous agent resources in a single click. 
            Select your workload parameters and let the network handle the allocation.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 420px', gap:'48px', alignItems:'start' }}>
          
          {/* LEFT: FORM SIDE */}
          <div style={{ display:'flex', flexDirection:'column', gap:32 }}>
            
            {/* 1. Resource Selector UI */}
            <div className="card" style={{ padding:32 }}>
              <div style={{ fontSize:'0.75rem', fontWeight:900, color:'var(--text-muted)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:24 }}>01 / SELECT INFRASTRUCTURE</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16 }}>
                {RESOURCE_CATEGORIES.map(cat => {
                  const isS = selectedCategory?.category === cat.category;
                  const isH = hoveredCat === cat.category;
                  return (
                    <div
                      key={cat.category}
                      onMouseEnter={() => setHoveredCat(cat.category)}
                      onMouseLeave={() => setHoveredCat(null)}
                      onClick={() => setForm(p => ({ ...p, jobType: cat.types[0].value }))}
                      style={{
                        padding:24, borderRadius:20, cursor:'pointer', position:'relative',
                        background: isS ? `${cat.color}22` : 'rgba(255,255,255,0.02)',
                        border:`1px solid ${isS ? cat.color : isH ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`,
                        transition:'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: isH ? 'translateY(-5px)' : 'none',
                        boxShadow: isS ? `0 10px 30px ${cat.color}33, inset 0 0 12px ${cat.color}22` : 'none'
                      }}
                    >
                      <div style={{ fontSize:'1.8rem', marginBottom:12, filter: isS ? `drop-shadow(0 0 10px ${cat.color})` : 'none' }}>{cat.label.split(' ')[0]}</div>
                      <div style={{ fontSize:'1rem', fontWeight:800, color: isS ? '#fff' : 'var(--text-primary)', marginBottom:8 }}>{cat.label.split(' ').slice(1).join(' ')}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', lineHeight:1.5 }}>{cat.description}</div>
                      {isS && <div style={{ position:'absolute', top:12, right:12, width:8, height:8, borderRadius:'50%', background:cat.color, boxShadow:`0 0 10px ${cat.color}` }} />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Parameters Card */}
            <div className="card" style={{ padding:32 }}>
              <div style={{ fontSize:'0.75rem', fontWeight:900, color:'var(--text-muted)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:24 }}>02 / JOB SPECIFICATIONS</div>
              <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:28 }}>
                
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight:900, fontSize:'0.7rem' }}>PROJECT TITLE</label>
                    <input className="form-input" name="title" value={form.title} onChange={e => setForm(p=>({...p, title:e.target.value}))} placeholder="e.g. LLM Reasoning Fine-tune" required style={{ background:'rgba(0,0,0,0.2)', padding:'14px 18px', fontSize:'1rem' }} />
                  </div>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label" style={{ fontWeight:900, fontSize:'0.7rem' }}>SPECIFIC PROTOCOL</label>
                    <CustomSelect 
                      options={RESOURCE_CATEGORIES} 
                      value={form.jobType} 
                      onChange={val => setForm(p => ({ ...p, jobType: val }))} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight:900, fontSize:'0.7rem' }}>STRATEGIC CONTEXT</label>
                  <textarea className="form-textarea" name="description" value={form.description} onChange={e => setForm(p=>({...p, description:e.target.value}))} placeholder="Detailed instructions for the autonomous selector agent..." style={{ background:'rgba(0,0,0,0.2)', padding:'14px 18px', fontSize:'1rem', minHeight:100 }} />
                </div>

                {/* 🤖 Pricing Agent: Market Intelligence Box */}
                {form.jobType && marketSummary && (
                  <div style={{ 
                    padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', 
                    background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 12 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>🤖 Pricing Agent Analysis</div>
                      {(() => {
                        const cat = getCategoryForType(form.jobType);
                        const count = marketSummary.submissions?.[cat] || 0;
                        const level = count > 3 ? 'HIGH' : count < 2 ? 'LOW' : 'STABLE';
                        const color = level === 'HIGH' ? 'var(--red)' : level === 'LOW' ? 'var(--green)' : 'var(--amber)';
                        const msg = level === 'HIGH' ? 'Demand is high for this resource — prices may be elevated. Consider a higher budget.' : 
                                    level === 'LOW' ? 'Low demand detected — great time to submit! Providers are offering reduced prices.' : 
                                    'Market is stable for this resource type.';
                        return (
                          <>
                            <div style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 900, background: `${color}11`, color, border: `1px solid ${color}44` }}>
                              {level} DEMAND
                            </div>
                            <div style={{ width: '100%', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.4, marginTop: 4 }}>{msg}</div>
                          </>
                        );
                      })()}
                    </div>
                    {(() => {
                      const cat = getCategoryForType(form.jobType);
                      const minPrice = providers.filter(p => p.resourceType === cat).reduce((min, p) => p.costPerTask < min ? p.costPerTask : min, 999);
                      return minPrice !== 999 && (
                        <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#94a3b8' }}>
                          Current lowest available price: <span style={{ color: 'var(--accent)', fontWeight: 800 }}>${minPrice.toFixed(4)}</span>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'center' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight:900, fontSize:'0.7rem' }}>MAX BID ESCROW (USD)</label>
                    <input className="form-input" type="number" name="budget" value={form.budget} onChange={e => setForm(p=>({...p, budget:e.target.value}))} placeholder="0.25" step="0.001" style={{ background:'rgba(0,0,0,0.2)', padding:'14px 18px', fontSize:'1.1rem', fontWeight:800, color:'var(--green)' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight:900, fontSize:'0.7rem' }}>VERIFICATION ACCURACY: <span className="text-accent">{form.requiredAccuracy}%</span></label>
                    <input type="range" min="80" max="99" step="0.1" value={form.requiredAccuracy} onChange={e => setForm(p=>({...p, requiredAccuracy:e.target.value}))} style={{ width:'100%', accentColor:'var(--accent)', marginTop:8 }} />
                  </div>
                </div>

                {/* Heavy-job complexity badge */}
                {(() => {
                  const budget = parseFloat(form.budget) || 0;
                  const cat = getCategoryForType(form.jobType);
                  const isHeavyGpu = cat === 'gpu-training' && budget >= 0.05;
                  const isHeavyAny = budget >= 0.10;
                  if (!form.jobType || !form.budget || (!isHeavyGpu && !isHeavyAny)) return null;
                  const numProviders = isHeavyAny ? 3 : 2;
                  const reason = isHeavyGpu
                    ? `Large GPU training workload — job will be split across ${numProviders} GPU clusters for parallelised epoch computation.`
                    : `High-budget workload — distributing across ${numProviders} specialised providers for redundancy & speed.`;
                  return (
                    <div style={{
                      padding: '16px 20px', borderRadius: 16,
                      background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(124,58,237,0.08))',
                      border: '1px solid rgba(167,139,250,0.45)',
                      display: 'flex', gap: 14, alignItems: 'flex-start',
                      animation: 'fadeInUp 0.3s ease-out forwards',
                    }}>
                      <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>⚡</span>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '0.8rem', color: '#a78bfa', letterSpacing: '0.08em', marginBottom: 4 }}>
                          HEAVY JOB — AUTO-DISTRIBUTED ACROSS {numProviders} PROVIDERS
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#c4b5fd', lineHeight: 1.5 }}>
                          {reason}
                        </div>
                        <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {Array.from({ length: numProviders }, (_, i) => (
                            <span key={i} style={{ fontSize: '0.68rem', padding: '3px 10px', borderRadius: 99, background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', fontWeight: 700 }}>
                              Sub-task {i + 1}
                            </span>
                          ))}
                          <span style={{ fontSize: '0.68rem', padding: '3px 10px', borderRadius: 99, background: 'rgba(16,185,129,0.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700 }}>
                            ✓ Parallel Execution
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <button 
                  type="submit" 
                  disabled={loading || !form.title || !form.budget}
                  style={{ 
                    marginTop:12, padding:'20px 40px', borderRadius:20, fontSize:'1.1rem', fontWeight:900, border:'none', cursor:'pointer',
                    background:'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)', color:'#fff',
                    transition:'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow:'0 15px 45px rgba(139, 92, 246, 0.4)',
                    textDecoration:'none', alignSelf:'flex-start'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px) perspective(1000px) rotateX(10deg)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  {loading ? 'INITIALIZING AGENT...' : 'TRANSMIT JOB PAYLOAD →'}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: LIVE MARKETPLACE SIDE */}
          <div style={{ display:'flex', flexDirection:'column', gap:24, position:'sticky', top:120 }}>
            
            {/* Live Counter */}
            <div className="card" style={{ padding:24, textAlign:'center', background:'rgba(0,229,255,0.05)', border:'1px solid var(--accent-mid)' }}>
              <div className="mono" style={{ fontSize:'2.5rem', fontWeight:900, color:'var(--accent)' }}>{eligible.length}</div>
              <div style={{ fontSize:'0.7rem', fontWeight:900, color:'var(--text-muted)', letterSpacing:'0.1em', marginTop:4 }}>LIVE MATCHES DETECTED</div>
            </div>

            {/* Providers List */}
            <div className="card" style={{ padding:24, minHeight:300 }}>
              <div style={{ fontSize:'0.7rem', fontWeight:900, color:'var(--text-muted)', letterSpacing:'0.1em', marginBottom:20 }}>MARKETPLACE ELIGIBILITY</div>
              {eligible.length === 0 ? (
                <div style={{ color:'var(--text-muted)', fontSize:'0.85rem', textAlign:'center', marginTop:60, opacity:0.6 }}>
                   Adjust parameters to see live matching providers.
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {eligible.map((p, i) => (
                    <div key={p.id} style={{ padding:16, background:'rgba(255,255,255,0.03)', borderRadius:16, border:'1px solid var(--border)', animation:`fadeInUp 0.3s ease-out ${i*0.1}s forwards`, opacity:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <div style={{ fontWeight:800, fontSize:'0.9rem' }}>{p.name}</div>
                        <div className="mono" style={{ color:'var(--green)', fontSize:'0.8rem' }}>${p.costPerTask}</div>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'var(--text-muted)' }}>
                        <div style={{ textTransform:'uppercase' }}>{p.tier} Tier</div>
                        <div>{p.accuracy}% Correctness</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding:'0 10px', fontSize:'0.75rem', color:'var(--text-muted)', lineHeight:1.6, textAlign:'center' }}>
              Submitting a job locks HBAR in an escrow smart contract. Payment is only released upon verified agent task completion.
              <br/><br/>
              <Link to="/dashboard" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:700 }}>← Back to Dashboard</Link>
            </div>
          </div>

        </div>
      </div>
      <style>{`
        .form-select, .form-select option, .form-select optgroup {
          font-family: var(--font-display);
          background: #1e293b;
          color: #fff;
        }
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(20px); }
          to { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}