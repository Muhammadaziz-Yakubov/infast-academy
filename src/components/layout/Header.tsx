'use client';

import React, { useState, useEffect } from 'react';
import { Bell, User, CheckCircle2, AlertTriangle, Info, XCircle, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { GlobalSearch } from '@/components/common/GlobalSearch';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchNotifications();

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
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

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {/* Apple Spotlight Global Search Trigger */}
        <GlobalSearch />
      </div>

      <div className="flex items-center space-x-3">
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? "Yorug' rejim" : "Tungi rejim"}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">Xabarnomalar</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-infast-600 font-semibold hover:underline"
                  >
                    Barchasini o'qildi qilish
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">Xabarlar yo'q</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} className={`p-3.5 flex items-start space-x-3 ${n.isRead ? 'bg-white dark:bg-slate-900' : 'bg-orange-50/50 dark:bg-slate-800/80'}`}>
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {n.type === 'DANGER' && <XCircle className="w-4 h-4 text-rose-500" />}
                        {n.type === 'INFO' && <Info className="w-4 h-4 text-sky-500" />}
                      </div>
                      <div className="flex-1 text-xs">
                        <p className="font-bold text-slate-900 dark:text-white">{n.title}</p>
                        <p className="text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-200 dark:border-slate-800 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-infast-600 hover:text-infast-700"
                >
                  Barcha xabarlarni ko'rish →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile - Muhammadaziz Yakubov */}
        <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-infast-500 text-white font-bold flex items-center justify-center text-xs">
            M
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Muhammadaziz Yakubov</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Bosh Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
