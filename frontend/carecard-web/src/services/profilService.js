import { apiFetch, getAnsattId } from './apiClient';

export async function hentMatprofil(pasientId) {
  const response = await apiFetch(`/api/matprofil/pasient/${pasientId}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Kunne ikke hente matprofil.');
  return response.json();
}

export async function sendEndringsforslag(forslag) {
  const response = await apiFetch('/api/endringsforslag', {
    method: 'POST',
    body: JSON.stringify({
      ...forslag,
      opprettetAvId: forslag.opprettetAvId ?? getAnsattId(),
    }),
  });
  if (!response.ok) throw new Error('Kunne ikke sende endringsforslag.');
  return response.json();
}

export async function hentVentendeForslag() {
  const response = await apiFetch('/api/endringsforslag/venter');
  if (!response.ok) throw new Error('Kunne ikke hente ventende forslag.');
  return response.json();
}

export async function hentMineForslag(limit = 20, filter = 'aktive') {
  const params = new URLSearchParams({
    limit: String(limit),
    filter,
  });
  const response = await apiFetch(`/api/endringsforslag/mine?${params}`);
  if (!response.ok) throw new Error('Kunne ikke hente dine forslag.');
  return response.json();
}

export async function godkjennForslag(id, behandletAvId = getAnsattId()) {
  const response = await apiFetch(
    `/api/endringsforslag/${id}/godkjenn?behandletAvId=${behandletAvId}`,
    { method: 'PUT' }
  );
  if (!response.ok) throw new Error('Kunne ikke godkjenne forslag.');
}

export async function avvisForslag(id, kommentar, behandletAvId = getAnsattId()) {
  const params = new URLSearchParams({
    behandletAvId: String(behandletAvId),
    kommentar: kommentar || '',
  });
  const response = await apiFetch(
    `/api/endringsforslag/${id}/avvis?${params}`,
    { method: 'PUT' }
  );
  if (!response.ok) throw new Error('Kunne ikke avvise forslag.');
}

export async function oversettTekster(tekster, malSprak) {
  if (malSprak === 'no' || !tekster.length) return tekster;

  const response = await apiFetch('/api/oversett', {
    method: 'POST',
    body: JSON.stringify({ tekster, malSprak }),
  });
  if (!response.ok) throw new Error('Kunne ikke oversette tekst.');
  const data = await response.json();
  return data.tekster;
}
