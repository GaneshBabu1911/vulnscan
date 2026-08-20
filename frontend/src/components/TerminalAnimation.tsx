import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTerminal } from 'react-icons/fi';

const lines = [
  { text: '$ vulnscan assess https://api.target-enterprise.com --depth=full', type: 'cmd' },
  { text: '[*] Initializing VulnScan enterprise security pipeline v3.4...', type: 'log' },
  { text: '[+] Spawning OWASP ZAP core engine (200+ rule active scan)...', type: 'log' },
  { text: '[+] Launching Nmap stealth SYN service discovery on target...', type: 'log' },
  { text: '[+] Analyzing SSL/TLS cipher suites and HSTS policies...', type: 'log' },
  { text: '[✓] Target service enumeration complete: 4 services identified', type: 'success' },
  { text: '[!] OWASP ZAP Alert: Detected CWE-89 SQL Injection in /api/v1/auth', type: 'warn' },
  { text: '[✓] Calculating CVSS v3.1 vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', type: 'log' },
  { text: '[★] AI Remediation Engine: Synthesized parameterized query patch', type: 'ai' },
  { text: '[✓] Executive PDF & JSON compliance report exported successfully', type: 'success' },
  { text: '$ _', type: 'cmd' },
];

const lineColor = (type: string) => {
  switch (type) {
    case 'cmd':     return '#FFFFFF';
    case 'log':     return '#38BDF8';
    case 'success': return '#FFB703';
    case 'warn':    return '#EF4444';
    case 'ai':      return '#F59E0B';
    default:        return '#9CA3AF';
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
      }, 4000);
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
      }, line.type === 'cmd' ? 24 + Math.random() * 20 : 12);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
      }, line.type === 'cmd' ? 300 : 180);
      return () => clearTimeout(timeout);
    }
  }, [currentLine, currentChar]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="w-full rounded-[18px] overflow-hidden border border-[#232F3E] shadow-2xl shadow-black/80 backdrop-blur-xl"
      style={{ background: '#080B0F' }}
    >
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#232F3E] bg-[#10141D]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#EF4444] shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-sm" />
          <span className="ml-3 text-xs font-mono font-medium text-[#9CA3AF] flex items-center gap-1.5">
            <FiTerminal className="text-[#FFB703]" size={13} />
            vulnscan-core — assessment@production
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
          <span className="text-[11px] font-mono text-[#10B981] font-semibold uppercase tracking-wider">Live Agent</span>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-6 font-mono text-[13px] sm:text-[14px] leading-relaxed min-h-[340px] flex flex-col justify-start overflow-x-auto select-none">
        {displayLines.map((line, i) => (
          <div key={i} className="mb-1.5 flex items-start" style={{ color: lineColor(line.type) }}>
            <span className="break-all">{line.text}</span>
            {i === currentLine && currentLine < lines.length - 1 && (
              <span className="inline-block w-2 h-4 ml-1 bg-[#FFB703] animate-pulse" />
            )}
          </div>
        ))}
        {currentLine >= lines.length && (
          <div className="flex items-center text-white">
            <span>$ _</span>
            <span className="inline-block w-2 h-4 ml-1 bg-[#FFB703] animate-pulse" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

