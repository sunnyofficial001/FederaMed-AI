import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

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
    color: '#2563eb',
    bgColor: 'rgba(59,130,246,0.08)',
    borderColor: 'rgba(59,130,246,0.3)',
    nodes: [
      { id: 'react', icon: '⚛️', name: 'React 19 + Vite', tech: 'TypeScript SPA', desc: 'Single-page application', color: '#2563eb', glow: '#3b82f6', detail: ['React Router v7', 'TanStack Query v5', 'Framer Motion', 'Recharts Viz'] },
      { id: 'tailwind', icon: '🎨', name: 'Tailwind CSS', tech: 'Design System', desc: 'Utility-first styling', color: '#7c3aed', glow: '#8b5cf6', detail: ['Custom design tokens', 'Glassmorphism UI', 'Responsive layouts', 'Dark/Light mode'] },
      { id: 'auth', icon: '🔐', name: 'Auth Layer', tech: 'JWT + RBAC', desc: 'Role-based access', color: '#059669', glow: '#10b981', detail: ['Hospital-level RBAC', 'JWT tokens', 'Session management', 'Audit logging'] },
    ],
  },
  {
    id: 'gateway',
    label: 'FastAPI Gateway',
    sublabel: 'API & Security Layer',
    icon: '🚀',
    color: '#059669',
    bgColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.3)',
    nodes: [
      { id: 'fastapi', icon: '🚀', name: 'FastAPI', tech: 'Python 3.11 + Uvicorn', desc: 'Async REST endpoints', color: '#059669', glow: '#10b981', detail: ['OpenAPI / Swagger docs', 'Async request handling', 'Pydantic v2 validation', '< 10ms p99 latency'] },
      { id: 'pydantic', icon: '🛡️', name: 'Pydantic v2', tech: 'Data Validation', desc: 'Schema enforcement', color: '#d97706', glow: '#f59e0b', detail: ['Request validation', 'Type coercion', 'Error serialization', 'JSON schema gen'] },
    ],
  },
  {
    id: 'fl',
    label: 'Federated Learning Server',
    sublabel: 'Orchestration & Aggregation',
    icon: '🌸',
    color: '#e11d48',
    bgColor: 'rgba(244,114,182,0.08)',
    borderColor: 'rgba(244,114,182,0.3)',
    nodes: [
      { id: 'flower', icon: '🌸', name: 'Flower (flwr)', tech: 'FL Framework', desc: 'Federated orchestrator', color: '#e11d48', glow: '#ec4899', detail: ['FedProx + FedAvg strategy', '5 parallel hospital clients', 'Differential privacy ε-DP', 'Secure aggregation'] },
      { id: 'privacy', icon: '🔒', name: 'Privacy Engine', tech: 'DP-SGD + Noise', desc: 'Patient data protection', color: '#7c3aed', glow: '#a855f7', detail: ['ε = 1.5, δ = 1e-5', 'Gaussian noise multiplier', 'Privacy budget tracking', 'HIPAA compliance'] },
    ],
  },
  {
    id: 'hospitals',
    label: 'Hospital Clients',
    sublabel: 'Distributed Edge Training',
    icon: '🏥',
    color: '#d97706',
    bgColor: 'rgba(251,146,60,0.08)',
    borderColor: 'rgba(251,146,60,0.3)',
    nodes: [
      { id: 'ha', icon: '🏥', name: 'Hospital A', tech: '20,353 records', desc: 'Local XGBoost training', color: '#d97706', glow: '#f97316', detail: ['Local model training', 'Gradient computation', 'No raw data sharing', 'FHIR integration'] },
      { id: 'hb', icon: '🏨', name: 'Hospital B', tech: '20,353 records', desc: 'Local XGBoost training', color: '#d97706', glow: '#f97316', detail: ['Non-IID data partition', 'Feature engineering', 'Local validation', 'Audit trail'] },
      { id: 'hc', icon: '🏩', name: 'Hospital C–E', tech: '60,000+ records', desc: '3 additional sites', color: '#d97706', glow: '#f97316', detail: ['101,766 total patients', 'Diabetes 130-US dataset', 'Cross-site validation', 'Privacy preserved'] },
    ],
  },
  {
    id: 'registry',
    label: 'Model Registry',
    sublabel: 'Model Lifecycle & Versioning',
    icon: '📋',
    color: '#0891b2',
    bgColor: 'rgba(6,182,212,0.08)',
    borderColor: 'rgba(6,182,212,0.3)',
    nodes: [
      { id: 'mlflow', icon: '📋', name: 'MLflow', tech: 'Experiment Tracking', desc: 'Model registry & lineage', color: '#0891b2', glow: '#06b6d4', detail: ['Model versioning', 'Artifact storage', 'Metric tracking', 'Stage transitions'] },
      { id: 'stages', icon: '🚦', name: 'Deployment Stages', tech: 'Training→Staging→Prod', desc: 'CI/CD for ML models', color: '#7c3aed', glow: '#8b5cf6', detail: ['Automated promotion', 'Canary releases', 'Rollback support', 'Approval workflows'] },
    ],
  },
  {
    id: 'monitoring',
    label: 'Monitoring Layer',
    sublabel: 'Observability & Alerting',
    icon: '📊',
    color: '#7c3aed',
    bgColor: 'rgba(167,139,250,0.08)',
    borderColor: 'rgba(167,139,250,0.3)',
    nodes: [
      { id: 'prom', icon: '📈', name: 'Prometheus + Grafana', tech: 'Metrics & Dashboards', desc: 'Real-time telemetry', color: '#7c3aed', glow: '#8b5cf6', detail: ['System health metrics', 'FL round latency', 'CPU/RAM utilization', 'Custom alerts'] },
      { id: 'shap', icon: '🔍', name: 'SHAP Explainability', tech: 'XAI Engine', desc: 'Model interpretability', color: '#2563eb', glow: '#3b82f6', detail: ['Global feature importance', 'Local SHAP waterfalls', 'Clinical interpretation', 'TreeExplainer'] },
      { id: 'audit', icon: '📜', name: 'Audit & Compliance', tech: 'Immutable Log', desc: 'HIPAA/GDPR compliance', color: '#059669', glow: '#10b981', detail: ['Immutable audit trail', 'Data flow verification', 'DP budget enforcement', 'ISO 27001 readiness'] },
    ],
  },
];

export default function ArchitecturePage() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [activeNode, setActiveNode] = useState<TechNode | null>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="page-title">System Architecture</h1>
          <p className="page-sub">End-to-end technical stack: React SPA → FastAPI Gateway → Flower FL → Differential Privacy → MLflow</p>
        </div>
        <div className="header-badges" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-blue">Interactive Topology</span>
          <span className="badge badge-purple">6 Architectural Layers</span>
          <span className="badge badge-green">Production Ready</span>
          <ThemeToggle />
        </div>
      </motion.div>

      {/* KPI Strip */}
      <div className="kpi-grid">
        {[
          { label: 'Total Patients', value: '101,766', icon: '👤', color: '#2563eb' },
          { label: 'Hospital Nodes', value: '5', icon: '🏥', color: '#059669' },
          { label: 'FL Rounds', value: '5', icon: '🔄', color: '#7c3aed' },
          { label: 'Model Accuracy', value: '88.9%', icon: '🎯', color: '#d97706' },
          { label: 'Privacy Budget', value: 'ε=1.5', icon: '🔒', color: '#e11d48' },
          { label: 'API Latency', value: '<10ms', icon: '⚡', color: '#0891b2' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="kpi-card glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3, scale: 1.02 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="kpi-label">{kpi.label}</span>
              <span style={{ fontSize: 18 }}>{kpi.icon}</span>
            </div>
            <span className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="two-col" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
        {/* Main Stack Interactive Flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {LAYERS.map((layer, layerIdx) => (
            <div key={layer.id}>
              {/* Layer Card */}
              <motion.div
                onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                style={{
                  background: isLight
                    ? `linear-gradient(135deg, ${layer.bgColor} 0%, rgba(255,255,255,0.95) 100%)`
                    : `linear-gradient(135deg, ${layer.bgColor} 0%, rgba(15,23,42,0.7) 100%)`,
                  border: isLight ? `1px solid ${layer.color}40` : `1px solid ${layer.borderColor}`,
                  borderRadius: 14,
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: activeLayer === layer.id 
                    ? `0 0 30px ${layer.color}20` 
                    : (isLight ? '0 2px 10px rgba(0,0,0,0.04)' : 'none'),
                }}
                whileHover={{ scale: 1.005 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: `linear-gradient(135deg, ${layer.color}30, ${layer.color}10)`,
                    border: `1px solid ${layer.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22,
                  }}>
                    {layer.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: layer.color }}>{layer.label}</span>
                      <span style={{
                        fontSize: '0.62rem', padding: '2px 6px', borderRadius: 6,
                        background: `${layer.color}15`, color: layer.color,
                        border: `1px solid ${layer.color}30`, fontWeight: 700,
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
                            background: activeNode?.id === node.id 
                              ? `${node.glow}25` 
                              : (isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'),
                            border: `1px solid ${activeNode?.id === node.id ? node.color + '60' : (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)')}`,
                            color: activeNode?.id === node.id ? node.color : 'var(--text)',
                            cursor: 'pointer', fontFamily: 'inherit',
                            fontSize: '0.78rem', fontWeight: 600,
                            transition: 'all 0.2s',
                          }}
                        >
                          <span style={{ fontSize: 13 }}>{node.icon}</span>
                          <span>{node.name}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{node.tech}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.8rem', flexShrink: 0 }}>
                    {activeLayer === layer.id ? '▲' : '▼'}
                  </div>
                </div>
              </motion.div>

              {/* Animated connector arrow */}
              {layerIdx < LAYERS.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 32, position: 'relative' }}>
                  <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
                    <line
                      x1="12" y1="0" x2="12" y2="24"
                      stroke={LAYERS[layerIdx + 1].color}
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                    <polygon
                      points="6,22 12,30 18,22"
                      fill={LAYERS[layerIdx + 1].color}
                    />
                  </svg>
                  <div style={{
                    position: 'absolute', right: 0,
                    fontSize: '0.65rem', color: 'var(--muted)',
                    fontFamily: 'monospace', fontWeight: 600
                  }}>
                    {['HTTPS/REST', 'gRPC', 'FL Protocol', 'Gradient Updates', 'Model Weights', 'Metrics'][layerIdx]}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Info Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <AnimatePresence mode="wait">
            {activeNode ? (
              <motion.div
                key={activeNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass card"
                style={{ border: `1px solid ${activeNode.color}40` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: 28 }}>{activeNode.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: activeNode.color }}>{activeNode.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{activeNode.tech}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {activeNode.desc}
                </p>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Technical Capabilities:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {activeNode.detail.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text)' }}>
                      <span style={{ color: activeNode.color }}>✓</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="glass card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ fontSize: 32, marginBottom: '0.5rem' }}>🏗️</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.25rem' }}>
                  Click any technology card
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                  to see detailed specifications and capabilities
                </div>
              </div>
            )}
          </AnimatePresence>

          <div className="glass card">
            <div className="card-header">
              <span className="card-title">Security & Compliance</span>
              <span className="badge badge-green">Certified</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'HIPAA', desc: 'Healthcare data protection', ok: true },
                { label: 'GDPR Ready', desc: 'EU privacy regulation', ok: true },
                { label: 'ISO 27001', desc: 'Information security', ok: true },
                { label: 'DP Guarantee', desc: 'ε = 1.5, δ = 1e-5', ok: true },
                { label: 'FHIR R4', desc: 'Healthcare interoperability', ok: true },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{item.label} </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{item.desc}</span>
                  </div>
                  <span style={{ color: '#059669', fontWeight: 800 }}>●</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
