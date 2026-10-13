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
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              width: 58mm;
              margin: 0 auto;
              padding: 0;
              background: #ffffff !important;
              color: #000000 !important;
              font-family: 'Courier New', Courier, monospace, system-ui;
              font-size: 10px;
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
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .font-extrabold { font-weight: 800; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .block { display: block; }
            .inline-block { display: inline-block; }
            .border-b { border-bottom: 1px dashed #666; }
            .border-b-2 { border-bottom: 2px solid #000; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .py-2\\.5 { padding-top: 10px; padding-bottom: 10px; }
            .pb-2\\.5 { padding-bottom: 10px; }
            .pb-6 { padding-bottom: 24px; }
            .pt-2 { padding-top: 8px; }
            .my-1 { margin-top: 4px; margin-bottom: 4px; }
            .my-2 { margin-top: 8px; margin-bottom: 8px; }
            .mt-1 { margin-top: 4px; }
            .mt-2 { margin-top: 8px; }
            .space-y-2 > * + * { margin-top: 6px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .text-black { color: #000 !important; }
            .text-neutral-800 { color: #222 !important; }
            .text-neutral-700 { color: #444 !important; }
            .text-neutral-600 { color: #666 !important; }
            .text-neutral-500 { color: #777 !important; }
            .text-\\[15px\\] { font-size: 14px; }
            .text-\\[11px\\] { font-size: 11px; }
            .text-\\[9\\.5px\\] { font-size: 9.5px; }
            .text-\\[9px\\] { font-size: 9px; }
            .text-\\[8\\.5px\\] { font-size: 8.5px; }
            .text-\\[8px\\] { font-size: 8px; }
            .text-\\[19px\\] { font-size: 18px; }
            img {
              max-width: 100%;
              height: auto;
              image-rendering: -webkit-optimize-contrast;
              image-rendering: pixelated;
            }
            .qr-img {
              width: 110px !important;
              height: 110px !important;
              max-width: 110px !important;
              max-height: 110px !important;
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
      <div className="bg-slate-900 w-full max-w-md rounded-2xl p-4 shadow-2xl border border-slate-800 text-slate-100 flex flex-col max-h-[92vh] relative">
        {/* Header Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <FileCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">To'lov Cheki</h3>
              <p className="text-[10px] text-slate-400">Standart thermal chek (58mm / 80mm)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Authentic Thermal Receipt Card (Scrollable if tall) */}
        <div className="py-2.5 overflow-y-auto flex-1 my-1 pr-0.5">
          <ReceiptCard payment={payment} receiptId={paymentId} />
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 font-sans shrink-0">
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
