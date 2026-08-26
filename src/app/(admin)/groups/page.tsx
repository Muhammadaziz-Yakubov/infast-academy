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

const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  // Add form state
  const [formData, setFormData] = useState({
    name: '',
    courseId: '',
    room: '',
    telegramChatId: '',
    status: 'ACTIVE',
  });
  const [selectedDays, setSelectedDays] = useState<string[]>(["Dushanba", "Chorshanba", "Juma"]);
  const [timeRange, setTimeRange] = useState({ startTime: '14:00', endTime: '15:30' });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    courseId: '',
    room: '',
    telegramChatId: '',
    status: 'ACTIVE',
  });
  const [editSelectedDays, setEditSelectedDays] = useState<string[]>([]);
  const [editTimeRange, setEditTimeRange] = useState({ startTime: '14:00', endTime: '15:30' });

  // Cron notification trigger state
  const [sendingCron, setSendingCron] = useState(false);
  const [cronReport, setCronReport] = useState<any>(null);

  useEffect(() => {
    fetchInitial();
  }, []);

  const handleSendTodayReminders = async (force = false) => {
    setSendingCron(true);
    setCronReport(null);
    try {
      const res = await fetch('/api/telegram/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      setCronReport(data);
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    } finally {
      setSendingCron(false);
    }
  };

  const fetchInitial = async () => {
    try {
      const [gRes, cRes] = await Promise.all([
        fetch('/api/groups'),
        fetch('/api/courses'),
      ]);

      if (gRes.ok && cRes.ok) {
        const gData = await gRes.json();
        const cData = await cRes.json();
        setGroups(gData.groups || []);
        setCourses(cData.courses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      alert("Kamida bitta dars kunini tanlang!");
      return;
    }

    const schedules = selectedDays.map((day) => ({
      dayOfWeek: day,
      startTime: timeRange.startTime || '14:00',
      endTime: timeRange.endTime || '15:30',
    }));

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, schedules }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({ name: '', courseId: '', room: '', telegramChatId: '', status: 'ACTIVE' });
        setSelectedDays(["Dushanba", "Chorshanba", "Juma"]);
        setTimeRange({ startTime: '14:00', endTime: '15:30' });
        fetchInitial();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleOpenEditModal = (group: any) => {
    setEditingGroup(group);
    setEditFormData({
      name: group.name || '',
      courseId: group.courseId?._id || group.courseId || '',
      room: group.room || '',
      telegramChatId: group.telegramChatId || '',
      status: group.status || 'ACTIVE',
    });

    const days = group.schedules ? group.schedules.map((s: any) => s.dayOfWeek) : [];
    const firstSched = group.schedules?.[0];
    setEditSelectedDays(days);
    setEditTimeRange({
      startTime: firstSched?.startTime || '14:00',
      endTime: firstSched?.endTime || '15:30',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    if (editSelectedDays.length === 0) {
      alert("Kamida bitta dars kunini tanlang!");
      return;
    }

    const schedules = editSelectedDays.map((day) => ({
      dayOfWeek: day,
      startTime: editTimeRange.startTime || '14:00',
      endTime: editTimeRange.endTime || '15:30',
    }));

    try {
      const res = await fetch(`/api/groups/${editingGroup._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editFormData, schedules }),
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

  const handleDelete = async (id: string) => {
    if (!confirm("Guruhni o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
      if (res.ok) fetchInitial();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleAddDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const toggleEditDay = (day: string) => {
    if (editSelectedDays.includes(day)) {
      setEditSelectedDays(editSelectedDays.filter((d) => d !== day));
    } else {
      setEditSelectedDays([...editSelectedDays, day]);
    }
  };

  return (
    <div className="flex-1 pb-12">
      <Header title="Guruhlar" />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between gap-3">
          <h2 className="font-bold text-base text-slate-900">Barcha O'quv Guruhlari</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSendTodayReminders(false)}
              disabled={sendingCron}
              className="px-3.5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50"
              title="Bugun darsi bor guruhlarga Telegram eslatmasini yuborish"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingCron ? "Yuborilmoqda..." : "Bugungi Dars Eslatmasi"}</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Guruh Yaratish</span>
            </button>
          </div>
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
                    <p>Ustoz: <strong className="text-slate-900">Muhammadaziz Yakubov</strong></p>
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

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Guruh nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Frontend 05"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

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
                    placeholder="-100123456789"
                    value={formData.telegramChatId}
                    onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Schedule Days & Unified Time Range */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Dars kunlarini tanlang *</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map((day) => {
                      const isSelected = selectedDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => toggleAddDay(day)}
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Boshlanish vaqti *</label>
                    <input
                      type="text"
                      required
                      placeholder="14:00"
                      value={timeRange.startTime}
                      onChange={(e) => setTimeRange({ ...timeRange, startTime: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tugash vaqti *</label>
                    <input
                      type="text"
                      required
                      placeholder="15:30"
                      value={timeRange.endTime}
                      onChange={(e) => setTimeRange({ ...timeRange, endTime: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-center"
                    />
                  </div>
                </div>
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

              {/* Edit Schedule Days & Unified Time Range */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Dars kunlarini tanlang *</label>
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map((day) => {
                      const isSelected = editSelectedDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => toggleEditDay(day)}
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Boshlanish vaqti *</label>
                    <input
                      type="text"
                      required
                      placeholder="14:00"
                      value={editTimeRange.startTime}
                      onChange={(e) => setEditTimeRange({ ...editTimeRange, startTime: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-center"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tugash vaqti *</label>
                    <input
                      type="text"
                      required
                      placeholder="15:30"
                      value={editTimeRange.endTime}
                      onChange={(e) => setEditTimeRange({ ...editTimeRange, endTime: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-center"
                    />
                  </div>
                </div>
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
      {/* Modal: Telegram Cron Report */}
      {cronReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-base text-slate-900">Dars Eslatmalari Hisoboti</h3>
              </div>
              <button onClick={() => setCronReport(null)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 font-bold text-sky-900">
                {cronReport.message || "Xabarnoma yuborish yakunlandi"}
                {cronReport.uzbekDayName && <span className="block text-[11px] font-normal text-sky-700 mt-0.5">Bugungi kun (O'zbekiston): {cronReport.uzbekDayName}</span>}
              </div>

              {/* Sent list */}
              {cronReport.details && cronReport.details.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-bold text-slate-700">Yuborilgan guruhlar ({cronReport.details.length}):</p>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {cronReport.details.map((d: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between font-medium">
                        <span className="font-bold text-emerald-950">{d.groupName}</span>
                        {d.sent ? (
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-md">✓ Yuborildi</span>
                        ) : (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md">❌ {d.error || 'Xato'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skipped list */}
              {cronReport.skipped && cronReport.skipped.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <p className="font-bold text-slate-500">O'tkazib yuborilgan guruhlar ({cronReport.skipped.length}):</p>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                    {cronReport.skipped.map((s: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-600">
                        <span className="font-bold text-slate-800">{s.groupName}</span>
                        <span className="text-[10px] text-slate-400">{s.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleSendTodayReminders(true)}
                disabled={sendingCron}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline font-semibold"
              >
                Barcha faol guruhlarga majburiy yuborish (Force)
              </button>
              <button
                onClick={() => setCronReport(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
