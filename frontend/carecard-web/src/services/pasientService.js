import { apiFetch } from './apiClient';
import { hentMatprofil } from './profilService';

export async function hentPasienter(avdelingId) {
  const response = await apiFetch('/api/Pasient');

  if (!response.ok) {
    throw new Error('Kunne ikke hente pasienter fra API-et.');
  }

  const pasienter = await response.json();
  const filtrert = pasienter.filter((p) => p.avdelingId === avdelingId);

  return Promise.all(
    filtrert.map(async (pasient) => {
      const matprofil = await hentMatprofil(pasient.id);

      return {
        id: pasient.id,
        fornavn: pasient.fornavn,
        etternavn: pasient.etternavn,
        rom: pasient.romnummer,
        allergi: Boolean(matprofil?.allergier?.trim()),
        dia: matprofil?.erDiabetiker ?? false,
        fortykning: matprofil?.harFortykningIDrikke ?? false,
      };
    })
  );
}
