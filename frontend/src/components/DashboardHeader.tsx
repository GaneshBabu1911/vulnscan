import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiShield, FiPlus, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

interface DashboardHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function DashboardHeader({
  sidebarOpen,
  onToggleSidebar,
}: DashboardHeaderProps) {
  const { user } = useAuth();
  const location = useLocation();

  // Map route to friendly title for display
  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/scan')) return 'New Scan';
    if (pathname.startsWith('/history')) return 'Scan History';
    if (pathname.startsWith('/reports')) return 'Reports';
    if (pathname.startsWith('/analytics')) return 'Analytics';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/settings')) return 'Settings';
    if (pathname.startsWith('/admin')) return 'Admin Panel';
    return '';
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        background: '#131515',
        borderBottom: '1px solid #2A2A2A',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
      }}
    >
      {/* ── Left: Hamburger Toggle + VulnScan Logo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: sidebarOpen ? '#242424' : 'transparent',
            border: '1px solid #333',
            borderRadius: 8,
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: sidebarOpen ? '#FFD814' : '#E0E0E0',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#242424';
            e.currentTarget.style.borderColor = '#FFD814';
            e.currentTarget.style.color = '#FFD814';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = sidebarOpen ? '#242424' : 'transparent';
            e.currentTarget.style.borderColor = '#333';
            e.currentTarget.style.color = sidebarOpen ? '#FFD814' : '#E0E0E0';
          }}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? <FiX size={21} /> : <FiMenu size={21} />}
        </button>

        {/* VulnScan Brand */}
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              background: '#FFD814',
              borderRadius: 9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FiShield size={18} color="#111" strokeWidth={2.3} />
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            VulnScan
          </span>
        </Link>

        {/* Current page breadcrumb indicator (desktop only) */}
        {pageTitle && (
          <div
            className="hidden md:flex"
            style={{
              alignItems: 'center',
              gap: 8,
              marginLeft: 12,
              paddingLeft: 14,
              borderLeft: '1px solid #333',
            }}
          >
            <span style={{ fontSize: 13.5, color: '#888', fontWeight: 500 }}>
              {pageTitle}
            </span>
          </div>
        )}
      </div>

      {/* ── Right: "+ New Scan" CTA & User Profile Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link
          to="/scan"
          className="btn-primary"
          style={{
            height: 38,
            padding: '0 16px',
            fontSize: 13.5,
            fontWeight: 700,
            gap: 6,
            display: 'inline-flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <FiPlus size={16} />
          <span>New Scan</span>
        </Link>

        {/* User profile avatar badge */}
        <Link
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            textDecoration: 'none',
            padding: '4px 8px',
            borderRadius: 8,
            transition: 'background 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title={`Signed in as ${user?.username ?? 'User'}`}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#FFD814',
              color: '#111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {user?.username?.[0]?.toUpperCase() ?? <FiUser size={16} />}
          </div>
          <span
            className="hidden sm:inline"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: '#E0E0E0',
              maxWidth: 120,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.username ?? 'User'}
          </span>
        </Link>
      </div>
    </header>
  );
}
