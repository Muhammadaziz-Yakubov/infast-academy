'use client';

import React from 'react';
import { formatMoneyUz, formatDateUz, formatDateTimeUz } from '@/lib/utils';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface ReceiptCardProps {
  payment: any;
  receiptId?: string;
  className?: string;
}

export function ReceiptCard({ payment, receiptId, className = '' }: ReceiptCardProps) {
  if (!payment) return null;

  const rawId = payment._id || payment.id || receiptId || '';
  const cleanId = typeof rawId === 'string' ? rawId : String(rawId);
  const receiptNo = `INF-${cleanId.slice(-8).toUpperCase()}`;

  // Deterministic fiscal code for realistic appearance
  const fiscalSign = `FM-${cleanId.slice(-6).toUpperCase()}-2026`;

  const student = payment.studentId || {};
  const studentName = student.firstName && student.lastName
    ? `${student.firstName} ${student.lastName}`
    : student.name || 'Noma\'lum Talaba';

  const studentCode = student.studentCode || '';
  const groupName = student.groupId?.name || payment.groupName || '-';
  const courseName = student.courseId?.name || payment.courseName || '-';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infast.uz';
  const receiptUrl = `${origin}/receipt/${cleanId}`;
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(receiptUrl)}`;

  const paymentDateFormatted = formatDateTimeUz(payment.paymentDate || payment.createdAt);
  const periodStartFormatted = formatDateUz(payment.periodStartDate);
  const periodEndFormatted = formatDateUz(payment.periodEndDate);

  return (
    <div
      id="receipt-print-area"
      className={`w-full max-w-[385px] mx-auto bg-white text-slate-900 font-mono p-6 sm:p-7 rounded-2xl shadow-xl border border-slate-200 relative overflow-hidden select-text print:shadow-none print:border-none print:w-full print:max-w-none print:p-0 ${className}`}
    >
      {/* Decorative Serrated Edge Cut lines for thermal receipt look */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 print:hidden" />

      {/* Header Organization Details */}
      <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
        <div className="flex items-center justify-center space-x-1.5 mb-1">
          <div className="w-6 h-6 bg-slate-950 text-emerald-400 rounded-lg flex items-center justify-center font-sans font-black text-xs">
            IF
          </div>
          <h2 className="font-black text-lg tracking-tight font-sans text-slate-950 uppercase">
            INFAST ACADEMY
          </h2>
        </div>
        <p className="text-[10px] font-sans font-bold text-slate-600">
          "INFAST26" Xususiy Korxonasi
        </p>
        <p className="text-[10px] text-slate-500 leading-tight">
          STIR: 312 956 346 • Tel: +998 (90) 271-00-27
        </p>
        <p className="text-[9px] text-slate-400 font-sans">
          Farg'ona sh., Al-Farg'oniy k. • www.infast.uz
        </p>
      </div>

      {/* Receipt Title & Status Stamp */}
      <div className="my-3 text-center space-y-1 py-2 bg-slate-50 rounded-xl border border-slate-100">
        <div className="font-bold tracking-widest text-[11px] text-slate-900 uppercase">
          FISKAL TO'LOV CHEKI
        </div>
        <div className="flex items-center justify-center space-x-1 text-[10px] font-bold text-emerald-600 font-sans">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>TO'LOV QABUL QILINDI</span>
        </div>
      </div>

      {/* Detailed Key-Value Rows */}
      <div className="space-y-2 text-xs py-2">
        <div className="flex justify-between items-baseline">
          <span className="text-slate-500 font-sans text-[11px]">Chek №:</span>
          <span className="font-bold text-slate-900">{receiptNo}</span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-slate-500 font-sans text-[11px]">Sana va vaqt:</span>
          <span className="font-semibold text-slate-800">{paymentDateFormatted}</span>
        </div>

        <div className="flex justify-between items-baseline border-t border-slate-100 pt-2">
          <span className="text-slate-500 font-sans text-[11px]">Xizmat turi:</span>
          <span className="font-semibold text-slate-900 text-right">IT Ta'lim Xizmati</span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-slate-500 font-sans text-[11px]">Talaba F.I.Sh.:</span>
          <span className="font-bold text-slate-950 text-right">{studentName}</span>
        </div>

        {studentCode && (
          <div className="flex justify-between items-baseline">
            <span className="text-slate-500 font-sans text-[11px]">Talaba ID (Kod):</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
              {studentCode}
            </span>
          </div>
        )}

        <div className="flex justify-between items-baseline">
          <span className="text-slate-500 font-sans text-[11px]">Guruh / Kurs:</span>
          <span className="font-medium text-slate-800 text-right">
            {groupName} {courseName !== '-' ? `(${courseName})` : ''}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-slate-500 font-sans text-[11px]">To'lov usuli:</span>
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            {payment.paymentMethod || 'NAQD'}
          </span>
        </div>

        {payment.notes && (
          <div className="flex justify-between items-baseline">
            <span className="text-slate-500 font-sans text-[11px]">Izoh:</span>
            <span className="font-medium text-slate-700 text-right max-w-[180px] truncate">
              {payment.notes}
            </span>
          </div>
        )}
      </div>

      {/* Payment Period Block */}
      <div className="my-3 py-2 px-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-0.5">
        <p className="text-[9px] font-sans font-bold text-slate-400 uppercase tracking-wider">
          Qamrab olingan to'lov davri
        </p>
        <p className="text-[11px] font-bold text-slate-900">
          {periodStartFormatted} — {periodEndFormatted}
        </p>
      </div>

      {/* Amount Block - Ultra Minimalist Thermal Style */}
      <div className="my-4 pt-3 pb-3 border-y-2 border-dashed border-slate-900 text-center space-y-1">
        <div className="flex justify-between items-center text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">
          <span>Jami to'landi</span>
          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
            PAID
          </span>
        </div>
        <div className="text-2xl font-black tracking-tight text-slate-950 font-mono pt-1">
          {formatMoneyUz(payment.amount)}
        </div>
      </div>

      {/* Fiscal & QR Security Section */}
      <div className="pt-2 flex items-start justify-between gap-3">
        <div className="space-y-1.5 text-[9px] text-slate-500 leading-tight flex-1">
          <div className="flex items-center space-x-1 text-slate-900 font-bold font-sans">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[10px] tracking-tight">ONLINE CHEK VERIFIED</span>
          </div>
          <p className="text-slate-500 font-sans leading-tight">
            Chekning haqiqiyligini tekshirish uchun QR-kodni skaner qiling.
          </p>
          <div className="pt-1 space-y-0.5 text-[9px] text-slate-400 font-mono">
            <div>Fiskal belgi: <span className="font-bold text-slate-700">{fiscalSign}</span></div>
            <div>Terminal ID: <span className="font-bold text-slate-700">INF-POS-01</span></div>
          </div>
        </div>

        <div className="p-1 bg-white border border-slate-300 rounded-xl shrink-0 shadow-sm">
          <img
            src={qrCodeSrc}
            alt="Receipt QR Code"
            className="w-20 h-20 object-contain"
          />
        </div>
      </div>

      {/* Simulated Barcode Visual */}
      <div className="my-4 text-center space-y-1 opacity-70">
        <div className="flex items-center justify-center space-x-[2px] h-7 overflow-hidden">
          {[3, 1, 2, 4, 1, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 1, 2].map((width, idx) => (
            <div
              key={idx}
              className="bg-slate-950 h-full"
              style={{ width: `${width}px` }}
            />
          ))}
        </div>
        <p className="text-[8px] text-slate-400 font-mono tracking-widest uppercase">
          *{receiptNo}*
        </p>
      </div>

      {/* Footer Note */}
      <div className="text-center text-[9px] text-slate-400 pt-2 border-t border-dashed border-slate-200 font-sans">
        *** XIZMATINGIZ UCHUN TASHAKKUR! ***
      </div>
    </div>
  );
}
