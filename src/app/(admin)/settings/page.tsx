'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Building, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [academyName, setAcademyName] = useState('INFAST IT-ACADEMY');
  const [phone, setPhone] = useState('+998 71 200 00 00');
  const [address, setAddress] = useState('Toshkent sh., Yunusobod t., 4-mavze');
  const [testChatId, setTestChatId] = useState('');
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setAcademyName(data.academyName || 'INFAST IT-ACADEMY');
        setPhone(data.phone || '+998 71 200 00 00');
        setAddress(data.address || 'Toshkent sh., Yunusobod t., 4-mavze');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academyName, phone, address }),
      });

      if (res.ok) {
        alert("Sozlamalar saqlandi!");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTelegramStatus(null);
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: testChatId.trim() }),
      });
      const data = await res.json();
      setTelegramStatus(data);
    } catch (e: any) {
      setTelegramStatus({ success: false, error: e.message });
    } finally {
      setTestingTelegram(false);
    }
  };

  return (
    <div className="flex-1 pb-12">
      <Header title="Sozlamalar" />

      <main className="p-6 space-y-6 max-w-4xl mx-auto">
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Academy Settings */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <Building className="w-5 h-5 text-infast-500" />
              <h3 className="font-bold text-sm text-slate-900">Akademiya Ma'lumotlari</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomi</label>
                <input
                  type="text"
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Telefon</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Manzil</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Telegram Integration Settings */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <Send className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-sm text-slate-900">Telegram Bot Integratsiyasi</h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-mono">
                7925524286:AAE5aJ2f...
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Bot orqali dars kunlarida ertalab soat 08:00 da guruhlarning Telegram guruhiga avtomatik ravishda dars eslatmalari yuboriladi. Botga <code>/start</code> yuborilganda bot <strong>"Bot ishlamoqda, faol! 🟢"</strong> javobini beradi.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2 text-xs">
                <input
                  type="text"
                  placeholder="Guruh Chat ID (Masalan: -1001234567890)"
                  value={testChatId}
                  onChange={(e) => setTestChatId(e.target.value)}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-medium"
                />
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={testingTelegram}
                  className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors whitespace-nowrap"
                >
                  <Send className="w-4 h-4" />
                  <span>{testingTelegram ? "Yuborilmoqda..." : "Guruhga Sinov Xabari Yuborish"}</span>
                </button>
              </div>

              {telegramStatus && (
                <div className="text-xs font-bold p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {telegramStatus.success ? (
                    <span className="text-emerald-600 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      {telegramStatus.message}
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
                      {telegramStatus.error}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-infast-500 hover:bg-infast-600 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              {saving ? "Saqlanmoqda..." : "Sozlamalarni Saqlash"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
