import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiShield, FiLock } from 'react-icons/fi';
import { authAPI } from '../services/api';
import MatrixRain from '../components/MatrixRain';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<{ password: string; confirm: string }>();

  const onSubmit = async (data: { password: string; confirm: string }) => {
    if (data.password !== data.confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    try {
      await authAPI.resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center relative">
      <MatrixRain />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card p-8 neon-border">
          <FiShield className="text-neon-green text-4xl mx-auto mb-3 block" />
          <h1 className="text-2xl font-bold text-center neon-text-green font-mono mb-6">New Password</h1>

          {success ? (
            <p className="text-neon-green text-center">Password reset successful! Redirecting...</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && <div className="text-neon-red text-sm">{error}</div>}
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-500" />
                <input
                  {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 chars' } })}
                  type="password"
                  className="input-field pl-10"
                  placeholder="New password"
                />
              </div>
              {errors.password && <p className="text-neon-red text-xs">{errors.password.message}</p>}
              <input
                {...register('confirm', { required: 'Confirm password' })}
                type="password"
                className="input-field"
                placeholder="Confirm password"
              />
              <button type="submit" className="btn-primary w-full">Reset Password</button>
              <Link to="/login" className="block text-center text-gray-500 text-sm hover:text-neon-green">Back to Login</Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
