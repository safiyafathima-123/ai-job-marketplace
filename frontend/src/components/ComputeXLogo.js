import React, { useEffect, useState } from 'react';

/**
 * ComputeXLogo - "The Professional Market Stock" Edition
 * 
 * Features:
 * - Real-time "Data Stream" ticker tape
 * - Dynamic "Volatility" waves (SVG animate)
 * - Scanning laser lines
 * - High-speed technical readouts
 * - Premium Glassmorphism & Motion Blur effects
 */
const ComputeXLogo = ({ size = 520 }) => {
  const [ticker, setTicker] = useState("SYNCING_NETWORK...");
  
  // Professional Technical Metadata Loop
  useEffect(() => {
    const messages = [
      "HEDERA_CONSENSUS_REACHED",
      "EXECUTING_SMART_CONTRACT_0.0.512",
      "NODE_STABILITY: 99.99%",
      "OPTIMIZING_MATCH_ALGORITHM",
      "PAYMENT_ESCORW_LOCKED",
      "AI_AGENT_ORCHESTRATION_ACTIVE"
    ];
    let i = 0;
    const interval = setInterval(() => {
      setTicker(messages[i]);
      i = (i + 1) % messages.length;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="stock-logo-container" style={{ width: size, height: size * 0.7 }}>
      <svg
        viewBox="0 0 750 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="stock-svg"
      >
        <defs>
          <linearGradient id="cyber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="50%" stopColor="#7000FF" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>

          <filter id="stock-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
             <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0,229,255,0.05)" strokeWidth="0.5"/>
          </pattern>
        </defs>

        {/* ── Background Data Grid ── */}
        <rect width="750" height="300" fill="url(#grid)" />
        
        {/* ── Scanning Lines (Professional Ticker Feel) ── */}
        <g className="scanners">
           <rect x="0" y="0" width="750" height="1" fill="#00E5FF" opacity="0.2" className="scan-line-1" />
           <rect x="0" y="0" width="750" height="1" fill="#7000FF" opacity="0.2" className="scan-line-2" />
        </g>

        {/* ── Orbital Data Nodes ── */}
        <g className="data-orbits" opacity="0.6">
           <ellipse cx="200" cy="150" rx="160" ry="60" stroke="#00E5FF" strokeWidth="0.5" strokeDasharray="4 8" className="data-ring" />
           <circle r="3" fill="#00E5FF" className="node-p">
              <animateMotion dur="10s" repeatCount="indefinite" path="M200,90 A160,60 0 1,1 200,210 A160,60 0 1,1 200,90" />
           </circle>
        </g>

        {/* ── The Cyber X Symbol ── */}
        <g className="cyber-x" filter="url(#stock-glow)">
          {/* Main Frame */}
          <path d="M120 70 L280 230 M280 70 L120 230" stroke="url(#cyber-grad)" strokeWidth="18" strokeLinecap="round" className="x-glow-path" />
          
          {/* Internal Circuit Details */}
          <path d="M140 90 L200 150 M260 90 L200 150" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" className="energy-pulse" />
          <path d="M140 210 L200 150 M260 210 L200 150" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" className="energy-pulse-delay" />

          {/* Core Processor Light */}
          <rect x="188" y="138" width="24" height="24" rx="4" fill="#FFFFFF" className="core-light" />
        </g>

        {/* ── Market Readouts ── */}
        <g className="readouts">
          {/* Ticker Text */}
          <text x="310" y="145" className="market-title">
            Compute
            <tspan fill="url(#cyber-grad)" className="pulsing-x">X</tspan>
          </text>
          
          {/* Real-time Status Readout */}
          <text x="310" y="170" className="market-ticker">
            {"> "} {ticker}
          </text>

          {/* Mini Data Bars (Animated like stock volume) */}
          <g transform="translate(310, 195)">
             {[...Array(16)].map((_, i) => (
               <rect key={i} x={i * 8} y="0" width="4" height="2" fill="#00E5FF" opacity="0.3" className={`data-bar bar-${i}`}>
                 <animate attributeName="height" values="2;15;4;20;8;2" dur={`${1 + Math.random()}s`} repeatCount="indefinite" />
                 <animate attributeName="y" values="0;-15;-4;-20;-8;0" dur={`${1 + Math.random()}s`} repeatCount="indefinite" />
               </rect>
             ))}
          </g>

          {/* Technical Label */}
          <text x="310" y="225" className="technical-label">
            SYS_HASH: #00FF32X // TPS_VERIFIED: 10,000+
          </text>
        </g>
      </svg>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;900&family=JetBrains+Mono:wght@400;700&display=swap');

        .stock-logo-container {
          background: rgba(0,0,0,0.3);
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(10px);
          box-shadow: 0 40px 100px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,229,255,0.05);
          overflow: hidden;
          padding: 20px;
          display: flex; align-items: center; justify-content: center;
          animation: logoBreathe 6s ease-in-out infinite;
          will-change: transform;
        }

        @keyframes logoBreathe {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.02) translateY(-10px); }
        }

        .market-title {
          font-family: 'Orbitron', sans-serif;
          font-weight: 900;
          font-size: 58px;
          fill: #fff;
          letter-spacing: -2px;
          filter: drop-shadow(0 0 10px rgba(255,255,255,0.15));
          will-change: filter;
        }

        .market-ticker {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          fill: #00E5FF;
          font-weight: 700;
          letter-spacing: 1px;
          animation: tickerFade 0.5s ease-in-out;
        }

        .technical-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          fill: #64748b;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .scan-line-1 { animation: scanDown 4s linear infinite; }
        .scan-line-2 { animation: scanDown 6s linear infinite reverse; }
        @keyframes scanDown {
          from { transform: translateY(0); opacity: 0; }
          50% { opacity: 0.3; }
          to { transform: translateY(300px); opacity: 0; }
        }

        .core-light {
          animation: corePhase 2s ease-in-out infinite;
          transform-origin: 200px 150px;
        }
        @keyframes corePhase {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 5px #fff); }
          50% { filter: brightness(2) drop-shadow(0 0 25px #00E5FF); transform: scale(1.2); }
        }

        .energy-pulse { animation: energyFlow 3s ease-in-out infinite; }
        .energy-pulse-delay { animation: energyFlow 3s ease-in-out infinite 1.5s; }
        @keyframes energyFlow {
          0%, 100% { opacity: 0.2; stroke-width: 1; }
          50% { opacity: 1; stroke-width: 4; stroke: #00E5FF; }
        }

        .pulsing-x { animation: xPulse 2s ease-in-out infinite; }
        @keyframes xPulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.5) drop-shadow(0 0 10px #00E5FF); }
        }
      `}</style>
    </div>
  );
};

export default ComputeXLogo;
