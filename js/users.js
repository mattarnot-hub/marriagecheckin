// The only two people who can sign in. Addresses are stored as SHA-256 hashes so the
// public source never lists them in plain text. idx is the partner slot used in the data.
const USERS = [
  { h: '4042f84e6d7615743893b0c935df95ae5765814b6fd77cdcf177e309ae26a6ca', name: 'Janet', idx: 0 },
  { h: '66f5ff16f05a87ff98898fd0f9dc47b16834f2dcdfa67b2ad5907d5fcce03ea1', name: 'Matt', idx: 1 },
];

export const normEmail = (e) => String(e || '').trim().toLowerCase();

export async function identify(email) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normEmail(email)));
  const h = [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return USERS.find((u) => u.h === h) || null;
}

export const PARTNER_NAMES = USERS.slice().sort((a, b) => a.idx - b.idx).map((u) => u.name);
