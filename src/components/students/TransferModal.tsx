'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Building2, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BranchOption {
  _id: string;
  name: string;
  code: string;
  status: string;
}

interface GroupOption {
  _id: string;
  name: string;
  branchId?: string | { _id: string };
}

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    studentCode?: string;
    branchId?: any;
    groupId?: any;
  } | null;
  onSuccess: () => void;
}

export default function TransferModal({ isOpen, onClose, student, onSuccess }: TransferModalProps) {
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetchingGroups, setFetchingGroups] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const currentBranchId = typeof student?.branchId === 'object' ? student?.branchId?._id : student?.branchId;
  const currentBranchName = typeof student?.branchId === 'object' ? student?.branchId?.name : 'Mavjud emas';
  const currentGroupName = typeof student?.groupId === 'object' ? student?.groupId?.name : 'Biriktirilmagan';

  useEffect(() => {
    if (!isOpen) {
      setSelectedBranchId('');
      setSelectedGroupId('');
      setReason('');
      setError('');
      setSuccessMsg('');
      return;
    }

    async function fetchBranches() {
      try {
        const res = await fetch('/api/branches?status=active');
        if (res.ok) {
          const data = await res.json();
          setBranches(data.branches || []);
        }
      } catch (err) {
        console.error('Filiallarni yuklashda xatolik:', err);
      }
    }

    fetchBranches();
  }, [isOpen]);

  useEffect(() => {
    if (!selectedBranchId) {
      setGroups([]);
      setSelectedGroupId('');
      return;
    }

    async function fetchGroupsForBranch() {
      setFetchingGroups(true);
      try {
        const res = await fetch(`/api/branches/${selectedBranchId}/groups`);
        if (res.ok) {
          const data = await res.json();
          setGroups(data.groups || []);
        }
      } catch (err) {
        console.error('Guruhlarni yuklashda xatolik:', err);
      } finally {
        setFetchingGroups(false);
      }
    }

    fetchGroupsForBranch();
  }, [selectedBranchId]);

  if (!isOpen || !student) return null;

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!student) return;

    if (!selectedBranchId) {
      setError('Iltimos, yangi filialni tanlang.');
      return;
    }

    if (selectedBranchId === currentBranchId && !selectedGroupId) {
      setError('Talaba allaqachon shu filialda va yangi guruh tanlanmagan.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/students/${student._id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toBranchId: selectedBranchId,
          toGroupId: selectedGroupId || undefined,
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ko\'chirishda xatolik yuz berdi');
      }

      setSuccessMsg(data.message || 'O\'quvchi muvaffaqiyatli ko\'chirildi!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Server xatosi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Talabani Filialga Ko'chirish
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {student.firstName} {student.lastName} ({student.studentCode || 'ID: ' + student._id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleTransfer} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 text-sm rounded-xl border border-green-100 dark:border-green-900">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Location */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Hozirgi joylashuvi
            </span>
            <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-200">
              <span className="font-medium">Filial: {currentBranchName}</span>
              <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md">
                Guruh: {currentGroupName}
              </span>
            </div>
          </div>

          {/* Target Branch */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Yangi Filial <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Filialni tanlang...</option>
                {branches
                  .filter((b) => b._id !== currentBranchId)
                  .map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} filiali ({b.code})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Target Group */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Yangi Guruh (ixtiyoriy)
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                disabled={!selectedBranchId || fetchingGroups}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
              >
                <option value="">
                  {fetchingGroups ? "Guruhlar yuklanmoqda..." : "Guruhni tanlang (keyinroq tanlash mumkin)..."}
                </option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Ko'chirish sababi
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Masalan: Yashash joyi o'zgardi / O'quvchi iltimosiga ko'ra..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading || !selectedBranchId}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center space-x-2"
            >
              {loading ? (
                <span>Ko'chirilmoqda...</span>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Ko'chirishni tasdiqlash</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
