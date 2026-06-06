import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconMail, IconLock, IconEye, IconEyeOff, IconAlertCircle, IconChevronDown } from '@tabler/icons-react';
import CareCardLogo from '../components/CareCardLogo';
import { useSpråk } from '../hooks/useSprak';
import { loggInn } from '../services/authService';
import {
  colors,
  spacing,
  typography,
  shadows,
  radii,
  card,
  inputBase,
  btnPrimary,
} from '../styles/theme';

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

const colorsLocal = {
  teal: colors.primary,
  text: colors.text,
  textMuted: colors.textMuted,
  border: colors.border,
  surfaceSoft: colors.surfaceSoft,
  alertRedBg: colors.alertRedBg,
  alertRedText: colors.alertRedText,
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
    } catch (err) {
      if (err.message === 'SERVER') {
        setFeilMelding('serverFeil');
        setFeilEkstra('');
        setLoggerInn(false);
        return;
      }

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
      <div style={styles.loginCard}>
      <div style={styles.logoSection}>
        <CareCardLogo size="lg" />
        <p style={styles.tagline}>{t.tagline}</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {feilMelding && t[feilMelding] && (
          <div style={styles.errorBox}>
            <IconAlertCircle size={18} color={colorsLocal.alertRedText} style={{ flexShrink: 0 }} />
            <span>{t[feilMelding]}{feilEkstra}</span>
          </div>
        )}

        <div style={styles.fieldGroup}>
          <label style={styles.label}>{t.epost}</label>
          <div style={styles.inputWrapper}>
            <IconMail size={18} color={colorsLocal.textMuted} style={styles.inputIcon} />
            <input
              type="email"
              value={epost}
              onChange={handleEpostChange}
              placeholder={t.epost}
              style={styles.input}
              className="cc-input"
              disabled={lastet}
            />
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>{t.passord}</label>
          <div style={styles.inputWrapper}>
            <IconLock size={18} color={colorsLocal.textMuted} style={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={passord}
              onChange={handlePassordChange}
              placeholder={t.passord}
              style={{ ...styles.input, paddingRight: 44 }}
              className="cc-input"
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
                <IconEyeOff size={18} color={colorsLocal.textMuted} />
              ) : (
                <IconEye size={18} color={colorsLocal.textMuted} />
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
          className="cc-btn-primary"
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
    </div>
  );
}

const styles = {
  page: {
    position: 'relative',
    fontFamily: typography.fontFamily,
    minHeight: '100vh',
    boxSizing: 'border-box',
    backgroundColor: colors.primaryLight,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing.lg}px`,
  },
  loginCard: {
    ...card,
    width: '100%',
    maxWidth: 440,
    padding: `${spacing.xxl}px ${spacing.xl}px ${spacing.xl}px`,
    boxShadow: shadows.elevated,
  },
  språkRad: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
  },
  språkKnapp: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    border: `1px solid ${colors.border}`,
    borderRadius: radii.md,
    padding: '8px 14px',
    fontSize: 14,
    color: colors.text,
    background: colors.surface,
    cursor: 'pointer',
    fontFamily: typography.fontFamily,
    boxShadow: shadows.sm,
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
    marginBottom: spacing.xl,
  },
  tagline: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 1.5,
    maxWidth: 320,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colorsLocal.alertRedBg,
    color: colorsLocal.alertRedText,
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.md,
    fontSize: 14,
    lineHeight: 1.5,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: colorsLocal.text,
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
    ...inputBase,
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
    color: colorsLocal.teal,
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontFamily: typography.fontFamily,
  },
  submitButton: {
    ...btnPrimary,
    marginTop: spacing.sm,
    width: '100%',
  },
};

export default Login;
