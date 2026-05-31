import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IconChevronLeft,
  IconPencil,
  IconAlertTriangle,
  IconGlass,
  IconMoon,
  IconToolsKitchen2,
  IconX,
  IconClock,
} from '@tabler/icons-react';

const ASTRID_DATA = {
  allergier: ['Nøtter (alle typer)', 'Skalldyr'],
  fortykningsbehov: 'Nivå 2 – sirupskonsistens. Gjelder all drikke inkludert vann.',
  kaffeTe: 'Kaffe med fløte og 1 ts sukker. Aldri svart.',
  drikke: 'Helst saft. Liker eplejuice til middag. Ikke melk alene.',
  frokost: 'Brødskive med brunost og syltetøy. Halvgrov skive, smør. Yoghurt naturell.',
  kveldsmat: 'Lett kveldsmat – grøt eller en skive med ost. Liker havregrøt med kanel.',
  konsistensMat: 'Findelt mat. Kjøtt kvernes.',
  hvorSpiser: 'Spiser på rommet. Foretrekker rolig miljø.',
  redskap: 'Tykt håndtak på bestikk. Sklisikker matte under tallerken.',
  likerIkke: 'Fisk (særlig sild), kål, sterk mat, leverpostei.',
  stellpreferanser: 'Foretrekker morgenstell tidlig. Liker å ta det rolig.',
  kommunikasjonsbehov: 'Snakk rolig og tydelig. Gi god tid.',
  viktigeHensyn: 'Forsiktig ved forflytning. Svak venstre side.',
  rutiner: 'Hviler etter lunsj. Liker å sitte ute når været tillater det.',
  sistEndret: '14. mai 2026, kl. 09:42 av Marit Olsen',
};

function getInitials(fornavn, etternavn) {
  const f = fornavn.trim().split(' ')[0][0] || '';
  const e = etternavn.trim()[0] || '';
  return (f + e).toUpperCase();
}

function SectionBox({ title, children, variant = 'default', icon }) {
  const variants = {
    default: { bg: '#F9FAFB', border: '#E5E7EB', color: '#13171F' },
    red: { bg: '#FCEBEB', border: '#F5C6C6', color: '#A32D2D' },
    yellow: { bg: '#FAEEDA', border: '#F0D9A8', color: '#854F0B' },
  };
  const v = variants[variant] || variants.default;

  return (
    <div style={{ ...styles.sectionBox, backgroundColor: v.bg, borderColor: v.border }}>
      {title && (
        <div style={styles.sectionTitle}>
          {icon}
          <span style={{ color: variant === 'default' ? '#13171F' : v.color }}>{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

function Pasientkort() {
  const navigate = useNavigate();
  const location = useLocation();
  const pasient = location.state?.pasient || {
    id: 1,
    fornavn: 'Astrid',
    etternavn: 'Henriksen',
    rom: '312',
    allergi: true,
    dia: false,
    fortykning: true,
  };

  const [activeTab, setActiveTab] = useState('matprofil');
  const [aktivtFelt, setAktivtFelt] = useState(null);
  const [nyVerdi, setNyVerdi] = useState('');
  const [visToast, setVisToast] = useState(false);
  const data = ASTRID_DATA;

  const RedigerbartFelt = ({ feltNavn, label, ikon, verdi, toKolonner }) => {
    const erAktiv = aktivtFelt === feltNavn;

    return (
      <div style={{ ...styles.kort, ...(toKolonner ? {} : {}) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <p style={styles.kortLabel}>{ikon} {label}</p>
          <IconPencil
            size={14}
            color="#6B7280"
            style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={() => {
              setAktivtFelt(erAktiv ? null : feltNavn);
              setNyVerdi(verdi);
            }}
          />
        </div>

        {!erAktiv && (
          <p style={styles.kortText}>{verdi}</p>
        )}

        {erAktiv && (
          <div>
            <textarea
              style={styles.tekstfelt}
              value={nyVerdi}
              onChange={(e) => setNyVerdi(e.target.value)}
              rows={3}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                style={styles.avbrytKnapp}
                onClick={() => setAktivtFelt(null)}
              >
                Avbryt
              </button>
              <button
                type="button"
                style={styles.sendKnapp}
                onClick={() => {
                  setVisToast(true);
                  setAktivtFelt(null);
                  setTimeout(() => setVisToast(false), 3000);
                }}
              >
                Send forslag ✓
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      <div style={styles.topbar}>
        <button style={styles.iconButton} onClick={() => navigate(-1)}>
          <IconChevronLeft size={22} color="#13171F" />
        </button>
        <span style={styles.topbarTitle}>Pasientkort</span>
        <button style={styles.iconButton}>
          <IconPencil size={20} color="#13171F" />
        </button>
      </div>

      <div style={styles.profileHeader}>
        <div style={styles.avatar}>
          {getInitials(pasient.fornavn, pasient.etternavn)}
        </div>
        <div>
          <h1 style={styles.patientName}>
            {pasient.fornavn} {pasient.etternavn}
          </h1>
          <p style={styles.patientMeta}>
            Rom {pasient.rom} · Langtidsplass
          </p>
        </div>
      </div>

      <div style={styles.alertBadges}>
        {pasient.allergi && (
          <span style={styles.allergiBadge}>
            <IconAlertTriangle size={14} />
            Allergi
          </span>
        )}
        {pasient.fortykning && (
          <span style={styles.warningBadge}>
            <IconGlass size={14} />
            Fortykning
          </span>
        )}
        {pasient.dia && (
          <span style={styles.warningBadge}>DIA</span>
        )}
      </div>

      <div style={styles.tabContainer}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'matprofil' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('matprofil')}
        >
          Matprofil
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'stellprofil' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('stellprofil')}
        >
          Stellprofil
        </button>
      </div>

      {activeTab === 'matprofil' && (
        <div style={styles.tabContent}>
          <SectionBox title="Allergier" variant="red">
            <ul style={styles.bulletList}>
              {data.allergier.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </SectionBox>

          <RedigerbartFelt
            feltNavn="fortykningsbehov"
            label="Fortykningsbehov"
            ikon={null}
            verdi={data.fortykningsbehov}
          />

          <div style={styles.grid}>
            <RedigerbartFelt
              feltNavn="kaffeTe"
              label="Kaffe/Te"
              ikon={null}
              verdi={data.kaffeTe}
              toKolonner
            />
            <RedigerbartFelt
              feltNavn="drikke"
              label="Drikke"
              ikon={null}
              verdi={data.drikke}
              toKolonner
            />
          </div>

          <RedigerbartFelt
            feltNavn="frokost"
            label="Frokost"
            ikon={null}
            verdi={data.frokost}
          />

          <RedigerbartFelt
            feltNavn="kveldsmat"
            label="Kveldsmat"
            ikon={<IconMoon size={14} color="#6B7280" />}
            verdi={data.kveldsmat}
          />

          <div style={styles.grid}>
            <RedigerbartFelt
              feltNavn="konsistensMat"
              label="Konsistens mat"
              ikon={null}
              verdi={data.konsistensMat}
              toKolonner
            />
            <RedigerbartFelt
              feltNavn="hvorSpiser"
              label="Hvor spiser"
              ikon={null}
              verdi={data.hvorSpiser}
              toKolonner
            />
          </div>

          <RedigerbartFelt
            feltNavn="redskap"
            label="Redskap"
            ikon={<IconToolsKitchen2 size={14} color="#6B7280" />}
            verdi={data.redskap}
          />

          <RedigerbartFelt
            feltNavn="likerIkke"
            label="Liker ikke"
            ikon={<IconX size={14} color="#6B7280" />}
            verdi={data.likerIkke}
          />

          <div style={styles.lastChanged}>
            <IconClock size={14} color="#6B7280" />
            <span>Sist endret: {data.sistEndret}</span>
          </div>

          <button style={styles.suggestButton}>Foreslå endring</button>
        </div>
      )}

      {activeTab === 'stellprofil' && (
        <div style={styles.tabContent}>
          <RedigerbartFelt
            feltNavn="stellpreferanser"
            label="Stellpreferanser"
            ikon={null}
            verdi={data.stellpreferanser}
          />
          <RedigerbartFelt
            feltNavn="kommunikasjonsbehov"
            label="Kommunikasjonsbehov"
            ikon={null}
            verdi={data.kommunikasjonsbehov}
          />
          <RedigerbartFelt
            feltNavn="viktigeHensyn"
            label="Viktige hensyn"
            ikon={null}
            verdi={data.viktigeHensyn}
          />
          <RedigerbartFelt
            feltNavn="rutiner"
            label="Rutiner"
            ikon={null}
            verdi={data.rutiner}
          />

          <div style={styles.lastChanged}>
            <IconClock size={14} color="#6B7280" />
            <span>Sist endret: {data.sistEndret}</span>
          </div>

          <button style={styles.suggestButton}>Foreslå endring</button>
        </div>
      )}

      {visToast && (
        <div style={styles.toast}>
          ✓ Forslag sendt til godkjenning
        </div>
      )}
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
  topbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  iconButton: {
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
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    backgroundColor: '#185FA5',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 700,
    flexShrink: 0,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 700,
    color: '#13171F',
    margin: 0,
  },
  patientMeta: {
    fontSize: 14,
    color: '#6B7280',
    margin: '4px 0 0',
  },
  alertBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  allergiBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 500,
    padding: '4px 10px',
    borderRadius: 6,
    backgroundColor: '#FCEBEB',
    color: '#A32D2D',
    border: '1px solid #F5C6C6',
  },
  warningBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    fontWeight: 500,
    padding: '4px 10px',
    borderRadius: 6,
    backgroundColor: '#FAEEDA',
    color: '#854F0B',
    border: '1px solid #F0D9A8',
  },
  tabContainer: {
    display: 'flex',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#6B7280',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
  },
  tabActive: {
    backgroundColor: '#fff',
    color: '#185FA5',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  sectionBox: {
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
  },
  bulletList: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 14,
    lineHeight: 1.6,
    color: '#A32D2D',
  },
  boxText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.5,
    color: '#13171F',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  lastChanged: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  },
  suggestButton: {
    width: '100%',
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 600,
    color: '#185FA5',
    backgroundColor: '#fff',
    border: '1px solid #185FA5',
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
    marginTop: 4,
  },
  kort: {
    padding: '14px 16px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
  },
  kortLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#6B7280',
    margin: 0,
  },
  kortText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.5,
    color: '#13171F',
  },
  tekstfelt: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #185FA5',
    fontSize: '14px',
    color: '#13171F',
    fontFamily: 'Manrope, sans-serif',
    outline: 'none',
    resize: 'none',
    boxSizing: 'border-box',
    background: '#F9FAFB',
  },
  avbrytKnapp: {
    flex: 1,
    padding: '8px',
    borderRadius: '10px',
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    fontSize: '13px',
    fontWeight: '500',
    color: '#6B7280',
    cursor: 'pointer',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
  },
  sendKnapp: {
    flex: 2,
    padding: '8px',
    borderRadius: '10px',
    border: 'none',
    background: '#185FA5',
    fontSize: '13px',
    fontWeight: '600',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: "'Manrope', -apple-system, system-ui, sans-serif",
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

export default Pasientkort;
