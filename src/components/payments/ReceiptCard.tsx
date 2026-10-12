'use client';

import React from 'react';
import { formatMoneyUz, formatDateUz, formatDateTimeUz } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

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

  const student = payment.studentId || {};
  const studentName = student.firstName && student.lastName
    ? `${student.firstName} ${student.lastName}`
    : student.name || 'Noma\'lum Talaba';

  const studentCode = student.studentCode || '';
  const groupName = student.groupId?.name || payment.groupName || '-';
  const courseName = student.courseId?.name || payment.courseName || '';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infast.uz';
  const receiptUrl = `${origin}/receipt/${cleanId}`;
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&data=${encodeURIComponent(receiptUrl)}`;

  const paymentDateFormatted = formatDateTimeUz(payment.paymentDate || payment.createdAt);
  const periodStartFormatted = formatDateUz(payment.periodStartDate);
  const periodEndFormatted = formatDateUz(payment.periodEndDate);

  return (
    <div
      id="receipt-print-area"
      className={`w-full max-w-[340px] mx-auto bg-white text-black font-mono text-[11px] p-5 rounded-xl shadow-lg border border-slate-200 select-text leading-tight print:shadow-none print:border-none print:w-[76mm] print:max-w-[76mm] print:p-1 print:m-0 ${className}`}
    >
      {/* 1. KORXONA SHAPKASI */}
      <div className="text-center pb-2.5 border-b border-dashed border-neutral-400">
        <h2 className="font-extrabold text-[15px] tracking-tight font-sans text-neutral-900 uppercase">
          INFAST ACADEMY
        </h2>
        <p className="text-[10px] font-sans font-semibold text-neutral-700">
          "INFAST26" XK • Farg'ona sh.
        </p>
        <p className="text-[9px] text-neutral-600">
          STIR: 312956346 • Tel: +998 (90) 271-00-27
        </p>
      </div>

      {/* 2. CHEK SARIQLIGI VA HOLATI */}
      <div className="py-2 text-center border-b border-dashed border-neutral-300">
        <div className="font-bold text-[11px] text-neutral-900 uppercase tracking-wider">
          TO'LOV KVITANSIYASI
        </div>
        <div className="text-[9px] text-emerald-700 font-bold font-sans mt-0.5">
          ✓ TO'LOV QABUL QILINDI
        </div>
      </div>

      {/* 3. METALAR */}
      <div className="py-2.5 space-y-1.5 border-b border-dashed border-neutral-300">
        <div className="flex justify-between items-start">
          <span className="text-neutral-500">Chek №:</span>
          <span className="font-bold text-neutral-900">{receiptNo}</span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-neutral-500">Sana:</span>
          <span className="font-semibold text-neutral-800">{paymentDateFormatted}</span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-neutral-500">Talaba:</span>
          <span className="font-bold text-neutral-950 text-right max-w-[190px]">
            {studentName} {studentCode ? `(${studentCode})` : ''}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-neutral-500">Guruh/Kurs:</span>
          <span className="font-medium text-neutral-800 text-right max-w-[190px]">
            {groupName} {courseName ? `• ${courseName}` : ''}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-neutral-500">Davr:</span>
          <span className="font-semibold text-neutral-900 text-right">
            {periodStartFormatted} - {periodEndFormatted}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-neutral-500">To'lov turi:</span>
          <span className="font-bold text-neutral-900 uppercase">
            {payment.paymentMethod || 'NAQD'}
          </span>
        </div>

        {payment.notes ? (
          <div className="flex justify-between items-start">
            <span className="text-neutral-500">Izoh:</span>
            <span className="font-normal text-neutral-700 text-right max-w-[190px]">
              {payment.notes}
            </span>
          </div>
        ) : null}
      </div>

      {/* 4. JAMI SUMMA */}
      <div className="py-2.5 border-b-2 border-neutral-900 text-center">
        <div className="text-[10px] text-neutral-600 uppercase font-bold tracking-wider mb-0.5">
          Jami To'landi:
        </div>
        <div className="text-xl font-black text-neutral-950 tracking-tight font-mono">
          {formatMoneyUz(payment.amount)}
        </div>
      </div>

      {/* 5. QR VA TEKSHIRUV */}
      <div className="pt-2.5 flex items-center justify-between gap-2">
        <div className="space-y-0.5 text-[8.5px] text-neutral-600 leading-tight flex-1">
          <p className="font-bold text-neutral-900">Elektron chek tasdiqlangan</p>
          <p>Haqiqiyligini tekshirish uchun QR-kodni skanerlang.</p>
          <p className="text-neutral-500 pt-0.5">Terminal: INF-POS-01</p>
        </div>

        <div className="p-0.5 bg-white border border-neutral-300 rounded shrink-0">
          <img
            src={qrCodeSrc}
            alt="QR"
            className="w-14 h-14 object-contain"
          />
        </div>
      </div>

      {/* 6. PASTKI TASHAKKUR */}
      <div className="text-center text-[9px] text-neutral-500 pt-2.5 border-t border-dashed border-neutral-300 mt-2 font-sans">
        Xaridingiz uchun rahmat!
      </div>
    </div>
  );
}
