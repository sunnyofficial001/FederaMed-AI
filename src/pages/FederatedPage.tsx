import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts';
import Card from '../components/Card';
import { apiFetch, tooltipStyle, COLORS } from '../utils';

const fetchFLRounds = () => apiFetch('/fl/rounds', { rounds: [], total_rounds: 5 });
const fetchHospitals = () => apiFetch('/hospitals', []);

const hospitals = ['Hospital_A','Hospital_B','Hospital_C','Hospital_D','Hospital_E'];

export default function FederatedPage() {
  const { data: flData }    = useQuery({ queryKey: ['fl-rounds'],  queryFn: fetchFLRounds });
  const { data: hospData }  = useQuery({ queryKey: ['hospitals'],  queryFn: fetchHospitals });
  const [activeRound, setActiveRound] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [flowPulse, setFlowPulse] = useState<number | null>(null);

  const rounds = flData?.rounds ?? [];
  const convergence = rounds.map((r: { round: number; global_accuracy: number; global_loss: number }) => ({
    round: `Round ${r.round}`,
    accuracy: +(r.global_accuracy * 100).toFixed(2),
    loss: +r.global_loss.toFixed(4),
  }));

  // Animate round pulsing
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
        <div className="header-badges">
          <span className="badge badge-green">● 5/5 Clients Online</span>
          <span className="badge badge-blue">Strategy: FedProx</span>
          <span className="badge badge-purple">ε=1.5 Privacy</span>
        </div>
      </motion.div>

      {/* Animated FL Topology */}
      <Card title="Federated Network Topology" badge="Live Simulation" badgeColor="green" delay={0.1}>
        <div className="fl-topology">
          {/* Hospital Nodes */}
          <div className="fl-clients">
            {hospitals.map((h, i) => (
              <motion.div
                key={h}
                className={`fl-node client-node${flowPulse === i ? ' fl-active' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="fl-node-icon">🏥</div>
                <div className="fl-node-label">{h.replace('Hospital_', 'Hospital ')}</div>
                <div className="fl-node-metric">
                  {hospData?.[i] ? `${((hospData[i].accuracy ?? 0.88) * 100).toFixed(1)}%` : '88.5%'}
                </div>
                <div className="fl-node-samples">
                  {(hospData?.[i]?.samples ?? 20353).toLocaleString()} records
                </div>
                {/* Animated flow line */}
                <motion.div
                  className="fl-flow-line"
                  animate={flowPulse === i
                    ? { opacity: [0, 1, 0], scaleY: [0.3, 1, 0.3] }
                    : { opacity: 0.2 }
                  }
                  transition={{ duration: 0.6 }}
                />
              </motion.div>
            ))}
          </div>

          {/* Central aggregation arrow */}
          <div className="fl-arrow-zone">
            <div className="fl-arrows">
              {hospitals.map((_, i) => (
                <motion.div
                  key={i}
                  className="fl-arrow"
                  animate={flowPulse === i
                    ? { opacity: 1, y: [0, 6, 0] }
                    : { opacity: 0.3 }
                  }
                  transition={{ duration: 0.6 }}
                >↓</motion.div>
              ))}
            </div>
            <div className="fl-agg-label">Gradient Aggregation (FedProx)</div>
          </div>

          {/* Aggregation Server */}
          <motion.div
            className="fl-server"
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
              <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>} />
              <Line yAxisId="acc" type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }} name="Global Accuracy (%)" />
              <Line yAxisId="loss" type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }} name="Global Loss" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Round Detail" badge="Select Round" badgeColor="purple" delay={0.25}>
          <div className="round-selector">
            {[1,2,3,4,5].map(r => (
              <button
                key={r}
                className={`round-btn${activeRound === r-1 ? ' active' : ''}`}
                onClick={() => setActiveRound(r - 1)}
              >
                Round {r}
              </button>
            ))}
          </div>
          {currentRound && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRound}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
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
                    <span>Clients</span>
                    <b style={{ color: '#10b981' }}>{currentRound.clients_participated}/5</b>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={perClientData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#475569" tick={{ fontSize: 10 }} domain={[75, 92]} unit="%" />
                    <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, 'Accuracy']} />
                    <Bar dataKey="accuracy" fill="#3b82f6" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </AnimatePresence>
          )}
        </Card>
      </div>

      {/* Round History Table */}
      <Card title="Round History" badge="Complete" badgeColor="green" delay={0.4}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Round</th><th>Global Accuracy</th><th>Global Loss</th><th>Clients</th><th>Best Hospital</th><th>Δ Accuracy</th></tr>
            </thead>
            <tbody>
              {rounds.map((r: { round: number; global_accuracy: number; global_loss: number; clients_participated: number; hospital_metrics: Record<string, {accuracy: number}> }, i: number) => {
                const prev = rounds[i - 1];
                const delta = prev ? r.global_accuracy - prev.global_accuracy : null;
                const bestH = Object.entries(r.hospital_metrics ?? {}).sort(([,a],[,b]) =>
                  (b as {accuracy:number}).accuracy - (a as {accuracy:number}).accuracy)[0]?.[0] ?? '-';
                return (
                  <tr key={r.round}>
                    <td className="td-bold">Round {r.round}</td>
                    <td className="td-blue">{(r.global_accuracy * 100).toFixed(2)}%</td>
                    <td className="td-muted">{r.global_loss.toFixed(4)}</td>
                    <td className="td-green">{r.clients_participated}/5</td>
                    <td>{bestH.replace('Hospital_','H-')}</td>
                    <td style={{ color: delta !== null && delta > 0 ? '#10b981' : '#94a3b8' }}>
                      {delta !== null ? `+${(delta * 100).toFixed(2)}%` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
