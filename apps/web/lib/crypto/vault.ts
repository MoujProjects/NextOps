import { gcm } from "@noble/ciphers/aes";
import { randomBytes } from "@noble/ciphers/webcrypto";

const MASTER_KEY_ENV = "NEXOPS_ENCRYPTION_KEY";

function getMasterKey(): Uint8Array {
  const hex = process.env[MASTER_KEY_ENV];
  if (!hex) throw new Error(`${MASTER_KEY_ENV} env var is required`);
  if (hex.length !== 64) throw new Error(`${MASTER_KEY_ENV} must be 32 bytes (64 hex chars)`);
  return new Uint8Array(Buffer.from(hex, "hex"));
}

function deriveKey(masterKey: Uint8Array, orgId: string): Uint8Array {
  // XOR master key with org-id-based salt for per-org isolation
  const encoder = new TextEncoder();
  const salt = encoder.encode(orgId.padEnd(32, "0").slice(0, 32));
  const derived = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    derived[i] = masterKey[i] ^ salt[i];
  }
  return derived;
}

export async function encryptApiKey(plaintext: string, orgId: string): Promise<{ ciphertext: string; iv: string }> {
  const key = deriveKey(getMasterKey(), orgId);
  const iv = randomBytes(12);
  const cipher = gcm(key, iv);
  const encoder = new TextEncoder();
  const encrypted = cipher.encrypt(encoder.encode(plaintext));
  return {
    ciphertext: Buffer.from(encrypted).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
  };
}

export async function decryptApiKey(ciphertext: string, iv: string, orgId: string): Promise<string> {
  const key = deriveKey(getMasterKey(), orgId);
  const ivBytes = new Uint8Array(Buffer.from(iv, "base64"));
  const cipher = gcm(key, ivBytes);
  const decrypted = cipher.decrypt(new Uint8Array(Buffer.from(ciphertext, "base64")));
  return new TextDecoder().decode(decrypted);
}
