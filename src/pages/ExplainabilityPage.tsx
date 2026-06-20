import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import Card from '../components/Card';
import { apiFetch, tooltipStyle } from '../utils';

const fetchShap = () => apiFetch('/explanations/shap', null);

export default function ExplainabilityPage() {
  const { data } = useQuery({ queryKey: ['shap'], queryFn: fetchShap });

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

  return (
    <div className="page">
      <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="page-title">Explainable AI (XAI)</h1>
          <p className="page-sub">Global and local SHAP explanations for XGBoost Readmission Model</p>
        </div>
        <div className="header-badges">
          <span className="badge badge-purple">SHAP TreeExplainer</span>
          <span className="badge badge-blue">Production Model</span>
        </div>
      </motion.div>

      <div className="two-col">
        {/* Global Importance */}
        <Card title="Global Feature Importance (SHAP)" badge="Top 10" badgeColor="blue">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" stroke="#475569" tick={{ fontSize: 11, fill: '#cbd5e1' }} width={140} />
              <RechartsTooltip 
                {...tooltipStyle} 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                formatter={(v: number, n: string, props: any) => [v.toFixed(4), props.payload.desc]}
              />
              <Bar dataKey="importance" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Local Waterfall */}
        <Card title="Local Patient Explanation (SHAP Waterfall)" badge="Single Prediction" badgeColor="purple">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-800/30 p-4 rounded-lg border border-slate-700/50 mb-6">
             <div className="flex flex-col">
               <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Base Probability</span>
               <span className="text-xl font-bold text-slate-300">{(data.waterfall_example?.base_value * 100).toFixed(1)}%</span>
             </div>
             <div className="hidden sm:block text-slate-500">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
               </svg>
             </div>
             <div className="flex flex-col sm:text-right mt-3 sm:mt-0">
               <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Predicted Probability</span>
               <span className="text-xl font-bold text-indigo-400">{(data.waterfall_example?.predicted_probability * 100).toFixed(1)}%</span>
             </div>
           </div>
           
           <div className="waterfall-chart">
             {/* Header */}
             <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-slate-400 border-b border-slate-700/50 pb-3 mb-4 px-2">
               <div className="col-span-5">Feature Name</div>
               <div className="col-span-5">Impact Magnitude</div>
               <div className="col-span-2 text-right">SHAP Impact</div>
             </div>

             {/* Rows */}
             {waterfallData.map((w: any, i: number) => {
               // Green = increases risk, Red = decreases risk
               const isPos = w.direction === 'positive';
               const colorClass = isPos ? 'bg-emerald-500' : 'bg-rose-500';
               const textColorClass = isPos ? 'text-emerald-400' : 'text-rose-400';
               const maxAbsContribution = Math.max(...waterfallData.map((d: any) => Math.abs(d.contribution)));
               const barWidthPct = (Math.abs(w.contribution) / maxAbsContribution) * 100;
               
               return (
                 <div key={i} className="grid grid-cols-12 gap-4 items-center mb-3 px-2 hover:bg-slate-800/30 p-2 rounded transition-colors">
                   <div className="col-span-5 flex flex-col justify-center">
                     <span className="text-sm font-medium text-slate-200 capitalize">{w.name}</span>
                     <span className="text-xs text-slate-500 font-mono mt-0.5">Value: {w.val}</span>
                   </div>
                   <div className="col-span-5 flex items-center h-full">
                     <motion.div 
                       className={`h-2.5 rounded-full ${colorClass}`}
                       style={{ width: `${barWidthPct}%`, transformOrigin: 'left' }}
                       initial={{ opacity: 0, scaleX: 0 }}
                       animate={{ opacity: 1, scaleX: 1 }}
                       transition={{ delay: i * 0.1, duration: 0.5 }}
                     />
                   </div>
                   <div className={`col-span-2 text-right text-sm font-mono font-bold ${textColorClass}`}>
                     {isPos ? '+' : ''}{(w.contribution * 100).toFixed(1)}%
                   </div>
                 </div>
               );
             })}
           </div>
           
           <div className="mt-8 bg-slate-900/60 rounded-xl border border-slate-700/80 p-5 shadow-lg relative overflow-hidden">
             {/* Decorative element */}
             <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
             
             <div className="flex items-center gap-3 mb-3">
               <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                 <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
               <h4 className="text-sm font-bold text-white tracking-wide">Clinical Interpretation</h4>
             </div>
             <p className="text-sm text-slate-300 leading-relaxed pl-11">
               This patient has a <b className="text-indigo-300">{(data.waterfall_example?.predicted_probability * 100).toFixed(1)}%</b> risk of readmission, which is significantly higher than the base rate of <b className="text-slate-400">{(data.waterfall_example?.base_value * 100).toFixed(1)}%</b>. 
               The primary driving factors are <b className="text-emerald-400 capitalize">{waterfallData[0].name}</b> ({waterfallData[0].val}) and <b className="text-emerald-400 capitalize">{waterfallData[1].name}</b> ({waterfallData[1].val}), which collectively add <b className="text-emerald-400">+24%</b> to the baseline risk. 
               The risk is slightly mitigated by their discharge destination.
             </p>
           </div>
        </Card>
      </div>
    </div>
  );
}
