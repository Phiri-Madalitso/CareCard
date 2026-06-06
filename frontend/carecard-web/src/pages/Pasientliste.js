import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconChevronLeft, IconSearch } from '@tabler/icons-react';
import Navbar from '../components/Navbar';
import { useSpråk } from '../hooks/useSprak';
import { hentPasienter } from '../services/pasientService';
import {
  colors,
  spacing,
  radii,
} from '../styles/theme';

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
      <div className="app-shell">
        <Navbar />
        <div className="app-container">
          <p style={styles.statusText}>Laster pasienter...</p>
        </div>
      </div>
    );
  }

  if (feil) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="app-container">
          <p style={styles.errorText}>{feil}</p>
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
          <span className="app-topbar-title">{avdeling.navn}</span>
          <div className="app-icon-btn" aria-hidden="true" />
        </div>

        <div className="app-page-title-row">
          <h1 className="app-page-title">{t.pasienter}</h1>
          <span className="app-page-subtitle">{avdeling.enhetsnummer}</span>
        </div>

        <div className="app-search-wrap">
          <IconSearch size={18} color="#64748B" className="app-search-icon" />
          <input
            type="text"
            placeholder={t.søkPåNavn}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cc-input app-search-input"
          />
        </div>

        <div className="app-filter-row">
          {filters.map((f) => {
            const dotColor =
              f.key === 'allergi' ? '#A32D2D' :
              f.key === 'dia' || f.key === 'fortykning' ? '#854F0B' :
              '#2E6BFF';
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                className="app-filter-btn cc-filter-btn"
                style={{
                  backgroundColor: isActive ? '#0D2B52' : '#FFFFFF',
                  color: isActive ? '#fff' : '#0F172A',
                  border: isActive ? '1px solid #0D2B52' : '1px solid #E2E8F0',
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

        <div className="app-card-grid-2">
          {filtered.map((p, index) => (
            <button
              key={p.id}
              type="button"
              className="app-patient-card cc-card-hover"
              onClick={() => navigate(`/pasient/${p.id}`, { state: { pasient: p, avdeling } })}
            >
              <div
                className="app-patient-list-avatar"
                style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
              >
                {getInitials(p.fornavn, p.etternavn)}
              </div>
              <div style={styles.patientInfo}>
                <span style={styles.patientName}>{p.fornavn} {p.etternavn}</span>
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
    </div>
  );
}

const styles = {
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  patientInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    flex: 1,
    minWidth: 0,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    lineHeight: 1.35,
  },
  patientRoom: {
    fontSize: 14,
    color: colors.textMuted,
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  allergiBadge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: radii.sm,
    backgroundColor: colors.alertRedBg,
    color: colors.alertRedText,
  },
  warningBadge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: radii.sm,
    backgroundColor: colors.alertYellowBg,
    color: colors.alertYellowText,
  },
  countText: {
    marginTop: spacing.lg,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  statusText: {
    marginTop: spacing.xxl,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorText: {
    marginTop: spacing.xxl,
    fontSize: 16,
    color: colors.alertRedText,
    textAlign: 'center',
    lineHeight: 1.6,
  },
};

export default Pasientliste;
