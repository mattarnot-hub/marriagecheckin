// Client-side encryption: PBKDF2 (SHA-256) -> AES-GCM 256. Nothing leaves the browser.
const ITER = 600000;
const enc = new TextEncoder();
const dec = new TextDecoder();

export const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
export const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
export const randomSalt = () => crypto.getRandomValues(new Uint8Array(16));

export async function deriveKey(pass, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encrypt(key, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
  return { iv: b64(iv), ct: b64(ct) };
}

// Throws if the passphrase is wrong or the data was tampered with.
export async function decrypt(key, iv, ct) {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) }, key, unb64(ct));
  return dec.decode(pt);
}
