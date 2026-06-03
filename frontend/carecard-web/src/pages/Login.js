import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconMail, IconLock, IconEye, IconEyeOff, IconAlertCircle, IconChevronDown } from '@tabler/icons-react';
import CareCardLogo from '../components/CareCardLogo';
import { useSpråk } from '../hooks/useSprak';
import { loggInn } from '../services/authService';

const MAX_FORSOK = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

const SPRÅK_ALTERNATIVER = [
  { value: 'no', flagKode: 'no', navn: 'Norsk' },
  { value: 'en', flagKode: 'gb', navn: 'English' },
  { value: 'es', flagKode: 'es', navn: 'Español' },
  { value: 'pl', flagKode: 'pl', navn: 'Polski' },
  { value: 'pt', flagKode: 'br', navn: 'Português (BR)' },
];

function SpråkFlagg({ kode }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${kode}.png`}
      alt=""
      width={20}
      height={15}
      style={styles.språkFlaggImg}
    />
  );
}

const colors = {
  teal: '#207383',
  text: '#13171F',
  textMuted: '#5A6473',
  border: '#E6E8EC',
  surfaceSoft: '#FAFAFB',
  alertRedBg: '#FCEBEB',
  alertRedText: '#A32D2D',
};

function Login() {
  const navigate = useNavigate();
  const { språk, setSpråk, t } = useSpråk();
  const [epost, setEpost] = useState('');
  const [passord, setPassord] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feilMelding, setFeilMelding] = useState('');
  const [feilEkstra, setFeilEkstra] = useState('');
  const [forsok, setForsok] = useState(0);
  const [lastet, setLastet] = useState(false);
  const [loggerInn, setLoggerInn] = useState(false);
  const [språkMenyÅpen, setSpråkMenyÅpen] = useState(false);
  const lockTimerRef = useRef(null);
  const språkMenyRef = useRef(null);

  const valgtSpråk = SPRÅK_ALTERNATIVER.find((s) => s.value === språk) || SPRÅK_ALTERNATIVER[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (språkMenyRef.current && !språkMenyRef.current.contains(e.target)) {
        setSpråkMenyÅpen(false);
      }
    };
    if (språkMenyÅpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [språkMenyÅpen]);

  const clearFeil = () => {
    setFeilMelding('');
    setFeilEkstra('');
  };

  const handleEpostChange = (e) => {
    setEpost(e.target.value);
    if (feilMelding) clearFeil();
  };

  const handlePassordChange = (e) => {
    setPassord(e.target.value);
    if (feilMelding) clearFeil();
  };

  const handleLogin = async () => {
    if (lastet || loggerInn) return;

    if (!epost.trim() || !passord) {
      setFeilMelding('fyllInn');
      setFeilEkstra('');
      return;
    }

    setLoggerInn(true);
    clearFeil();

    try {
      const data = await loggInn(epost.trim(), passord);
      localStorage.setItem('token', data.token);
      localStorage.setItem('rolle', data.rolle);
      localStorage.setItem('navn', data.navn);
      localStorage.setItem('ansattId', String(data.ansattId));
      setForsok(0);
      navigate('/avdelingsvalg');
    } catch {
      const nyttForsok = forsok + 1;
      setForsok(nyttForsok);

      if (nyttForsok >= MAX_FORSOK) {
        setLastet(true);
        setFeilMelding('kontoLåstMelding');
        setFeilEkstra('');
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => {
          setLastet(false);
          setForsok(0);
          clearFeil();
        }, LOCK_DURATION_MS);
      } else {
        setFeilMelding('feilEpostPassord');
        setFeilEkstra(` (${nyttForsok}/${MAX_FORSOK})`);
      }
    } finally {
      setLoggerInn(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <div style={styles.språkRad} ref={språkMenyRef}>
        <button
          type="button"
          style={styles.språkKnapp}
          onClick={() => setSpråkMenyÅpen(!språkMenyÅpen)}
          aria-expanded={språkMenyÅpen}
          aria-haspopup="listbox"
        >
          <SpråkFlagg kode={valgtSpråk.flagKode} />
          <span>{valgtSpråk.navn}</span>
          <IconChevronDown size={16} color="#6B7280" />
        </button>
        {språkMenyÅpen && (
          <div style={styles.språkMeny} role="listbox">
            {SPRÅK_ALTERNATIVER.map((s) => (
              <button
                key={s.value}
                type="button"
                role="option"
                aria-selected={språk === s.value}
                style={{
                  ...styles.språkMenyValg,
                  ...(språk === s.value ? styles.språkMenyValgAktiv : {}),
                }}
                onClick={() => {
                  setSpråk(s.value);
                  setSpråkMenyÅpen(false);
                }}
              >
                <SpråkFlagg kode={s.flagKode} />
                <span>{s.navn}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={styles.logoSection}>
        <CareCardLogo size="lg" />
        <p style={styles.tagline}>{t.tagline}</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {feilMelding && t[feilMelding] && (
          <div style={styles.errorBox}>
            <IconAlertCircle size={18} color={colors.alertRedText} style={{ flexShrink: 0 }} />
            <span>{t[feilMelding]}{feilEkstra}</span>
          </div>
        )}

        <div style={styles.fieldGroup}>
          <label style={styles.label}>{t.epost}</label>
          <div style={styles.inputWrapper}>
            <IconMail size={18} color={colors.textMuted} style={styles.inputIcon} />
            <input
              type="email"
              value={epost}
              onChange={handleEpostChange}
              placeholder={t.epost}
              style={styles.input}
              disabled={lastet}
            />
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>{t.passord}</label>
          <div style={styles.inputWrapper}>
            <IconLock size={18} color={colors.textMuted} style={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={passord}
              onChange={handlePassordChange}
              placeholder={t.passord}
              style={{ ...styles.input, paddingRight: 44 }}
              disabled={lastet}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              disabled={lastet}
              tabIndex={-1}
            >
              {showPassword ? (
                <IconEyeOff size={18} color={colors.textMuted} />
              ) : (
                <IconEye size={18} color={colors.textMuted} />
              )}
            </button>
          </div>
        </div>

        <div style={styles.forgotRow}>
          <button type="button" style={styles.forgotLink} onClick={() => {}}>
            {t.glemmtPassord}
          </button>
        </div>

        <button
          type="submit"
          disabled={lastet}
          style={{
            ...styles.submitButton,
            opacity: lastet ? 0.5 : 1,
            cursor: lastet ? 'not-allowed' : 'pointer',
          }}
        >
          {lastet ? t.kontoLåst : t.loggInn}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    position: 'relative',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
    maxWidth: 480,
    margin: '0 auto',
    padding: '48px 24px 24px',
    minHeight: '100vh',
    boxSizing: 'border-box',
    backgroundColor: '#fff',
  },
  språkRad: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    zIndex: 10,
  },
  språkKnapp: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #E6E8EC',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '13px',
    color: '#13171F',
    background: '#FAFAFB',
    cursor: 'pointer',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
  },
  språkFlaggImg: {
    display: 'block',
    borderRadius: '2px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  språkMeny: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 0,
    minWidth: '140px',
    background: '#FFFFFF',
    border: '1px solid #E6E8EC',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  språkMenyValg: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px 12px',
    border: 'none',
    background: '#FFFFFF',
    fontSize: '13px',
    color: '#13171F',
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
  },
  språkMenyValgAktiv: {
    background: '#F0F7FF',
    color: '#185FA5',
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 40,
  },
  tagline: {
    marginTop: 16,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.alertRedBg,
    color: colors.alertRedText,
    padding: '12px 14px',
    borderRadius: 8,
    fontSize: 14,
    lineHeight: 1.4,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.text,
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    fontSize: 15,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
    boxSizing: 'border-box',
    outline: 'none',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  forgotRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  forgotLink: {
    fontSize: 14,
    color: colors.teal,
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
  },
  submitButton: {
    marginTop: 8,
    width: '100%',
    padding: '14px 24px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: colors.teal,
    border: 'none',
    borderRadius: 8,
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
  },
};

export default Login;
