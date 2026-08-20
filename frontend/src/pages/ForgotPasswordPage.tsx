import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiMail, FiKey, FiLock, FiCheckCircle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';
import { authAPI } from '../services/api';


type Step = 'email' | 'otp' | 'password' | 'success';

const SLIDE = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -40 },
};

// ── Password strength helper ──────────────────────────────────────────────────
const checks = (pw: string) => [
  { label: '8+ characters',       met: pw.length >= 8 },
  { label: 'Uppercase letter',    met: /[A-Z]/.test(pw) },
  { label: 'Lowercase letter',    met: /[a-z]/.test(pw) },
  { label: 'Number',              met: /\d/.test(pw) },
  { label: 'Special character',   met: /[^A-Za-z0-9]/.test(pw) },
];
const strengthColor = (n: number) =>
  ['#ff0040', '#ff6600', '#ffcc00', '#00ccff', '#00ff41'][n - 1] || '#2a2a4a';

// ── OTP digit input component ─────────────────────────────────────────────────
function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, ch: string) => {
    if (!/^\d*$/.test(ch)) return;
    const digits = value.split('');
    digits[i] = ch.slice(-1);
    const next = digits.join('');
    onChange(next.padEnd(6, ''));
    if (ch && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      inputs.current[i - 1]?.focus();
      const digits = value.split('');
      digits[i - 1] = '';
      onChange(digits.join('').padEnd(6, ''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) { onChange(pasted.padEnd(6, '')); inputs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-14 text-center text-2xl font-mono font-bold rounded-xl border-2 bg-white text-gray-900 outline-none transition-all duration-200"
          style={{
            borderColor: value[i] ? '#FF9900' : '#D5D9D9',
            boxShadow: value[i] ? '0 0 0 3px rgba(255,153,0,0.15)' : 'none',
          }}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('      ');
  const [sessionToken, setSessionToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpDigits = otp.trim().replace(/\s/g, '');

  // Step 1 — send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(''); setLoading(true);
    try {
      await authAPI.sendOTP(email.trim().toLowerCase());
      setStep('otp');
      startCooldown();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally { setLoading(false); }
  };

  // Resend OTP cooldown (60s)
  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(''); setLoading(true);
    try {
      await authAPI.sendOTP(email);
      setOtp('      ');
      startCooldown();
    } catch {
      setError('Failed to resend OTP.');
    } finally { setLoading(false); }
  };

  // Step 2 — verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpDigits.length < 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP(email, otpDigits);
      setSessionToken(data.session_token);
      setStep('password');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally { setLoading(false); }
  };

  // Step 3 — reset password
  const pwChecks = checks(password);
  const pwStrength = pwChecks.filter(c => c.met).length;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (pwStrength < 3) { setError('Password is too weak. Please meet at least 3 requirements.'); return; }
    setError(''); setLoading(true);
    try {
      await authAPI.resetPassword(sessionToken, password, true);
      setStep('success');
      setTimeout(() => navigate('/login'), 3500);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error || 'Failed to reset password.');
    } finally { setLoading(false); }
  };

  // Progress steps UI
  const steps: { id: Step; label: string }[] = [
    { id: 'email', label: 'Email' },
    { id: 'otp', label: 'Verify OTP' },
    { id: 'password', label: 'New Password' },
  ];
  const stepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4" style={{ background: '#F7F7F7' }}>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="auth-card p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: '#FFD814' }}>
              <FiShield size={22} style={{ color: '#111111' }} />
            </div>
            <h1 className="text-2xl font-bold text-center" style={{ color: '#111111', letterSpacing: '-0.02em' }}>
              Reset Password
            </h1>
            {step !== 'success' && (
              <p className="text-sm mt-1 text-center" style={{ color: '#5F6368' }}>
                Secure OTP verification to your registered email
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {step !== 'success' && (
            <div className="flex items-center gap-0 mb-8">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono border-2 transition-all duration-300"
                      style={{
                        borderColor: i <= stepIndex ? '#00ff41' : '#2a2a4a',
                        background: i < stepIndex ? '#00ff41' : i === stepIndex ? 'rgba(0,255,65,0.15)' : 'transparent',
                        color: i <= stepIndex ? (i < stepIndex ? '#0a0a0f' : '#00ff41') : '#555',
                      }}
                    >
                      {i < stepIndex ? '✓' : i + 1}
                    </div>
                    <span className="text-xs mt-1 font-mono" style={{ color: i <= stepIndex ? '#00ff41' : '#555' }}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="h-px flex-1 mb-5 transition-all duration-500"
                      style={{ background: i < stepIndex ? '#00ff41' : '#2a2a4a' }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm px-4 py-3 rounded-xl mb-4 flex items-start gap-2"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
            >
              <span>⚠</span> {error}
            </motion.div>
          )}

          {/* ── Step content ─────────────────────────────────────────── */}
          <AnimatePresence mode="wait">

            {/* STEP 1: Enter Email */}
            {step === 'email' && (
              <motion.form key="email" {...SLIDE} transition={{ duration: 0.2 }} onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="text-gray-700 text-sm mb-2 block font-medium">Registered Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      className="input-field pl-11"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                  <p className="text-gray-600 text-xs mt-2">
                    We'll send a 6-digit OTP to this email address.
                  </p>
                </div>
                <button
                  id="send-otp-btn"
                  type="submit"
                  disabled={loading || !email}
                  className="btn-primary w-full justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><FiRefreshCw className="animate-spin" size={14} /> Sending OTP…</span>
                  ) : (
                    <span className="flex items-center gap-2"><FiMail size={14} /> Send OTP</span>
                  )}
                </button>
                <Link to="/login" className="flex items-center justify-center gap-1 text-gray-500 text-sm hover:text-neon-green transition-colors">
                  <FiArrowLeft size={13} /> Back to Login
                </Link>
              </motion.form>
            )}

            {/* STEP 2: Enter OTP */}
            {step === 'otp' && (
              <motion.form key="otp" {...SLIDE} transition={{ duration: 0.2 }} onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-cyber-dark border border-cyber-border px-4 py-2 rounded-xl mb-4">
                    <FiMail size={14} className="text-neon-green" />
                    <span className="text-sm font-mono text-gray-300">{email}</span>
                  </div>
                  <p className="text-gray-400 text-sm">Enter the 6-digit OTP sent to your email.</p>
                  <p className="text-gray-600 text-xs mt-1">Check your spam folder if you don't see it.</p>
                </div>

                <OTPInput value={otp} onChange={setOtp} />

                <button
                  id="verify-otp-btn"
                  type="submit"
                  disabled={loading || otpDigits.length < 6}
                  className="btn-primary w-full justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><FiRefreshCw className="animate-spin" size={14} /> Verifying…</span>
                  ) : (
                    <span className="flex items-center gap-2"><FiKey size={14} /> Verify OTP</span>
                  )}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setError(''); setOtp('      '); }}
                    className="text-gray-500 hover:text-neon-green flex items-center gap-1 transition-colors"
                  >
                    <FiArrowLeft size={13} /> Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="text-gray-500 hover:text-neon-green disabled:opacity-40 flex items-center gap-1 transition-colors"
                  >
                    <FiRefreshCw size={13} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 3: New Password */}
            {step === 'password' && (
              <motion.form key="password" {...SLIDE} transition={{ duration: 0.2 }} onSubmit={handleResetPassword} className="space-y-5">
                <div className="flex items-center gap-2 text-neon-green text-sm mb-2">
                  <FiCheckCircle size={15} />
                  <span>OTP verified! Set your new password below.</span>
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-2 block font-medium">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      id="new-password"
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="input-field pl-11"
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      required
                    />
                  </div>

                  {/* Strength meter */}
                  {password && (
                    <div className="mt-3">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="h-1.5 flex-1 rounded-full transition-all duration-300"
                            style={{ background: i <= pwStrength ? strengthColor(pwStrength) : '#E8EAED' }}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {pwChecks.map((c) => (
                          <div key={c.label} className="flex items-center gap-1.5">
                            <span className={`text-xs ${c.met ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                              {c.met ? '✓' : '○'} {c.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-2 block font-medium">Confirm Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                      className="input-field pl-11"
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-neon-red text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                <button
                  id="reset-password-btn"
                  type="submit"
                  disabled={loading || !password || password !== confirm}
                  className="btn-primary w-full justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><FiRefreshCw className="animate-spin" size={14} /> Resetting…</span>
                  ) : (
                    <span className="flex items-center gap-2"><FiLock size={14} /> Reset Password</span>
                  )}
                </button>
              </motion.form>
            )}

            {/* SUCCESS */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{ background: 'rgba(0,255,65,0.15)', border: '2px solid #00ff41' }}
                >
                  <FiCheckCircle className="text-neon-green" size={32} />
                </motion.div>
                <h2 className="text-xl font-bold font-mono neon-text-green">Password Reset!</h2>
                <p className="text-gray-400 text-sm">
                  Your password has been changed successfully.
                  <br />Redirecting to login…
                </p>
                <div className="w-full bg-cyber-border rounded-full h-1 overflow-hidden mt-4">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3.5, ease: 'linear' }}
                    className="h-full bg-neon-green"
                  />
                </div>
                <Link to="/login" className="block text-neon-green text-sm hover:underline mt-2">
                  Go to Login now →
                </Link>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
