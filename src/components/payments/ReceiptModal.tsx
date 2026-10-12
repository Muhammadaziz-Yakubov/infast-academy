'use client';

import React, { useState, useEffect } from 'react';
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
  autoPrint?: boolean;
}

export function ReceiptModal({ payment, onClose, autoPrint = false }: ReceiptModalProps) {
  const [sendingTelegram, setSendingTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Avtomatik chop etish (print dialogini darhol chiqarish)
  useEffect(() => {
    if (payment && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [payment, autoPrint]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <style jsx global>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
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
            width: 76mm !important;
            max-width: 76mm !important;
            margin: 0 auto !important;
            padding: 8px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-slate-900 w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-slate-800 text-slate-100 relative print:bg-white print:p-0 print:border-none print:shadow-none">
        {/* Header Actions (hidden in print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 no-print">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">To'lov Cheki</h3>
              <p className="text-[10px] text-slate-400">Standart 80mm kvitansiya</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Authentic Thermal Receipt Card */}
        <div className="py-3">
          <ReceiptCard payment={payment} receiptId={paymentId} />
        </div>

        {/* Action Buttons Footer (hidden in print) */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 no-print font-sans">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSendTelegram}
              disabled={sendingTelegram}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors disabled:opacity-50 border border-slate-700"
            >
              <Send className="w-3 h-3 text-blue-400" />
              <span>{sendingTelegram ? '...' : 'Telegram'}</span>
            </button>
            {telegramStatus === 'success' && (
              <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Yuborildi</span>
              </span>
            )}
            {telegramStatus === 'error' && (
              <span className="inline-flex items-center space-x-1 text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                <AlertCircle className="w-3 h-3" />
                <span>Xato</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition-colors border border-slate-700"
            >
              Yopish
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md flex items-center space-x-1.5 transition-colors"
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
