'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { formatUzbekDateDisplay } from '@/lib/certificateUtils';
import { CertificateData } from './MainCertificate';

interface AwardCertificateProps {
  data: CertificateData & { nomination?: string };
  id?: string;
  origin?: string;
}

export function AwardCertificate({
  data,
  id = 'award-certificate-print',
  origin,
}: AwardCertificateProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const awardNumber = data.awardId || data.certificateId.replace('GRAD', 'AWARD');
  const siteOrigin =
    origin || (typeof window !== 'undefined' ? window.location.origin : 'https://infastacademy.uz');
  const verifyUrl = `${siteOrigin}/verify/${awardNumber}`;

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
        <div className="absolute inset-6 border border-amber-200/90 pointer-events-none rounded-sm" />

        {/* Certificate Layout */}
        <div className="relative h-full flex flex-col justify-between px-16 py-12">
          
          {/* Top Brand & Title Bar */}
          <div className="flex items-start justify-between">
            {/* Left: Brand Color Block & Title */}
            <div className="flex items-center space-x-5">
              {/* Amber/Gold Brand Accent Block */}
              <div className="w-7 h-20 bg-gradient-to-b from-amber-500 to-amber-600 rounded-sm shadow-sm" />
              <div>
                <h1 className="text-4xl font-black tracking-[-0.03em] text-slate-950 uppercase leading-none">
                  NOMINATSIYA SERTIFIKATI
                </h1>
                <p className="text-[11px] font-bold tracking-[0.22em] text-amber-600 uppercase mt-2">
                  INFAST IT-ACADEMY • HONOR & EXCELLENCE AWARD
                </p>
              </div>
            </div>

            {/* Right: Award ID */}
            <div className="text-right">
              <span className="font-mono text-xs font-bold text-slate-400 tracking-wider">
                № {awardNumber}
              </span>
            </div>
          </div>

          {/* Middle Body Content */}
          <div className="my-auto py-2 max-w-3xl space-y-5">
            {/* Graduate Name */}
            <div>
              <h2 className="text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                {data.fullName}
              </h2>
            </div>

            {/* Nomination Focus Area */}
            <div className="py-1">
              <span className="inline-block px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xl font-black text-amber-700 uppercase tracking-wide">
                ⭐ {data.nomination || 'BEST FULL-STACK DEVELOPER'}
              </span>
            </div>

            {/* Main Statement Text */}
            <p className="text-xl text-slate-700 leading-relaxed font-normal">
              Ushbu maxsus sertifikat «<strong className="font-bold text-slate-950">InFast IT-Academy</strong>» o‘quv markazida ta’lim davomida ko‘rsatgan yuksak natijalari va professional mahorati uchun taqdim qilindi.
            </p>
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

export default AwardCertificate;
