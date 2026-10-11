'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Users,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Image as ImageIcon,
  UserCheck,
  UserX,
} from 'lucide-react';

interface EventParticipant {
  _id: string;
  studentId: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    studentCode?: string;
    branchId?: { name: string };
    groupId?: { name: string };
    avatarUrl?: string;
  };
  registeredAt: string;
  status: 'REGISTERED' | 'ATTENDED' | 'ABSENT';
  coinsProcessed: boolean;
}

interface EventItem {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  location: string;
  coinReward: number;
  coinPenalty: number;
  maxParticipants: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  registrations: EventParticipant[];
  createdAt: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [markingLoading, setMarkingLoading] = useState<string | null>(null);

  // Create Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('100');
  const [coinReward, setCoinReward] = useState('500');
  const [coinPenalty, setCoinPenalty] = useState('500');

  // Search participants
  const [participantSearch, setParticipantSearch] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
        if (data.events?.length > 0 && !selectedEvent) {
          setSelectedEvent(data.events[0]);
        } else if (selectedEvent) {
          const updated = (data.events || []).find((e: any) => e._id === selectedEvent._id);
          if (updated) setSelectedEvent(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !location) {
      alert("Iltimos, sarlavha, sana va manzilni to'ldiring!");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          date,
          location,
          maxParticipants: Number(maxParticipants),
          coinReward: Number(coinReward),
          coinPenalty: Number(coinPenalty),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Yangi tadbir muvaffaqiyatli e'lon qilindi!");
        setIsCreateModalOpen(false);
        setTitle('');
        setDescription('');
        setImageUrl('');
        setDate('');
        setLocation('');
        fetchEvents();
      } else {
        alert(data.error || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: 'ATTENDED' | 'ABSENT') => {
    if (!selectedEvent) return;

    const actionText =
      status === 'ATTENDED'
        ? `Talabani 'Keldi' deb belgilash (+${selectedEvent.coinReward || 500} XCoin qo'shiladi)?`
        : `Talabani 'Kelmadi' deb belgilash (-${selectedEvent.coinPenalty || 500} XCoin jarima ayiriladi)?`;

    if (!confirm(actionText)) return;

    try {
      setMarkingLoading(studentId);
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent._id,
          studentId,
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchEvents();
      } else {
        alert(data.error || 'Davomatni belgilashda xatolik');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setMarkingLoading(null);
    }
  };

  const participants = selectedEvent?.registrations || [];
  const filteredParticipants = participants.filter((p) => {
    if (!participantSearch.trim()) return true;
    const q = participantSearch.toLowerCase();
    const name = `${p.studentId?.firstName || ''} ${p.studentId?.lastName || ''}`.toLowerCase();
    const phone = (p.studentId?.phone || '').toLowerCase();
    const code = (p.studentId?.studentCode || '').toLowerCase();
    return name.includes(q) || phone.includes(q) || code.includes(q);
  });

  const attendedCount = participants.filter((p) => p.status === 'ATTENDED').length;
  const absentCount = participants.filter((p) => p.status === 'ABSENT').length;
  const pendingCount = participants.filter((p) => p.status === 'REGISTERED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-indigo-600" />
            Tadbirlar & Qatnashuv Davomati Boshqaruvi
          </h1>
          <p className="text-sm text-gray-500">
            Tadbirlar e'lon qilish, talabalar ro'yxatini ko'rish, keldi (+500 XCoin) yoki kelmadi (-500 XCoin) davomatini belgilash
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Yangi Tadbir E'lon Qilish
        </button>
      </div>

      {/* Main Grid: Left events list, Right attendance table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Events selector */}
        <div className="space-y-4 lg:col-span-1">
          <div className="font-bold text-sm text-gray-700 uppercase tracking-wider flex items-center justify-between">
            <span>Barcha Tadbirlar ({events.length})</span>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-400 bg-white rounded-xl border">Yuklanmoqda...</div>
          ) : events.length === 0 ? (
            <div className="p-6 text-center text-gray-400 bg-white rounded-xl border">
              Hozircha tadbirlar e'lon qilinmagan
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((evt) => {
                const isSelected = selectedEvent?._id === evt._id;
                const regCount = (evt.registrations || []).length;

                return (
                  <div
                    key={evt._id}
                    onClick={() => setSelectedEvent(evt)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/50 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{evt.title}</h3>
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 font-bold rounded-md whitespace-nowrap">
                        +{evt.coinReward || 500} coin
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(evt.date).toLocaleString('uz-UZ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="line-clamp-1">{evt.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1 text-indigo-600 font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        <span>{regCount} nafar talaba ro'yxatdan o'tgan</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Event Attendance Table */}
        <div className="lg:col-span-2 space-y-4">
          {selectedEvent ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
              {/* Selected Event Card Top */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                      Tanlangan Tadbir
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(selectedEvent.date).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">{selectedEvent.title}</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {selectedEvent.location}
                  </p>
                </div>

                {/* Coin Rule Summary Badges */}
                <div className="flex items-center gap-2">
                  <div className="text-center px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-green-700">Kelganga</div>
                    <div className="text-xs font-extrabold text-green-700">+{selectedEvent.coinReward} 🪙</div>
                  </div>
                  <div className="text-center px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-red-700">Kelmaganga</div>
                    <div className="text-xs font-extrabold text-red-700">-{selectedEvent.coinPenalty} 🪙</div>
                  </div>
                </div>
              </div>

              {/* Attendance Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <div className="text-xs text-gray-500 font-medium">Kutilmoqda</div>
                  <div className="text-lg font-bold text-gray-900">{pendingCount}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-center">
                  <div className="text-xs text-green-600 font-medium">Keldi (+500)</div>
                  <div className="text-lg font-bold text-green-700">{attendedCount}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
                  <div className="text-xs text-red-600 font-medium">Kelmadi (-500)</div>
                  <div className="text-lg font-bold text-red-700">{absentCount}</div>
                </div>
              </div>

              {/* Participant Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ism, telefon yoki talaba ID bo'yicha izlash..."
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Participants Attendance Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {filteredParticipants.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    Ushbu tadbirga hali hech kim ro'yxatdan o'tmagan
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
                        <tr>
                          <th className="px-4 py-3">Talaba</th>
                          <th className="px-4 py-3">Guruh / Filial</th>
                          <th className="px-4 py-3">Holati</th>
                          <th className="px-4 py-3 text-right">Davomat Qilish</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredParticipants.map((p) => {
                          const isAttended = p.status === 'ATTENDED';
                          const isAbsent = p.status === 'ABSENT';
                          const isRegistered = p.status === 'REGISTERED';
                          const s = p.studentId;

                          return (
                            <tr key={p._id} className="hover:bg-gray-50">
                              {/* Student info */}
                              <td className="px-4 py-3">
                                <div className="font-semibold text-gray-900">
                                  {s?.firstName} {s?.lastName}
                                </div>
                                <div className="text-xs text-gray-500">{s?.phone}</div>
                              </td>

                              {/* Branch / Group */}
                              <td className="px-4 py-3 text-xs text-gray-500">
                                <div>{s?.branchId?.name || 'Asosiy filial'}</div>
                                <div className="text-gray-400">{s?.groupId?.name || 'Guruh'}</div>
                              </td>

                              {/* Status badge */}
                              <td className="px-4 py-3">
                                {isRegistered && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                    <Clock className="w-3 h-3" /> Yozilgan
                                  </span>
                                )}
                                {isAttended && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    <CheckCircle2 className="w-3 h-3" /> Keldi (+{selectedEvent.coinReward})
                                  </span>
                                )}
                                {isAbsent && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                    <XCircle className="w-3 h-3" /> Kelmadi (-{selectedEvent.coinPenalty})
                                  </span>
                                )}
                              </td>

                              {/* Attendance Buttons: Keldi vs Kelmadi */}
                              <td className="px-4 py-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleMarkAttendance(s._id, 'ATTENDED')}
                                    disabled={markingLoading === s._id}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                      isAttended
                                        ? 'bg-green-600 text-white'
                                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                    }`}
                                    title="Keldi deb belgilash (+500 XCoin)"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    Keldi
                                  </button>

                                  <button
                                    onClick={() => handleMarkAttendance(s._id, 'ABSENT')}
                                    disabled={markingLoading === s._id}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                      isAbsent
                                        ? 'bg-red-600 text-white'
                                        : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                    }`}
                                    title="Kelmadi deb belgilash (-500 XCoin)"
                                  >
                                    <UserX className="w-3.5 h-3.5" />
                                    Kelmadi
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
              Davomatni ko'rish va boshqarish uchun chap tomondan tadbirni tanlang
            </div>
          )}
        </div>
      </div>

      {/* CREATE EVENT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-6 h-6 text-indigo-600" />
                Yangi Tadbir E'lon Qilish
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Tadbir Nomi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: InFast Hackathon 2026 / Masterklass"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Sana va Vaqt *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Manzil / Lokatsiya *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Asosiy bino, 3-qavat"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Banner Rasm Havolasi (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (ixtiyoriy)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Maks. Talaba
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1 text-green-700">
                    Mukofot (+)
                  </label>
                  <input
                    type="number"
                    value={coinReward}
                    onChange={(e) => setCoinReward(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-green-200 bg-green-50/50 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none font-bold text-green-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1 text-red-700">
                    Jarima (-)
                  </label>
                  <input
                    type="number"
                    value={coinPenalty}
                    onChange={(e) => setCoinPenalty(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-red-200 bg-red-50/50 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none font-bold text-red-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Tadbir Haqida Tavsif
                </label>
                <textarea
                  rows={3}
                  placeholder="Tadbir dasturi, spikerlar va qoidalar haqida..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                  {submitting ? 'Saqlanmoqda...' : 'E’lon Qilish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
