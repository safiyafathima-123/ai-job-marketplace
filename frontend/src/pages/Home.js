import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProviders } from '../services/api';

const FEATURES = [
  { icon: '⚡', title: 'Instant Matching', desc: 'AI agent scores all providers and picks the best fit for your job in seconds.' },
  { icon: '💰', title: 'Budget-Aware', desc: 'Set your max budget. The agent only considers providers you can afford.' },
  { icon: '📊', title: 'Live Progress', desc: 'Watch your job execute in real time with milestone-by-milestone updates.' },
  { icon: '🔒', title: 'Hedera Ready', desc: 'Architecture is designed for on-chain payments and verifiable AI logs (coming soon).' },
];

export default function Home() {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    fetchProviders()
      .then(d => setProviders(d.providers.slice(0, 3)))
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '60px 0 48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--accent-dim)', border: '1px solid var(--accent-mid)',
          borderRadius: 99, padding: '4px 14px', fontSize: '0.78rem',
          fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em',
          marginBottom: 24 }}>
          ◆ DECENTRALISED AI MARKETPLACE
        </div>
        <h1 className="page-title" style={{ fontSize: '3rem', maxWidth: 600, margin: '0 auto' }}>
          Submit AI jobs.<br />
          <span className="text-accent">Agents handle the rest.</span>
        </h1>
        <p className="page-subtitle" style={{ maxWidth: 480, margin: '16px auto 32px' }}>
          Describe your task, set your budget, and let the autonomous agent
          match you with the best AI provider — automatically.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/submit" className="btn btn-primary">Submit a Job →</Link>
          <Link to="/dashboard" className="btn btn-ghost">View Dashboard</Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid-2" style={{ marginTop: 48 }}>
        {FEATURES.map(f => (
          <div key={f.title} className="card">
            <div style={{ fontSize: '1.6rem', marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{f.title}</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Provider preview */}
      {providers.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Providers</h2>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Top 3 shown</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {providers.map(p => (
              <div key={p.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginLeft: 10 }}>{p.specialties.join(', ')}</span>
                </div>
                <span className="mono" style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>${p.costPerTask}/task</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{p.accuracy}% acc.</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
