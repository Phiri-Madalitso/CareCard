import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconChevronLeft,
  IconPencil,
  IconAlertTriangle,
  IconGlass,
  IconMoon,
  IconToolsKitchen2,
  IconX,
  IconClock,
} from '@tabler/icons-react';
import Navbar from '../components/Navbar';
import { useSpråk } from '../hooks/useSprak';
import {
  hentMatprofil,
  sendEndringsforslag,
  oversettTekster,
} from '../services/profilService';
import { getAnsattId } from '../services/apiClient';
import {
  colors,
  spacing,
  typography,
  card,
  radii,
  shadows,
} from '../styles/theme';

const FELT_KONFIG = {
  fortykningsbehov: { profilType: 'Matprofil', apiFelt: 'KonsistensDrikke', felt: 'konsistensDrikke' },
  kaffeTe: { profilType: 'Matprofil', apiFelt: 'KaffeTe', felt: 'kaffeTe' },
  drikke: { profilType: 'Matprofil', apiFelt: 'Drikke', felt: 'drikke' },
  frokost: { profilType: 'Matprofil', apiFelt: 'Frokost', felt: 'frokost' },
  kveldsmat: { profilType: 'Matprofil', apiFelt: 'Kvelds', felt: 'kvelds' },
  konsistensMat: { profilType: 'Matprofil', apiFelt: 'KonsistensMat', felt: 'konsistensMat' },
  hvorSpiser: { profilType: 'Matprofil', apiFelt: 'HvorSpiser', felt: 'hvorSpiser' },
  redskap: { profilType: 'Matprofil', apiFelt: 'Redskap', felt: 'redskap' },
  likerIkke: { profilType: 'Matprofil', apiFelt: 'Misliker', felt: 'misliker' },
};

const MAT_OVERSATT_FELTER = [
  'allergier', 'konsistensDrikke', 'kaffeTe', 'drikke', 'frokost',
  'kvelds', 'konsistensMat', 'hvorSpiser', 'redskap', 'misliker',
];

async function oversettProfil(profil, felter, malSprak) {
  if (!profil || malSprak === 'no') return profil;

  const tekster = felter.map((f) => profil[f] ?? '');
  const oversatt = await oversettTekster(tekster, malSprak);
  const copy = { ...profil };
  felter.forEach((f, i) => {
    copy[f] = oversatt[i] ?? tekster[i];
  });
  return copy;
}

function getInitials(fornavn, etternavn) {
  const f = fornavn.trim().split(' ')[0][0] || '';
  const e = etternavn.trim()[0] || '';
  return (f + e).toUpperCase();
}

function formatSistEndret(dato) {
  if (!dato) return '–';
  return new Date(dato).toLocaleString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SectionBox({ title, children, variant = 'default', icon }) {
  const variants = {
    default: { bg: '#F9FAFB', border: '#E5E7EB', color: '#13171F' },
    red: { bg: '#FCEBEB', border: '#F5C6C6', color: '#A32D2D' },
    yellow: { bg: '#FAEEDA', border: '#F0D9A8', color: '#854F0B' },
  };
  const v = variants[variant] || variants.default;

  return (
    <div style={{ ...styles.sectionBox, backgroundColor: v.bg, borderColor: v.border }}>
      {title && (
        <div style={styles.sectionTitle}>
          {icon}
          <span style={{ color: variant === 'default' ? '#13171F' : v.color }}>{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

function RedigerbartFelt({
  feltNavn,
  label,
  ikon,
  verdi,
  erAktiv,
  nyVerdi,
  sender,
  t,
  onStartRediger,
  onAvbryt,
  onNyVerdiChange,
  onSend,
}) {
  return (
    <div style={styles.kort}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <p style={styles.kortLabel}>{ikon} {label}</p>
        <IconPencil
          size={14}
          color="#6B7280"
          style={{ cursor: sender ? 'not-allowed' : 'pointer', flexShrink: 0, opacity: sender ? 0.4 : 1 }}
          onClick={() => !sender && onStartRediger(feltNavn, verdi)}
        />
      </div>

      {!erAktiv && <p style={styles.kortText}>{verdi || '–'}</p>}

      {erAktiv && (
        <div>
          <textarea
            style={styles.tekstfelt}
            value={nyVerdi}
            onChange={(e) => onNyVerdiChange(e.target.value)}
            rows={3}
            disabled={sender}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button type="button" style={styles.avbrytKnapp} onClick={onAvbryt} disabled={sender}>
              {t.avbryt}
            </button>
            <button type="button" style={styles.sendKnapp} onClick={() => onSend(feltNavn)} disabled={sender}>
              {sender ? t.sender : t.sendForslag}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Pasientkort() {
  const navigate = useNavigate();
  const location = useLocation();
  const { språk, t } = useSpråk();
  const pasient = location.state?.pasient;

  const [matprofil, setMatprofil] = useState(null);
  const [matprofilVisning, setMatprofilVisning] = useState(null);
  const [laster, setLaster] = useState(true);
  const [oversetterInnhold, setOversetterInnhold] = useState(false);
  const [feil, setFeil] = useState('');
  const [aktivtFelt, setAktivtFelt] = useState(null);
  const [nyVerdi, setNyVerdi] = useState('');
  const [sender, setSender] = useState(false);
  const [visToast, setVisToast] = useState(false);

  const oppdaterVisning = useCallback(async (mat, malSprak) => {
    if (malSprak === 'no') {
      setMatprofilVisning(mat);
      return;
    }

    setOversetterInnhold(true);
    try {
      const matV = await oversettProfil(mat, MAT_OVERSATT_FELTER, malSprak);
      setMatprofilVisning(matV);
    } catch {
      setMatprofilVisning(mat);
      setFeil(t.kunneIkkeOversette);
    } finally {
      setOversetterInnhold(false);
    }
  }, [t.kunneIkkeOversette]);

  useEffect(() => {
    if (!pasient?.id) {
      setLaster(false);
      setFeil('Ingen pasient valgt.');
      return undefined;
    }

    let avbrutt = false;

    async function lastProfiler() {
      setLaster(true);
      setFeil('');

      try {
        const mat = await hentMatprofil(pasient.id);
        if (!avbrutt) {
          setMatprofil(mat);
          if (!mat) {
            setFeil(t.manglerMatprofil);
          }
        }
      } catch {
        if (!avbrutt) {
          setFeil(t.kunneIkkeHenteProfil);
        }
      } finally {
        if (!avbrutt) {
          setLaster(false);
        }
      }
    }

    lastProfiler();

    return () => {
      avbrutt = true;
    };
  }, [pasient?.id, t.kunneIkkeHenteProfil, t.manglerMatprofil]);

  useEffect(() => {
    if (!matprofil) return undefined;
    let avbrutt = false;

    async function oppdaterVedSprakbytte() {
      await oppdaterVisning(matprofil, språk);
      if (avbrutt) return;
    }

    oppdaterVedSprakbytte();
    return () => { avbrutt = true; };
  }, [språk, matprofil, oppdaterVisning]);

  const hentOriginalVerdi = useCallback(
    (feltNavn) => {
      const cfg = FELT_KONFIG[feltNavn];
      if (!cfg) return '';
      return matprofil?.[cfg.felt] ?? '';
    },
    [matprofil]
  );

  const hentVisningsVerdi = useCallback(
    (feltNavn) => {
      const cfg = FELT_KONFIG[feltNavn];
      if (!cfg) return '';
      const profil = matprofilVisning ?? matprofil;
      return profil?.[cfg.felt] ?? '';
    },
    [matprofil, matprofilVisning]
  );

  const sistEndretTekst = formatSistEndret(matprofil?.sistEndret);

  const allergierListe = ((matprofilVisning ?? matprofil)?.allergier || '')
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);

  const sendForslag = async (feltNavn) => {
    const cfg = FELT_KONFIG[feltNavn];
    const gammel = hentOriginalVerdi(feltNavn);
    const ny = nyVerdi.trim();

    if (!ny || ny === gammel.trim()) {
      setAktivtFelt(null);
      return;
    }

    setSender(true);
    setFeil('');

    try {
      await sendEndringsforslag({
        pasientId: pasient.id,
        profilType: cfg.profilType,
        feltNavn: cfg.apiFelt,
        gammelVerdi: gammel,
        nyVerdi: ny,
        kildeSprak: språk,
        opprettetAvId: getAnsattId(),
      });
      setVisToast(true);
      setAktivtFelt(null);
      setTimeout(() => setVisToast(false), 3000);
    } catch {
      setFeil(t.kunneIkkeSendeForslag);
    } finally {
      setSender(false);
    }
  };

  if (!pasient) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="app-container">
          <p style={styles.feilTekst}>{t.ingenPasientValgt}</p>
          <button type="button" className="cc-btn-secondary" style={styles.suggestButton} onClick={() => navigate(-1)}>
            {t.tilbake}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-container">
        <div className="app-topbar">
          <button type="button" className="app-icon-btn" onClick={() => navigate(-1)} aria-label={t.tilbake}>
            <IconChevronLeft size={22} color="#0F172A" />
          </button>
          <span className="app-topbar-title">{t.pasientkort}</span>
          <div className="app-icon-btn" aria-hidden="true" />
        </div>

        <div className="app-profile-header">
          <div className="app-profile-avatar" style={{ backgroundColor: colors.link }}>
            {getInitials(pasient.fornavn, pasient.etternavn)}
          </div>
          <div>
            <h1 className="app-profile-name">
              {pasient.fornavn} {pasient.etternavn}
            </h1>
            <p style={styles.patientMeta}>
              {t.rom} {pasient.rom} · {t.langtidsplass}
            </p>
          </div>
        </div>

        <div style={styles.alertBadges}>
          {pasient.allergi && (
            <span style={styles.allergiBadge}>
              <IconAlertTriangle size={14} />
              {t.allergi}
            </span>
          )}
          {pasient.fortykning && (
            <span style={styles.warningBadge}>
              <IconGlass size={14} />
              {t.fortykning}
            </span>
          )}
          {pasient.dia && (
            <span style={styles.warningBadge}>{t.dia}</span>
          )}
        </div>

        {feil && <p style={styles.feilTekst}>{feil}</p>}
        {laster && <p style={styles.lasterTekst}>{t.laster}</p>}
        {oversetterInnhold && !laster && (
          <p style={styles.lasterTekst}>{t.oversetterInnhold}</p>
        )}

        {!laster && matprofil && (
              <div style={styles.tabContent}>
                {allergierListe.length > 0 && (
                  <SectionBox title={t.allergier} variant="red">
                    <ul style={styles.bulletList}>
                      {allergierListe.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </SectionBox>
                )}

                <RedigerbartFelt
                  feltNavn="fortykningsbehov"
                  label={t.fortykningsbehov}
                  ikon={null}
                  verdi={hentVisningsVerdi('fortykningsbehov')}
                  erAktiv={aktivtFelt === 'fortykningsbehov'}
                  nyVerdi={nyVerdi}
                  sender={sender}
                  t={t}
                  onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                  onAvbryt={() => setAktivtFelt(null)}
                  onNyVerdiChange={setNyVerdi}
                  onSend={sendForslag}
                />

                <div className="app-field-grid">
                  <RedigerbartFelt
                    feltNavn="kaffeTe"
                    label={t.kaffeTe}
                    ikon={null}
                    verdi={hentVisningsVerdi('kaffeTe')}
                    erAktiv={aktivtFelt === 'kaffeTe'}
                    nyVerdi={nyVerdi}
                    sender={sender}
                    t={t}
                    onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                    onAvbryt={() => setAktivtFelt(null)}
                    onNyVerdiChange={setNyVerdi}
                    onSend={sendForslag}
                  />
                  <RedigerbartFelt
                    feltNavn="drikke"
                    label={t.drikke}
                    ikon={null}
                    verdi={hentVisningsVerdi('drikke')}
                    erAktiv={aktivtFelt === 'drikke'}
                    nyVerdi={nyVerdi}
                    sender={sender}
                    t={t}
                    onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                    onAvbryt={() => setAktivtFelt(null)}
                    onNyVerdiChange={setNyVerdi}
                    onSend={sendForslag}
                  />
                </div>

                <RedigerbartFelt
                  feltNavn="frokost"
                  label={t.frokost}
                  ikon={null}
                  verdi={hentVisningsVerdi('frokost')}
                  erAktiv={aktivtFelt === 'frokost'}
                  nyVerdi={nyVerdi}
                  sender={sender}
                  t={t}
                  onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                  onAvbryt={() => setAktivtFelt(null)}
                  onNyVerdiChange={setNyVerdi}
                  onSend={sendForslag}
                />

                <RedigerbartFelt
                  feltNavn="kveldsmat"
                  label={t.kveldsmat}
                  ikon={<IconMoon size={14} color="#6B7280" />}
                  verdi={hentVisningsVerdi('kveldsmat')}
                  erAktiv={aktivtFelt === 'kveldsmat'}
                  nyVerdi={nyVerdi}
                  sender={sender}
                  t={t}
                  onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                  onAvbryt={() => setAktivtFelt(null)}
                  onNyVerdiChange={setNyVerdi}
                  onSend={sendForslag}
                />

                <div className="app-field-grid">
                  <RedigerbartFelt
                    feltNavn="konsistensMat"
                    label={t.konsistensMat}
                    ikon={null}
                    verdi={hentVisningsVerdi('konsistensMat')}
                    erAktiv={aktivtFelt === 'konsistensMat'}
                    nyVerdi={nyVerdi}
                    sender={sender}
                    t={t}
                    onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                    onAvbryt={() => setAktivtFelt(null)}
                    onNyVerdiChange={setNyVerdi}
                    onSend={sendForslag}
                  />
                  <RedigerbartFelt
                    feltNavn="hvorSpiser"
                    label={t.hvorSpiser}
                    ikon={null}
                    verdi={hentVisningsVerdi('hvorSpiser')}
                    erAktiv={aktivtFelt === 'hvorSpiser'}
                    nyVerdi={nyVerdi}
                    sender={sender}
                    t={t}
                    onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                    onAvbryt={() => setAktivtFelt(null)}
                    onNyVerdiChange={setNyVerdi}
                    onSend={sendForslag}
                  />
                </div>

                <RedigerbartFelt
                  feltNavn="redskap"
                  label={t.redskap}
                  ikon={<IconToolsKitchen2 size={14} color="#6B7280" />}
                  verdi={hentVisningsVerdi('redskap')}
                  erAktiv={aktivtFelt === 'redskap'}
                  nyVerdi={nyVerdi}
                  sender={sender}
                  t={t}
                  onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                  onAvbryt={() => setAktivtFelt(null)}
                  onNyVerdiChange={setNyVerdi}
                  onSend={sendForslag}
                />

                <RedigerbartFelt
                  feltNavn="likerIkke"
                  label={t.likerIkke}
                  ikon={<IconX size={14} color="#6B7280" />}
                  verdi={hentVisningsVerdi('likerIkke')}
                  erAktiv={aktivtFelt === 'likerIkke'}
                  nyVerdi={nyVerdi}
                  sender={sender}
                  t={t}
                  onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                  onAvbryt={() => setAktivtFelt(null)}
                  onNyVerdiChange={setNyVerdi}
                  onSend={sendForslag}
                />

                <div style={styles.lastChanged}>
                  <IconClock size={14} color="#6B7280" />
                  <span>{t.sistEndret}: {sistEndretTekst}</span>
                </div>
              </div>
        )}

        {!laster && !matprofil && !feil && (
          <p style={styles.feilTekst}>{t.manglerMatprofil}</p>
        )}

        {visToast && (
          <div style={styles.toast}>
            {t.forslagSendt}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: spacing.xs,
    display: 'flex',
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  topbarTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: colors.text,
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: colors.link,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 17,
    fontWeight: 700,
    flexShrink: 0,
  },
  patientName: {
    fontSize: 22,
    fontWeight: 700,
    color: colors.text,
    margin: 0,
    lineHeight: 1.3,
  },
  patientMeta: {
    fontSize: 15,
    color: colors.textMuted,
    margin: `${spacing.xs}px 0 0`,
  },
  alertBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  allergiBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: radii.sm,
    backgroundColor: colors.alertRedBg,
    color: colors.alertRedText,
    border: '1px solid #F5C6C6',
  },
  warningBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 13,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: radii.sm,
    backgroundColor: colors.alertYellowBg,
    color: colors.alertYellowText,
    border: '1px solid #F0D9A8',
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: colors.borderLight,
    borderRadius: radii.md,
    padding: 5,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    padding: `${spacing.sm}px ${spacing.md}px`,
    border: 'none',
    borderRadius: radii.sm,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: colors.textMuted,
    fontFamily: typography.fontFamily,
  },
  tabActive: {
    backgroundColor: colors.surface,
    color: colors.link,
    boxShadow: shadows.sm,
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  sectionBox: {
    padding: `${spacing.lg}px ${spacing.lg}px`,
    borderRadius: radii.lg,
    border: '1px solid',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontSize: 15,
    fontWeight: 600,
    marginBottom: spacing.sm,
  },
  bulletList: {
    margin: 0,
    paddingLeft: 20,
    fontSize: 15,
    lineHeight: 1.65,
    color: colors.alertRedText,
  },
  lastChanged: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  suggestButton: {
    width: '100%',
    padding: `${spacing.md}px ${spacing.lg}px`,
    fontSize: 16,
    fontWeight: 600,
    color: colors.link,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.link}`,
    borderRadius: radii.md,
    cursor: 'pointer',
    fontFamily: typography.fontFamily,
    marginTop: spacing.sm,
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
  },
  kort: {
    ...card,
    padding: `${spacing.lg}px ${spacing.lg}px`,
    boxShadow: 'none',
  },
  kortLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.textMuted,
    margin: 0,
    letterSpacing: '0.02em',
  },
  kortText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.6,
    color: colors.text,
  },
  tekstfelt: {
    width: '100%',
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderRadius: radii.md,
    border: `1px solid ${colors.link}`,
    fontSize: 15,
    color: colors.text,
    fontFamily: typography.fontFamily,
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box',
    background: colors.surfaceSoft,
    lineHeight: 1.5,
  },
  avbrytKnapp: {
    flex: 1,
    padding: `${spacing.sm}px`,
    borderRadius: radii.md,
    border: `1px solid ${colors.border}`,
    background: colors.surfaceSoft,
    fontSize: 14,
    fontWeight: 500,
    color: colors.textMuted,
    cursor: 'pointer',
    fontFamily: typography.fontFamily,
  },
  sendKnapp: {
    flex: 2,
    padding: `${spacing.sm}px`,
    borderRadius: radii.md,
    border: 'none',
    background: colors.link,
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
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
  feilTekst: {
    color: colors.alertRedText,
    fontSize: 15,
    marginBottom: spacing.md,
    lineHeight: 1.5,
  },
  lasterTekst: {
    color: colors.textMuted,
    fontSize: 15,
    marginBottom: spacing.md,
  },
};

export default Pasientkort;
