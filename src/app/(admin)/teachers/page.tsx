'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { UserCheck, Plus, Folder, Users, Percent, Trash2, Edit, X } from 'lucide-react';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    status: 'ACTIVE',
  });

  const handleOpenEditModal = (teacher: any) => {
    setEditingTeacher(teacher);
    setEditFormData({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      phone: teacher.phone || '',
      status: teacher.status || 'ACTIVE',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    try {
      const res = await fetch(`/api/teachers/${editingTeacher._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchTeachers();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      if (res.ok) {
        const data = await res.json();
        setTeachers(data.teachers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ firstName: '', lastName: '', phone: '', status: 'ACTIVE' });
        fetchTeachers();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("O'qituvchini o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
      if (res.ok) fetchTeachers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 pb-12">
      <Header title="O'qituvchilar" />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
          <h2 className="font-bold text-base text-slate-900">Barcha O'qituvchilar</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>O'qituvchi Qo'shish</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : teachers.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">O'qituvchilar mavjud emas</div>
          ) : (
            teachers.map((t) => (
              <div key={t._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                      {t.firstName[0]}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">{t.firstName} {t.lastName}</h3>
                      <p className="text-xs text-slate-500 font-mono">{t.phone}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5 font-medium text-slate-600">
                    <p>Biriktirilgan guruhlar: <strong className="text-slate-900">{t.groupCount || 0} ta</strong> ({t.groups?.join(', ') || '-'})</p>
                    <p>Jami talabalar: <strong className="text-slate-900">{t.studentCount || 0} ta</strong></p>
                    <p>Davomat samaradorligi: <strong className="text-emerald-600">{t.attendanceRate}%</strong></p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(t)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal: Add Teacher */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Yangi O'qituvchi Qo'shish</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ism *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Familiya *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefon *</label>
                <input
                  type="text"
                  required
                  placeholder="+998901234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-infast-500 hover:bg-infast-600 text-white font-semibold rounded-xl shadow-md"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Teacher */}
      {showEditModal && editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">O'qituvchi Ma'lumotlarini Tahrirlash</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ism *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Familiya *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefon *</label>
                <input
                  type="text"
                  required
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Holati (Status)</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="ACTIVE">Faol (ACTIVE)</option>
                  <option value="INACTIVE">Nofaol (INACTIVE)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-md"
                >
                  O'zgarishlarni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
