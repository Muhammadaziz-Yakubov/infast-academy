'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  ExternalLink,
  Users,
  UserCheck,
  TrendingUp,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { formatMoneyUz } from '@/lib/utils';

export default function LandingSahifalarPage() {
  const [landings, setLandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    url: '',
    status: 'FAOL',
  });

  const fetchLandings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/landings');
      const data = await res.json();
      if (data.success) {
        setLandings(data.landings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLandings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim() || !formData.url.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/marketing/landings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setToast("Landing sahifa qo'shildi!");
        setTimeout(() => setToast(null), 3000);
        setFormData({
          name: '',
          slug: '',
          url: '',
          status: 'FAOL',
        });
        fetchLandings();
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
            <span className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500">🧲</span>
            Landing sahifalar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Reklama sahifalari va ularning tashrif/konversiya statistikasi
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-sm shadow-md shadow-cyan-600/20 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Landing qo'shish
        </button>
      </div>

      {/* Landings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Yuklanmoqda...
          </div>
        ) : landings.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Landing sahifalar topilmadi
          </div>
        ) : (
          landings.map((l) => (
            <div
              key={l._id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{l.name}</h3>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-600 font-medium flex items-center gap-1 hover:underline truncate max-w-[200px]"
                  >
                    <Globe className="w-3 h-3" />
                    {l.slug}
                  </a>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">
                  {l.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Tashriflar</span>
                  <span className="font-bold text-slate-900 dark:text-white">{l.visitorsCount || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Leadlar</span>
                  <span className="font-bold text-blue-600">{l.leadsCount || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Studentlar</span>
                  <span className="font-bold text-emerald-600">{l.studentsCount || 0}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Konversiya</span>
                  <span className="font-bold text-amber-500">{l.conversion || 0}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Landing */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-500" />
                Yangi Landing Sahifa
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Frontend Intensive Landing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="frontend-intensive"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Tashqi URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://infast.uz/frontend"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-md shadow-cyan-600/20"
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
