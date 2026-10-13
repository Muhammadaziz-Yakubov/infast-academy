'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { formatDateUz } from '@/lib/utils';

interface StudentReceiptCardProps {
  student: any;
  password?: string;
  className?: string;
}

export function StudentReceiptCard({
  student,
  password = '123456',
  className = '',
}: StudentReceiptCardProps) {
  if (!student) return null;

  const rawId = student._id || student.id || '';
  const cleanId = typeof rawId === 'string' ? rawId : String(rawId);
  const studentCode = student.studentCode || `INF-${cleanId.slice(-6).toUpperCase()}`;

  const studentName = student.firstName && student.lastName
    ? `${student.firstName} ${student.lastName}`
    : student.name || 'Talaba';

  const groupName = student.groupId?.name || student.groupName || '-';
  const courseName = student.courseId?.name || student.courseName || '-';

  const branchAddress = 'Buloqboshi tumani, Yangi Hokimiyat';
  const branchPhone = '+998 (90) 271-00-27';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infast.uz';
  const loginUrl = `${origin}/login`;

  // QR code generation
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (loginUrl) {
      QRCode.toDataURL(loginUrl, {
        width: 280,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => {
          if (isMounted) setQrDataUrl(url);
        })
        .catch((err) => {
          console.error('QR code generation error:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [loginUrl]);

  const fallbackQr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=1&data=${encodeURIComponent(loginUrl)}`;
  const displayQr = qrDataUrl || fallbackQr;

  const joinedDateFormatted = formatDateUz(student.joinedDate || student.createdAt);

  return (
    <div
      id="student-receipt-print-area"
      className={`receipt-box w-full max-w-[330px] mx-auto bg-white text-black font-sans text-[11px] p-5 rounded-2xl shadow-xl border-2 border-neutral-300 select-text leading-normal ${className}`}
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. KORXONA SHAPKASI */}
      <div className="text-center pb-2.5" style={{ textAlign: 'center', paddingBottom: '10px' }}>
        <h2
          className="font-black text-[16px] tracking-wider text-black uppercase"
          style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.05em', color: '#000000', margin: 0 }}
        >
          INFAST IT-ACADEMY
        </h2>
        <p
          className="text-[11px] font-bold text-black mt-1"
          style={{ fontSize: '11px', fontWeight: 700, color: '#000000', marginTop: '4px' }}
        >
          IT & Kasbiy Ta'lim Markazi
        </p>
        <p
          className="text-[10px] font-semibold text-black mt-0.5"
          style={{ fontSize: '10px', fontWeight: 600, color: '#000000', marginTop: '2px' }}
        >
          {branchAddress}
        </p>
        <p
          className="text-[10px] font-bold text-black mt-0.5"
          style={{ fontSize: '10px', fontWeight: 700, color: '#000000', marginTop: '2px' }}
        >
          STIR: 312956346 • Tel: {branchPhone}
        </p>
      </div>

      {/* QALIN AJRATUVCHI CHIZIQ */}
      <div
        className="my-2.5 border-b-2 border-dashed border-black"
        style={{ borderBottom: '1.5px dashed #000000', margin: '10px 0' }}
      />

      {/* 2. CHEK SARLAVHASI VA HOLATI */}
      <div className="py-1 text-center" style={{ textAlign: 'center', padding: '4px 0' }}>
        <div
          className="font-black text-[13px] text-black uppercase tracking-wider"
          style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000000' }}
        >
          O'QUVCHI MA'LUMOTLARI
        </div>
        <div
          className="text-[11px] text-black font-extrabold tracking-wide mt-1"
          style={{ fontSize: '11px', fontWeight: 800, marginTop: '4px', color: '#000000' }}
        >
          ✓ TALABA KARTASI VA TIZIM PAROLI
        </div>
      </div>

      {/* QALIN AJRATUVCHI CHIZIQ */}
      <div
        className="my-2.5 border-b-2 border-dashed border-black"
        style={{ borderBottom: '1.5px dashed #000000', margin: '10px 0' }}
      />

      {/* 3. O'QUVCHI ASOSIY MA'LUMOTLARI */}
      <div className="py-2 space-y-2 text-[11px]" style={{ padding: '8px 0' }}>
        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Talaba F.I.Sh:</span>
          <span className="font-black text-black text-right max-w-[170px]" style={{ fontWeight: 900, textAlign: 'right', color: '#000000', maxWidth: '170px' }}>
            {studentName}
          </span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Talaba ID:</span>
          <span className="font-black text-black" style={{ fontWeight: 900, color: '#000000' }}>{studentCode}</span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Kurs:</span>
          <span className="font-bold text-black text-right max-w-[170px]" style={{ fontWeight: 700, textAlign: 'right', color: '#000000', maxWidth: '170px' }}>
            {courseName}
          </span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Guruh:</span>
          <span className="font-bold text-black text-right max-w-[170px]" style={{ fontWeight: 700, textAlign: 'right', color: '#000000', maxWidth: '170px' }}>
            {groupName}
          </span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Telefon:</span>
          <span className="font-black text-black" style={{ fontWeight: 900, color: '#000000' }}>{student.phone}</span>
        </div>

        {student.parentPhone ? (
          <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
            <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Ota-ona tel:</span>
            <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>{student.parentPhone}</span>
          </div>
        ) : null}

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Holati:</span>
          <span className="font-black text-black uppercase" style={{ fontWeight: 900, textTransform: 'uppercase', color: '#000000' }}>
            {student.status === 'ACTIVE' ? 'FAOL (ACTIVE)' : student.status || 'FAOL'}
          </span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Qo'shilgan sana:</span>
          <span className="font-bold text-black text-right" style={{ fontWeight: 700, textAlign: 'right', color: '#000000' }}>
            {joinedDateFormatted}
          </span>
        </div>
      </div>

      {/* QALIN 2.5PX AJRATUVCHI CHIZIQ */}
      <div
        className="my-2.5 border-b-2 border-black"
        style={{ borderBottom: '2.5px solid #000000', margin: '10px 0' }}
      />

      {/* 4. KATAKLAR ICHIDA SAL KATTAROQ LOGIN VA PAROL (RAMKA) */}
      <div
        className="my-2 border-2 border-black rounded-lg p-3 bg-neutral-50"
        style={{
          border: '2.5px solid #000000',
          borderRadius: '8px',
          padding: '10px',
          backgroundColor: '#fafafa',
          margin: '10px 0',
        }}
      >
        <div
          className="text-center font-black text-[11px] uppercase tracking-wider text-black pb-1.5 border-b border-black mb-2"
          style={{
            fontSize: '11px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#000000',
            borderBottom: '1.5px solid #000000',
            paddingBottom: '6px',
            marginBottom: '8px',
            textAlign: 'center',
          }}
        >
          🔑 TIZIMGA KIRISH REKVIZITLARI
        </div>

        {/* KATAK 1: LOGIN */}
        <div
          className="p-2 border-2 border-black rounded bg-white mb-2"
          style={{
            border: '2px solid #000000',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            padding: '8px',
            marginBottom: '8px',
          }}
        >
          <div
            className="text-[9.5px] font-black uppercase text-black"
            style={{ fontSize: '9.5px', fontWeight: 900, color: '#000000', textTransform: 'uppercase' }}
          >
            LOGIN (TELEFON / TALABA ID):
          </div>
          <div
            className="text-[15px] font-black tracking-wider text-black font-mono mt-0.5"
            style={{ fontSize: '15px', fontWeight: 900, color: '#000000', letterSpacing: '0.02em', marginTop: '2px' }}
          >
            {student.phone}
          </div>
          {studentCode ? (
            <div
              className="text-[10px] font-bold text-black font-mono mt-0.5"
              style={{ fontSize: '10px', fontWeight: 700, color: '#000000', marginTop: '2px' }}
            >
              ID: {studentCode}
            </div>
          ) : null}
        </div>

        {/* KATAK 2: PAROL */}
        <div
          className="p-2 border-2 border-black rounded bg-white"
          style={{
            border: '2px solid #000000',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            padding: '8px',
          }}
        >
          <div
            className="text-[9.5px] font-black uppercase text-black"
            style={{ fontSize: '9.5px', fontWeight: 900, color: '#000000', textTransform: 'uppercase' }}
          >
            MAXFIY PAROL (PASSWORD):
          </div>
          <div
            className="text-[19px] font-black tracking-widest text-black font-mono mt-0.5"
            style={{ fontSize: '19px', fontWeight: 900, color: '#000000', letterSpacing: '0.08em', marginTop: '2px' }}
          >
            {password || '123456'}
          </div>
        </div>
      </div>

      {/* QALIN 2.5PX AJRATUVCHI CHIZIQ */}
      <div
        className="my-2.5 border-b-2 border-black"
        style={{ borderBottom: '2.5px solid #000000', margin: '10px 0' }}
      />

      {/* 5. QR-KOD VA TIZIMGA KIRISH HAVOLASI */}
      <div className="py-2.5 text-center" style={{ textAlign: 'center', padding: '10px 0' }}>
        <div
          className="font-black text-[11px] uppercase tracking-wider text-black mb-2"
          style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000000', marginBottom: '8px' }}
        >
          TIZIMGA TEZ KIRISH (QR-KOD)
        </div>

        <div
          className="inline-block p-1.5 bg-white border-2 border-black rounded shadow-sm mx-auto"
          style={{
            display: 'inline-block',
            padding: '4px',
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            borderRadius: '4px',
            margin: '0 auto',
          }}
        >
          <img
            src={displayQr}
            alt="QR Kod"
            className="qr-img w-[115px] h-[115px] object-contain mx-auto block"
            style={{
              width: '115px',
              height: '115px',
              maxWidth: '115px',
              maxHeight: '115px',
              display: 'block',
              margin: '0 auto',
              imageRendering: 'pixelated',
            }}
          />
        </div>

        <p
          className="text-[10.5px] text-black font-bold mt-2.5 leading-snug"
          style={{ fontSize: '10.5px', color: '#000000', fontWeight: 700, marginTop: '8px', lineHeight: '1.35' }}
        >
          Tizimga kirish sahifasini ochish uchun<br />QR-kodni kamerangiz orqali skanerlang
        </p>

        <p
          className="text-[10px] text-black font-bold font-mono mt-1"
          style={{ fontSize: '10px', color: '#000000', fontWeight: 700, marginTop: '4px' }}
        >
          www.infast.uz/login
        </p>
      </div>

      {/* QALIN AJRATUVCHI CHIZIQ */}
      <div
        className="my-2.5 border-b-2 border-dashed border-black"
        style={{ borderBottom: '1.5px dashed #000000', margin: '10px 0' }}
      />

      {/* 6. PASTKI TASHAKKUR VA ESLATMA (Printer kesishi uchun bo'sh joy) */}
      <div
        className="text-center pt-2 pb-6 space-y-1.5"
        style={{ textAlign: 'center', paddingTop: '8px', paddingBottom: '24px' }}
      >
        <p
          className="text-[11px] font-black text-black uppercase"
          style={{ fontSize: '11px', fontWeight: 900, color: '#000000', textTransform: 'uppercase' }}
        >
          DIQQAT: PAROLNI HECH KIMGA BERMANG!
        </p>
        <p
          className="text-[10px] font-bold text-black"
          style={{ fontSize: '10px', fontWeight: 700, color: '#000000' }}
        >
          INFAST IT-Academy — Sifatli ta'lim garovi!
        </p>
        <p
          className="text-[10px] font-bold text-black"
          style={{ fontSize: '10px', fontWeight: 700, color: '#000000' }}
        >
          Murojaat uchun: +998 (90) 271-00-27
        </p>
        <p
          className="text-[10px] font-bold text-black"
          style={{ fontSize: '10px', fontWeight: 700, color: '#000000' }}
        >
          www.infast.uz
        </p>
      </div>
    </div>
  );
}
