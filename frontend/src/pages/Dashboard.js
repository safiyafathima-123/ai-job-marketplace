import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchJobs, fetchJob, simulateJobFailure } from '../services/api';

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{ fontSize:'0.72rem', fontWeight:900, color:'var(--text-muted)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:12, opacity:0.8 }}>
      {children}
    </div>
  );
}

function MiniClock() {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  
  useEffect(() => {
    const iv = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const seconds = new Date().getSeconds();
  const secondDeg = (seconds / 60) * 360;
  
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'var(--accent)', padding:'7px 18px', borderRadius:'30px', border:'1px solid var(--accent)', boxShadow:'0 8px 24px rgba(0,229,255,0.4)', backdropFilter:'blur(12px)' }}>
      <div style={{ width:18, height:18, borderRadius:'50%', border:'2px solid #000', position:'relative' }}>
        <div style={{ position:'absolute', top:'50%', left:'50%', width:'2px', height:7, background:'#000', transformOrigin:'bottom', transform:`translate(-50%, -100%) rotate(${secondDeg}deg)`, transition:'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', width:'2px', height:5, background:'rgba(0,0,0,0.6)', transformOrigin:'bottom', transform:`translate(-50%, -100%) rotate(120deg)` }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', width:'4px', height:4, background:'#000', borderRadius:'50%', transform:'translate(-50%, -50%)' }} />
      </div>
      <span className="mono" style={{ fontSize:'0.9rem', color:'#000', fontWeight:900, letterSpacing:'0.02em' }}>{time}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { pending:'○ Pending', matching:'◈ Matching', running:'▶ Running', distributed:'⚡ Distributed', completed:'✓ Completed', failed:'✗ Failed' };
  return <span className={`badge badge-${status === 'distributed' ? 'running' : status}`}>{map[status] || status}</span>;
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

// ── Execution Flow (Epic Masterpiece UI) ────────────────────────────────────
function HowItWorks() {
  const [hoveredIdx, setHoveredIdx] = React.useState(null);
  
  const steps = [
    { n:1, icon:'📋', label:'User submits AI job',          color:'#3b82f6', info:'Job parameters, budget, and requirements are encrypted and broadcast to the p2p network.' },
    { n:2, icon:'🤖', label:'Agent finds best provider',    color:'#a855f7', info:'Autonomous Selector Agents analyze reputation, price, and latency to find the perfect compute node.' },
    { n:3, icon:'⚙️', label:'Job executes on resource',    color:'#f59e0b', info:'The workload runs in an isolated TEE or container on the provider\'s hardware.' },
    { n:4, icon:'✔',  label:'Proof of Useful Work',         color:'#10b981', info:'Results are validated by a network of Validator Agents to ensure cryptographic correctness.' },
    { n:5, icon:'⛓️', label:'Payment settles on Hedera',   color:'#06b6d4', info:'Smart contracts release escrowed HBAR/COMPUTE tokens once validation is finalized.' },
  ];
  return (
    <div className="card" style={{ padding:'28px', position:'relative', zIndex:1, overflow:'visible' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'radial-gradient(circle at top left, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ fontSize:'0.85rem', fontWeight:900, background:'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'0.15em', marginBottom:24, textTransform:'uppercase', filter:'drop-shadow(0 0 12px rgba(255,255,255,0.1))' }}>Execution Flow</div>
        
        <div style={{ display:'flex', flexDirection:'column', gap:0, position:'relative' }}>
          
          {/* Continuous Glowing Neon Spine */}
          <div style={{ position:'absolute', top:20, bottom:20, left:19, width:2, background:'linear-gradient(180deg, #3b82f6 0%, #a855f7 25%, #f59e0b 50%, #10b981 75%, #06b6d4 100%)', zIndex:0, opacity:0.6, filter:'drop-shadow(0 0 4px rgba(255,255,255,0.3))' }} />

          {steps.map((s, i) => (
            <div 
              key={s.n} 
              style={{ display:'flex', gap:20, position:'relative', padding:'16px 0', alignItems:'center', cursor:'pointer', transition:'all 0.3s' }} 
              onMouseEnter={() => setHoveredIdx(i)} 
              onMouseLeave={() => setHoveredIdx(null)}
            >
              
              {/* Deep Glass Node Icon */}
              <div style={{ width:40, height:40, borderRadius:'50%', background:`linear-gradient(135deg, ${s.color}33, ${s.color}11)`, border:`1px solid ${s.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', zIndex:2, flexShrink:0, boxShadow:`0 0 20px ${s.color}44, inset 0 0 12px ${s.color}22`, backdropFilter:'blur(4px)', transform: hoveredIdx===i ? 'scale(1.15) rotate(5deg)' : 'scale(1)', transition:'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                <span style={{ filter:`drop-shadow(0 0 8px ${s.color})` }}>{s.icon}</span>
              </div>
              
              <div style={{ flex:1, position:'relative' }}>
                <div style={{ fontSize:'0.65rem', color:s.color, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:4 }}>Phase 0{s.n}</div>
                <div style={{ fontSize:'0.9rem', color:'var(--text-primary)', fontWeight:600, letterSpacing:'-0.01em', textShadow:'0 2px 4px rgba(0,0,0,0.5)', opacity: hoveredIdx!==null && hoveredIdx!==i ? 0.3 : 1, transition:'opacity 0.3s' }}>{s.label}</div>

                {/* Floating Detail Mini-Page */}
                {hoveredIdx === i && (
                  <div style={{ 
                    position:'absolute', 
                    top: i === 4 ? 'auto' : '100%', 
                    bottom: i === 4 ? '100%' : 'auto',
                    left:0, width:'240px', background:'rgba(10, 11, 18, 0.95)', border:`1px solid ${s.color}`, borderRadius:'12px', padding:'12px', zIndex:10, 
                    marginTop: i === 4 ? 0 : 10,
                    marginBottom: i === 4 ? 10 : 0,
                    boxShadow:`0 10px 30px rgba(0,0,0,0.8), 0 0 15px ${s.color}44`, backdropFilter:'blur(20px)', 
                    animation: i === 4 ? 'fadeInUp 0.3s ease-out forwards' : 'fadeInDown 0.3s ease-out forwards', 
                    pointerEvents:'none'
                  }}>
                    <div style={{ fontSize:'0.6rem', color:s.color, fontWeight:900, letterSpacing:'0.1em', marginBottom:4 }}>DETAILED PROTOCOL</div>
                    <div style={{ fontSize:'0.75rem', color:'#f1f5f9', lineHeight:1.4, fontWeight:500 }}>{s.info}</div>
                    <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:4 }}>
                      <div style={{ width:4, height:4, borderRadius:'50%', background:s.color }} />
                      <div style={{ fontSize:'0.6rem', color:s.color, fontWeight:700 }}>VERIFIED ON HEDERA</div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Powered by Hedera sidebar (Interactive Network Infrastructure) ────────────
function PoweredByHedera() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ fontSize:'0.85rem', fontWeight:900, background:'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'0.15em', marginBottom:8, textTransform:'uppercase', filter:'drop-shadow(0 0 12px rgba(255,255,255,0.1))' }}>Network Infrastructure</div>
      
      <a href="https://hedera.com/consensus-service" target="_blank" rel="noopener noreferrer" className="card network-card" style={{ padding:'20px', display:'flex', alignItems:'center', gap:16, background:'linear-gradient(135deg, rgba(56,189,248,0.04) 0%, transparent 100%)', textDecoration:'none', cursor:'pointer' }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg, #0284c7, #38bdf8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', fontWeight:800, color:'#fff', filter:'drop-shadow(0 0 8px #38bdf8)', flexShrink:0 }}>Ħ</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight:800, fontSize:'0.9rem', color:'#38bdf8', marginBottom:2 }}>Hedera HCS</div>
          <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Consensus logs & PoUW</div>
        </div>
        <div style={{ fontSize:'0.9rem', color:'var(--border-bright)' }}>↗</div>
      </a>
      
      <a href="https://hedera.com/token-service" target="_blank" rel="noopener noreferrer" className="card network-card" style={{ padding:'20px', display:'flex', alignItems:'center', gap:16, background:'linear-gradient(135deg, rgba(251,191,36,0.04) 0%, transparent 100%)', textDecoration:'none', cursor:'pointer' }}>
        <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg, #f59e0b, #fbbf24)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', fontWeight:800, color:'#000', filter:'drop-shadow(0 0 8px #f59e0b)', flexShrink:0 }}>C</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight:800, fontSize:'0.9rem', color:'#fbbf24', marginBottom:2 }}>Hedera HTS</div>
          <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>COMPUTE Token payments</div>
        </div>
        <div style={{ fontSize:'0.9rem', color:'var(--border-bright)' }}>↗</div>
      </a>
      
      <a href="https://hedera.com/smart-contract" target="_blank" rel="noopener noreferrer" className="card network-card" style={{ padding:'20px', display:'flex', alignItems:'center', gap:16, background:'linear-gradient(135deg, rgba(167,139,250,0.04) 0%, transparent 100%)', textDecoration:'none', cursor:'pointer' }}>
        <div style={{ width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <span style={{ fontSize:'1.8rem', lineHeight:1, filter:'drop-shadow(0 0 10px #c084fc)' }}>📜</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight:800, fontSize:'0.9rem', color:'#c084fc', marginBottom:2 }}>Smart Contract</div>
          <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Escrow & settlement</div>
        </div>
        <div style={{ fontSize:'0.9rem', color:'var(--border-bright)' }}>↗</div>
      </a>
    </div>
  );
}

// ── Agent Pipeline ────────────────────────────────────────────────────────────
function AgentPipeline({ job }) {
  const baseAgents = [
    { label:'Buyer Agent',    desc:'Job Created',       activeFrom:0  },
    { label:'Selector Agent', desc:'Provider Selected', activeFrom:20 },
    { label:'Provider Agent', desc:'Executing Task',    activeFrom:30 },
    { label:'Validator Agent',desc:'Verifying Output',  activeFrom:90 },
  ];

  // Insert Orchestrator step for distributed jobs
  const agents = job.isDistributed ? [
    { label:'Buyer Agent',       desc:'Job Created',          activeFrom:0  },
    { label:'Selector Agent',    desc:'Provider Scored',      activeFrom:15 },
    { label:'Orchestrator',      desc:'Sub-tasks Dispatched', activeFrom:20, color:'#f472b6' },
    { label:'Provider Agents',   desc:'Parallel Execution',   activeFrom:30 },
    { label:'Validator Agent',   desc:'Verifying Output',     activeFrom:90 },
  ] : baseAgents;

  return (
    <div style={{ display:'flex', gap:0 }}>
      {agents.map((agent, i) => {
        const done   = job.progress >= agent.activeFrom && (job.progress > agent.activeFrom || job.status==='completed');
        const active = job.progress >= agent.activeFrom && job.progress < (agents[i+1]?.activeFrom || 101) && job.status !== 'failed';
        const failed = job.status === 'failed' && active;
        const baseColor = agent.color || null;
        const color  = failed ? 'var(--red)' : baseColor && (done || active) ? baseColor : done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--text-muted)';
        return (
          <div key={agent.label} style={{ flex:1, position:'relative' }}>
            {i < agents.length-1 && (
              <div style={{ position:'absolute', top:13, left:'50%', right:'-50%', height:2, background: done ? (baseColor || 'var(--green)') : 'var(--border)', zIndex:0, transition:'background 400ms' }} />
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
  // Hide for distributed jobs — they show DistributedProviderPanel instead
  if (!job.selectedProvider || job.isDistributed) return null;
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
    line.includes('Orchestrator Agent') ? '#f472b6'      :
    line.includes('Buyer Agent')        ? 'var(--amber)'  :
    line.includes('Selector Agent')     ? 'var(--accent)' :
    line.includes('Provider Agent')     ? 'var(--green)'  :
    line.includes('Validator Agent')    ? '#c084fc'       :
    line.includes('Hedera')             ? 'var(--accent)' :
    line.includes('✅') || line.includes('🔗') ? 'var(--green)' : 'var(--text-secondary)';
  return (
    <div style={{ marginBottom:12 }}>
      <SectionLabel>Agent Activity Log</SectionLabel>
      <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'10px 12px', maxHeight:160, overflowY:'auto', scrollbarWidth:'thin', scrollbarColor:'var(--border) transparent' }}>
        {[...logs].reverse().map((item, i) => {
          const line = typeof item === 'string' ? item : item.message || JSON.stringify(item);
          return (
            <div key={i} className="mono" style={{ fontSize:'0.68rem', color:agentColor(line), marginBottom:4, lineHeight:1.5 }}>{line}</div>
          );
        })}
      </div>
    </div>
  );
}

// ── Distributed Provider Panel ─────────────────────────────────────────────────
function DistributedProviderPanel({ job }) {
  if (!job.isDistributed || !job.subTasks?.length) return null;
  const statusColor = s => s === 'completed' ? 'var(--green)' : s === 'failed' ? 'var(--red)' : s === 'running' ? 'var(--accent)' : 'var(--amber)';
  const statusIcon  = s => s === 'completed' ? '✓' : s === 'failed' ? '✗' : s === 'running' ? '▶' : '◈';

  return (
    <div style={{ background:'var(--bg)', border:'1px solid rgba(167,139,250,0.4)', borderRadius:'var(--radius)', padding:'14px 16px', marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <SectionLabel>⚡ Distributed Execution — {job.subTasks.length} Parallel Sub-tasks</SectionLabel>
        <span style={{ fontSize:'0.65rem', fontWeight:800, padding:'3px 10px', borderRadius:99, background:'rgba(167,139,250,0.15)', color:'#a78bfa', border:'1px solid rgba(167,139,250,0.3)' }}>
          ORCHESTRATOR AGENT
        </span>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {job.subTasks.map((st, i) => {
          const sc = statusColor(st.status);
          const si = statusIcon(st.status);
          return (
            <div key={i} style={{
              padding:'12px 14px', borderRadius:12,
              background: st.status === 'completed' ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
              border:`1px solid ${sc}44`, transition:'all 400ms ease'
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:sc, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.62rem', fontWeight:800, color:'#000', flexShrink:0 }}>
                    {si}
                  </div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:'0.82rem', color:'#fff' }}>{st.label}</div>
                    <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:1 }}>
                      {st.providerName} <span style={{ color: st.providerTier === 'premium' ? '#f59e0b' : 'var(--text-muted)', fontWeight:700 }}>· {st.providerTier}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:'0.62rem', fontWeight:900, color:sc, letterSpacing:'0.06em' }}>
                    {(st.status || 'PENDING').toUpperCase()}
                  </div>
                  {st.providerScore && (
                    <div style={{ fontSize:'0.6rem', color:'var(--text-muted)' }}>Score: {st.providerScore}</div>
                  )}
                </div>
              </div>

              {/* Sub-task progress bar */}
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:'0.6rem', color:'var(--text-muted)' }}>Sub-task progress</span>
                <span className="mono" style={{ fontSize:'0.6rem', color:sc }}>{st.progress || 0}%</span>
              </div>
              <div style={{ height:6, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:99, width:`${st.progress || 0}%`, background: st.status === 'completed' ? 'var(--green)' : st.status === 'failed' ? 'var(--red)' : 'linear-gradient(90deg,#a78bfa,#7c3aed)', transition:'width 500ms ease' }} />
              </div>

              {st.contractId && (
                <div className="mono" style={{ marginTop:6, fontSize:'0.58rem', color:'var(--text-muted)' }}>
                  Contract: {st.contractId}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      {job.distributedProviders && (
        <div style={{ marginTop:12, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Providers:</span>
          {job.distributedProviders.map((name, i) => (
            <span key={i} style={{ fontSize:'0.68rem', color:'var(--accent)', fontWeight:700 }}>{name}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function PricingIntelligence({ job }) {
  if (!job.pricingAnalysis && !job.pricingLog) return null;
  
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionLabel>🤖 Pricing Intelligence</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        
        {/* Analysis at Submission */}
        {job.pricingAnalysis && (
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Market Context (Submission)</div>
              {(() => {
                const color = job.pricingAnalysis.demandLevel === 'high' ? 'var(--red)' : job.pricingAnalysis.demandLevel === 'low' ? 'var(--green)' : 'var(--amber)';
                return <span style={{ fontSize: '0.65rem', fontWeight: 900, color }}>{job.pricingAnalysis.demandLevel?.toUpperCase()} DEMAND</span>;
              })()}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.4 }}>{job.pricingAnalysis.reason}</div>
          </div>
        )}

        {/* Execution Metrics (Post-Completion) */}
        {job.pricingLog && (
          <div style={{ padding: '12px 14px', borderRadius: 'var(--radius)', background: 'var(--green-dim)', border: '1px solid var(--green)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--green)', fontWeight: 800, textTransform: 'uppercase' }}>Provider Settlement Logic</div>
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--green)' }}>SETTLED</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(52, 211, 153, 0.7)', fontWeight: 700 }}>EXECUTION TIME</div>
                <div className="mono" style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 800 }}>{job.actualDurationSeconds}s</div>
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'rgba(52, 211, 153, 0.7)', fontWeight: 700 }}>PROVIDER STATUS</div>
                <div className="mono" style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 800 }}>{job.pricingLog.status?.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(52, 211, 153, 0.2)', fontSize: '0.75rem', color: '#fff', opacity: 0.9 }}>
              Automated feedback: <span style={{ fontWeight: 700 }}>Throughput recorded. Provider retained in high-priority registry.</span>
            </div>
          </div>
        )}
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
              {job.isDistributed && <span style={{ fontSize:'0.65rem', color:'#f472b6', fontWeight:700, padding:'2px 8px', borderRadius:99, background:'rgba(244,114,182,0.12)', border:'1px solid rgba(244,114,182,0.3)' }}>⚡ DISTRIBUTED</span>}
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

          {/* Provider + Resource (hidden for distributed jobs) */}
          <ProviderPanel job={job} />

          {/* Distributed Execution Panel */}
          <DistributedProviderPanel job={job} />

          {/* Pricing Intelligence */}
          <PricingIntelligence job={job} />

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

// ── Stats strip (Sidebar) ─────────────────────────────────────────────────────
function StatsStrip({ jobs }) {
  const total     = jobs.length;
  const completed = jobs.filter(j => j.status==='completed').length;
  const active    = jobs.filter(j => ['pending','matching','running','distributed'].includes(j.status)).length;
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
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:28, padding:'14px 0' }}>
        <div style={{ flex:1 }}>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle" style={{ marginTop:8, fontSize:'1.05rem', color:'var(--text-secondary)', fontWeight:500, maxWidth:'620px', lineHeight:1.6, letterSpacing:'-0.01em', opacity:0.9 }}>
            Autonomous AI agents orchestration engine. Monitoring resource allocation, cryptographic verification, and Hedera settlement in real-time.
          </p>
        </div>
        <div style={{ display:'flex', gap:20, alignItems:'center' }}>
          {lastUpdate && <MiniClock />}
          {activeCount > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--accent-dim)', padding:'8px 16px', borderRadius:'24px', border:'1px solid var(--accent-mid)', boxShadow:'0 0 20px var(--accent-dim)' }}>
              <span style={{ width:8, height:8, background:'var(--accent)', borderRadius:'50%', animation:'pulse 1.2s infinite' }} />
              <span style={{ fontSize:'0.78rem', color:'var(--accent)', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.08em' }}>{activeCount} ACTIVE AGENTS</span>
            </div>
          )}
          <Link 
            to="/submit" 
            className="btn beast-btn" 
            style={{ 
              fontSize:'1rem', padding:'16px 32px', borderRadius:16, fontWeight:900, letterSpacing:'0.05em', height:'fit-content',
              background:'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
              color: '#fff',
              textDecoration: 'none',
              transition:'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow:'0 10px 30px rgba(139, 92, 246, 0.4), inset 0 1px 1px rgba(255,255,255,0.3)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px) perspective(1000px) rotateX(10deg)';
              e.currentTarget.style.boxShadow = '0 15px 45px rgba(139, 92, 246, 0.6)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.4), inset 0 1px 1px rgba(255,255,255,0.3)';
            }}
          >
            + NEW JOB
          </Link>
        </div>
      </div>

      {/* ── NEW SIDEBAR LAYOUT ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '32px', alignItems: 'start', marginTop: 24 }}>

        {/* Left Informational Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: 100 }}>
          <StatsStrip jobs={jobs} />
          <HowItWorks />
          <PoweredByHedera />
        </div>

        {/* Right Job Explorer */}
        <div>
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
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
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
          )}
        </div>

      </div>
    </div>
  );
}