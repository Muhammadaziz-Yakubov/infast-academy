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
          dark: '#0f172a',
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

  const startDateFormatted = formatUzbekDateDisplay(data.startDate || '01.07.2025');
  const endDateFormatted = formatUzbekDateDisplay(data.endDate || '02.10.2026');

  return (
    <div className="w-full overflow-x-auto flex justify-center py-4 bg-slate-100/60 dark:bg-slate-950/40 rounded-2xl p-2 print:p-0 print:bg-white">
      <div
        id={id}
        className="relative bg-white text-slate-900 select-none shadow-2xl print:shadow-none mx-auto overflow-hidden print:m-0"
        style={{
          width: '1123px',
          height: '794px',
          minWidth: '1123px',
          minHeight: '794px',
          maxWidth: '1123px',
          maxHeight: '794px',
          boxSizing: 'border-box',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Inter, sans-serif",
        }}
      >
        {/* Status watermark if revoked */}
        {data.status === 'revoked' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-white/60 backdrop-blur-[2px]">
            <div className="transform -rotate-12 border-4 border-rose-500 text-rose-500 text-5xl font-black uppercase px-14 py-4 tracking-widest rounded-2xl bg-white/95 shadow-2xl">
              BEKOR QILINGAN
            </div>
          </div>
        )}

        {/* Ultra-Clean Apple Minimalist Border */}
        <div className="absolute inset-[18px] border border-slate-200/80 pointer-events-none rounded-[4px]" />
        <div className="absolute inset-[24px] border border-slate-900/10 pointer-events-none" />

        {/* Minimal Corner Accents */}
        <div className="absolute top-[24px] left-[24px] w-6 h-6 border-t-2 border-l-2 border-infast-500 pointer-events-none" />
        <div className="absolute top-[24px] right-[24px] w-6 h-6 border-t-2 border-r-2 border-infast-500 pointer-events-none" />
        <div className="absolute bottom-[24px] left-[24px] w-6 h-6 border-b-2 border-l-2 border-infast-500 pointer-events-none" />
        <div className="absolute bottom-[24px] right-[24px] w-6 h-6 border-b-2 border-r-2 border-infast-500 pointer-events-none" />

        {/* Main Certificate Content */}
        <div className="relative h-full flex flex-col justify-between px-20 py-12 text-center">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-white font-black shadow-sm">
                  <span className="text-infast-500 text-xs font-black">IF</span>
                </div>
                <div>
                  <h2 className="text-xs font-black tracking-[0.25em] text-slate-950 uppercase">
                    INFAST IT-ACADEMY
                  </h2>
                  <p className="text-[9px] tracking-[0.2em] text-slate-400 font-semibold uppercase mt-0.5">
                    ACADEMY OF MODERN TECHNOLOGIES
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                  CERTIFICATE ID
                </span>
                <p className="text-xs font-mono font-bold text-slate-950">
                  {data.certificateId}
                </p>
              </div>
            </div>

            {/* Title Section */}
            <div className="mt-8 space-y-1.5">
              <span className="inline-block text-[10px] font-bold tracking-[0.4em] text-infast-600 uppercase">
                RASMIY BITIRUV HUJJATI
              </span>
              <h1 className="text-4xl font-extrabold tracking-[0.22em] text-slate-950 uppercase">
                SERTIFIKAT
              </h1>
              <div className="w-16 h-0.5 bg-infast-500 mx-auto rounded-full mt-2" />
            </div>
          </div>

          {/* Middle Body */}
          <div className="my-auto py-4 space-y-4">
            <p className="text-xs font-medium text-slate-400 tracking-widest uppercase">
              Ushbu sertifikat
            </p>

            {/* Graduate Name */}
            <div className="py-2">
              <h2 className="text-3xl font-black text-slate-950 tracking-wider uppercase px-6">
                {data.fullName}
              </h2>
              <div className="w-64 h-px bg-slate-300 mx-auto mt-2" />
            </div>

            <p className="text-xs font-medium text-slate-400 tracking-widest uppercase">
              ga
            </p>

            <p className="text-sm text-slate-700 max-w-2xl mx-auto leading-relaxed font-normal">
              <span className="font-bold text-slate-950">{data.duration || '15 oy'}lik</span>{' '}
              <span className="font-bold text-infast-600">{data.track || 'Full-Stack Development'}</span>{' '}
              ta’lim dasturini muvaffaqiyatli tamomlaganligi munosabati bilan berildi.
            </p>

            {/* Minimal Course Metadata Row */}
            <div className="inline-flex items-center justify-center gap-10 pt-4 pb-2 border-y border-slate-100 px-10">
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                  Yo‘nalish
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase">
                  {data.track || 'FULL-STACK DEVELOPMENT'}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                  Davomiyligi
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase">
                  {data.duration || '15 OY'}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-semibold">
                  Kurs davri
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase">
                  {startDateFormatted} — {endDateFormatted}
                </span>
              </div>
            </div>
          </div>

          {/* Footer: Clean Signing Areas & Stamp Space */}
          <div className="pt-2">
            <div className="grid grid-cols-3 items-end gap-6">
              {/* Left: Mentor Hand-Signature Area (Clean blank space for pen signature) */}
              <div className="text-center">
                {/* 64px Blank space specifically for pen signature */}
                <div className="h-16" />
                <div className="w-44 h-px bg-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-950 mt-1.5 tracking-tight">
                  {data.mentor || 'M. Yakubov'}
                </p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                  O‘quv markaz mentori
                </p>
              </div>

              {/* Center: Physical Stamp Area & QR Code */}
              <div className="flex items-center justify-center space-x-6">
                {/* Clean blank area reserved for physical academy stamp */}
                <div className="w-20 h-20 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-[9px] font-mono text-slate-300 uppercase tracking-wider select-none">
                  M.O‘.
                </div>

                {/* Unique Verification QR */}
                <div className="flex flex-col items-center">
                  <div className="p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="Verification QR"
                        className="w-[68px] h-[68px] object-contain"
                      />
                    ) : (
                      <div className="w-[68px] h-[68px] bg-slate-50 rounded" />
                    )}
                  </div>
                  <span className="text-[7.5px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
                    Skaner qiling
                  </span>
                </div>
              </div>

              {/* Right: Director Hand-Signature Area (Clean blank space for pen signature) */}
              <div className="text-center">
                {/* 64px Blank space specifically for pen signature */}
                <div className="h-16" />
                <div className="w-44 h-px bg-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-950 mt-1.5 tracking-tight">
                  {data.director || 'N. Yakubova'}
                </p>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                  InFast IT-Academy direktori
                </p>
              </div>
            </div>

            {/* Bottom Verification Note */}
            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-3 border-t border-slate-100 mt-3">
              <span>Berilgan sana: {formatUzbekDateDisplay(data.issuedDate || '02.10.2026')}</span>
              <span className="font-mono">infastacademy.uz/verify/{data.certificateId}</span>
              <span>InFast Academy © 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainCertificate;
