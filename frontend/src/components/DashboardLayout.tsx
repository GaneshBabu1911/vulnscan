import { useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Sidebar is hidden/closed by default on all devices as requested
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F7F7F7',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Fixed Top Header (always stays at the top) ── */}
      <DashboardHeader
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* ── Collapsible Sidebar (260px, closed by default) ── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/*
        ── Main Content Area ──
        - Starts below the 64px header (padding-top: 64px)
        - When sidebar is closed: width 100%, margin-left: 0
        - When sidebar is open on desktop: width calc(100% - 260px), margin-left: 260px
        - Dynamic smooth transition
      */}
      <main
        className={`dashboard-main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            flex: 1,
            padding: '24px 28px',
            maxWidth: 1600,
            width: '100%',
            margin: '0 auto',
          }}
        >
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
}
