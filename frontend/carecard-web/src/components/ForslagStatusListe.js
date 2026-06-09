import { useSpråk } from '../hooks/useSprak';
import { getStatusConfig } from '../utils/forslagUtils';

function ForslagStatusListe({
  forslag,
  kompakt = false,
  onKlikkPasient,
  feil = '',
  laster = false,
}) {
  const { t } = useSpråk();

  if (laster || feil) {
    return null;
  }

  if (!forslag.length) {
    return (
      <p className="forslag-status-tom">{t.ingenMineForslag}</p>
    );
  }

  return (
    <ul className={`forslag-status-liste${kompakt ? ' forslag-status-liste--kompakt' : ''}`}>
      {forslag.map((f) => {
        const status = getStatusConfig(f.status, t);
        const innhold = (
          <>
            <div className="forslag-status-rad-topp">
              <span className={`forslag-status-badge ${status.klasse}`}>
                <span aria-hidden="true">{status.ikon}</span>
                {status.tekst}
              </span>
              <time className="forslag-status-dato" dateTime={f.dato}>{f.dato}</time>
            </div>
            <p className="forslag-status-pasient">{f.pasient}</p>
            <p className="forslag-status-felt">{f.felt}</p>
            {!kompakt && (
              <p className="forslag-status-endring">
                <span className="forslag-status-gammel">{f.gammelVerdi || '–'}</span>
                <span className="forslag-status-pil" aria-hidden="true">→</span>
                <span className="forslag-status-ny">{f.nyVerdiOversatt || f.nyVerdi || '–'}</span>
              </p>
            )}
            {f.status === 'Avvist' && f.kommentar && (
              <p className="forslag-status-begrunnelse">
                <span className="forslag-status-begrunnelse-label">{t.begrunnelse}:</span>
                {' '}
                {f.kommentar}
              </p>
            )}
            {f.status === 'Godkjent' && f.behandletDato && !kompakt && (
              <p className="forslag-status-meta">{t.godkjentDato} {f.behandletDato}</p>
            )}
          </>
        );

        if (onKlikkPasient) {
          return (
            <li key={f.id}>
              <button
                type="button"
                className="forslag-status-kort forslag-status-kort--klikkbar"
                onClick={() => onKlikkPasient(f.pasientId)}
              >
                {innhold}
              </button>
            </li>
          );
        }

        return (
          <li key={f.id} className="forslag-status-kort">
            {innhold}
          </li>
        );
      })}
    </ul>
  );
}

export default ForslagStatusListe;
