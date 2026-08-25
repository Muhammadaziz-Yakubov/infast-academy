'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import {
  Folder,
  Plus,
  Search,
  Users,
  Clock,
  MapPin,
  Send,
  Eye,
  Edit,
  Trash2,
  X,
} from 'lucide-react';

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  const [editFormData, setEditFormData] = useState({
    name: '',
    courseId: '',
    teacherId: '',
    room: '',
    telegramChatId: '',
    status: 'ACTIVE',
    schedules: [] as any[],
  });

  const handleOpenEditModal = (group: any) => {
    setEditingGroup(group);
    setEditFormData({
      name: group.name || '',
      courseId: group.courseId?._id || group.courseId || '',
      teacherId: group.teacherId?._id || group.teacherId || '',
      room: group.room || '',
      telegramChatId: group.telegramChatId || '',
      status: group.status || 'ACTIVE',
      schedules: group.schedules ? JSON.parse(JSON.stringify(group.schedules)) : [],
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    try {
      const res = await fetch(`/api/groups/${editingGroup._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchInitial();
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
    courseId: '',
    teacherId: '',
    room: '',
    telegramChatId: '',
    status: 'ACTIVE',
    schedules: [
      { dayOfWeek: 'Dushanba', startTime: '14:00', endTime: '15:30' },
      { dayOfWeek: 'Chorshanba', startTime: '14:00', endTime: '15:30' },
      { dayOfWeek: 'Juma', startTime: '14:00', endTime: '15:30' },
    ],
  });

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      const [gRes, cRes, tRes] = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/courses'),
        fetch('/api/teachers'),
      ]);

      if (gRes.ok) {
        const gData = await gRes.json();
        setGroups(gData.groups || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setCourses(cData.courses || []);
      }
      if (tRes.ok) {
        const tData = await tRes.json();
        setTeachers(tData.teachers || []);
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
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchInitial();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Guruhni o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
      if (res.ok) fetchInitial();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDaySchedule = (day: string) => {
    const exists = formData.schedules.some((s) => s.dayOfWeek === day);
    if (exists) {
      setFormData({
        ...formData,
        schedules: formData.schedules.filter((s) => s.dayOfWeek !== day),
      });
    } else {
      setFormData({
        ...formData,
        schedules: [...formData.schedules, { dayOfWeek: day, startTime: '14:00', endTime: '15:30' }],
      });
    }
  };

  const updateScheduleTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updatedSchedules = [...formData.schedules];
    updatedSchedules[index] = { ...updatedSchedules[index], [field]: value };
    setFormData({ ...formData, schedules: updatedSchedules });
  };

  const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

  return (
    <div className="flex-1 pb-12">
      <Header title="Guruhlar" />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-900">Barcha O'quv Guruhlari</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Guruh Yaratish</span>
          </button>
        </div>

        {/* Groups Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : groups.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">Guruhlar mavjud emas</div>
          ) : (
            groups.map((g) => (
              <div key={g._id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-infast-600 bg-infast-50 px-3 py-1 rounded-xl">
                      {g.courseId?.name || 'Kurs'}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {g.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900">{g.name}</h3>

                  <div className="text-xs text-slate-600 space-y-1.5 font-medium">
                    <p>Ustoz: <strong className="text-slate-900">{g.teacherId ? `${g.teacherId.firstName} ${g.teacherId.lastName}` : '-'}</strong></p>
                    <p className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {g.room}
                    </p>
                    <p className="flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {g.studentCount} ta talaba
                    </p>
                    <p className="flex items-center">
                      <Send className="w-3.5 h-3.5 mr-1 text-sky-500" />
                      Telegram Chat ID: <span className="font-mono ml-1">{g.telegramChatId || "Biriktirilmagan"}</span>
                    </p>
                  </div>

                  {/* Schedule days badge */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Dars Jadvali</p>
                    <div className="flex flex-wrap gap-1">
                      {g.schedules?.map((s: any, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {s.dayOfWeek} ({s.startTime})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/groups/${g._id}`}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Tafsilotlar</span>
                  </Link>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(g)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(g._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal: Add Group */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Yangi Guruh Yaratish</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Guruh nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Frontend 05"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kurs *</label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Kursni tanlang</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ustoz *</label>
                  <select
                    required
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Ustozni tanlang</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Xona *</label>
                  <input
                    type="text"
                    required
                    placeholder="Xona 101"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telegram Group Chat ID</label>
                  <input
                    type="text"
                    placeholder="-1001234567890"
                    value={formData.telegramChatId}
                    onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Schedule Days Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Dars kunlarini tanlang *</label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((day) => {
                    const isSelected = formData.schedules.some((s) => s.dayOfWeek === day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDaySchedule(day)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                          isSelected ? 'bg-infast-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Per-Day Time Settings */}
              {formData.schedules.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-700">Dars vaqtlarini belgilash (Boshlanishi - Tugashi):</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {formData.schedules.map((s, idx) => (
                      <div key={s.dayOfWeek} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-800 w-28">{s.dayOfWeek}:</span>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="text"
                            placeholder="14:00"
                            value={s.startTime}
                            onChange={(e) => updateScheduleTime(idx, 'startTime', e.target.value)}
                            className="w-20 p-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold focus:ring-1 focus:ring-infast-500"
                          />
                          <span className="font-bold text-slate-400">-</span>
                          <input
                            type="text"
                            placeholder="15:30"
                            value={s.endTime}
                            onChange={(e) => updateScheduleTime(idx, 'endTime', e.target.value)}
                            className="w-20 p-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold focus:ring-1 focus:ring-infast-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

      {/* Modal: Edit Group */}
      {showEditModal && editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Guruh Ma'lumotlarini Tahrirlash</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Guruh nomi *</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Kurs *</label>
                  <select
                    required
                    value={editFormData.courseId}
                    onChange={(e) => setEditFormData({ ...editFormData, courseId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Kursni tanlang</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ustoz *</label>
                  <select
                    required
                    value={editFormData.teacherId}
                    onChange={(e) => setEditFormData({ ...editFormData, teacherId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Ustozni tanlang</option>
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Xona *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.room}
                    onChange={(e) => setEditFormData({ ...editFormData, room: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telegram Group Chat ID</label>
                  <input
                    type="text"
                    value={editFormData.telegramChatId}
                    onChange={(e) => setEditFormData({ ...editFormData, telegramChatId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Holati (Status)</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="ACTIVE">Faol (ACTIVE)</option>
                  <option value="COMPLETED">Tugatgan (COMPLETED)</option>
                  <option value="PAUSED">Muzlatilgan (PAUSED)</option>
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
