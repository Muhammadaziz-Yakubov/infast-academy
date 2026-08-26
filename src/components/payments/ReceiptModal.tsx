'use client';

import React, { useState } from 'react';
import { formatMoneyUz, formatDateUz } from '@/lib/utils';
import {
  X,
  Printer,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Send,
  User,
  BookOpen,
  CreditCard,
  Calendar,
} from 'lucide-react';

interface ReceiptModalProps {
  payment: any;
  onClose: () => void;
}

export function ReceiptModal({ payment, onClose }: ReceiptModalProps) {
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!payment) return null;

  const paymentId = payment._id || payment.id || '';
  const receiptNo = `INF-PAY-${paymentId.slice(-8).toUpperCase()}`;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infast.uz';
  const receiptUrl = `${origin}/receipt/${paymentId}`;
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(receiptUrl)}`;

  const studentName = payment.studentId
    ? `${payment.studentId.firstName || ''} ${payment.studentId.lastName || ''}`.trim()
    : 'Noma\'lum Talaba';

  const groupName = payment.studentId?.groupId?.name || '-';
  const courseName = payment.studentId?.courseId?.name || '-';

  const handlePrint = () => {
    window.print();
  };

  const handleSendTelegram = async () => {
    setSendingTelegram(true);
    setTelegramStatus('idle');
    try {
      const chatId = payment.studentId?.groupId?.telegramChatId || '';
      const text = `🧾 <b>RASMIY TO'LOV KVITANSIYASI</b>\n\n` +
        `👤 <b>Talaba:</b> ${studentName}\n` +
        `📚 <b>Guruh/Kurs:</b> ${groupName} (${courseName})\n` +
        `💰 <b>Summa:</b> ${formatMoneyUz(payment.amount)}\n` +
        `📅 <b>To'lov Davri:</b> ${formatDateUz(payment.periodStartDate)} — ${formatDateUz(payment.periodEndDate)}\n` +
        `💳 <b>Usul:</b> ${payment.paymentMethod}\n` +
        `🔢 <b>Chek №:</b> ${receiptNo}\n\n` +
        `🔗 <b>Elektron kvitansiyani ko'rish:</b> ${receiptUrl}`;

      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, text }),
      });

      if (res.ok) {
        setTelegramStatus('success');
      } else {
        setTelegramStatus('error');
      }
    } catch (e) {
      setTelegramStatus('error');
    } finally {
      setSendingTelegram(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt-modal, #printable-receipt-modal * {
            visibility: visible;
          }
          #printable-receipt-modal {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6 relative print:max-w-none print:shadow-none print:border-none print:rounded-none" id="printable-receipt-modal">
        {/* Header Actions (hidden in print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 no-print">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-slate-900">Elektron Kvitansiya (Chek)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="space-y-5">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-dashed border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-infast-500 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-infast-500/30 shrink-0">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h2 className="font-black text-lg text-slate-900 tracking-tight leading-none">INFAST</h2>
                <p className="text-[10px] font-bold text-infast-600 uppercase tracking-widest mt-0.5">IT-ACADEMY</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                <CheckCircle2 className="w-3 h-3" />
                <span>TO'LANGAN</span>
              </span>
              <p className="text-[10px] font-mono text-slate-400 mt-1">{receiptNo}</p>
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center space-y-1">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Qabul qilingan to'lov summasi</p>
            <p className="text-2xl font-extrabold text-emerald-600 tracking-tight">
              {formatMoneyUz(payment.amount)}
            </p>
            <div className="pt-2 border-t border-slate-200/60 mt-2">
              <p className="text-[11px] text-slate-600 font-medium">
                <span className="font-bold text-slate-700">Qamrab olingan davr (Period):</span>
              </p>
              <p className="text-xs font-mono font-bold text-infast-700 mt-0.5">
                {formatDateUz(payment.periodStartDate)} — {formatDateUz(payment.periodEndDate)}
              </p>
            </div>
          </div>

          {/* Metadata Table */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center">
                <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Talaba:
              </span>
              <span className="font-bold text-slate-900">{studentName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center">
                <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Guruh / Kurs:
              </span>
              <span className="font-semibold text-slate-800">
                {groupName} ({courseName})
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center">
                <CreditCard className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> To'lov usuli:
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px] text-slate-800">
                {payment.paymentMethod}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> To'lov sanasi:
              </span>
              <span className="font-medium text-slate-700">{formatDateUz(payment.paymentDate)}</span>
            </div>

            {payment.notes && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Izoh:</span>
                <span className="font-medium text-slate-700 text-right">{payment.notes}</span>
              </div>
            )}
          </div>

          {/* QR Code & Stamp */}
          <div className="pt-4 border-t border-dashed border-slate-200 flex items-center justify-between">
            <div className="space-y-1 max-w-[220px]">
              <div className="flex items-center space-x-1 text-emerald-600 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Rasmiy Tasdiqlangan Chek</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Skaner qilish orqali to'lov haqiqiyligini onlayn tekshirishingiz mumkin.
              </p>
            </div>

            <div className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <img src={qrCodeSrc} alt="QR Code" className="w-20 h-20 object-contain" />
            </div>
          </div>
        </div>

        {/* Action Buttons (hidden in print) */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 no-print">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleSendTelegram}
              disabled={sendingTelegram}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-blue-500" />
              <span>{sendingTelegram ? 'Yuborilmoqda...' : 'Telegram'}</span>
            </button>
            {telegramStatus === 'success' && (
              <span className="text-[10px] text-emerald-600 font-bold">✓ Yuborildi</span>
            )}
            {telegramStatus === 'error' && (
              <span className="text-[10px] text-rose-500 font-bold">❌ Xatolik</span>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Yopish
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish (Print)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
