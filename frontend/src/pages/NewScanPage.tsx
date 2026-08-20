import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch, FiGlobe, FiServer, FiShield,
  FiCheckCircle, FiXCircle, FiClock,
} from 'react-icons/fi';
import { scanAPI } from '../services/api';
import { useScanPolling } from '../hooks/useScanPolling';

const SCAN_PHASES = [
  { label: 'HTTP Headers', pct: 25 },
  { label: 'SSL/TLS', pct: 40 },
  { label: 'OWASP ZAP', pct: 65 },
  { label: 'Nmap', pct: 85 },
  { label: 'AI Analysis', pct: 100 },
];

function PhaseIndicator({ progress }: { progress: number }) {
  return (
    <div className="mt-4 space-y-2">
      {SCAN_PHASES.map((phase, i) => {
        const done = progress >= phase.pct;
        const active = progress >= (SCAN_PHASES[i - 1]?.pct ?? 0) && progress < phase.pct;
        return (
          <div key={phase.label} className="flex items-center gap-3">
            {done ? (
              <FiCheckCircle size={14} className="text-neon-green shrink-0" />
            ) : active ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-neon-blue shrink-0 animate-spin" style={{ borderTopColor: 'transparent' }} />
            ) : (
              <FiClock size={14} className="text-gray-600 shrink-0" />
            )}
            <span className={`text-xs ${done ? 'text-neon-green' : active ? 'text-neon-blue' : 'text-gray-500'}`}>
              Phase {i + 1}: {phase.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function NewScanPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [domain, setDomain] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanId, setScanId] = useState<number | null>(null);

  const onComplete = useCallback((id: number) => {
    setTimeout(() => navigate(`/history/${id}`), 1500);
  }, [navigate]);

  const { progress, status, logs, logRef } = useScanPolling(scanId, { onComplete });

  const handleStart = async () => {
    setError('');
    if (!url.trim()) { setError('URL is required'); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must start with http:// or https://');
      return;
    }

    setLoading(true);
    try {
      const { data } = await scanAPI.start({
        url: url.trim(),
        domain: domain.trim() || undefined,
        ip_address: ipAddress.trim() || undefined,
      });
      setScanId(data.scan.id);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to start scan');
    } finally {
      setLoading(false);
    }
  };

  const isRunning = !!scanId;
  const isDone = status === 'completed' || status === 'failed';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold font-mono neon-text-green mb-2">New Vulnerability Scan</h1>
        <p className="text-gray-500 text-sm mb-8">Configure and launch an automated security assessment</p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="glass-card p-6 neon-border">
            <div className="flex items-center gap-2 mb-5">
              <FiShield className="text-neon-green" size={18} />
              <h2 className="text-base font-semibold">Scan Configuration</h2>
            </div>

            {error && (
              <div className="bg-neon-red/10 border border-neon-red/30 text-neon-red text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
                <FiXCircle size={16} /> {error}
              </div>
            )}

            {isDone && (
              <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 text-sm ${status === 'completed' ? 'bg-neon-green/10 border border-neon-green/30 text-neon-green' : 'bg-neon-red/10 border border-neon-red/30 text-neon-red'}`}>
                {status === 'completed' ? <FiCheckCircle size={16} /> : <FiXCircle size={16} />}
                {status === 'completed' ? 'Scan completed! Redirecting to results...' : 'Scan failed. Please try again.'}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 flex items-center gap-2 font-medium">
                  <FiGlobe size={14} /> Target URL <span className="text-neon-red text-xs">*</span>
                </label>
                <input
                  id="scan-url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isRunning && handleStart()}
                  className="input-field"
                  placeholder="https://example.com"
                  disabled={isRunning}
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 flex items-center gap-2 font-medium">
                  <FiServer size={14} /> Domain <span className="text-gray-600 text-xs">(optional)</span>
                </label>
                <input
                  id="scan-domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="input-field"
                  placeholder="example.com"
                  disabled={isRunning}
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 font-medium">
                  IP Address <span className="text-gray-600 text-xs">(optional)</span>
                </label>
                <input
                  id="scan-ip"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="input-field"
                  placeholder="192.168.1.1"
                  disabled={isRunning}
                />
              </div>

              {!isRunning ? (
                <button
                  id="start-scan-btn"
                  onClick={handleStart}
                  disabled={loading}
                  className="btn-primary w-full justify-center gap-2 mt-2"
                >
                  <FiSearch size={16} />
                  {loading ? 'Initializing Scanner...' : 'Start Security Scan'}
                </button>
              ) : (
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Scan Progress</span>
                    <span className="text-neon-green font-mono font-bold">{progress}%</span>
                  </div>
                  <div className="progress-track h-3 mb-3">
                    <motion.div
                      className="progress-fill h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Status: <span className={`font-mono capitalize status-${status}`}>{status || 'initializing'}</span>
                  </p>
                  <PhaseIndicator progress={progress} />
                </div>
              )}
            </div>
          </div>

          {/* Right: Terminal Output */}
          <div className="terminal">
            <div className="terminal-header">
              <div className="terminal-dot" style={{ background: '#ff0040' }} />
              <div className="terminal-dot" style={{ background: '#ffcc00' }} />
              <div className="terminal-dot" style={{ background: '#00ff41' }} />
              <span className="text-gray-500 text-xs ml-2">vulnscan-output — bash</span>
              {isRunning && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-neon-blue">
                  <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                  scanning
                </span>
              )}
            </div>
            <div
              ref={logRef}
              className="terminal-body"
              style={{ minHeight: '320px' }}
            >
              {logs ? (
                logs.split('\n').map((line, i) => {
                  let cls = 'text-gray-400';
                  if (line.includes('[+]') || line.includes('completed')) cls = 'text-neon-green';
                  else if (line.includes('Phase') || line.includes('Starting')) cls = 'text-neon-blue';
                  else if (line.includes('ERROR') || line.includes('failed') || line.includes('Failed')) cls = 'text-neon-red';
                  else if (line.includes('WARNING') || line.includes('Skipping')) cls = 'text-neon-yellow';
                  return (
                    <div key={i} className={`leading-5 ${cls}`}>
                      {line || '\u00a0'}
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-600">
                  <p className="mb-2">$ vulnscan --await-target</p>
                  <p className="cursor-blink text-neon-green">_</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scan info cards */}
        {!isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-3 gap-4 mt-8"
          >
            {[
              { icon: FiShield, title: 'OWASP Top 10', desc: 'Detects all major OWASP vulnerabilities including SQLi, XSS, CSRF and more' },
              { icon: FiGlobe, title: 'SSL/TLS Analysis', desc: 'Checks certificate validity, protocol versions, and weak cipher detection' },
              { icon: FiServer, title: 'Port Scanning', desc: 'Nmap-powered port discovery, OS detection, and service enumeration' },
            ].map((item) => (
              <div key={item.title} className="glass-card p-4 flex gap-3">
                <item.icon className="text-neon-green shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-medium mb-1">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
    </motion.div>
  );
}
