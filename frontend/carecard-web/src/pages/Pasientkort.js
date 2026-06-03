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
  hentStellprofil,
  sendEndringsforslag,
} from '../services/profilService';
import { getAnsattId } from '../services/apiClient';

const FELT_KONFIG = {
  fortykningsbehov: { profilType: 'Matprofil', apiFelt: 'KonsistensDrikke', kilde: 'mat', felt: 'konsistensDrikke' },
  kaffeTe: { profilType: 'Matprofil', apiFelt: 'KaffeTe', kilde: 'mat', felt: 'kaffeTe' },
  drikke: { profilType: 'Matprofil', apiFelt: 'Drikke', kilde: 'mat', felt: 'drikke' },
  frokost: { profilType: 'Matprofil', apiFelt: 'Frokost', kilde: 'mat', felt: 'frokost' },
  kveldsmat: { profilType: 'Matprofil', apiFelt: 'Kvelds', kilde: 'mat', felt: 'kvelds' },
  konsistensMat: { profilType: 'Matprofil', apiFelt: 'KonsistensMat', kilde: 'mat', felt: 'konsistensMat' },
  hvorSpiser: { profilType: 'Matprofil', apiFelt: 'HvorSpiser', kilde: 'mat', felt: 'hvorSpiser' },
  redskap: { profilType: 'Matprofil', apiFelt: 'Redskap', kilde: 'mat', felt: 'redskap' },
  likerIkke: { profilType: 'Matprofil', apiFelt: 'Misliker', kilde: 'mat', felt: 'misliker' },
  stellpreferanser: { profilType: 'Stellprofil', apiFelt: 'StellPreferanser', kilde: 'stell', felt: 'stellPreferanser' },
  kommunikasjonsbehov: { profilType: 'Stellprofil', apiFelt: 'Kommunikasjon', kilde: 'stell', felt: 'kommunikasjon' },
  viktigeHensyn: { profilType: 'Stellprofil', apiFelt: 'ViktigeHensyn', kilde: 'stell', felt: 'viktigeHensyn' },
  rutiner: { profilType: 'Stellprofil', apiFelt: 'Rutiner', kilde: 'stell', felt: 'rutiner' },
};

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
  const { t } = useSpråk();
  const pasient = location.state?.pasient;

  const [activeTab, setActiveTab] = useState('matprofil');
  const [matprofil, setMatprofil] = useState(null);
  const [stellprofil, setStellprofil] = useState(null);
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState('');
  const [aktivtFelt, setAktivtFelt] = useState(null);
  const [nyVerdi, setNyVerdi] = useState('');
  const [sender, setSender] = useState(false);
  const [visToast, setVisToast] = useState(false);

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
        const [mat, stell] = await Promise.all([
          hentMatprofil(pasient.id),
          hentStellprofil(pasient.id),
        ]);
        if (!avbrutt) {
          setMatprofil(mat);
          setStellprofil(stell);
          if (!mat && !stell) {
            setFeil(t.ingenProfilData);
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
  }, [pasient?.id, t.kunneIkkeHenteProfil, t.ingenProfilData]);

  const hentVerdi = useCallback(
    (feltNavn) => {
      const cfg = FELT_KONFIG[feltNavn];
      if (!cfg) return '';
      const profil = cfg.kilde === 'mat' ? matprofil : stellprofil;
      return profil?.[cfg.felt] ?? '';
    },
    [matprofil, stellprofil]
  );

  const sistEndretTekst = formatSistEndret(
    activeTab === 'matprofil' ? matprofil?.sistEndret : stellprofil?.sistEndret
  );

  const allergierListe = (matprofil?.allergier || '')
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);

  const sendForslag = async (feltNavn) => {
    const cfg = FELT_KONFIG[feltNavn];
    const gammel = hentVerdi(feltNavn);
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
      <>
        <Navbar />
        <div style={styles.page}>
          <p style={styles.feilTekst}>{t.ingenPasientValgt}</p>
          <button type="button" style={styles.suggestButton} onClick={() => navigate(-1)}>
            {t.tilbake}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
          rel="stylesheet"
        />

        <div style={styles.topbar}>
          <button style={styles.iconButton} onClick={() => navigate(-1)}>
            <IconChevronLeft size={22} color="#13171F" />
          </button>
          <span style={styles.topbarTitle}>{t.pasientkort}</span>
          <div style={{ width: 22 }} />
        </div>

        <div style={styles.profileHeader}>
          <div style={styles.avatar}>
            {getInitials(pasient.fornavn, pasient.etternavn)}
          </div>
          <div>
            <h1 style={styles.patientName}>
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

        {!laster && (
          <>
            <div style={styles.tabContainer}>
              <button
                type="button"
                style={{ ...styles.tab, ...(activeTab === 'matprofil' ? styles.tabActive : {}) }}
                onClick={() => setActiveTab('matprofil')}
              >
                {t.matprofil}
              </button>
              <button
                type="button"
                style={{ ...styles.tab, ...(activeTab === 'stellprofil' ? styles.tabActive : {}) }}
                onClick={() => setActiveTab('stellprofil')}
              >
                {t.stellprofil}
              </button>
            </div>

            {activeTab === 'matprofil' && matprofil && (
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
                  verdi={hentVerdi('fortykningsbehov')}
                  erAktiv={aktivtFelt === 'fortykningsbehov'}
                  nyVerdi={nyVerdi}
                  sender={sender}
                  t={t}
                  onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                  onAvbryt={() => setAktivtFelt(null)}
                  onNyVerdiChange={setNyVerdi}
                  onSend={sendForslag}
                />

                <div style={styles.grid}>
                  <RedigerbartFelt
                    feltNavn="kaffeTe"
                    label={t.kaffeTe}
                    ikon={null}
                    verdi={hentVerdi('kaffeTe')}
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
                    verdi={hentVerdi('drikke')}
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
                  verdi={hentVerdi('frokost')}
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
                  verdi={hentVerdi('kveldsmat')}
                  erAktiv={aktivtFelt === 'kveldsmat'}
                  nyVerdi={nyVerdi}
                  sender={sender}
                  t={t}
                  onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                  onAvbryt={() => setAktivtFelt(null)}
                  onNyVerdiChange={setNyVerdi}
                  onSend={sendForslag}
                />

                <div style={styles.grid}>
                  <RedigerbartFelt
                    feltNavn="konsistensMat"
                    label={t.konsistensMat}
                    ikon={null}
                    verdi={hentVerdi('konsistensMat')}
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
                    verdi={hentVerdi('hvorSpiser')}
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
                  verdi={hentVerdi('redskap')}
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
                  verdi={hentVerdi('likerIkke')}
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

            {activeTab === 'matprofil' && !matprofil && !laster && (
              <p style={styles.feilTekst}>{t.manglerMatprofil}</p>
            )}

            {activeTab === 'stellprofil' && stellprofil && (
              <div style={styles.tabContent}>
                <RedigerbartFelt
                  feltNavn="stellpreferanser"
                  label={t.stellpreferanser}
                  ikon={null}
                  verdi={hentVerdi('stellpreferanser')}
                  erAktiv={aktivtFelt === 'stellpreferanser'}
                  nyVerdi={nyVerdi}
                  sender={sender}
                  t={t}
                  onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                  onAvbryt={() => setAktivtFelt(null)}
                  onNyVerdiChange={setNyVerdi}
                  onSend={sendForslag}
                />
                <RedigerbartFelt
                  feltNavn="kommunikasjonsbehov"
                  label={t.kommunikasjonsbehov}
                  ikon={null}
                  verdi={hentVerdi('kommunikasjonsbehov')}
                  erAktiv={aktivtFelt === 'kommunikasjonsbehov'}
                  nyVerdi={nyVerdi}
                  sender={sender}
                  t={t}
                  onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                  onAvbryt={() => setAktivtFelt(null)}
                  onNyVerdiChange={setNyVerdi}
                  onSend={sendForslag}
                />
                <RedigerbartFelt
                  feltNavn="viktigeHensyn"
                  label={t.viktigeHensyn}
                  ikon={null}
                  verdi={hentVerdi('viktigeHensyn')}
                  erAktiv={aktivtFelt === 'viktigeHensyn'}
                  nyVerdi={nyVerdi}
                  sender={sender}
                  t={t}
                  onStartRediger={(felt, verdi) => { setAktivtFelt(felt); setNyVerdi(verdi); }}
                  onAvbryt={() => setAktivtFelt(null)}
                  onNyVerdiChange={setNyVerdi}
                  onSend={sendForslag}
                />
                <RedigerbartFelt
                  feltNavn="rutiner"
                  label={t.rutiner}
                  ikon={null}
                  verdi={hentVerdi('rutiner')}
                  erAktiv={aktivtFelt === 'rutiner'}
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

            {activeTab === 'stellprofil' && !stellprofil && !laster && (
              <p style={styles.feilTekst}>{t.manglerStellprofil}</p>
            )}
          </>
        )}

        {visToast && (
          <div style={styles.toast}>
            {t.forslagSendt}
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  page: {
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
    maxWidth: 480,
    margin: '0 auto',
    padding: '24px 24px 24px',
    minHeight: '100vh',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  topbarTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#13171F',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    backgroundColor: '#185FA5',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 700,
    flexShrink: 0,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 700,
    color: '#13171F',
    margin: 0,
  },
  patientMeta: {
    fontSize: 14,
    color: '#6B7280',
    margin: '4px 0 0',
  },
  alertBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  allergiBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 500,
    padding: '4px 10px',
    borderRadius: 6,
    backgroundColor: '#FCEBEB',
    color: '#A32D2D',
    border: '1px solid #F5C6C6',
  },
  warningBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 500,
    padding: '4px 10px',
    borderRadius: 6,
    backgroundColor: '#FAEEDA',
    color: '#854F0B',
    border: '1px solid #F0D9A8',
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#6B7280',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
  },
  tabActive: {
    backgroundColor: '#fff',
    color: '#185FA5',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  sectionBox: {
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
  },
  bulletList: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 14,
    lineHeight: 1.6,
    color: '#A32D2D',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  lastChanged: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  },
  suggestButton: {
    width: '100%',
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 600,
    color: '#185FA5',
    backgroundColor: '#fff',
    border: '1px solid #185FA5',
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
    marginTop: 4,
  },
  kort: {
    padding: '14px 16px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
  },
  kortLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#6B7280',
    margin: 0,
  },
  kortText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.5,
    color: '#13171F',
  },
  tekstfelt: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #185FA5',
    fontSize: '14px',
    color: '#13171F',
    fontFamily: 'Manrope, sans-serif',
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box',
    background: '#F9FAFB',
  },
  avbrytKnapp: {
    flex: 1,
    padding: '8px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    fontSize: '13px',
    fontWeight: '500',
    color: '#6B7280',
    cursor: 'pointer',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
  },
  sendKnapp: {
    flex: 2,
    padding: '8px',
    borderRadius: '10px',
    border: 'none',
    background: '#185FA5',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
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
  feilTekst: {
    color: '#A32D2D',
    fontSize: 14,
    marginBottom: 12,
  },
  lasterTekst: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 12,
  },
};

export default Pasientkort;
