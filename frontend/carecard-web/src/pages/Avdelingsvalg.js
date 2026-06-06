import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChevronRight, IconLogout } from '@tabler/icons-react';
import Navbar from '../components/Navbar';
import { useSpråk, getHilsenKey, formatDato, getInitialer } from '../hooks/useSprak';
import { loggUt } from '../services/authService';
import {
  colors,
  spacing,
  typography,
  pageShell,
  pageContent,
  cardInteractive,
  radii,
  sectionTitle,
} from '../styles/theme';

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

  const handleLoggUt = () => {
    loggUt();
    navigate('/');
  };

  return (
    <div style={pageShell}>
      <Navbar />
      <div style={styles.page}>
        <header style={styles.header}>
          <div>
            <p style={styles.greeting}>{t[getHilsenKey()]},</p>
            <h1 style={styles.name}>{fornavn} 👋</h1>
            <p style={styles.date}>{formatDato(locale)}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button" onClick={handleLoggUt} style={styles.loggUtKnapp}>
              <IconLogout size={22} stroke={1.75} color="#13171F" />
              <span>{t.loggUt}</span>
            </button>
            <div style={styles.avatar}>{getInitialer(brukerNavn)}</div>
          </div>
        </header>

        <h2 style={styles.question}>{t.hvilkenAvdeling}</h2>

        <div style={styles.cardList}>
          {AVDELINGER.map((avdeling) => (
            <button
              key={avdeling.id}
              type="button"
              className="cc-card-hover"
              style={styles.card}
              onClick={() => navigate('/pasienter', { state: { avdeling } })}
            >
              <div style={styles.cardContent}>
                <span style={styles.cardTitle}>{avdeling.navn}</span>
                <span style={styles.cardSubtitle}>{avdeling.enhetsnummer}</span>
              </div>
              <IconChevronRight size={20} color="#6B7280" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    ...pageContent,
    paddingTop: spacing.xl,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: 15,
    color: colors.textMuted,
    margin: 0,
  },
  name: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.text,
    margin: `${spacing.xs}px 0 ${spacing.sm}px`,
    lineHeight: 1.25,
  },
  date: {
    fontSize: 14,
    color: colors.textSubtle,
    margin: 0,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    backgroundColor: colors.primary,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 700,
    flexShrink: 0,
  },
  question: {
    ...sectionTitle,
    marginBottom: spacing.lg,
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  card: {
    ...cardInteractive,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.lg}px ${spacing.lg}px`,
    textAlign: 'left',
    width: '100%',
    fontFamily: typography.fontFamily,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 600,
    color: colors.link,
    lineHeight: 1.4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  loggUtKnapp: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.xs,
    fontSize: 13,
    fontWeight: 600,
    color: colors.text,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: `${spacing.xs}px ${spacing.sm}px`,
    fontFamily: typography.fontFamily,
    borderRadius: radii.md,
  },
};

export default Avdelingsvalg;
