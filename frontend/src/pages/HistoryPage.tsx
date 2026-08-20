import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiEye, FiSearch, FiFilter, FiShield } from 'react-icons/fi';
import { historyAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

interface ScanItem {
  id: number;
  status: string;
  risk_score: number;
  overall_severity: string;
  progress: number;
  created_at: string;
  target?: { url: string };
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff0040',
  high: '#ff6600',
  medium: '#ffcc00',
  low: '#00ccff',
  info: '#888888',
};

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const toast = useToast();

  const loadScans = () => {
    historyAPI
      .list(page, 15, statusFilter === 'all' ? undefined : statusFilter)
      .then(({ data }) => {
        setScans(data.scans);
        setTotalPages(data.pages);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadScans();
  }, [page, statusFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this scan log?')) return;
    try {
      await historyAPI.delete(id);
      toast.success('Scan record deleted successfully');
      loadScans();
    } catch {
      toast.error('Failed to delete scan record');
    }
  };

  const filteredScans = scans.filter((scan) =>
    scan.target?.url?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-mono neon-text-green">Scan History</h1>
            <p className="text-gray-600 text-sm mt-1">Audit log of all automated security scans</p>
          </div>
          <Link to="/scan" className="btn-primary gap-2">
            <FiShield size={16} /> New Assessment
          </Link>
        </div>

        {/* Controls: Search & Status Filters */}
        <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search target URL..."
              className="input-field pl-11"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <FiFilter className="text-gray-600" size={14} />
            <span className="text-xs text-gray-600 font-medium mr-1">Status:</span>
            {['all', 'completed', 'running', 'failed', 'pending'].map((st) => {
              const isActive = statusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 border border-amber-400 font-bold'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200/70'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Container */}
        <div className="glass-card overflow-hidden">
          <div className="max-h-[560px] overflow-y-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Target URL</th>
                  <th>Status</th>
                  <th>Risk Score</th>
                  <th>Severity</th>
                  <th>Date & Time</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScans.map((scan) => {
                  const color = SEVERITY_COLORS[scan.overall_severity] || '#888';
                  return (
                    <tr key={scan.id}>
                      <td className="font-mono text-sm text-gray-900 truncate max-w-[280px]">
                        {scan.target?.url || 'N/A'}
                      </td>
                      <td>
                        <span className={`badge capitalize status-${scan.status}`}>
                          {scan.status}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono font-bold text-sm text-gray-900">
                          {scan.risk_score.toFixed(1)} / 10
                        </span>
                      </td>
                      <td>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                          style={{
                            color,
                            background: `${color}18`,
                            border: `1px solid ${color}40`,
                          }}
                        >
                          {scan.overall_severity}
                        </span>
                      </td>
                      <td className="text-xs text-gray-600 font-mono">
                        {new Date(scan.created_at).toLocaleString()}
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/history/${scan.id}`}
                            className="p-2 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="View Scan Details"
                          >
                            <FiEye size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(scan.id)}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Scan Record"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filteredScans.length && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      <FiShield size={36} className="mx-auto mb-3 text-gray-400" />
                      No scan records found matching filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3.5 py-1.5 rounded-lg font-mono text-xs transition-all ${
                  page === i + 1
                    ? 'bg-amber-100 text-amber-900 border border-amber-400 font-bold shadow-sm'
                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
    </motion.div>
  );
}
