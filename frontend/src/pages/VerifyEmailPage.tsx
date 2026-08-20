import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import MatrixRain from '../components/MatrixRain';
import LoadingSpinner from '../components/LoadingSpinner';
import { authAPI } from '../services/api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    authAPI.verifyEmail(token)
      .then(({ data }) => {
        setStatus('success');
        setMessage(data.message || 'Email verified successfully');
      })
      .catch((err: { response?: { data?: { error?: string } } }) => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center relative">
      <MatrixRain />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 neon-border text-center">
          <FiShield className="text-neon-green text-4xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold neon-text-green font-mono mb-6">Email Verification</h1>

          {status === 'loading' && (
            <LoadingSpinner label="Verifying your email..." />
          )}

          {status === 'success' && (
            <>
              <FiCheckCircle className="text-neon-green text-5xl mx-auto mb-4" />
              <p className="text-gray-300 mb-6">{message}</p>
              <Link to="/login" className="btn-primary inline-block">Continue to Login</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <FiXCircle className="text-neon-red text-5xl mx-auto mb-4" />
              <p className="text-gray-300 mb-6">{message}</p>
              <Link to="/login" className="btn-secondary inline-block">Back to Login</Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
