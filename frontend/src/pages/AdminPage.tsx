import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiTrash2,
  FiPause,
  FiPlay,
  FiEye,
  FiUsers,
  FiShield,
  FiActivity,
  FiAlertTriangle,
  FiSearch,
} from 'react-icons/fi';
import { adminAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

type Tab = 'users' | 'scans' | 'analytics' | 'logs';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff0040',
  high: '#ff6600',
  medium: '#ffcc00',
  low: '#00ccff',
  info: '#888888',
};

export default function AdminPage() {
  const [users, setUsers] = useState<
    Array<{
      id: number;
      username: string;
      email: string;
      role: string;
      is_suspended: boolean;
      scan_count: number;
      created_at: string;
    }>
  >([]);
  const [scans, setScans] = useState<
    Array<{
      id: number;
      username: string;
      status: string;
      risk_score: number;
      overall_severity: string;
      target?: { url: string };
      created_at: string;
    }>
  >([]);
  const [analytics, setAnalytics] = useState<{
    total_users: number;
    total_scans: number;
    total_vulnerabilities: number;
    avg_risk_score: number;
    severity_counts?: Record<string, number>;
  } | null>(null);
  const [logs, setLogs] = useState<
    Array<{ action: string; details: string; username?: string; created_at: string }>
  >([]);
  const [tab, setTab] = useState<Tab>('users');
  const [userSearch, setUserSearch] = useState('');
  const [scanSearch, setScanSearch] = useState('');
  const toast = useToast();

  const loadUsers = () =>
    adminAPI
      .users()
      .then(({ data }) => setUsers(data.users))
      .catch(console.error);
  const loadScans = () =>
    adminAPI
      .scans()
      .then(({ data }) => setScans(data.scans))
      .catch(console.error);
  const loadAnalytics = () =>
    adminAPI
      .analytics()
      .then(({ data }) => setAnalytics(data))
      .catch(console.error);
  const loadLogs = () =>
    adminAPI
      .logs()
      .then(({ data }) => setLogs(data.logs))
      .catch(console.error);

  useEffect(() => {
    loadUsers();
    loadScans();
    loadAnalytics();
    loadLogs();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this user account?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User account deleted');
      loadUsers();
    } catch {
      toast.error('Failed to delete user account');
    }
  };

  const handleSuspend = async (id: number) => {
    try {
      const { data } = await adminAPI.suspendUser(id);
      toast.success(data.message || 'User status updated');
      loadUsers();
    } catch {
      toast.error('Failed to update suspension status');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredScans = scans.filter(
    (s) =>
      s.target?.url?.toLowerCase().includes(scanSearch.toLowerCase()) ||
      s.username.toLowerCase().includes(scanSearch.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-mono neon-text-blue">System Administration</h1>
          <p className="text-gray-600 text-sm mt-1">Platform management, access control & system telemetry</p>
        </div>

        {/* Top Metric Summary */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-card p-6 min-h-[160px] text-center flex flex-col justify-center items-center">
              <FiUsers className="text-blue-600 mb-2" size={22} />
              <p className="text-3xl font-mono font-bold text-blue-600">{analytics.total_users}</p>
              <p className="text-gray-600 text-xs mt-1.5 uppercase tracking-wider font-semibold">Platform Users</p>
            </div>
            <div className="glass-card p-6 min-h-[160px] text-center flex flex-col justify-center items-center">
              <FiShield className="text-emerald-600 mb-2" size={22} />
              <p className="text-3xl font-mono font-bold text-emerald-600">{analytics.total_scans}</p>
              <p className="text-gray-600 text-xs mt-1.5 uppercase tracking-wider font-semibold">Total Scans</p>
            </div>
            <div className="glass-card p-6 min-h-[160px] text-center flex flex-col justify-center items-center">
              <FiAlertTriangle className="text-red-600 mb-2" size={22} />
              <p className="text-3xl font-mono font-bold text-red-600">{analytics.total_vulnerabilities}</p>
              <p className="text-gray-600 text-xs mt-1.5 uppercase tracking-wider font-semibold">Vulnerabilities</p>
            </div>
            <div className="glass-card p-6 min-h-[160px] text-center flex flex-col justify-center items-center">
              <FiActivity className="text-amber-600 mb-2" size={22} />
              <p className="text-3xl font-mono font-bold text-amber-600">{analytics.avg_risk_score}</p>
              <p className="text-gray-600 text-xs mt-1.5 uppercase tracking-wider font-semibold">Avg Risk Score</p>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex gap-2 border-b border-gray-200 pb-3 flex-wrap">
          {[
            { id: 'users', label: 'User Management' },
            { id: 'scans', label: 'Scan Registry' },
            { id: 'analytics', label: 'System Analytics' },
            { id: 'logs', label: 'Audit Logs' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                tab === t.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-300 shadow-sm'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Users */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="glass-card p-4">
              <div className="relative max-w-md">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Filter users by username or email..."
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="cyber-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Scans Executed</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="font-semibold text-gray-900">{u.username}</td>
                        <td className="text-gray-600 font-mono text-xs">{u.email}</td>
                        <td>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold uppercase ${
                              u.role === 'admin'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="font-mono text-sm font-bold text-gray-900">{u.scan_count}</td>
                        <td>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                              u.is_suspended
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {u.is_suspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSuspend(u.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                u.is_suspended
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-amber-600 hover:bg-amber-50'
                              }`}
                              title={u.is_suspended ? 'Unsuspend User' : 'Suspend User'}
                            >
                              {u.is_suspended ? <FiPlay size={16} /> : <FiPause size={16} />}
                            </button>
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Account"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!filteredUsers.length && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No users found matching query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Scans */}
        {tab === 'scans' && (
          <div className="space-y-4">
            <div className="glass-card p-4">
              <div className="relative max-w-md">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  value={scanSearch}
                  onChange={(e) => setScanSearch(e.target.value)}
                  placeholder="Filter scans by target URL or owner..."
                  className="input-field pl-11"
                />
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="cyber-table">
                  <thead>
                    <tr>
                      <th>Target URL</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th>Risk Score</th>
                      <th>Date</th>
                      <th className="text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScans.map((s) => {
                      const color = SEVERITY_COLORS[s.overall_severity] || '#888';
                      return (
                        <tr key={s.id}>
                          <td className="font-mono text-sm text-gray-900 truncate max-w-[240px]">
                            {s.target?.url || 'N/A'}
                          </td>
                          <td className="text-sm font-semibold text-gray-900">{s.username}</td>
                          <td>
                            <span className={`badge capitalize status-${s.status}`}>{s.status}</span>
                          </td>
                          <td>
                            <span
                              className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider font-mono"
                              style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}
                            >
                              {s.risk_score.toFixed(1)} / 10
                            </span>
                          </td>
                          <td className="text-xs text-gray-600 font-mono">
                            {new Date(s.created_at).toLocaleString()}
                          </td>
                          <td className="text-right">
                            <Link
                              to={`/history/${s.id}`}
                              className="p-2 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 inline-block transition-colors"
                              title="View Full Scan Report"
                            >
                              <FiEye size={16} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                    {!filteredScans.length && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No scan records recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: System Analytics */}
        {tab === 'analytics' && analytics && (
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-base font-semibold text-gray-900">System Telemetry Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-gray-600 text-xs uppercase tracking-wider mb-1 font-semibold">Registered Accounts</p>
                <p className="text-3xl font-mono font-bold text-emerald-600">{analytics.total_users}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-gray-600 text-xs uppercase tracking-wider mb-1 font-semibold">Total Scan Tasks</p>
                <p className="text-3xl font-mono font-bold text-blue-600">{analytics.total_scans}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-gray-600 text-xs uppercase tracking-wider mb-1 font-semibold">Total Vulnerabilities</p>
                <p className="text-3xl font-mono font-bold text-red-600">{analytics.total_vulnerabilities}</p>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-gray-600 text-xs uppercase tracking-wider mb-1 font-semibold">Avg Risk Index</p>
                <p className="text-3xl font-mono font-bold text-amber-600">{analytics.avg_risk_score}</p>
              </div>
            </div>

            {analytics.severity_counts && (
              <div>
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Global Vulnerability Breakdown
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {Object.entries(analytics.severity_counts).map(([sev, count]) => {
                    const color = SEVERITY_COLORS[sev] || '#888';
                    return (
                      <div
                        key={sev}
                        className="p-4 rounded-xl text-center border"
                        style={{ background: `${color}10`, borderColor: `${color}30` }}
                      >
                        <p className="text-2xl font-mono font-bold" style={{ color }}>
                          {count}
                        </p>
                        <p className="text-xs text-gray-600 capitalize mt-1 font-medium">{sev}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {tab === 'logs' && (
          <div className="glass-card p-6 space-y-3 max-h-[550px] overflow-y-auto pr-1">
            <h2 className="text-base font-semibold text-gray-900 pb-3 border-b border-gray-200">
              System Audit Trail
            </h2>
            {logs.map((log, i) => (
              <div
                key={i}
                className="flex items-start gap-3.5 p-3.5 rounded-xl bg-gray-50/90 border border-gray-200 hover:border-gray-300 transition-all"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    {log.username && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        {log.username}
                      </span>
                    )}
                  </div>
                  {log.details && <p className="text-xs text-gray-700 leading-relaxed mb-1">{log.details}</p>}
                  <p className="text-[11px] font-mono text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {!logs.length && (
              <p className="text-gray-500 text-sm text-center py-8">No audit log records found.</p>
            )}
          </div>
        )}
    </motion.div>
  );
}
