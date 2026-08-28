'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Award,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { formatMoneyUz } from '@/lib/utils';

export default function TavsiyaDasturiPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    referrerStudentId: '',
    rewardType: 'Chegirma',
    rewardValue: '100000',
    notes: '',
  });

  const fetchReferrals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/referrals');
      const data = await res.json();
      if (data.success) {
        setReferrals(data.referrals || []);
        setStats(data.stats || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.students) setStudents(data.students);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReferrals();
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.referrerStudentId) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/marketing/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setToast("Tavsiya yozuvi saqlandi!");
        setTimeout(() => setToast(null), 3000);
        setFormData({
          referrerStudentId: '',
          rewardType: 'Chegirma',
          rewardValue: '100000',
          notes: '',
        });
        fetchReferrals();
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
            <span className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-500">🤝</span>
            Tavsiya dasturi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            "Do'stingni olib kel" (Referral) tizimi bo'yicha talabalar va bonuslar hisobi
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tavsiya kiritish
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Jami Tavsiyalar</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalReferrals || 0} ta</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Tasdiqlangan</span>
          <div className="text-2xl font-black text-emerald-600">{stats.confirmedCount || 0} ta</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase">Jami Mukofot Summasi</span>
          <div className="text-2xl font-black text-teal-600">{formatMoneyUz(stats.totalRewards || 0)}</div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Tavsiya Qiluvchi Talaba</th>
                <th className="p-4">Olib Kelgan Lead / Student</th>
                <th className="p-4">Mukofot Turi</th>
                <th className="p-4 text-right">Mukofot Summasi</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tavsiyalar topilmadi
                  </td>
                </tr>
              ) : (
                referrals.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {r.referrerStudentId ? `${r.referrerStudentId.firstName} ${r.referrerStudentId.lastName}` : '-'}
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {r.referredStudentId
                        ? `${r.referredStudentId.firstName} ${r.referredStudentId.lastName}`
                        : r.leadId?.fullName || '-'}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {r.rewardType}
                    </td>
                    <td className="p-4 text-right font-black text-emerald-600">
                      {formatMoneyUz(r.rewardValue || 0)}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700">
                        {r.rewardStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Referral */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-500" />
                Yangi Tavsiya Kiritish
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Tavsiya Qiluvchi Talaba *</label>
                <select
                  required
                  value={formData.referrerStudentId}
                  onChange={(e) => setFormData({ ...formData, referrerStudentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Talabani tanlang...</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.studentCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Mukofot Qiymati (So'm)</label>
                <input
                  type="number"
                  placeholder="100000"
                  value={formData.rewardValue}
                  onChange={(e) => setFormData({ ...formData, rewardValue: e.target.value })}
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
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20"
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
