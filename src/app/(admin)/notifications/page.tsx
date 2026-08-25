'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, Check } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 pb-12">
      <Header title="Xabarnomalar" />

      <main className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
          <h2 className="font-bold text-base text-slate-900">CRM Bildirishnomalar Markazi</h2>
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Barchasini o'qildi qilish</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-card divide-y divide-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Yuklanmoqda...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">Xabarnomalar mavjud emas</div>
          ) : (
            notifications.map((n) => (
              <div key={n._id} className={`p-4 flex items-start space-x-4 ${n.isRead ? 'bg-white' : 'bg-orange-50/40'}`}>
                <div className="mt-1 p-2 rounded-xl bg-slate-100 shrink-0">
                  {n.type === 'SUCCESS' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {n.type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  {n.type === 'DANGER' && <XCircle className="w-5 h-5 text-rose-500" />}
                  {n.type === 'INFO' && <Info className="w-5 h-5 text-sky-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">{n.title}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(n.createdAt).toLocaleString('uz-UZ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
