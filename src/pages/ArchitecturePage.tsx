import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Layer & node definitions ─────────────────────────────── */
interface TechNode {
  id: string;
  icon: string;
  name: string;
  tech: string;
  desc: string;
  color: string;
  glow: string;
  detail: string[];
}

interface ArchLayer {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  nodes: TechNode[];
}

const LAYERS: ArchLayer[] = [
  {
    id: 'frontend',
    label: 'React Frontend',
    sublabel: 'Presentation Layer',
    icon: '⚛️',
    color: '#60a5fa',
    bgColor: 'rgba(59,130,246,0.08)',
    borderColor: 'rgba(59,130,246,0.3)',
    nodes: [
      { id: 'react', icon: '⚛️', name: 'React 19 + Vite', tech: 'TypeScript SPA', desc: 'Single-page application', color: '#60a5fa', glow: '#3b82f6', detail: ['React Router v7', 'TanStack Query v5', 'Framer Motion', 'Recharts Viz'] },
      { id: 'tailwind', icon: '🎨', name: 'Tailwind CSS', tech: 'Design System', desc: 'Utility-first styling', color: '#a78bfa', glow: '#8b5cf6', detail: ['Custom design tokens', 'Glassmorphism UI', 'Responsive layouts', 'Dark mode first'] },
      { id: 'auth', icon: '🔐', name: 'Auth Layer', tech: 'JWT + RBAC', desc: 'Role-based access', color: '#34d399', glow: '#10b981', detail: ['Hospital-level RBAC', 'JWT tokens', 'Session management', 'Audit logging'] },
    ],
  },
  {
    id: 'gateway',
    label: 'FastAPI Gateway',
    sublabel: 'API & Security Layer',
    icon: '🚀',
    color: '#34d399',
    bgColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.3)',
    nodes: [
      { id: 'fastapi', icon: '🚀', name: 'FastAPI', tech: 'Python 3.11 + Uvicorn', desc: 'Async REST endpoints', color: '#34d399', glow: '#10b981', detail: ['OpenAPI / Swagger docs', 'Async request handling', 'Pydantic v2 validation', '< 10ms p99 latency'] },
      { id: 'pydantic', icon: '🛡️', name: 'Pydantic v2', tech: 'Data Validation', desc: 'Schema enforcement', color: '#fbbf24', glow: '#f59e0b', detail: ['Request validation', 'Type coercion', 'Error serialization', 'JSON schema gen'] },
    ],
  },
  {
    id: 'fl',
    label: 'Federated Learning Server',
    sublabel: 'Orchestration & Aggregation',
    icon: '🌸',
    color: '#f472b6',
    bgColor: 'rgba(244,114,182,0.08)',
    borderColor: 'rgba(244,114,182,0.3)',
    nodes: [
      { id: 'flower', icon: '🌸', name: 'Flower (flwr)', tech: 'FL Framework', desc: 'Federated orchestrator', color: '#f472b6', glow: '#ec4899', detail: ['FedProx + FedAvg strategy', '5 parallel hospital clients', 'Differential privacy ε-DP', 'Secure aggregation'] },
      { id: 'privacy', icon: '🔒', name: 'Privacy Engine', tech: 'DP-SGD + Noise', desc: 'Patient data protection', color: '#c084fc', glow: '#a855f7', detail: ['ε = 1.5, δ = 1e-5', 'Gaussian noise multiplier', 'Privacy budget tracking', 'HIPAA compliance'] },
    ],
  },
  {
    id: 'hospitals',
    label: 'Hospital Clients',
    sublabel: 'Distributed Edge Training',
    icon: '🏥',
    color: '#fb923c',
    bgColor: 'rgba(251,146,60,0.08)',
    borderColor: 'rgba(251,146,60,0.3)',
    nodes: [
      { id: 'ha', icon: '🏥', name: 'Hospital A', tech: '20,353 records', desc: 'Local XGBoost training', color: '#fb923c', glow: '#f97316', detail: ['Local model training', 'Gradient computation', 'No raw data sharing', 'FHIR integration'] },
      { id: 'hb', icon: '🏨', name: 'Hospital B', tech: '20,353 records', desc: 'Local XGBoost training', color: '#fb923c', glow: '#f97316', detail: ['Non-IID data partition', 'Feature engineering', 'Local validation', 'Audit trail'] },
      { id: 'hc', icon: '🏩', name: 'Hospital C–E', tech: '60,000+ records', desc: '3 additional sites', color: '#fb923c', glow: '#f97316', detail: ['101,766 total patients', 'Diabetes 130-US dataset', 'Cross-site validation', 'Privacy preserved'] },
    ],
  },
  {
    id: 'registry',
    label: 'Model Registry',
    sublabel: 'Model Lifecycle & Versioning',
    icon: '📋',
    color: '#22d3ee',
    bgColor: 'rgba(6,182,212,0.08)',
    borderColor: 'rgba(6,182,212,0.3)',
    nodes: [
      { id: 'mlflow', icon: '📋', name: 'MLflow', tech: 'Experiment Tracking', desc: 'Model registry & lineage', color: '#22d3ee', glow: '#06b6d4', detail: ['Model versioning', 'Artifact storage', 'Metric tracking', 'Stage transitions'] },
      { id: 'stages', icon: '🚦', name: 'Deployment Stages', tech: 'Training→Staging→Prod', desc: 'CI/CD for ML models', color: '#a78bfa', glow: '#8b5cf6', detail: ['Automated promotion', 'Canary releases', 'Rollback support', 'Approval workflows'] },
    ],
  },
  {
    id: 'monitoring',
    label: 'Monitoring Layer',
    sublabel: 'Observability & Alerting',
    icon: '📊',
    color: '#a78bfa',
    bgColor: 'rgba(167,139,250,0.08)',
    borderColor: 'rgba(167,139,250,0.3)',
    nodes: [
      { id: 'prometheus', icon: '📊', name: 'Prometheus + Grafana', tech: 'Metrics & Dashboards', desc: 'Real-time observability', color: '#a78bfa', glow: '#8b5cf6', detail: ['Drift detection', 'Latency monitoring', 'Alert rules', 'SLA tracking'] },
      { id: 'shap_mon', icon: '🔍', name: 'SHAP Explainability', tech: 'XAI Engine', desc: 'Feature attribution', color: '#34d399', glow: '#10b981', detail: ['TreeExplainer', 'Global/local SHAP', 'Feature importance', 'Bias detection'] },
      { id: 'audit', icon: '📜', name: 'Audit & Compliance', tech: 'Immutable Log', desc: 'Regulatory compliance', color: '#fbbf24', glow: '#f59e0b', detail: ['HIPAA audit trail', 'GDPR compliance', 'ISO 27001', 'SOC2 ready'] },
    ],
  },
];

const DATA_FLOW_STATS = [
  { label: 'Total Patients', value: '101,766', icon: '👤', color: '#60a5fa' },
  { label: 'Hospital Nodes', value: '5', icon: '🏥', color: '#34d399' },
  { label: 'FL Rounds', value: '5', icon: '🔄', color: '#f472b6' },
  { label: 'Model Accuracy', value: '88.9%', icon: '🎯', color: '#fbbf24' },
  { label: 'Privacy Budget', value: 'ε=1.5', icon: '🔒', color: '#a78bfa' },
  { label: 'API Latency', value: '<10ms', icon: '⚡', color: '#22d3ee' },
];

/* ── Component ────────────────────────────────────────────── */
export default function ArchitecturePage() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<TechNode | null>(null);

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
              background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              boxShadow: '0 0 20px rgba(99,102,241,0.5)',
            }}>🏗️</div>
            <h1 className="page-title">Platform Architecture</h1>
          </div>
          <p className="page-sub">Enterprise Federated Learning System Design · Click any layer to explore technology details</p>
        </div>
        <div className="header-badges">
          <span className="badge badge-green">● Production Ready</span>
          <span className="badge badge-blue">HIPAA Compliant</span>
          <span className="badge badge-purple">ISO 27001</span>
        </div>
      </motion.div>

      {/* ── Stats Strip ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '1rem',
        }}
      >
        {DATA_FLOW_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="glass"
            style={{
              padding: '1rem',
              textAlign: 'center',
              border: `1px solid ${stat.color}30`,
              background: `linear-gradient(135deg, ${stat.color}10 0%, rgba(15,23,42,0.7) 100%)`,
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Architecture Diagram ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>

        {/* Main diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {LAYERS.map((layer, layerIdx) => (
            <div key={layer.id}>
              {/* Layer Block */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + layerIdx * 0.08 }}
                onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                style={{
                  border: `1px solid ${activeLayer === layer.id ? layer.color + '60' : layer.borderColor}`,
                  background: activeLayer === layer.id
                    ? `linear-gradient(135deg, ${layer.bgColor.replace('0.08', '0.18')} 0%, rgba(15,23,42,0.9) 100%)`
                    : `linear-gradient(135deg, ${layer.bgColor} 0%, rgba(15,23,42,0.7) 100%)`,
                  borderRadius: 14,
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: activeLayer === layer.id ? `0 0 30px ${layer.color}20, inset 0 0 30px ${layer.color}05` : 'none',
                }}
                whileHover={{ scale: 1.005 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Layer icon & label */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: `linear-gradient(135deg, ${layer.color}30, ${layer.color}10)`,
                    border: `1px solid ${layer.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                    boxShadow: activeLayer === layer.id ? `0 0 20px ${layer.color}40` : 'none',
                  }}>
                    {layer.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: layer.color }}>{layer.label}</span>
                      <span style={{
                        fontSize: '0.62rem', padding: '2px 6px', borderRadius: 6,
                        background: `${layer.color}15`, color: layer.color,
                        border: `1px solid ${layer.color}30`, fontWeight: 600,
                      }}>{layer.sublabel}</span>
                    </div>
                    {/* Tech nodes */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      {layer.nodes.map((node) => (
                        <motion.button
                          key={node.id}
                          onClick={(e) => { e.stopPropagation(); setActiveNode(activeNode?.id === node.id ? null : node); }}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '0.35rem 0.75rem', borderRadius: 8,
                            background: activeNode?.id === node.id ? `${node.glow}25` : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${activeNode?.id === node.id ? node.color + '60' : 'rgba(255,255,255,0.08)'}`,
                            color: activeNode?.id === node.id ? node.color : '#cbd5e1',
                            cursor: 'pointer', fontFamily: 'inherit',
                            fontSize: '0.78rem', fontWeight: 600,
                            transition: 'all 0.2s',
                            boxShadow: activeNode?.id === node.id ? `0 0 12px ${node.glow}30` : 'none',
                          }}
                        >
                          <span style={{ fontSize: 13 }}>{node.icon}</span>
                          <span>{node.name}</span>
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{node.tech}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div style={{ color: '#475569', fontSize: '0.8rem', flexShrink: 0 }}>
                    {activeLayer === layer.id ? '▲' : '▼'}
                  </div>
                </div>
              </motion.div>

              {/* Animated connector arrow */}
              {layerIdx < LAYERS.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 32, position: 'relative' }}>
                  <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
                    {/* Animated dashed line */}
                    <motion.line
                      x1="12" y1="0" x2="12" y2="24"
                      stroke={`url(#grad${layerIdx})`}
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      animate={{ strokeDashoffset: [0, -14] }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.polygon
                      points="6,22 12,30 18,22"
                      fill={LAYERS[layerIdx + 1].color}
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <defs>
                      <linearGradient id={`grad${layerIdx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={LAYERS[layerIdx].color} stopOpacity="0.6" />
                        <stop offset="100%" stopColor={LAYERS[layerIdx + 1].color} stopOpacity="1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{
                    position: 'absolute', right: 0,
                    fontSize: '0.65rem', color: '#475569',
                    fontFamily: 'monospace',
                  }}>
                    {['HTTPS/REST', 'gRPC', 'FL Protocol', 'Gradient Updates', 'Model Weights', 'Metrics'][layerIdx]}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT — Detail Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Node Detail Card */}
          <AnimatePresence mode="wait">
            {activeNode ? (
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                className="glass card"
                style={{
                  border: `1px solid ${activeNode.color}40`,
                  background: `linear-gradient(135deg, ${activeNode.glow}10 0%, rgba(15,23,42,0.9) 100%)`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: `linear-gradient(135deg, ${activeNode.color}25, ${activeNode.color}10)`,
                    border: `1px solid ${activeNode.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, boxShadow: `0 0 16px ${activeNode.glow}40`,
                  }}>
                    {activeNode.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: activeNode.color, fontSize: '1rem' }}>{activeNode.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{activeNode.tech}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.875rem', lineHeight: 1.5 }}>
                  {activeNode.desc}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {activeNode.detail.map((d, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.4rem 0.6rem', borderRadius: 6,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <span style={{ color: activeNode.color, fontSize: 10 }}>◆</span>
                      <span style={{ fontSize: '0.78rem', color: '#e2e8f0' }}>{d}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass card"
                style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏗️</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Click any technology card<br />to see detailed specifications</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security & Compliance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass card"
          >
            <div className="card-header">
              <span className="card-title">Security & Compliance</span>
              <span className="badge badge-green">Certified</span>
            </div>
            {[
              { icon: '🛡️', label: 'HIPAA', desc: 'Healthcare data protection', color: '#34d399' },
              { icon: '🇪🇺', label: 'GDPR Ready', desc: 'EU privacy regulation', color: '#60a5fa' },
              { icon: '📜', label: 'ISO 27001', desc: 'Information security', color: '#a78bfa' },
              { icon: '🔒', label: 'DP Guarantee', desc: 'ε = 1.5, δ = 1e-5', color: '#f472b6' },
              { icon: '🏥', label: 'FHIR R4', desc: 'Healthcare interoperability', color: '#fbbf24' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem', borderRadius: 8, marginBottom: '0.4rem',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: item.color }}>{item.label}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{item.desc}</div>
                </div>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.5)',
                }} />
              </div>
            ))}
          </motion.div>

          {/* Data Flow summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass card"
          >
            <div className="card-header">
              <span className="card-title">Data Flow Guarantees</span>
              <span className="badge badge-purple">Privacy</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                'Raw patient data never leaves hospital premises',
                'Only encrypted model gradients are transmitted',
                'Differential privacy noise added at source',
                'Secure aggregation with cryptographic guarantees',
                'Immutable audit trail for every FL round',
              ].map((point, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: '#94a3b8', alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }}>✓</span>
                  {point}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
