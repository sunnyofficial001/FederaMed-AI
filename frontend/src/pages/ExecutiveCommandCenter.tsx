import React from 'react';
import { Activity, ShieldCheck, Server, Clock } from 'lucide-react';
import NetworkGraph from '../components/viz/NetworkGraph';

const StatCard = ({ title, value, sub, icon: Icon, trend }: any) => (
  <div className="bg-surface p-5 rounded-lg border border-border hover:border-primary/50 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-surfaceHighlight rounded-md">
        <Icon size={20} className="text-primary" />
      </div>
      {trend && (
        <span className={`text-xs font-mono ${trend > 0 ? 'text-success' : 'text-danger'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-text-dim text-sm font-medium mb-1">{title}</h3>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-xs text-text-dim">{sub}</div>
  </div>
);

export default function ExecutiveCommandCenter() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Executive Command Center</h1>
          <p className="text-text-dim text-sm mt-1">Real-time platform health and federated operations overview.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs bg-surfaceHighlight border border-border rounded hover:bg-border text-white transition">Export Report</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Hospitals" value="14" sub="Across 3 regions" icon={Server} trend={12} />
        <StatCard title="Global Model Accuracy" value="94.2%" sub="Sepsis Prediction v1.3" icon={Activity} trend={0.4} />
        <StatCard title="Privacy Budget (ε)" value="2.4 / 10.0" sub="Safe for 24 more rounds" icon={ShieldCheck} trend={-5} />
        <StatCard title="Avg. Round Latency" value="4m 12s" sub="Within SLA (<5m)" icon={Clock} trend={-8} />
      </div>

      {/* Main Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Federated Network Topology</h3>
          <NetworkGraph />
        </div>
        
        <div className="bg-surface rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Security Events</h3>
          <div className="space-y-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-success" />
                <div>
                  <p className="text-xs text-white font-medium">Model Registry Access</p>
                  <p className="text-[10px] text-text-dim">User admin@hospital.org promoted model v1.2</p>
                  <p className="text-[10px] text-text-dim mt-1">2 mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}