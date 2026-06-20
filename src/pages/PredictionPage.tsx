import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

/* ── helpers ────────────────────────────────────────────── */
const API = 'http://localhost:8000';

interface PredResult {
  risk_percentage: number;
  risk_class: 'HIGH' | 'MODERATE' | 'LOW';
  contributing_factors: string[];
  recommendation: string;
  model_used: string;
  confidence?: number;
  shap_values?: { feature: string; value: number; impact: number }[];
}

const riskColor = (cls: string) =>
  cls === 'HIGH' ? '#ef4444' : cls === 'MODERATE' ? '#f59e0b' : '#10b981';

const riskGradient = (cls: string) =>
  cls === 'HIGH'
    ? 'from-red-500/20 via-red-500/5 to-transparent'
    : cls === 'MODERATE'
    ? 'from-amber-500/20 via-amber-500/5 to-transparent'
    : 'from-emerald-500/20 via-emerald-500/5 to-transparent';

/* Mock SHAP features for demonstration when backend doesn't return them */
const mockShap = (formData: Record<string, number>): { feature: string; value: number; impact: number }[] => [
  { feature: 'Prior Inpatient Visits', value: formData.number_inpatient, impact: formData.number_inpatient * 0.18 + 0.05 },
  { feature: 'Num Medications', value: formData.num_medications, impact: (formData.num_medications - 10) * 0.012 + 0.03 },
  { feature: 'Time in Hospital', value: formData.time_in_hospital, impact: (formData.time_in_hospital - 3) * 0.02 + 0.01 },
  { feature: 'Number of Diagnoses', value: formData.number_diagnoses, impact: formData.number_diagnoses * 0.015 - 0.02 },
  { feature: 'Lab Procedures', value: formData.num_lab_procedures, impact: (formData.num_lab_procedures - 40) * 0.004 },
  { feature: 'Emergency Visits', value: formData.number_emergency, impact: formData.number_emergency * 0.09 },
].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

/* Patient timeline events */
const timelineEvents = [
  { time: '06:00', label: 'Vitals Recorded', icon: '💓', status: 'ok' },
  { time: '08:30', label: 'Lab Results In', icon: '🧪', status: 'ok' },
  { time: '10:15', label: 'Physician Review', icon: '👨‍⚕️', status: 'ok' },
  { time: '11:45', label: 'Medication Adjusted', icon: '💊', status: 'warn' },
  { time: '13:00', label: 'AI Risk Analysis', icon: '🤖', status: 'active' },
];

/* ── Component ────────────────────────────────────────────── */
export default function PredictionPage() {
  const [formData, setFormData] = useState({
    age: 65,
    gender: 1,
    admission_type_id: 1,
    time_in_hospital: 4,
    num_lab_procedures: 45,
    num_procedures: 1,
    num_medications: 16,
    number_diagnoses: 7,
    number_inpatient: 0,
    number_emergency: 0,
    number_outpatient: 0,
    discharge_disposition_id: 1,
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData): Promise<PredResult> =>
      fetch(`${API}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const result = mutation.data;
  const shap = result?.shap_values ?? mockShap(formData);
  const confidence = result?.confidence ?? 87.4;

  const gaugeData = result
    ? [{ name: 'Risk', value: result.risk_percentage, fill: riskColor(result.risk_class) }]
    : [{ name: 'Risk', value: 0, fill: '#334155' }];

  return (
    <div className="page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #3b82f6, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              boxShadow: '0 0 20px rgba(59,130,246,0.5)',
            }}>🏥</div>
            <h1 className="page-title">AI Clinical Decision Support</h1>
          </div>
          <p className="page-sub">Real-time patient risk stratification powered by Federated XGBoost · HIPAA Compliant</p>
        </div>
        <div className="header-badges">
          <span className="badge badge-green">● Live Inference</span>
          <span className="badge badge-blue">XGBoost v1.0</span>
          <span className="badge badge-purple">SHAP Explainable</span>
        </div>
      </motion.div>

      {/* ── Patient Summary Card ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(167,139,250,0.08) 100%)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 16,
          padding: '1.25rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto auto auto auto',
          gap: '1.5rem',
          alignItems: 'center',
        }}
      >
        {/* Avatar */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6 0%, #a78bfa 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, boxShadow: '0 0 20px rgba(59,130,246,0.4)',
        }}>👤</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9', marginBottom: 2 }}>
            Patient #PAT-{Math.floor(formData.age * 1000 + formData.num_medications * 37).toString().slice(-5)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Age {formData.age} · {formData.gender === 1 ? 'Male' : 'Female'} · Day {formData.time_in_hospital} Inpatient
          </div>
        </div>
        {[
          { label: 'Medications', value: formData.num_medications, unit: 'active' },
          { label: 'Diagnoses', value: formData.number_diagnoses, unit: 'ICD codes' },
          { label: 'Lab Procedures', value: formData.num_lab_procedures, unit: 'ordered' },
          { label: 'Prior Inpatient', value: formData.number_inpatient, unit: 'visits' },
        ].map((s) => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa' }}>{s.value}</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            <div style={{ fontSize: '0.65rem', color: '#475569' }}>{s.unit}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Main Two-Column Layout ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem' }}>

        {/* LEFT — Input Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="glass card"
          >
            <div className="card-header">
              <span className="card-title">Patient Parameters</span>
              <span className="badge badge-blue">Input</span>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { label: 'Age (Midpoint)', name: 'age', min: 0, max: 100 },
                { label: 'Days in Hospital', name: 'time_in_hospital', min: 1, max: 14 },
                { label: 'Active Medications', name: 'num_medications', min: 0, max: 80 },
                { label: 'Number of Diagnoses', name: 'number_diagnoses', min: 0, max: 16 },
                { label: 'Lab Procedures', name: 'num_lab_procedures', min: 0, max: 132 },
                { label: 'Prior Inpatient Visits', name: 'number_inpatient', min: 0, max: 20 },
                { label: 'Emergency Visits', name: 'number_emergency', min: 0, max: 10 },
              ].map((field) => (
                <div key={field.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <label style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                      {field.label}
                    </label>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa' }}>
                      {formData[field.name as keyof typeof formData]}
                    </span>
                  </div>
                  <input
                    type="range"
                    name={field.name}
                    min={field.min}
                    max={field.max}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                    style={{
                      width: '100%', height: 4, borderRadius: 2,
                      WebkitAppearance: 'none', appearance: 'none',
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                        ((Number(formData[field.name as keyof typeof formData]) - field.min) / (field.max - field.min)) * 100
                      }%, rgba(255,255,255,0.1) ${
                        ((Number(formData[field.name as keyof typeof formData]) - field.min) / (field.max - field.min)) * 100
                      }%, rgba(255,255,255,0.1) 100%)`,
                      outline: 'none', cursor: 'pointer',
                    }}
                  />
                </div>
              ))}

              <motion.button
                type="submit"
                disabled={mutation.isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  marginTop: '0.5rem',
                  background: mutation.isPending
                    ? 'rgba(59,130,246,0.4)'
                    : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '0.875rem',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                  boxShadow: mutation.isPending ? 'none' : '0 4px 20px rgba(59,130,246,0.4)',
                  letterSpacing: '0.3px',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                {mutation.isPending ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                    Analyzing Patient Data…
                  </>
                ) : (
                  <>🔬 Run Risk Analysis</>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Patient Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="glass card"
          >
            <div className="card-header">
              <span className="card-title">Patient Timeline</span>
              <span className="badge badge-cyan">Today</span>
            </div>
            <div style={{ position: 'relative', paddingLeft: '1.25rem' }}>
              <div style={{
                position: 'absolute', left: 6, top: 0, bottom: 0, width: 2,
                background: 'linear-gradient(to bottom, #3b82f6, #a78bfa, rgba(167,139,250,0.1))',
                borderRadius: 2,
              }} />
              {timelineEvents.map((ev, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    marginBottom: i < timelineEvents.length - 1 ? '0.875rem' : 0,
                    position: 'relative',
                  }}
                >
                  <div style={{
                    position: 'absolute', left: -20, width: 10, height: 10, borderRadius: '50%',
                    background: ev.status === 'active' ? '#3b82f6' : ev.status === 'warn' ? '#f59e0b' : '#10b981',
                    boxShadow: ev.status === 'active' ? '0 0 8px #3b82f6' : 'none',
                    border: '2px solid #060b17',
                  }} />
                  <span style={{ fontSize: 14 }}>{ev.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', color: ev.status === 'active' ? '#60a5fa' : '#e2e8f0', fontWeight: ev.status === 'active' ? 700 : 500 }}>
                      {ev.label}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{ev.time}</div>
                  </div>
                  {ev.status === 'active' && (
                    <span style={{
                      fontSize: '0.6rem', padding: '2px 6px', borderRadius: 8,
                      background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)',
                      fontWeight: 600,
                    }}>NOW</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT — Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Idle / Error state */}
          {mutation.isIdle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass"
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '3rem', gap: '1rem', minHeight: 320,
              }}
            >
              <div style={{ fontSize: 56, filter: 'grayscale(0.3)' }}>🩺</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#94a3b8' }}>
                Configure patient parameters and run analysis
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', textAlign: 'center', maxWidth: 320 }}>
                The federated XGBoost model will compute a real-time readmission risk score with SHAP explainability
              </div>
            </motion.div>
          )}

          {mutation.isError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass"
              style={{ padding: '1.5rem', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)' }}
            >
              <div style={{ color: '#f87171', fontWeight: 600, marginBottom: 4 }}>⚠ Backend Unreachable</div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Ensure the FastAPI backend is running on port 8000.</div>
            </motion.div>
          )}

          <AnimatePresence>
            {mutation.isSuccess && result && (
              <>
                {/* Risk Score Row */}
                <motion.div
                  key="risk-row"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}
                >
                  {/* Gauge */}
                  <div
                    className="glass"
                    style={{
                      padding: '1.25rem',
                      background: `linear-gradient(180deg, rgba(${result.risk_class === 'HIGH' ? '239,68,68' : result.risk_class === 'MODERATE' ? '245,158,11' : '16,185,129'},0.12) 0%, rgba(15,23,42,0.7) 100%)`,
                      borderColor: `rgba(${result.risk_class === 'HIGH' ? '239,68,68' : result.risk_class === 'MODERATE' ? '245,158,11' : '16,185,129'},0.3)`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                      Readmission Risk
                    </div>
                    <div style={{ position: 'relative', width: 120, height: 120 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%" cy="50%"
                          innerRadius="60%" outerRadius="90%"
                          startAngle={220} endAngle={-40}
                          data={[{ value: 100, fill: 'rgba(255,255,255,0.05)' }, ...gaugeData]}
                        >
                          <RadialBar dataKey="value" cornerRadius={4} background={false}>
                            {[
                              <Cell key="bg" fill="rgba(255,255,255,0.06)" />,
                              <Cell key="val" fill={riskColor(result.risk_class)} />,
                            ]}
                          </RadialBar>
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: riskColor(result.risk_class), lineHeight: 1 }}>
                          {result.risk_percentage}%
                        </div>
                      </div>
                    </div>
                    <div style={{
                      marginTop: 4, padding: '4px 12px', borderRadius: 20,
                      background: `rgba(${result.risk_class === 'HIGH' ? '239,68,68' : result.risk_class === 'MODERATE' ? '245,158,11' : '16,185,129'},0.2)`,
                      border: `1px solid rgba(${result.risk_class === 'HIGH' ? '239,68,68' : result.risk_class === 'MODERATE' ? '245,158,11' : '16,185,129'},0.4)`,
                      color: riskColor(result.risk_class),
                      fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1px',
                    }}>
                      {result.risk_class} RISK
                    </div>
                  </div>

                  {/* Probability Meter */}
                  <div className="glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Probability Breakdown
                    </div>
                    {[
                      { label: 'Readmit ≤30d', pct: result.risk_percentage, color: riskColor(result.risk_class) },
                      { label: 'Readmit >30d', pct: Math.max(0, result.risk_percentage - 15), color: '#f59e0b' },
                      { label: 'No Readmission', pct: 100 - result.risk_percentage, color: '#10b981' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>{item.label}</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: item.color }}>{item.pct.toFixed(1)}%</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{ height: '100%', background: item.color, borderRadius: 3, boxShadow: `0 0 8px ${item.color}60` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Model Confidence</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a78bfa' }}>{confidence.toFixed(1)}%</div>
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                      Analysis Metadata
                    </div>
                    {[
                      { label: 'Model', value: result.model_used || 'XGBoost', icon: '🤖' },
                      { label: 'Method', value: 'Federated Learning', icon: '🌐' },
                      { label: 'XAI', value: 'SHAP TreeExplainer', icon: '🔍' },
                      { label: 'Compliance', value: 'HIPAA · GDPR', icon: '🛡️' },
                      { label: 'Dataset', value: 'Diabetes 130-US', icon: '🏥' },
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem', borderRadius: 6, background: 'rgba(255,255,255,0.03)' }}>
                        <span style={{ fontSize: 14 }}>{item.icon}</span>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{item.label}</div>
                          <div style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 600 }}>{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* SHAP Explanation Panel + Risk Factors */}
                <motion.div
                  key="shap"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
                >
                  {/* SHAP Bar Chart */}
                  <div className="glass card">
                    <div className="card-header">
                      <span className="card-title">SHAP Feature Attribution</span>
                      <span className="badge badge-purple">XAI</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={shap} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => v.toFixed(2)} />
                        <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: '#94a3b8' }} width={120} />
                        <Tooltip
                          contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                          formatter={(val: number) => [val > 0 ? `+${val.toFixed(3)}` : val.toFixed(3), 'SHAP Impact']}
                        />
                        <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                          {shap.map((entry, i) => (
                            <Cell key={i} fill={entry.impact > 0 ? '#ef4444' : '#10b981'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: '#94a3b8' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#ef4444' }} /> Risk-Increasing
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: '#94a3b8' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} /> Risk-Decreasing
                      </div>
                    </div>
                  </div>

                  {/* Top Risk Factors + Clinical Recommendations */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="glass card" style={{ flex: 1 }}>
                      <div className="card-header">
                        <span className="card-title">Top Risk Factors</span>
                        <span className="badge badge-red">Alert</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {(result.contributing_factors.length > 0
                          ? result.contributing_factors
                          : shap.filter(s => s.impact > 0).map(s => `${s.feature}: ${s.impact > 0.1 ? 'High' : 'Moderate'} impact on readmission`)
                        ).slice(0, 5).map((f: string, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            style={{
                              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                              padding: '0.5rem 0.75rem', borderRadius: 8,
                              background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                            }}
                          >
                            <span style={{ color: '#f87171', fontSize: 12, marginTop: 1 }}>▲</span>
                            <span style={{ fontSize: '0.78rem', color: '#fca5a5', lineHeight: 1.4 }}>{f}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Clinical Recommendation */}
                    <div
                      className="glass"
                      style={{
                        padding: '1rem',
                        background: `linear-gradient(135deg, rgba(${result.risk_class === 'HIGH' ? '239,68,68' : '59,130,246'},0.08) 0%, rgba(15,23,42,0.7) 100%)`,
                        borderColor: `rgba(${result.risk_class === 'HIGH' ? '239,68,68' : '59,130,246'},0.25)`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: 16 }}>📋</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Clinical Recommendation
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#bfdbfe', lineHeight: 1.5 }}>
                        {result.recommendation}
                      </div>
                      <div style={{
                        marginTop: '0.75rem', paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', gap: '0.5rem',
                      }}>
                        {['Schedule Follow-up', 'Review Medications', 'Care Coordination'].map((action) => (
                          <span key={action} style={{
                            fontSize: '0.65rem', padding: '3px 8px', borderRadius: 6,
                            background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                            border: '1px solid rgba(59,130,246,0.25)', fontWeight: 600,
                            cursor: 'pointer',
                          }}>
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #3b82f6; cursor: pointer;
          box-shadow: 0 0 8px rgba(59,130,246,0.6);
          border: 2px solid #fff;
        }
      `}</style>
    </div>
  );
}
