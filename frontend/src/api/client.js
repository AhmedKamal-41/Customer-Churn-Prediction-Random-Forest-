import { apiUrl } from './config'

export async function getHealth() {
  const res = await fetch(apiUrl('/api/health'));
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function predict(body) {
  const res = await fetch(apiUrl('/api/predict'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}
