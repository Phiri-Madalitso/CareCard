import React from 'react';

const heights = {
  sm: 52,
  header: 42,
  nav: 108,
  md: 76,
  lg: 100,
};

function CareCardLogo({ size = 'md', variant = 'default' }) {
  const height = heights[size] || heights.md;
  const width = Math.round(height * (320 / 128));
  const onNav = variant === 'nav';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 128"
      width={width}
      height={height}
      role="img"
      aria-label="CareCard"
      className={`carecard-logo${onNav ? ' carecard-logo--nav' : ''}`}
    >
      <rect
        width="320"
        height="128"
        rx="18"
        fill={onNav ? 'rgba(255, 255, 255, 0.14)' : '#0D2B52'}
        stroke={onNav ? 'rgba(255, 255, 255, 0.5)' : 'none'}
        strokeWidth={onNav ? 2 : 0}
      />
      <g fill="#FFFFFF" fontFamily="'Manrope', Arial, sans-serif" textAnchor="middle">
        <text x="64" y="58" fontSize="28" fontWeight="700">C</text>
        <text x="64" y="98" fontSize="22" fontWeight="400">c</text>
        <text x="128" y="58" fontSize="28" fontWeight="700">A</text>
        <text x="128" y="98" fontSize="22" fontWeight="400">a</text>
        <text x="192" y="58" fontSize="28" fontWeight="700">R</text>
        <text x="192" y="98" fontSize="22" fontWeight="400">r</text>
        <text x="256" y="58" fontSize="28" fontWeight="700">E</text>
        <text x="256" y="98" fontSize="22" fontWeight="400">d</text>
      </g>
    </svg>
  );
}

export default CareCardLogo;
