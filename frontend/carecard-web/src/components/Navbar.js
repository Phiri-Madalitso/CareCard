import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBell, IconLogout } from '@tabler/icons-react';
import CareCardLogo from './CareCardLogo';
import { useSpråk, getInitialer } from '../hooks/useSprak';
import { loggUt } from '../services/authService';
import { hentVentendeForslag } from '../services/profilService';

function Navbar() {
  const navigate = useNavigate();
  const { t } = useSpråk();
  const brukerNavn = localStorage.getItem('navn') || 'Bruker';
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

  const handleLoggUt = () => {
    loggUt();
    navigate('/');
  };

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <button
          type="button"
          className="app-header-logo-btn"
          onClick={() => navigate('/avdelingsvalg')}
          aria-label="CareCard"
        >
          <CareCardLogo size="nav" variant="nav" />
        </button>

        <div className="app-header-actions">
          {skalViseVarsler && (
            <button
              type="button"
              className="app-header-notify"
              onClick={() => navigate('/godkjenning')}
              aria-label={t.varsler}
            >
              <IconBell size={26} stroke={1.75} color="#FFFFFF" />
              {antallVentende > 0 && (
                <span className="app-header-notify-badge">{antallVentende}</span>
              )}
            </button>
          )}
          <button type="button" className="app-header-logout" onClick={handleLoggUt}>
            <IconLogout size={18} stroke={2} color="#FFFFFF" />
            <span>{t.loggUt}</span>
          </button>
          <div className="app-header-avatar" aria-hidden="true">
            {getInitialer(brukerNavn)}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
