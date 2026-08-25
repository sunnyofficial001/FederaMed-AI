import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import Card from '../components/Card';
import ThemeToggle from '../components/ThemeToggle';
import { apiFetch, tooltipStyle } from '../utils';
import { useTheme } from '../context/ThemeContext';

const fetchShap = () => apiFetch('/explanations/shap', null);

export default function ExplainabilityPage() {
  const { data } = useQuery({ queryKey: ['shap'], queryFn: fetchShap });
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!data) return <div className="page"><div className="page-title">Loading Explanations...</div></div>;

  const shapData = data.global_importance?.slice(0, 10).map((d: any) => ({
    name: d.feature.replace(/_/g, ' '),
    importance: d.importance,
    desc: d.description
  }));

  const waterfall = data.waterfall_example?.contributions || [];
  let cumSum = data.waterfall_example?.base_value || 0;

  const waterfallData = waterfall.map((w: any) => {
    const start = cumSum;
    cumSum += w.contribution;
    return {
      name: w.feature.split('=')[0].replace(/_/g, ' '),
      val: w.feature.split('=')[1],
      start,
      end: cumSum,
      contribution: w.contribution,
      direction: w.direction
    };
  });

  const maxAbsContribution = Math.max(...waterfallData.map((d: any) => Math.abs(d.contribution)), 0.01);

  return (
    <div className="page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="page-title">Explainable AI (XAI)</h1>
          <p className="page-sub">Global and local SHAP explanations for XGBoost Readmission Model</p>
        </div>
        <div className="header-badges" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-purple">SHAP TreeExplainer</span>
          <span className="badge badge-blue">Production Model</span>
          <ThemeToggle />
        </div>
      </motion.div>

      <div className="two-col">
        {/* Global Importance */}
        <Card title="Global Feature Importance (SHAP)" badge="Top 10" badgeColor="blue">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={shapData} layout="vertical" margin={{ top: 10, right: 30, left: 130, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)"} horizontal={false} />
              <XAxis type="number" stroke={isLight ? "#64748b" : "#475569"} tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" stroke={isLight ? "#64748b" : "#475569"} tick={{ fontSize: 11, fill: isLight ? '#1e293b' : '#cbd5e1' }} width={140} />
              <RechartsTooltip 
                {...tooltipStyle} 
                cursor={{ fill: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)' }}
                formatter={(v: number, n: string, props: any) => [v.toFixed(4), props.payload.desc]}
              />
              <Bar dataKey="importance" fill={isLight ? "#2563eb" : "#3b82f6"} radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Local Waterfall */}
        <Card title="Local Patient Explanation (SHAP Waterfall)" badge="Single Prediction" badgeColor="purple">
          {/* Base vs Predicted Probability Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isLight 
              ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)' 
              : 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
            padding: '1.25rem 1.5rem',
            borderRadius: '12px',
            border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.5rem',
            boxShadow: isLight ? '0 2px 8px rgba(0, 0, 0, 0.04)' : '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isLight ? '#475569' : '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                Base Probability
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isLight ? '#0f172a' : '#cbd5e1' }}>
                {(data.waterfall_example?.base_value * 100).toFixed(1)}%
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isLight ? '#475569' : '#94a3b8' }}>SHAP Impact</span>
              <span style={{ fontSize: '1.1rem', color: isLight ? '#4f46e5' : '#818cf8' }}>➔</span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isLight ? '#475569' : '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
                Predicted Probability
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isLight ? '#4f46e5' : '#818cf8' }}>
                {(data.waterfall_example?.predicted_probability * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div style={{ width: '100%', marginBottom: '1.5rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 3fr 1.5fr',
              gap: '1rem',
              padding: '0.75rem 1rem',
              borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: isLight ? '#475569' : '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <div>Feature Name</div>
              <div>Impact Magnitude</div>
              <div style={{ textAlign: 'right' }}>SHAP Impact</div>
            </div>

            {/* Table Rows */}
            {waterfallData.map((w: any, i: number) => {
              const isPos = w.direction === 'positive';
              const barColor = isPos ? (isLight ? '#059669' : '#10b981') : (isLight ? '#dc2626' : '#ef4444');
              const textColor = isPos ? (isLight ? '#047857' : '#34d399') : (isLight ? '#b91c1c' : '#f87171');
              const barPct = Math.min(100, Math.max(10, (Math.abs(w.contribution) / maxAbsContribution) * 100));

              return (
                <div 
                  key={i} 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 3fr 1.5fr',
                    gap: '1rem',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.04)',
                    background: i % 2 === 0 ? (isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.015)') : 'transparent',
                    borderRadius: '8px',
                    margin: '2px 0'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isLight ? '#0f172a' : '#f1f5f9', textTransform: 'capitalize' }}>
                      {w.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: isLight ? '#475569' : '#64748b', fontFamily: 'monospace' }}>
                      Value: <span style={{ color: isLight ? '#1e293b' : '#94a3b8', fontWeight: 600 }}>{w.val}</span>
                    </span>
                  </div>

                  <div style={{ width: '100%', background: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)', borderRadius: '6px', height: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                    <motion.div
                      style={{
                        height: '100%',
                        width: `${barPct}%`,
                        backgroundColor: barColor,
                        borderRadius: '6px',
                        boxShadow: `0 0 8px ${barColor}55`
                      }}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: i * 0.06, duration: 0.4 }}
                    />
                  </div>

                  <div style={{
                    textAlign: 'right',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    color: textColor
                  }}>
                    {isPos ? '+' : ''}{(w.contribution * 100).toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clinical Interpretation Card */}
          <div style={{
            marginTop: '1.5rem',
            background: isLight ? 'rgba(238, 242, 255, 0.9)' : 'rgba(15, 23, 42, 0.85)',
            borderRadius: '12px',
            border: isLight ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(99, 102, 241, 0.25)',
            padding: '1.25rem 1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isLight ? '0 2px 10px rgba(0, 0, 0, 0.04)' : '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#6366f1' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                fontSize: '16px'
              }}>💡</div>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: isLight ? '#0f172a' : '#f8fafc', margin: 0, letterSpacing: '0.02em' }}>
                Clinical Interpretation
              </h4>
            </div>

            <p style={{ fontSize: '0.84rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: '1.6', margin: 0, paddingLeft: '2.5rem' }}>
              This patient has a <strong style={{ color: isLight ? '#4f46e5' : '#818cf8' }}>{(data.waterfall_example?.predicted_probability * 100).toFixed(1)}%</strong> risk of readmission, which is significantly higher than the base rate of <strong style={{ color: isLight ? '#475569' : '#94a3b8' }}>{(data.waterfall_example?.base_value * 100).toFixed(1)}%</strong>. 
              The primary driving factors are <strong style={{ color: isLight ? '#047857' : '#34d399', textTransform: 'capitalize' }}>{waterfallData[0]?.name}</strong> ({waterfallData[0]?.val}) and <strong style={{ color: isLight ? '#047857' : '#34d399', textTransform: 'capitalize' }}>{waterfallData[1]?.name}</strong> ({waterfallData[1]?.val}), which collectively add <strong style={{ color: isLight ? '#047857' : '#34d399' }}>+24%</strong> to the baseline risk. 
              The risk is slightly mitigated by their discharge destination.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
