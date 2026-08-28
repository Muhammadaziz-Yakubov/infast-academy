'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Phone,
  Calendar,
  Tag,
  UserCheck,
  AlertTriangle,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function LeadManbalariPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals & Actions
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
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

  const handleOpenAddModal = () => {
    setEditingLead(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      utmSource: 'Instagram',
      utmMedium: 'paid_social',
      utmContent: '',
      notes: '',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (lead: any) => {
    setEditingLead(lead);
    setFormData({
      fullName: lead.fullName || '',
      phone: lead.phone || '',
      email: lead.email || '',
      utmSource: lead.utmSource || 'Instagram',
      utmMedium: lead.utmMedium || 'paid_social',
      utmContent: lead.utmContent || '',
      notes: lead.notes || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) return;

    setSubmitting(true);
    try {
      const url = editingLead ? `/api/marketing/leads/${editingLead._id}` : '/api/marketing/leads';
      const method = editingLead ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        showToast(editingLead ? "Lead ma'lumotlari yangilandi!" : "Yangi lead muvaffaqiyatli saqlandi!");
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

  const handleDeleteLead = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/marketing/leads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmId(null);
        showToast("Lead muvaffaqiyatli o'chirildi!");
        fetchLeads();
      } else {
        alert(data.error || "O'chirishda xatolik yuz berdi");
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
        showToast(`Lead statusi "${newStatus}" ga o'zgartirildi`);
        fetchLeads();
      }
    } catch (e) {
      console.error(e);
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
            <span className="text-amber-500 font-bold">Lead Manbalari (CRM)</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">🎯</span>
            Lead manbalari boshqaruvi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Barcha kelgan arizalar, ularning UTM atributsiya manbasi, status va boshqaruv amallari
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchLeads}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yangi Lead kiritish
          </button>
        </div>
      </div>

      {/* Structured Pipeline Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jami Leadlar</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{stats.totalLeads || 0} ta</div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Yangi</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">{stats.newLeads || 0} ta</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Bog'lanildi</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.contactedLeads || 0} ta</div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Sinov Darsi</span>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400">{stats.trialLeads || 0} ta</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Student Bo'ldi</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.convertedLeads || 0} ta</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Rad Etildi</span>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400">{stats.rejectedLeads || 0} ta</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Ism, telefon raqam yoki UTM manba bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="">Barcha statuslar</option>
            <option value="YANGI">YANGI</option>
            <option value="BOG‘LANILDI">BOG‘LANILDI</option>
            <option value="SINOV_DARSI">SINOV_DARSI</option>
            <option value="TALABA_BO‘LDI">TALABA_BO‘LDI</option>
            <option value="RAD_ETILDI">RAD_ETILDI</option>
          </select>
        </div>
      </div>

      {/* Clean Organized Leads Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Lead Ismi / Ma'lumoti</th>
                <th className="p-4">Telefon</th>
                <th className="p-4">UTM Source</th>
                <th className="p-4">UTM Medium</th>
                <th className="p-4">Kampaniya</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Sana</th>
                <th className="p-4 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    Ma'lumotlar yuklanmoqda...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    Birorta ham lead topilmadi
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      <div>{lead.fullName}</div>
                      {lead.email && <div className="text-[10px] text-slate-400 font-normal">{lead.email}</div>}
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {lead.phone}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 text-[10px] font-bold">
                        {lead.utmSource || 'Website'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                      {lead.utmMedium || '-'}
                    </td>
                    <td className="p-4 font-semibold text-amber-600 dark:text-amber-400">
                      {lead.utmCampaignId?.name || '-'}
                    </td>
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className={`px-3 py-1 rounded-xl text-[10px] font-bold cursor-pointer focus:outline-none border-none ${
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
                    <td className="p-4 text-center text-slate-500 font-medium">
                      {new Date(lead.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="p-4 text-center space-x-1">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(lead)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete Button (Explicit Action) */}
                      <button
                        onClick={() => setDeleteConfirmId(lead._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Leadni o'chirish"
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
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Leadni o'chirishni tasdiqlaysizmi?</h3>
              <p className="text-xs text-slate-500 mt-1">Ushbu lead bazadan to'liq o'chiriladi. Bu amalni ortga qaytarib bo'lmaydi.</p>
            </div>

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDeleteLead(deleteConfirmId)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
              >
                {submitting ? "O'chirilmoqda..." : "Ha, o'chirilsin"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Lead Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                {editingLead ? "Lead Ma'lumotlarini Tahrirlash" : "Yangi Lead Kiritish"}
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
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Manba (UTM Source)</label>
                  <input
                    type="text"
                    placeholder="Instagram"
                    value={formData.utmSource}
                    onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Kanal (UTM Medium)</label>
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
                  placeholder="Lead bo'yicha qo'shimcha izoh..."
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
