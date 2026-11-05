import React from 'react';

/**
 * Wektorowy sygnet marki Moja Biedronka (zastępuje surową emotkę biedronki)
 * Stylizowany zgodnie z designem Stitch: słoneczna żółć (#FFD200) + czerwień Biedronki (#BA0013 / #E31E24).
 */
export default function BiedronkaLogo({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-xl',
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative rounded-2xl bg-amber-300 border-2 border-amber-400 flex items-center justify-center shadow-xs overflow-hidden shrink-0 select-none ${currentSize} ${className}`}
      aria-label="Logo Moja Biedronka"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-4/5 h-4/5 transform -rotate-12 transition-transform duration-300 group-hover:rotate-0"
      >
        {/* Czułki */}
        <path
          d="M13 8C12 5.5 9 5 8 5M19 8C20 5.5 23 5 24 5"
          stroke="#18181B"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="8" cy="5" r="1.2" fill="#BA0013" />
        <circle cx="24" cy="5" r="1.2" fill="#BA0013" />

        {/* Główka */}
        <ellipse cx="16" cy="10.5" rx="5" ry="3.5" fill="#18181B" />
        <circle cx="14" cy="10" r="0.9" fill="#FFFFFF" />
        <circle cx="18" cy="10" r="0.9" fill="#FFFFFF" />

        {/* Ciało / Skrzydełka biedronki (czerwone z obwódką) */}
        <ellipse cx="16" cy="19.5" rx="10" ry="10" fill="#E31E24" stroke="#BA0013" strokeWidth="1" />
        <path d="M16 11V29.5" stroke="#BA0013" strokeWidth="1.5" strokeLinecap="round" />

        {/* Czarne kropki biedronki */}
        <circle cx="11.5" cy="15.5" r="2" fill="#18181B" />
        <circle cx="20.5" cy="15.5" r="2" fill="#18181B" />
        <circle cx="10" cy="22.5" r="1.8" fill="#18181B" />
        <circle cx="22" cy="22.5" r="1.8" fill="#18181B" />
        <circle cx="16" cy="25" r="1.5" fill="#18181B" />

        {/* Połysk światła */}
        <ellipse cx="13" cy="13.5" rx="1.5" ry="0.8" fill="#FFFFFF" opacity="0.6" transform="rotate(-30 13 13.5)" />
      </svg>
    </div>
  );
}
