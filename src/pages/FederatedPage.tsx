import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts';
import Card from '../components/Card';
import ThemeToggle from '../components/ThemeToggle';
import { apiFetch, tooltipStyle } from '../utils';

const fetchFLRounds = () => apiFetch('/fl/rounds', { rounds: [], total_rounds: 5 });
const fetchHospitals = () => apiFetch('/hospitals', []);

const hospitals = ['Hospital_A','Hospital_B','Hospital_C','Hospital_D','Hospital_E'];

export default function FederatedPage() {
  const { data: flData }    = useQuery({ queryKey: ['fl-rounds'],  queryFn: fetchFLRounds });
  const { data: hospData }  = useQuery({ queryKey: ['hospitals'],  queryFn: fetchHospitals });
  const [activeRound, setActiveRound] = useState(0);
  const [flowPulse, setFlowPulse] = useState<number | null>(null);

  const rounds = flData?.rounds ?? [];
  const convergence = rounds.map((r: { round: number; global_accuracy: number; global_loss: number }) => ({
    round: `Round ${r.round}`,
    accuracy: +(r.global_accuracy * 100).toFixed(2),
    loss: +r.global_loss.toFixed(4),
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setFlowPulse(Math.floor(Math.random() * 5));
      setTimeout(() => setFlowPulse(null), 600);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentRound = rounds[activeRound] ?? null;

  const perClientData = currentRound
    ? Object.entries(currentRound.hospital_metrics ?? {}).map(([name, m]: [string, unknown]) => ({
        name: name.replace('Hospital_', 'H-'),
        accuracy: +((m as {accuracy:number}).accuracy * 100).toFixed(2),
        loss: +((m as {loss:number}).loss).toFixed(4),
        samples: (m as {samples:number}).samples,
      }))
    : [];

  return (
    <div className="page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="page-title">FL Command Center</h1>
          <p className="page-sub">FedProx + FedAvg · 5 Hospitals · 5 Rounds · 101,766 Patients</p>
        </div>
        <div className="header-badges" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-green">● 5/5 Clients Online</span>
          <span className="badge badge-blue">Strategy: FedProx</span>
          <span className="badge badge-purple">ε=1.5 Privacy</span>
          <ThemeToggle />
        </div>
      </motion.div>

      {/* Animated FL Topology Container */}
      <Card title="Federated Network Topology" badge="Live Simulation" badgeColor="green" delay={0.1}>
        <div 
          className="fl-topology"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justify: 'space-between',
            padding: '1.5rem',
            minHeight: '380px',
            gap: '2rem',
            width: '100%',
            overflowX: 'auto'
          }}
        >
          {/* Hospital Nodes Left Column */}
          <div className="fl-clients" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '250px', flexShrink: 0 }}>
            {hospitals.map((h, i) => (
              <motion.div
                key={h}
                className={`fl-node client-node${flowPulse === i ? ' fl-active' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="fl-node-icon">🏥</div>
                <div className="fl-node-label">{h.replace('Hospital_', 'Hospital ')}</div>
                <div className="fl-node-metric">
                  {hospData?.[i] ? `${((hospData[i].accuracy ?? 0.88) * 100).toFixed(1)}%` : '88.5%'}
                </div>
                <div className="fl-node-samples">
                  {(hospData?.[i]?.samples ?? 20353).toLocaleString()} records
                </div>
              </motion.div>
            ))}
          </div>

          {/* Central Aggregation Arrow Center Zone */}
          <div className="fl-arrow-zone" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div className="fl-arrows" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', color: '#3b82f6', fontSize: '1.6rem', marginBottom: '0.75rem' }}>
              {hospitals.map((_, i) => (
                <motion.div
                  key={i}
                  className="fl-arrow"
                  style={{ display: 'inline-block' }}
                  animate={flowPulse === i
                    ? { opacity: 1, x: [0, 8, 0], scale: [1, 1.3, 1] }
                    : { opacity: 0.3 }
                  }
                  transition={{ duration: 0.6 }}
                >
                  ➔
                </motion.div>
              ))}
            </div>
            <div className="fl-agg-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', background: 'rgba(59, 130, 246, 0.12)', padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Gradient Aggregation (FedProx)
            </div>
          </div>

          {/* Aggregation Server Right Column */}
          <motion.div
            className="fl-server"
            style={{ width: '300px', flexShrink: 0 }}
            animate={{ boxShadow: ['0 0 20px rgba(59,130,246,0.3)', '0 0 40px rgba(59,130,246,0.6)', '0 0 20px rgba(59,130,246,0.3)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="fl-server-icon">🖥️</div>
            <div className="fl-server-title">Flower Aggregation Server</div>
            <div className="fl-server-sub">FedAvg · Round {rounds.length}/5 Complete</div>
            <div className="fl-server-metrics">
              <span>Global Acc: <b>88.9%</b></span>
              <span>Loss: <b>0.263</b></span>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Round Selector + Per-client Chart */}
      <div className="two-col">
        <Card title="Training Convergence" badge="5 Rounds" badgeColor="blue" delay={0.2}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={convergence}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="round" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="acc" stroke="#3b82f6" tick={{ fontSize: 11 }} domain={[75, 92]} unit="%" />
              <YAxis yAxisId="loss" orientation="right" stroke="#ef4444" tick={{ fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Legend formatter={(v) => <span style={{ color: 'var(--text)', fontSize: 12, fontWeight: 600 }}>{v}</span>} />
              <Line yAxisId="acc" type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }} name="Global Accuracy (%)" />
              <Line yAxisId="loss" type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }} name="Global Loss" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Round Detail Breakdown */}
        <Card title="Round Detail Breakdown" badge={`Round ${activeRound + 1}`} badgeColor="purple" delay={0.3}>
          <div className="round-selector">
            {[0, 1, 2, 3, 4].map((rIdx) => (
              <button
                key={rIdx}
                className={`round-btn${activeRound === rIdx ? ' active' : ''}`}
                onClick={() => setActiveRound(rIdx)}
              >
                Round {rIdx + 1}
              </button>
            ))}
          </div>

          {currentRound && (
            <div className="round-summary">
              <div className="round-stat">
                <span>Global Accuracy</span>
                <b style={{ color: '#3b82f6' }}>{(currentRound.global_accuracy * 100).toFixed(2)}%</b>
              </div>
              <div className="round-stat">
                <span>Global Loss</span>
                <b style={{ color: '#ef4444' }}>{currentRound.global_loss.toFixed(4)}</b>
              </div>
              <div className="round-stat">
                <span>Participating Clients</span>
                <b style={{ color: '#10b981' }}>{currentRound.participating_hospitals} / 5</b>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={perClientData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} domain={[80, 95]} unit="%" />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="accuracy" fill="#818cf8" radius={[4, 4, 0, 0]} name="Accuracy (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
