import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiMenu, FiX, FiArrowRight } from 'react-icons/fi';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '#home', label: 'Home' },
    { href: '#features', label: 'Features' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 h-[78px] transition-all duration-300 ${
        scrolled
          ? 'bg-[#131921]/95 backdrop-blur-md border-b border-[#232F3E] shadow-xl shadow-black/20'
          : 'bg-[#131921]/80 backdrop-blur-sm border-b border-white/[0.06]'
      }`}
    >
      <div className="max-w-[1440px] mx-auto h-full px-5 sm:px-10 lg:px-[72px] flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FFB703] shadow-md shadow-[#FFB703]/25 group-hover:scale-105 transition-transform duration-200">
            <FiShield size={19} className="text-[#131921] stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight flex items-center gap-1">
            Vuln<span className="text-[#FFB703]">Scan</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-[#D1D5DB] hover:text-white transition-colors duration-200 py-1 group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#FFB703] transition-all duration-200 group-hover:w-full rounded-full" />
            </a>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3.5">
          <Link
            to="/login"
            className="text-sm font-semibold text-white px-5 py-2.5 rounded-lg border border-white/20 hover:border-[#FFB703] hover:text-[#FFB703] transition-all duration-200"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="text-sm font-bold text-[#131921] px-5 py-2.5 rounded-lg bg-[#FFB703] hover:bg-[#F59E0B] shadow-md shadow-[#FFB703]/20 hover:shadow-lg hover:shadow-[#FFB703]/30 transition-all duration-200 flex items-center gap-1.5"
          >
            Sign Up
            <FiArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-white hover:text-[#FFB703] hover:bg-[#232F3E] transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#131921] border-b border-[#232F3E] px-6 py-5 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-[#D1D5DB] hover:text-[#FFB703] transition-colors py-1"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-[#232F3E] flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-sm font-semibold text-white py-2.5 rounded-lg border border-white/20 hover:border-[#FFB703]"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-sm font-bold text-[#131921] py-2.5 rounded-lg bg-[#FFB703] hover:bg-[#F59E0B]"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
