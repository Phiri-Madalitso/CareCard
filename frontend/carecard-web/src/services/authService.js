import { API_BASE_URL } from '../config/api';

export async function loggInn(epost, passord) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ epost, passord }),
    });
  } catch {
    throw new Error('SERVER');
  }

  if (response.status === 401) {
    throw new Error('CREDENTIALS');
  }

  if (!response.ok) {
    throw new Error('SERVER');
  }

  return response.json();
}

export function loggUt() {
  localStorage.removeItem('token');
  localStorage.removeItem('rolle');
  localStorage.removeItem('navn');
  localStorage.removeItem('ansattId');
}
