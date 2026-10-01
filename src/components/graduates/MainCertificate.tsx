'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { formatUzbekDateDisplay } from '@/lib/certificateUtils';

export interface CertificateData {
  _id?: string;
  graduateId: string;
  certificateId: string;
  awardId?: string;
  fullName: string;
  track?: string;
  courseName?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  mentor?: string;
  director?: string;
  issuedDate?: string;
  status?: 'active' | 'revoked';
}

interface MainCertificateProps {
  data: CertificateData;
  id?: string;
  origin?: string;
}

export function MainCertificate({ data, id = 'main-certificate-print', origin }: MainCertificateProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const siteOrigin =
    origin || (typeof window !== 'undefined' ? window.location.origin : 'https://infastacademy.uz');
  const verifyUrl = `${siteOrigin}/verify/${data.certificateId}`;

  useEffect(() => {
    QRCode.toDataURL(
      verifyUrl,
      {
        width: 240,
        margin: 1,
        color: {
          dark: '#09090b',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrCodeDataUrl(url);
        } else {
          setQrCodeDataUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
              verifyUrl
            )}`
          );
        }
      }
    );
  }, [verifyUrl]);

  return (
    <div className="w-full overflow-x-auto flex justify-center py-4 bg-slate-100/60 dark:bg-slate-950/40 rounded-2xl p-2 print:p-0 print:bg-white">
      <div
        id={id}
        className="relative bg-[#FCFCFD] text-slate-900 select-none shadow-2xl print:shadow-none mx-auto overflow-hidden print:m-0"
        style={{
          width: '1123px',
          height: '794px',
          minWidth: '1123px',
          minHeight: '794px',
          maxWidth: '1123px',
          maxHeight: '794px',
          boxSizing: 'border-box',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Status watermark if revoked */}
        {data.status === 'revoked' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-white/70 backdrop-blur-[2px]">
            <div className="transform -rotate-12 border-4 border-rose-500 text-rose-600 text-5xl font-black uppercase px-14 py-4 tracking-widest rounded-2xl bg-white/95 shadow-2xl">
              BEKOR QILINGAN
            </div>
          </div>
        )}

        {/* Subtle Luxury Outer Border */}
        <div className="absolute inset-6 border border-slate-200/90 pointer-events-none rounded-sm" />

        {/* Certificate Layout */}
        <div className="relative h-full flex flex-col justify-between px-16 py-12">
          
          {/* Top Brand & Title Bar */}
          <div className="flex items-start justify-between">
            {/* Left: Brand Color Block & Title (Inspired by modern Swiss layout) */}
            <div className="flex items-center space-x-5">
              {/* InFast Orange Brand Accent Block */}
              <div className="w-7 h-20 bg-gradient-to-b from-infast-500 to-infast-600 rounded-sm shadow-sm" />
              <div>
                <h1 className="text-5xl font-black tracking-[-0.03em] text-slate-950 uppercase leading-none">
                  SERTIFIKAT
                </h1>
                <p className="text-[11px] font-bold tracking-[0.22em] text-infast-600 uppercase mt-2">
                  INFAST IT-ACADEMY
                </p>
              </div>
            </div>

            {/* Right: InFast Monogram & Certificate ID */}
            <div className="text-right flex flex-col items-end">
              <div className="flex items-center space-x-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-slate-950 flex items-center justify-center text-white font-black text-xs">
                  IF
                </div>
                <span className="font-extrabold text-xs tracking-wider text-slate-950 uppercase">
                  INFAST
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-400 tracking-wider">
                № {data.certificateId}
              </span>
            </div>
          </div>

          {/* Middle Body Content (Clean, left-aligned, spacious modern typography) */}
          <div className="my-auto py-2 max-w-3xl space-y-6">
            {/* Graduate Name */}
            <div>
              <h2 className="text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                {data.fullName}
              </h2>
            </div>

            {/* Main Statement Text */}
            <p className="text-xl text-slate-700 leading-relaxed font-normal">
              Ushbu sertifikat «<strong className="font-bold text-slate-950">InFast IT-Academy</strong>» o‘quv markazining «<strong className="font-bold text-infast-600">{data.track || 'Full-Stack Development'}</strong>» kursini muvaffaqiyatli yakunlagani uchun taqdim qilindi.
            </p>

            {/* Course Details Pill Tag */}
            <div className="inline-flex items-center space-x-6 text-xs text-slate-500 pt-1">
              <div>
                <span className="text-slate-400 font-medium">Davomiyligi: </span>
                <strong className="text-slate-900 font-bold">{data.duration || '15 oy'}</strong>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div>
                <span className="text-slate-400 font-medium">Yo‘nalish: </span>
                <strong className="text-slate-900 font-bold">{data.track || 'Full-Stack Development'}</strong>
              </div>
            </div>
          </div>

          {/* Bottom Row: Verification Info, Signatures & Stamp Space */}
          <div className="pt-4 border-t border-slate-200/80">
            <div className="grid grid-cols-4 items-end gap-6">
              
              {/* 1. Legal / Verification Note */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 leading-tight">
                  * Ushbu sertifikat rasmiy elektron ro‘yxatdan o‘tgan va haqiqiy hisoblanadi.
                </p>
                <p className="text-[9px] font-mono text-slate-400">
                  infastacademy.uz/verify
                </p>
              </div>

              {/* 2. Mentor Signature Area (Clean blank space for pen signature) */}
              <div className="text-center">
                {/* 50px clean blank space for hand signing */}
                <div className="h-12" />
                <div className="w-36 h-px bg-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-900 mt-1.5 tracking-tight">
                  {data.mentor || 'M. Yakubov'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  O‘quv markaz mentori
                </p>
              </div>

              {/* 3. Director Signature Area & Stamp Space (Clean blank space for hand signature & physical seal) */}
              <div className="text-center">
                {/* 50px clean blank space for hand signing */}
                <div className="h-12" />
                <div className="w-36 h-px bg-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-900 mt-1.5 tracking-tight">
                  {data.director || 'N. Yakubova'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Akademiya direktori
                </p>
              </div>

              {/* 4. Date & Clean QR Code */}
              <div className="flex items-end justify-end space-x-3 text-right">
                <div>
                  <p className="text-xs font-bold text-slate-900 font-mono">
                    {data.issuedDate || '02.10.2026'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    sana
                  </p>
                </div>

                <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-sm shrink-0">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded" />
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default MainCertificate;
