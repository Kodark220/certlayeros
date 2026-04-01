/**
 * Production-grade key encryption using Web Crypto API.
 * AES-256-GCM with PBKDF2 key derivation.
 */

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 600_000;

function getSubtle(): SubtleCrypto {
  return globalThis.crypto.subtle;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await getSubtle().importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return getSubtle().deriveKey(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function toBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function fromBase64(str: string): Uint8Array {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

/**
 * Encrypt a plaintext string with a password.
 * Returns a base64 string containing salt + iv + ciphertext.
 */
export async function encrypt(plaintext: string, password: string): Promise<string> {
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);
  const enc = new TextEncoder();
  const ciphertext = await getSubtle().encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  // Pack: salt (16) + iv (12) + ciphertext
  const packed = new Uint8Array(SALT_LENGTH + IV_LENGTH + ciphertext.byteLength);
  packed.set(salt, 0);
  packed.set(iv, SALT_LENGTH);
  packed.set(new Uint8Array(ciphertext), SALT_LENGTH + IV_LENGTH);
  return toBase64(packed.buffer);
}

/**
 * Decrypt a base64-encoded ciphertext with a password.
 * Throws on wrong password or corrupted data.
 */
export async function decrypt(encoded: string, password: string): Promise<string> {
  const packed = fromBase64(encoded);
  const salt = packed.slice(0, SALT_LENGTH);
  const iv = packed.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = packed.slice(SALT_LENGTH + IV_LENGTH);
  const key = await deriveKey(password, salt);
  const plainBuffer = await getSubtle().decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(plainBuffer);
}
