import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiSearch, FiClock, FiFileText, FiBarChart2,
  FiUser, FiSettings, FiLogOut, FiShield, FiUsers, FiX,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export const SIDEBAR_WIDTH = 260;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainNav = [
  { path: '/dashboard', icon: FiGrid,      label: 'Dashboard'    },
  { path: '/scan',      icon: FiSearch,    label: 'New Scan'     },
  { path: '/history',   icon: FiClock,     label: 'Scan History' },
  { path: '/reports',   icon: FiFileText,  label: 'Reports'      },
  { path: '/analytics', icon: FiBarChart2, label: 'Analytics'    },
];

const accountNav = [
  { path: '/profile',  icon: FiUser,     label: 'Profile'  },
  { path: '/settings', icon: FiSettings, label: 'Settings' },
];

/* ─── Section Header Label ───────────────────────────── */

function SectionLabel({ label }: { label: string }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '1.2px',
        color: '#8A8A8A',
        textTransform: 'uppercase',
        padding: '0 16px',
        marginTop: 20,
        marginBottom: 6,
        userSelect: 'none',
      }}
    >
      {label}
    </p>
  );
}

/* ─── Navigation Item (Does NOT close sidebar on click) ── */

function NavItem({
  path,
  icon: Icon,
  label,
  active,
}: {
  path: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={path}
      style={{ textDecoration: 'none', display: 'block', padding: '3px 8px' }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          height: 46,
          padding: '0 14px',
          borderRadius: 9,
          cursor: 'pointer',
          transition: 'background 180ms ease, color 180ms ease',
          background: active
            ? '#FFD814'
            : hovered
            ? '#242424'
            : 'transparent',
          color: active ? '#111111' : hovered ? '#FFD814' : '#C8C8C8',
        }}
      >
        <Icon
          size={21}
          style={{
            flexShrink: 0,
            color: active ? '#111111' : hovered ? '#FFD814' : '#909090',
            transition: 'color 180ms ease',
          }}
        />
        <span
          style={{
            fontSize: 15.5,
            fontWeight: active ? 600 : 500,
            letterSpacing: '-0.01em',
            lineHeight: 1,
          }}
        >
          {label}
        </span>
      </div>
    </Link>
  );
}

/* ─── Sidebar Inner Content Panel ─────────────────────── */

function SidebarContent({ onClose }: { onClose: () => void }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [logoutHovered, setLogoutHovered] = useState(false);

  const isAdmin = user?.role === 'admin';

  return (
    <div
      style={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        background: '#131515',
        borderRight: '1px solid #2A2A2A',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Brand Header with ✕ Close Button ── */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px 0 20px',
          borderBottom: '1px solid #222',
          flexShrink: 0,
        }}
      >
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

        {/* ✕ Close button inside sidebar */}
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: '1px solid #333',
            borderRadius: 8,
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#888',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#242424';
            e.currentTarget.style.borderColor = '#FFD814';
            e.currentTarget.style.color = '#FFD814';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = '#333';
            e.currentTarget.style.color = '#888';
          }}
          aria-label="Close sidebar"
          title="Close sidebar"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* ── Scrollable Navigation Items ── */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px 0 8px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#2A2A2A transparent',
        }}
      >
        {/* MAIN Section */}
        <SectionLabel label="Main" />
        {mainNav.map((item) => (
          <NavItem
            key={item.path}
            path={item.path}
            icon={item.icon}
            label={item.label}
            active={location.pathname === item.path}
          />
        ))}

        {/* ACCOUNT Section */}
        <SectionLabel label="Account" />
        {accountNav.map((item) => (
          <NavItem
            key={item.path}
            path={item.path}
            icon={item.icon}
            label={item.label}
            active={location.pathname === item.path}
          />
        ))}

        {/* Admin Panel (if user role is admin) */}
        {isAdmin && (
          <>
            <SectionLabel label="Admin" />
            <NavItem
              path="/admin"
              icon={FiUsers}
              label="Admin Panel"
              active={location.pathname === '/admin'}
            />
          </>
        )}
      </nav>

      {/* ── Bottom User Profile & Logout ── */}
      <div style={{ flexShrink: 0, borderTop: '1px solid #222' }}>
        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 16px 10px',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#FFD814',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              userSelect: 'none',
            }}
          >
            <span
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: '#111111',
                lineHeight: 1,
              }}
            >
              {user?.username?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: 14.5,
                fontWeight: 600,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.username ?? 'User'}
            </p>
            <p
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: '#8A8A8A',
                margin: 0,
                lineHeight: 1.4,
                textTransform: 'capitalize',
              }}
            >
              {user?.role ?? 'user'}
            </p>
          </div>
        </div>

        {/* Logout Action */}
        <div style={{ padding: '0 8px 12px' }}>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              width: '100%',
              height: 42,
              padding: '0 14px',
              borderRadius: 9,
              border: 'none',
              cursor: 'pointer',
              background: logoutHovered ? 'rgba(220,38,38,0.12)' : 'transparent',
              color: logoutHovered ? '#FF6B6B' : '#999',
              transition: 'background 180ms ease, color 180ms ease',
              fontSize: 15,
              fontWeight: 500,
            }}
            aria-label="Logout"
          >
            <FiLogOut
              size={19}
              style={{
                flexShrink: 0,
                color: logoutHovered ? '#FF6B6B' : '#666',
                transition: 'color 180ms ease',
              }}
            />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Exported Responsive Collapsible Sidebar ─────────── */

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* ── Desktop Collapsible Sidebar (1024px+) ── */}
      <aside
        className="hidden lg:block"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: SIDEBAR_WIDTH,
          zIndex: 45,
          transform: isOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_WIDTH}px)`,
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isOpen ? '4px 0 20px rgba(0,0,0,0.25)' : 'none',
        }}
      >
        <SidebarContent onClose={onClose} />
      </aside>

      {/* ── Mobile / Tablet Drawer (<1024px) ── */}
      <div className="lg:hidden">
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Dark backdrop */}
              <motion.div
                key="sidebar-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.65)',
                  zIndex: 55,
                }}
              />

              {/* Sliding drawer */}
              <motion.aside
                key="sidebar-drawer"
                initial={{ x: -SIDEBAR_WIDTH }}
                animate={{ x: 0 }}
                exit={{ x: -SIDEBAR_WIDTH }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  height: '100vh',
                  width: SIDEBAR_WIDTH,
                  zIndex: 60,
                  boxShadow: '4px 0 28px rgba(0, 0, 0, 0.6)',
                }}
              >
                <SidebarContent onClose={onClose} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
