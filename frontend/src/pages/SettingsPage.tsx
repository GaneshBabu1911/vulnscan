import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

function PasswordField({
  id, value, onChange, placeholder, disabled,
}: { id: string; value: string; onChange: (v: string) => void; placeholder: string; disabled?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field pr-10"
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
      >
        {visible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const checks = [
    { label: '8+ characters', met: newPassword.length >= 8 },
    { label: 'Uppercase', met: /[A-Z]/.test(newPassword) },
    { label: 'Lowercase', met: /[a-z]/.test(newPassword) },
    { label: 'Number', met: /\d/.test(newPassword) },
    { label: 'Special char', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
  ];
  const strength = checks.filter((c) => c.met).length;
  const strengthColors = ['#ff0040', '#ff6600', '#ffcc00', '#00ccff', '#00ff41'];

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (strength < 4) {
      toast.error('Password is too weak. Please meet all requirements.');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      toast.error(axiosErr.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-2xl font-bold font-mono neon-text-green mb-2">Settings</h1>
      <p className="text-gray-500 text-sm mb-8">Manage your account security settings</p>

      <div className="max-w-2xl">
          {/* Change Password */}
          <div className="glass-card p-6 neon-border">
            <h2 className="text-base font-semibold mb-5 flex items-center gap-2">
              <FiLock className="text-neon-green" size={16} /> Change Password
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Current Password</label>
                <PasswordField
                  id="current-password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  placeholder="Enter current password"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">New Password</label>
                <PasswordField
                  id="new-password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="Enter new password"
                  disabled={loading}
                />

                {/* Strength meter */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-2">
                      {checks.map((_, i) => (
                        <div
                          key={i}
                          className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{ background: i < strength ? strengthColors[strength - 1] : '#2a2a4a' }}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {checks.map((c) => (
                        <div key={c.label} className="flex items-center gap-1.5">
                          <FiCheck size={10} className={c.met ? 'text-neon-green' : 'text-gray-600'} />
                          <span className={`text-xs ${c.met ? 'text-gray-300' : 'text-gray-600'}`}>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Confirm New Password</label>
                <PasswordField
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-neon-red text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loading || newPassword !== confirmPassword}
                className="btn-primary w-full justify-center gap-2"
              >
                <FiLock size={14} />
                {loading ? 'Updating...' : 'Update Password'}
              </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
