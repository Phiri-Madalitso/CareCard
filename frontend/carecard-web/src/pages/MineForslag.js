import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChevronLeft } from '@tabler/icons-react';
import Navbar from '../components/Navbar';
import ForslagStatusListe from '../components/ForslagStatusListe';
import { useSpråk } from '../hooks/useSprak';
import { hentMineForslag } from '../services/profilService';
import { mapForslagForVisning } from '../utils/forslagUtils';

const FILTER_ALTERNATIVER = [
  { key: 'aktive', labelKey: 'filterAktive' },
  { key: 'godkjent', labelKey: 'filterGodkjent' },
  { key: 'alle', labelKey: 'filterAlle' },
];

function MineForslag() {
  const navigate = useNavigate();
  const { t } = useSpråk();
  const [forslag, setForslag] = useState([]);
  const [aktivtFilter, setAktivtFilter] = useState('aktive');
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState('');

  const lastForslag = useCallback(async (filter) => {
    setLaster(true);
    setFeil('');

    try {
      const data = await hentMineForslag(50, filter);
      setForslag(data.map((f) => mapForslagForVisning(f, t)));
    } catch {
      setForslag([]);
      setFeil(t.kunneIkkeHenteMineForslag);
    } finally {
      setLaster(false);
    }
  }, [t]);

  useEffect(() => {
    lastForslag(aktivtFilter);
  }, [aktivtFilter, lastForslag]);

  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-container">
        <div className="app-topbar">
          <button type="button" className="app-icon-btn" onClick={() => navigate(-1)} aria-label={t.tilbake}>
            <IconChevronLeft size={22} color="#2E6BFF" />
          </button>
          <p className="app-topbar-title">{t.mineForslag}</p>
          <div className="app-icon-btn" aria-hidden="true" />
        </div>

        <p className="forslag-status-intro">{t.mineForslagIntro}</p>

        <div className="app-filter-row forslag-filter-row">
          {FILTER_ALTERNATIVER.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`app-filter-btn cc-filter-btn${aktivtFilter === f.key ? ' forslag-filter-btn--aktiv' : ''}`}
              onClick={() => setAktivtFilter(f.key)}
            >
              {t[f.labelKey]}
            </button>
          ))}
        </div>

        {feil && <p className="forslag-status-feil">{feil}</p>}
        {laster && <p className="forslag-status-laster">{t.laster}</p>}

        <ForslagStatusListe
          forslag={forslag}
          feil={feil}
          laster={laster}
          tomTekst={aktivtFilter === 'aktive' ? t.ingenAktiveForslag : t.ingenMineForslag}
          onKlikkPasient={(pasientId) => navigate(`/pasient/${pasientId}`)}
        />
      </div>
    </div>
  );
}

export default MineForslag;
