import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiActivity, FiShield, FiAlertTriangle } from 'react-icons/fi';
import { dashboardAPI } from '../services/api';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: { color: '#9ca3af', font: { family: 'JetBrains Mono', size: 11 } },
    },
    tooltip: {
      backgroundColor: 'rgba(26, 26, 46, 0.95)',
      borderColor: 'rgba(0, 255, 65, 0.3)',
      borderWidth: 1,
      cornerRadius: 10,
      padding: 12,
      titleColor: '#00ff41',
      bodyColor: '#e0e0e0',
      titleFont: { family: 'JetBrains Mono', weight: 'bold' as const },
      bodyFont: { family: 'Inter' },
    },
  },
};

const axisOptions = {
  x: { ticks: { color: '#6b6b8a', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: 'rgba(42,42,74,0.3)' } },
  y: { ticks: { color: '#6b6b8a', font: { family: 'JetBrains Mono', size: 10 } }, grid: { color: 'rgba(42,42,74,0.3)' }, beginAtZero: true },
};

interface AnalyticsData {
  severity_distribution: Record<string, number>;
  monthly_scans: Record<string, number>;
  risk_trend: Array<{ date: string; score: number }>;
}

type Tab = 'overview' | 'severity' | 'history' | 'trend';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    dashboardAPI
      .analytics()
      .then(({ data: d }) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const severityColors = ['#ff0040', '#ff6600', '#ffcc00', '#00ccff', '#888888'];

  const pieData = data
    ? {
        labels: Object.keys(data.severity_distribution).map(
          (s) => s.charAt(0).toUpperCase() + s.slice(1)
        ),
        datasets: [
          {
            data: Object.values(data.severity_distribution),
            backgroundColor: severityColors.map((c) => `${c}dd`),
            borderColor: severityColors,
            borderWidth: 2,
            hoverBorderWidth: 4,
          },
        ],
      }
    : null;

  const barData = data
    ? {
        labels: Object.keys(data.monthly_scans),
        datasets: [
          {
            label: 'Scans',
            data: Object.values(data.monthly_scans),
            backgroundColor: 'rgba(0, 255, 65, 0.25)',
            borderColor: '#00ff41',
            borderWidth: 2,
            borderRadius: 6,
          },
        ],
      }
    : null;

  const lineData = data
    ? {
        labels: data.risk_trend.map((r) => r.date),
        datasets: [
          {
            label: 'Risk Score',
            data: data.risk_trend.map((r) => r.score),
            borderColor: '#0080ff',
            backgroundColor: 'rgba(0, 128, 255, 0.12)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#0080ff',
            pointBorderColor: '#0a0a0f',
            pointBorderWidth: 2,
            pointRadius: 5,
          },
        ],
      }
    : null;

  const totalVulns = data
    ? Object.values(data.severity_distribution).reduce((a, b) => a + b, 0)
    : 0;

  const criticals = data?.severity_distribution?.critical ?? 0;
  const totalScans = data ? Object.values(data.monthly_scans).reduce((a, b) => a + b, 0) : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-mono neon-text-green">Security Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Deep-dive telemetry, threat distribution & posture trends</p>
        </div>

        {/* Summary Metric Header Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 min-h-[160px] text-center flex flex-col justify-center items-center">
            <FiShield className="text-neon-green mb-2" size={22} />
            <p className="text-3xl font-mono font-bold neon-text-green">{loading ? '—' : totalScans}</p>
            <p className="text-gray-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">Total Scans</p>
          </div>
          <div className="glass-card p-6 min-h-[160px] text-center flex flex-col justify-center items-center">
            <FiActivity className="text-neon-blue mb-2" size={22} />
            <p className="text-3xl font-mono font-bold neon-text-blue">{loading ? '—' : totalVulns}</p>
            <p className="text-gray-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">Vulnerabilities</p>
          </div>
          <div className="glass-card p-6 min-h-[160px] text-center flex flex-col justify-center items-center">
            <FiAlertTriangle className="text-neon-red mb-2" size={22} />
            <p className="text-3xl font-mono font-bold text-neon-red">{loading ? '—' : criticals}</p>
            <p className="text-gray-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">Critical Threats</p>
          </div>
          <div className="glass-card p-6 min-h-[160px] text-center flex flex-col justify-center items-center">
            <FiTrendingUp className="text-neon-yellow mb-2" size={22} />
            <p className="text-3xl font-mono font-bold text-neon-yellow">
              {loading
                ? '—'
                : data?.risk_trend.length
                ? (data.risk_trend.reduce((a, b) => a + b.score, 0) / data.risk_trend.length).toFixed(1)
                : '0.0'}
            </p>
            <p className="text-gray-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">Avg Posture Score</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex gap-2 border-b border-cyber-border pb-3 flex-wrap">
          {[
            { id: 'overview', label: 'All Charts' },
            { id: 'severity', label: 'Severity Breakdown' },
            { id: 'history', label: 'Monthly History' },
            { id: 'trend', label: 'Risk Trend' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/50 shadow-[0_0_12px_rgba(0,255,65,0.2)]'
                  : 'bg-cyber-dark/60 text-gray-400 border border-cyber-border hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Charts Section */}
        {(activeTab === 'overview' || activeTab === 'severity' || activeTab === 'history') && (
          <div className="grid lg:grid-cols-2 gap-6">
            {(activeTab === 'overview' || activeTab === 'severity') && (
              <div className="glass-card p-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <FiPieChart className="text-neon-green" size={18} /> Severity Distribution
                </h2>
                {loading ? (
                  <div className="skeleton h-64 rounded-2xl" />
                ) : pieData && totalVulns > 0 ? (
                  <div className="max-w-xs mx-auto py-2">
                    <Pie data={pieData} options={{ ...baseChartOptions, scales: undefined }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 text-sm font-mono">
                    No vulnerability data available
                  </div>
                )}

                {data && totalVulns > 0 && (
                  <div className="mt-6 pt-4 border-t border-cyber-border grid grid-cols-2 gap-2">
                    {['critical', 'high', 'medium', 'low', 'info'].map((sev, i) => (
                      <div key={sev} className="flex items-center gap-2 p-2 rounded-lg bg-cyber-black/40">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: severityColors[i] }} />
                        <span className="text-xs text-gray-300 capitalize">{sev}</span>
                        <span className="text-xs font-mono text-gray-400 ml-auto font-bold">
                          {data.severity_distribution[sev] ?? 0}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'overview' || activeTab === 'history') && (
              <div className="glass-card p-6">
                <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                  <FiBarChart2 className="text-neon-green" size={18} /> Monthly Scan History
                </h2>
                {loading ? (
                  <div className="skeleton h-64 rounded-2xl" />
                ) : barData && Object.keys(data!.monthly_scans).length > 0 ? (
                  <div className="py-2">
                    <Bar data={barData} options={{ ...baseChartOptions, scales: axisOptions }} />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 text-sm font-mono">
                    No monthly telemetry recorded
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {(activeTab === 'overview' || activeTab === 'trend') && (
          <div className="glass-card p-6">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <FiTrendingUp className="text-neon-blue" size={18} /> Risk Score Timeline
            </h2>
            {loading ? (
              <div className="skeleton h-60 rounded-2xl" />
            ) : lineData && data!.risk_trend.length > 0 ? (
              <Line
                data={lineData}
                options={{
                  ...baseChartOptions,
                  scales: {
                    ...axisOptions,
                    y: { ...axisOptions.y, min: 0, max: 10 },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-60 text-gray-500 text-sm font-mono">
                Complete scans to populate risk score progression curve
              </div>
            )}
          </div>
        )}
    </motion.div>
  );
}
