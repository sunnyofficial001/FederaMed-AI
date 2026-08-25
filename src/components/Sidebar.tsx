import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/executive',   label: 'Executive',      icon: '🏠' },
  { to: '/federated',   label: 'FL Command',     icon: '🌐' },
  { to: '/analytics',   label: 'Healthcare AI',  icon: '🏥' },
  { to: '/explain',     label: 'Explainability', icon: '🔍' },
  { to: '/monitoring',  label: 'Monitoring',     icon: '📡' },
  { to: '/governance',  label: 'Governance',     icon: '📋' },
  { to: '/predict',     label: 'Predict',        icon: '⚡' },
  { to: '/architecture',label: 'Architecture',   icon: '🏗️' },
];

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sidebar">
      {/* Top Brand Block */}
      <div className="sidebar-brand">
        <div className="logo-mark" />
        <div>
          <span className="brand-name">FederaMed</span>
          <span className="brand-accent">-AI</span>
          <div className="brand-sub">Healthcare Intelligence</div>
        </div>
      </div>

      {/* Landing Page & Theme Toggle Buttons */}
      <div style={{ padding: '0.75rem 0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <NavLink to="/" style={{ textDecoration: 'none' }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '10px',
              padding: '0.55rem 0.85rem',
              color: 'var(--blue)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <span>✨</span>
            <span>Landing Page</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.7 }}>➔</span>
          </motion.div>
        </NavLink>

        {/* Theme Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '0.5rem 0.85rem',
            color: 'var(--text)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
            <span>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
          </div>
          <span style={{
            fontSize: '0.65rem',
            background: 'rgba(59, 130, 246, 0.2)',
            color: 'var(--blue)',
            padding: '2px 6px',
            borderRadius: '6px',
            fontWeight: 700
          }}>
            {theme.toUpperCase()}
          </span>
        </motion.button>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-links">
        {links.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
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

      {/* Sidebar Footer Badges */}
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
