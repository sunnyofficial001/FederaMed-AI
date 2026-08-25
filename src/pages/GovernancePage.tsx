import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { apiFetch, tooltipStyle } from '../utils';
import { useTheme } from '../context/ThemeContext';

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
  { id: 'training', label: 'Training', icon: '🔬', color: '#2563eb', desc: 'Active model training' },
  { id: 'archived', label: 'Archived', icon: '📦', color: '#64748b', desc: 'Historical versions' },
  { id: 'staging', label: 'Staging', icon: '🧪', color: '#d97706', desc: 'QA & validation' },
  { id: 'production', label: 'Production', icon: '🚀', color: '#059669', desc: 'Live inference' },
];

const GOVERNANCE_KPIs = [
  { label: 'Model Compliance', value: '100%', icon: '✅', color: '#059669', trend: '+0%', desc: 'All models HIPAA compliant' },
  { label: 'Audit Coverage', value: '100%', icon: '📜', color: '#2563eb', trend: '+0%', desc: 'Full audit trail maintained' },
  { label: 'Avg ROC AUC', value: '', icon: '🎯', color: '#d97706', trend: '+2.1%', desc: 'Cross-model performance' },
  { label: 'Deployment Velocity', value: '< 4h', icon: '⚡', color: '#7c3aed', trend: '-12%', desc: 'Train-to-production time' },
  { label: 'Model Drift Alerts', value: '0', icon: '🔔', color: '#e11d48', trend: '0 this month', desc: 'Zero drift incidents' },
  { label: 'Privacy Violations', value: '0', icon: '🛡️', color: '#0891b2', trend: 'Clean record', desc: 'Zero data breaches' },
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
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (isLoading || !data) {
    return (
      <div className="page" style={{ alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚖️</div>
            <div>Loading Governance Data…</div>
          </div>
        </motion.div>
      </div>
    );
  }

  const avgRocAuc = data.models ? (data.models.reduce((s, m) => s + m.roc_auc, 0) / data.models.length).toFixed(3) : '0.87';
  const prodModel = data.models?.find(m => m.stage === 'Production');

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
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}
      >
        {GOVERNANCE_KPIs.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="glass"
            style={{
              padding: '1.1rem',
              border: `1px solid ${kpi.color}35`,
              background: isLight
                ? `linear-gradient(135deg, ${kpi.color}15 0%, rgba(255,255,255,0.95) 100%)`
                : `linear-gradient(135deg, ${kpi.color}08 0%, rgba(15,23,42,0.7) 100%)`,
              boxShadow: isLight ? '0 2px 10px rgba(0,0,0,0.04)' : 'none'
            }}
          >
            <div style={{ fontSize: 18, marginBottom: '0.35rem' }}>{kpi.icon}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: kpi.color, lineHeight: 1 }}>
              {kpi.label === 'Avg ROC AUC' ? avgRocAuc : kpi.value}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4, fontWeight: 700 }}>
              {kpi.label}
            </div>
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
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '1rem', flexWrap: 'wrap' }}>
          {LIFECYCLE_STAGES.map((stage, i) => {
            const count = lifecycleCount(stage.label);
            const active = count > 0;
            return (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 200 }}>
                {/* Stage block */}
                <motion.div
                  whileHover={{ y: -4 }}
                  style={{
                    flex: 1, padding: '1.25rem', borderRadius: 12, textAlign: 'center',
                    background: isLight 
                      ? (active ? `linear-gradient(135deg, ${stage.color}15 0%, #ffffff 100%)` : 'rgba(0,0,0,0.02)')
                      : (active ? `linear-gradient(135deg, ${stage.color}18 0%, ${stage.color}06 100%)` : 'rgba(255,255,255,0.02)'),
                    border: `1px solid ${active ? stage.color + '50' : (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)')}`,
                    transition: 'all 0.2s',
                    boxShadow: isLight ? '0 2px 10px rgba(0,0,0,0.04)' : 'none'
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{stage.icon}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: active ? stage.color : 'var(--muted)', marginBottom: 2 }}>
                    {stage.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginBottom: 8 }}>{stage.desc}</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: '50%',
                    background: active ? `${stage.color}20` : (isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'),
                    border: `2px solid ${active ? stage.color + '60' : (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)')}`,
                    fontSize: '1rem', fontWeight: 800,
                    color: active ? stage.color : 'var(--muted)',
                  }}>
                    {count}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Overview Radar + Deployments Grid */}
      <div className="two-col">
        <Card title="Production Model vs Baseline" badge={prodModel?.model_name ?? 'XGBoost_v3'} badgeColor="green">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)"} />
              <PolarAngleAxis dataKey="metric" stroke={isLight ? "#475569" : "#94a3b8"} tick={{ fontSize: 11 }} />
              <Radar name="Baseline" dataKey="baseline" stroke="#d97706" fill="#d97706" fillOpacity={0.2} />
              <Radar name="Production" dataKey="prod" stroke="#059669" fill="#059669" fillOpacity={0.4} />
              <Legend formatter={(v) => <span style={{ color: 'var(--text)', fontSize: 12, fontWeight: 600 }}>{v}</span>} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Production Deployment History" badge="Immutable" badgeColor="purple">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {data.models?.map((m) => (
              <div 
                key={m.run_id} 
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
                  border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)' }}>{m.model_name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Deployed {m.training_date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669' }}>F1: {(m.f1_score * 100).toFixed(1)}%</div>
                  <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>AUC: {(m.roc_auc * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
