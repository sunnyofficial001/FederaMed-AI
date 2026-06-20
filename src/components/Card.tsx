import { motion } from 'framer-motion';

interface Props {
  title: string;
  badge?: string;
  badgeColor?: 'green' | 'blue' | 'purple' | 'amber' | 'red';
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function Card({ title, badge, badgeColor = 'blue', children, className = '', delay = 0 }: Props) {
  return (
    <motion.div
      className={`card glass ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {badge && <span className={`badge badge-${badgeColor}`}>{badge}</span>}
      </div>
      {children}
    </motion.div>
  );
}
