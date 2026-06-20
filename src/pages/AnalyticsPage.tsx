import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import Card from '../components/Card';
import { apiFetch, tooltipStyle } from '../utils';

const fetchAnalytics = () => apiFetch('/analytics', {});

export default function AnalyticsPage() {
  const { data } = useQuery({ queryKey: ['analytics'], queryFn: fetchAnalytics });

  if (!data) return <div className="page"><div className="page-title">Loading Analytics...</div></div>;

  const genderData = data.gender_distribution?.map((d: any) => ({
    name: d.name,
    value: d.value,
    color: d.name === 'Female' ? '#ec4899' : '#3b82f6'
  })) || [];

  return (
    <div className="page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="page-title">Healthcare AI Analytics</h1>
          <p className="page-sub">Clinical insights from 101,766 diabetes patients across 5 hospitals</p>
        </div>
      </motion.div>

      <div className="two-col">
        {/* Top Diagnoses Bar Chart */}
        <Card title="Top Primary Diagnoses (ICD-9)" badge="Clinical" badgeColor="amber">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.top_diagnoses} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis dataKey="code_desc" type="category" stroke="#475569" tick={{ fontSize: 11, fill: '#94a3b8' }} width={120} />
              <RechartsTooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} formatter={(v: number) => [v.toLocaleString(), 'Cases']} />
              <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]}>
                {data.top_diagnoses?.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f59e0b' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="analytics-grid-right">
            {/* Age Distribution */}
            <Card title="Age Distribution" badge="Demographics" badgeColor="purple">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.age_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="age_group" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                  <RechartsTooltip {...tooltipStyle} formatter={(v: number) => [v.toLocaleString(), 'Patients']} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            
            {/* Gender Pie Chart */}
            <Card title="Gender Profile" badge="Demographics" badgeColor="blue">
               <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                    {genderData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip {...tooltipStyle} formatter={(v: number) => [v.toLocaleString(), 'Patients']} />
                </PieChart>
               </ResponsiveContainer>
               <div className="flex-center gap-4 mt-2">
                 <div className="flex-center gap-2"><span className="dot" style={{background:'#ec4899'}}/> Female (53.8%)</div>
                 <div className="flex-center gap-2"><span className="dot" style={{background:'#3b82f6'}}/> Male (46.2%)</div>
               </div>
            </Card>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="three-col mt-6">
        <Card title="Time in Hospital (Days)" badge="Operations" badgeColor="cyan">
            <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.time_in_hospital_distribution}>
                  <XAxis dataKey="days" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                  <RechartsTooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} formatter={(v:number) => [v.toLocaleString(), 'Patients']} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
        <Card title="Insulin Usage" badge="Medication" badgeColor="green">
            <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.insulin_usage}>
                  <XAxis dataKey="category" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                  <RechartsTooltip {...tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} formatter={(v:number) => [v.toLocaleString(), 'Patients']} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
        <Card title="Admission Type" badge="Operations" badgeColor="red">
            <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.admission_type} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="count" nameKey="type">
                    {data.admission_type?.map((_:any, index:number) => <Cell key={index} fill={['#ef4444','#f59e0b','#3b82f6','#94a3b8','#64748b'][index%5]} />)}
                  </Pie>
                  <RechartsTooltip {...tooltipStyle} formatter={(v:number) => [v.toLocaleString(), 'Admissions']} />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex-center text-xs text-muted mt-2">Emergency (53k) · Elective (18k) · Urgent (18k)</div>
        </Card>
      </div>
    </div>
  );
}
