import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitJob, fetchProviders } from '../services/api';

// ── Three resource categories with sub-types ──────────────────────────────────
const RESOURCE_CATEGORIES = [
  {
    category: 'gpu-training',
    label: '🖥️ GPU Training',
    description: 'Train or fine-tune a model on a rented GPU cluster',
    color: 'var(--accent)',
    types: [
      { value: 'gpu-training', label: 'GPU Model Training' },
    ],
  },
  {
    category: 'model-inference',
    label: '⚡ Model Inference',
    description: 'Run predictions via a hosted AI model API',
    color: 'var(--green)',
    types: [
      { value: 'image-classification', label: 'Image Classification' },
      { value: 'text-analysis',        label: 'Text Analysis / Sentiment' },
      { value: 'summarization',        label: 'Document Summarization' },
      { value: 'translation',          label: 'Language Translation' },
      { value: 'code-generation',      label: 'Code Generation' },
    ],
  },
  {
    category: 'data-storage',
    label: '🗄️ Data Storage',
    description: 'Store datasets and model checkpoints securely',
    color: 'var(--amber)',
    types: [
      { value: 'data-storage', label: 'Dataset / Model Storage' },
    ],
  },
];

const INITIAL_FORM = {
  title: '',
  description: '',
  jobType: '',
  budget: '',
  requiredAccuracy: '90',
};

// Map jobType → resource category
function getCategoryForType(jobType) {
  for (const cat of RESOURCE_CATEGORIES) {
    if (cat.types.find(t => t.value === jobType)) return cat.category;
  }
  return null;
}

export default function SubmitJob() {
  const navigate = useNavigate();
  const [form, setForm]           = useState(INITIAL_FORM);
  const [providers, setProviders] = useState([]);
  const [eligible, setEligible]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    fetchProviders().then(d => setProviders(d.providers)).catch(console.error);
  }, []);

  // Live eligibility filter
  useEffect(() => {
    if (!form.budget || !form.jobType) { setEligible([]); return; }
    const budget = parseFloat(form.budget);
    const category = getCategoryForType(form.jobType);
    const list = providers.filter(p =>
      p.costPerTask <= budget &&
      (p.resourceType === category ||
       p.specialties.includes(form.jobType) ||
       p.specialties.includes('general'))
    );
    setEligible(list);
  }, [form.budget, form.jobType, providers]);

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await submitJob(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isValid = form.title.length >= 3 && form.jobType && parseFloat(form.budget) > 0;
  const selectedCategory = RESOURCE_CATEGORIES.find(c => c.types.find(t => t.value === form.jobType));

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Submit AI Job</h1>
        <p className="page-subtitle">
          Choose a resource type, set your budget, and the AI agent handles the rest.
        </p>
      </div>

      {/* Resource category selector */}
      <div style={{ marginBottom: 28 }}>
        <div className="form-label" style={{ marginBottom: 12 }}>RESOURCE TYPE *</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {RESOURCE_CATEGORIES.map(cat => {
            const isSelected = selectedCategory?.category === cat.category;
            return (
              <div
                key={cat.category}
                onClick={() => {
                  // auto-select the first type in this category
                  setForm(prev => ({ ...prev, jobType: cat.types[0].value }));
                }}
                style={{
                  border: `1px solid ${isSelected ? cat.color : 'var(--border)'}`,
                  background: isSelected ? `${cat.color}11` : 'var(--bg-card)',
                  borderRadius: 'var(--radius)',
                  padding: '14px 12px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <div style={{ fontSize: '1.1rem', marginBottom: 6 }}>{cat.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {cat.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Title */}
        <div className="form-group">
          <label className="form-label">Job Title *</label>
          <input
            className="form-input"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Fine-tune ResNet on product dataset"
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional: additional context for the agent…"
          />
        </div>

        {/* Sub-type + Budget */}
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Task Sub-type *</label>
            <select
              className="form-select"
              name="jobType"
              value={form.jobType}
              onChange={handleChange}
              required
              style={{ height:'44px', fontSize:'0.88rem', padding:'0 12px' }}
            >
              <option value="">Select…</option>
              {RESOURCE_CATEGORIES.map(cat => (
                <optgroup key={cat.category} label={cat.label.replace(/^.{1,3} /, '')} style={{ fontSize:'2rem' }}>
                  {cat.types.map(t => (
                    <option key={t.value} value={t.value} style={{ fontSize:'2rem', padding:'2px 4px' }}>{t.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Max Budget (USD) *</label>
            <input
              className="form-input"
              name="budget"
              type="number"
              min="0.0001"
              step="0.0001"
              value={form.budget}
              onChange={handleChange}
              placeholder="0.005"
              required
            />
          </div>
        </div>

        {/* Accuracy slider */}
        <div className="form-group">
          <label className="form-label">
            Min Required Accuracy: <span className="text-accent mono">{form.requiredAccuracy}%</span>
          </label>
          <input
            type="range" min="80" max="99" step="0.5"
            name="requiredAccuracy"
            value={form.requiredAccuracy}
            onChange={handleChange}
            style={{ width: '100%', accentColor: 'var(--accent)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>80% (economy)</span><span>99% (premium)</span>
          </div>
        </div>

        {/* Eligible providers preview */}
        {eligible.length > 0 && (
          <div style={{
            background: 'var(--accent-dim)', border: '1px solid var(--accent-mid)',
            borderRadius: 'var(--radius)', padding: '14px 16px',
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em', marginBottom: 10 }}>
              ✓ {eligible.length} ELIGIBLE PROVIDER{eligible.length > 1 ? 'S' : ''} IN MARKETPLACE
            </div>
            {eligible.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                <span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</span>
                  <span style={{ marginLeft: 8, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.tier}</span>
                </span>
                <span className="mono">${p.costPerTask}/task · {p.accuracy}% acc.</span>
              </div>
            ))}
          </div>
        )}

        {eligible.length === 0 && form.budget && form.jobType && (
          <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '0.85rem', color: 'var(--red)' }}>
            ⚠ No providers match this budget + resource type. Try increasing your budget.
          </div>
        )}

        {error && (
          <div style={{ background: 'var(--red-dim)', borderRadius: 'var(--radius)', padding: '12px 16px', color: 'var(--red)', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !isValid}
          style={{ alignSelf: 'flex-start', marginTop: 4 }}
        >
          {loading ? '⏳ Submitting…' : '🚀 Submit Job'}
        </button>
      </form>
    </div>
  );
}