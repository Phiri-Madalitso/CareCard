const API_FELT_TIL_NOKKEL = {
  konsistensdrikke: 'fortykningsbehov',
  kaffete: 'kaffeTe',
  drikke: 'drikke',
  frokost: 'frokost',
  kvelds: 'kveldsmat',
  konsistensmat: 'konsistensMat',
  hvorspiser: 'hvorSpiser',
  redskap: 'redskap',
  misliker: 'likerIkke',
  allergier: 'allergier',
};

export function getFeltLabel(feltNavn, t) {
  const key = API_FELT_TIL_NOKKEL[(feltNavn || '').toLowerCase()];
  return key && t[key] ? t[key] : feltNavn;
}

export function formatForslagDato(dato) {
  if (!dato) return '';
  return new Date(dato).toLocaleString('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function mapForslagForVisning(apiForslag, t) {
  const pasient = apiForslag.pasient;
  const pasientNavn = pasient
    ? `${pasient.fornavn} ${pasient.etternavn}`
    : `Pasient ${apiForslag.pasientId}`;

  const nyVerdi = apiForslag.nyVerdi ?? '';
  const nyVerdiOversatt = apiForslag.nyVerdiOversatt ?? null;
  const harOversettelse = Boolean(
    nyVerdiOversatt?.trim()
    && nyVerdiOversatt.trim().toLowerCase() !== nyVerdi.trim().toLowerCase()
  );

  return {
    id: apiForslag.id,
    pasientId: apiForslag.pasientId,
    pasient: pasientNavn,
    felt: getFeltLabel(apiForslag.feltNavn, t),
    feltNavn: apiForslag.feltNavn,
    gammelVerdi: apiForslag.gammelVerdi,
    nyVerdi,
    nyVerdiOversatt: harOversettelse ? nyVerdiOversatt : null,
    status: apiForslag.status,
    kommentar: apiForslag.kommentar || '',
    dato: formatForslagDato(apiForslag.opprettetTidspunkt),
    behandletDato: formatForslagDato(apiForslag.behandletTidspunkt),
  };
}

export function getStatusConfig(status, t) {
  switch (status) {
    case 'Godkjent':
      return {
        klasse: 'forslag-status--godkjent',
        ikon: '✅',
        tekst: t.statusGodkjent,
      };
    case 'Avvist':
      return {
        klasse: 'forslag-status--avvist',
        ikon: '❌',
        tekst: t.statusAvvist,
      };
    default:
      return {
        klasse: 'forslag-status--venter',
        ikon: '🟡',
        tekst: t.statusVenter,
      };
  }
}
