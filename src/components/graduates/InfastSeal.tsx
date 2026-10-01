'use client';

import React from 'react';

interface InfastSealProps {
  size?: number;
  className?: string;
  variant?: 'orange' | 'gold' | 'dark' | 'monochrome';
}

export function InfastSeal({ size = 120, className = '', variant = 'orange' }: InfastSealProps) {
  // SVG circular text path and clean corporate academy stamp design
  const mainColor =
    variant === 'orange'
      ? '#ea580c'
      : variant === 'gold'
      ? '#b45309'
      : variant === 'monochrome'
      ? '#334155'
      : '#0f172a';

  const secondaryColor =
    variant === 'orange'
      ? '#f97316'
      : variant === 'gold'
      ? '#d97706'
      : variant === 'monochrome'
      ? '#64748b'
      : '#1e293b';

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform transition-transform duration-300 hover:rotate-3"
      >
        <defs>
          {/* Top text curved path */}
          <path
            id="seal-curve-top"
            d="M 24,100 A 76,76 0 0,1 176,100"
            fill="none"
          />
          {/* Bottom text curved path */}
          <path
            id="seal-curve-bottom"
            d="M 176,100 A 76,76 0 0,1 24,100"
            fill="none"
          />
        </defs>

        {/* Outer decorative serrated or dashed border */}
        <circle
          cx="100"
          cy="100"
          r="95"
          stroke={mainColor}
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity="0.85"
        />

        {/* Outer solid rim */}
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke={mainColor}
          strokeWidth="2.5"
        />

        {/* Inner solid rim */}
        <circle
          cx="100"
          cy="100"
          r="66"
          stroke={secondaryColor}
          strokeWidth="1.2"
        />
        <circle
          cx="100"
          cy="100"
          r="62"
          stroke={secondaryColor}
          strokeWidth="0.8"
          strokeDasharray="2 2"
        />

        {/* Top Text along path */}
        <text
          fill={mainColor}
          fontSize="9.5"
          fontWeight="800"
          letterSpacing="2.8"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          <textPath href="#seal-curve-top" startOffset="50%" textAnchor="middle">
            ★ INFAST IT-ACADEMY ★
          </textPath>
        </text>

        {/* Bottom Text along path */}
        <text
          fill={mainColor}
          fontSize="8.5"
          fontWeight="700"
          letterSpacing="2"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          <textPath href="#seal-curve-bottom" startOffset="50%" textAnchor="middle">
            OFFICIAL QUALITY SEAL • 2026
          </textPath>
        </text>

        {/* Center Symbol / Monogram */}
        <g transform="translate(100, 100)">
          {/* Subtle star ring */}
          <circle cx="0" cy="0" r="44" fill={mainColor} fillOpacity="0.04" />
          
          {/* Central geometric star */}
          <path
            d="M0 -34 L7 -18 L24 -18 L11 -7 L16 9 L0 0 L-16 9 L-11 -7 L-24 -18 L-7 -18 Z"
            fill={mainColor}
            fillOpacity="0.12"
          />

          {/* Academy Monogram */}
          <text
            y="-4"
            textAnchor="middle"
            fill={mainColor}
            fontSize="14"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="1"
          >
            INFAST
          </text>
          <text
            y="10"
            textAnchor="middle"
            fill={secondaryColor}
            fontSize="7"
            fontWeight="800"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="2.5"
          >
            ACCREDITED
          </text>
          <text
            y="21"
            textAnchor="middle"
            fill={mainColor}
            fontSize="6"
            fontWeight="700"
            letterSpacing="1"
            opacity="0.85"
          >
            ★ ★ ★ ★ ★
          </text>
        </g>
      </svg>
    </div>
  );
}
export default InfastSeal;
