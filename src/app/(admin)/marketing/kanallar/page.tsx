'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Plus,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  X,
  CheckCircle2,
} from 'lucide-react';
import { formatMoneyUz } from '@/lib/utils';

export default function KanallarPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/channels');
      const data = await res.json();
      if (data.success) {
        setChannels(data.channels || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/marketing/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setName('');
        setDescription('');
        setToast("Kanal muvaffaqiyatli qo'shildi!");
        setTimeout(() => setToast(null), 3000);
        fetchChannels();
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2 text-sm font-bold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">📱</span>
            Kanallar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Marketing kanallari bo'yicha leadlar, sotuvlar, xarajatlar hamda ROI tahlili
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Kanal qo'shish
        </button>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Yuklanmoqda...
          </div>
        ) : channels.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Kanallar topilmadi
          </div>
        ) : (
          channels.map((ch) => (
            <div
              key={ch._id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{ch.name}</h3>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                      {ch.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-semibold">ROI</div>
                  <div className="text-lg font-black text-amber-500">{ch.roi}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Leadlar</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{ch.leadsCount || 0} ta</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Studentlar</span>
                  <span className="font-bold text-emerald-600 text-sm">{ch.studentsCount || 0} ta</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Xarajat</span>
                  <span className="font-bold text-rose-600">{formatMoneyUz(ch.spend || 0)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Daromad</span>
                  <span className="font-bold text-emerald-600">{formatMoneyUz(ch.revenue || 0)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">CPL</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{formatMoneyUz(ch.cpl || 0)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">CAC</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{formatMoneyUz(ch.cac || 0)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Channel */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-500" />
                Yangi Kanal Qo'shish
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Kanal Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: YouTube Ads"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Tavsif</label>
                <textarea
                  placeholder="Kanal haqida batafsil ma'lumot..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-20"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
