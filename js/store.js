// Encrypted local vault. State is only ever written to localStorage as ciphertext.
import { deriveKey, encrypt, decrypt, randomSalt, b64, unb64 } from './crypto.js';

const KEY = 'mc_vault_v1';
let key = null;
let salt = null;
let state = null;

const blank = () => ({
  v: 1,
  settings: { names: ['', ''], me: 0, nextSession: '', sessionsSinceReview: 0, mustChange: false },
  checkins: {}, // id `${week}-${who}` -> entry
  done: {}, // `${week}|${practiceId}|${who}` -> true
  parking: {}, // id -> issue
});

export const hasVault = () => !!localStorage.getItem(KEY);
export const isUnlocked = () => state !== null;
export const get = () => state;

async function persist() {
  const blob = await encrypt(key, JSON.stringify(state));
  localStorage.setItem(KEY, JSON.stringify({ v: 1, salt: b64(salt), ...blob }));
}

export async function create(pass, mustChange = false) {
  salt = randomSalt();
  key = await deriveKey(pass, salt);
  state = blank();
  state.settings.mustChange = mustChange;
  await persist();
}

// Re-encrypt the vault under a new passphrase (fresh salt).
export async function changePass(pass) {
  salt = randomSalt();
  key = await deriveKey(pass, salt);
  state.settings.mustChange = false;
  await persist();
}

export async function unlock(pass) {
  const v = JSON.parse(localStorage.getItem(KEY));
  const s = unb64(v.salt);
  const k = await deriveKey(pass, s);
  const next = JSON.parse(await decrypt(k, v.iv, v.ct)); // throws on wrong passphrase
  salt = s;
  key = k;
  state = { ...blank(), ...next };
}

export function lock() {
  key = null;
  state = null;
}

export const save = () => persist();

export function wipe() {
  localStorage.removeItem(KEY);
  lock();
}

// ---- encrypted export / import (share between the two devices) ----
export async function exportFile(pass) {
  const s = randomSalt();
  const k = await deriveKey(pass, s);
  const blob = await encrypt(k, JSON.stringify(state));
  return JSON.stringify({ v: 1, kind: 'marriage-checkin-export', salt: b64(s), ...blob });
}

export async function importFile(text, pass) {
  const f = JSON.parse(text);
  if (f.kind !== 'marriage-checkin-export') throw new Error('Not a Marriage Check-In export file.');
  const k = await deriveKey(pass, unb64(f.salt));
  const incoming = JSON.parse(await decrypt(k, f.iv, f.ct));
  let added = 0;
  for (const [id, c] of Object.entries(incoming.checkins || {})) {
    const mine = state.checkins[id];
    if (!mine || (c.updatedAt || 0) > (mine.updatedAt || 0)) {
      state.checkins[id] = c;
      added++;
    }
  }
  for (const [id, p] of Object.entries(incoming.parking || {})) {
    const mine = state.parking[id];
    if (!mine || (p.updatedAt || 0) > (mine.updatedAt || 0)) {
      state.parking[id] = p;
      added++;
    }
  }
  for (const k2 of Object.keys(incoming.done || {})) {
    if (!state.done[k2]) {
      state.done[k2] = true;
      added++;
    }
  }
  // Adopt partner's name if we don't have it yet.
  const names = incoming.settings?.names || [];
  names.forEach((n, i) => {
    if (n && !state.settings.names[i]) state.settings.names[i] = n;
  });
  await persist();
  return added;
}
