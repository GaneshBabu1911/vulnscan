import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiCalendar, FiAlertTriangle, FiSearch, FiFilter } from 'react-icons/fi';
import { historyAPI, reportsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

interface ScanItem {
  id: number;
  target?: { url: string };
  status: string;
  risk_score: number;
  overall_severity: string;
  created_at: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ff0040',
  high: '#ff6600',
  medium: '#ffcc00',
  low: '#00ccff',
  info: '#888888',
};

export default function ReportsPage() {
  const [scans, setScans] = useState<ScanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string>('');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const toast = useToast();

  useEffect(() => {
    historyAPI
      .list(1, 50)
      .then(({ data }) => {
        setScans(data.scans.filter((s: ScanItem) => s.status === 'completed'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (scanId: number, format: string) => {
    const key = `${scanId}-${format}`;
    setGenerating(key);
    try {
      const { data } = await reportsAPI.generate(scanId, format);
      const blob = await reportsAPI.download(data.report.id);
      const url = window.URL.createObjectURL(blob.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vulnscan_report_${scanId}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} report downloaded`);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating('');
    }
  };

  const filteredScans = scans.filter((scan) => {
    const matchesSearch = scan.target?.url?.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || scan.overall_severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-mono neon-text-green">Executive Reports</h1>
            <p className="text-gray-600 text-sm mt-1">Export executive PDF, CSV, and JSON audit documents</p>
          </div>
          <Link to="/scan" className="btn-primary gap-2">
            <FiFileText size={16} /> New Assessment
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by target URL..."
              className="input-field pl-11"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <FiFilter className="text-gray-600" size={14} />
            <span className="text-xs text-gray-600 font-medium mr-1">Severity:</span>
            {['all', 'critical', 'high', 'medium', 'low', 'info'].map((sev) => {
              const isActive = severityFilter === sev;
              return (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 border border-amber-400 font-bold shadow-sm'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200/70'
                  }`}
                >
                  {sev}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : filteredScans.length ? (
          <div className="space-y-4">
            {filteredScans.map((scan) => {
              const color = SEVERITY_COLORS[scan.overall_severity] || '#888';
              return (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5 flex flex-wrap items-center justify-between gap-4 transition-all hover:shadow-md"
                  style={{ borderColor: '#D5D9D9' }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ background: `${color}15`, borderColor: `${color}30` }}
                    >
                      <FiFileText style={{ color }} size={22} />
                    </div>
                    <div className="min-w-0">
                      <Link
                        to={`/history/${scan.id}`}
                        className="font-mono text-base font-semibold text-gray-900 hover:text-amber-600 truncate block max-w-md"
                      >
                        {scan.target?.url}
                      </Link>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                          style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}
                        >
                          {scan.overall_severity}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1 font-mono">
                          <FiAlertTriangle size={12} className="text-amber-600" />
                          Risk: {scan.risk_score.toFixed(1)}/10
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 font-mono">
                          <FiCalendar size={12} />
                          {new Date(scan.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {['pdf', 'csv', 'json'].map((fmt) => {
                      const key = `${scan.id}-${fmt}`;
                      return (
                        <button
                          key={fmt}
                          id={`report-${scan.id}-${fmt}`}
                          onClick={() => handleExport(scan.id, fmt)}
                          disabled={!!generating}
                          className="btn-secondary text-xs px-4 h-10 rounded-xl gap-1.5 font-semibold"
                        >
                          <FiDownload size={14} />
                          {generating === key ? '...' : fmt.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <FiFileText size={44} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-300 font-semibold mb-1">No reports matching criteria</p>
            <p className="text-gray-500 text-sm mb-6">Complete a scan or clear filters to generate exportable reports.</p>
            <Link to="/scan" className="btn-primary gap-2">Start a Scan</Link>
          </div>
        )}
    </motion.div>
  );
}
