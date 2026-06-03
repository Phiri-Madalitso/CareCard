import { API_BASE_URL } from '../config/api';

export async function hentMatprofil(pasientId) {
  const response = await fetch(`${API_BASE_URL}/api/matprofil/pasient/${pasientId}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Kunne ikke hente matprofil.');
  return response.json();
}

export async function hentStellprofil(pasientId) {
  const response = await fetch(`${API_BASE_URL}/api/stellprofil/pasient/${pasientId}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Kunne ikke hente stellprofil.');
  return response.json();
}

export async function sendEndringsforslag(forslag) {
  const response = await fetch(`${API_BASE_URL}/api/endringsforslag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(forslag),
  });
  if (!response.ok) throw new Error('Kunne ikke sende endringsforslag.');
  return response.json();
}

export async function hentVentendeForslag() {
  const response = await fetch(`${API_BASE_URL}/api/endringsforslag/venter`);
  if (!response.ok) throw new Error('Kunne ikke hente ventende forslag.');
  return response.json();
}

export async function godkjennForslag(id, behandletAvId = 1) {
  const response = await fetch(
    `${API_BASE_URL}/api/endringsforslag/${id}/godkjenn?behandletAvId=${behandletAvId}`,
    { method: 'PUT' }
  );
  if (!response.ok) throw new Error('Kunne ikke godkjenne forslag.');
}

export async function avvisForslag(id, kommentar, behandletAvId = 1) {
  const params = new URLSearchParams({
    behandletAvId: String(behandletAvId),
    kommentar: kommentar || '',
  });
  const response = await fetch(
    `${API_BASE_URL}/api/endringsforslag/${id}/avvis?${params}`,
    { method: 'PUT' }
  );
  if (!response.ok) throw new Error('Kunne ikke avvise forslag.');
}
