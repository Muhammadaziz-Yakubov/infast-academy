'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  UserCheck,
  Users,
  FolderCheck,
  DollarSign,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
} from 'lucide-react';
import { formatMoneyUz } from '@/lib/utils';

interface Manager {
  _id: string;
  name: string;
  username: string;
}

interface Branch {
  _id: string;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  managerId?: Manager;
  status: 'active' | 'inactive';
  activeStudentsCount?: number;
  activeGroupsCount?: number;
  totalRevenue?: number;
  createdAt: string;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Selected Branch Details Modal
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);

  useEffect(() => {
    fetchBranches();
    fetchManagers();
  }, []);

  async function fetchBranches() {
    setLoading(true);
    try {
      const res = await fetch('/api/branches');
      if (res.ok) {
        const data = await res.json();
        setBranches(data.branches || []);
      }
    } catch (err) {
      console.error('Filiallarni yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchManagers() {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setManagers(data || []);
      }
    } catch (err) {
      console.error('Menejerlarni yuklashda xatolik:', err);
    }
  }

  function handleOpenCreateModal() {
    setEditingBranch(null);
    setName('');
    setCode('');
    setAddress('');
    setPhone('');
    setSelectedManagerId('');
    setStatus('active');
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  }

  function handleOpenEditModal(branch: Branch) {
    setEditingBranch(branch);
    setName(branch.name);
    setCode(branch.code);
    setAddress(branch.address || '');
    setPhone(branch.phone || '');
    setSelectedManagerId(branch.managerId ? branch.managerId._id : '');
    setStatus(branch.status);
    setErrorMsg('');
    setSuccessMsg('');
    setIsModalOpen(true);
  }

  async function handleSaveBranch(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !code) {
      setErrorMsg('Filial nomi va kodi kiritilishi shart');
      return;
    }

    setFormLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const url = editingBranch ? `/api/branches/${editingBranch._id}` : '/api/branches';
      const method = editingBranch ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          address,
          phone,
          managerId: selectedManagerId || undefined,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Operatsiyada xatolik yuz berdi');
      }

      setSuccessMsg(editingBranch ? 'Filial ma\'lumotlari yangilandi!' : 'Yangi filial yaratildi!');
      setTimeout(() => {
        setIsModalOpen(false);
        fetchBranches();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Server xatosi');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteBranch(branchId: string) {
    if (!confirm('Ushbu filialni o\'chirishni yoki faolsizlantirishni tasdiqlaysizmi?')) return;

    try {
      const res = await fetch(`/api/branches/${branchId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Filialni o\'chirishda xatolik');
        return;
      }
      alert(data.message || 'Bajarildi!');
      fetchBranches();
    } catch (err) {
      console.error(err);
      alert('Server xatosi');
    }
  }

  // Filtered branches
  const filteredBranches = branches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      (b.address && b.address.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Total Summary
  const totalActiveStudents = branches.reduce((sum, b) => sum + (b.activeStudentsCount || 0), 0);
  const totalActiveGroups = branches.reduce((sum, b) => sum + (b.activeGroupsCount || 0), 0);
  const totalRevenueAll = branches.reduce((sum, b) => sum + (b.totalRevenue || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-infast-600" />
            <span>Filiallar Boshqaruvi</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            InFast IT Academy filiallanti ro'yxati, statistikalari va biriktirilgan menejerlar
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-infast-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Filial Qo'shish</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Jami Filiallar</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">{branches.length} ta</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Jami Aktiv O'quvchilar</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">{totalActiveStudents} nafar</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 flex items-center justify-center shrink-0">
            <FolderCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Faol Guruhlar</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">{totalActiveGroups} ta</p>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Jami Tushum</span>
            <p className="text-lg font-black text-slate-900 dark:text-white">{formatMoneyUz(totalRevenueAll)}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Filial nomi yoki kodi bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-infast-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-infast-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Faol (Active)
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            Nofaol (Inactive)
          </button>
        </div>
      </div>

      {/* Branch Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Filiallar yuklanmoqda...</div>
      ) : filteredBranches.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500">
          Mos keladigan filiallar topilmadi.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <div
              key={branch._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-infast-500/10 text-infast-600 dark:text-infast-400 font-black flex items-center justify-center text-base">
                      {branch.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{branch.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                          {branch.code}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {branch.createdAt ? new Date(branch.createdAt).toLocaleDateString('uz-UZ') : ''}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      branch.status === 'active'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900'
                        : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900'
                    }`}
                  >
                    {branch.status === 'active' ? 'Faol' : 'Nofaol'}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{branch.address || 'Manzil kiritilmagan'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{branch.phone || 'Telefon raqam kiritilmagan'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Menejer:{' '}
                      <strong className="text-slate-800 dark:text-slate-100">
                        {branch.managerId ? branch.managerId.name : 'Biriktirilmagan'}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-medium">Talabalar</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {branch.activeStudentsCount || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-medium">Guruhlar</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {branch.activeGroupsCount || 0}
                    </p>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-medium">Tushum</span>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
                      {formatMoneyUz(branch.totalRevenue || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setViewingBranch(branch)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Statistika</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(branch)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBranch(branch._id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                    title="O'chirish / Faolsizlantirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Branch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-infast-600" />
                <span>{editingBranch ? 'Filialni Tahrirlash' : 'Yangi Filial Qo\'shish'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 text-red-600 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-green-50 dark:bg-green-950/50 text-green-600 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Filial Nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Buloqboshi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-infast-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Unikal Kodi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: buloqboshi"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-2 focus:ring-infast-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Manzili
                </label>
                <input
                  type="text"
                  placeholder="Buloqboshi tumani, Markaziy ko'cha..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-infast-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Telefon Raqami
                </label>
                <input
                  type="text"
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-infast-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Biriktirilgan Menejer
                </label>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-infast-500 focus:outline-none"
                >
                  <option value="">Biriktirilmagan</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} (@{m.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Holati (Status)
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-infast-500 focus:outline-none"
                >
                  <option value="active">Faol (Active)</option>
                  <option value="inactive">Nofaol (Inactive)</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-infast-500 hover:bg-infast-600 rounded-xl shadow-lg shadow-infast-500/20 disabled:opacity-50"
                >
                  {formLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Branch Details Modal */}
      {viewingBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-infast-600" />
                <span>{viewingBranch.name} Filiali Statistikasi</span>
              </h3>
              <button
                onClick={() => setViewingBranch(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400">Filial Kodi</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {viewingBranch.code}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400">Biriktirilgan Menejer</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {viewingBranch.managerId ? viewingBranch.managerId.name : 'Yo\'q'}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400">Aktiv O'quvchilar</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {viewingBranch.activeStudentsCount || 0} nafar
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400">Faol Guruhlar</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {viewingBranch.activeGroupsCount || 0} ta
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Jami Yig'ilgan To'lovlar (Tushum):
                </span>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                  {formatMoneyUz(viewingBranch.totalRevenue || 0)}
                </p>
              </div>

              <div className="space-y-1 pt-2">
                <p className="text-slate-500">
                  <strong>Manzil:</strong> {viewingBranch.address || 'Kiritilmagan'}
                </p>
                <p className="text-slate-500">
                  <strong>Telefon:</strong> {viewingBranch.phone || 'Kiritilmagan'}
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setViewingBranch(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
