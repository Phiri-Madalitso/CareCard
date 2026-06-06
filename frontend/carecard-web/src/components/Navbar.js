import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBell } from '@tabler/icons-react';
import CareCardLogo from './CareCardLogo';
import { useSpråk } from '../hooks/useSprak';
import { hentVentendeForslag } from '../services/profilService';
import { colors, spacing, typography } from '../styles/theme';

function Navbar() {
  const navigate = useNavigate();
  const { t } = useSpråk();
  const rolle = localStorage.getItem('rolle');
  const skalViseVarsler = rolle === 'sykepleier' || rolle === 'leder';
  const [antallVentende, setAntallVentende] = useState(0);

  useEffect(() => {
    if (!skalViseVarsler) return undefined;

    let avbrutt = false;

    async function oppdaterAntall() {
      try {
        const forslag = await hentVentendeForslag();
        if (!avbrutt) {
          setAntallVentende(forslag.length);
        }
      } catch {
        if (!avbrutt) {
          setAntallVentende(0);
        }
      }
    }

    oppdaterAntall();
    const intervall = setInterval(oppdaterAntall, 30000);

    return () => {
      avbrutt = true;
      clearInterval(intervall);
    };
  }, [skalViseVarsler]);

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <CareCardLogo size="nav" />

        {skalViseVarsler ? (
          <button
            type="button"
            style={styles.varslerKnapp}
            onClick={() => navigate('/godkjenning')}
            aria-label={t.varsler}
          >
            <div style={styles.varslerIkonWrap}>
              <IconBell size={26} stroke={1.75} color={colors.text} />
              {antallVentende > 0 && (
                <div style={styles.badge}>
                  {antallVentende}
                </div>
              )}
            </div>
            <span style={styles.varslerLabel}>{t.varsler}</span>
          </button>
        ) : (
          <div style={{ width: 48 }} aria-hidden="true" />
        )}
      </div>
    </header>
  );
}

const styles = {
  varslerKnapp: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.xs,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: `${spacing.xs}px ${spacing.sm}px`,
    borderRadius: 12,
    fontFamily: typography.fontFamily,
    marginLeft: 'auto',
  },
  varslerIkonWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
  },
  varslerLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.text,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    background: colors.alertRedText,
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    minWidth: 20,
    height: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 5px',
    boxSizing: 'border-box',
  },
};

export default Navbar;
