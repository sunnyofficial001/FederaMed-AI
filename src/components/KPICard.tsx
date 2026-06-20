import { motion } from 'framer-motion';

interface Props {
  label: string;
  value: string | number;
  suffix?: string;
  color?: string;
  sub?: string;
  delay?: number;
}

export default function KPICard({ label, value, suffix = '', color = '#3b82f6', sub, delay = 0 }: Props) {
  return (
    <motion.div
      className="kpi-card glass"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 20 }}
    >
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color }}>{value}{suffix}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </motion.div>
  );
}
