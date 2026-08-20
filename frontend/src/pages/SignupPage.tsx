import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiShield, FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

interface SignupForm {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  terms: boolean;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', met: password.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(password) },
    { label: 'Lowercase', met: /[a-z]/.test(password) },
    { label: 'Number', met: /\d/.test(password) },
    { label: 'Special char', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];
  const score = checks.filter((c) => c.met).length;
  const barColors = ['#DC2626', '#EA580C', '#D97706', '#0EA5E9', '#16A34A'];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][score];

  return (
    <div className="mt-2.5">
      <div className="flex gap-1 mb-1.5">
        {checks.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? barColors[score - 1] : '#E8EAED' }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {checks.map((c) => (
            <span key={c.label} className="text-xs" style={{ color: c.met ? '#16A34A' : '#9AA0A6' }}>
              {c.met ? '✓' : '○'} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className="text-xs font-semibold ml-2 shrink-0" style={{ color: barColors[score - 1] }}>
            {strengthLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>();
  const password = watch('password', '');

  const onSubmit = async (data: SignupForm) => {
    if (data.password !== data.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup(data.username, data.email, data.password);
      navigate('/login', { state: { message: 'Registration successful. Please verify your email.' } });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F7F7F7' }}>
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-[420px] shrink-0"
        style={{ background: '#0F1111' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#FFD814' }}>
            <FiShield size={18} style={{ color: '#111111' }} />
          </div>
          <span className="font-bold text-lg" style={{ color: '#FFFFFF' }}>VulnScan</span>
        </div>

        <div>
          <h2 className="font-bold mb-4 leading-tight" style={{ fontSize: '30px', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Start securing your applications today
          </h2>
          <p style={{ color: '#9AA0A6', lineHeight: '1.7', fontSize: '15px' }}>
            Join thousands of security professionals using VulnScan to identify and remediate
            web vulnerabilities before they become breaches.
          </p>
        </div>

        <div className="space-y-3">
          {[
            'Automated OWASP ZAP vulnerability scanning',
            'CVSS v3.1 risk scoring & classification',
            'AI-powered remediation recommendations',
            'PDF & JSON security report generation',
          ].map(item => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center" style={{ background: '#FFD814' }}>
                <span style={{ fontSize: '9px', color: '#111111', fontWeight: 900 }}>✓</span>
              </div>
              <span style={{ color: '#9AA0A6', fontSize: '13px' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#FFD814' }}>
              <FiShield size={16} style={{ color: '#111111' }} />
            </div>
            <span className="font-bold text-lg" style={{ color: '#111111' }}>VulnScan</span>
          </div>

          <div className="mb-8">
            <h1 className="font-bold mb-2" style={{ fontSize: '28px', color: '#111111', letterSpacing: '-0.02em' }}>Create account</h1>
            <p style={{ color: '#5F6368', fontSize: '15px' }}>Get started with your free VulnScan account.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg mb-4 text-sm"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#111111' }}>Username</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: '#9AA0A6' }} />
                <input
                  {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'Min 3 characters' } })}
                  className="input-field pl-11"
                  placeholder="your_username"
                  autoComplete="username"
                />
              </div>
              {errors.username && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#111111' }}>Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: '#9AA0A6' }} />
                <input
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                  className="input-field pl-11"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#111111' }}>Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: '#9AA0A6' }} />
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                  type={showPw ? 'text' : 'password'}
                  className="input-field pl-11 pr-11"
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: '#9AA0A6' }}
                >
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {password && <PasswordStrength password={password} />}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#111111' }}>Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: '#9AA0A6' }} />
                <input
                  {...register('confirm_password', { required: 'Please confirm your password' })}
                  type="password"
                  className="input-field pl-11"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                {...register('terms', { required: 'You must accept the terms' })}
                className="mt-0.5 rounded"
                style={{ accentColor: '#FF9900' }}
              />
              <span className="text-sm" style={{ color: '#5F6368' }}>
                I agree to the <span style={{ color: '#FF9900' }}>Terms of Service</span> and <span style={{ color: '#FF9900' }}>Privacy Policy</span>
              </span>
            </label>
            {errors.terms && <p className="text-xs" style={{ color: '#DC2626' }}>{errors.terms.message}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full" style={{ height: '48px', fontSize: '15px' }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#5F6368' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold transition-colors"
              style={{ color: '#FF9900' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#E6A800')}
              onMouseLeave={e => (e.currentTarget.style.color = '#FF9900')}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
