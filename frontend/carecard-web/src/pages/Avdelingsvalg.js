import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconCalendar,
  IconChevronRight,
  IconClipboardList,
  IconHeart,
  IconShield,
} from '@tabler/icons-react';
import Navbar from '../components/Navbar';
import { useSpråk, getHilsenKey, formatDato } from '../hooks/useSprak';
import { hentInnloggetProfil } from '../services/authService';
import { hentMineForslag } from '../services/profilService';
import { mapForslagForVisning } from '../utils/forslagUtils';

const AVDELINGS_IKONER = {
  1: IconHeart,
  2: IconCalendar,
  3: IconShield,
};

const AVDELINGER = [
  { id: 1, navn: 'Langtidsavdeling', enhetsnummer: 'Avdeling 1' },
  { id: 2, navn: 'Korttidsavdeling', enhetsnummer: 'Avdeling 2' },
  { id: 3, navn: 'Skjermet', enhetsnummer: 'Avdeling 3' },
];

function Avdelingsvalg() {
  const navigate = useNavigate();
  const { t, locale } = useSpråk();
  const [brukerNavn, setBrukerNavn] = useState(() => localStorage.getItem('navn') || 'Bruker');
  const rolle = localStorage.getItem('rolle');
  const erAnsatt = rolle === 'ansatt';
  const [mineForslag, setMineForslag] = useState([]);
  const [mineForslagLaster, setMineForslagLaster] = useState(erAnsatt);
  const [mineForslagFeil, setMineForslagFeil] = useState('');
  const fornavn = brukerNavn.split(' ')[0];

  const venterAntall = mineForslag.filter((f) => f.status === 'Venter').length;

  let forslagUndertekst = t.seForslagStatus;
  if (mineForslagLaster) {
    forslagUndertekst = t.laster;
  } else if (!mineForslagFeil && mineForslag.length === 0) {
    forslagUndertekst = t.ingenMineForslag;
  } else if (!mineForslagFeil && venterAntall > 0) {
    forslagUndertekst = `🟡 ${venterAntall} ${t.statusVenter.toLowerCase()}`;
  }

  useEffect(() => {
    let avbrutt = false;

    async function oppdaterProfil() {
      try {
        const profil = await hentInnloggetProfil();
        if (avbrutt) return;
        localStorage.setItem('navn', profil.navn);
        localStorage.setItem('rolle', profil.rolle);
        localStorage.setItem('ansattId', String(profil.ansattId));
        setBrukerNavn(profil.navn);
      } catch {
        // Beholder cachet navn hvis API ikke svarer
      }
    }

    oppdaterProfil();

    return () => {
      avbrutt = true;
    };
  }, []);

  useEffect(() => {
    if (!erAnsatt) return undefined;

    let avbrutt = false;

    async function lastMineForslag() {
      setMineForslagLaster(true);
      setMineForslagFeil('');

      try {
        const data = await hentMineForslag(20, 'aktive');
        if (!avbrutt) {
          setMineForslag(data.map((f) => mapForslagForVisning(f, t)));
        }
      } catch {
        if (!avbrutt) {
          setMineForslag([]);
          setMineForslagFeil(t.kunneIkkeHenteMineForslag);
        }
      } finally {
        if (!avbrutt) {
          setMineForslagLaster(false);
        }
      }
    }

    lastMineForslag();

    return () => {
      avbrutt = true;
    };
  }, [erAnsatt, locale, t]);

  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-home-body">
        <p className="app-home-greeting">{t[getHilsenKey()]},</p>
        <h1 className="app-home-name">{fornavn} 👋</h1>
        <p className="app-home-date">{formatDato(locale)}</p>

        {erAnsatt && (
          <div className="app-home-forslag-wrap">
            <button
              type="button"
              className="app-home-forslag-entry cc-card-hover"
              onClick={() => navigate('/mine-forslag')}
            >
              <div className="app-home-dept-icon">
                <IconClipboardList size={22} stroke={1.75} />
              </div>
              <div className="app-home-dept-text">
                <span className="app-home-dept-title">{t.dineSisteForslag}</span>
                <span className="app-home-dept-subtitle">{forslagUndertekst}</span>
              </div>
              <IconChevronRight size={22} color="#94A3B8" />
            </button>
            {mineForslagFeil && (
              <p className="app-home-forslag-feil">{mineForslagFeil}</p>
            )}
          </div>
        )}

        <h2 className="app-home-question">{t.hvilkenAvdeling}</h2>

        <div className="app-home-dept-list">
          {AVDELINGER.map((avdeling) => {
            const DeptIcon = AVDELINGS_IKONER[avdeling.id];
            return (
              <button
                key={avdeling.id}
                type="button"
                className="app-home-dept-card cc-card-hover"
                onClick={() => navigate('/pasienter', { state: { avdeling } })}
              >
                <div className="app-home-dept-icon">
                  <DeptIcon size={22} stroke={1.75} />
                </div>
                <div className="app-home-dept-text">
                  <span className="app-home-dept-title">{avdeling.navn}</span>
                  <span className="app-home-dept-subtitle">{avdeling.enhetsnummer}</span>
                </div>
                <IconChevronRight size={22} color="#94A3B8" />
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Avdelingsvalg;
