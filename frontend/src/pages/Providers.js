import React, { useState, useEffect } from 'react';
import { fetchProviders, registerProvider, fetchMarketSummary } from '../services/api';

function CustomSelect({ options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || 'Select Resource...';

  return (
    <div className="custom-select-container" style={{ position: 'relative', width: '100%' }}>
      <div 
        className="custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', padding: '14px', background: 'rgba(255,255,255,0.03)', border: isOpen ? '1px solid var(--accent)' : '1px solid var(--border)', 
          borderRadius: '12px', color: value ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', transition: 'all 0.3s ease'
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: value ? 700 : 400 }}>{selectedLabel}</span>
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
            {options.map(o => (
              <div 
                key={o.value} 
                className="custom-select-option"
                onClick={() => { onChange(o.value); setIsOpen(false); }}
                style={{ 
                  padding: '12px 18px', fontSize: '0.95rem', cursor: 'pointer', 
                  fontFamily: 'var(--font-display)', color: value === o.value ? 'var(--accent)' : '#fff',
                  background: value === o.value ? 'rgba(0,229,255,0.05)' : 'transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = value === o.value ? 'rgba(0,229,255,0.05)' : 'transparent'}
              >
                {o.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    resourceType: 'gpu-training',
    description: '',
    pricePerTask: '',
    walletAddress: ''
  });

  const loadData = async () => {
    try {
      const [pData, sData] = await Promise.all([fetchProviders(), fetchMarketSummary()]);
      setProviders(pData.providers || []);
      setSummary(sData);
    } catch (err) {
      console.error('Failed to load provider data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Gentle refresh
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await registerProvider(formData);
      setSuccess(true);
      setFormData({ name: '', resourceType: 'gpu-training', description: '', pricePerTask: '', walletAddress: '' });
      loadData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Registration failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !providers.length) return <div className="page-loading">Initializing Marketplace...</div>;

  return (
    <div className="providers-page" style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 20px' }}>
      
      {/* SECTION A: Registration Form */}
      <section className="registration-section" style={{ marginBottom: '80px' }}>
        <h1 className="page-title">Provider Registry</h1>
        <p className="page-subtitle">Onboard your hardware to the autonomous execution network.</p>

        <div className="card" style={{ marginTop: '32px', padding: '40px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Provider Entity Name</label>
              <input 
                type="text" 
                placeholder="e.g. HyperGrid-9"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
                style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff' }}
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Resource Architecture</label>
              <CustomSelect 
                value={formData.resourceType}
                onChange={val => setFormData({ ...formData, resourceType: val })}
                options={[
                  { value: 'gpu-training', label: '🖥️ GPU Training Cluster' },
                  { value: 'model-inference', label: '⚡ Model Inference Node' },
                  { value: 'data-storage', label: '🗄️ Redundant Data Storage' }
                ]}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Infrastructure Description</label>
              <textarea 
                placeholder="Describe your specs (VRAM, Models, Redundancy...)"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff', minHeight: '100px' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Base Price per Task (USD)</label>
              <input 
                type="number" 
                step="0.0001"
                placeholder="0.0050"
                value={formData.pricePerTask}
                onChange={e => setFormData({...formData, pricePerTask: e.target.value})}
                required
                style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff' }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Hedera Wallet ID</label>
              <input 
                type="text" 
                placeholder="0.0.1234567"
                value={formData.walletAddress}
                onChange={e => setFormData({...formData, walletAddress: e.target.value})}
                required
                style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px', color: '#fff' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2', marginTop: '12px' }}>
              <button 
                type="submit" 
                className="hp-btn-video-wrap" 
                disabled={submitting}
                style={{ 
                  width: '100%', border: 'none', cursor: 'pointer', height: '60px', opacity: submitting ? 0.7 : 1,
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--green) 100%)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 40px rgba(0, 229, 255, 0.3), inset 0 1px 1px rgba(255,255,255,0.4)',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 15px 50px rgba(0, 255, 136, 0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 229, 255, 0.3), inset 0 1px 1px rgba(255,255,255,0.4)';
                }}
              >
                <span className="hp-btn-video-text">{submitting ? 'Registering...' : success ? 'Successfully Registered ✅' : 'SUBMIT'}</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* SECTION B: Market Overview */}
      <section className="marketplace-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h2 className="page-title" style={{ fontSize: '2.4rem' }}>Live Marketplace</h2>
            <p className="page-subtitle">Real-time resource allocation and pricing trends.</p>
          </div>
          
          <div className="glass-pill" style={{ display: 'flex', gap: '24px', padding: '12px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Total Nodes</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff' }}>{providers.length}</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>GPU</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--accent)' }}>{providers.filter(p => p.resourceType === 'gpu-training').length}</div>
            </div>
            <div style={{ width: '1px', background: 'var(--border)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Agent Status</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--green)' }}>ACTIVE</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '32px' }}>
          {providers.map(p => {
            const earnings = (p.jobsCompleted * (p.costPerTask || 0)).toFixed(2);
            const stars = Math.round((p.reputation || 0) / 2);
            
            return (
              <div key={p.id} className="card" style={{ padding: '32px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>{p.name}</h3>
                    <div style={{ display: 'flex', gap: '4px', color: 'var(--amber)' }}>
                      {[...Array(5)].map((_, i) => <span key={i}>{i < stars ? '★' : '☆'}</span>)}
                    </div>
                  </div>
                  <div className={`status-badge ${p.jobsThisSession > 0 ? 'bg-green' : 'bg-muted'}`} style={{ 
                    padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
                    height: 'fit-content', background: p.jobsThisSession > 3 ? 'var(--red-dim)' : p.jobsThisSession > 0 ? 'var(--green-dim)' : 'rgba(255,255,255,0.05)',
                    color: p.jobsThisSession > 3 ? 'var(--red)' : p.jobsThisSession > 0 ? 'var(--green)' : '#94a3b8',
                    border: '1px solid currentColor'
                  }}>
                    {p.jobsThisSession > 3 ? 'High Demand' : p.jobsThisSession > 0 ? 'Active' : 'Idle'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Resource Type</div>
                    <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>
                      {p.resourceType === 'gpu-training' ? '🖥️ GPU CLUSTER' : p.resourceType === 'model-inference' ? '⚡ NERUAL CORE' : '🗄️ STORAGE'}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>Current Price</div>
                    <div style={{ fontSize: '1.1rem', color: 'var(--accent)', fontWeight: 900 }}>${p.costPerTask.toFixed(4)}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Total Throughput</span>
                    <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>{p.jobsCompleted} jobs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Est. Earnings</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--green)', fontWeight: 800 }}>${earnings}</span>
                  </div>
                </div>

                {/* 🤖 Pricing Agent Action */}
                <div style={{ 
                  padding: '12px', borderRadius: '10px', fontSize: '0.85rem', 
                  background: p.jobsThisSession > 3 ? 'rgba(255, 69, 96, 0.08)' : p.jobsThisSession === 0 ? 'rgba(255, 184, 0, 0.08)' : 'rgba(0, 229, 255, 0.08)',
                  color: p.jobsThisSession > 3 ? 'var(--red)' : p.jobsThisSession === 0 ? 'var(--amber)' : 'var(--accent)',
                  border: '1px solid currentColor', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <span style={{ fontSize: '1.1rem' }}>🤖</span>
                  <span style={{ fontWeight: 600 }}>
                    {p.jobsThisSession > 3 ? 'High demand detected — Prices elevated 5%' : 
                     p.jobsThisSession === 0 ? 'Idle resource — Discount applied -10%' : 
                     'Market is stable — No price change'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <style>{`
        .registration-section .page-title { margin-bottom: 0; }
        .form-group input, .form-group textarea, .form-group select {
          font-family: var(--font-display);
        }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
          outline: none;
          border-color: var(--accent) !important;
          background: rgba(0, 229, 255, 0.02) !important;
        }
        .form-group select, .form-group select option, .form-group select optgroup {
          font-family: var(--font-display);
        }
        .form-group select option {
          background: #1e293b;
          color: #fff;
        }
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Providers;
