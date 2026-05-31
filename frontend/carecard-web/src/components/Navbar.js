import { useNavigate } from 'react-router-dom';
import { IconBell } from '@tabler/icons-react';
import CareCardLogo from './CareCardLogo';

function Navbar({ antallVentende = 0 }) {
  const navigate = useNavigate();
  const rolle = localStorage.getItem('rolle');
  const skalViseVarsler = rolle === 'sykepleier' || rolle === 'leder';

  return (
    <div style={styles.navbar}>
      <CareCardLogo size="sm" />

      {skalViseVarsler && (
        <button
          type="button"
          style={styles.varslerKnapp}
          onClick={() => navigate('/godkjenning')}
        >
          <div style={styles.varslerIkonWrap}>
            <IconBell size={22} stroke={1.75} color="#13171F" />
            {antallVentende > 0 && (
              <div style={styles.badge}>
                {antallVentende}
              </div>
            )}
          </div>
          <span style={styles.varslerLabel}>Varsler</span>
        </button>
      )}
    </div>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    borderBottom: '1px solid #E5E7EB',
    background: '#FFFFFF',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  varslerKnapp: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 6px',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
  },
  varslerIkonWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
  },
  varslerLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#13171F',
  },
  badge: {
    position: 'absolute',
    top: '-2px',
    right: '-6px',
    background: '#A32D2D',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    minWidth: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    boxSizing: 'border-box',
  },
};

export default Navbar;
