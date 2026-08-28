'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Search,
  RefreshCw,
  UserCheck,
  Phone,
  Calendar,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function LeadManbalariPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    utmSource: 'Instagram',
    utmMedium: 'paid_social',
    utmContent: '',
    notes: '',
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('q', search);
      if (statusFilter) query.set('status', statusFilter);

      const res = await fetch(`/api/marketing/leads?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
        setStats(data.stats || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/marketing/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setToast("Lead muvaffaqiyatli saqlandi!");
        setTimeout(() => setToast(null), 3000);
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          utmSource: 'Instagram',
          utmMedium: 'paid_social',
          utmContent: '',
          notes: '',
        });
        fetchLeads();
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/marketing/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
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
            <span className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">🎯</span>
            Lead manbalari
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Barcha kelgan arizalar, ularning UTM atributsiya manbasi hamda sotuv bosqichlari
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Lead kiritish
        </button>
      </div>

      {/* Stats Pipeline Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Jami Lead</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{stats.totalLeads || 0}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 shadow-sm text-center">
          <span className="text-[10px] font-bold text-blue-500 uppercase">Yangi</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">{stats.newLeads || 0}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 shadow-sm text-center">
          <span className="text-[10px] font-bold text-amber-500 uppercase">Bog'lanildi</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.contactedLeads || 0}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900 shadow-sm text-center">
          <span className="text-[10px] font-bold text-purple-500 uppercase">Sinov Darsi</span>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400">{stats.trialLeads || 0}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 shadow-sm text-center">
          <span className="text-[10px] font-bold text-emerald-500 uppercase">Student Bo'ldi</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.convertedLeads || 0}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900 shadow-sm text-center">
          <span className="text-[10px] font-bold text-rose-500 uppercase">Rad Etildi</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400">{stats.rejectedLeads || 0}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Ism, telefon yoki manba bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
        >
          <option value="">Barcha holatlar</option>
          <option value="YANGI">YANGI</option>
          <option value="BOG‘LANILDI">BOG‘LANILDI</option>
          <option value="SINOV_DARSI">SINOV_DARSI</option>
          <option value="TALABA_BO‘LDI">TALABA_BO‘LDI</option>
          <option value="RAD_ETILDI">RAD_ETILDI</option>
        </select>

        <button
          onClick={fetchLeads}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ml-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Lead Nomi</th>
                <th className="p-4">Telefon</th>
                <th className="p-4">Manba (Source)</th>
                <th className="p-4">Kanal (Medium)</th>
                <th className="p-4">Kampaniya</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Leadlar topilmadi
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {lead.fullName}
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {lead.phone}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-md">
                        {lead.utmSource || 'Website'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {lead.utmMedium || '-'}
                    </td>
                    <td className="p-4 font-medium text-amber-600 dark:text-amber-400">
                      {lead.utmCampaignId?.name || '-'}
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border-none cursor-pointer focus:outline-none ${
                          lead.status === 'YANGI' ? 'bg-blue-100 text-blue-700' :
                          lead.status === 'BOG‘LANILDI' ? 'bg-amber-100 text-amber-700' :
                          lead.status === 'SINOV_DARSI' ? 'bg-purple-100 text-purple-700' :
                          lead.status === 'TALABA_BO‘LDI' ? 'bg-emerald-100 text-emerald-700 font-black' :
                          'bg-rose-100 text-rose-700'
                        }`}
                      >
                        <option value="YANGI">YANGI</option>
                        <option value="BOG‘LANILDI">BOG‘LANILDI</option>
                        <option value="SINOV_DARSI">SINOV_DARSI</option>
                        <option value="TALABA_BO‘LDI">TALABA_BO‘LDI</option>
                        <option value="RAD_ETILDI">RAD_ETILDI</option>
                      </select>
                    </td>
                    <td className="p-4 text-center text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Lead */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Yangi Lead Kiritish
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">F.I.SH *</label>
                <input
                  type="text"
                  required
                  placeholder="Ali Valiyev"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Telefon Raqam *</label>
                <input
                  type="text"
                  required
                  placeholder="+998 90 123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Manba (Source)</label>
                  <input
                    type="text"
                    placeholder="Instagram"
                    value={formData.utmSource}
                    onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Kanal (Medium)</label>
                  <input
                    type="text"
                    placeholder="paid_social"
                    value={formData.utmMedium}
                    onChange={(e) => setFormData({ ...formData, utmMedium: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Izoh</label>
                <textarea
                  placeholder="Lead bo'yicha qo'shimcha ma'lumot..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20"
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
