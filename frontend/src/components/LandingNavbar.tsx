import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield } from 'react-icons/fi';

export default function LandingNavbar() {
  const links = [
    { href: '#home', label: 'Home' },
    { href: '#features', label: 'Features' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50"
      style={{ background: '#0F1111', borderBottom: '1px solid #303333' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFD814' }}>
            <FiShield size={16} style={{ color: '#111111' }} />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ color: '#FFFFFF' }}>VulnScan</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: '#9AA0A6' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFD814')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9AA0A6')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium transition-colors duration-150 px-4 py-2 rounded-lg"
            style={{ color: '#FFFFFF' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FFD814')}
            onMouseLeave={e => (e.currentTarget.style.color = '#FFFFFF')}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="text-sm font-bold px-4 py-2 rounded-lg transition-all duration-150"
            style={{ background: '#FFD814', color: '#111111', border: '1px solid #E6A800' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#F5C400';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 8px rgba(230,168,0,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = '#FFD814';
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '';
            }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
