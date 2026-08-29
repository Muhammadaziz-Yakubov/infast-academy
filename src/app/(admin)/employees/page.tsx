'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Edit2,
  Trash2,
  X,
  Check,
  CheckSquare,
  Square,
  Key,
  User,
  Shield,
  Search,
  Lock,
} from 'lucide-react';

interface Employee {
  _id: string;
  name: string;
  username: string;
  role: 'ADMIN' | 'MANAGER';
  permissions: string[];
  active?: boolean;
  createdAt?: string;
}

const ALL_PERMISSIONS = [
  { id: 'dashboard', label: '📊 Bosh sahifa', desc: 'Boshqaruv paneli va umumiy ko\'rsatkichlar' },
  { id: 'marketing', label: '📣 Marketing', desc: 'Reklama kampaniyalari, kanallar, aksiyalar' },
  { id: 'students', label: '👥 Talabalar', desc: 'Talabalar bazasi va profillari' },
  { id: 'groups', label: '📁 Guruhlar', desc: 'O\'quv guruhlari va dars jadvali' },
  { id: 'attendance', label: '📅 Davomat', desc: 'Kunlik va oylik davomat jurnali' },
  { id: 'payments', label: '💳 To\'lovlar', desc: 'Moliyaviy tushumlar va qarzdorliklar' },
  { id: 'exams', label: '🎓 Imtihonlar', desc: 'Imtihonlar va baholash tizimi' },
  { id: 'courses', label: '📚 Kurslar', desc: 'O\'quv kurslari va yo\'nalishlar' },
  { id: 'reports', label: '📊 Hisobotlar', desc: 'Moliyaviy va akademik hisobotlar' },
  { id: 'notifications', label: '🔔 Xabarnomalar', desc: 'Tizim bildirishnomalari' },
  { id: 'settings', label: '⚙️ Sozlamalar', desc: 'Tizim va profil sozlamalari' },
  { id: 'employees', label: '🛡️ Xodimlar', desc: 'Xodimlarni boshqarish va huquqlar' },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (e) {
      console.error('Fetch employees error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingEmp(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('');
    // Default manager gets standard essential permissions or empty
    setSelectedPermissions(['dashboard', 'students', 'groups', 'attendance']);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    setFormName(emp.name);
    setFormUsername(emp.username);
    setFormPassword(''); // Empty means keep unchanged
    setSelectedPermissions(emp.permissions || []);
    setErrorMsg('');
    setModalOpen(true);
  };

  const togglePermission = (id: string) => {
    if (selectedPermissions.includes(id)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== id));
    } else {
      setSelectedPermissions([...selectedPermissions, id]);
    }
  };

  const handleSelectAll = () => {
    setSelectedPermissions(ALL_PERMISSIONS.map((p) => p.id));
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formName.trim() || !formUsername.trim()) {
      setErrorMsg('Ism-sharif va Login kiritilishi shart');
      return;
    }

    if (!editingEmp && !formPassword.trim()) {
      setErrorMsg('Yangi xodim uchun parol kiritish shart');
      return;
    }

    try {
      setSubmitting(true);

      const payload: any = {
        name: formName.trim(),
        username: formUsername.trim(),
        role: 'MANAGER', // Fixed to Manager
        permissions: selectedPermissions,
      };

      if (formPassword.trim()) {
        payload.password = formPassword.trim();
      }

      const url = editingEmp ? `/api/employees/${editingEmp._id}` : '/api/employees';
      const method = editingEmp ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Xatolik yuz berdi');
      }

      setModalOpen(false);
      fetchEmployees();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/employees/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteId(null);
        fetchEmployees();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-infast-500/10 text-infast-600 dark:text-infast-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Xodimlar boshqaruvi</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tizim xodimlarini (Menejerlarni) ro'yxatga olish va ularga ruxsat berilgan bo'limlarni sozlash
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-infast-500/20 active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Yangi xodim qo'shish</span>
        </button>
      </div>

      {/* Filter and Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Xodim ismi yoki login boyicha qidiruv..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-infast-500"
          />
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
            Jami xodimlar: <span className="text-infast-600 font-bold">{employees.length} ta</span>
          </div>
        </div>
      </div>

      {/* Employee List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Xodimlar yuklanmoqda...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Xodimlar topilmadi. Yangi xodim qo'shish uchun yuqoridagi tugmani bosing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Xodim</th>
                  <th className="px-6 py-3.5">Login</th>
                  <th className="px-6 py-3.5">Roli</th>
                  <th className="px-6 py-3.5">Ruxsat etilgan bo'limlar</th>
                  <th className="px-6 py-3.5 text-right">Harakatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-infast-500/10 text-infast-600 flex items-center justify-center font-bold text-xs">
                          {emp.name[0]?.toUpperCase()}
                        </div>
                        <span>{emp.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                      @{emp.username}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          emp.role === 'ADMIN'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {emp.role === 'ADMIN' ? 'Super Admin' : 'Manager'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {emp.permissions?.includes('*') ? (
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                            Barcha bo'limlar (To'liq dastup)
                          </span>
                        ) : emp.permissions && emp.permissions.length > 0 ? (
                          emp.permissions.map((pKey) => {
                            const perm = ALL_PERMISSIONS.find((item) => item.id === pKey);
                            return (
                              <span
                                key={pKey}
                                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold"
                              >
                                {perm ? perm.label : pKey}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-slate-400 text-[11px]">Ruxsatlar yo'q</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-infast-600 hover:bg-infast-50 dark:hover:bg-slate-800 transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(emp._id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-infast-500 text-white flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingEmp ? "Xodim ma'lumotlarini tahrirlash" : "Yangi xodim qo'shish"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Ism-sharifi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Sardor Rahimov"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-infast-500"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Login (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: sardor_manager"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-infast-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Parol {editingEmp ? "(O'zgartirmaslik uchun bo'sh qoldiring)" : <span className="text-rose-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder={editingEmp ? "Yangi parol (ixtiyoriy)" : "Parolni kiriting"}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-infast-500"
                    />
                    <Key className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  </div>
                </div>

                {/* Role (Fixed as Manager) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Roli
                  </label>
                  <div className="flex items-center px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-bold space-x-2">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span>Manager (Roli belgilangan)</span>
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Ruxsat etilgan bo'limlar (Huquqlar/Dastup)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ushbu manager kirishi mumkin bo'lgan bo'limlarni belgilang
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[11px] font-bold text-infast-600 hover:text-infast-700 underline"
                    >
                      Hamma ruxsatlar
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-600 underline"
                    >
                      Tozalash
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                          isChecked
                            ? 'bg-infast-500/5 border-infast-500/40 dark:bg-infast-500/10'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="pt-0.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-infast-600 dark:text-infast-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{perm.label}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{perm.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold bg-infast-500 hover:bg-infast-600 text-white shadow-md shadow-infast-500/20 disabled:opacity-50"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingEmp ? 'Saqlash' : "Xodimni qo'shish"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Xodimni o'chirish</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Haqiqatan ham ushbu xodimni tizimdan o'chirib tashlamoqchimisiz? Ushbu harakatni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {deleting ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
