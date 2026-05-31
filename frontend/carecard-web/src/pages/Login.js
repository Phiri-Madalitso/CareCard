import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconMail, IconLock, IconEye, IconEyeOff, IconAlertCircle } from '@tabler/icons-react';
import CareCardLogo from '../components/CareCardLogo';

const VALID_EMAIL = 'ansatt@carecard.no';
const VALID_PASSWORD = 'CareCard123';
const MAX_ATTEMPTS = 5;
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const lockTimerRef = useRef(null);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (locked) return;

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      setAttempts(0);
      setError('');
      navigate('/avdelingsvalg');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (newAttempts >= MAX_ATTEMPTS) {
      setLocked(true);
      setError('Kontoen er låst etter 5 forsøk. Prøv igjen om 15 minutter.');
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
      lockTimerRef.current = setTimeout(() => {
        setLocked(false);
        setAttempts(0);
        setError('');
      }, LOCK_DURATION_MS);
    } else {
      setError(`Feil epost eller passord – prøv igjen. (${newAttempts}/${MAX_ATTEMPTS} forsøk)`);
    }
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
        {error && (
          <div style={styles.errorBox}>
            <IconAlertCircle size={18} color={colors.alertRedText} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Epost</label>
          <div style={styles.inputWrapper}>
            <IconMail size={18} color={colors.textMuted} style={styles.inputIcon} />
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="ansatt@carecard.no"
              style={styles.input}
              disabled={locked}
            />
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Passord</label>
          <div style={styles.inputWrapper}>
            <IconLock size={18} color={colors.textMuted} style={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              style={{ ...styles.input, paddingRight: 44 }}
              disabled={locked}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              disabled={locked}
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
          disabled={locked}
          style={{
            ...styles.submitButton,
            opacity: locked ? 0.5 : 1,
            cursor: locked ? 'not-allowed' : 'pointer',
          }}
        >
          {locked ? 'Kontoen er låst' : 'Logg inn'}
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
