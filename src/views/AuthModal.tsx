import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Shield, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, loginAsDemoUser, loginAsDemoAdmin } =
    useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'login') {
      await login(email, password);
    } else {
      await register(name, email, password);
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#0D101A] border border-neutral-800 p-6 md:p-8 space-y-6 text-xs text-neutral-200 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {mode === 'login' ? 'Sign In to SAHRIVA Store' : 'Create SAHRIVA Account'}
            </h3>
          </div>
          <button
            onClick={closeAuthModal}
            className="text-neutral-400 hover:text-white p-1"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Fast Demo Buttons */}
        <div className="space-y-2 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
          <span className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider block">
            Instant Demo Profiles
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => loginAsDemoUser()}
              className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-lg text-left text-neutral-200 font-medium flex items-center gap-2 cursor-pointer transition-colors"
            >
              <User className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div className="truncate">
                <span className="block font-semibold text-white">Alex Chen</span>
                <span className="text-[10px] text-neutral-500">Standard User</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => loginAsDemoAdmin()}
              className="px-3 py-2 bg-violet-950/30 hover:bg-violet-900/40 border border-violet-800/40 rounded-lg text-left text-violet-200 font-medium flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <div className="truncate">
                <span className="block font-semibold text-white">Administrator</span>
                <span className="text-[10px] text-violet-400">Admin Role</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-neutral-500">
          <hr className="flex-1 border-neutral-800" />
          <span className="text-[10px] uppercase">Or enter credentials</span>
          <hr className="flex-1 border-neutral-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@company.com"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer shadow-md shadow-violet-600/30 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-neutral-800 text-[11px] text-neutral-400">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-violet-400 hover:underline font-semibold cursor-pointer"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-violet-400 hover:underline font-semibold cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
