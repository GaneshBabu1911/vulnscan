import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiDownload, FiArrowLeft, FiShield, FiAlertTriangle,
  FiChevronDown, FiChevronUp, FiGlobe, FiActivity,
  FiFilter,
} from 'react-icons/fi';
import { historyAPI, reportsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

interface Vulnerability {
  id: number;
  name: string;
  severity: string;
  cvss_score: number;
  category: string;
  description: string;
  evidence: string;
  solution: string;
  reference: string;
  source: string;
  cwe_id?: string;
}

interface Recommendation {
  title: string;
  explanation: string;
  impact: string;
  fix_steps: string;
  best_practices: string;
  preventive_measures: string;
  priority: string;
}

const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff0040', high: '#ff6600', medium: '#ffcc00', low: '#00ccff', info: '#888',
};

function CVSSGauge({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 9 ? '#ff0040' : score >= 7 ? '#ff6600' : score >= 4 ? '#ffcc00' : score >= 0.1 ? '#00ccff' : '#888';
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2a2a4a" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${pct} 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold" style={{ color }}>
          {score.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

function VulnCard({ vuln }: { vuln: Vulnerability }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const color = SEVERITY_COLORS[vuln.severity] || '#888';

  const copyEvidence = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (vuln.evidence) {
      navigator.clipboard.writeText(vuln.evidence);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      layout
      className="rounded-2xl bg-cyber-card border overflow-hidden transition-all duration-300 hover:border-cyber-border"
      style={{ borderColor: `${color}30` }}
    >
      <button
        className="w-full text-left p-5 flex items-start gap-4 hover:bg-white/[0.03] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="shrink-0 mt-0.5">
          <CVSSGauge score={vuln.cvss_score} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-base text-gray-100">{vuln.name}</h3>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}
            >
              {vuln.severity}
            </span>
            {vuln.source && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-gray-400 bg-cyber-border/40 border border-cyber-border/80">
                {vuln.source}
              </span>
            )}
            {vuln.cwe_id && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-neon-blue bg-neon-blue/10 border border-neon-blue/30">
                {vuln.cwe_id}
              </span>
            )}
          </div>
          {vuln.description && (
            <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{vuln.description}</p>
          )}
        </div>
        <div className="shrink-0 pt-1">
          {expanded ? <FiChevronUp size={18} className="text-gray-400" /> : <FiChevronDown size={18} className="text-gray-400" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-cyber-border/60">
              {vuln.description && (
                <div className="pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{vuln.description}</p>
                </div>
              )}
              {vuln.evidence && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code / Technical Evidence</p>
                    <button
                      onClick={copyEvidence}
                      className="text-xs font-mono text-neon-blue hover:underline flex items-center gap-1"
                    >
                      {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-neon-yellow bg-black/60 p-3.5 rounded-xl border border-cyber-border overflow-x-auto whitespace-pre-wrap break-all">
                    {vuln.evidence}
                  </pre>
                </div>
              )}
              {vuln.solution && (
                <div>
                  <p className="text-xs font-semibold text-neon-green uppercase tracking-wider mb-1.5">Remediation Steps</p>
                  <div className="p-3.5 rounded-xl bg-neon-green/5 border border-neon-green/20 text-sm text-gray-200 leading-relaxed">
                    {vuln.solution}
                  </div>
                </div>
              )}
              {vuln.reference && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Reference Link</p>
                  <a
                    href={vuln.reference}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-neon-blue font-mono hover:underline break-all block"
                  >
                    {vuln.reference}
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ScanDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [scan, setScan] = useState<{
    id: number;
    status: string;
    risk_score: number;
    overall_severity: string;
    created_at: string;
    completed_at?: string;
    target?: { url: string; domain?: string; ip_address?: string };
    vulnerabilities?: Vulnerability[];
    recommendations?: Recommendation[];
    logs?: string;
  } | null>(null);
  const [generating, setGenerating] = useState('');
  const [sevFilter, setSevFilter] = useState<string>('all');

  useEffect(() => {
    if (id) {
      historyAPI.detail(Number(id))
        .then(({ data }) => setScan(data.scan))
        .catch(() => toast.error('Failed to load scan details'));
    }
  }, [id]);

  const handleExport = async (format: string) => {
    if (!scan) return;
    setGenerating(format);
    try {
      const { data } = await reportsAPI.generate(scan.id, format);
      const blob = await reportsAPI.download(data.report.id);
      const url = window.URL.createObjectURL(blob.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vulnscan_report_${scan.id}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} report downloaded`);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating('');
    }
  };

  if (!scan) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
        <div className="skeleton h-96 rounded-xl" />
      </div>
    );
  }

  const vulns = scan.vulnerabilities || [];
  const filteredVulns = sevFilter === 'all' ? vulns : vulns.filter(v => v.severity === sevFilter);
  const sortedVulns = [...filteredVulns].sort((a, b) =>
    severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  const sevCounts = severityOrder.reduce((acc, sev) => ({
    ...acc, [sev]: vulns.filter(v => v.severity === sev).length,
  }), {} as Record<string, number>);

  const riskColor = scan.risk_score >= 9 ? '#ff0040' : scan.risk_score >= 7 ? '#ff6600' : scan.risk_score >= 4 ? '#ffcc00' : '#00ff41';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Link to="/history" className="text-gray-400 hover:text-neon-green text-sm flex items-center gap-1 mb-5 w-fit">
          <FiArrowLeft size={14} /> Back to History
        </Link>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold font-mono neon-text-green">Security Report</h1>
            <p className="text-gray-400 font-mono text-sm mt-1 flex items-center gap-2">
              <FiGlobe size={12} /> {scan.target?.url}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['pdf', 'csv', 'json'].map((fmt) => (
              <button
                key={fmt}
                id={`export-${fmt}-btn`}
                onClick={() => handleExport(fmt)}
                disabled={scan.status !== 'completed' || !!generating}
                className="btn-secondary text-xs py-2 px-3 gap-1.5"
              >
                <FiDownload size={12} />
                {generating === fmt ? 'Generating...' : fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-4 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Risk Score</p>
            <p className="text-3xl font-mono font-bold" style={{ color: riskColor, textShadow: `0 0 20px ${riskColor}60` }}>
              {scan.risk_score.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">out of 10</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Severity</p>
            <p className={`text-3xl font-mono font-bold capitalize severity-${scan.overall_severity}`}>
              {scan.overall_severity}
            </p>
            <p className="text-xs text-gray-500 mt-1">overall</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Vulnerabilities</p>
            <p className="text-3xl font-mono font-bold text-neon-blue">{vulns.length}</p>
            <p className="text-xs text-gray-500 mt-1">total detected</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Status</p>
            <p className={`text-lg font-mono font-bold capitalize status-${scan.status}`}>{scan.status}</p>
            {scan.completed_at && (
              <p className="text-xs text-gray-500 mt-1">{new Date(scan.completed_at).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <FiFilter size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400 mr-1">Filter:</span>
          {['all', ...severityOrder].map((sev) => {
            const count = sev === 'all' ? vulns.length : sevCounts[sev] || 0;
            const color = sev === 'all' ? '#00ff41' : (SEVERITY_COLORS[sev] || '#888');
            const isActive = sevFilter === sev;
            return (
              <button
                key={sev}
                onClick={() => setSevFilter(sev)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all capitalize"
                style={{
                  background: isActive ? `${color}22` : 'transparent',
                  border: `1px solid ${isActive ? color : '#2a2a4a'}`,
                  color: isActive ? color : '#6b6b8a',
                }}
              >
                {sev} ({count})
              </button>
            );
          })}
        </div>

        {/* Vulnerabilities */}
        <div className="glass-card p-6 mb-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <FiAlertTriangle className="text-neon-red" size={16} /> Vulnerabilities
          </h2>
          <div className="space-y-3">
            {sortedVulns.map((v) => <VulnCard key={v.id} vuln={v} />)}
            {!sortedVulns.length && (
              <div className="text-center py-8">
                <FiShield size={32} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {sevFilter === 'all' ? 'No vulnerabilities detected' : `No ${sevFilter} vulnerabilities`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        {scan.recommendations && scan.recommendations.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <FiActivity className="text-neon-blue" size={16} /> AI Recommendations
            </h2>
            <div className="space-y-4">
              {scan.recommendations.map((rec, i) => {
                const priorityColor = SEVERITY_COLORS[rec.priority] || '#888';
                return (
                  <div key={i} className="p-4 rounded-lg border" style={{ borderColor: `${priorityColor}22`, background: `${priorityColor}08` }}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm" style={{ color: priorityColor }}>{rec.title}</h3>
                      <span className="badge capitalize text-xs" style={{ color: priorityColor, background: `${priorityColor}22`, border: `1px solid ${priorityColor}44` }}>
                        {rec.priority}
                      </span>
                    </div>
                    {rec.explanation && <p className="text-gray-400 text-sm mb-3">{rec.explanation}</p>}
                    {rec.impact && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Impact</p>
                        <p className="text-sm text-gray-300">{rec.impact}</p>
                      </div>
                    )}
                    {rec.fix_steps && (
                      <div>
                        <p className="text-xs font-semibold text-neon-green uppercase tracking-wider mb-1">Fix Steps</p>
                        <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap bg-black/30 p-3 rounded">{rec.fix_steps}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scan Logs */}
        {scan.logs && (
          <div className="glass-card p-6 mt-6">
            <h2 className="text-base font-semibold mb-4">Scan Logs</h2>
            <div className="terminal">
              <div className="terminal-header">
                <div className="terminal-dot" style={{ background: '#ff0040' }} />
                <div className="terminal-dot" style={{ background: '#ffcc00' }} />
                <div className="terminal-dot" style={{ background: '#00ff41' }} />
                <span className="ml-2 text-xs text-gray-500">scan-log</span>
              </div>
              <div className="terminal-body max-h-48">
                {scan.logs.split('\n').map((line, i) => (
                  <div key={i} className={`leading-5 ${line.includes('[+]') ? 'text-neon-green' : line.includes('Phase') ? 'text-neon-blue' : 'text-gray-400'}`}>
                    {line || '\u00a0'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </motion.div>
  );
}
