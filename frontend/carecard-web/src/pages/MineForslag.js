import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChevronLeft } from '@tabler/icons-react';
import Navbar from '../components/Navbar';
import ForslagStatusListe from '../components/ForslagStatusListe';
import { useSpråk } from '../hooks/useSprak';
import { hentMineForslag } from '../services/profilService';
import { mapForslagForVisning } from '../utils/forslagUtils';

function MineForslag() {
  const navigate = useNavigate();
  const { t } = useSpråk();
  const [forslag, setForslag] = useState([]);
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState('');

  const lastForslag = useCallback(async () => {
    setLaster(true);
    setFeil('');

    try {
      const data = await hentMineForslag();
      setForslag(data.map((f) => mapForslagForVisning(f, t)));
    } catch {
      setFeil(t.kunneIkkeHenteMineForslag);
    } finally {
      setLaster(false);
    }
  }, [t]);

  useEffect(() => {
    lastForslag();
  }, [lastForslag]);

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

        {feil && <p className="forslag-status-feil">{feil}</p>}
        {laster && <p className="forslag-status-laster">{t.laster}</p>}

        <ForslagStatusListe
          forslag={forslag}
          feil={feil}
          laster={laster}
          onKlikkPasient={(pasientId) => navigate(`/pasient/${pasientId}`)}
        />
      </div>
    </div>
  );
}

export default MineForslag;
