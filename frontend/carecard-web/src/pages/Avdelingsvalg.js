import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChevronRight } from '@tabler/icons-react';

const AVDELINGER = [
  { id: 1, navn: 'Langtidsavdeling', enhetsnummer: 'Avdeling 1' },
  { id: 2, navn: 'Korttidsavdeling', enhetsnummer: 'Avdeling 2' },
  { id: 3, navn: 'Skjermet', enhetsnummer: 'Avdeling 3' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'God morgen';
  if (hour >= 12 && hour < 18) return 'God dag';
  return 'God kveld';
}

function formatDate() {
  const date = new Date();
  const formatted = date.toLocaleDateString('nb-NO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function Avdelingsvalg() {
  const navigate = useNavigate();

  const handleLoggUt = () => {
    localStorage.removeItem('innlogget');
    navigate('/');
  };

  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      <header style={styles.header}>
        <div>
          <p style={styles.greeting}>{getGreeting()},</p>
          <h1 style={styles.name}>Madalitso 👋</h1>
          <p style={styles.date}>{formatDate()}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleLoggUt} style={styles.loggUtKnapp}>
            Logg ut
          </button>
          <div style={styles.avatar}>MS</div>
        </div>
      </header>

      <h2 style={styles.question}>Hvilken avdeling jobber du på i dag?</h2>

      <div style={styles.cardList}>
        {AVDELINGER.map((avdeling) => (
          <button
            key={avdeling.id}
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
  );
}

const styles = {
  page: {
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
    maxWidth: 480,
    margin: '0 auto',
    padding: '48px 24px 24px',
    minHeight: '100vh',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: '#6B7280',
    margin: 0,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: '#13171F',
    margin: '4px 0 6px',
  },
  date: {
    fontSize: 14,
    color: '#999',
    margin: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: '#207383',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  question: {
    fontSize: 18,
    fontWeight: 600,
    color: '#13171F',
    marginBottom: 20,
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 18px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#185FA5',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  loggUtKnapp: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#A32D2D',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
};

export default Avdelingsvalg;
