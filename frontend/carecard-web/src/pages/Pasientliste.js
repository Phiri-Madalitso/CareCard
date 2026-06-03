import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconChevronLeft, IconSearch } from '@tabler/icons-react';
import Navbar from '../components/Navbar';
import { useSpråk } from '../hooks/useSprak';
import { hentPasienter } from '../services/pasientService';

const AVATAR_COLORS = ['#185FA5', '#0F6E56', '#993556', '#534AB7', '#854F0B'];

function getInitials(fornavn, etternavn) {
  const f = fornavn.trim().split(' ')[0][0] || '';
  const e = etternavn.trim()[0] || '';
  return (f + e).toUpperCase();
}

function Pasientliste() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useSpråk();
  const avdeling = location.state?.avdeling || { id: 1, navn: 'Langtidsavdeling', enhetsnummer: 'Avdeling 1' };

  const filters = [
    { key: 'alle', label: t.alle },
    { key: 'allergi', label: t.allergi },
    { key: 'dia', label: t.dia },
    { key: 'fortykning', label: t.fortykning },
  ];

  const [pasienter, setPasienter] = useState([]);
  const [laster, setLaster] = useState(true);
  const [feil, setFeil] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('alle');

  useEffect(() => {
    let avbrutt = false;

    async function lastPasienter() {
      setLaster(true);
      setFeil('');

      try {
        const data = await hentPasienter(avdeling.id);
        if (!avbrutt) {
          setPasienter(data);
        }
      } catch {
        if (!avbrutt) {
          setFeil('Kunne ikke hente pasienter. Sjekk at API-et kjører (F5 i Visual Studio).');
        }
      } finally {
        if (!avbrutt) {
          setLaster(false);
        }
      }
    }

    lastPasienter();

    return () => {
      avbrutt = true;
    };
  }, [avdeling.id]);

  const filterCounts = useMemo(() => ({
    alle: pasienter.length,
    allergi: pasienter.filter((p) => p.allergi).length,
    dia: pasienter.filter((p) => p.dia).length,
    fortykning: pasienter.filter((p) => p.fortykning).length,
  }), [pasienter]);

  const filtered = useMemo(() => {
    let list = pasienter;

    if (activeFilter === 'allergi') list = list.filter((p) => p.allergi);
    else if (activeFilter === 'dia') list = list.filter((p) => p.dia);
    else if (activeFilter === 'fortykning') list = list.filter((p) => p.fortykning);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.fornavn.toLowerCase().includes(q) ||
          p.etternavn.toLowerCase().includes(q) ||
          `${p.fornavn} ${p.etternavn}`.toLowerCase().includes(q)
      );
    }

    return list;
  }, [search, activeFilter, pasienter]);

  if (laster) {
    return (
      <>
        <Navbar />
        <div style={styles.page}>
          <p style={styles.statusText}>Laster pasienter...</p>
        </div>
      </>
    );
  }

  if (feil) {
    return (
      <>
        <Navbar />
        <div style={styles.page}>
          <p style={styles.errorText}>{feil}</p>
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
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          <IconChevronLeft size={22} color="#13171F" />
        </button>
        <span style={styles.topbarTitle}>{avdeling.navn}</span>
        <div style={{ width: 22 }} />
      </div>

      <div style={styles.titleRow}>
        <h1 style={styles.title}>{t.pasienter}</h1>
        <span style={styles.subtitle}>{avdeling.enhetsnummer}</span>
      </div>

      <div style={styles.searchWrapper}>
        <IconSearch size={18} color="#6B7280" style={styles.searchIcon} />
        <input
          type="text"
          placeholder={t.søkPåNavn}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.filterRow}>
        {filters.map((f) => {
          const dotColor =
            f.key === 'allergi' ? '#A32D2D' :
            f.key === 'dia' || f.key === 'fortykning' ? '#854F0B' :
            '#185FA5';
          const isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              style={{
                ...styles.filterButton,
                backgroundColor: isActive ? '#13171F' : '#F9FAFB',
                color: isActive ? '#fff' : '#13171F',
                border: isActive ? '1px solid #13171F' : '1px solid #E5E7EB',
              }}
              onClick={() => setActiveFilter(f.key)}
            >
              <span
                style={{
                  ...styles.filterDot,
                  backgroundColor: isActive ? '#fff' : dotColor,
                }}
              />
              {f.label} {filterCounts[f.key]}
            </button>
          );
        })}
      </div>

      <div style={styles.patientList}>
        {filtered.map((p, index) => (
          <button
            key={p.id}
            style={styles.patientCard}
            onClick={() => navigate(`/pasient/${p.id}`, { state: { pasient: p, avdeling } })}
          >
            <div
              style={{
                ...styles.patientAvatar,
                backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
              }}
            >
              {getInitials(p.fornavn, p.etternavn)}
            </div>
            <div style={styles.patientInfo}>
              <span style={styles.patientName}>
                {p.fornavn} {p.etternavn}
              </span>
              <span style={styles.patientRoom}>{t.rom} {p.rom}</span>
              <div style={styles.badgeRow}>
                {p.allergi && <span style={styles.allergiBadge}>{t.allergi}</span>}
                {p.dia && <span style={styles.warningBadge}>{t.dia}</span>}
                {p.fortykning && <span style={styles.warningBadge}>{t.fortykning}</span>}
              </div>
            </div>
          </button>
        ))}
      </div>

        <p style={styles.countText}>
          {filtered.length} {t.aktivePasienter}
        </p>
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
  backButton: {
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
  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#13171F',
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  searchWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    fontSize: 15,
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    color: '#13171F',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
    boxSizing: 'border-box',
    outline: 'none',
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  patientList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  patientCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: '14px 16px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
  },
  patientInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#13171F',
  },
  patientRoom: {
    fontSize: 13,
    color: '#6B7280',
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  allergiBadge: {
    fontSize: 12,
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: 4,
    backgroundColor: '#FCEBEB',
    color: '#A32D2D',
  },
  warningBadge: {
    fontSize: 12,
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: 4,
    backgroundColor: '#FAEEDA',
    color: '#854F0B',
  },
  countText: {
    marginTop: 20,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  statusText: {
    marginTop: 40,
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 40,
    fontSize: 15,
    color: '#A32D2D',
    textAlign: 'center',
    lineHeight: 1.5,
  },
};

export default Pasientliste;
