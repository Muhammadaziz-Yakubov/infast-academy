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

  // To'g'ridan-to'g'ri iframe orqali yoki toza bosib chiqarish
  const printReceiptDirectly = () => {
    const el = document.getElementById('receipt-print-area');
    if (!el) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Chek</title>
          <style>
            @page {
              size: 58mm auto;
              margin: 0mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            html, body {
              width: 58mm;
              margin: 0 auto;
              padding: 2mm 1mm;
              background: #ffffff;
              color: #000000;
              font-family: monospace;
              font-size: 10px;
              line-height: 1.25;
            }
            .receipt-box {
              width: 100% !important;
              max-width: 56mm !important;
              margin: 0 auto !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .font-extrabold { font-weight: 800; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .border-b { border-bottom: 1px dashed #000; }
            .border-b-2 { border-bottom: 2px solid #000; }
            .border-t { border-top: 1px dashed #999; }
            .py-1 { padding-top: 3px; padding-bottom: 3px; }
            .py-1\\.5 { padding-top: 4px; padding-bottom: 4px; }
            .pb-1\\.5 { padding-bottom: 4px; }
            .pt-1\\.5 { padding-top: 4px; }
            .my-0\\.5 { margin-top: 2px; margin-bottom: 2px; }
            .mt-1\\.5 { margin-top: 4px; }
            .space-y-1 > * + * { margin-top: 3px; }
            .space-y-0\\.5 > * + * { margin-top: 1px; }
            .text-black { color: #000; }
            .text-neutral-800, .text-neutral-700, .text-neutral-600 { color: #222; }
            .text-\\[13px\\] { font-size: 13px; }
            .text-\\[10px\\] { font-size: 10px; }
            .text-\\[9px\\] { font-size: 9px; }
            .text-\\[8px\\] { font-size: 8px; }
            .text-\\[7\\.5px\\] { font-size: 7.5px; }
            .text-\\[17px\\] { font-size: 17px; }
            img { max-width: 100%; height: auto; }
            .w-11 { width: 44px; }
            .h-11 { height: 44px; }
          </style>
        </head>
        <body>
          ${el.outerHTML}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    if (payment && autoPrint) {
      const timer = setTimeout(() => {
        printReceiptDirectly();
      }, 400);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-sm overflow-y-auto print:hidden">
      <div className="bg-slate-900 w-full max-w-sm rounded-2xl p-4 shadow-2xl border border-slate-800 text-slate-100 relative">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">To'lov Cheki</h3>
              <p className="text-[10px] text-slate-400">Standart 58mm thermal chek</p>
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

        {/* Action Buttons Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 font-sans">
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
              onClick={printReceiptDirectly}
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
