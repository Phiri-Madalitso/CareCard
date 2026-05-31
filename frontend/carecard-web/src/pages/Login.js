import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconMail, IconLock, IconEye, IconEyeOff, IconAlertCircle } from '@tabler/icons-react';
import CareCardLogo from '../components/CareCardLogo';

const BRUKERE = [
  { epost: 'ansatt@carecard.no', passord: 'CareCard123', rolle: 'ansatt', navn: 'Madalitso Skjelnes' },
  { epost: 'sykepleier@carecard.no', passord: 'CareCard123', rolle: 'sykepleier', navn: 'Marit Olsen' },
  { epost: 'leder@carecard.no', passord: 'CareCard123', rolle: 'leder', navn: 'Kari Nordmann' },
];

const MAX_FORSOK = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

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
  const [epost, setEpost] = useState('');
  const [passord, setPassord] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feilMelding, setFeilMelding] = useState('');
  const [forsok, setForsok] = useState(0);
  const [lastet, setLastet] = useState(false);
  const lockTimerRef = useRef(null);

  const handleEpostChange = (e) => {
    setEpost(e.target.value);
    if (feilMelding) setFeilMelding('');
  };

  const handlePassordChange = (e) => {
    setPassord(e.target.value);
    if (feilMelding) setFeilMelding('');
  };

  const handleLogin = () => {
    if (lastet) return;

    if (!epost.trim() || !passord) {
      setFeilMelding('Fyll inn epost og passord.');
      return;
    }

    const bruker = BRUKERE.find(
      (b) => b.epost === epost && b.passord === passord
    );

    if (bruker) {
      localStorage.setItem('innlogget', 'true');
      localStorage.setItem('rolle', bruker.rolle);
      localStorage.setItem('navn', bruker.navn);
      setForsok(0);
      setFeilMelding('');
      navigate('/avdelingsvalg');
    } else {
      const nyttForsok = forsok + 1;
      setForsok(nyttForsok);

      if (nyttForsok >= MAX_FORSOK) {
        setLastet(true);
        setFeilMelding(`Kontoen er låst etter ${MAX_FORSOK} forsøk. Prøv igjen om 15 minutter.`);
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => {
          setLastet(false);
          setForsok(0);
          setFeilMelding('');
        }, LOCK_DURATION_MS);
      } else {
        setFeilMelding(`Feil epost eller passord – prøv igjen. (${nyttForsok}/${MAX_FORSOK} forsøk)`);
      }
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
      <div style={styles.logoSection}>
        <CareCardLogo size="lg" />
        <p style={styles.tagline}>Digitalt matkort for sykehjem</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {feilMelding && (
          <div style={styles.errorBox}>
            <IconAlertCircle size={18} color={colors.alertRedText} style={{ flexShrink: 0 }} />
            <span>{feilMelding}</span>
          </div>
        )}

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Epost</label>
          <div style={styles.inputWrapper}>
            <IconMail size={18} color={colors.textMuted} style={styles.inputIcon} />
            <input
              type="email"
              value={epost}
              onChange={handleEpostChange}
              placeholder="ansatt@carecard.no"
              style={styles.input}
              disabled={lastet}
            />
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Passord</label>
          <div style={styles.inputWrapper}>
            <IconLock size={18} color={colors.textMuted} style={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={passord}
              onChange={handlePassordChange}
              placeholder="••••••••"
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
            Glemt passord?
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
          {lastet ? 'Kontoen er låst' : 'Logg inn'}
        </button>
      </form>
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
