'use client';

import React, { useEffect, useState } from 'react';
import { Building2, ChevronDown } from 'lucide-react';

export interface Branch {
  _id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

interface BranchSelectProps {
  selectedBranchId: string; // 'ALL' or branch _id
  onChange: (branchId: string) => void;
  showAllOption?: boolean;
  className?: string;
}

export default function BranchSelect({
  selectedBranchId,
  onChange,
  showAllOption = true,
  className = '',
}: BranchSelectProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'ADMIN' | 'MANAGER' | null>(null);
  const [managerBranchId, setManagerBranchId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.authenticated && meData.user) {
            setUserRole(meData.user.role);
            if (meData.user.role === 'MANAGER' && meData.user.branchId) {
              setManagerBranchId(meData.user.branchId);
              if (selectedBranchId !== meData.user.branchId) {
                onChange(meData.user.branchId);
              }
            }
          }
        }

        const res = await fetch('/api/branches?status=active');
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

    init();
  }, []);

  const isManager = userRole === 'MANAGER';
  const availableBranches = isManager && managerBranchId
    ? branches.filter((b) => b._id === managerBranchId)
    : branches;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="absolute left-3 pointer-events-none text-slate-400">
        <Building2 className="w-4 h-4" />
      </div>
      <select
        value={isManager && managerBranchId ? managerBranchId : selectedBranchId}
        onChange={(e) => !isManager && onChange(e.target.value)}
        disabled={loading || isManager}
        className="pl-9 pr-8 py-2 text-xs font-semibold bg-black/[0.04] dark:bg-white/[0.07] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-100 hover:bg-black/[0.06] dark:hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-infast-500/20 focus:border-infast-500 appearance-none transition-all cursor-pointer disabled:opacity-75"
      >
        {!isManager && showAllOption && (
          <option value="ALL">🌐 Barcha filiallar (Super Admin)</option>
        )}
        {availableBranches.map((b) => (
          <option key={b._id} value={b._id}>
            {b.name} filiali
          </option>
        ))}
      </select>
      <div className="absolute right-2.5 pointer-events-none text-slate-400">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  );
}
