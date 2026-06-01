import { useState, useEffect, useCallback } from 'react';
import { tekster } from '../languages';

const LOCALE_MAP = {
  no: 'nb-NO',
  en: 'en-GB',
  es: 'es-ES',
  pl: 'pl-PL',
  pt: 'pt-BR',
};

export function useSpråk() {
  const [språk, setSpråkState] = useState(
    () => localStorage.getItem('språk') || 'no'
  );

  const setSpråk = useCallback((kode) => {
    setSpråkState(kode);
    localStorage.setItem('språk', kode);
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'språk' && e.newValue) {
        setSpråkState(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const t = tekster[språk] || tekster.no;
  const locale = LOCALE_MAP[språk] || 'nb-NO';

  return { språk, setSpråk, t, locale };
}

export function getHilsenKey() {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'godMorgen';
  if (hour >= 12 && hour < 18) return 'godDag';
  return 'godKveld';
}

export function formatDato(locale) {
  const date = new Date();
  const formatted = date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function getInitialer(navn) {
  if (!navn) return '??';
  const deler = navn.trim().split(/\s+/);
  if (deler.length >= 2) {
    return (deler[0][0] + deler[deler.length - 1][0]).toUpperCase();
  }
  return navn.slice(0, 2).toUpperCase();
}
