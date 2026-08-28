'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Calendar,
  CheckCircle2,
  X,
  RefreshCw,
  Clock,
  Instagram,
  Send,
  Video,
} from 'lucide-react';

export default function KontentRejalashtiruvchiPage() {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    platform: 'Instagram',
    type: 'Reels',
    status: 'G‘OYA',
    scheduledAt: '',
    responsibleUser: 'Admin',
  });

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/content');
      const data = await res.json();
      if (data.success) {
        setContents(data.contents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/marketing/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setToast("Kontent reja muvaffaqiyatli saqlandi!");
        setTimeout(() => setToast(null), 3000);
        setFormData({
          title: '',
          description: '',
          platform: 'Instagram',
          type: 'Reels',
          status: 'G‘OYA',
          scheduledAt: '',
          responsibleUser: 'Admin',
        });
        fetchContent();
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/marketing/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchContent();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const statusColumns = [
    { id: 'G‘OYA', label: 'G‘OYA', color: 'border-slate-300 bg-slate-50' },
    { id: 'REJALASHTIRILGAN', label: 'REJALASHTIRILGAN', color: 'border-blue-300 bg-blue-50/50' },
    { id: 'TAYYORLANMOQDA', label: 'TAYYORLANMOQDA', color: 'border-amber-300 bg-amber-50/50' },
    { id: 'TAYYOR', label: 'TAYYOR', color: 'border-purple-300 bg-purple-50/50' },
    { id: 'E’LON_QILINGAN', label: 'E’LON QILINGAN', color: 'border-emerald-300 bg-emerald-50/50' },
  ];

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
            <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500">🎨</span>
            Kontent rejalashtiruvchi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            SMM va kontent rejalarini Kanban formatida bosqichma-bosqich boshqarish
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Kontent qo'shish
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statusColumns.map((col) => {
          const items = contents.filter((c) => c.status === col.id);

          return (
            <div
              key={col.id}
              className={`p-4 rounded-2xl border ${col.color} dark:bg-slate-900 dark:border-slate-800 space-y-3 min-h-[500px]`}
            >
              <div className="flex items-center justify-between font-bold text-xs text-slate-700 dark:text-slate-300">
                <span>{col.label}</span>
                <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px] border shadow-xs">
                  {items.length}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 font-bold text-[10px]">
                        {item.type}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {item.platform}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">{item.description}</p>
                    )}

                    {item.scheduledAt && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>{new Date(item.scheduledAt).toLocaleDateString('uz-UZ')}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="G‘OYA">G‘OYA</option>
                        <option value="REJALASHTIRILGAN">REJALASHTIRILGAN</option>
                        <option value="TAYYORLANMOQDA">TAYYORLANMOQDA</option>
                        <option value="TAYYOR">TAYYOR</option>
                        <option value="E’LON_QILINGAN">E’LON QILINGAN</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Content */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                Yangi Kontent Rejasi
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Mavzu / Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Frontend nima? Reel 03"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Platforma</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Telegram">Telegram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Website">Website</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Turi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Reels">Reels</option>
                    <option value="Post">Post</option>
                    <option value="Story">Story</option>
                    <option value="Video">Video</option>
                    <option value="Banner">Banner</option>
                    <option value="Maqola">Maqola</option>
                    <option value="Live">Live</option>
                    <option value="Boshqa">Boshqa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Rejalashtirilgan Sana</label>
                <input
                  type="date"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Tavsif / Ssenariy</label>
                <textarea
                  placeholder="Reel ssenariysi yoki post matni..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-24"
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
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20"
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
