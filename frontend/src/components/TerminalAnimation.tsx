import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const lines = [
  { text: '$ vulnscan --init', type: 'cmd' },
  { text: '[+] Initializing security assessment engine...', type: 'info' },
  { text: '[+] Loading OWASP ZAP integration...', type: 'info' },
  { text: '[+] Loading Nmap scanner module...', type: 'info' },
  { text: '[+] Loading SSL/TLS checker...', type: 'info' },
  { text: '[+] Loading CVSS v3.1 risk engine...', type: 'info' },
  { text: '[✓] All modules loaded successfully', type: 'success' },
  { text: '[!] 3 vulnerabilities detected in target', type: 'warn' },
  { text: '[✓] CVSS calculation complete — Risk: 7.8/10', type: 'success' },
  { text: '$ _', type: 'cmd' },
];

const lineColor = (type: string) => {
  switch (type) {
    case 'success': return '#FFD814';
    case 'warn':    return '#DC2626';
    case 'cmd':     return '#FFFFFF';
    default:        return '#9AA0A6';
  }
};

export default function TerminalAnimation() {
  const [displayLines, setDisplayLines] = useState<Array<{ text: string; type: string }>>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);

  useEffect(() => {
    if (currentLine >= lines.length) {
      const timeout = setTimeout(() => {
        setDisplayLines([]);
        setCurrentLine(0);
        setCurrentChar(0);
      }, 3000);
      return () => clearTimeout(timeout);
    }

    const line = lines[currentLine];
    if (currentChar < line.text.length) {
      const timeout = setTimeout(() => {
        setDisplayLines((prev) => {
          const updated = [...prev];
          updated[currentLine] = { text: line.text.substring(0, currentChar + 1), type: line.type };
          return updated;
        });
        setCurrentChar((c) => c + 1);
      }, 28 + Math.random() * 35);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [currentLine, currentChar]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="w-full max-w-2xl"
      style={{ background: '#0A0C0C', border: '1px solid #303333', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
    >
      {/* Terminal titlebar */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#1A1D1D', borderBottom: '1px solid #303333' }}>
        <div className="w-3 h-3 rounded-full" style={{ background: '#DC2626' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#D97706' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#16A34A' }} />
        <span className="ml-2 text-xs font-mono" style={{ color: '#5F6368' }}>vulnscan — security-assessment</span>
      </div>

      {/* Terminal body */}
      <div className="p-5 min-h-[220px] font-mono text-sm leading-relaxed" style={{ lineHeight: '1.7' }}>
        {displayLines.map((line, i) => (
          <div key={i} style={{ color: lineColor(line.type) }}>
            {line.text}
            {i === currentLine && currentLine < lines.length - 1 && (
              <span className="cursor-blink" style={{ color: '#FF9900' }}>▊</span>
            )}
          </div>
        ))}
        {currentLine >= lines.length && (
          <span className="cursor-blink" style={{ color: '#FF9900' }}>▊</span>
        )}
      </div>
    </motion.div>
  );
}
