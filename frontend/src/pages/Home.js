import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProviders } from '../services/api';
import ComputeXLogo from '../components/ComputeXLogo';

/* ─── Data ────────────────────────────────────────────────────── */
const FEATURES = [
  {
    id: 'matching',
    icon: '⚡',
    title: 'Instant Matching',
    tagline: 'Zero guesswork. Optimal fit in seconds.',
    desc: 'Our AI scoring engine evaluates every registered provider against your job requirements — task type, budget ceiling, latency preference — and returns a ranked shortlist in under 10 seconds. No bidding wars. No manual searching.',
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.22)',
    grad: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(234,88,12,0.08) 100%)',
    border: 'rgba(245,158,11,0.28)',
    stat: { val: '<10s', label: 'Match Time' },
  },
  {
    id: 'budget',
    icon: '💰',
    title: 'Budget-Aware Agent',
    tagline: 'Hard caps. Zero overspend.',
    desc: 'Define a maximum spend before your job launches. The agent hard-filters providers above that ceiling before scoring begins, so you\'ll never accidentally overspend. Budget constraints are enforced at the routing layer, not after the fact.',
    accent: '#34d399',
    glow: 'rgba(52,211,153,0.22)',
    grad: 'linear-gradient(135deg, rgba(52,211,153,0.12) 0%, rgba(16,185,129,0.08) 100%)',
    border: 'rgba(52,211,153,0.28)',
    stat: { val: '100%', label: 'Budget Accuracy' },
  },
  {
    id: 'progress',
    icon: '📡',
    title: 'Live Milestone Tracking',
    tagline: 'Real-time visibility into every step.',
    desc: 'Watch your job progress through each execution phase via live milestone events. No more polling endpoints or waiting for emails. The dashboard updates as providers report status, giving you full transparency from dispatch to delivery.',
    accent: '#60a5fa',
    glow: 'rgba(96,165,250,0.22)',
    grad: 'linear-gradient(135deg, rgba(96,165,250,0.12) 0%, rgba(59,130,246,0.08) 100%)',
    border: 'rgba(96,165,250,0.28)',
    stat: { val: 'Live', label: 'Status Feed' },
  },
  {
    id: 'hedera',
    icon: '🔗',
    title: 'Hedera-Ready',
    tagline: 'Verifiable. Immutable. On-chain.',
    desc: 'Built with Hedera Hashgraph integration in mind. Job logs, provider agreements, and milestone confirmations are architected for on-chain settlement — enabling trustless AI execution and auditable payment flows as the protocol expands.',
    accent: '#a78bfa',
    glow: 'rgba(167,139,250,0.22)',
    grad: 'linear-gradient(135deg, rgba(167,139,250,0.12) 0%, rgba(139,92,246,0.08) 100%)',
    border: 'rgba(167,139,250,0.28)',
    stat: { val: 'Hedera', label: 'Settlement Layer' },
  },
];

const METRICS = [
  { val: '24/7', label: 'Agent Uptime', icon: '🟢', color: '#10b981', glow: 'rgba(16,185,129,0.4)' },
  { val: '<10s', label: 'Avg Match Time', icon: '⚡', color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  { val: '3-Tier', label: 'Scoring Logic', icon: '🧠', color: '#60a5fa', glow: 'rgba(96,165,250,0.4)' },
  { val: '∞', label: 'Concurrent Jobs', icon: '🔄', color: '#a78bfa', glow: 'rgba(167,139,250,0.4)' },
];

const BASE_FEATURES = [
  {
    icon: '🔌',
    title: 'Plug-and-play APIs',
    desc: 'Easily submit workloads via simple REST interfaces.'
  },
  {
    icon: '🛡️',
    title: 'Agentic Verification',
    desc: 'Our agent verifies task completeness before settlement.'
  },
  {
    icon: '📈',
    title: 'Scale on Demand',
    desc: 'Access massive GPU pools within seconds of matching.'
  },
  {
    icon: '🌍',
    title: 'Global Node Reach',
    desc: 'Providers sourced globally to assure high availability.'
  }
];

/* ─── Injected CSS ────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Satisfy&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .hp-root {
    font-family: 'Inter', system-ui, sans-serif;
    background: #070810;
    min-height: 100vh;
    color: #e2e8f0;
    position: relative;
    overflow-x: hidden;
    scroll-behavior: smooth;
  }
  .hp-root.launching {
    pointer-events: none;
    animation: rocketLift 1.2s cubic-bezier(0.7, 0, 0.3, 1) forwards;
    transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease;
  }
  @keyframes rocketLift {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-120vh); opacity: 0; }
  }

  /* ── Rocket Animation ── */
  .hp-rocket-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 20px;
  }
  .hp-rocket {
    font-size: 6rem;
    filter: drop-shadow(0 0 30px #a78bfa);
    animation: rocketLaunch 1.2s cubic-bezier(0.7, 0, 0.3, 1) forwards;
    position: relative;
  }
  /* Neon Trail */
  .hp-rocket::after {
    content: '';
    position: absolute;
    top: 100%; left: 50%;
    transform: translateX(-50%);
    width: 30px; height: 300px;
    background: linear-gradient(to bottom, #a78bfa, transparent);
    filter: blur(10px);
    opacity: 0.8;
  }
  @keyframes rocketLaunch {
    0% { transform: translateY(0) scale(1); }
    100% { transform: translateY(-150vh) scale(1.2); }
  }

  /* ── Ambient orbs ── */
  .hp-orb {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    filter: blur(40px);
    will-change: transform;
  }
  .hp-orb-1 {
    width: 600px; height: 600px;
    top: -200px; left: -180px;
    background: radial-gradient(circle, rgba(130,89,239,0.14) 0%, transparent 70%);
    animation: orbFloat 12s ease-in-out infinite;
  }
  .hp-orb-2 {
    width: 500px; height: 500px;
    bottom: -160px; right: -140px;
    background: radial-gradient(circle, rgba(52,211,153,0.10) 0%, transparent 70%);
    animation: orbFloat 16s ease-in-out infinite reverse;
  }
  .hp-orb-3 {
    width: 340px; height: 340px;
    top: 40%; left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%);
    animation: orbFloat 10s ease-in-out infinite 2s;
  }

  @keyframes orbFloat {
    0%, 100% { transform: translateY(0) scale(1); }
    50%       { transform: translateY(-22px) scale(1.04); }
  }
  .hp-orb-2 { animation-name: orbFloat2; }
  @keyframes orbFloat2 {
    0%, 100% { transform: translateY(0) scale(1); }
    50%       { transform: translateY(22px) scale(1.04); }
  }

  .hp-content { position: relative; z-index: 2; width: 100%; padding-top: 40px; padding-bottom: 120px; }

  .hp-wrap {
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
    padding: 0 4%;
  }

  /* ── Hero ── */
  .hp-hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 60px;
    padding: 100px 0 80px;
    animation: slideUp 0.7s cubic-bezier(.22,1,.36,1) both;
  }
  .hp-hero-content {
    text-align: left;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .hp-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(167,139,250,0.10);
    border: 1px solid rgba(167,139,250,0.22);
    color: #a78bfa;
    font-size: 0.7rem; font-weight: 800; letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 6px 18px; border-radius: 99px;
    margin-bottom: 32px;
  }
  .hp-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #a78bfa;
    animation: blink 1.6s ease-in-out infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(1.5); }
  }

  .hp-h1 {
    font-size: clamp(2.4rem, 5vw, 3.8rem);
    font-weight: 500; line-height: 1.2;
    letter-spacing: -0.03em;
    margin: 0 0 24px;
    color: #f8fafc;
  }
  .hp-h1-muted {
    font-family: 'Satisfy', cursive;
    color: #fff;
    display: block; 
    margin-bottom: 0px;
    font-size: 5.8rem; 
    text-shadow: 0 0 25px rgba(0,229,255,0.4); 
    font-weight: 400;
    line-height:1;
    letter-spacing: -0.01em;
  }
  .hp-h1-grad {
    background: linear-gradient(90deg, #a78bfa 0%, #60a5fa 40%, #34d399 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 15px rgba(96, 165, 250, 0.25); /* Subtle Neon */
  }

  .hp-sub {
    color: #f8fafc;
    font-size: 1.15rem;
    line-height: 1.8;
    max-width: 580px;
    margin: 0 0 40px 0;
    font-weight: 500;
    text-shadow: 0 0 8px rgba(56, 189, 248, 0.4), 0 0 16px rgba(56, 189, 248, 0.2);
  }

  .hp-btns { display: flex; gap: 16px; justify-content: flex-start; flex-wrap: wrap; z-index: 5; position: relative; }

  /* ── Video Button ── */
  .hp-btn-video-wrap {
    position: relative;
    display: inline-flex; align-items: center; justify-content: center;
    padding: 18px 40px; border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.25);
    text-decoration: none;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    overflow: hidden;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s, border-color 0.4s;
    z-index: 1;
  }
  .hp-btn-video-bg {
    position: absolute;
    top: -50%; left: -50%; 
    width: 200%; height: 200%;
    object-fit: cover;
    z-index: -2;
    opacity: 0.95;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s;
  }
  .hp-btn-video-wrap::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3); 
    z-index: -1;
    transition: background 0.4s;
  }
  .hp-btn-video-text {
    position: relative;
    z-index: 1;
    color: #ffffff;
    font-weight: 800;
    font-size: 1.05rem;
    text-shadow: 0 2px 10px rgba(0,0,0,0.8);
  }
  .hp-btn-video-wrap:hover .hp-btn-video-bg {
    transform: scale(1.15) translateY(-5%); /* Scale up and shift upwards */
    opacity: 1;
  }
  .hp-btn-video-wrap:hover::before {
    background: rgba(0, 0, 0, 0.15); 
  }
  .hp-btn-video-wrap:hover {
    transform: translateY(-8px) perspective(1000px) rotateX(12deg);
    border-color: rgba(255, 255, 255, 0.8);
    box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(255,255,255,0.15);
  }

  /* ── Secondary Button (Network Grid) ── */
  .hp-btn-ghost {
    position: relative;
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid rgba(255,255,255,0.15);
    color: #cbd5e1; padding: 18px 36px; border-radius: 12px;
    font-weight: 600; font-size: 1.05rem; text-decoration: none;
    background: rgba(0, 0, 0, 0.5); /* Solid base */
    overflow: hidden;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, color 0.4s;
    z-index: 1;
  }
  /* Animated Grid Layer */
  .hp-btn-ghost::before {
    content: '';
    position: absolute;
    inset: -100px; /* Space to pan */
    background-image: 
      linear-gradient(rgba(167, 139, 250, 0.15) 1px, transparent 1px),
      linear-gradient(90deg, rgba(167, 139, 250, 0.15) 1px, transparent 1px);
    background-size: 16px 16px;
    background-position: 0 0;
    z-index: -2;
    transform: perspective(300px) rotateX(60deg) scale(2);
    opacity: 0.1;
    transition: opacity 0.4s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
  }
  /* Dark tint layer to ensure text contrast */
  .hp-btn-ghost::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 120%);
    z-index: -1;
    pointer-events: none;
  }
  .hp-btn-ghost:hover::before {
    opacity: 0.8;
    transform: perspective(300px) rotateX(60deg) scale(2) translateY(30px);
  }
  .hp-btn-ghost:hover {
    transform: translateY(-8px) perspective(1000px) rotateX(10deg);
    border-color: rgba(167, 139, 250, 0.6);
    color: #ffffff;
    box-shadow: 0 15px 45px rgba(139, 92, 246, 0.3);
  }

  /* ── Hero Visual (Right Side) ── */
  .hp-hero-visual {
    position: relative;
    height: 480px;
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1000px;
  }
  .hp-hero-orb {
    width: 380px; height: 380px;
    border-radius: 50%;
    background: conic-gradient(from 180deg at 50% 50%, rgba(130,89,239,0.4) 0deg, rgba(52,211,153,0.4) 120deg, rgba(15,23,42,0) 240deg, rgba(130,89,239,0.4) 360deg);
    filter: blur(30px);
    animation: slowSpin 10s linear infinite;
    position: absolute;
    z-index: 0;
    will-change: transform;
  }
  .hp-hero-logo-wrap {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    z-index: 2;
    animation: epicFloat 8s ease-in-out infinite;
    transform-style: preserve-3d;
  }
  @keyframes epicFloat {
    0%, 100% { transform: translateY(0) rotateY(-5deg) rotateX(2deg); }
    50% { transform: translateY(-40px) rotateY(10deg) rotateX(-2deg); }
  }
  .hp-hero-floating-badge {
    position: absolute;
    top: -20px; right: -20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff;
    padding: 10px 20px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 800;
    box-shadow: 0 12px 24px rgba(16, 185, 129, 0.4);
    z-index: 3;
    animation: slowFloat 5s ease-in-out infinite reverse;
    letter-spacing: 0.05em;
  }

  @keyframes slowSpin { 100% { transform: rotate(360deg); } }
  @keyframes slowFloat { 0%, 100% { transform: translateY(0) translateZ(30px); } 50% { transform: translateY(12px) translateZ(40px); } }

  /* ── Divider ── */
  .hp-divider {
    height: 1px; margin: 0; width: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent);
  }

  /* ── Metrics strip ── */
  .hp-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    padding: 60px 0;
    perspective: 1200px;
    position: relative;
    z-index: 10;
  }
  
  .hp-metric {
    position: relative;
    background: linear-gradient(180deg, rgba(30,41,59,0.4) 0%, rgba(15,23,42,0.6) 100%);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 24px;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 16px 32px rgba(0,0,0,0.4);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s, border-color 0.4s;
    overflow: hidden;
    animation: slideUp 0.7s cubic-bezier(.22,1,.36,1) 0.2s both;
  }
  
  /* Rich colored top accent line */
  .hp-metric::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, transparent, var(--metric-color), transparent);
    opacity: 0.8;
  }

  /* Hover sweep effect from bottom */
  .hp-metric::after {
    content: '';
    position: absolute;
    bottom: -80px; left: -50%; width: 200%; height: 80px;
    background: radial-gradient(ellipse at top, var(--metric-color), transparent 70%);
    opacity: 0;
    transition: opacity 0.5s, bottom 0.5s;
    pointer-events: none;
    z-index: 0;
  }
  .hp-metric:hover::after {
    opacity: 0.15;
    bottom: 0;
  }

  .hp-metric:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 24px 48px rgba(0,0,0,0.6), 0 8px 24px var(--metric-glow);
    border-color: rgba(255,255,255,0.15);
  }

  .hp-metric-icon { 
    font-size: 2rem; 
    margin-bottom: 24px; 
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    display: flex;
    justify-content: center;
    position: relative;
    z-index: 1;
  }
  
  .hp-metric-icon-inner {
    width: 64px; height: 64px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.4s, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .hp-metric:hover .hp-metric-icon-inner {
    background: rgba(255,255,255,0.08);
    transform: scale(1.1) rotate(4deg);
  }

  .hp-metric-val {
    font-size: 2.6rem;
    font-weight: 900;
    font-family: 'Inter', system-ui, sans-serif;
    letter-spacing: -0.05em;
    color: #f8fafc;
    margin-bottom: 8px;
    text-align: center;
    position: relative;
    z-index: 1;
    text-shadow: 0 4px 12px rgba(0,0,0,0.5);
  }

  .hp-metric-label { 
    font-size: 0.85rem; 
    color: #94a3b8; 
    font-weight: 700; 
    letter-spacing: 0.12em; 
    text-transform: uppercase; 
    text-align: center;
    position: relative;
    z-index: 1;
  }

  /* ── SMOOTH ACCORDIONS STRUCTURE ── */
  .hp-accordion-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 1100px;
    margin: 40px auto 0;
  }

  .hp-section-toggle {
    display: flex; justify-content: space-between; align-items: center;
    padding: 32px 40px; border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.02);
    cursor: pointer;
    transition: border-color 0.3s ease, background 0.3s ease, transform 0.2s ease;
    user-select: none;
  }
  .hp-section-toggle:hover {
    border-color: rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.05);
  }
  .hp-section-toggle.open {
    border-color: rgba(167,139,250,0.3);
    background: rgba(167,139,250,0.05);
    border-radius: 20px 20px 0 0;
  }

  .hp-toggle-main-title {
    font-size: 1.8rem;
    font-weight: 900;
    letter-spacing: 0.05em;
    color: #f1f5f9;
    text-transform: uppercase;
  }
  .hp-toggle-sub {
    font-size: 0.95rem;
    color: #64748b;
    margin-top: 6px;
    font-weight: 500;
  }
  .hp-toggle-chevron {
    font-size: 1rem;
    color: #64748b;
    transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    display: inline-block;
  }
  .hp-section-toggle.open .hp-toggle-chevron {
    transform: rotate(180deg);
    color: #a78bfa;
  }

  /* Grid template row trick for ultra-smooth height transition */
  .hp-section-drawer {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.6s cubic-bezier(0.25, 1, 0.5, 1);
    border: 1px solid transparent;
    border-top: none;
    border-radius: 0 0 20px 20px;
    background: rgba(0, 0, 0, 0.15);
  }
  .hp-section-drawer.open {
    grid-template-rows: 1fr;
    border-color: rgba(167,139,250,0.2);
    background: rgba(0, 0, 0, 0.3);
  }

  .hp-section-drawer-inner {
    overflow: hidden;
  }
  .hp-section-drawer-content {
    padding: 40px;
    /* Opacity fade in for contents */
    opacity: 0;
    transition: opacity 0.4s ease 0.1s;
  }
  .hp-section-drawer.open .hp-section-drawer-content {
    opacity: 1;
  }

  /* ── SECTION: ABOUT US ── */
  .hp-about-text {
    font-size: 1.25rem;
    line-height: 1.8;
    color: #cbd5e1;
    font-weight: 500;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
  }
  .hp-about-highlight {
    color: #f1f5f9;
    font-weight: 700;
    text-shadow: 0 0 20px rgba(255,255,255,0.2);
  }

  /* ── SECTION: FEATURES ── */
  .hp-feat-layout {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 40px;
    align-items: start;
  }

  /* Left: Accordion list */
  .hp-feat-list { display: flex; flex-direction: column; gap: 12px; }

  .hp-feat-item {
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.02);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
  }
  .hp-feat-item.active {
    border-color: var(--feat-border);
    background: var(--feat-grad);
    box-shadow: 0 0 40px var(--feat-glow), inset 0 1px 0 rgba(255,255,255,0.1);
  }

  .hp-feat-header {
    display: flex; align-items: center; gap: 16px;
    padding: 24px;
    position: relative;
  }

  .hp-feat-icon-wrap {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; flex-shrink: 0;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    transition: background 0.3s, border-color 0.3s, transform 0.3s;
  }
  .hp-feat-item.active .hp-feat-icon-wrap {
    background: var(--feat-glow);
    border-color: var(--feat-border);
    transform: rotate(-4deg) scale(1.1);
  }

  .hp-feat-info { flex: 1; }
  .hp-feat-title {
    font-size: 1.05rem; font-weight: 700; color: #f1f5f9;
    margin-bottom: 4px; transition: color 0.2s;
  }
  .hp-feat-item.active .hp-feat-title { color: var(--feat-accent); }
  .hp-feat-tagline { font-size: 0.8rem; color: #64748b; }

  .hp-feat-arrow {
    font-size: 0.8rem; color: #475569;
    transition: transform 0.35s cubic-bezier(.22,1,.36,1), color 0.2s;
  }
  .hp-feat-item.active .hp-feat-arrow {
    transform: rotate(90deg);
    color: var(--feat-accent);
  }

  /* Dropdown body for sub-features */
  .hp-feat-body {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .hp-feat-item.active .hp-feat-body {
    grid-template-rows: 1fr;
  }
  .hp-feat-body-inner {
    overflow: hidden;
  }
  .hp-feat-desc {
    padding: 0 24px 24px 88px;
    color: #94a3b8; font-size: 0.95rem; line-height: 1.7;
    opacity: 0;
    transition: opacity 0.35s ease;
  }
  .hp-feat-item.active .hp-feat-desc {
    opacity: 1;
  }

  /* Bottom stat pill in body */
  .hp-feat-stat {
    display: inline-flex; align-items: center; gap: 10px;
    margin-top: 18px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--feat-border);
    border-radius: 99px; padding: 6px 16px;
  }
  .hp-feat-stat-val {
    font-size: 0.9rem; font-weight: 800;
    color: var(--feat-accent); font-family: monospace;
  }
  .hp-feat-stat-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

  /* Right: Big preview card */
  .hp-feat-preview {
    position: relative;
  }
  .hp-preview-card {
    border-radius: 32px;
    border: 1px solid rgba(255,255,255,0.08);
    background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
    padding: 48px;
    position: relative;
    overflow: hidden;
    min-height: 520px;
    display: flex; flex-direction: column; justify-content: space-between;
    box-shadow: 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
    backdrop-filter: blur(24px);
    transition: border-color 0.4s, box-shadow 0.4s;
  }
  .hp-preview-card.colored {
    border-color: var(--feat-border);
    box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 60px var(--feat-glow), inset 0 1px 0 rgba(255,255,255,0.1);
  }

  /* Sliding gradient overlay inside preview card */
  .hp-preview-overlay {
    position: absolute; inset: 0; border-radius: 32px;
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
  }
  .hp-preview-card.colored .hp-preview-overlay { opacity: 1; }

  /* Animated corner accent lines */
  .hp-preview-corner {
    position: absolute;
    width: 64px; height: 64px;
    pointer-events: none;
    transition: opacity 0.4s, border-color 0.4s;
  }
  .hp-preview-corner-tl {
    top: 24px; left: 24px;
    border-top: 2px solid rgba(255,255,255,0.1);
    border-left: 2px solid rgba(255,255,255,0.1);
    border-radius: 8px 0 0 0;
  }
  .hp-preview-corner-br {
    bottom: 24px; right: 24px;
    border-bottom: 2px solid rgba(255,255,255,0.1);
    border-right: 2px solid rgba(255,255,255,0.1);
    border-radius: 0 0 8px 0;
  }
  .hp-preview-card.colored .hp-preview-corner-tl,
  .hp-preview-card.colored .hp-preview-corner-br {
    border-color: var(--feat-border);
  }

  /* Shimmer sweep on card change */
  .hp-preview-shimmer {
    position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
    pointer-events: none;
    transition: none;
  }
  .hp-preview-card.shimmer .hp-preview-shimmer {
    animation: cardShimmer 0.65s ease forwards;
  }
  @keyframes cardShimmer {
    from { left: -60%; }
    to   { left: 160%; }
  }

  .hp-preview-top { position: relative; z-index: 2; }

  .hp-preview-kicker {
    font-size: 0.7rem; font-weight: 800; letter-spacing: 0.25em;
    text-transform: uppercase; color: #64748b; font-family: monospace;
    margin-bottom: 24px;
  }
  .hp-preview-emoji {
    font-size: 4.5rem; margin-bottom: 20px; display: block;
    transition: transform 0.4s cubic-bezier(.34,1.56,.64,1);
    transform-origin: center;
  }
  .hp-preview-card.colored .hp-preview-emoji { transform: scale(1.15) rotate(-6deg); }

  .hp-preview-title {
    font-size: 2rem; font-weight: 900; letter-spacing: -0.02em;
    color: #f8fafc; margin-bottom: 12px;
    transition: color 0.3s;
  }
  .hp-preview-card.colored .hp-preview-title { color: var(--feat-accent); }

  .hp-preview-tagline {
    font-size: 1rem; color: #94a3b8; line-height: 1.6; max-width: 360px;
  }

  .hp-preview-bottom { position: relative; z-index: 2; }

  .hp-preview-stat-row {
    display: flex; align-items: center; gap: 16px; margin-top: 32px;
  }
  .hp-preview-stat-box {
    flex: 1; background: rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 20px;
    text-align: center;
    transition: border-color 0.3s;
  }
  .hp-preview-card.colored .hp-preview-stat-box { border-color: var(--feat-border); }
  .hp-preview-stat-num {
    font-size: 1.8rem; font-weight: 900; color: #f8fafc;
    font-family: monospace; letter-spacing: -0.02em;
    transition: color 0.3s;
  }
  .hp-preview-card.colored .hp-preview-stat-num { color: var(--feat-accent); }
  .hp-preview-stat-lbl { font-size: 0.75rem; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600; }

  .hp-preview-nav {
    display: flex; align-items: center; gap: 10px; margin-top: 24px; justify-content: flex-end;
  }
  .hp-preview-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: rgba(255,255,255,0.15);
    cursor: pointer;
    transition: background 0.25s, transform 0.25s, box-shadow 0.25s;
    border: 1.5px solid transparent;
  }
  .hp-preview-dot.on {
    background: var(--feat-accent, #a78bfa);
    transform: scale(1.4);
    box-shadow: 0 0 16px var(--feat-glow, rgba(167,139,250,0.5));
    border-color: var(--feat-border, rgba(167,139,250,0.4));
  }

  /* ── SECTION: ARCHITECTURE (Monochrome Epic Design) ── */
  .hp-base-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
  .hp-base-card {
    background: #000000;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 20px;
    padding: 48px 40px;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    cursor: default;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.6s;
  }
  
  /* B/W Background Sweep animation */
  .hp-base-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: #ffffff;
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 0;
  }
  
  .hp-base-card:hover::before {
    transform: scaleY(1);
    transform-origin: top;
  }

  .hp-base-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(255,255,255,0.15);
    border-color: rgba(255,255,255,0.5);
  }

  /* Mix Blend Content */
  .hp-base-content {
    position: relative;
    z-index: 1; /* Keep above the white sweep */
    display: flex;
    gap: 24px;
    width: 100%;
    color: #ffffff;
    mix-blend-mode: difference;
    pointer-events: none; /* Let hover trigger on the card itself */
  }

  .hp-base-num {
    font-family: 'Space Mono', monospace;
    font-size: 1.4rem;
    font-weight: 700;
    opacity: 0.6;
    margin-top: 4px;
  }
  
  .hp-base-icon {
    font-size: 2.8rem;
    line-height: 1;
  }
  
  .hp-base-info {
    flex: 1;
  }
  
  .hp-base-info h4 {
    margin: 0 0 16px 0;
    font-size: 1.6rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    text-transform: uppercase;
  }
  
  .hp-base-info p {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.6;
    font-weight: 500;
    opacity: 0.9;
  }

  /* ── SECTION: NODES ── */
  .hp-provider-inner { display: flex; flex-direction: column; gap: 14px; }

  .hp-node-card {
    background: #000000;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 16px;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.5s ease, box-shadow 0.5s ease, border-color 0.5s ease;
  }
  .hp-node-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--node-color, #ffffff);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 0;
  }
  .hp-node-card:hover::before {
    transform: scaleX(1);
    transform-origin: right;
  }
  .hp-node-card:hover {
    transform: translateX(10px);
    border-color: var(--node-color);
    box-shadow: -10px 10px 30px rgba(0,0,0,0.6), 0 0 20px var(--node-color);
  }
  
  .hp-node-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 20px;
    width: 100%;
    transition: color 0.1s;
  }
  
  /* Text handling inside node card hover */
  .hp-node-card:hover .hp-node-content .hp-provider-name,
  .hp-node-card:hover .hp-node-content .hp-provider-tags,
  .hp-node-card:hover .hp-node-content .hp-provider-price {
    color: #000000 !important;
  }
  .hp-node-card:hover .hp-node-content .hp-provider-price {
    background: rgba(0,0,0,0.1);
    border-color: rgba(0,0,0,0.3) !important;
  }
  .hp-node-card:hover .hp-node-content .hp-provider-avatar {
    color: #000000 !important;
    border-color: rgba(0,0,0,0.5) !important;
    background: rgba(0,0,0,0.1);
  }
  .hp-node-card:hover .hp-node-content .hp-provider-dot {
    background: #000000 !important;
    box-shadow: none !important;
  }

  .hp-provider-row {
    display: flex; align-items: center; gap: 20px;
    padding: 16px 24px; border-radius: 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.06);
  }
  /* Avatar defaults */
  .hp-provider-avatar {
    width: 48px; height: 48px; border-radius: 12px;
    background: rgba(255,255,255,0.02);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; font-weight: 800;
    flex-shrink: 0;
    transition: color 0.2s, border-color 0.2s;
  }
  .hp-provider-name { font-size: 1.05rem; transition: color 0.2s; letter-spacing: -0.02em; }
  .hp-provider-tags { font-size: 0.8rem; margin-top: 4px; font-family: monospace; text-transform: uppercase; transition: color 0.2s; }
  .hp-provider-price {
    margin-left: auto; font-size: 1.05rem; font-weight: 800;
    background: rgba(255,255,255,0.05); 
    padding: 8px 16px; border-radius: 10px; flex-shrink: 0;
    transition: color 0.2s, background 0.2s, border-color 0.2s;
    border: 1px solid transparent;
  }
  .hp-provider-dot {
    width: 8px; height: 8px; border-radius: 50%;
    flex-shrink: 0;
    transition: background 0.2s, box-shadow 0.2s;
  }
  .hp-node-live-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    color: #34d399;
    background: rgba(52,211,153,0.10);
    border: 1px solid rgba(52,211,153,0.3);
    border-radius: 99px;
    padding: 6px 14px;
    margin-right: 16px;
  }

  /* ── Responsive breakpoints ── */
  @media (max-width: 1024px) {
    .hp-feat-layout { grid-template-columns: 1fr; }
    .hp-feat-preview { position: static; }
    
    .hp-metrics { grid-template-columns: repeat(2, 1fr); padding: 40px 0; }
    
    .hp-hero { grid-template-columns: 1fr; text-align: center; gap: 40px; padding: 60px 0; }
    .hp-hero-content { display: flex; flex-direction: column; align-items: center; }
    .hp-sub { margin: 0 auto 40px; text-align: center; }
    .hp-btns { justify-content: center; }
    .hp-hero-visual { height: 400px; margin-top: 20px; }
  }
  @media (max-width: 820px) {
    .hp-base-grid { grid-template-columns: 1fr; }
    .hp-h1 { font-size: 2.8rem; }
  }
  @media (max-width: 500px) {
    .hp-wrap { padding: 0 20px; }
    .hp-metrics { grid-template-columns: 1fr; }
    .hp-h1 { font-size: 2.2rem; }
    .hp-provider-row { padding: 12px; gap: 12px; }
    .hp-nav { display: none; }
    .hp-section-toggle { padding: 24px 20px; }
    .hp-toggle-main-title { font-size: 1.4rem; }
    .hp-section-drawer-content { padding: 24px 20px; }
  }
  @keyframes cardShimmer {
    from { left: -60%; }
    to   { left: 160%; }
  }

  /* ── Rocket Animation ── */
  .hp-rocket-overlay {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 50px;
    background: transparent;
  }
  .hp-rocket {
    font-size: 5rem;
    filter: drop-shadow(0 0 20px var(--accent));
    animation: rocketFly 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  @keyframes rocketFly {
    0% { transform: translateY(0) scale(1.0); opacity: 1; }
    20% { transform: translateY(-100px) scale(1.1); opacity: 1; }
    100% { transform: translateY(-120vh) scale(0.8); opacity: 0; }
  }
  .hp-fade-out {
    position: fixed;
    inset: 0;
    background: #070810;
    z-index: 9998;
    animation: fadeIn 0.8s ease-out forwards;
    pointer-events: none;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

/* ─── Reusable Smooth Accordion Component ─────────────────────── */
function SectionAccordion({ id, title, subtitle, isOpen, onToggle, children, rightLabel }) {
  return (
    <div className="hp-accordion-wrap" id={id}>
      <div className={`hp-section-toggle ${isOpen ? 'open' : ''}`} onClick={onToggle}>
        <div>
          <div className="hp-toggle-main-title">{title}</div>
          <div className="hp-toggle-sub">{subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {rightLabel}
          <span className="hp-toggle-chevron">▼</span>
        </div>
      </div>
      <div className={`hp-section-drawer ${isOpen ? 'open' : ''}`}>
        <div className="hp-section-drawer-inner">
          <div className="hp-section-drawer-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton ────────────────────────────────────────────────── */
function ProviderSkeleton() {
  return (
    <div className="hp-provider-row" style={{ gap: 20 }}>
      <div className="hp-provider-dot" style={{ background: '#1e2030', boxShadow: 'none' }} />
      <div className="hp-provider-avatar" style={{ background: '#1a1d2e', border: 'none' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={skel(160)} />
        <div style={skel(100, 0.5)} />
      </div>
      <div style={skel(70)} />
    </div>
  );
}

const skel = (w, opacity = 1) => ({
  height: 12, width: w, borderRadius: 6, opacity,
  background: 'linear-gradient(90deg, #1a1d2e 25%, #22263a 50%, #1a1d2e 75%)',
  backgroundSize: '400px 100%',
  animation: 'shimmer 1.4s infinite linear',
});

/* ─── Component ───────────────────────────────────────────────── */
export default function Home() {
  const [providers, setProviders] = useState([]);
  const [activeFeature, setActiveFeature] = useState(0);
  const [shimmer, setShimmer] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const shimmerTimer = useRef(null);
  const navigate = useNavigate();

  /* Unified open section state. All sections collapsed by default for a clean entry. */
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    fetchProviders()
      .then(d => { if (d?.providers) setProviders(d.providers.slice(0, 3)); })
      .catch(console.error);
  }, []);

  /* Auto-rotate features only if features accordion is open, otherwise pause */
  useEffect(() => {
    if (expandedSection !== 'features') return;
    const t = setInterval(() => handleFeatureChange((prev) => (prev + 1) % FEATURES.length), 4000);
    return () => clearInterval(t);
  }, [expandedSection]); // eslint-disable-line

  const handleFeatureChange = (indexOrFn) => {
    const next = typeof indexOrFn === 'function' ? indexOrFn(activeFeature) : indexOrFn;
    setActiveFeature(next);
    clearTimeout(shimmerTimer.current);
    setShimmer(true);
    shimmerTimer.current = setTimeout(() => setShimmer(false), 700);
  };

  const toggleSection = (sectionName) => {
    setExpandedSection(prev => prev === sectionName ? null : sectionName);
  };

  const handleLaunch = (e) => {
    e.preventDefault();
    setIsLaunching(true);
    setTimeout(() => {
      navigate('/submit');
    }, 1100);
  };

  const feat = FEATURES[activeFeature];

  /* CSS vars for the active feature in the preview card */
  const featVars = {
    '--feat-accent': feat.accent,
    '--feat-glow': feat.glow,
    '--feat-grad': feat.grad,
    '--feat-border': feat.border,
  };

  return (
    <div className={`hp-root ${isLaunching ? 'launching' : ''}`} style={expandedSection === 'features' ? featVars : {}}>
      <style>{CSS}</style>

      {isLaunching && (
        <>
          <div className="hp-rocket-overlay">
            <div className="hp-rocket">🚀</div>
          </div>
          <div className="hp-fade-out" />
        </>
      )}

      {/* Ambient orbs */}
      <div className="hp-orb hp-orb-1" />
      <div className="hp-orb hp-orb-2" />
      <div className="hp-orb hp-orb-3" />

      <div className="hp-content">
        <div className="hp-wrap">

          {/* ══════════════ HERO ══════════════ */}
          <section className="hp-hero" id="hero">
            <div className="hp-hero-content">
              <div className="hp-badge">
                <span className="hp-badge-dot" />
                Hedera Apex 2026
              </div>

              <h1 className="hp-h1">
                <span className="hp-h1-grad" style={{ fontSize: '0.9em', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.08em' }}>THE SYNDICATE</span>
                <span style={{ fontSize: '0.5em', display: 'block', marginTop: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.15em', opacity: 0.7 }}>UNIFIED AUTONOMOUS GPU ORCHESTRATION LAYER</span>
              </h1>

              <p className="hp-sub">
                Stop browsing for providers. Describe your goal once, and let your personal agent handle the vendor selection, price bidding, and job verification
              </p>

              <div className="hp-btns">
                <div
                  onClick={handleLaunch}
                  className="hp-btn-video-wrap"
                  style={{ cursor: 'pointer' }}
                >
                  <video autoPlay loop muted playsInline className="hp-btn-video-bg">
                    <source src="/rocket.mp4" type="video/mp4" />
                  </video>
                  <span className="hp-btn-video-text">Launch Task ⚡</span>
                </div>
                <Link to="/dashboard" className="hp-btn-ghost">
                  Network Map →
                </Link>
              </div>
            </div>

            {/* Premium Interactive Visual Box */}
            <div className="hp-hero-visual">
              <div className="hp-hero-orb" />

              <div className="hp-hero-logo-wrap">
                <ComputeXLogo size={480} />
              </div>

              <div className="hp-hero-floating-badge">Agent Active</div>
            </div>
          </section>

          <div className="hp-divider" />

          {/* ══════════════ METRICS ══════════════ */}
          <div className="hp-metrics">
            {METRICS.map(m => (
              <div
                className="hp-metric"
                key={m.label}
                style={{ '--metric-color': m.color, '--metric-glow': m.glow }}
              >
                <div className="hp-metric-icon">
                  <div className="hp-metric-icon-inner">{m.icon}</div>
                </div>
                <div className="hp-metric-val">{m.val}</div>
                <div className="hp-metric-label">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="hp-divider" />

          {/* ══════════════ UNIFIED ACCORDION LAYOUT ══════════════ */}
          <div className="hp-accordion-container">

            {/* 1. ABOUT US */}
            <SectionAccordion
              id="about"
              title="ABOUT US"
              subtitle="The autonomous execution engine"
              isOpen={expandedSection === 'about'}
              onToggle={() => toggleSection('about')}
            >
              <div className="hp-base-card" style={{ padding: '60px' }}>
                <div className="hp-base-content" style={{ flexDirection: 'column', gap: '24px' }}>
                  <div className="hp-base-icon" style={{ fontSize: '3rem' }}>⚡</div>
                  <div className="hp-base-info">
                    <h4 style={{ fontSize: '2.4rem' }}>The marketplace is completely autonomous.</h4>
                    <p style={{ fontSize: '1.25rem', lineHeight: '1.8' }}>
                      When you submit a job, an intelligent routing agent immediately filters out unviable providers and locks in the best possible match based on real-world constraints. No bidding delays, no manual overhead — just secure, uninterrupted execution.
                    </p>
                  </div>
                </div>
              </div>
            </SectionAccordion>

            {/* 2. FEATURES */}
            <SectionAccordion
              id="features"
              title="FEATURES"
              subtitle="Core platform capabilities"
              isOpen={expandedSection === 'features'}
              onToggle={() => toggleSection('features')}
            >
              <div className="hp-feat-layout" style={featVars}>
                {/* Left: Accordion list */}
                <div className="hp-feat-list">
                  {FEATURES.map((f, i) => (
                    <div
                      key={f.id}
                      className={`hp-feat-item ${activeFeature === i ? 'active' : ''}`}
                      style={{
                        '--feat-accent': f.accent,
                        '--feat-glow': f.glow,
                        '--feat-grad': f.grad,
                        '--feat-border': f.border,
                      }}
                    >
                      <div className="hp-feat-header">
                        <div className="hp-feat-icon-wrap">{f.icon}</div>
                        <div className="hp-feat-info">
                          <div className="hp-feat-title">{f.title}</div>
                          <div className="hp-feat-tagline">{f.tagline}</div>
                        </div>
                        <span
                          className="hp-feat-arrow"
                          style={{ cursor: 'pointer', padding: '8px' }}
                          onClick={(e) => { e.stopPropagation(); handleFeatureChange(i); }}
                        >
                          ▶
                        </span>
                      </div>
                      <div className="hp-feat-body">
                        <div className="hp-feat-body-inner">
                          <div className="hp-feat-desc">
                            {f.desc}
                            <div className="hp-feat-stat">
                              <span className="hp-feat-stat-val">{f.stat.val}</span>
                              <span className="hp-feat-stat-label">{f.stat.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Big preview card */}
                <div className="hp-feat-preview">
                  <div className={`hp-preview-card ${feat ? 'colored' : ''} ${shimmer ? 'shimmer' : ''}`} style={featVars}>
                    <div className="hp-preview-overlay" style={{ background: feat.grad }} />
                    <div className="hp-preview-corner hp-preview-corner-tl" />
                    <div className="hp-preview-corner hp-preview-corner-br" />
                    <div className="hp-preview-shimmer" />

                    <div className="hp-preview-top">
                      <div className="hp-preview-kicker">// feature.preview</div>
                      <span className="hp-preview-emoji">{feat.icon}</span>
                      <div className="hp-preview-title">{feat.title}</div>
                      <div className="hp-preview-tagline">{feat.tagline}</div>
                    </div>

                    <div className="hp-preview-bottom">
                      <div className="hp-preview-stat-row">
                        <div className="hp-preview-stat-box">
                          <div className="hp-preview-stat-num">{feat.stat.val}</div>
                          <div className="hp-preview-stat-lbl">{feat.stat.label}</div>
                        </div>
                        <div className="hp-preview-stat-box">
                          <div className="hp-preview-stat-num" style={{ fontSize: '1.2rem' }}>Active</div>
                          <div className="hp-preview-stat-lbl">Status</div>
                        </div>
                      </div>
                      <div className="hp-preview-nav">
                        {FEATURES.map((_, i) => (
                          <span
                            key={i}
                            className={`hp-preview-dot ${activeFeature === i ? 'on' : ''}`}
                            style={activeFeature === i ? featVars : {}}
                            onClick={(e) => { e.stopPropagation(); handleFeatureChange(i); }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionAccordion>

            {/* 3. ARCHITECTURE */}
            <SectionAccordion
              id="architecture"
              title="ARCHITECTURE"
              subtitle="Platform infrastructure & APIs"
              isOpen={expandedSection === 'architecture'}
              onToggle={() => toggleSection('architecture')}
            >
              <div className="hp-base-grid">
                {BASE_FEATURES.map((baseFeat, index) => (
                  <div key={index} className="hp-base-card">
                    <div className="hp-base-content">
                      <div className="hp-base-num">0{index + 1}</div>
                      <div className="hp-base-icon">{baseFeat.icon}</div>
                      <div className="hp-base-info">
                        <h4>{baseFeat.title}</h4>
                        <p>{baseFeat.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionAccordion>

            {/* 4. NODES */}
            <SectionAccordion
              id="nodes"
              title="NODES"
              subtitle="Top-rated AI providers, available now"
              isOpen={expandedSection === 'nodes'}
              onToggle={() => toggleSection('nodes')}
              rightLabel={<span className="hp-node-live-tag">● LIVE</span>}
            >
              <div className="hp-provider-inner">
                {providers.length === 0 ? (
                  [1, 2, 3].map(n => <ProviderSkeleton key={n} />)
                ) : (
                  providers.map((p, i) => {
                    const color = ['#10b981', '#f59e0b', '#60a5fa', '#a78bfa'][i % 4];
                    return (
                      <div key={p.id || i} className="hp-node-card" style={{ '--node-color': color }}>
                        <div className="hp-node-content">
                          <div className="hp-provider-dot" style={{ background: color, boxShadow: '0 0 12px ' + color }} />
                          <div className="hp-provider-avatar" style={{ border: '1px solid ' + color, color: color }}>
                            {p.name ? p.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="hp-provider-name" style={{ color: '#f1f5f9', fontWeight: 800 }}>{p.name}</div>
                            <div className="hp-provider-tags" style={{ color: '#94a3b8' }}>
                              {p.specialties ? p.specialties.join(' · ') : ''}
                            </div>
                          </div>
                          <div className="hp-provider-price" style={{ color: color, borderColor: 'rgba(255,255,255,0.15)' }}>
                            ${p.costPerTask || p.pricePerHour || 10}/hr
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </SectionAccordion>

          </div>

        </div>
      </div>
    </div>
  );
}
