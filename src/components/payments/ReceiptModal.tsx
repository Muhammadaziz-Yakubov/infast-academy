'use client';

import React, { useState } from 'react';
import { formatMoneyUz, formatDateUz } from '@/lib/utils';
import {
  X,
  Printer,
  ShieldCheck,
  Send,
  CheckCircle2,
  FileCheck,
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
  const formattedDate = formatDateUz(payment.paymentDate);
  const periodStart = formatDateUz(payment.periodStartDate);
  const periodEnd = formatDateUz(payment.periodEndDate);

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
        `📅 <b>To'lov Davri:</b> ${periodStart} — ${periodEnd}\n` +
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
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

      <div
        id="printable-receipt-modal"
        className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 text-slate-900 font-mono relative print:max-w-none print:shadow-none print:border-none print:rounded-none"
      >
        {/* Header Actions (hidden in print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print font-sans">
          <div className="flex items-center space-x-2 text-slate-800">
            <FileCheck className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-sm">Rasmiy Elektron Chek</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentic Fiscal Receipt Layout */}
        <div className="pt-4 space-y-4 text-xs leading-relaxed">
          {/* Header Organization Details */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <h2 className="font-extrabold text-base tracking-tight font-sans text-slate-950">INFAST IT-ACADEMY</h2>
            <p className="text-[10px] text-slate-500 font-sans font-semibold">"INFAST26" Xususiy Korxonasi</p>
            <p className="text-[10px] text-slate-500">STIR: 312 956 346 • Tel: +998 (90) 271-00-27</p>
            <p className="text-[10px] text-slate-400">www.infast.uz</p>
          </div>

          {/* Receipt Title */}
          <div className="text-center font-bold tracking-wider py-1 border-b border-slate-200 uppercase bg-slate-50 text-[11px] text-slate-800">
            TO'LOV KVITANSIYASI / FISCAL RECEIPT
          </div>

          {/* Data Table */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Chek №:</span>
              <span className="font-bold text-slate-900">{receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Sana va vaqt:</span>
              <span className="font-bold text-slate-900">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Talaba F.I.SH.:</span>
              <span className="font-bold text-slate-900 text-right">{studentName}</span>
            </div>
            {payment.studentId?.studentCode && (
              <div className="flex justify-between">
                <span className="text-slate-500">Talaba ID (Kod):</span>
                <span className="font-bold text-slate-900 font-mono">{payment.studentId.studentCode}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Guruh / Kurs:</span>
              <span className="font-bold text-slate-900 text-right">{groupName} ({courseName})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">To'lov usuli:</span>
              <span className="font-bold text-slate-900 uppercase">{payment.paymentMethod}</span>
            </div>
          </div>

          {/* Payment Period Block */}
          <div className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-0.5">
            <p className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">Qamrab olingan to'lov davri</p>
            <p className="text-xs font-bold text-slate-950 font-mono">
              {periodStart} — {periodEnd}
            </p>
          </div>

          {/* Amount Box */}
          <div className="py-3 px-4 border-2 border-slate-900 rounded-xl text-center space-y-0.5 bg-slate-950 text-white">
            <p className="text-[10px] font-sans text-slate-400 uppercase tracking-widest font-medium">Jami to'langan summa</p>
            <p className="text-xl font-black tracking-tight text-emerald-400">
              {formatMoneyUz(payment.amount)}
            </p>
          </div>

          {/* QR Code Verification Section */}
          <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between gap-3">
            <div className="space-y-1 text-[10px] text-slate-500 leading-tight">
              <div className="flex items-center space-x-1 text-emerald-700 font-bold font-sans">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ONLINE CHEK VERIFIED</span>
              </div>
              <p className="font-sans">Haqiqiyligini tekshirish uchun ushbu QR-kodni telefoningiz kameralari orqali skaner qiling.</p>
              <p className="text-[9px] text-slate-400 font-mono">ID: {paymentId}</p>
            </div>

            <div className="p-1 bg-white border border-slate-300 rounded-lg shrink-0">
              <img src={qrCodeSrc} alt="Receipt QR Code" className="w-20 h-20 object-contain" />
            </div>
          </div>

          {/* Footer Receipt Note */}
          <div className="text-center text-[9px] text-slate-400 pt-2 border-t border-slate-200">
            *** XIZMATINGIZ UCHUN TASHAKKUR! ***
          </div>
        </div>

        {/* Action Buttons (hidden in print) */}
        <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between gap-2 no-print font-sans">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSendTelegram}
              disabled={sendingTelegram}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>{sendingTelegram ? '...' : 'Telegram'}</span>
            </button>
            {telegramStatus === 'success' && <span className="text-[10px] text-emerald-600 font-bold">✓</span>}
            {telegramStatus === 'error' && <span className="text-[10px] text-rose-500 font-bold">❌</span>}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
            >
              Yopish
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-colors"
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
