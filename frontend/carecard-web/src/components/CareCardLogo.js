import React from 'react';

function CareCardLogo({ size = 'md', variant = 'default' }) {
  const onNav = variant === 'nav';
  const sizeClass = onNav ? 'carecard-logo--nav' : `carecard-logo--${size}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 128"
      role="img"
      aria-label="CareCard"
      className={`carecard-logo ${sizeClass}`}
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
