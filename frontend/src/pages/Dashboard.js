import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchJobs, fetchJob, simulateJobFailure } from '../services/api';

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{ fontSize:'0.68rem', fontWeight:800, color:'var(--text-muted)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { pending:'○ Pending', matching:'◈ Matching', running:'▶ Running', completed:'✓ Completed', failed:'✗ Failed' };
  return <span className={`badge badge-${status}`}>{map[status] || status}</span>;
}

function StarRating({ value }) {
  const stars = Math.round((value / 10) * 5 * 2) / 2; // convert 0-10 to 0-5
  return (
    <span style={{ color:'var(--amber)', fontSize:'0.78rem', letterSpacing:1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ opacity: stars >= i ? 1 : stars >= i - 0.5 ? 0.5 : 0.2 }}>★</span>
      ))}
      <span style={{ marginLeft:4, fontSize:'0.7rem', color:'var(--amber)', fontFamily:'var(--font-mono)' }}>
        {(value/10*5).toFixed(1)}
      </span>
    </span>
  );
}

function ProgressBar({ value, status }) {
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Execution Progress</span>
        <span className="mono" style={{ fontSize:'0.72rem', color: status==='completed' ? 'var(--green)' : status==='failed' ? 'var(--red)' : 'var(--accent)' }}>{value}%</span>
      </div>
      <div className="progress-track" style={{ height:8 }}>
        <div
          className={`progress-fill${status==='completed' ? ' completed' : ''}`}
          style={{ width:`${value}%`, background: status==='failed' ? 'var(--red)' : undefined }}
        />
      </div>
    </div>
  );
}

// ── How It Works banner ───────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n:1, icon:'📋', label:'User submits AI job' },
    { n:2, icon:'🤖', label:'Agent finds best provider' },
    { n:3, icon:'⚙️', label:'Job executes on resource' },
    { n:4, icon:'✔',  label:'Proof of Useful Work verified' },
    { n:5, icon:'⛓️', label:'Payment settles on Hedera' },
  ];
  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'16px 20px', marginBottom:24 }}>
      <div style={{ fontSize:'0.68rem', fontWeight:800, color:'var(--text-muted)', letterSpacing:'0.1em', marginBottom:14 }}>HOW IT WORKS</div>
      <div style={{ display:'flex', gap:0 }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ flex:1, position:'relative' }}>
            {i < steps.length - 1 && (
              <div style={{ position:'absolute', top:14, left:'60%', right:'-40%', height:1, background:'var(--border)', zIndex:0 }} />
            )}
            <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', margin:'0 auto 6px', background:'var(--bg)', border:'1px solid var(--border-bright)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem' }}>
                {s.icon}
              </div>
              <div style={{ fontSize:'0.62rem', color:'var(--text-secondary)', lineHeight:1.4, padding:'0 4px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Powered by Hedera strip ───────────────────────────────────────────────────
function PoweredByHedera() {
  const items = [
    { icon:'📝', label:'HCS', desc:'Consensus logs & Proof of Useful Work' },
    { icon:'🪙', label:'HTS', desc:'ComputeToken (COMPUTE) payments' },
    { icon:'📜', label:'Smart Contract', desc:'Escrow & milestone settlement' },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:24 }}>
      {items.map(item => (
        <div key={item.label} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'12px 14px', display:'flex', gap:10, alignItems:'flex-start' }}>
          <span style={{ fontSize:'1.1rem' }}>{item.icon}</span>
          <div>
            <div style={{ fontSize:'0.75rem', fontWeight:800, color:'var(--accent)', marginBottom:2 }}>Hedera {item.label}</div>
            <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', lineHeight:1.4 }}>{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Agent Pipeline ────────────────────────────────────────────────────────────
function AgentPipeline({ job }) {
  const agents = [
    { label:'Buyer Agent',    desc:'Job Created',       activeFrom:0  },
    { label:'Selector Agent', desc:'Provider Selected', activeFrom:20 },
    { label:'Provider Agent', desc:'Executing Task',    activeFrom:30 },
    { label:'Validator Agent',desc:'Verifying Output',  activeFrom:90 },
  ];
  return (
    <div style={{ display:'flex', gap:0 }}>
      {agents.map((agent, i) => {
        const done   = job.progress >= agent.activeFrom && (job.progress > agent.activeFrom || job.status==='completed');
        const active = job.progress >= agent.activeFrom && job.progress < (agents[i+1]?.activeFrom || 101) && job.status !== 'failed';
        const failed = job.status === 'failed' && active;
        const color  = failed ? 'var(--red)' : done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--text-muted)';
        return (
          <div key={agent.label} style={{ flex:1, position:'relative' }}>
            {i < agents.length-1 && (
              <div style={{ position:'absolute', top:13, left:'50%', right:'-50%', height:2, background: done ? 'var(--green)' : 'var(--border)', zIndex:0, transition:'background 400ms' }} />
            )}
            <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
              <div style={{ width:26, height:26, borderRadius:'50%', margin:'0 auto 6px', background:(done||active)?color:'var(--bg)', border:`2px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.68rem', fontWeight:700, color:(done||active)?'#000':color, transition:'all 400ms ease', boxShadow:active?`0 0 10px ${color}`:'none' }}>
                {done ? '✓' : i+1}
              </div>
              <div style={{ fontSize:'0.62rem', fontWeight:700, color, letterSpacing:'0.04em', lineHeight:1.3 }}>{agent.label}</div>
              <div style={{ fontSize:'0.58rem', color:'var(--text-muted)', marginTop:2 }}>{agent.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Provider Panel with reputation ────────────────────────────────────────────
function ProviderPanel({ job }) {
  if (!job.selectedProvider) return null;
  const specs = job.providerSpecs || {};
  const resourceTypeLabel = {
    'gpu-training':    'GPU Training',
    'model-inference': 'Model Inference',
    'data-storage':    'Data Storage',
  }[job.providerResourceType] || job.providerResourceType;

  // Build spec display string
  const specLines = {
    'gpu-training':    `${specs.vram || ''} VRAM | ${specs.precision || ''} | CUDA Enabled`,
    'model-inference': `${specs.modelsHosted || ''} models | Latency ${specs.latencyP99 || ''}`,
    'data-storage':    `${specs.redundancy || ''} redundancy | ${specs.encryption || ''} | Retrieval ${specs.retrievalTime || ''}`,
  };

  return (
    <div style={{ background:'var(--bg)', border:'1px solid var(--border-bright)', borderRadius:'var(--radius)', padding:'14px 16px', marginBottom:12 }}>
      <SectionLabel>Selected Provider</SectionLabel>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontWeight:800, color:'var(--accent)', fontSize:'0.95rem' }}>{job.selectedProvider}</span>
            <span style={{ fontSize:'0.65rem', padding:'2px 8px', borderRadius:99, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:700, textTransform:'uppercase' }}>{job.providerTier}</span>
          </div>
          <StarRating value={job.providerReputation * 10 / 10} />
          <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:4 }}>
            {job.providerJobsCompleted?.toLocaleString()} jobs completed · {job.providerSuccessRate}% success rate
          </div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          {[
            { l:'Reputation', v:`${job.providerReputation}/10`, c:'var(--amber)' },
            { l:'Est. Cost',  v:`$${job.estimatedCost}`,        c:'var(--green)' },
            { l:'Agent Score',v:job.providerScore,              c:'var(--accent)' },
          ].map(s => (
            <div key={s.l} style={{ textAlign:'center' }}>
              <div className="mono" style={{ fontSize:'0.95rem', fontWeight:700, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:'0.62rem', color:'var(--text-muted)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Selector Agent rationale */}
      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', background:'var(--bg-card)', borderRadius:'var(--radius)', padding:'8px 10px', marginBottom:10 }}>
        🤖 <span style={{ color:'var(--accent)' }}>Selector Agent</span> chose this provider based on: price · performance · reputation
      </div>

      {/* Resource Used section */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'10px 12px' }}>
        <div style={{ fontSize:'0.62rem', fontWeight:800, color:'var(--text-muted)', letterSpacing:'0.08em', marginBottom:6 }}>RESOURCE USED</div>
        <div style={{ fontWeight:700, fontSize:'0.82rem', color:'var(--text-primary)', marginBottom:4 }}>
          {resourceTypeLabel} ({job.selectedProvider})
        </div>
        <div className="mono" style={{ fontSize:'0.72rem', color:'var(--text-secondary)' }}>
          {specLines[job.providerResourceType] || Object.entries(specs).map(([k,v]) => `${k}: ${v}`).join(' | ')}
        </div>
      </div>
    </div>
  );
}

// ── Hedera Contract Panel ─────────────────────────────────────────────────────
function HederaContractPanel({ hedera }) {
  if (!hedera) return null;
  const { contractId, totalTokens, escrowedTokens, releasedTokens, refundedTokens,
          contractStatus, tokenSymbol, tokenName, deployTxId, network, milestones } = hedera;
  const contractColor = contractStatus==='COMPLETED' ? 'var(--green)' : contractStatus==='TERMINATED' ? 'var(--red)' : 'var(--accent)';

  return (
    <div style={{ background:'var(--bg)', border:`1px solid ${contractColor}44`, borderRadius:'var(--radius)', padding:'14px 16px', marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <SectionLabel>Hedera Smart Contract — Escrow</SectionLabel>
        <span style={{ fontSize:'0.68rem', fontWeight:700, padding:'2px 10px', borderRadius:99, background:`${contractColor}22`, color:contractColor, letterSpacing:'0.06em' }}>
          {contractStatus}
        </span>
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
        {[{ k:'Contract ID', v:contractId },{ k:'Network', v:network },{ k:'Token', v:tokenName },{ k:'Deploy TX', v:deployTxId?.slice(0,26)+'…' }].map(r => (
          <div key={r.k} style={{ background:'var(--bg-card)', borderRadius:'var(--radius)', padding:'8px 10px', flex:'1 1 140px' }}>
            <div style={{ fontSize:'0.58rem', color:'var(--text-muted)', marginBottom:3 }}>{r.k}</div>
            <div className="mono" style={{ fontSize:'0.68rem', color:'var(--text-secondary)', wordBreak:'break-all' }}>{r.v}</div>
          </div>
        ))}
      </div>

      {/* Token balance bar */}
      <div style={{ marginBottom:14 }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
          <span style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--text-muted)', letterSpacing:'0.06em' }}>TOKEN BALANCE</span>
          <span className="mono" style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{totalTokens} {tokenSymbol} total</span>
        </div>
        <div style={{ height:22, background:'var(--border)', borderRadius:99, overflow:'hidden', display:'flex' }}>
          {releasedTokens > 0 && (
            <div style={{ width:`${(releasedTokens/totalTokens)*100}%`, background:'linear-gradient(90deg,var(--green),#00cc66)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.62rem', fontWeight:700, color:'#000', transition:'width 600ms ease' }}>
              {releasedTokens > totalTokens*0.08 ? `${releasedTokens} paid` : ''}
            </div>
          )}
          {refundedTokens > 0 && (
            <div style={{ width:`${(refundedTokens/totalTokens)*100}%`, background:'var(--red)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.62rem', fontWeight:700, color:'#fff' }}>
              {refundedTokens} refunded
            </div>
          )}
          {escrowedTokens > 0 && (
            <div style={{ flex:1, background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.62rem', color:'var(--accent)' }}>
              {escrowedTokens} locked
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:20, marginTop:6 }}>
          {[{ l:'Released', v:releasedTokens, c:'var(--green)' },{ l:'In Escrow', v:escrowedTokens, c:'var(--accent)' },{ l:'Refunded', v:refundedTokens, c:'var(--red)' }].map(s => (
            <div key={s.l}>
              <span className="mono" style={{ fontSize:'0.82rem', fontWeight:700, color:s.c }}>{s.v} </span>
              <span style={{ fontSize:'0.62rem', color:'var(--text-muted)' }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      <SectionLabel>Milestone Payments</SectionLabel>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {milestones.map((ms, i) => (
          <div key={ms.id} style={{ display:'flex', alignItems:'center', gap:10, background:ms.released?'var(--green-dim)':'var(--bg-card)', border:`1px solid ${ms.released?'var(--green)':'var(--border)'}`, borderRadius:'var(--radius)', padding:'8px 12px', transition:'all 500ms ease' }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:ms.released?'var(--green)':'var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:700, color:ms.released?'#000':'var(--text-muted)', flexShrink:0 }}>
              {ms.released ? '✓' : i+1}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'0.78rem', fontWeight:700, color:ms.released?'var(--green)':'var(--text-secondary)' }}>{ms.label}</div>
              {ms.txId && <div className="mono" style={{ fontSize:'0.6rem', color:'var(--text-muted)', marginTop:2 }}>TX: {ms.txId.slice(0,34)}…</div>}
            </div>
            <div style={{ textAlign:'right' }}>
              <div className="mono" style={{ fontSize:'0.88rem', fontWeight:700, color:ms.released?'var(--green)':'var(--text-muted)' }}>
                {ms.tokens} <span style={{ fontSize:'0.62rem' }}>{tokenSymbol}</span>
              </div>
              <div style={{ fontSize:'0.62rem', color:'var(--text-muted)' }}>{ms.pct}%</div>
            </div>
          </div>
        ))}
      </div>

      {/* Terminated notice */}
      {contractStatus === 'TERMINATED' && (
        <div style={{ marginTop:12, background:'var(--red-dim)', border:'1px solid var(--red)', borderRadius:'var(--radius)', padding:'10px 12px' }}>
          <div style={{ fontSize:'0.72rem', fontWeight:700, color:'var(--red)', marginBottom:4 }}>⚠ CONTRACT TERMINATED — REFUND ISSUED</div>
          <div style={{ fontSize:'0.72rem', color:'var(--text-secondary)', marginBottom:4 }}>{hedera.terminationReason}</div>
          <div className="mono" style={{ fontSize:'0.65rem', color:'var(--red)' }}>
            {hedera.refundedTokens} {tokenSymbol} refunded · TX: {hedera.refundTxId?.slice(0,34)}…
          </div>
        </div>
      )}
    </div>
  );
}

// ── HCS On-Chain Logs ─────────────────────────────────────────────────────────
function HcsLogs({ hedera }) {
  if (!hedera?.hcsMessages?.length) return null;
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <SectionLabel>On-Chain Logs (Hedera HCS)</SectionLabel>
        <span className="mono" style={{ fontSize:'0.62rem', color:'var(--accent)', background:'var(--accent-dim)', padding:'2px 8px', borderRadius:99 }}>
          Topic: {hedera.hcsTopicId}
        </span>
      </div>

      {/* PoUW badge */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, background:'var(--green-dim)', border:'1px solid var(--green)', borderRadius:'var(--radius)', padding:'8px 12px' }}>
        <span style={{ fontSize:'0.9rem' }}>✔</span>
        <span style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--green)' }}>
          Proof of Useful Work Verified via Hedera Logs
        </span>
        <span style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginLeft:'auto' }}>
          System does not trust providers blindly — work is verified before payment settles.
        </span>
      </div>

      <div style={{
        background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius)',
        padding:'10px 12px', maxHeight:180, overflowY:'auto',
        display:'flex', flexDirection:'column', gap:6,
        scrollbarWidth:'thin',
        scrollbarColor:'var(--border-bright) transparent',
      }}>
        {[...hedera.hcsMessages].reverse().map((m, i) => (
          <div key={i} style={{ borderLeft:'2px solid var(--accent-mid)', paddingLeft:8 }}>
            <div className="mono" style={{ fontSize:'0.68rem', color:'var(--accent)', lineHeight:1.4 }}>{m.message}</div>
            <div style={{ display:'flex', gap:12, marginTop:2 }}>
              <span className="mono" style={{ fontSize:'0.58rem', color:'var(--text-muted)' }}>seq #{m.seqNum}</span>
              <span className="mono" style={{ fontSize:'0.58rem', color:'var(--text-muted)' }}>tx: {m.txId?.slice(0,24)}…</span>
              <span style={{ fontSize:'0.58rem', color:'var(--green)' }}>● {m.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Real TX Panel ─────────────────────────────────────────────────────────────
function RealTxPanel({ job }) {
  if (job.status !== 'completed') return null;
  const isReal = job.realTxStatus === 'SUCCESS';
  return (
    <div style={{ background: isReal ? '#071510' : 'var(--bg)', border:`2px solid ${isReal?'var(--green)':'var(--border-bright)'}`, borderRadius:'var(--radius)', padding:'14px 16px', marginBottom:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: isReal ? 12 : 0 }}>
        <span style={{ fontSize:'1.2rem' }}>{isReal ? '⛓️' : '🔗'}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'0.78rem', fontWeight:800, color:isReal?'var(--green)':'var(--text-secondary)', letterSpacing:'0.04em' }}>
            {isReal ? 'REAL HEDERA TRANSACTION — CONFIRMED ON TESTNET' : 'HEDERA TRANSACTION — SIMULATION MODE'}
          </div>
          <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:2 }}>
            {isReal ? 'Live on Hedera Testnet. Anyone can verify this transaction.' : 'Add credentials to .env to enable real transactions.'}
          </div>
        </div>
        <span style={{ fontSize:'0.68rem', fontWeight:700, padding:'3px 10px', borderRadius:99, background:isReal?'var(--green-dim)':'var(--border)', color:isReal?'var(--green)':'var(--text-muted)' }}>
          {isReal ? '✓ SUCCESS' : 'SIMULATED'}
        </span>
      </div>
      {isReal && (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ background:'var(--bg-card)', borderRadius:'var(--radius)', padding:'10px 12px' }}>
            <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.08em', marginBottom:4 }}>TRANSACTION ID</div>
            <div className="mono" style={{ fontSize:'0.75rem', color:'var(--green)', wordBreak:'break-all' }}>{job.realTxId}</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
            {[{ l:'Status', v:job.realTxStatus, c:'var(--green)' },{ l:'Network', v:job.realTxNetwork, c:'var(--accent)' },{ l:'Sent At', v:job.realTxSentAt?new Date(job.realTxSentAt).toLocaleTimeString():'—', c:'var(--amber)' }].map(s => (
              <div key={s.l} style={{ background:'var(--bg-card)', borderRadius:'var(--radius)', padding:'8px', textAlign:'center' }}>
                <div className="mono" style={{ fontSize:'0.78rem', fontWeight:700, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
          {job.realTxUrl && (
            <a href={job.realTxUrl} target="_blank" rel="noopener noreferrer"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'var(--green-dim)', border:'1px solid var(--green)', borderRadius:'var(--radius)', padding:'10px', color:'var(--green)', textDecoration:'none', fontSize:'0.82rem', fontWeight:700 }}>
              🔍 View on HashScan Explorer →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ── Output panels ─────────────────────────────────────────────────────────────
function GpuOutput({ o }) {
  const maxAcc = Math.max(...o.epochs.map(e => e.accuracy));
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
        {[{ l:'Final Accuracy', v:`${o.finalAccuracy}%`, c:'var(--green)' },{ l:'Final Loss', v:o.finalLoss, c:'var(--amber)' },{ l:'Training Time', v:o.trainingTime, c:'var(--accent)' }].map(s => (
          <div key={s.l} style={{ background:'var(--bg)', borderRadius:'var(--radius)', padding:'8px', textAlign:'center' }}>
            <div className="mono" style={{ fontSize:'1rem', fontWeight:700, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <SectionLabel>Training Curve</SectionLabel>
      {o.epochs.map((e, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
          <span className="mono" style={{ fontSize:'0.65rem', color:'var(--text-muted)', width:46, flexShrink:0 }}>Ep {e.epoch}</span>
          <div style={{ flex:1, background:'var(--bg)', borderRadius:99, height:12, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:99, width:`${(e.accuracy/maxAcc)*100}%`, background:'linear-gradient(90deg,var(--accent),var(--green))', transition:'width 600ms ease' }} />
          </div>
          <span className="mono" style={{ fontSize:'0.68rem', color:'var(--green)', width:42, textAlign:'right' }}>{e.accuracy}%</span>
        </div>
      ))}
      <div style={{ marginTop:8, fontSize:'0.7rem', color:'var(--text-secondary)' }}>
        Checkpoint: <span className="mono" style={{ color:'var(--accent)' }}>{o.checkpointSaved}</span>
      </div>
    </div>
  );
}

function InferenceOutput({ o }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ background:'var(--bg)', borderRadius:'var(--radius)', padding:'8px 12px' }}>
        <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.06em', marginBottom:4 }}>INPUT</div>
        <div className="mono" style={{ fontSize:'0.72rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{o.input}</div>
      </div>
      {o.predictions && (
        <div style={{ background:'var(--bg)', borderRadius:'var(--radius)', padding:'8px 12px' }}>
          <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.06em', marginBottom:8 }}>PREDICTIONS</div>
          {o.predictions.map((p, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
              <span style={{ fontSize:'0.72rem', color:'var(--text-secondary)', width:120 }}>{p.label}</span>
              <div style={{ flex:1, background:'var(--border)', borderRadius:99, height:10 }}>
                <div style={{ width:`${p.confidence}%`, height:'100%', borderRadius:99, background:i===0?'var(--green)':'var(--accent-mid)', transition:'width 600ms' }} />
              </div>
              <span className="mono" style={{ fontSize:'0.68rem', color:i===0?'var(--green)':'var(--text-muted)', width:40, textAlign:'right' }}>{p.confidence}%</span>
            </div>
          ))}
        </div>
      )}
      {o.sentiment && (
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ flex:1, background:'var(--bg)', borderRadius:'var(--radius)', padding:'8px', textAlign:'center' }}>
            <div style={{ fontSize:'0.9rem', fontWeight:800, color:o.sentiment==='POSITIVE'?'var(--green)':'var(--red)' }}>{o.sentiment}</div>
            <div style={{ fontSize:'0.6rem', color:'var(--text-muted)' }}>SENTIMENT</div>
          </div>
          <div style={{ flex:1, background:'var(--bg)', borderRadius:'var(--radius)', padding:'8px', textAlign:'center' }}>
            <div className="mono" style={{ fontSize:'0.9rem', fontWeight:700, color:'var(--green)' }}>{(o.sentimentScore*100).toFixed(0)}%</div>
            <div style={{ fontSize:'0.6rem', color:'var(--text-muted)' }}>CONFIDENCE</div>
          </div>
        </div>
      )}
      {o.output && !o.predictions && !o.sentiment && (
        <div style={{ background:'var(--bg)', borderRadius:'var(--radius)', padding:'8px 12px' }}>
          <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.06em', marginBottom:4 }}>OUTPUT</div>
          <div className="mono" style={{ fontSize:'0.72rem', color:'var(--green)', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{o.output}</div>
        </div>
      )}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
        {o.modelUsed && <span style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Model: <span className="mono" style={{ color:'var(--accent)' }}>{o.modelUsed}</span></span>}
        {o.processingTime && <span style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Latency: <span className="mono" style={{ color:'var(--green)' }}>{o.processingTime}</span></span>}
      </div>
    </div>
  );
}

function StorageOutput({ o }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
        {[{ l:'File Size', v:o.fileSize, c:'var(--accent)' },{ l:'Redundancy', v:o.redundancy, c:'var(--green)' },{ l:'Encryption', v:o.encryption, c:'var(--amber)' }].map(s => (
          <div key={s.l} style={{ background:'var(--bg)', borderRadius:'var(--radius)', padding:'8px', textAlign:'center' }}>
            <div className="mono" style={{ fontSize:'0.85rem', fontWeight:700, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', marginTop:2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'var(--bg)', borderRadius:'var(--radius)', padding:'8px 12px' }}>
        <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', fontWeight:700, letterSpacing:'0.06em', marginBottom:6 }}>STORAGE RECEIPT</div>
        {[{ k:'File', v:o.fileName },{ k:'Storage ID', v:o.storageId },{ k:'URL', v:o.retrievalUrl },{ k:'Checksum', v:o.checksumVerified?'✓ Verified':'✗ Failed' }].map(r => (
          <div key={r.k} style={{ display:'flex', gap:10, marginBottom:4 }}>
            <span style={{ fontSize:'0.68rem', color:'var(--text-muted)', width:76, flexShrink:0 }}>{r.k}</span>
            <span className="mono" style={{ fontSize:'0.68rem', color:r.k==='Checksum'?'var(--green)':'var(--text-secondary)', wordBreak:'break-all' }}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OutputPanel({ job }) {
  if (!job.output || job.status !== 'completed') return null;
  const o = job.output;
  return (
    <div style={{ background:'var(--green-dim)', border:'1px solid var(--green)', borderRadius:'var(--radius)', padding:'12px 14px', marginBottom:12 }}>
      <SectionLabel>✓ Output Result — {o.summary?.toUpperCase()}</SectionLabel>
      {o.type==='gpu-training'    && <GpuOutput       o={o} />}
      {o.type==='model-inference' && <InferenceOutput o={o} />}
      {o.type==='data-storage'    && <StorageOutput   o={o} />}
    </div>
  );
}

// ── Activity log ──────────────────────────────────────────────────────────────
function ActivityLog({ logs }) {
  if (!logs?.length) return null;
  const agentColor = line =>
    line.includes('Buyer Agent')    ? 'var(--amber)'  :
    line.includes('Selector Agent') ? 'var(--accent)' :
    line.includes('Provider Agent') ? 'var(--green)'  :
    line.includes('Validator Agent')? '#c084fc'       :
    line.includes('Hedera')         ? 'var(--accent)' :
    line.includes('✅') || line.includes('🔗') ? 'var(--green)' : 'var(--text-secondary)';
  return (
    <div style={{ marginBottom:12 }}>
      <SectionLabel>Agent Activity Log</SectionLabel>
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'10px 12px', maxHeight:160, overflowY:'auto', scrollbarWidth:'thin', scrollbarColor:'var(--border) transparent' }}>
        {[...logs].reverse().map((line, i) => (
          <div key={i} className="mono" style={{ fontSize:'0.68rem', color:agentColor(line), marginBottom:4, lineHeight:1.5 }}>{line}</div>
        ))}
      </div>
    </div>
  );
}

// ── Job Card ──────────────────────────────────────────────────────────────────
function JobCard({ job, isExpanded, onToggle, onSimulateFailure }) {
  const isActive = ['pending','matching','running'].includes(job.status);
  const resourceIcon = { 'gpu-training':'🖥️', 'model-inference':'⚡', 'data-storage':'🗄️' }[job.providerResourceType] || '🤖';
  const [failLoading, setFailLoading] = useState(false);

  const handleFail = async (e) => {
    e.stopPropagation();
    setFailLoading(true);
    await onSimulateFailure(job.id);
    setFailLoading(false);
  };

  return (
    <div className="card" style={{ borderColor:isActive?'var(--border-bright)':job.status==='failed'?'var(--red-dim)':undefined, borderWidth: job.status==='failed'?2:1 }}>
      {/* Header */}
      <div style={{ cursor:'pointer', marginBottom:16 }} onClick={onToggle}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
          <span style={{ fontSize:'1.2rem', lineHeight:1, marginTop:2 }}>{resourceIcon}</span>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontWeight:700, fontSize:'0.95rem' }}>{job.title}</span>
              <StatusBadge status={job.status} />
              {isActive && <span style={{ fontSize:'0.65rem', color:'var(--accent)', fontWeight:700, animation:'pulse 1.2s infinite' }}>● LIVE</span>}
            </div>
            <div style={{ display:'flex', gap:12, marginTop:5, flexWrap:'wrap' }}>
              <span className="mono" style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{job.jobType}</span>
              <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Budget: <span className="mono" style={{ color:'var(--text-secondary)' }}>${job.budget}</span></span>
              {job.hedera && <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Escrow: <span className="mono" style={{ color:'var(--accent)' }}>{job.hedera.totalTokens} {job.hedera.tokenSymbol}</span></span>}
              {job.selectedProvider && <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Provider: <span style={{ color:'var(--accent)' }}>{job.selectedProvider}</span></span>}
            </div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {/* Simulate Failure button — only shown while job is active */}
            {isActive && (
              <button
                onClick={handleFail}
                disabled={failLoading}
                style={{ fontSize:'0.65rem', fontWeight:700, padding:'4px 10px', borderRadius:'var(--radius)', background:'var(--red-dim)', border:'1px solid var(--red)', color:'var(--red)', cursor:'pointer', fontFamily:'var(--font-display)', opacity: failLoading ? 0.5 : 1 }}
              >
                {failLoading ? '…' : '⚠ Simulate Failure'}
              </button>
            )}
            <span style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>{isExpanded?'▲':'▼'}</span>
          </div>
        </div>
      </div>

      <ProgressBar value={job.progress} status={job.status} />

      {isExpanded && (
        <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:0 }}>
          {/* Agent Pipeline */}
          <div style={{ marginBottom:16 }}>
            <SectionLabel>Agent Pipeline</SectionLabel>
            <AgentPipeline job={job} />
          </div>

          {/* Provider + Resource */}
          <ProviderPanel job={job} />

          {/* Hedera Contract + Payments */}
          <HederaContractPanel hedera={job.hedera} />

          {/* HCS On-Chain Logs + PoUW */}
          <HcsLogs hedera={job.hedera} />

          {/* Output */}
          <OutputPanel job={job} />

          {/* Real Hedera TX */}
          <RealTxPanel job={job} />

          {/* Activity Log */}
          <ActivityLog logs={job.logs} />

          <div style={{ marginTop:8, fontSize:'0.65rem', color:'var(--text-muted)' }}>
            Created {new Date(job.createdAt).toLocaleString()}
            {job.completedAt && ` · Completed ${new Date(job.completedAt).toLocaleString()}`}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip({ jobs }) {
  const total     = jobs.length;
  const completed = jobs.filter(j => j.status==='completed').length;
  const active    = jobs.filter(j => ['pending','matching','running'].includes(j.status)).length;
  const failed    = jobs.filter(j => j.status==='failed').length;
  const tokens    = jobs.reduce((s, j) => s + (j.hedera?.releasedTokens||0), 0);
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:24 }}>
      {[
        { label:'Total Jobs',   value:total },
        { label:'Completed',    value:completed, color:'var(--green)' },
        { label:'Active',       value:active,    color:'var(--accent)' },
        { label:'Failed',       value:failed,    color:'var(--red)' },
        { label:'COMPUTE Paid', value:tokens,    color:'#c084fc' },
      ].map(s => (
        <div key={s.label} className="card" style={{ textAlign:'center', padding:'12px' }}>
          <div className="mono" style={{ fontSize:'1.2rem', fontWeight:700, color:s.color||'var(--text-primary)' }}>{s.value}</div>
          <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', marginTop:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [jobs, setJobs]         = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const { jobs: list } = await fetchJobs();
      const updated = await Promise.all(
        list.map(j => ['pending','matching','running'].includes(j.status) ? fetchJob(j.id).catch(()=>j) : j)
      );
      setJobs(updated);
      setLastUpdate(new Date());
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 2000);
    return () => clearInterval(iv);
  }, [refresh]);

  useEffect(() => {
    const active = jobs.find(j => ['pending','matching','running'].includes(j.status));
    if (active && expanded === null) setExpanded(active.id);
  }, [jobs, expanded]);

  const handleSimulateFailure = async (jobId) => {
    await simulateJobFailure(jobId);
    await refresh();
  };

  const activeCount = jobs.filter(j => ['pending','matching','running'].includes(j.status)).length;

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle" style={{ marginTop:4 }}>
            AI agents autonomously allocate resources, execute jobs, verify work, and settle payments on Hedera.
          </p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {lastUpdate && <span className="mono" style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{lastUpdate.toLocaleTimeString()}</span>}
          {activeCount > 0 && <span style={{ fontSize:'0.7rem', color:'var(--accent)', fontWeight:700 }}>● {activeCount} active</span>}
          <Link to="/submit" className="btn btn-primary" style={{ fontSize:'0.85rem', padding:'8px 16px' }}>+ New Job</Link>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ marginTop:20 }}>
        <HowItWorks />
      </div>

      {/* Powered by Hedera */}
      <PoweredByHedera />

      {jobs.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:'60px 40px' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:16 }}>🔗</div>
          <div style={{ fontWeight:700, marginBottom:8 }}>No jobs yet</div>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem', marginBottom:24 }}>
            Submit a job to see AI agents, Hedera smart contracts, escrow payments, and HCS logs in action.
          </p>
          <Link to="/submit" className="btn btn-primary">Submit a Job →</Link>
        </div>
      ) : (
        <>
          <StatsStrip jobs={jobs} />
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {jobs.map(j => (
              <JobCard
                key={j.id}
                job={j}
                isExpanded={expanded===j.id}
                onToggle={() => setExpanded(p => p===j.id ? null : j.id)}
                onSimulateFailure={handleSimulateFailure}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}