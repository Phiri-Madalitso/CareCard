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
import {
  colors,
  spacing,
  typography,
  card,
  radii,
  shadows,
} from '../styles/theme';

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

  const nyVerdi = apiForslag.nyVerdi ?? '';
  const nyVerdiOversatt = apiForslag.nyVerdiOversatt ?? null;
  const harOversettelse = Boolean(
    nyVerdiOversatt?.trim()
    && nyVerdiOversatt.trim().toLowerCase() !== nyVerdi.trim().toLowerCase()
  );

  return {
    id: apiForslag.id,
    pasient: pasientNavn,
    kategori: apiForslag.profilType,
    felt: apiForslag.feltNavn,
    gammelVerdi: apiForslag.gammelVerdi,
    nyVerdi,
    nyVerdiOversatt: harOversettelse ? nyVerdiOversatt : null,
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
    <div className="app-shell">
      <Navbar />

      <div className="app-container">
        <div className="app-topbar">
          <button type="button" className="app-icon-btn" onClick={() => navigate(-1)} aria-label={t.tilbake}>
            <IconChevronLeft size={22} color="#2E6BFF" />
          </button>
          <p className="app-topbar-title">{t.tilGodkjenning}</p>
          <div className="app-icon-btn" aria-hidden="true" />
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

            <div
              className="app-change-row"
              style={{ alignItems: f.nyVerdiOversatt ? 'start' : 'center' }}
            >
              <div style={styles.gammel}>
                <p style={styles.endringLabel}>{t.gammel}</p>
                <p style={styles.endringTekst}>{f.gammelVerdi}</p>
              </div>
              <div className="app-change-arrow">→</div>
              {f.nyVerdiOversatt ? (
                <div style={styles.nyOversatt}>
                  <div style={styles.oversattSeksjon}>
                    <p style={styles.endringLabel}>{t.original}</p>
                    <p style={styles.endringTekst}>{f.nyVerdi}</p>
                  </div>
                  <div style={styles.oversattSeksjon}>
                    <p style={styles.endringLabel}>{t.oversattTilNorsk}</p>
                    <p style={styles.endringTekst}>{f.nyVerdiOversatt}</p>
                  </div>
                  <p style={styles.advarselBoks}>{t.automatiskOversattAdvarsel}</p>
                </div>
              ) : (
                <div style={styles.ny}>
                  <p style={styles.endringLabel}>{t.ny}</p>
                  <p style={styles.endringTekst}>{f.nyVerdi}</p>
                </div>
              )}
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
  tittel: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.text,
    margin: 0,
  },
  undertittel: {
    fontSize: 15,
    color: colors.textMuted,
    margin: `0 0 ${spacing.lg}px`,
    lineHeight: 1.5,
  },
  feil: {
    color: colors.alertRedText,
    fontSize: 15,
    marginBottom: spacing.md,
    lineHeight: 1.5,
  },
  laster: {
    color: colors.textMuted,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  tom: {
    textAlign: 'center',
    padding: `${spacing.xxl}px 0`,
    fontSize: 16,
    color: colors.textMuted,
    lineHeight: 1.6,
  },
  kort: {
    ...card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  kortHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  pasientNavn: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.text,
    margin: '0 0 4px',
    lineHeight: 1.35,
  },
  meta: {
    fontSize: 14,
    color: colors.textMuted,
    margin: 0,
  },
  datoBadge: {
    fontSize: 12,
    color: colors.textMuted,
    background: colors.surfaceSoft,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: radii.pill,
    padding: '6px 12px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  sendtAv: {
    fontSize: 14,
    color: colors.textMuted,
    margin: `0 0 ${spacing.md}px`,
  },
  gammel: {
    background: colors.alertRedBg,
    borderRadius: radii.md,
    padding: `${spacing.md}px ${spacing.lg}px`,
  },
  ny: {
    background: colors.successBg,
    borderRadius: radii.md,
    padding: `${spacing.md}px ${spacing.lg}px`,
  },
  nyOversatt: {
    background: colors.successBg,
    borderRadius: radii.md,
    padding: `${spacing.md}px ${spacing.lg}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  oversattSeksjon: {
    margin: 0,
  },
  advarselBoks: {
    margin: 0,
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.sm,
    background: colors.alertYellowBg,
    color: colors.alertYellowText,
    fontSize: 13,
    lineHeight: 1.5,
  },
  endringLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    color: colors.textMuted,
    margin: '0 0 6px',
  },
  endringTekst: {
    fontSize: 15,
    color: colors.text,
    margin: 0,
    lineHeight: 1.55,
  },
  tekstfelt: {
    width: '100%',
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: radii.md,
    border: `1px solid ${colors.border}`,
    fontSize: 15,
    fontFamily: typography.fontFamily,
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box',
    marginBottom: spacing.md,
    lineHeight: 1.5,
  },
  knappeRad: {
    display: 'flex',
    gap: spacing.sm,
  },
  avvisKnapp: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: `${spacing.md}px`,
    borderRadius: radii.md,
    border: '1px solid #F5C6C6',
    background: colors.alertRedBg,
    color: colors.alertRedText,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: typography.fontFamily,
  },
  godkjennKnapp: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: `${spacing.md}px`,
    borderRadius: radii.md,
    border: 'none',
    background: colors.link,
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: typography.fontFamily,
  },
  toast: {
    position: 'fixed',
    bottom: spacing.xl,
    left: '50%',
    transform: 'translateX(-50%)',
    background: colors.text,
    color: '#fff',
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: radii.lg,
    fontSize: 15,
    fontWeight: 500,
    zIndex: 1000,
    boxShadow: shadows.elevated,
  },
};

export default Godkjenning;
