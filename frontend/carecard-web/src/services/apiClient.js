import { API_BASE_URL } from '../config/api';

export function getAuthHeaders(json = false) {
  const headers = {};
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (json) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export async function apiFetch(path, options = {}) {
  const hasBody = options.body !== undefined && options.body !== null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(hasBody),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('rolle');
    localStorage.removeItem('navn');
    localStorage.removeItem('ansattId');
    window.location.href = '/';
    throw new Error('Sesjonen er utløpt. Logg inn på nytt.');
  }

  return response;
}

export function getAnsattId() {
  const id = localStorage.getItem('ansattId');
  return id ? Number(id) : 1;
}
