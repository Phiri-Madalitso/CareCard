import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBell, IconChevronRight, IconLogout } from '@tabler/icons-react';
import CareCardLogo from '../components/CareCardLogo';
import { useSpråk, getHilsenKey, formatDato, getInitialer } from '../hooks/useSprak';
import { loggUt } from '../services/authService';
import { hentVentendeForslag } from '../services/profilService';

const AVDELINGER = [
  { id: 1, navn: 'Langtidsavdeling', enhetsnummer: 'Avdeling 1' },
  { id: 2, navn: 'Korttidsavdeling', enhetsnummer: 'Avdeling 2' },
  { id: 3, navn: 'Skjermet', enhetsnummer: 'Avdeling 3' },
];

function Avdelingsvalg() {
  const navigate = useNavigate();
  const { t, locale } = useSpråk();
  const brukerNavn = localStorage.getItem('navn') || 'Bruker';
  const fornavn = brukerNavn.split(' ')[0];
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
    <div className="app-shell">
      <header className="app-home-header">
        <div className="app-home-header-inner">
          <CareCardLogo size="header" variant="onDark" />

          <div className="app-home-header-actions">
            {skalViseVarsler && (
              <button
                type="button"
                className="app-home-notify"
                onClick={() => navigate('/godkjenning')}
                aria-label={t.varsler}
              >
                <IconBell size={20} stroke={1.75} color="#FFFFFF" />
                {antallVentende > 0 && (
                  <span className="app-home-notify-badge">{antallVentende}</span>
                )}
              </button>
            )}
            <button type="button" className="app-home-logout" onClick={handleLoggUt}>
              <IconLogout size={14} stroke={2} color="#FFFFFF" />
              <span>{t.loggUt}</span>
            </button>
            <div className="app-home-avatar" aria-hidden="true">
              {getInitialer(brukerNavn)}
            </div>
          </div>
        </div>
      </header>

      <main className="app-home-body">
        <p className="app-home-greeting">{t[getHilsenKey()]},</p>
        <h1 className="app-home-name">{fornavn} 👋</h1>
        <p className="app-home-date">{formatDato(locale)}</p>

        <h2 className="app-home-question">{t.hvilkenAvdeling}</h2>

        <div className="app-home-dept-list">
          {AVDELINGER.map((avdeling) => (
            <button
              key={avdeling.id}
              type="button"
              className="app-home-dept-card cc-card-hover"
              onClick={() => navigate('/pasienter', { state: { avdeling } })}
            >
              <div className="app-home-dept-text">
                <span className="app-home-dept-title">{avdeling.navn}</span>
                <span className="app-home-dept-subtitle">{avdeling.enhetsnummer}</span>
              </div>
              <IconChevronRight size={20} color="#6B7280" />
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Avdelingsvalg;
