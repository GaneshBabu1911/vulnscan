import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShield, FiSearch, FiBarChart2, FiLock, FiZap, FiGlobe,
  FiCheckCircle, FiArrowRight,
} from 'react-icons/fi';
import TerminalAnimation from '../components/TerminalAnimation';
import LandingNavbar from '../components/LandingNavbar';

const features = [
  { icon: FiSearch, title: 'Automated Scanning', desc: 'OWASP ZAP, Nmap, SSL/TLS, and header analysis in one unified platform.' },
  { icon: FiShield, title: 'OWASP Top 10', desc: 'Detect SQL injection, XSS, CSRF, and other critical web vulnerabilities.' },
  { icon: FiBarChart2, title: 'CVSS v3.1 Scoring', desc: 'Industry-standard risk scoring with automated severity classification.' },
  { icon: FiZap, title: 'AI Recommendations', desc: 'Intelligent remediation guidance powered by advanced AI analysis.' },
  { icon: FiLock, title: 'Enterprise Security', desc: 'JWT authentication, bcrypt hashing, rate limiting, and secure headers.' },
  { icon: FiGlobe, title: 'Cloud Ready', desc: 'Deploy on Docker, Render, Railway, AWS, or Azure with ease.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0F1111', color: '#FFFFFF' }}>
      <LandingNavbar />

      {/* ── HERO SECTION ───────────────────────────────────────────── */}
      <section id="home" className="relative pt-28 pb-24 px-6 overflow-hidden">
        {/* Subtle dot background */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'rgba(255,216,20,0.12)', border: '1px solid rgba(255,216,20,0.25)', color: '#FFD814' }}>
              <FiShield size={11} />
              Professional Cybersecurity Platform
            </div>

            <h1 className="font-bold mb-6 leading-tight" style={{ fontSize: 'clamp(36px, 5vw, 60px)', letterSpacing: '-0.03em', color: '#FFFFFF' }}>
              Professional{' '}
              <span style={{ color: '#FFD814' }}>Web Security</span>{' '}
              Assessment
            </h1>

            <p className="mb-8 leading-relaxed max-w-lg text-justify" style={{ color: '#9AA0A6', fontSize: '17px' }}>
              Automated vulnerability assessment powered by industry-standard security tools.
              OWASP ZAP, Nmap, CVSS v3.1 scoring, and AI-driven remediation — all in one platform.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/signup" className="btn-primary flex items-center gap-2" style={{ height: '48px', fontSize: '15px', padding: '0 24px' }}>
                Start Free Scan <FiArrowRight size={16} />
              </Link>
              <Link to="/login"
                className="flex items-center gap-2 font-semibold transition-all duration-200"
                style={{ height: '48px', fontSize: '15px', padding: '0 24px', background: 'transparent', border: '1px solid #303333', borderRadius: '8px', color: '#FFFFFF' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = '#FF9900';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#FFD814';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = '#303333';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#FFFFFF';
                }}
              >
                Login
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-6">
              {['OWASP ZAP Integrated', 'CVSS v3.1 Scoring', 'AI Recommendations'].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <FiCheckCircle size={14} style={{ color: '#16A34A' }} />
                  <span style={{ color: '#9AA0A6', fontSize: '13px' }}>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <TerminalAnimation />
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES SECTION ──────────────────────────────────────── */}
      <section id="features" className="py-24 px-6" style={{ background: '#F7F7F7' }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', color: '#111111', letterSpacing: '-0.02em' }}>
              Platform <span style={{ color: '#FF9900' }}>Features</span>
            </h2>
            <p className="text-justify" style={{ color: '#5F6368', fontSize: '16px', maxWidth: '560px', margin: '0 auto' }}>
              Comprehensive security assessment tools designed for penetration testers and security teams.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="feature-card"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(255,153,0,0.1)' }}>
                  <f.icon size={20} style={{ color: '#FF9900' }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ fontSize: '16px', color: '#111111' }}>{f.title}</h3>
                <p className="text-justify" style={{ fontSize: '14px', color: '#5F6368', lineHeight: '1.65' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ─────────────────────────────────────────── */}
      <section id="about" className="py-24 px-6" style={{ background: '#0F1111' }}>
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF9900' }}>
              About VulnScan
            </div>
            <h2 className="font-bold mb-6 leading-tight" style={{ fontSize: 'clamp(26px, 3vw, 38px)', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Enterprise-grade security for every team
            </h2>
            <p className="leading-relaxed mb-6 text-justify" style={{ color: '#9AA0A6', fontSize: '16px' }}>
              VulnScan is an AI-enhanced automated web vulnerability assessment platform built for
              security professionals, penetration testers, and organizations seeking to protect their
              web applications.
            </p>
            <p className="leading-relaxed text-justify" style={{ color: '#9AA0A6', fontSize: '16px' }}>
              Our platform integrates industry-standard tools including OWASP ZAP, Nmap, and CVSS v3.1
              scoring to deliver comprehensive security reports with actionable remediation guidance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { label: 'Security Checks', value: '200+' },
              { label: 'CVSS Coverage', value: 'v3.1' },
              { label: 'Integrations', value: 'OWASP & Nmap' },
              { label: 'Reports', value: 'PDF & JSON' },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-5" style={{ background: '#171A1A', border: '1px solid #303333' }}>
                <div className="font-bold mb-1" style={{ fontSize: '24px', color: '#FFD814', fontFamily: 'monospace' }}>{item.value}</div>
                <div style={{ color: '#9AA0A6', fontSize: '13px' }}>{item.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT SECTION ───────────────────────────────────────── */}
      <section id="contact" className="py-24 px-6" style={{ background: '#0F1111', borderTop: '1px solid #303333' }}>
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-bold mb-4" style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Contact Us
          </h2>
          <p className="mb-6 text-justify" style={{ color: '#9AA0A6', fontSize: '16px' }}>
            Have questions? Reach out to our security team.
          </p>
          <a
            href="mailto:admin@vulnscan.io"
            className="inline-flex items-center gap-2 font-semibold transition-colors"
            style={{ color: '#FFD814', fontSize: '16px' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FF9900')}
            onMouseLeave={e => (e.currentTarget.style.color = '#FFD814')}
          >
            admin@vulnscan.io
          </a>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="px-6 py-8" style={{ background: '#0F1111', borderTop: '1px solid #303333' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: '#FFD814' }}>
              <FiShield size={12} style={{ color: '#111111' }} />
            </div>
            <span style={{ color: '#9AA0A6', fontSize: '14px', fontWeight: 600 }}>VulnScan &copy; 2026</span>
          </div>
          <p style={{ color: '#5F6368', fontSize: '13px' }}>AI-Enhanced Automated Web Vulnerability Assessment Platform</p>
        </div>
      </footer>
    </div>
  );
}
