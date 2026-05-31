import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChevronLeft, IconCheck, IconX } from '@tabler/icons-react';
import Navbar from '../components/Navbar';

const HARDKODEDE_FORSLAG = [
  {
    id: 1,
    pasient: 'Astrid Henriksen',
    kategori: 'Matprofil',
    felt: 'Frokost',
    gammelVerdi: 'Brødskive med brunost og syltetøy.',
    nyVerdi: 'Havregrøt med kanel og honning.',
    sendtAv: 'Per Hansen',
    dato: '01.06.2026 kl. 08:14',
  },
  {
    id: 2,
    pasient: 'Kåre Solberg',
    kategori: 'Matprofil',
    felt: 'Drikke',
    gammelVerdi: 'Juice og kefir.',
    nyVerdi: 'Kun vann og juice. Tåler ikke melkeprodukter lenger.',
    sendtAv: 'Lise Berg',
    dato: '01.06.2026 kl. 09:32',
  },
  {
    id: 3,
    pasient: 'Inger Lise Dahl',
    kategori: 'Stellprofil',
    felt: 'Rutiner',
    gammelVerdi: 'Hviler etter lunsj.',
    nyVerdi: 'Hviler etter lunsj og etter middag.',
    sendtAv: 'Madalitso Skjelnes',
    dato: '01.06.2026 kl. 11:45',
  },
];

function Godkjenning() {
  const navigate = useNavigate();
  const [forslag, setForslag] = useState(HARDKODEDE_FORSLAG);
  const [kommentar, setKommentar] = useState({});
  const [visKommentar, setVisKommentar] = useState(null);
  const [visToast, setVisToast] = useState('');

  const godkjenn = (id) => {
    setForslag((prev) => prev.filter((f) => f.id !== id));
    setVisToast('✓ Endring godkjent og oppdatert!');
    setTimeout(() => setVisToast(''), 3000);
  };

  const avvis = (id) => {
    setForslag((prev) => prev.filter((f) => f.id !== id));
    setVisKommentar(null);
    setVisToast('Forslag avvist.');
    setTimeout(() => setVisToast(''), 3000);
  };

  return (
    <div style={styles.container}>
      <Navbar antallVentende={forslag.length} />

      <div style={styles.innhold}>
        <div style={styles.topBar}>
          <IconChevronLeft
            size={22}
            color="#185FA5"
            onClick={() => navigate(-1)}
            style={{ cursor: 'pointer' }}
          />
          <p style={styles.tittel}>Til godkjenning</p>
          <div style={{ width: 22 }} />
        </div>

        <p style={styles.undertittel}>
          {forslag.length} forslag venter – eldste først
        </p>

        {forslag.length === 0 && (
          <div style={styles.tom}>
            <p>🎉 Ingen forslag venter på godkjenning!</p>
          </div>
        )}

        {forslag.map((f) => (
          <div key={f.id} style={styles.kort}>
            <div style={styles.kortHeader}>
              <div>
                <p style={styles.pasientNavn}>{f.pasient}</p>
                <p style={styles.meta}>{f.kategori} · {f.felt}</p>
              </div>
              <span style={styles.datoBadge}>{f.dato}</span>
            </div>

            <p style={styles.sendtAv}>Sendt av {f.sendtAv}</p>

            <div style={styles.endringRad}>
              <div style={styles.gammel}>
                <p style={styles.endringLabel}>Gammel</p>
                <p style={styles.endringTekst}>{f.gammelVerdi}</p>
              </div>
              <div style={styles.pil}>→</div>
              <div style={styles.ny}>
                <p style={styles.endringLabel}>Ny</p>
                <p style={styles.endringTekst}>{f.nyVerdi}</p>
              </div>
            </div>

            {visKommentar === f.id && (
              <textarea
                style={styles.tekstfelt}
                placeholder="Skriv begrunnelse for avvisning..."
                value={kommentar[f.id] || ''}
                onChange={(e) => setKommentar((prev) => ({ ...prev, [f.id]: e.target.value }))}
                rows={2}
              />
            )}

            <div style={styles.knappeRad}>
              <button
                type="button"
                style={styles.avvisKnapp}
                onClick={() => (visKommentar === f.id ? avvis(f.id) : setVisKommentar(f.id))}
              >
                <IconX size={14} /> {visKommentar === f.id ? 'Send avvisning' : 'Avvis'}
              </button>
              <button
                type="button"
                style={styles.godkjennKnapp}
                onClick={() => godkjenn(f.id)}
              >
                <IconCheck size={14} /> Godkjenn
              </button>
            </div>
          </div>
        ))}
      </div>

      {visToast && (
        <div style={styles.toast}>
          {visToast}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFFFFF',
    fontFamily: 'Manrope, -apple-system, sans-serif',
  },
  innhold: {
    maxWidth: '640px',
    margin: '0 auto',
    padding: '24px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  tittel: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#13171F',
    margin: 0,
  },
  undertittel: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '0 0 16px',
  },
  tom: {
    textAlign: 'center',
    padding: '48px 0',
    fontSize: '15px',
    color: '#6B7280',
  },
  kort: {
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    background: '#FFFFFF',
  },
  kortHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '4px',
  },
  pasientNavn: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#13171F',
    margin: '0 0 2px',
  },
  meta: {
    fontSize: '12px',
    color: '#6B7280',
    margin: 0,
  },
  datoBadge: {
    fontSize: '11px',
    color: '#6B7280',
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '20px',
    padding: '3px 10px',
  },
  sendtAv: {
    fontSize: '12px',
    color: '#6B7280',
    margin: '0 0 12px',
  },
  endringRad: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '12px',
  },
  gammel: {
    background: '#FCEBEB',
    borderRadius: '10px',
    padding: '10px 12px',
  },
  ny: {
    background: '#E6F4EA',
    borderRadius: '10px',
    padding: '10px 12px',
  },
  pil: {
    fontSize: '18px',
    color: '#6B7280',
    textAlign: 'center',
  },
  endringLabel: {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#6B7280',
    margin: '0 0 4px',
  },
  endringTekst: {
    fontSize: '13px',
    color: '#13171F',
    margin: 0,
    lineHeight: '1.4',
  },
  tekstfelt: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
    fontSize: '13px',
    fontFamily: 'Manrope, sans-serif',
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box',
    marginBottom: '10px',
  },
  knappeRad: {
    display: 'flex',
    gap: '8px',
  },
  avvisKnapp: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #F5C6C6',
    background: '#FCEBEB',
    color: '#A32D2D',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
  },
  godkjennKnapp: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    borderRadius: '10px',
    border: 'none',
    background: '#185FA5',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
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
};

export default Godkjenning;
