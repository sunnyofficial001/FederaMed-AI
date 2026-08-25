import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '5px 12px',
        borderRadius: '20px',
        background: isLight ? 'rgba(37, 99, 235, 0.12)' : 'rgba(59, 130, 246, 0.18)',
        border: isLight ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid rgba(59, 130, 246, 0.4)',
        color: isLight ? '#1e40af' : '#93c5fd',
        fontSize: '0.72rem',
        fontWeight: 700,
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        boxShadow: isLight ? '0 2px 8px rgba(37, 99, 235, 0.15)' : '0 0 12px rgba(59, 130, 246, 0.25)',
        transition: 'all 0.25s ease',
        ...style
      }}
    >
      <span style={{ fontSize: '0.85rem' }}>{isLight ? '☀️' : '🌙'}</span>
      <span>{isLight ? 'Light Mode' : 'Dark Mode'}</span>
    </motion.button>
  );
}
