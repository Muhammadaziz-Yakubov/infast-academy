'use client';

import React from 'react';
import { formatMoneyUz, formatDateUz, formatDateTimeUz } from '@/lib/utils';

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
    : student.name || 'Talaba';

  const studentCode = student.studentCode || '';
  const groupName = student.groupId?.name || payment.groupName || '-';
  const courseName = student.courseId?.name || payment.courseName || '';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infast.uz';
  const receiptUrl = `${origin}/receipt/${cleanId}`;
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=110x110&margin=0&data=${encodeURIComponent(receiptUrl)}`;

  const paymentDateFormatted = formatDateTimeUz(payment.paymentDate || payment.createdAt);
  const periodStartFormatted = formatDateUz(payment.periodStartDate);
  const periodEndFormatted = formatDateUz(payment.periodEndDate);

  return (
    <div
      id="receipt-print-area"
      className={`receipt-box w-full max-w-[300px] mx-auto bg-white text-black font-mono text-[10px] p-4 rounded-xl shadow-md border border-neutral-200 select-text leading-tight ${className}`}
    >
      {/* 1. KORXONA SHAPKASI */}
      <div className="text-center pb-1.5 border-b border-dashed border-black">
        <h2 className="font-extrabold text-[13px] tracking-tight font-sans text-black uppercase">
          INFAST ACADEMY
        </h2>
        <p className="text-[9px] font-sans font-semibold text-neutral-800">
          "INFAST26" XK • Farg'ona sh.
        </p>
        <p className="text-[8px] text-neutral-700">
          STIR: 312956346 • Tel: (90) 271-00-27
        </p>
      </div>

      {/* 2. CHEK SARIQLIGI VA HOLATI */}
      <div className="py-1 text-center border-b border-dashed border-neutral-400">
        <div className="font-bold text-[10px] text-black uppercase tracking-wider">
          TO'LOV CHEKI (KVITANSIYA)
        </div>
        <div className="text-[8.5px] text-black font-bold font-sans">
          ✓ TO'LOV QABUL QILINDI
        </div>
      </div>

      {/* 3. REKVIZITLAR VA MA'LUMOTLAR */}
      <div className="py-1.5 space-y-1 border-b border-dashed border-neutral-400 text-[9px]">
        <div className="flex justify-between items-start">
          <span className="text-neutral-600">Chek №:</span>
          <span className="font-bold text-black">{receiptNo}</span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-neutral-600">Sana:</span>
          <span className="font-semibold text-black">{paymentDateFormatted}</span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-neutral-600">Talaba:</span>
          <span className="font-bold text-black text-right max-w-[155px]">
            {studentName} {studentCode ? `[${studentCode}]` : ''}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-neutral-600">Guruh:</span>
          <span className="font-medium text-black text-right max-w-[155px]">
            {groupName} {courseName ? `(${courseName})` : ''}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-neutral-600">Davr:</span>
          <span className="font-semibold text-black text-right">
            {periodStartFormatted} - {periodEndFormatted}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="text-neutral-600">Usul:</span>
          <span className="font-bold text-black uppercase">
            {payment.paymentMethod || 'NAQD'}
          </span>
        </div>

        {payment.notes ? (
          <div className="flex justify-between items-start">
            <span className="text-neutral-600">Izoh:</span>
            <span className="font-normal text-neutral-800 text-right max-w-[155px]">
              {payment.notes}
            </span>
          </div>
        ) : null}
      </div>

      {/* 4. JAMI SUMMA */}
      <div className="py-1.5 border-b-2 border-black text-center my-0.5">
        <div className="text-[8.5px] text-neutral-700 uppercase font-bold tracking-wider">
          Jami to'landi:
        </div>
        <div className="text-[17px] font-black text-black tracking-tight font-mono">
          {formatMoneyUz(payment.amount)}
        </div>
      </div>

      {/* 5. QR VA TEKSHIRUV */}
      <div className="pt-1.5 flex items-center justify-between gap-1.5">
        <div className="space-y-0.5 text-[7.5px] text-neutral-700 leading-tight flex-1">
          <p className="font-bold text-black text-[8px]">Elektron tasdiq</p>
          <p>Haqiqiyligini tekshirish uchun QR-kodni skanerlang.</p>
          <p className="text-neutral-600">Terminal: INF-POS-01</p>
        </div>

        <div className="p-0.5 bg-white border border-neutral-300 rounded shrink-0">
          <img
            src={qrCodeSrc}
            alt="QR"
            className="w-11 h-11 object-contain"
          />
        </div>
      </div>

      {/* 6. PASTKI TASHAKKUR */}
      <div className="text-center text-[8px] text-neutral-600 pt-1.5 border-t border-dashed border-neutral-300 mt-1.5 font-sans">
        Rahmat! • www.infast.uz
      </div>
    </div>
  );
}
