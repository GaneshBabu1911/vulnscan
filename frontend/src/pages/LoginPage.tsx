import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiShield, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

interface LoginForm {
  email: string;
  password: string;
  remember_me: boolean;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { message?: string } | null)?.message;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError('');
    setLoading(true);
    try {
      await login(data.email, data.password, data.remember_me);
      navigate('/dashboard');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Login failed');
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
            Professional Web Security Assessment Platform
          </h2>
          <p style={{ color: '#9AA0A6', lineHeight: '1.7', fontSize: '15px' }}>
            Industry-standard vulnerability scanning with OWASP ZAP, Nmap, CVSS v3.1 scoring,
            and AI-powered remediation guidance.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {['OWASP ZAP', 'Nmap Scanner', 'CVSS v3.1', 'AI Reports'].map(tool => (
            <div key={tool} className="rounded-lg px-3 py-2" style={{ background: '#171A1A', border: '1px solid #303333' }}>
              <span style={{ color: '#9AA0A6', fontSize: '12px', fontWeight: 600 }}>{tool}</span>
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
            <h1 className="font-bold mb-2" style={{ fontSize: '28px', color: '#111111', letterSpacing: '-0.02em' }}>Sign in</h1>
            <p style={{ color: '#5F6368', fontSize: '15px' }}>Welcome back! Enter your credentials to continue.</p>
          </div>

          {successMessage && (
            <div className="flex items-start gap-2 p-3 rounded-lg mb-4 text-sm"
              style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D' }}>
              ✓ {successMessage}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg mb-4 text-sm"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                  {...register('password', { required: 'Password is required' })}
                  type={showPw ? 'text' : 'password'}
                  className="input-field pl-11 pr-11"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#9AA0A6' }}
                >
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: '#DC2626' }}>{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#5F6368' }}>
                <input
                  type="checkbox"
                  {...register('remember_me')}
                  className="rounded"
                  style={{ accentColor: '#FF9900' }}
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm font-medium transition-colors"
                style={{ color: '#FF9900' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E6A800')}
                onMouseLeave={e => (e.currentTarget.style.color = '#FF9900')}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full" style={{ height: '48px', fontSize: '15px' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#5F6368' }}>
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold transition-colors"
              style={{ color: '#FF9900' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#E6A800')}
              onMouseLeave={e => (e.currentTarget.style.color = '#FF9900')}>
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
