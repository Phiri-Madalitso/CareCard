import React from 'react';

const sizes = {
  sm: { width: 80, height: 52, topFont: 12, bottomFont: 10, radius: 8, letterSpacing: 4 },
  nav: { width: 132, height: 84, topFont: 18, bottomFont: 14, radius: 10, letterSpacing: 5 },
  md: { width: 120, height: 76, topFont: 16, bottomFont: 13, radius: 10, letterSpacing: 6 },
  lg: { width: 160, height: 100, topFont: 22, bottomFont: 17, radius: 12, letterSpacing: 8 },
};

function CareCardLogo({ size = 'md' }) {
  const s = sizes[size] || sizes.md;

  return (
    <div
      style={{
        width: s.width,
        height: s.height,
        backgroundColor: '#207383',
        borderRadius: s.radius,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <div
        style={{
          color: '#fff',
          fontWeight: 700,
          fontSize: s.topFont,
          letterSpacing: s.letterSpacing,
          fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
          lineHeight: 1.2,
        }}
      >
        C&nbsp;&nbsp;A&nbsp;&nbsp;R&nbsp;&nbsp;E
      </div>
      <div
        style={{
          color: '#fff',
          fontWeight: 400,
          fontSize: s.bottomFont,
          letterSpacing: s.letterSpacing,
          fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
          lineHeight: 1.2,
        }}
      >
        c&nbsp;&nbsp;a&nbsp;&nbsp;r&nbsp;&nbsp;d
      </div>
    </div>
  );
}

export default CareCardLogo;
