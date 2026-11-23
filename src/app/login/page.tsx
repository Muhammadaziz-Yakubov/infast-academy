'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Lock, User, ArrowRight, AlertCircle, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || "Login yoki parol noto'g'ri.");
      }
    } catch (err: any) {
      setError("Tarmoq xatosi. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Apple Subtle Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-infast-500/10 dark:bg-infast-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/80 dark:bg-white/[0.08] backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.1] text-slate-700 dark:text-slate-200 shadow-sm hover:bg-white dark:hover:bg-white/[0.14] transition-all active:scale-95"
          title={darkMode ? "Yorug' rejim" : "Tungi rejim"}
          aria-label="Toggle Theme"
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white/85 dark:bg-[#121216]/85 backdrop-blur-3xl rounded-3xl p-8 sm:p-10 shadow-apple-float border border-black/[0.06] dark:border-white/[0.08] relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-3.5 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FF2A85]/30 to-[#00F0FF]/30 rounded-2xl blur-xl" />
            <img
              src="/logo-icon.png"
              alt="InFast Logo"
              className="w-14 h-14 object-contain relative z-10 drop-shadow-[0_0_16px_rgba(255,42,133,0.4)]"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            INFAST <span className="bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF] bg-clip-text text-transparent">IT-ACADEMY</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5 tracking-tight">
            Ma'muriyat va CRM Tizimiga Kirish
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center space-x-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Login
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Admin login..."
                className="w-full pl-11 pr-4 py-3 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-infast-500/20 focus:border-infast-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Parol
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-infast-500/20 focus:border-infast-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#FF2A85] bg-[length:200%_auto] hover:bg-right transition-all duration-300 text-white font-bold rounded-2xl shadow-lg shadow-[#FF2A85]/20 flex items-center justify-center space-x-2 active:scale-[0.98] disabled:opacity-50 mt-6 text-sm tracking-tight"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Tizimga kirish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-8 tracking-tight">
          © {new Date().getFullYear()} INFAST IT-ACADEMY. Barcha huquqlar himoyalangan.
        </p>
      </motion.div>
    </div>
  );
}
