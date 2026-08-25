import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import Card from '../components/Card';
import KPICard from '../components/KPICard';
import ThemeToggle from '../components/ThemeToggle';
import { apiFetch, tooltipStyle, statusColor } from '../utils';
import { useTheme } from '../context/ThemeContext';

const fetchDrift = () => apiFetch('/monitoring/drift', {
  overall_drift_score: 0.038,
  overall_drift_detected: false,
  features_analyzed: 18,
  drifted_features: 0,
  watch_features: 2,
  trend: [
    { date: 'Mon', drift_score: 0.021 },
    { date: 'Tue', drift_score: 0.028 },
    { date: 'Wed', drift_score: 0.035 },
    { date: 'Thu', drift_score: 0.032 },
    { date: 'Fri', drift_score: 0.041 },
    { date: 'Sat', drift_score: 0.039 },
    { date: 'Sun', drift_score: 0.038 },
  ],
  feature_drift: [
    { feature: 'time_in_hospital', drift_score: 0.031, p_value: 0.412, status: 'stable' },
    { feature: 'num_medications', drift_score: 0.028, p_value: 0.534, status: 'stable' },
    { feature: 'number_diagnoses', drift_score: 0.019, p_value: 0.701, status: 'stable' },
    { feature: 'number_inpatient', drift_score: 0.044, p_value: 0.289, status: 'stable' },
    { feature: 'num_lab_procedures', drift_score: 0.037, p_value: 0.356, status: 'stable' },
    { feature: 'number_emergency', drift_score: 0.052, p_value: 0.198, status: 'watch' },
    { feature: 'discharge_disposition_id', drift_score: 0.024, p_value: 0.590, status: 'stable' },
  ]
});

const fetchHealth = () => apiFetch('/health', {
  status: 'healthy',
  cpu_usage_pct: 24.5,
  memory_usage_pct: 42.1,
  backend: { latency_ms: 8.2 },
  database: { size_mb: 14.8 },
  mlflow: { run_count: 12 },
  fl_server: { rounds_completed: 5 }
});

export default function MonitoringPage() {
  const { data: drift } = useQuery({ queryKey: ['drift'], queryFn: fetchDrift });
  const { data: health } = useQuery({ queryKey: ['health'], queryFn: fetchHealth });
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!drift || !health) return <div className="page"><div className="page-title">Loading Monitoring...</div></div>;

  return (
    <div className="page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="page-title">System & Model Monitoring</h1>
          <p className="page-sub">Continuous data drift detection and infrastructure health</p>
        </div>
        <div className="header-badges" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-green">● Infrastructure Healthy</span>
          <span className="badge badge-blue">K-S Drift Engine Active</span>
          <ThemeToggle />
        </div>
      </motion.div>

      {/* Infrastructure Health */}
      <div className="kpi-grid mb-6">
        <KPICard label="Backend API" value="Healthy" color="#10b981" sub={`${health.backend?.latency_ms ?? 8}ms latency`} />
        <KPICard label="Database" value="Healthy" color="#10b981" sub={`SQLite (${health.database?.size_mb ?? 14}MB)`} delay={0.1} />
        <KPICard label="MLflow" value="Healthy" color="#10b981" sub={`${health.mlflow?.run_count ?? 12} runs tracked`} delay={0.2} />
        <KPICard label="FL Server" value="Ready" color="#3b82f6" sub={`Round ${health.fl_server?.rounds_completed ?? 5} complete`} delay={0.3} />
        <KPICard label="CPU Usage" value={health.cpu_usage_pct ?? 24} suffix="%" color={(health.cpu_usage_pct ?? 24) > 80 ? '#ef4444' : '#10b981'} sub="Host Server" delay={0.4} />
        <KPICard label="Memory Usage" value={health.memory_usage_pct ?? 42} suffix="%" color={(health.memory_usage_pct ?? 42) > 80 ? '#ef4444' : '#10b981'} sub="Host Server" delay={0.5} />
      </div>

      <div className="two-col">
        {/* Drift Trend */}
        <Card title="Overall Drift Score (7 Days)" badge="K-S Statistic" badgeColor="blue">
           <ResponsiveContainer width="100%" height={280}>
             <AreaChart data={drift.trend}>
               <defs>
                 <linearGradient id="driftGrad" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                 </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)"} />
               <XAxis dataKey="date" stroke={isLight ? "#64748b" : "#475569"} tick={{ fontSize: 11 }} />
               <YAxis stroke={isLight ? "#64748b" : "#475569"} tick={{ fontSize: 11 }} domain={[0, 0.1]} />
               <RechartsTooltip {...tooltipStyle} />
               <Area type="monotone" dataKey="drift_score" stroke={isLight ? "#2563eb" : "#3b82f6"} fill="url(#driftGrad)" strokeWidth={2} />
               <Area type="monotone" dataKey={() => 0.05} stroke="#ef4444" strokeDasharray="5 5" fill="none" />
             </AreaChart>
           </ResponsiveContainer>
           
           <div style={{
             display: 'flex',
             justifyContent: 'space-between',
             alignItems: 'center',
             marginTop: '1rem',
             padding: '0.85rem 1.2rem',
             background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
             borderRadius: '10px',
             border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)'
           }}>
             <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: '2px', fontWeight: 600 }}>
                  Current Drift Status
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="dot" style={{ background: drift.overall_drift_detected ? '#ef4444' : '#10b981' }} />
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>
                    {drift.overall_drift_detected ? 'DRIFT DETECTED' : 'NO DRIFT DETECTED'}
                  </span>
                </div>
             </div>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: '2px', fontWeight: 600 }}>
                  Global Score
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: isLight ? '#2563eb' : '#60a5fa' }}>
                  {drift.overall_drift_score.toFixed(3)}
                </div>
             </div>
           </div>
        </Card>

        {/* Feature Drift Table */}
        <Card title="Feature-Level Data Drift" badge={`${drift.watch_features ?? 2} Features on Watch`} badgeColor="amber">
           <div className="table-wrap" style={{ maxHeight: '350px', overflowY: 'auto' }}>
             <table className="data-table">
               <thead style={{
                 position: 'sticky',
                 top: 0,
                 background: isLight ? '#f1f5f9' : '#1e293b',
                 zIndex: 10,
                 boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
               }}>
                 <tr>
                   <th style={{ color: isLight ? '#334155' : '#94a3b8' }}>Feature</th>
                   <th style={{ color: isLight ? '#334155' : '#94a3b8' }}>Drift Score</th>
                   <th style={{ color: isLight ? '#334155' : '#94a3b8' }}>P-Value</th>
                   <th style={{ color: isLight ? '#334155' : '#94a3b8' }}>Status</th>
                 </tr>
               </thead>
               <tbody>
                 {drift.feature_drift?.map((f: any) => (
                   <tr key={f.feature}>
                     <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{f.feature}</td>
                     <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ width: '40px', fontWeight: 600, color: 'var(--text)' }}>{f.drift_score.toFixed(3)}</span>
                          <div style={{ width: '64px', height: '6px', background: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                             <div style={{ height: '100%', borderRadius: '999px', width: `${Math.min(100, f.drift_score * 1000)}%`, background: statusColor(f.status) }} />
                          </div>
                        </div>
                     </td>
                     <td style={{ color: isLight ? '#475569' : '#94a3b8', fontWeight: 500 }}>{f.p_value.toFixed(3)}</td>
                     <td>
                       <span className="status-pill" style={{ 
                         color: statusColor(f.status), 
                         background: `${statusColor(f.status)}18`,
                         border: `1px solid ${statusColor(f.status)}35`,
                         fontWeight: 700
                       }}>
                         {f.status.toUpperCase()}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </Card>
      </div>
    </div>
  );
}
