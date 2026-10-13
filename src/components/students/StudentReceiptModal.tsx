'use client';

import React, { useState } from 'react';
import { StudentReceiptCard } from './StudentReceiptCard';
import {
  X,
  Printer,
  Copy,
  Check,
  KeyRound,
  FileBadge2,
  RefreshCw,
  Save,
} from 'lucide-react';

interface StudentReceiptModalProps {
  student: any;
  onClose: () => void;
  onStudentUpdated?: () => void;
}

export function StudentReceiptModal({
  student,
  onClose,
  onStudentUpdated,
}: StudentReceiptModalProps) {
  const [password, setPassword] = useState('123456');
  const [copied, setCopied] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!student) return null;

  // Chop etish funksiyasi
  const printReceiptDirectly = () => {
    const el = document.getElementById('student-receipt-print-area');
    if (!el) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=420,height=650');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Talaba Cheki</title>
          <style>
            @page {
              size: 58mm auto;
              margin: 0mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              width: 58mm;
              margin: 0 auto;
              padding: 0;
              background: #ffffff !important;
              color: #000000 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              font-size: 11px;
              line-height: 1.35;
            }
            .receipt-box {
              width: 50mm !important;
              max-width: 50mm !important;
              margin: 0 auto !important;
              padding: 2mm 0mm 15mm 0mm !important;
              border: none !important;
              box-shadow: none !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-extrabold { font-weight: 800 !important; }
            .font-black { font-weight: 900 !important; }
            .uppercase { text-transform: uppercase; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .block { display: block; }
            .inline-block { display: inline-block; }
            .border-b-2 { border-bottom: 2px solid #000 !important; }
            .border-dashed { border-style: dashed !important; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .py-2\\.5 { padding-top: 10px; padding-bottom: 10px; }
            .pb-2\\.5 { padding-bottom: 10px; }
            .pb-6 { padding-bottom: 24px; }
            .pt-2 { padding-top: 8px; }
            .my-1 { margin-top: 4px; margin-bottom: 4px; }
            .my-2 { margin-top: 8px; margin-bottom: 8px; }
            .my-2\\.5 { margin-top: 10px; margin-bottom: 10px; }
            .mt-1 { margin-top: 4px; }
            .mt-2\\.5 { margin-top: 10px; }
            .space-y-2 > * + * { margin-top: 7px; }
            .space-y-1\\.5 > * + * { margin-top: 6px; }
            .text-black { color: #000 !important; }
            .text-\\[16px\\] { font-size: 16px !important; }
            .text-\\[13px\\] { font-size: 13px !important; }
            .text-\\[11px\\] { font-size: 11px !important; }
            .text-\\[10\\.5px\\] { font-size: 10.5px !important; }
            .text-\\[10px\\] { font-size: 10px !important; }
            .text-\\[15px\\] { font-size: 15px !important; }
            .text-\\[19px\\] { font-size: 19px !important; }
            img {
              max-width: 100%;
              height: auto;
              image-rendering: -webkit-optimize-contrast;
              image-rendering: pixelated;
            }
            .qr-img {
              width: 115px !important;
              height: 115px !important;
              max-width: 115px !important;
              max-height: 115px !important;
              display: block !important;
              margin: 0 auto !important;
              image-rendering: pixelated;
            }
          </style>
        </head>
        <body>
          ${el.outerHTML}
          <script>
            window.onload = function() {
              window.focus();
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 800);
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Parolni bazaga saqlash
  const handleSavePassword = async () => {
    if (!password.trim()) return;
    setSavingPassword(true);
    setSavedSuccess(false);
    try {
      const res = await fetch(`/api/students/${student._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        if (onStudentUpdated) onStudentUpdated();
      } else {
        alert("Parolni saqlashda xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
      alert("Server xatosi");
    } finally {
      setSavingPassword(false);
    }
  };

  // Nusxa olish
  const handleCopyCredentials = () => {
    const text =
      `🎓 INFAST IT-ACADEMY — TALABA KARTASI\n\n` +
      `👤 Talaba: ${student.firstName} ${student.lastName}\n` +
      `🔑 Login: ${student.phone}\n` +
      `🔒 Parol: ${password}\n` +
      `🌐 Kirish: https://infast.uz/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tasodifiy 6 xonali PIN
  const generateRandomPin = () => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setPassword(pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-sm overflow-y-auto print:hidden font-sans">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl p-4 shadow-2xl border border-slate-800 text-slate-100 flex flex-col max-h-[94vh] relative">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <FileBadge2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">Talaba Ma'lumotlari Cheki</h3>
              <p className="text-[10px] text-slate-400">Login & Parol kvitansiyasi (58mm / 80mm)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Parol sozlamasi (Admin uchun tezkor qulaylik) */}
        <div className="my-2.5 p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              Chekdagi Parol:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPassword('123456')}
                className="text-[10px] px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors font-mono"
              >
                123456
              </button>
              <button
                type="button"
                onClick={generateRandomPin}
                className="text-[10px] px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors flex items-center gap-1"
                title="Yangi tasodifiy PIN"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Tasodifiy
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parol kiriting..."
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleSavePassword}
              disabled={savingPassword}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
              title="Ushbu yangi parolni talabaga saqlash"
            >
              <Save className="w-3 h-3" />
              <span>{savingPassword ? '...' : savedSuccess ? '✓ Saqlandi' : 'Saqlash'}</span>
            </button>
          </div>
        </div>

        {/* Printable Card Area (Scrollable on small screens) */}
        <div className="py-2 overflow-y-auto flex-1 my-1 pr-0.5">
          <StudentReceiptCard student={student} password={password} />
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyCredentials}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Nusxalandi!' : 'Nusxa olish'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors border border-slate-700"
            >
              Yopish
            </button>
            <button
              onClick={printReceiptDirectly}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-md flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Chop etish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
