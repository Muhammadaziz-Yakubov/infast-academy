'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { formatMoneyUz } from '@/lib/utils';
import { BookOpen, Plus, Users, Folder, Trash2, Edit, X } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    durationMonths: '6',
    description: '',
    status: 'ACTIVE',
  });

  const handleOpenEditModal = (course: any) => {
    setEditingCourse(course);
    setEditFormData({
      name: course.name || '',
      price: String(course.price || ''),
      durationMonths: String(course.durationMonths || 6),
      description: course.description || '',
      status: course.status || 'ACTIVE',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      const res = await fetch(`/api/courses/${editingCourse._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchCourses();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    durationMonths: '6',
    description: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
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
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ name: '', price: '', durationMonths: '6', description: '', status: 'ACTIVE' });
        fetchCourses();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Kursni o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCourses();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 pb-12">
      <Header title="Kurslar" />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
          <h2 className="font-bold text-base text-slate-900">Mavjud O'quv Yo'nalishlari</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Kurs Yaratish</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : courses.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">Kurslar mavjud emas</div>
          ) : (
            courses.map((c) => (
              <div key={c._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-xl">
                      Davomiyligi: {c.durationMonths} oy
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900">{c.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{c.description || 'Izoh mavjud emas'}</p>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-600 border-t border-slate-100">
                    <span>Oylik Narxi:</span>
                    <span className="text-sm font-extrabold text-infast-600">{formatMoneyUz(c.price)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Guruhlar: <strong className="text-slate-900">{c.groupCount || 0} ta</strong></span>
                    <span>Talabalar: <strong className="text-slate-900">{c.studentCount || 0} ta</strong></span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-1">
                  <button
                    onClick={() => handleOpenEditModal(c)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="Tahrirlash"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
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

      {/* Modal: Add Course */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Yangi Kurs Yaratish</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kurs Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Frontend React"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Oylik Narxi (so'm) *</label>
                  <input
                    type="number"
                    required
                    placeholder="800000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Davomiyligi (oylar) *</label>
                  <input
                    type="number"
                    required
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tavsif / Ma'lumot</label>
                <textarea
                  rows={3}
                  placeholder="Kurs haqida qisqacha ma'lumot..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Course */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Kurs Ma'lumotlarini Tahrirlash</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kurs Nomi *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Oylik Narxi (UZS) *</label>
                  <input
                    type="number"
                    required
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-infast-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Davomiyligi (Oylar) *</label>
                  <input
                    type="number"
                    required
                    value={editFormData.durationMonths}
                    onChange={(e) => setEditFormData({ ...editFormData, durationMonths: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tavsif / Izoh</label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
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
