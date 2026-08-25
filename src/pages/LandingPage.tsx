import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 260, damping: 20 }
    }
  };

  const isLight = theme === 'light';

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: isLight ? '#f1f5f9' : '#090d16',
      color: isLight ? '#0f172a' : '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflowX: 'hidden',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(9, 13, 22, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1rem 2rem',
          transition: 'all 0.3s ease'
        }}
      >
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #818cf8 100%)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 900
            }}>
              🏥
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: isLight ? '#0f172a' : '#ffffff' }}>
                FederaMed<span style={{ color: '#2563eb' }}>-AI</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
                HEALTHCARE INTELLIGENCE
              </div>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#features" style={{ color: isLight ? '#475569' : '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Features</a>
            <a href="#metrics" style={{ color: isLight ? '#475569' : '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Metrics</a>
            <a href="#compliance" style={{ color: isLight ? '#475569' : '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Security</a>
          </div>

          {/* CTAs & Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              style={{
                background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
                color: isLight ? '#0f172a' : '#f8fafc',
                border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.12)',
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>{isLight ? '☀️ Light' : '🌙 Dark'}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/predict')}
              style={{
                background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
                color: isLight ? '#1e293b' : '#e2e8f0',
                border: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(255, 255, 255, 0.12)',
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ⚡ Test Predictor
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/executive')}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.4rem',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🚀 Launch Dashboard ➔
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Dynamic Background Glow Blobs */}
      <div style={{ position: 'relative', width: '100%' }}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.35, 0.15],
            x: [0, 40, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '-40px',
            left: '15%',
            width: '550px',
            height: '550px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(147, 51, 234, 0.15) 50%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      </div>

      {/* Hero Body Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '4rem 2rem'
        }}
      >
        {/* Top Status Pill */}
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.7)',
            border: isLight ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(99, 102, 241, 0.35)',
            padding: '0.45rem 1.2rem',
            borderRadius: '9999px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.15)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981'
            }} />
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: isLight ? '#1e293b' : '#e2e8f0' }}>
              FederaMed-AI Enterprise Federated Intelligence v2.0
            </span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', color: isLight ? '#4f46e5' : '#a5b4fc', padding: '2px 9px', borderRadius: '12px', fontWeight: 700 }}>
              HIPAA Verified
            </span>
          </div>
        </motion.div>

        {/* Hero Main Headline */}
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            margin: '0 auto 1.5rem',
            maxWidth: '960px',
            background: isLight 
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #2563eb 70%, #7c3aed 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 35%, #93c5fd 70%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Privacy-Preserving Federated Healthcare Intelligence
          </h1>
          <p style={{
            fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)',
            color: '#64748b',
            maxWidth: '780px',
            margin: '0 auto',
            lineHeight: 1.65,
            fontWeight: 400
          }}>
            Train high-precision clinical neural networks across multi-center hospital networks with zero patient data leaving local electronic health record (EHR) firewalls.
          </p>
        </motion.div>

        {/* Primary Action Buttons */}
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '4.5rem' }}>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(59, 130, 246, 0.6)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/executive')}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '1.1rem 2.5rem',
              borderRadius: '14px',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 6px 25px rgba(59, 130, 246, 0.45)'
            }}
          >
            🚀 Launch Dashboard Platform ➔
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/predict')}
            style={{
              background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(30, 41, 59, 0.85)',
              color: isLight ? '#0f172a' : '#f1f5f9',
              border: isLight ? '1px solid rgba(0, 0, 0, 0.15)' : '1px solid rgba(255, 255, 255, 0.15)',
              padding: '1.1rem 2.2rem',
              borderRadius: '14px',
              fontSize: '1.05rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            ⚡ AI Risk Predictor Sandbox
          </motion.button>
        </motion.div>

        {/* Live Metrics Ticker Bar */}
        <motion.div id="metrics" variants={itemVariants} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '5rem'
        }}>
          {[
            { label: 'Patient EHR Records', val: '101,766', sub: 'Diabetes 130-US Cohorts', color: '#2563eb', icon: '📊' },
            { label: 'Federated Hospital Fleet', val: '5 Sites', sub: 'Non-IID Data Partitions', color: '#059669', icon: '🏥' },
            { label: 'Rényi Differential Privacy', val: 'ε = 1.5', sub: 'Mathematical Loss Bound', color: '#7c3aed', icon: '🔒' },
            { label: 'EHR Data Egress', val: '0 Bytes', sub: 'Shamir 256-bit SecAgg', color: '#d97706', icon: '🛡️' },
          ].map((m, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, scale: 1.02 }}
              style={{
                background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.85) 100%)',
                border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '1.6rem',
                backdropFilter: 'blur(12px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isLight ? '0 4px 15px rgba(0, 0, 0, 0.05)' : '0 4px 20px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: `linear-gradient(90deg, ${m.color}, transparent)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
                <span style={{ fontSize: '1.25rem' }}>{m.icon}</span>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: m.color, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{m.val}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{m.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Grid Section */}
        <motion.div id="features" variants={itemVariants} style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc', marginBottom: '0.5rem' }}>
              Architected for Clinical AI Safety & Compliance
            </h2>
            <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '640px', margin: '0 auto' }}>
              Built upon mathematical security guarantees and production-grade MLOps pipelines.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '1.75rem' }}>
            {[
              {
                title: 'Rényi Differential Privacy',
                desc: 'Guarantees mathematical protection against membership inference and gradient inversion attacks by adding calibrated Laplace/Gaussian noise.',
                icon: '🔒',
                badge: 'Privacy Core',
                color: '#2563eb',
                route: '/monitoring'
              },
              {
                title: 'Secure Multiparty Aggregation',
                desc: 'Employs t-out-of-n Shamir Secret Sharing so the central server only reconstructs aggregated weight sums, never individual node gradients.',
                icon: '🛡️',
                badge: 'Cryptography',
                color: '#059669',
                route: '/federated'
              },
              {
                title: 'Non-IID Drift Correction (FedProx/SCAFFOLD)',
                desc: 'Eliminates local-global objective mismatches across diverse hospital cohorts using control variates and proximal regularization terms.',
                icon: '⚖️',
                badge: 'Optimization',
                color: '#d97706',
                route: '/federated'
              },
              {
                title: 'Explainable AI (SHAP & Grad-CAM)',
                desc: 'Generates game-theoretic feature attribution rankings and waterfall charts for transparent clinical decision support.',
                icon: '🔍',
                badge: 'XAI Engine',
                color: '#7c3aed',
                route: '/explain'
              },
              {
                title: 'Automated Governance & MLOps',
                desc: 'Integrates MLflow experiment tracking, model staging workflows, and automated HIPAA/GDPR audit trail logging.',
                icon: '📋',
                badge: 'Governance',
                color: '#e11d48',
                route: '/governance'
              },
              {
                title: 'Real-Time Patient Risk Stratification',
                desc: 'Deploys production XGBoost classifiers predicting 30-day hospital readmission probabilities with instant clinical recommendations.',
                icon: '⚡',
                badge: 'Clinical CDS',
                color: '#0891b2',
                route: '/predict'
              }
            ].map((f, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                onClick={() => navigate(f.route)}
                style={{
                  background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'linear-gradient(145deg, rgba(30, 41, 59, 0.55) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '1.85rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: isLight ? '0 4px 15px rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: `rgba(${f.color === '#2563eb' ? '37,99,235' : f.color === '#059669' ? '5,150,105' : f.color === '#d97706' ? '217,119,6' : f.color === '#7c3aed' ? '124,58,237' : f.color === '#e11d48' ? '225,29,72' : '8,145,178'}, 0.12)`,
                      border: `1px solid ${f.color}33`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px'
                    }}>
                      {f.icon}
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: f.color,
                      background: `${f.color}15`,
                      border: `1px solid ${f.color}33`,
                      padding: '3px 10px',
                      borderRadius: '12px'
                    }}>
                      {f.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: isLight ? '#0f172a' : '#f8fafc', marginBottom: '0.6rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.65', margin: 0 }}>{f.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.5rem', fontSize: '0.82rem', fontWeight: 700, color: f.color }}>
                  <span>Open Feature Page</span>
                  <span>➔</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security & Compliance Banner */}
        <motion.div id="compliance" variants={itemVariants} style={{
          background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.75) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '24px',
          padding: '2.5rem 3rem',
          marginBottom: '4rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '2rem',
          boxShadow: isLight ? '0 8px 25px rgba(0,0,0,0.06)' : '0 10px 40px rgba(0, 0, 0, 0.4)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🛡️</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc', margin: 0 }}>
                Enterprise Healthcare Compliance Guaranteed
              </h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0, maxWidth: '680px', lineHeight: 1.6 }}>
              All client updates undergo automated differential privacy budgeting, gradient norm clipping, and zero-trust cryptographic verification before global model synthesis.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
              HIPAA Safe Harbor
            </span>
            <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.35)', padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
              GDPR Article 25
            </span>
            <span style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#7c3aed', border: '1px solid rgba(167, 139, 250, 0.35)', padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
              ISO 27001
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
