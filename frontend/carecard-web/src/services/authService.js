import { API_BASE_URL } from '../config/api';

export async function loggInn(epost, passord) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ epost, passord }),
  });

  if (!response.ok) {
    throw new Error('Feil epost eller passord');
  }

  return response.json();
}

export function loggUt() {
  localStorage.removeItem('token');
  localStorage.removeItem('rolle');
  localStorage.removeItem('navn');
  localStorage.removeItem('ansattId');
}
