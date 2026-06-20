import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import Card from '../components/Card';
import KPICard from '../components/KPICard';
import { apiFetch, tooltipStyle, statusColor } from '../utils';

const fetchDrift = () => apiFetch('/monitoring/drift', null);
const fetchHealth = () => apiFetch('/health', null);

export default function MonitoringPage() {
  const { data: drift } = useQuery({ queryKey: ['drift'], queryFn: fetchDrift });
  const { data: health } = useQuery({ queryKey: ['health'], queryFn: fetchHealth });

  if (!drift || !health) return <div className="page"><div className="page-title">Loading Monitoring...</div></div>;

  return (
    <div className="page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="page-title">System & Model Monitoring</h1>
          <p className="page-sub">Continuous data drift detection and infrastructure health</p>
        </div>
      </motion.div>

      {/* Infrastructure Health */}
      <div className="kpi-grid mb-6">
        <KPICard label="Backend API" value="Healthy" color="#10b981" sub={`${health.backend?.latency_ms}ms latency`} />
        <KPICard label="Database" value="Healthy" color="#10b981" sub={`SQLite (${health.database?.size_mb}MB)`} delay={0.1} />
        <KPICard label="MLflow" value="Healthy" color="#10b981" sub={`${health.mlflow?.run_count} runs tracked`} delay={0.2} />
        <KPICard label="FL Server" value="Ready" color="#3b82f6" sub={`Round ${health.fl_server?.rounds_completed} complete`} delay={0.3} />
        <KPICard label="CPU Usage" value={health.cpu_usage_pct} suffix="%" color={health.cpu_usage_pct > 80 ? '#ef4444' : '#10b981'} sub="Host Server" delay={0.4} />
        <KPICard label="Memory Usage" value={health.memory_usage_pct} suffix="%" color={health.memory_usage_pct > 80 ? '#ef4444' : '#10b981'} sub="Host Server" delay={0.5} />
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
               <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
               <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} />
               <YAxis stroke="#475569" tick={{ fontSize: 11 }} domain={[0, 0.1]} />
               <RechartsTooltip {...tooltipStyle} />
               <Area type="monotone" dataKey="drift_score" stroke="#3b82f6" fill="url(#driftGrad)" strokeWidth={2} />
               {/* Threshold line */}
               <Area type="monotone" dataKey={() => 0.05} stroke="#ef4444" strokeDasharray="5 5" fill="none" />
             </AreaChart>
           </ResponsiveContainer>
           <div className="flex justify-between items-center mt-4 p-3 bg-slate-800/50 rounded border border-slate-700/50">
             <div>
                <div className="text-xs text-muted uppercase tracking-wider mb-1">Current Drift Status</div>
                <div className="flex-center gap-2">
                  <span className="dot" style={{ background: drift.overall_drift_detected ? '#ef4444' : '#10b981' }} />
                  <span className="font-bold">{drift.overall_drift_detected ? 'DRIFT DETECTED' : 'NO DRIFT'}</span>
                </div>
             </div>
             <div className="text-right">
                <div className="text-xs text-muted uppercase tracking-wider mb-1">Global Score</div>
                <div className="font-bold text-xl text-blue-400">{drift.overall_drift_score.toFixed(3)}</div>
             </div>
           </div>
        </Card>

        {/* Feature Drift Table */}
        <Card title="Feature-Level Data Drift" badge={`${drift.watch_features} Features on Watch`} badgeColor="amber">
           <div className="table-wrap" style={{ maxHeight: '350px', overflowY: 'auto' }}>
             <table className="data-table">
               <thead style={{ position: 'sticky', top: 0, background: '#1e293b' }}>
                 <tr>
                   <th>Feature</th>
                   <th>Drift Score</th>
                   <th>P-Value</th>
                   <th>Status</th>
                 </tr>
               </thead>
               <tbody>
                 {drift.feature_drift?.map((f: any) => (
                   <tr key={f.feature}>
                     <td className="font-mono text-xs">{f.feature}</td>
                     <td>
                        <div className="flex items-center gap-2">
                          <span style={{ width: '40px' }}>{f.drift_score.toFixed(3)}</span>
                          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                             <div className="h-full rounded-full" style={{ width: `${Math.min(100, f.drift_score * 1000)}%`, background: statusColor(f.status) }} />
                          </div>
                        </div>
                     </td>
                     <td className="text-slate-400">{f.p_value.toFixed(3)}</td>
                     <td>
                       <span className="status-pill" style={{ 
                         color: statusColor(f.status), 
                         background: `${statusColor(f.status)}20`,
                         border: `1px solid ${statusColor(f.status)}40`
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
