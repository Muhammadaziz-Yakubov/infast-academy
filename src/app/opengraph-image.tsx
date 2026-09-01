import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = "InFast IT-Academy — Zamonaviy IT Kurslari va Amaliy Ta'lim";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#000000',
          backgroundImage:
            'radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 1) 70%)',
          color: '#ffffff',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top Brand Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#ffffff',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 900,
              }}
            >
              iF
            </div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: '#ffffff',
              }}
            >
              INFAST <span style={{ color: '#a3a3a3', fontWeight: 400 }}>IT-ACADEMY</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 22px',
              borderRadius: '999px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '16px',
              fontWeight: 600,
              color: '#10b981',
            }}
          >
            ● AMALIY IT TA'LIM
          </div>
        </div>

        {/* Hero Headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              fontSize: '58px',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
              color: '#ffffff',
            }}
          >
            IT kelajagingizni real amaliy loyihalar bilan quring
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 400,
              color: '#a3a3a3',
              lineHeight: 1.4,
            }}
          >
            Frontend • Backend • Cyber Security — 100% amaliyot va shaxsiy portfolio
          </div>
        </div>

        {/* Footer Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '30px',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              fontSize: '18px',
              color: '#d4d4d4',
            }}
          >
            <span>✓ Toshkent & Urganch filiallari</span>
            <span>✓ 95% Amaliyot</span>
            <span>✓ Sertifikat</span>
          </div>

          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#ffffff',
              background: 'rgba(255,255,255,0.1)',
              padding: '10px 24px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            infast.uz
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
