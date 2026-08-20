import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiBell, FiShield, FiSave, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { notifications, markRead, markAllRead, unreadCount } = useNotifications(30000);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async () => {
    if (!username.trim() || !email.trim()) {
      toast.error('Username and Email cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await profileAPI.update({ username: username.trim(), email: email.trim() });
      await refreshUser();
      toast.success('Profile details updated successfully');
    } catch {
      toast.error('Failed to update profile details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-mono neon-text-green">User Profile</h1>
          <p className="text-gray-600 text-sm mt-1">Manage security credentials and notification activity</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* User Account Settings */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-300 flex items-center justify-center shadow-sm">
                <span className="text-amber-600 font-mono text-2xl font-bold">
                  {user?.username?.[0]?.toUpperCase()}
                </span>
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {user?.username}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    {user?.role}
                  </span>
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <FiCheckCircle size={12} /> {user?.is_verified ? 'Account Verified' : 'Unverified'}
                  </span>
                  <span>•</span>
                  <span>Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 mb-2">
                  <FiUser size={14} className="text-amber-600" /> Username
                </label>
                <div className="relative">
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field font-mono"
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-700 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 mb-2">
                  <FiMail size={14} className="text-amber-600" /> Email Address
                </label>
                <div className="relative">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field font-mono"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full gap-2 mt-2"
              >
                <FiSave size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>

          {/* Notifications Center */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FiBell className="text-amber-600" size={18} /> Activity & Notifications
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200">
                    {unreadCount} unread
                  </span>
                )}
              </h2>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-mono text-blue-600 hover:underline font-semibold"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 border ${
                    n.is_read
                      ? 'bg-gray-50/70 border-gray-200 text-gray-700 hover:bg-gray-100/80'
                      : 'bg-amber-50/40 border-amber-300 text-gray-900 shadow-sm hover:bg-amber-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">{n.message}</p>
                  <p className="text-[10px] font-mono text-gray-500">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </button>
              ))}

              {!notifications.length && (
                <div className="text-center py-10 text-gray-500 space-y-2">
                  <FiShield size={32} className="mx-auto text-gray-400" />
                  <p className="text-sm">No notifications recorded</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </motion.div>
  );
}
