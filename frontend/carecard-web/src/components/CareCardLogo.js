import React from 'react';

const sizes = {
  sm: { height: 52 },
  header: { height: 44 },
  nav: { height: 92 },
  md: { height: 76 },
  lg: { height: 100 },
};

function CareCardLogo({ size = 'md' }) {
  const s = sizes[size] || sizes.md;

  return (
    <img
      src={`${process.env.PUBLIC_URL}/carecard-logo.png`}
      alt="CareCard"
      style={{
        height: s.height,
        width: 'auto',
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}

export default CareCardLogo;
