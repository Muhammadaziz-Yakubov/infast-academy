'use client';

import React, { useState } from 'react';
import { formatMoneyUz, formatDateUz } from '@/lib/utils';
import { ReceiptCard } from './ReceiptCard';
import {
  X,
  Printer,
  Send,
  FileCheck,
  CheckCircle2,
  AlertCircle,
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
  const receiptNo = `INF-${paymentId.slice(-8).toUpperCase()}`;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infast.uz';
  const receiptUrl = `${origin}/receipt/${paymentId}`;

  const student = payment.studentId || {};
  const studentName = student.firstName && student.lastName
    ? `${student.firstName} ${student.lastName}`
    : 'Noma\'lum Talaba';

  const groupName = student.groupId?.name || payment.groupName || '-';
  const courseName = student.courseId?.name || payment.courseName || '-';
  const periodStart = formatDateUz(payment.periodStartDate);
  const periodEnd = formatDateUz(payment.periodEndDate);

  const handlePrint = () => {
    window.print();
  };

  const handleSendTelegram = async () => {
    setSendingTelegram(true);
    setTelegramStatus('idle');
    try {
      const chatId = student.groupId?.telegramChatId || '';
      const text = `🧾 <b>INFAST ACADEMY — TO'LOV KVITANSIYASI</b>\n\n` +
        `👤 <b>Talaba:</b> ${studentName}\n` +
        `📚 <b>Guruh/Kurs:</b> ${groupName} (${courseName})\n` +
        `💰 <b>Summa:</b> ${formatMoneyUz(payment.amount)}\n` +
        `📅 <b>To'lov Davri:</b> ${periodStart} — ${periodEnd}\n` +
        `💳 <b>Usul:</b> ${payment.paymentMethod || 'NAQD'}\n` +
        `🔢 <b>Chek №:</b> ${receiptNo}\n\n` +
        `🔗 <b>Rasmiy chekni ko'rish:</b> ${receiptUrl}`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #receipt-print-area, #receipt-print-area * {
            visibility: visible !important;
          }
          #receipt-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-slate-900 w-full max-w-md rounded-3xl p-5 md:p-6 shadow-2xl border border-slate-800 text-slate-100 relative print:bg-white print:p-0 print:border-none print:shadow-none">
        {/* Header Actions (hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 no-print">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Elektron Chek</h3>
              <p className="text-[10px] text-slate-400">Rasmiy fiskal kvitansiya</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentic Thermal Receipt Card */}
        <div className="py-4">
          <ReceiptCard payment={payment} receiptId={paymentId} />
        </div>

        {/* Action Buttons Footer (hidden in print) */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 no-print font-sans">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSendTelegram}
              disabled={sendingTelegram}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors disabled:opacity-50 border border-slate-700"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>{sendingTelegram ? 'Yuborilmoqda...' : 'Telegram'}</span>
            </button>
            {telegramStatus === 'success' && (
              <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Yuborildi</span>
              </span>
            )}
            {telegramStatus === 'error' && (
              <span className="inline-flex items-center space-x-1 text-[11px] text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                <AlertCircle className="w-3 h-3" />
                <span>Xatolik</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors border border-slate-700"
            >
              Yopish
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
