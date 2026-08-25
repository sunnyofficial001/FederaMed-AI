import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

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

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#090d16',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* ── Top Navigation Bar ────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(9, 13, 22, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '1rem 2rem'
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
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                FederaMed<span style={{ color: '#60a5fa' }}>-AI</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
                HEALTHCARE INTELLIGENCE
              </div>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden-mobile">
            <a href="#features" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Features</a>
            <a href="#metrics" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Metrics</a>
            <a href="#compliance" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s' }}>Security</a>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/predict')}
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.12)',
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

        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -50, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute',
            top: '150px',
            right: '8%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 70%)',
            filter: 'blur(85px)',
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
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            padding: '0.45rem 1.2rem',
            borderRadius: '9999px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.25)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981'
            }} />
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#e2e8f0' }}>
              FederaMed-AI Enterprise Federated Intelligence v2.0
            </span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.3)', color: '#a5b4fc', padding: '2px 9px', borderRadius: '12px', fontWeight: 700 }}>
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
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 35%, #93c5fd 70%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Privacy-Preserving Federated Healthcare Intelligence
          </h1>
          <p style={{
            fontSize: 'clamp(1.1rem, 2.2vw, 1.3rem)',
            color: '#94a3b8',
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
            whileHover={{ scale: 1.05, background: 'rgba(255, 255, 255, 0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/predict')}
            style={{
              background: 'rgba(30, 41, 59, 0.85)',
              color: '#f1f5f9',
              border: '1px solid rgba(255, 255, 255, 0.15)',
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
            { label: 'Patient EHR Records', val: '101,766', sub: 'Diabetes 130-US Cohorts', color: '#3b82f6', icon: '📊' },
            { label: 'Federated Hospital Fleet', val: '5 Sites', sub: 'Non-IID Data Partitions', color: '#10b981', icon: '🏥' },
            { label: 'Rényi Differential Privacy', val: 'ε = 1.5', sub: 'Mathematical Loss Bound', color: '#a78bfa', icon: '🔒' },
            { label: 'EHR Data Egress', val: '0 Bytes', sub: 'Shamir 256-bit SecAgg', color: '#f59e0b', icon: '🛡️' },
          ].map((m, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, scale: 1.02 }}
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.85) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '1.6rem',
                backdropFilter: 'blur(12px)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: `linear-gradient(90deg, ${m.color}, transparent)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
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
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Architected for Clinical AI Safety & Compliance
            </h2>
            <p style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: '640px', margin: '0 auto' }}>
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
                color: '#3b82f6',
                route: '/monitoring'
              },
              {
                title: 'Secure Multiparty Aggregation',
                desc: 'Employs t-out-of-n Shamir Secret Sharing so the central server only reconstructs aggregated weight sums, never individual node gradients.',
                icon: '🛡️',
                badge: 'Cryptography',
                color: '#10b981',
                route: '/federated'
              },
              {
                title: 'Non-IID Drift Correction (FedProx/SCAFFOLD)',
                desc: 'Eliminates local-global objective mismatches across diverse hospital cohorts using control variates and proximal regularization terms.',
                icon: '⚖️',
                badge: 'Optimization',
                color: '#f59e0b',
                route: '/federated'
              },
              {
                title: 'Explainable AI (SHAP & Grad-CAM)',
                desc: 'Generates game-theoretic feature attribution rankings and waterfall charts for transparent clinical decision support.',
                icon: '🔍',
                badge: 'XAI Engine',
                color: '#a78bfa',
                route: '/explain'
              },
              {
                title: 'Automated Governance & MLOps',
                desc: 'Integrates MLflow experiment tracking, model staging workflows, and automated HIPAA/GDPR audit trail logging.',
                icon: '📋',
                badge: 'Governance',
                color: '#fb7185',
                route: '/governance'
              },
              {
                title: 'Real-Time Patient Risk Stratification',
                desc: 'Deploys production XGBoost classifiers predicting 30-day hospital readmission probabilities with instant clinical recommendations.',
                icon: '⚡',
                badge: 'Clinical CDS',
                color: '#06b6d4',
                route: '/predict'
              }
            ].map((f, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                onClick={() => navigate(f.route)}
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.55) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '18px',
                  padding: '1.85rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: `rgba(${f.color === '#3b82f6' ? '59,130,246' : f.color === '#10b981' ? '16,185,129' : f.color === '#f59e0b' ? '245,158,11' : f.color === '#a78bfa' ? '167,139,250' : f.color === '#fb7185' ? '251,113,133' : '6,182,212'}, 0.15)`,
                      border: `1px solid ${f.color}44`,
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
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.6rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: '1.65', margin: 0 }}>{f.desc}</p>
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
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.75) 100%)',
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
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.6rem' }}>🛡️</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                Enterprise Healthcare Compliance Guaranteed
              </h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0, maxWidth: '680px', lineHeight: 1.6 }}>
              All client updates undergo automated differential privacy budgeting, gradient norm clipping, and zero-trust cryptographic verification before global model synthesis.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
              HIPAA Safe Harbor
            </span>
            <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.35)', padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
              GDPR Article 25
            </span>
            <span style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#c4b5fd', border: '1px solid rgba(167, 139, 250, 0.35)', padding: '0.6rem 1.25rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700 }}>
              ISO 27001
            </span>
          </div>
        </motion.div>

        {/* Footer CTA Box */}
        <motion.div variants={itemVariants} style={{
          textAlign: 'center',
          padding: '3.5rem 2rem',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
          borderRadius: '24px',
          border: '1px solid rgba(99, 102, 241, 0.3)'
        }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
            Ready to Explore the Platform?
          </h2>
          <p style={{ fontSize: '0.98rem', color: '#94a3b8', marginBottom: '2rem', maxWidth: '550px', margin: '0 auto 2rem' }}>
            Access full executive dashboards, FL command topology, SHAP explainability, and real-time inference sandbox.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(59, 130, 246, 0.6)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/executive')}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '1.1rem 2.6rem',
              borderRadius: '14px',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 6px 25px rgba(59, 130, 246, 0.45)'
            }}
          >
            🚀 Open Executive Dashboard Now
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
