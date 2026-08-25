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
    <div className="page" style={{ paddingBottom: '4rem', overflowX: 'hidden' }}>
      {/* Dynamic Background Glow Blobs */}
      <div style={{ position: 'relative', width: '100%' }}>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.3, 0.15],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '-60px',
            left: '10%',
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(147, 51, 234, 0.15) 50%, transparent 70%)',
            filter: 'blur(70px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.2, 0.35, 0.2],
            x: [0, -40, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute',
            top: '120px',
            right: '5%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(59, 130, 246, 0.15) 50%, transparent 70%)',
            filter: 'blur(75px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      </div>

      {/* Hero Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}
      >
        {/* Top Announcement Pill */}
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
              FederaMed-AI v2.0 Enterprise Release Live
            </span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.25)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
              HIPAA Verified
            </span>
          </div>
        </motion.div>

        {/* Hero Main Headline */}
        <motion.div variants={itemVariants} style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: '0 auto 1.25rem',
            maxWidth: '900px',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 40%, #93c5fd 70%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Privacy-Preserving Federated Healthcare Intelligence
          </h1>
          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: '#94a3b8',
            maxWidth: '750px',
            margin: '0 auto',
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            Train high-precision clinical neural networks across multi-center hospital networks with zero patient data leaving local electronic health record (EHR) firewalls.
          </p>
        </motion.div>

        {/* Action Call Buttons */}
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/executive')}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '0.9rem 2.2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
            }}
          >
            🚀 Launch Live Executive Dashboard
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, background: 'rgba(255, 255, 255, 0.08)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/predict')}
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              color: '#e2e8f0',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '0.9rem 2.2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backdropFilter: 'blur(10px)'
            }}
          >
            ⚡ Test AI Risk Predictor
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, background: 'rgba(167, 139, 250, 0.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/federated')}
            style={{
              background: 'rgba(167, 139, 250, 0.08)',
              color: '#c4b5fd',
              border: '1px solid rgba(167, 139, 250, 0.3)',
              padding: '0.9rem 2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            🌐 FL Command Center
          </motion.button>
        </motion.div>

        {/* Live Metrics Ticker Bar */}
        <motion.div variants={itemVariants} style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '4rem'
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
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(12px)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: `linear-gradient(90deg, ${m.color}, transparent)` }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
                <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: m.color, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{m.val}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Grid Section */}
        <motion.div variants={itemVariants} style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Architected for Clinical AI Safety & Compliance
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
              Built upon mathematical security guarantees and production-grade MLOps pipelines.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
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
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.75) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: `rgba(${f.color === '#3b82f6' ? '59,130,246' : f.color === '#10b981' ? '16,185,129' : f.color === '#f59e0b' ? '245,158,11' : f.color === '#a78bfa' ? '167,139,250' : f.color === '#fb7185' ? '251,113,133' : '6,182,212'}, 0.15)`,
                      border: `1px solid ${f.color}44`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
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
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>{f.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.25rem', fontSize: '0.8rem', fontWeight: 600, color: f.color }}>
                  <span>Explore Feature</span>
                  <span>➔</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security & Compliance Banner */}
        <motion.div variants={itemVariants} style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '20px',
          padding: '2rem 2.5rem',
          marginBottom: '3rem',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🛡️</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                Enterprise Healthcare Compliance Guaranteed
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, maxWidth: '650px' }}>
              All client updates undergo automated differential privacy budgeting, gradient norm clipping, and zero-trust cryptographic verification before global model synthesis.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700 }}>
              HIPAA Safe Harbor
            </span>
            <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700 }}>
              GDPR Article 25
            </span>
            <span style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#c4b5fd', border: '1px solid rgba(167, 139, 250, 0.3)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700 }}>
              ISO 27001
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
