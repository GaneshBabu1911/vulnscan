import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiSearch,
  FiBarChart2,
  FiLock,
  FiZap,
  FiGlobe,
  FiCheckCircle,
  FiArrowRight,
  FiActivity,
  FiCpu,
  FiFileText,
  FiLayers,
  FiServer,
  FiMail,
  FiUser,
  FiMessageSquare,
  FiSend,
  FiGithub,
  FiBookOpen,
  FiPhone,
  FiMapPin,
} from 'react-icons/fi';
import TerminalAnimation from '../components/TerminalAnimation';
import LandingNavbar from '../components/LandingNavbar';

const features = [
  {
    icon: FiSearch,
    title: 'Automated Scanning',
    desc: 'Unified security orchestration coupling OWASP ZAP dynamic analysis, Nmap network discovery, and SSL/TLS validation in a continuous assessment pipeline.',
  },
  {
    icon: FiShield,
    title: 'OWASP Top 10',
    desc: 'Deep heuristics identifying SQL injection, cross-site scripting (XSS), cross-site request forgery, broken authentication, and sensitive data exposures.',
  },
  {
    icon: FiBarChart2,
    title: 'CVSS v3.1 Scoring',
    desc: 'Standardized quantitative scoring matrix classifying discovered threats into critical, high, medium, and low tiers with full vector breakdowns.',
  },
  {
    icon: FiZap,
    title: 'AI Recommendations',
    desc: 'Context-aware neural guidance providing precise, code-level remediation steps and defense-in-depth architectural advisories.',
  },
  {
    icon: FiLock,
    title: 'Enterprise Security',
    desc: 'Hardened identity governance featuring JWT session tokens, bcrypt cryptographic password hashing, strict RBAC, and immutable audit trails.',
  },
  {
    icon: FiGlobe,
    title: 'Cloud Ready',
    desc: 'Lightweight containerized architecture built for seamless deployment on AWS, Azure, Google Cloud, Docker, and Kubernetes environments.',
  },
];

const workflowSteps = [
  { step: '01', title: 'Target URL', desc: 'Scope Definition', icon: FiGlobe },
  { step: '02', title: 'OWASP ZAP', desc: 'Dynamic Engine', icon: FiShield },
  { step: '03', title: 'Nmap', desc: 'Port Enumeration', icon: FiServer },
  { step: '04', title: 'SSL / TLS', desc: 'Cipher Validation', icon: FiLock },
  { step: '05', title: 'CVSS v3.1', desc: 'Mathematical Risk', icon: FiBarChart2 },
  { step: '06', title: 'AI Analysis', desc: 'Smart Mitigation', icon: FiCpu },
  { step: '07', title: 'PDF Report', desc: 'Executive Summary', icon: FiFileText },
];

const whyChooseUs = [
  {
    icon: FiZap,
    title: 'Fast',
    subtitle: 'Lightning High-Throughput',
    desc: 'Parallel execution engines conduct comprehensive vulnerability audits in minutes, removing dev bottlenecks.',
  },
  {
    icon: FiShield,
    title: 'Enterprise',
    subtitle: 'Production Hardened',
    desc: 'Engineered for SOC teams with multi-tenant RBAC, role isolation, audit trails, and strict compliance alignment.',
  },
  {
    icon: FiActivity,
    title: 'Accurate',
    subtitle: 'Zero False Positives',
    desc: 'Dual-engine validation paired with strict CVSS v3.1 mathematical scoring delivers precision security telemetry.',
  },
  {
    icon: FiLayers,
    title: 'Cloud Deployable',
    subtitle: 'Zero Friction Setup',
    desc: 'Container-ready Docker architecture effortlessly integrates with AWS Security Hub, ECS, and modern CI/CD pipelines.',
  },
];

export default function LandingPage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#131921] text-[#FFFFFF] font-sans selection:bg-[#FFB703] selection:text-[#131921] overflow-x-hidden relative">
      {/* Background Cyber Glows and Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #FFB703 1px, transparent 1px), linear-gradient(to bottom, #FFB703 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] opacity-25 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #FFB703 0%, rgba(245, 158, 11, 0.2) 40%, transparent 70%)',
          }}
        />
      </div>

      <LandingNavbar />

      {/* ── HERO SECTION ───────────────────────────────────────────── */}
      <section id="home" className="relative pt-[120px] pb-[80px] lg:pt-[150px] lg:pb-[110px] z-10">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-[72px]">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* LEFT 55% HERO CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="lg:col-span-7 flex flex-col items-start text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 bg-[#232F3E] border border-[#FFB703]/30 text-[#FFB703] shadow-md shadow-black/40">
                <FiShield size={13} className="text-[#FFB703]" />
                <span>Enterprise Cybersecurity Platform</span>
              </div>

              {/* Headline */}
              <h1 className="text-[36px] sm:text-[52px] lg:text-[72px] font-extrabold leading-[1.08] tracking-tight text-white mb-6">
                Professional <br />
                <span className="text-[#FFB703]">Web Security</span> <br />
                Assessment
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#D1D5DB] leading-relaxed max-w-2xl mb-9 font-normal">
                Enterprise-grade automated vulnerability assessment powered by industry standard tools.
                Harness OWASP ZAP dynamic scanning, Nmap network diagnostics, CVSS v3.1 mathematical scoring,
                and AI-driven remediation guidance in a unified, continuous posture evaluation platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#FFB703] hover:bg-[#F59E0B] text-[#131921] font-extrabold text-base transition-all duration-200 shadow-xl shadow-[#FFB703]/20 hover:shadow-2xl hover:shadow-[#FFB703]/35 flex items-center justify-center gap-2.5 group"
                >
                  <span>Start Free Scan</span>
                  <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent hover:bg-white/[0.05] border border-white/20 hover:border-[#FFB703] text-white hover:text-[#FFB703] font-bold text-base transition-all duration-200 text-center"
                >
                  Login
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 border-t border-[#232F3E] w-full">
                {[
                  'OWASP ZAP Integrated',
                  'Nmap Powered',
                  'CVSS v3.1 Scoring',
                  'AI Recommendations',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <FiCheckCircle size={15} className="text-[#FFB703] shrink-0" />
                    <span className="text-xs sm:text-[13px] text-[#D1D5DB] font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT 45% TERMINAL WINDOW */}
            <div className="lg:col-span-5 flex items-center justify-center w-full">
              <TerminalAnimation />
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ──────────────────────────────────────── */}
      <section id="features" className="py-[120px] relative z-10 bg-[#131921]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-[72px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#FFB703] mb-3">
              Capabilities &amp; Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Platform <span className="text-[#FFB703]">Features</span>
            </h2>
            <p className="text-[#9CA3AF] text-base sm:text-lg leading-relaxed">
              Comprehensive security assessment tools designed for enterprise security teams, penetration testers,
              and DevSecOps workflows.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-[#1B2533] p-[28px] rounded-[18px] border border-[#232F3E] hover:border-[#FFB703] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#FFB703]/10 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-[#FFB703]/10 border border-[#FFB703]/25 group-hover:bg-[#FFB703] transition-colors duration-300">
                    <feature.icon size={22} className="text-[#FFB703] group-hover:text-[#131921] transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-[#FFB703] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-[#9CA3AF] text-sm sm:text-[15px] leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center gap-2 text-xs font-semibold text-[#FFB703] opacity-80 group-hover:opacity-100">
                  <span>Enterprise Grade</span>
                  <FiArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ─────────────────────────────────────────── */}
      <section id="about" className="py-[120px] bg-[#131921] relative z-10 border-t border-[#232F3E]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-[72px]">
          {/* Centered About Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#FFB703] mb-3">
              About VulnScan
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Enterprise-Grade Security for Modern <span className="text-[#FFB703]">Cloud Infrastructure</span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Cybersecurity Illustration Graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 relative flex items-center justify-center"
            >
              <div className="w-full max-w-lg aspect-square rounded-[24px] bg-[#1B2533]/90 border border-[#232F3E] p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between">
                {/* Radar scanner visual effect */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 rounded-full border border-[#FFB703]/20 animate-ping opacity-30" />
                  <div className="w-52 h-52 rounded-full border border-[#FFB703]/30" />
                  <div className="w-32 h-32 rounded-full border border-[#FFB703]/40" />
                </div>

                {/* Top status bar */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-[#232F3E] px-3 py-1.5 rounded-lg border border-white/10">
                    <FiShield className="text-[#FFB703]" size={15} />
                    <span className="text-xs font-mono font-bold text-white">CORE SEC OPS</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#10B981]">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    STATUS: OPTIMAL
                  </div>
                </div>

                {/* Center Node Graphic */}
                <div className="relative z-10 text-center py-8">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-[#FFB703] flex items-center justify-center text-[#131921] shadow-2xl shadow-[#FFB703]/30 mb-4">
                    <FiShield size={38} className="stroke-[2.5]" />
                  </div>
                  <h4 className="text-lg font-extrabold text-white tracking-tight">VulnScan Continuous Shield</h4>
                  <p className="text-xs font-mono text-[#9CA3AF] mt-1">Autonomous Vulnerability Telemetry</p>
                </div>

                {/* Bottom live stats */}
                <div className="relative z-10 grid grid-cols-2 gap-3">
                  <div className="bg-[#131921]/90 p-3 rounded-xl border border-[#232F3E]">
                    <div className="text-[11px] font-mono text-[#9CA3AF]">VULNERABILITY ENGINE</div>
                    <div className="text-sm font-bold text-[#FFB703] font-mono">ACTIVE (200+ CHECKS)</div>
                  </div>
                  <div className="bg-[#131921]/90 p-3 rounded-xl border border-[#232F3E]">
                    <div className="text-[11px] font-mono text-[#9CA3AF]">AI REMEDIATION</div>
                    <div className="text-sm font-bold text-white font-mono">READY &amp; SYNCED</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right About Text & Statistics */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <p className="text-[#D1D5DB] text-base leading-relaxed mb-5">
                VulnScan was engineered to eliminate security blindspots in high-velocity software engineering
                environments. By integrating industry gold standards like OWASP ZAP and Nmap with neural AI analysis,
                our platform continuously audits web applications, classifies risk mathematically with CVSS v3.1,
                and generates actionable remediation patches.
              </p>
              <p className="text-[#9CA3AF] text-sm leading-relaxed mb-8">
                Designed for cybersecurity teams, compliance auditors, and devops engineers who require uncompromising
                rigor, low false positive rates, and immediate executive reporting.
              </p>

              {/* 4 Glass Statistics Cards */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '500+', label: 'Assessments Conducted' },
                  { value: '99%', label: 'Detection Accuracy Rate' },
                  { value: '24/7', label: 'Continuous Telemetry' },
                  { value: 'OWASP', label: 'Top 10 Full Coverage' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[#1B2533] p-5 rounded-[16px] border border-[#232F3E] hover:border-[#FFB703]/50 transition-colors shadow-lg"
                  >
                    <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#FFB703] mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs font-semibold text-[#D1D5DB]">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── WORKFLOW SECTION ───────────────────────────────────────── */}
      <section id="workflow" className="py-[120px] bg-[#131921] relative z-10 border-t border-[#232F3E]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-[72px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#FFB703] mb-3">
              Execution Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Automated Assessment <span className="text-[#FFB703]">Workflow</span>
            </h2>
            <p className="text-[#9CA3AF] text-base sm:text-lg leading-relaxed">
              From target ingestion to executive remediation report in seven autonomous phases.
            </p>
          </motion.div>

          {/* Horizontal scroll on mobile, 7-col grid on desktop */}
          <div className="relative overflow-x-auto pb-4 -mx-5 px-5 sm:mx-0 sm:px-0">
            <div className="flex lg:grid lg:grid-cols-7 gap-5 min-w-max lg:min-w-0 relative z-10">
              {workflowSteps.map((step, idx) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="bg-[#1B2533] p-6 rounded-[18px] border border-[#232F3E] hover:border-[#FFB703] transition-all duration-200 text-center flex flex-col items-center justify-between min-h-[200px] min-w-[150px] lg:min-w-0 group shadow-lg"
                >
                  <div className="w-full flex items-center justify-center text-[11px] font-mono text-[#9CA3AF] mb-4">
                    <span className="font-bold text-[#FFB703] mr-2">PHASE</span>
                    <span className="px-2 py-0.5 rounded bg-[#232F3E] text-white">{step.step}</span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-[#232F3E] border border-white/10 flex items-center justify-center text-[#FFB703] group-hover:bg-[#FFB703] group-hover:text-[#131921] transition-all duration-200 shadow-md mb-4">
                    <step.icon size={20} />
                  </div>

                  <div className="text-center">
                    <h4 className="text-sm font-bold text-white tracking-tight">{step.title}</h4>
                    <p className="text-[11px] text-[#9CA3AF] mt-1">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE VULNSCAN ────────────────────────────────────── */}
      <section className="py-[120px] bg-[#131921] relative z-10 border-t border-[#232F3E]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-[72px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#FFB703] mb-3">
              Competitive Advantage
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Why Choose <span className="text-[#FFB703]">VulnScan</span>
            </h2>
            <p className="text-[#9CA3AF] text-base sm:text-lg leading-relaxed">
              Engineered specifically to replace manual scanning bottlenecks with high-throughput automated intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.09 }}
                className="bg-[#1B2533] p-7 rounded-[18px] border border-[#232F3E] hover:border-[#FFB703] transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFB703]/10 border border-[#FFB703]/25 flex items-center justify-center text-[#FFB703] mb-5">
                  <card.icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{card.title}</h3>
                <div className="text-xs font-mono font-bold text-[#FFB703] mb-3 uppercase tracking-wider">
                  {card.subtitle}
                </div>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ───────────────────────────────────────── */}
      <section id="contact" className="py-[120px] bg-[#131921] relative z-10 border-t border-[#232F3E]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-[72px]">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-block text-xs font-bold uppercase tracking-widest text-[#FFB703] mb-3">
              Direct Line
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
              Contact <span className="text-[#FFB703]">Us</span>
            </h2>
            <p className="text-[#9CA3AF] text-base sm:text-lg leading-relaxed">
              Have questions regarding target scopes, enterprise API access, or custom integrations?
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 max-w-6xl mx-auto">
            {/* Left: Contact Info Cards */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Email */}
              <div className="flex items-center gap-4 bg-[#1B2533] p-6 rounded-[18px] border border-[#232F3E] hover:border-[#FFB703]/50 transition-colors shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-[#FFB703]/10 border border-[#FFB703]/25 flex items-center justify-center shrink-0 text-[#FFB703]">
                  <FiMail size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1">Email</span>
                  <a href="mailto:admin@vulnscan.io" className="text-[#FFB703] font-semibold text-sm hover:underline truncate">
                    admin@vulnscan.io
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4 bg-[#1B2533] p-6 rounded-[18px] border border-[#232F3E] hover:border-[#FFB703]/50 transition-colors shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-[#FFB703]/10 border border-[#FFB703]/25 flex items-center justify-center shrink-0 text-[#FFB703]">
                  <FiPhone size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1">Phone</span>
                  <span className="text-white font-semibold text-sm truncate">+91 XXXXX XXXXX</span>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-4 bg-[#1B2533] p-6 rounded-[18px] border border-[#232F3E] hover:border-[#FFB703]/50 transition-colors shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-[#FFB703]/10 border border-[#FFB703]/25 flex items-center justify-center shrink-0 text-[#FFB703]">
                  <FiMapPin size={20} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-1">Address</span>
                  <span className="text-white font-semibold text-sm truncate">Cyber Security Lab</span>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#1B2533] p-8 sm:p-10 rounded-[24px] border border-[#232F3E] shadow-2xl"
              >
                {contactSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center mx-auto mb-4 border border-[#10B981]/40">
                      <FiCheckCircle size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Message Dispatched</h3>
                    <p className="text-[#D1D5DB] text-sm max-w-md mx-auto">
                      Thank you. A security specialist has received your inquiry and will respond to your email promptly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-2">
                          Full Name
                        </label>
                        <div className="flex items-center bg-[#131921] border border-[#232F3E] rounded-xl focus-within:border-[#FFB703] transition-colors h-12 px-4 gap-3.5 group">
                          <div className="w-5 h-5 flex items-center justify-center shrink-0 text-[#9CA3AF] group-focus-within:text-[#FFB703] transition-colors">
                            <FiUser size={18} />
                          </div>
                          <input
                            type="text"
                            required
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            placeholder="Alex Mercer"
                            className="w-full h-full bg-transparent border-0 text-white text-sm outline-none placeholder:text-[#9CA3AF]/60 focus:ring-0 p-0"
                          />
                        </div>
                      </div>

                      {/* Business Email */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-2">
                          Business Email
                        </label>
                        <div className="flex items-center bg-[#131921] border border-[#232F3E] rounded-xl focus-within:border-[#FFB703] transition-colors h-12 px-4 gap-3.5 group">
                          <div className="w-5 h-5 flex items-center justify-center shrink-0 text-[#9CA3AF] group-focus-within:text-[#FFB703] transition-colors">
                            <FiMail size={18} />
                          </div>
                          <input
                            type="email"
                            required
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            placeholder="alex@enterprise.com"
                            className="w-full h-full bg-transparent border-0 text-white text-sm outline-none placeholder:text-[#9CA3AF]/60 focus:ring-0 p-0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#D1D5DB] mb-2">
                        Message
                      </label>
                      <div className="flex items-start bg-[#131921] border border-[#232F3E] rounded-xl focus-within:border-[#FFB703] transition-colors px-4 py-3.5 gap-3.5 group">
                        <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 text-[#9CA3AF] group-focus-within:text-[#FFB703] transition-colors">
                          <FiMessageSquare size={18} />
                        </div>
                        <textarea
                          required
                          rows={4}
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          placeholder="Detail your infrastructure scope or questions..."
                          className="w-full bg-transparent border-0 text-white text-sm outline-none resize-none p-0 placeholder:text-[#9CA3AF]/60 focus:ring-0"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FFB703] hover:bg-[#F59E0B] text-[#131921] font-extrabold text-sm transition-all duration-200 shadow-xl shadow-[#FFB703]/20 flex items-center justify-center gap-2.5 cursor-pointer group"
                      >
                        <span>Send Message</span>
                        <FiSend size={16} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="bg-[#131921] border-t border-[#232F3E] pt-16 pb-12 relative z-10">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-[72px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#232F3E]">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FFB703]">
                  <FiShield size={17} className="text-[#131921] stroke-[2.5]" />
                </div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  Vuln<span className="text-[#FFB703]">Scan</span>
                </span>
              </Link>
              <p className="text-sm text-[#9CA3AF] leading-relaxed max-w-sm mb-6">
                Next-generation automated cybersecurity platform empowering engineering teams with continuous
                vulnerability scanning, CVSS v3.1 risk computation, and AI remediation blueprints.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-[#1B2533] border border-[#232F3E] flex items-center justify-center text-[#D1D5DB] hover:text-[#FFB703] hover:border-[#FFB703] transition-colors"
                >
                  <FiGithub size={16} />
                </a>
                <a
                  href="#features"
                  className="w-9 h-9 rounded-lg bg-[#1B2533] border border-[#232F3E] flex items-center justify-center text-[#D1D5DB] hover:text-[#FFB703] hover:border-[#FFB703] transition-colors"
                >
                  <FiBookOpen size={16} />
                </a>
              </div>
            </div>

            {/* Col 2: Quick Links — Pricing removed */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Navigation</h5>
              <ul className="space-y-2.5 text-sm">
                {['Home', 'Features', 'About', 'Contact'].map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-[#9CA3AF] hover:text-[#FFB703] transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Documentation & Engines */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Security Engines</h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#features" className="text-[#9CA3AF] hover:text-[#FFB703] transition-colors">
                    OWASP ZAP 2.14
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-[#9CA3AF] hover:text-[#FFB703] transition-colors">
                    Nmap Network Engine
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-[#9CA3AF] hover:text-[#FFB703] transition-colors">
                    CVSS v3.1 Standards
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-[#9CA3AF] hover:text-[#FFB703] transition-colors">
                    SSL/TLS Cipher Audit
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-[#9CA3AF] hover:text-[#FFB703] transition-colors">
                    AI Remediation Engine
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform & Compliance */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Resources</h5>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/login" className="text-[#9CA3AF] hover:text-[#FFB703] transition-colors">
                    Console Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="text-[#9CA3AF] hover:text-[#FFB703] transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <a href="mailto:admin@vulnscan.io" className="text-[#9CA3AF] hover:text-[#FFB703] transition-colors">
                    Support Email
                  </a>
                </li>
                <li>
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    v3.4.0 <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#232F3E] text-[#10B981]">Stable</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9CA3AF]">
            <div>&copy; 2026 VulnScan Security, Inc. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <span className="hover:text-[#FFB703] cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-[#FFB703] cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-[#FFB703] cursor-pointer transition-colors">Security Disclosure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
