import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 900,
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontFamily: 'sans-serif',
          letterSpacing: '-1px',
        }}
      >
        iF
      </div>
    ),
    {
      ...size,
    }
  );
}
