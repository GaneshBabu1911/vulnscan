import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch, FiAlertTriangle, FiActivity, FiGlobe,
  FiShield, FiAlertOctagon, FiInfo, FiChevronRight, FiPlus,
} from 'react-icons/fi';
import { dashboardAPI } from '../services/api';

interface DashboardStats {
  total_scans: number;
  completed_scans: number;
  severity_counts: Record<string, number>;
  avg_risk_score: number;
  open_ports: number;
  recent_scans: Array<{
    id: number;
    target?: { url: string };
    risk_score: number;
    overall_severity: string;
    status: string;
    created_at: string;
  }>;
  recent_activity: Array<{ action: string; details: string; created_at: string }>;
}

const statCards = [
  {
    key: 'total_scans',
    label: 'Total Scans',
    sub: (s: DashboardStats) => `${s.completed_scans} completed`,
    icon: FiSearch,
    accent: '#2563EB',
    getValue: (s: DashboardStats) => s.total_scans,
  },
  {
    key: 'critical',
    label: 'Critical Vulns',
    sub: () => 'Requires immediate action',
    icon: FiAlertOctagon,
    accent: '#DC2626',
    getValue: (s: DashboardStats) => s.severity_counts?.critical ?? 0,
  },
  {
    key: 'avg_risk',
    label: 'Avg Risk Score',
    sub: () => 'Out of 10.0 scale',
    icon: FiActivity,
    accent: '#D97706',
    getValue: (s: DashboardStats) => s.avg_risk_score?.toFixed(1) ?? '0.0',
  },
  {
    key: 'open_ports',
    label: 'Open Ports',
    sub: () => 'Detected across targets',
    icon: FiGlobe,
    accent: '#FF9900',
    getValue: (s: DashboardStats) => s.open_ports ?? 0,
  },
];

const severityBadges = [
  { key: 'critical', label: 'Critical', icon: FiAlertOctagon, color: '#DC2626', bg: '#FEF2F2' },
  { key: 'high', label: 'High', icon: FiAlertTriangle, color: '#EA580C', bg: '#FFF7ED' },
  { key: 'medium', label: 'Medium', icon: FiActivity, color: '#D97706', bg: '#FFFBEB' },
  { key: 'low', label: 'Low', icon: FiInfo, color: '#2563EB', bg: '#EFF6FF' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    completed: { color: '#16A34A', bg: '#F0FDF4' },
    running: { color: '#2563EB', bg: '#EFF6FF' },
    pending: { color: '#D97706', bg: '#FFFBEB' },
    failed: { color: '#DC2626', bg: '#FEF2F2' },
  };
  const s = map[status] || { color: '#6B7280', bg: '#F9FAFB' };
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
      style={{ color: s.color, background: s.bg }}>
      {status}
    </span>
  );
}

function RiskBadge({ score }: { score: number }) {
  const color = score >= 9 ? '#DC2626' : score >= 7 ? '#EA580C' : score >= 4 ? '#D97706' : '#16A34A';
  return <span className="font-bold font-mono text-sm" style={{ color }}>{score.toFixed(1)}</span>;
}

function SkeletonCard() {
  return (
    <div className="stat-card" style={{ minHeight: 140 }}>
      <div className="skeleton h-4 w-28 mb-3 rounded" style={{ background: '#E8EAED' }} />
      <div className="skeleton h-8 w-16 rounded" style={{ background: '#E8EAED' }} />
      <div className="skeleton h-3 w-20 rounded mt-2" style={{ background: '#E8EAED' }} />
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.stats()
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bold mb-1" style={{ fontSize: '24px', color: '#111111', letterSpacing: '-0.02em' }}>
            Security Dashboard
          </h1>
          <p style={{ color: '#5F6368', fontSize: '14px' }}>Overview of your security operations</p>
        </div>
        <Link to="/scan" className="btn-primary flex items-center gap-2" style={{ height: '40px', fontSize: '14px', padding: '0 16px' }}>
          <FiPlus size={15} /> New Scan
        </Link>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map(card => (
            <div
              key={card.key}
              className="stat-card"
              style={{ '--accent-color': card.accent, minHeight: 130 } as React.CSSProperties}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-sm font-medium" style={{ color: '#5F6368' }}>{card.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${card.accent}15` }}>
                  <card.icon size={15} style={{ color: card.accent }} />
                </div>
              </div>
              <p className="font-bold" style={{ fontSize: '32px', color: '#111111', lineHeight: 1 }}>
                {stats ? card.getValue(stats) : '—'}
              </p>
              <p className="text-xs mt-1.5" style={{ color: '#9AA0A6' }}>
                {stats ? card.sub(stats) : ''}
              </p>
            </div>
          ))
        }
      </motion.div>

      {/* ── Severity Breakdown ──────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {severityBadges.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="glass-card p-5 flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p className="font-bold" style={{ fontSize: '28px', color, lineHeight: 1 }}>
              {loading ? '—' : (stats?.severity_counts?.[key] ?? 0)}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9AA0A6' }}>{label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Recent Scans + Activity ──────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-5">
        {/* Recent Scans */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2" style={{ color: '#111111', fontSize: '15px' }}>
              <FiShield size={15} style={{ color: '#FF9900' }} />
              Recent Scans
            </h2>
            <Link to="/history" className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: '#FF9900' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#E6A800')}
              onMouseLeave={e => (e.currentTarget.style.color = '#FF9900')}>
              View all <FiChevronRight size={12} />
            </Link>
          </div>

          <div className="space-y-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: '#F7F7F7' }}>
                  <div className="skeleton h-3.5 w-3/4 mb-2 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                </div>
              ))
            ) : stats?.recent_scans?.length ? (
              stats.recent_scans.map((scan) => (
                <Link
                  key={scan.id}
                  to={`/history/${scan.id}`}
                  className="block p-3 rounded-xl transition-all duration-150"
                  style={{ background: 'transparent', border: '1px solid transparent' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = '#FFFBF0';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = '#FFD814';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'transparent';
                  }}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-sm font-mono truncate max-w-[200px]" style={{ color: '#111111' }}>
                      {scan.target?.url || 'Unknown target'}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <RiskBadge score={scan.risk_score} />
                      <span style={{ color: '#9AA0A6', fontSize: '12px' }}>/10</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <StatusBadge status={scan.status} />
                    <span style={{ color: '#9AA0A6', fontSize: '11px' }}>
                      {new Date(scan.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10">
                <FiSearch size={28} className="mx-auto mb-3" style={{ color: '#D5D9D9' }} />
                <p className="text-sm mb-2" style={{ color: '#9AA0A6' }}>No scans yet</p>
                <Link to="/scan" className="text-sm font-medium" style={{ color: '#FF9900' }}>
                  Start your first scan →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-5" style={{ color: '#111111', fontSize: '15px' }}>Recent Activity</h2>
          <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-2">
                  <div className="skeleton w-2 h-2 rounded-full mt-2 shrink-0" />
                  <div className="flex-1">
                    <div className="skeleton h-3 w-full mb-1.5 rounded" />
                    <div className="skeleton h-3 w-2/3 rounded" />
                  </div>
                </div>
              ))
            ) : stats?.recent_activity?.length ? (
              stats.recent_activity.map((act, i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                  onMouseEnter={e => (e.currentTarget.style.background = '#F7F7F7')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: '#FF9900' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium capitalize" style={{ color: '#111111' }}>
                      {act.action.replace(/_/g, ' ')}
                    </p>
                    {act.details && (
                      <p className="text-xs truncate mt-0.5" style={{ color: '#9AA0A6' }}>{act.details}</p>
                    )}
                    <p className="text-xs mt-0.5" style={{ color: '#D5D9D9' }}>
                      {new Date(act.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center py-10" style={{ color: '#9AA0A6' }}>No recent activity</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
