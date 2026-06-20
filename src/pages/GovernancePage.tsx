import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { apiFetch } from '../utils';

/* ── Types ────────────────────────────────────────────────── */
interface GovModel {
  run_id: string;
  model_name: string;
  training_date: string;
  f1_score: number;
  roc_auc: number;
  stage: string;
  status: string;
}

interface GovData {
  experiment: string;
  total_runs: number;
  models: GovModel[];
  audit_trail: { timestamp: string; user: string; event: string }[];
}

/* ── Helpers ──────────────────────────────────────────────── */
const LIFECYCLE_STAGES = [
  { id: 'training', label: 'Training', icon: '🔬', color: '#60a5fa', desc: 'Active model training' },
  { id: 'archived', label: 'Archived', icon: '📦', color: '#94a3b8', desc: 'Historical versions' },
  { id: 'staging', label: 'Staging', icon: '🧪', color: '#fbbf24', desc: 'QA & validation' },
  { id: 'production', label: 'Production', icon: '🚀', color: '#34d399', desc: 'Live inference' },
];

const GOVERNANCE_KPIs = [
  { label: 'Model Compliance', value: '100%', icon: '✅', color: '#34d399', trend: '+0%', desc: 'All models HIPAA compliant' },
  { label: 'Audit Coverage', value: '100%', icon: '📜', color: '#60a5fa', trend: '+0%', desc: 'Full audit trail maintained' },
  { label: 'Avg ROC AUC', value: '', icon: '🎯', color: '#fbbf24', trend: '+2.1%', desc: 'Cross-model performance' },
  { label: 'Deployment Velocity', value: '< 4h', icon: '⚡', color: '#a78bfa', trend: '-12%', desc: 'Train-to-production time' },
  { label: 'Model Drift Alerts', value: '0', icon: '🔔', color: '#f472b6', trend: '0 this month', desc: 'Zero drift incidents' },
  { label: 'Privacy Violations', value: '0', icon: '🛡️', color: '#22d3ee', trend: 'Clean record', desc: 'Zero data breaches' },
];

const COMPLIANCE_ITEMS = [
  { label: 'HIPAA Data Handling', status: 'pass', score: 100 },
  { label: 'Model Documentation', status: 'pass', score: 98 },
  { label: 'Differential Privacy', status: 'pass', score: 100 },
  { label: 'Bias Assessment', status: 'pass', score: 92 },
  { label: 'Data Lineage', status: 'pass', score: 100 },
  { label: 'Access Control Audit', status: 'pass', score: 97 },
];

const fetchGovernance = () => apiFetch('/governance/models', {
  experiment: 'federated_readmission',
  total_runs: 12,
  models: [
    { run_id: 'a1b2c3d4e5f6', model_name: 'XGBoost_FedProx_v3', training_date: '2026-06-18', f1_score: 0.734, roc_auc: 0.891, stage: 'Production', status: 'ACTIVE' },
    { run_id: 'b2c3d4e5f6a1', model_name: 'XGBoost_FedAvg_v3', training_date: '2026-06-15', f1_score: 0.718, roc_auc: 0.876, stage: 'Staging', status: 'ACTIVE' },
    { run_id: 'c3d4e5f6a1b2', model_name: 'LightGBM_FedProx_v2', training_date: '2026-06-10', f1_score: 0.701, roc_auc: 0.863, stage: 'Archived', status: 'INACTIVE' },
    { run_id: 'd4e5f6a1b2c3', model_name: 'XGBoost_FedAvg_v2', training_date: '2026-06-05', f1_score: 0.689, roc_auc: 0.849, stage: 'Archived', status: 'INACTIVE' },
    { run_id: 'e5f6a1b2c3d4', model_name: 'XGBoost_FedProx_v1', training_date: '2026-05-28', f1_score: 0.673, roc_auc: 0.831, stage: 'Archived', status: 'INACTIVE' },
  ],
  audit_trail: [
    { timestamp: '2026-06-18T14:30:00Z', user: 'ml-pipeline-bot', event: 'Model XGBoost_FedProx_v3 promoted to Production' },
    { timestamp: '2026-06-18T12:00:00Z', user: 'dr.chen@hospital-a.org', event: 'Staging validation approved for XGBoost_FedProx_v3' },
    { timestamp: '2026-06-17T09:15:00Z', user: 'ml-pipeline-bot', event: 'Federated training round 5 completed — 5 clients' },
    { timestamp: '2026-06-15T16:45:00Z', user: 'admin@federamed.ai', event: 'Compliance audit passed — HIPAA check OK' },
    { timestamp: '2026-06-15T08:00:00Z', user: 'ml-pipeline-bot', event: 'XGBoost_FedAvg_v3 moved to Staging' },
    { timestamp: '2026-06-10T11:30:00Z', user: 'dr.patel@hospital-b.org', event: 'LightGBM_FedProx_v2 archived after benchmark' },
  ],
});

/* ── Component ────────────────────────────────────────────── */
export default function GovernancePage() {
  const { data, isLoading } = useQuery<GovData>({ queryKey: ['governance'], queryFn: fetchGovernance });
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'compliance' | 'audit'>('overview');
  const [selectedModel, setSelectedModel] = useState<GovModel | null>(null);

  if (isLoading || !data) {
    return (
      <div className="page" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚖️</div>
            <div>Loading Governance Data…</div>
          </div>
        </motion.div>
      </div>
    );
  }

  const avgRocAuc = data.models ? (data.models.reduce((s, m) => s + m.roc_auc, 0) / data.models.length).toFixed(3) : '0.87';
  const prodModel = data.models?.find(m => m.stage === 'Production');

  const comparisonData = data.models?.map(m => ({
    name: m.model_name.replace('_FedProx', '').replace('_FedAvg', '').replace('LightGBM', 'LGB'),
    f1: Math.round(m.f1_score * 1000) / 10,
    roc: Math.round(m.roc_auc * 1000) / 10,
    stage: m.stage,
  })) ?? [];

  const radarData = [
    { metric: 'Accuracy', prod: 88.9, baseline: 78 },
    { metric: 'F1 Score', prod: Math.round((prodModel?.f1_score ?? 0.734) * 100), baseline: 62 },
    { metric: 'ROC AUC', prod: Math.round((prodModel?.roc_auc ?? 0.891) * 100), baseline: 75 },
    { metric: 'Privacy', prod: 95, baseline: 60 },
    { metric: 'Compliance', prod: 100, baseline: 85 },
    { metric: 'Latency', prod: 92, baseline: 70 },
  ];

  const lifecycleCount = (stage: string) =>
    data.models?.filter(m => m.stage.toLowerCase() === stage.toLowerCase()).length ?? 0;

  const TABS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'models', label: 'Model Comparison', icon: '🔬' },
    { id: 'compliance', label: 'Compliance', icon: '✅' },
    { id: 'audit', label: 'Audit Trail', icon: '📜' },
  ] as const;

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
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              boxShadow: '0 0 20px rgba(16,185,129,0.5)',
            }}>⚖️</div>
            <h1 className="page-title">AI Governance Center</h1>
          </div>
          <p className="page-sub">Model lifecycle management, compliance analytics, and immutable audit trails · MLflow Integrated</p>
        </div>
        <div className="header-badges">
          <span className="badge badge-green">● MLflow: {data.experiment}</span>
          <span className="badge badge-blue">{data.total_runs} Total Runs</span>
          <span className="badge badge-purple">HIPAA Compliant</span>
        </div>
      </motion.div>

      {/* ── Governance KPIs ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}
      >
        {GOVERNANCE_KPIs.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ y: -3, scale: 1.02 }}
            className="glass"
            style={{
              padding: '1rem',
              border: `1px solid ${kpi.color}25`,
              background: `linear-gradient(135deg, ${kpi.color}08 0%, rgba(15,23,42,0.7) 100%)`,
            }}
          >
            <div style={{ fontSize: 18, marginBottom: '0.35rem' }}>{kpi.icon}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: kpi.color, lineHeight: 1 }}>
              {kpi.label === 'Avg ROC AUC' ? avgRocAuc : kpi.value}
            </div>
            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: 2 }}>{kpi.trend}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Model Lifecycle Visualization ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass"
        style={{ padding: '1.5rem' }}
      >
        <div className="card-header">
          <span className="card-title">Model Lifecycle Pipeline</span>
          <span className="badge badge-amber">{data.models?.length ?? 0} Models Tracked</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
          {LIFECYCLE_STAGES.map((stage, i) => {
            const count = lifecycleCount(stage.label);
            const active = count > 0;
            return (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {/* Stage block */}
                <motion.div
                  whileHover={{ y: -4 }}
                  style={{
                    flex: 1, padding: '1.25rem', borderRadius: 12, textAlign: 'center',
                    background: active
                      ? `linear-gradient(135deg, ${stage.color}18 0%, ${stage.color}06 100%)`
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${active ? stage.color + '40' : 'rgba(255,255,255,0.06)'}`,
                    transition: 'all 0.2s',
                    boxShadow: active ? `0 4px 20px ${stage.color}15` : 'none',
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{stage.icon}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: active ? stage.color : '#475569', marginBottom: 2 }}>
                    {stage.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 8 }}>{stage.desc}</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: '50%',
                    background: active ? `${stage.color}20` : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${active ? stage.color + '60' : 'rgba(255,255,255,0.08)'}`,
                    fontSize: '1rem', fontWeight: 800,
                    color: active ? stage.color : '#475569',
                    boxShadow: active ? `0 0 12px ${stage.color}40` : 'none',
                  }}>
                    {count}
                  </div>
                  {/* Models in stage */}
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {data.models?.filter(m => m.stage.toLowerCase() === stage.label.toLowerCase()).map(m => (
                      <div
                        key={m.run_id}
                        onClick={() => setSelectedModel(selectedModel?.run_id === m.run_id ? null : m)}
                        style={{
                          fontSize: '0.65rem', padding: '3px 6px', borderRadius: 5,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                          color: '#94a3b8', cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        {m.model_name.length > 20 ? m.model_name.slice(0, 20) + '…' : m.model_name}
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Arrow connector */}
                {i < LIFECYCLE_STAGES.length - 1 && (
                  <div style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="32" height="16" viewBox="0 0 32 16">
                      <motion.path
                        d="M 0 8 L 24 8 L 18 4 M 24 8 L 18 12"
                        stroke={LIFECYCLE_STAGES[i + 1].color}
                        strokeWidth="1.5"
                        fill="none"
                        strokeOpacity={0.6}
                        animate={{ strokeOpacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Tab Navigation ──────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {TABS.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.5rem 1.25rem', borderRadius: 8,
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(99,102,241,0.15))'
                : 'rgba(255,255,255,0.04)',
              color: activeTab === tab.id ? '#60a5fa' : '#94a3b8',
              fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${activeTab === tab.id ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.2s',
            }}
          >
            <span>{tab.icon}</span> {tab.label}
          </motion.button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}
          >
            {/* Radar Chart - Production vs Baseline */}
            <div className="glass card">
              <div className="card-header">
                <span className="card-title">Production Model vs Baseline</span>
                <span className="badge badge-green">XGBoost_FedProx_v3</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Radar name="Production" dataKey="prod" stroke="#34d399" fill="#34d399" fillOpacity={0.15} strokeWidth={2} />
                  <Radar name="Baseline" dataKey="baseline" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 3" />
                  <Legend iconSize={10} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Production Deployment History */}
            <div className="glass card">
              <div className="card-header">
                <span className="card-title">Production Deployment History</span>
                <span className="badge badge-purple">Immutable</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { date: 'Jun 18', model: 'XGBoost_FedProx_v3', f1: '73.4%', auc: '89.1%', status: 'current' },
                  { date: 'Jun 05', model: 'XGBoost_FedAvg_v2', f1: '68.9%', auc: '84.9%', status: 'retired' },
                  { date: 'May 28', model: 'XGBoost_FedProx_v1', f1: '67.3%', auc: '83.1%', status: 'retired' },
                ].map((dep, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem', borderRadius: 10,
                      background: dep.status === 'current'
                        ? 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(15,23,42,0.5) 100%)'
                        : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${dep.status === 'current' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: dep.status === 'current' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${dep.status === 'current' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      fontSize: 18,
                    }}>
                      {dep.status === 'current' ? '🚀' : '📦'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: dep.status === 'current' ? '#34d399' : '#94a3b8' }}>
                        {dep.model}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Deployed {dep.date} 2026</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>F1 {dep.f1}</div>
                      <div style={{ fontSize: '0.68rem', color: '#60a5fa' }}>AUC {dep.auc}</div>
                    </div>
                    {dep.status === 'current' && (
                      <span style={{
                        fontSize: '0.62rem', padding: '3px 8px', borderRadius: 10,
                        background: 'rgba(16,185,129,0.15)', color: '#34d399',
                        border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700,
                      }}>LIVE</span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Promotion Workflow */}
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.6rem' }}>
                  Model Promotion Workflow
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {['Train', 'Validate', 'Stage', 'Review', 'Promote'].map((step, i) => (
                    <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        padding: '4px 10px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700,
                        background: i < 4 ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                        color: i < 4 ? '#34d399' : '#60a5fa',
                        border: `1px solid ${i < 4 ? 'rgba(16,185,129,0.25)' : 'rgba(59,130,246,0.25)'}`,
                      }}>
                        {i < 4 ? '✓ ' : '→ '}{step}
                      </div>
                      {i < 4 && <span style={{ color: '#334155', fontSize: 10, margin: '0 2px' }}>▶</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* MODEL COMPARISON TAB */}
        {activeTab === 'models' && (
          <motion.div
            key="models"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            {/* Bar Chart comparison */}
            <div className="glass card">
              <div className="card-header">
                <span className="card-title">Model Performance Comparison</span>
                <span className="badge badge-amber">{data.models?.length} Models</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={comparisonData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`${v}%`]}
                  />
                  <Legend iconSize={10} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v === 'f1' ? 'F1 Score' : 'ROC AUC'}</span>} />
                  <Bar dataKey="f1" name="f1" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="roc" name="roc" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Model Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {data.models?.map((m, i) => {
                const stageInfo = LIFECYCLE_STAGES.find(s => s.label.toLowerCase() === m.stage.toLowerCase());
                const isSelected = selectedModel?.run_id === m.run_id;
                return (
                  <motion.div
                    key={m.run_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedModel(isSelected ? null : m)}
                    className="glass"
                    style={{
                      padding: '1.25rem', cursor: 'pointer',
                      border: `1px solid ${isSelected ? (stageInfo?.color ?? '#3b82f6') + '50' : 'rgba(255,255,255,0.08)'}`,
                      background: isSelected
                        ? `linear-gradient(135deg, ${(stageInfo?.color ?? '#3b82f6')}12 0%, rgba(15,23,42,0.9) 100%)`
                        : undefined,
                      boxShadow: isSelected ? `0 8px 30px ${(stageInfo?.color ?? '#3b82f6')}15` : undefined,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 2, lineHeight: 1.3 }}>{m.model_name}</div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'monospace' }}>{m.run_id.slice(0, 12)}</div>
                      </div>
                      <span style={{
                        fontSize: '0.62rem', padding: '3px 8px', borderRadius: 10,
                        background: `${stageInfo?.color ?? '#3b82f6'}18`,
                        color: stageInfo?.color ?? '#3b82f6',
                        border: `1px solid ${(stageInfo?.color ?? '#3b82f6')}30`,
                        fontWeight: 700, flexShrink: 0,
                      }}>{m.stage}</span>
                    </div>

                    {/* Metric bars */}
                    {[
                      { label: 'F1 Score', value: m.f1_score, color: '#f59e0b' },
                      { label: 'ROC AUC', value: m.roc_auc, color: '#3b82f6' },
                    ].map((metric) => (
                      <div key={metric.label} style={{ marginBottom: '0.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{metric.label}</span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: metric.color }}>{metric.value.toFixed(4)}</span>
                        </div>
                        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value * 100}%` }}
                            transition={{ duration: 0.8, delay: i * 0.07 }}
                            style={{ height: '100%', background: metric.color, borderRadius: 2 }}
                          />
                        </div>
                      </div>
                    ))}

                    <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: '#475569' }}>
                      Trained {m.training_date}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* COMPLIANCE TAB */}
        {activeTab === 'compliance' && (
          <motion.div
            key="compliance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}
          >
            {/* Compliance Scores */}
            <div className="glass card">
              <div className="card-header">
                <span className="card-title">Compliance Analytics</span>
                <span className="badge badge-green">100% Pass</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {COMPLIANCE_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: 14, color: '#34d399' }}>✓</span>
                        <span style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 500 }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: item.score >= 98 ? '#34d399' : '#fbbf24' }}>
                        {item.score}%
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 0.8, delay: i * 0.07 }}
                        style={{
                          height: '100%',
                          background: item.score >= 98
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                          borderRadius: 3,
                          boxShadow: item.score >= 98 ? '0 0 8px rgba(16,185,129,0.4)' : 'none',
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Overall compliance score */}
              <div style={{
                marginTop: '1.25rem', padding: '1rem', borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(15,23,42,0.5) 100%)',
                border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex', alignItems: 'center', gap: '1rem',
              }}>
                <div style={{ fontSize: 32 }}>🏆</div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399' }}>98.2%</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Overall Compliance Score</div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 2 }}>Exceeds regulatory requirements</div>
                </div>
              </div>
            </div>

            {/* Regulatory Framework */}
            <div className="glass card">
              <div className="card-header">
                <span className="card-title">Regulatory Framework</span>
                <span className="badge badge-blue">Active</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { name: 'HIPAA', icon: '🏥', status: 'Certified', color: '#34d399', desc: 'Protected Health Information safeguards enforced. Data never leaves hospital premises.', score: '100%' },
                  { name: 'GDPR', icon: '🇪🇺', status: 'Compliant', color: '#60a5fa', desc: 'Right to erasure, data minimization, and privacy-by-design implemented.', score: '98%' },
                  { name: 'ISO 27001', icon: '🔒', status: 'Certified', color: '#a78bfa', desc: 'Information security management system covering federated infrastructure.', score: '100%' },
                  { name: 'FDA 21 CFR Part 11', icon: '📋', status: 'Aligned', color: '#fbbf24', desc: 'Electronic records and signatures compliance for clinical AI systems.', score: '95%' },
                ].map((reg, i) => (
                  <motion.div
                    key={reg.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      padding: '0.875rem', borderRadius: 10,
                      background: `linear-gradient(135deg, ${reg.color}08 0%, rgba(15,23,42,0.5) 100%)`,
                      border: `1px solid ${reg.color}20`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: 20 }}>{reg.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: reg.color, fontSize: '0.88rem' }}>{reg.name}</span>
                          <span style={{
                            fontSize: '0.6rem', padding: '2px 6px', borderRadius: 8,
                            background: `${reg.color}15`, color: reg.color,
                            border: `1px solid ${reg.color}30`, fontWeight: 600,
                          }}>{reg.status}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: reg.color }}>{reg.score}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.5 }}>{reg.desc}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* AUDIT TRAIL TAB */}
        {activeTab === 'audit' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}
          >
            {/* Timeline */}
            <div className="glass card">
              <div className="card-header">
                <span className="card-title">Immutable Audit Trail</span>
                <span className="badge badge-purple">Cryptographic</span>
              </div>
              <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                {/* Vertical line */}
                <div style={{
                  position: 'absolute', left: 8, top: 4, bottom: 4, width: 2,
                  background: 'linear-gradient(to bottom, #3b82f6, #a78bfa, rgba(167,139,250,0.1))',
                  borderRadius: 2,
                }} />

                {data.audit_trail?.map((event, i) => {
                  const isPromotion = event.event.includes('promoted') || event.event.includes('Production');
                  const isApproval = event.event.includes('approved') || event.event.includes('audit');
                  const dotColor = isPromotion ? '#34d399' : isApproval ? '#fbbf24' : '#3b82f6';
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      style={{
                        position: 'relative', marginBottom: '1.25rem',
                        padding: '0.875rem 1rem', borderRadius: 10,
                        background: isPromotion
                          ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(15,23,42,0.5) 100%)'
                          : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isPromotion ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {/* Dot */}
                      <div style={{
                        position: 'absolute', left: -24, top: '50%', transform: 'translateY(-50%)',
                        width: 12, height: 12, borderRadius: '50%',
                        background: dotColor, border: '2px solid #060b17',
                        boxShadow: `0 0 8px ${dotColor}60`,
                      }} />

                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.4, marginBottom: 4 }}>
                            {isPromotion && <span style={{ color: '#34d399', marginRight: 6 }}>🚀</span>}
                            {isApproval && <span style={{ color: '#fbbf24', marginRight: 6 }}>✅</span>}
                            {!isPromotion && !isApproval && <span style={{ color: '#60a5fa', marginRight: 6 }}>📋</span>}
                            {event.event}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                            <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{event.user}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'monospace' }}>
                            {new Date(event.timestamp).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: '#475569', fontFamily: 'monospace' }}>
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Audit Analytics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="glass card">
                <div className="card-header">
                  <span className="card-title">Audit Analytics</span>
                  <span className="badge badge-cyan">30d</span>
                </div>
                {[
                  { label: 'Total Events', value: data.audit_trail?.length ?? 0, icon: '📋', color: '#60a5fa' },
                  { label: 'Model Promotions', value: data.audit_trail?.filter(e => e.event.includes('promot')).length ?? 1, icon: '🚀', color: '#34d399' },
                  { label: 'Human Approvals', value: data.audit_trail?.filter(e => e.user.includes('@')).length ?? 2, icon: '👤', color: '#fbbf24' },
                  { label: 'Automated Actions', value: data.audit_trail?.filter(e => e.user.includes('bot')).length ?? 3, icon: '🤖', color: '#a78bfa' },
                  { label: 'Security Events', value: 0, icon: '🔒', color: '#f472b6' },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <span style={{ fontSize: 18 }}>{stat.icon}</span>
                    <span style={{ flex: 1, fontSize: '0.8rem', color: '#94a3b8' }}>{stat.label}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="glass card" style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(15,23,42,0.7) 100%)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}>
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🔐</div>
                  <div style={{ fontWeight: 800, color: '#34d399', fontSize: '1.1rem', marginBottom: 4 }}>
                    Tamper-Proof Ledger
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                    All audit events are cryptographically signed and stored in an append-only log. No record can be deleted or modified.
                  </div>
                  <div style={{
                    marginTop: '0.875rem', padding: '0.5rem', borderRadius: 8,
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                    fontSize: '0.7rem', color: '#34d399', fontFamily: 'monospace',
                  }}>
                    SHA-256 · HMAC-SHA512 · Append-Only
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
