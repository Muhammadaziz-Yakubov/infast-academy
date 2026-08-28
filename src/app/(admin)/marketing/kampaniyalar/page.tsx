'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { formatMoneyUz } from '@/lib/utils';

export default function KampaniyalarPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals & Actions
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    objective: 'LEAD_YIG‘ISH',
    status: 'FAOL',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budget: '',
    platform: 'Instagram',
    courseId: '',
    branch: '',
  });

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('q', search);
      if (statusFilter) query.set('status', statusFilter);

      const res = await fetch(`/api/marketing/campaigns?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.courses) setCourses(data.courses);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchCourses();
  }, [search, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingCampaign(null);
    setFormData({
      name: '',
      description: '',
      objective: 'LEAD_YIG‘ISH',
      status: 'FAOL',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      budget: '',
      platform: 'Instagram',
      courseId: '',
      branch: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (c: any) => {
    setEditingCampaign(c);
    setFormData({
      name: c.name || '',
      description: c.description || '',
      objective: c.objective || 'LEAD_YIG‘ISH',
      status: c.status || 'FAOL',
      startDate: c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : '',
      endDate: c.endDate ? new Date(c.endDate).toISOString().split('T')[0] : '',
      budget: c.budget || '',
      platform: c.platform || 'Instagram',
      courseId: c.courseId?._id || c.courseId || '',
      branch: c.branch || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      const url = editingCampaign ? `/api/marketing/campaigns/${editingCampaign._id}` : '/api/marketing/campaigns';
      const method = editingCampaign ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        showToast(editingCampaign ? "Kampaniya yangilandi!" : "Kampaniya muvaffaqiyatli yaratildi!");
        fetchCampaigns();
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/marketing/campaigns/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmId(null);
        showToast("Kampaniya o'chirildi!");
        fetchCampaigns();
      } else {
        alert(data.error || "O'chirishda xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
            <span>Marketing</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-amber-500 font-bold">Kampaniyalar</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">📢</span>
            Reklama kampaniyalari
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Barcha reklama kampaniyalarini boshqarish, budjet va natijadorlik tahlili
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchCampaigns}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yangi kampaniya
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Kampaniya nomi bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
        >
          <option value="">Barcha holatlar</option>
          <option value="FAOL">FAOL</option>
          <option value="REJALASHTIRILGAN">REJALASHTIRILGAN</option>
          <option value="TO‘XTATILGAN">TO‘XTATILGAN</option>
          <option value="YAKUNLANGAN">YAKUNLANGAN</option>
        </select>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Kampaniya Nomi</th>
                <th className="p-4">Platforma</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Lead</th>
                <th className="p-4 text-center">Student</th>
                <th className="p-4 text-right">Xarajat</th>
                <th className="p-4 text-right">Daromad</th>
                <th className="p-4 text-right">CAC</th>
                <th className="p-4 text-right">ROI</th>
                <th className="p-4 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold">
                    Ma'lumotlar yuklanmoqda...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold">
                    Kampaniyalar topilmadi
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{c.objective}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {c.platform}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        c.status === 'FAOL' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' :
                        c.status === 'REJALASHTIRILGAN' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-900 dark:text-white">
                      {c.leadsCount || 0}
                    </td>
                    <td className="p-4 text-center font-bold text-emerald-600">
                      {c.studentsCount || 0}
                    </td>
                    <td className="p-4 text-right font-semibold text-rose-600">
                      {formatMoneyUz(c.spend || 0)}
                    </td>
                    <td className="p-4 text-right font-bold text-emerald-600">
                      {formatMoneyUz(c.revenue || 0)}
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {formatMoneyUz(c.cac || 0)}
                    </td>
                    <td className="p-4 text-right font-black text-amber-600 dark:text-amber-400">
                      {c.roi}%
                    </td>
                    <td className="p-4 text-center space-x-1">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(c._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Kampaniyani o'chirasizmi?</h3>
              <p className="text-xs text-slate-500 mt-1">Kampaniya bazadan o'chiriladi.</p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDeleteCampaign(deleteConfirmId)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                {submitting ? "O'chirilmoqda..." : "Ha, o'chirilsin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                {editingCampaign ? "Kampaniyani Tahrirlash" : "Yangi Kampaniya Yaratish"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Kampaniya Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Frontend Avgust Qabul"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Platforma *</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="Telegram">Telegram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Google">Google</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Maqsad</label>
                  <select
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="LEAD_YIG‘ISH">Lead Yig'ish</option>
                    <option value="SOTUV">Sotuv</option>
                    <option value="BRAND">Brand</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Budjet (So'm)</label>
                  <input
                    type="number"
                    placeholder="1500000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Biriktirilgan Kurs</label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Barcha kurslar</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
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
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20"
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
