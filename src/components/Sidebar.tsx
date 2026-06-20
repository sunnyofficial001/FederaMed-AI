import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
  { to: '/',            label: 'Executive',      icon: '🏠' },
  { to: '/federated',   label: 'FL Command',     icon: '🌐' },
  { to: '/analytics',   label: 'Healthcare AI',  icon: '🏥' },
  { to: '/explain',     label: 'Explainability', icon: '🔍' },
  { to: '/monitoring',  label: 'Monitoring',     icon: '📡' },
  { to: '/governance',  label: 'Governance',     icon: '📋' },
  { to: '/predict',     label: 'Predict',        icon: '⚡' },
  { to: '/architecture',label: 'Architecture',   icon: '🏗️' },
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-mark" />
        <div>
          <span className="brand-name">FederaMed</span>
          <span className="brand-accent">-AI</span>
          <div className="brand-sub">Healthcare Intelligence</div>
        </div>
      </div>

      <div className="sidebar-links">
        {links.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }>
            {({ isActive }) => (
              <motion.div
                className="sidebar-link-inner"
                whileHover={{ x: 4 }}
                animate={isActive ? { x: 4 } : { x: 0 }}
              >
                <span className="link-icon">{icon}</span>
                <span className="link-label">{label}</span>
                {isActive && (
                  <motion.div
                    className="active-pill"
                    layoutId="active-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-status-row">
          <span className="dot green" />
          <span className="sidebar-status-text">All systems operational</span>
        </div>
        <div className="sidebar-dataset">📊 101,766 patients · 5 hospitals</div>
        <div className="sidebar-badges">
          <span className="micro-badge">HIPAA</span>
          <span className="micro-badge">GDPR</span>
          <span className="micro-badge">ISO 27001</span>
        </div>
      </div>
    </nav>
  );
}
