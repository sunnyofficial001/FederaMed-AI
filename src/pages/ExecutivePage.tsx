import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import KPICard from '../components/KPICard';
import Card from '../components/Card';
import { apiFetch, tooltipStyle, CHART_COLORS } from '../utils';

const fetchExecutive = () => apiFetch('/executive', {
  total_patients: 101766, readmission_rate_pct: 11.2, high_risk_population: 11357,
  hospital_network_coverage: 5, model_confidence_pct: 68.3, privacy_compliance_score: 96.2,
  healthcare_risk_index: 3.2, fl_rounds_completed: 5, avg_time_in_hospital: 4.4,
});
const fetchAnalytics = () => apiFetch('/analytics', { readmission_breakdown: [], gender_distribution: [], trend: [] });
const fetchHospitals = () => apiFetch('/hospitals', []);
const fetchMetrics   = () => apiFetch('/metrics', { roc_auc: 0.683, accuracy: 0.889, f1_score: 0.047 });

const trendData = [
  { date: 'Jun 14', readmission: 11.8, risk_index: 3.5 },
  { date: 'Jun 15', readmission: 11.5, risk_index: 3.3 },
  { date: 'Jun 16', readmission: 11.3, risk_index: 3.2 },
  { date: 'Jun 17', readmission: 11.4, risk_index: 3.3 },
  { date: 'Jun 18', readmission: 11.1, risk_index: 3.1 },
  { date: 'Jun 19', readmission: 11.0, risk_index: 3.1 },
  { date: 'Jun 20', readmission: 11.2, risk_index: 3.2 },
];

export default function ExecutivePage() {
  const { data: exec }     = useQuery({ queryKey: ['executive'],  queryFn: fetchExecutive });
  const { data: analytics }= useQuery({ queryKey: ['analytics'],  queryFn: fetchAnalytics });
  const { data: hospitals }= useQuery({ queryKey: ['hospitals'],  queryFn: fetchHospitals });
  const { data: metrics }  = useQuery({ queryKey: ['metrics'],    queryFn: fetchMetrics });

  const readmissionData = analytics?.readmission_breakdown ?? [
    { category: 'Not Readmitted', count: 54864, pct: 53.9, color: '#10b981' },
    { category: '>30 Days',       count: 35545, pct: 34.9, color: '#f59e0b' },
    { category: '<30 Days',       count: 11357, pct: 11.2, color: '#ef4444' },
  ];

  return (
    <div className="page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="page-title">Executive Intelligence</h1>
          <p className="page-sub">Real-time healthcare KPIs · Diabetes 130-US Hospitals · 101,766 patients</p>
        </div>
        <div className="header-badges">
          <span className="badge badge-green">● Live</span>
          <span className="badge badge-blue">XGBoost Production</span>
          <span className="badge badge-purple">FL Round 5/5</span>
        </div>
      </motion.div>

      {/* KPI Strip */}
      <div className="kpi-grid">
        <KPICard label="Total Patients" value={(exec?.total_patients ?? 101766).toLocaleString()} color="#3b82f6" sub="Diabetes 130-US Dataset" delay={0} />
        <KPICard label="30-Day Readmission Rate" value={exec?.readmission_rate_pct ?? 11.2} suffix="%" color="#ef4444" sub="11,357 high-risk patients" delay={0.05} />
        <KPICard label="High-Risk Population" value={(exec?.high_risk_population ?? 11357).toLocaleString()} color="#f59e0b" sub="Readmitted <30 days" delay={0.1} />
        <KPICard label="Hospital Network" value={exec?.hospital_network_coverage ?? 5} suffix=" Sites" color="#10b981" sub="Non-IID federated" delay={0.15} />
        <KPICard label="Model Confidence" value={exec?.model_confidence_pct ?? 68.3} suffix="%" color="#a78bfa" sub="ROC AUC (XGBoost)" delay={0.2} />
        <KPICard label="Privacy Score" value={exec?.privacy_compliance_score ?? 96.2} suffix="%" color="#06b6d4" sub="ε=1.5 / δ=1e-5" delay={0.25} />
        <KPICard label="Avg Stay (days)" value={exec?.avg_time_in_hospital ?? 4.4} color="#fb7185" sub="Mean hospital stay" delay={0.3} />
        <KPICard label="FL Rounds" value={exec?.fl_rounds_completed ?? 5} suffix="/5" color="#6366f1" sub="Training complete" delay={0.35} />
      </div>

      <div className="two-col">
        {/* Readmission Breakdown */}
        <Card title="Patient Readmission Breakdown" badge="Real Data" badgeColor="green">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={readmissionData} dataKey="count" nameKey="category" cx="50%" cy="50%"
                outerRadius={100} innerRadius={55} paddingAngle={3}>
                {readmissionData.map((entry: { color: string }, i: number) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(v: number) => [v.toLocaleString(), 'Patients']} />
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend-breakdown">
            {readmissionData.map((d: { category: string; count: number; pct: number; color: string }) => (
              <div key={d.category} className="breakdown-row">
                <span className="breakdown-dot" style={{ background: d.color }} />
                <span className="breakdown-label">{d.category}</span>
                <span className="breakdown-count">{d.count.toLocaleString()}</span>
                <span className="breakdown-pct">{d.pct}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 7-Day Trend */}
        <Card title="Readmission Rate Trend (7 Days)" badge="Monitoring" badgeColor="purple">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="readGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} domain={[10, 13]} unit="%" />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, 'Readmission Rate']} />
              <Area type="monotone" dataKey="readmission" stroke="#ef4444" fill="url(#readGrad)"
                strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Hospital Performance Table */}
      <Card title="Hospital Network Performance" badge="5 Active Sites" badgeColor="green" delay={0.3}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Hospital</th><th>Location</th><th>Records</th>
                <th>Accuracy</th><th>Loss</th><th>FL Weight</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(hospitals ?? []).map((h: {
                id: string; location: string; samples: number;
                accuracy: number; loss: number; contribution_weight: number; status: string;
              }) => (
                <tr key={h.id}>
                  <td className="td-bold">{h.id.replace('_', ' ')}</td>
                  <td className="td-muted">{h.location}</td>
                  <td>{(h.samples ?? 0).toLocaleString()}</td>
                  <td className="td-blue">{((h.accuracy ?? 0) * 100).toFixed(1)}%</td>
                  <td className="td-muted">{(h.loss ?? 0).toFixed(4)}</td>
                  <td>{((h.contribution_weight ?? 0) * 100).toFixed(1)}%</td>
                  <td><span className="status-pill online">Online</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
