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

  useEffect(() => {
    async function fetchBranches() {
      try {
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

    fetchBranches();
  }, []);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="absolute left-3 pointer-events-none text-slate-400">
        <Building2 className="w-4 h-4" />
      </div>
      <select
        value={selectedBranchId}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="pl-9 pr-8 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer disabled:opacity-50"
      >
        {showAllOption && <option value="ALL">Barcha filiallar</option>}
        {branches.map((b) => (
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
