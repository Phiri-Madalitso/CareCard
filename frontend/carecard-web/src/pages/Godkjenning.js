import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChevronLeft, IconCheck, IconX } from '@tabler/icons-react';
import Navbar from '../components/Navbar';
import { useSpråk } from '../hooks/useSprak';
import {
  hentVentendeForslag,
  godkjennForslag,
  avvisForslag,
} from '../services/profilService';

function formatDato(dato) {
  if (!dato) return '';
  return new Date(dato).toLocaleString('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapForslagTilVisning(apiForslag) {
  const pasient = apiForslag.pasient;
  const pasientNavn = pasient
    ? `${pasient.fornavn} ${pasient.etternavn}`
    : `Pasient ${apiForslag.pasientId}`;

  return {
    id: apiForslag.id,
    pasient: pasientNavn,
    kategori: apiForslag.profilType,
    felt: apiForslag.feltNavn,
    gammelVerdi: apiForslag.gammelVerdi,
    nyVerdi: apiForslag.nyVerdi,
    sendtAv: `Ansatt #${apiForslag.opprettetAvId}`,
    dato: formatDato(apiForslag.opprettetTidspunkt),
  };
}

function Godkjenning() {
  const navigate = useNavigate();
  const { t } = useSpråk();
  const [forslag, setForslag] = useState([]);
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState('');
  const [kommentar, setKommentar] = useState({});
  const [visKommentar, setVisKommentar] = useState(null);
  const [visToast, setVisToast] = useState('');
  const [behandler, setBehandler] = useState(null);

  const lastForslag = useCallback(async () => {
    setLaster(true);
    setFeil('');

    try {
      const data = await hentVentendeForslag();
      setForslag(data.map(mapForslagTilVisning));
    } catch {
      setFeil(t.kunneIkkeHenteForslag);
    } finally {
      setLaster(false);
    }
  }, [t.kunneIkkeHenteForslag]);

  useEffect(() => {
    lastForslag();
  }, [lastForslag]);

  const godkjenn = async (id) => {
    setBehandler(id);
    setFeil('');

    try {
      await godkjennForslag(id);
      setForslag((prev) => prev.filter((f) => f.id !== id));
      setVisToast('endringGodkjent');
      setTimeout(() => setVisToast(''), 3000);
    } catch {
      setFeil(t.kunneIkkeGodkjenne);
    } finally {
      setBehandler(null);
    }
  };

  const avvis = async (id) => {
    setBehandler(id);
    setFeil('');

    try {
      await avvisForslag(id, kommentar[id] || '');
      setForslag((prev) => prev.filter((f) => f.id !== id));
      setVisKommentar(null);
      setVisToast('forslagAvvist');
      setTimeout(() => setVisToast(''), 3000);
    } catch {
      setFeil(t.kunneIkkeAvvise);
    } finally {
      setBehandler(null);
    }
  };

  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.innhold}>
        <div style={styles.topBar}>
          <IconChevronLeft
            size={22}
            color="#185FA5"
            onClick={() => navigate(-1)}
            style={{ cursor: 'pointer' }}
          />
          <p style={styles.tittel}>{t.tilGodkjenning}</p>
          <div style={{ width: 22 }} />
        </div>

        {feil && <p style={styles.feil}>{feil}</p>}
        {laster && <p style={styles.laster}>{t.laster}</p>}

        {!laster && (
          <p style={styles.undertittel}>
            {forslag.length} {t.eldsteForst}
          </p>
        )}

        {!laster && forslag.length === 0 && (
          <div style={styles.tom}>
            <p>{t.ingenForslag}</p>
          </div>
        )}

        {!laster && forslag.map((f) => (
          <div key={f.id} style={styles.kort}>
            <div style={styles.kortHeader}>
              <div>
                <p style={styles.pasientNavn}>{f.pasient}</p>
                <p style={styles.meta}>{f.kategori} · {f.felt}</p>
              </div>
              <span style={styles.datoBadge}>{f.dato}</span>
            </div>

            <p style={styles.sendtAv}>{t.sendtAv} {f.sendtAv}</p>

            <div style={styles.endringRad}>
              <div style={styles.gammel}>
                <p style={styles.endringLabel}>{t.gammel}</p>
                <p style={styles.endringTekst}>{f.gammelVerdi}</p>
              </div>
              <div style={styles.pil}>→</div>
              <div style={styles.ny}>
                <p style={styles.endringLabel}>{t.ny}</p>
                <p style={styles.endringTekst}>{f.nyVerdi}</p>
              </div>
            </div>

            {visKommentar === f.id && (
              <textarea
                style={styles.tekstfelt}
                placeholder={t.skrivBegrunnelse}
                value={kommentar[f.id] || ''}
                onChange={(e) => setKommentar((prev) => ({ ...prev, [f.id]: e.target.value }))}
                rows={2}
              />
            )}

            <div style={styles.knappeRad}>
              <button
                type="button"
                style={styles.avvisKnapp}
                disabled={behandler === f.id}
                onClick={() => (visKommentar === f.id ? avvis(f.id) : setVisKommentar(f.id))}
              >
                <IconX size={14} /> {visKommentar === f.id ? t.sendAvvisning : t.avvis}
              </button>
              <button
                type="button"
                style={styles.godkjennKnapp}
                disabled={behandler === f.id}
                onClick={() => godkjenn(f.id)}
              >
                <IconCheck size={14} /> {t.godkjenn}
              </button>
            </div>
          </div>
        ))}
      </div>

      {visToast && t[visToast] && (
        <div style={styles.toast}>
          {t[visToast]}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: 'Manrope, -apple-system, sans-serif',
  },
  innhold: {
    maxWidth: '640px',
    margin: '0 auto',
    padding: '24px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  tittel: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#13171F',
    margin: 0,
  },
  undertittel: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '0 0 16px',
  },
  feil: {
    color: '#A32D2D',
    fontSize: '14px',
    marginBottom: '12px',
  },
  laster: {
    color: '#6B7280',
    fontSize: '14px',
    marginBottom: '12px',
  },
  tom: {
    textAlign: 'center',
    padding: '48px 0',
    fontSize: '15px',
    color: '#6B7280',
  },
  kort: {
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    background: '#FFFFFF',
  },
  kortHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '4px',
  },
  pasientNavn: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#13171F',
    margin: '0 0 2px',
  },
  meta: {
    fontSize: '12px',
    color: '#6B7280',
    margin: 0,
  },
  datoBadge: {
    fontSize: '11px',
    color: '#6B7280',
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '20px',
    padding: '3px 10px',
  },
  sendtAv: {
    fontSize: '12px',
    color: '#6B7280',
    margin: '0 0 12px',
  },
  endringRad: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '12px',
  },
  gammel: {
    background: '#FCEBEB',
    borderRadius: '10px',
    padding: '10px 12px',
  },
  ny: {
    background: '#E6F4EA',
    borderRadius: '10px',
    padding: '10px 12px',
  },
  pil: {
    fontSize: '18px',
    color: '#6B7280',
    textAlign: 'center',
  },
  endringLabel: {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6B7280',
    margin: '0 0 4px',
  },
  endringTekst: {
    fontSize: '13px',
    color: '#13171F',
    margin: 0,
    lineHeight: '1.4',
  },
  tekstfelt: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
    fontSize: '13px',
    fontFamily: 'Manrope, sans-serif',
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box',
    marginBottom: '10px',
  },
  knappeRad: {
    display: 'flex',
    gap: '8px',
  },
  avvisKnapp: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #F5C6C6',
    background: '#FCEBEB',
    color: '#A32D2D',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
  },
  godkjennKnapp: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    background: '#185FA5',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
  },
  toast: {
    position: 'fixed',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#13171F',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
};

export default Godkjenning;
