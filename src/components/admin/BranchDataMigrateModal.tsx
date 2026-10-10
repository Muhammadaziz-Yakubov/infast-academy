'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  X,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Building2,
  Users,
  Folder,
  CreditCard,
  CalendarCheck,
  GraduationCap,
  Megaphone,
} from 'lucide-react';

interface BranchOption {
  id: string;
  name: string;
  code?: string;
  counts?: Record<string, number>;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BranchDataMigrateModal({ isOpen, onClose, onSuccess }: Props) {
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [unassigned, setUnassigned] = useState<BranchOption | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [sourceBranchId, setSourceBranchId] = useState('UNASSIGNED');
  const [targetBranchId, setTargetBranchId] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'students',
    'groups',
    'payments',
    'attendance',
    'exams',
    'leads',
    'campaigns',
    'expenses',
  ]);

  // Stepper & Status
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Setup, 2: Pre-check Report, 3: Executed Report
  const [checking, setChecking] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-check report data
  const [dryRunReport, setDryRunReport] = useState<any>(null);
  const [execReport, setExecReport] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchBranchData();
    }
  }, [isOpen]);

  const fetchBranchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/admin/migrate-branch');
      if (res.ok) {
        const data = await res.json();
        const branchList: BranchOption[] = data.branches || [];
        setBranches(branchList);
        setUnassigned(data.unassigned || null);

        // Source default: UNASSIGNED
        setSourceBranchId('UNASSIGNED');

        // Target default: Branch with name/code 'buloqboshi'
        const buloqboshi = branchList.find(
          (b) => b.code?.toLowerCase() === 'buloqboshi' || b.name.toLowerCase().includes('buloqboshi')
        );
        if (buloqboshi) {
          setTargetBranchId(buloqboshi.id);
        } else if (branchList.length > 0) {
          setTargetBranchId(branchList[0].id);
        }
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Filiallarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleRunPreCheck = async () => {
    if (!sourceBranchId || !targetBranchId) {
      setErrorMsg('Manba va Maqsad filiallarini tanlang');
      return;
    }
    if (sourceBranchId === targetBranchId) {
      setErrorMsg('Manba va Maqsad filiali bir xil bo\'lishi mumkin emas');
      return;
    }
    if (selectedCategories.length === 0) {
      setErrorMsg('Kamida bitta ma\'lumot toifasini tanlang');
      return;
    }

    try {
      setChecking(true);
      setErrorMsg('');
      const res = await fetch('/api/admin/migrate-branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceBranchId,
          targetBranchId,
          categories: selectedCategories,
          dryRun: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Pre-check xatoligi');
      }

      setDryRunReport(data);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setChecking(false);
    }
  };

  const handleExecuteMigration = async () => {
    try {
      setMigrating(true);
      setErrorMsg('');
      const res = await fetch('/api/admin/migrate-branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceBranchId,
          targetBranchId,
          categories: selectedCategories,
          dryRun: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Migratsiyada xatolik yuz berdi');
      }

      setExecReport(data);
      setStep(3);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setMigrating(false);
    }
  };

  if (!isOpen) return null;

  // Selected source branch details
  const allBranchOptions = [...branches, ...(unassigned ? [unassigned] : [])];
  const sourceObj = allBranchOptions.find((b) => b.id === sourceBranchId);

  const categoryLabels: Record<string, { label: string; icon: any }> = {
    students: { label: "O'quvchilar", icon: Users },
    groups: { label: 'Guruhlar', icon: Folder },
    payments: { label: "To'lovlar", icon: CreditCard },
    attendance: { label: 'Davomat', icon: CalendarCheck },
    exams: { label: 'Imtihonlar', icon: GraduationCap },
    leads: { label: 'Marketing lidlari', icon: Megaphone },
    campaigns: { label: 'Kampaniyalar', icon: Megaphone },
    expenses: { label: 'Xarajatlar', icon: CreditCard },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-infast-500/10 text-infast-600 dark:text-infast-400 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Ma'lumotlarni filialga ko'chirish
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Super Admin vositasi: Manba filialidan barcha yozuvlarni maqsad filialiga xavfsiz o'tkazish
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-infast-500" />
              <span>Filiallar ro'yxati va ma'lumotlar yuklanmoqda...</span>
            </div>
          ) : step === 1 ? (
            /* STEP 1: SETUP FORM */
            <div className="space-y-6">
              {/* Branch Selection Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Source Branch */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Manba filiali (Source)
                  </label>
                  <select
                    value={sourceBranchId}
                    onChange={(e) => setSourceBranchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-infast-500"
                  >
                    {unassigned && (
                      <option value="UNASSIGNED">
                        {unassigned.name} ({unassigned.counts?.total || 0} ta yozuv)
                      </option>
                    )}
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} filiali ({b.counts?.total || 0} ta yozuv)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Branch */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Maqsad filiali (Target)
                  </label>
                  <select
                    value={targetBranchId}
                    onChange={(e) => setTargetBranchId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-infast-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} filiali
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Categories Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Ko'chiriladigan ma'lumot toifalari
                  </h4>
                  <div className="flex items-center space-x-2 text-[11px] font-semibold text-infast-600">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCategories([
                          'students',
                          'groups',
                          'payments',
                          'attendance',
                          'exams',
                          'leads',
                          'campaigns',
                          'expenses',
                        ])
                      }
                      className="hover:underline"
                    >
                      Barchasini tanlash
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(categoryLabels).map(([catKey, catInfo]) => {
                    const isChecked = selectedCategories.includes(catKey);
                    const count = sourceObj?.counts ? sourceObj.counts[catKey] || 0 : 0;
                    const Icon = catInfo.icon;

                    return (
                      <div
                        key={catKey}
                        onClick={() => toggleCategory(catKey)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-infast-500/10 border-infast-500 text-infast-700 dark:text-infast-300'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon className="w-4 h-4 text-infast-500" />
                          <span className="text-xs font-bold">{catInfo.label}</span>
                        </div>
                        <p className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400">
                          {count} ta yozuv
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 1 Action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleRunPreCheck}
                  disabled={checking}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-infast-500/20 disabled:opacity-50"
                >
                  {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  <span>Oldindan tekshirish (Dry-Run)</span>
                </button>
              </div>
            </div>
          ) : step === 2 ? (
            /* STEP 2: PRE-CHECK REPORT */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs space-y-1">
                <p className="font-bold flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-600" />
                  Oldindan tekshiruv hisoboti (Dry-Run Natijasi)
                </p>
                <p className="text-[11px]">
                  Manba: <strong>{dryRunReport?.sourceBranchName}</strong> → Maqsad: <strong>{dryRunReport?.targetBranchName}</strong>
                </p>
              </div>

              {/* Counts Breakdown Table */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Ko'chiriladigan yozuvlar soni:</h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {Object.entries(dryRunReport?.sourceCounts || {}).map(([key, count]) => (
                    <div key={key} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 capitalize block">{key}</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{count as number} ta</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings List */}
              {dryRunReport?.warnings && dryRunReport.warnings.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-amber-600">Topilgan ogohlantirishlar:</h5>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc pl-5">
                    {dryRunReport.warnings.map((w: string, idx: number) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Explicit Confirmation Warning */}
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium leading-relaxed">
                <strong>DIQQAT:</strong> Tanlangan ma’lumotlar manba filialidan maqsad filialiga biriktiriladi. Tarixiy to‘lovlar, davomatlar va boshqa yozuvlar saqlanadi. Amalni boshlashdan oldin ma’lumotlar bazasining zaxira nusxasi mavjudligiga ishonch hosil qiling.
              </div>

              {/* Step 2 Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ← Orqaga
                </button>
                <button
                  type="button"
                  onClick={handleExecuteMigration}
                  disabled={migrating}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  {migrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Ko'chirishni tasdiqlash va bajarish</span>
                </button>
              </div>
            </div>
          ) : (
            /* STEP 3: EXECUTED REPORT */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Migratsiya Muvaffaqiyatli Yakunlandi!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Jami <strong>{execReport?.totalMigrated} ta</strong> yozuv {execReport?.targetBranchName} filialiga biriktirildi.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 max-w-md mx-auto text-left">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Ko'chirilgan yozuvlar hisoboti:</h5>
                <div className="space-y-1 text-xs">
                  {Object.entries(execReport?.migrationResults || {}).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="capitalize text-slate-600 dark:text-slate-400">{cat}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{count as number} ta</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-bold text-xs rounded-xl shadow-md shadow-infast-500/20"
                >
                  Yopish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
