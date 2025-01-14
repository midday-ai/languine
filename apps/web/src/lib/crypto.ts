const SECRET_KEY = process.env.ENCRYPTION_SECRET!;
const ALGORITHM = { name: "AES-GCM", length: 256 };
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    ALGORITHM,
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encrypt(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await deriveKey(SECRET_KEY, salt);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM.name,
      iv,
    },
    key,
    encoder.encode(text),
  );

  const result = new Uint8Array([...iv, ...salt, ...new Uint8Array(encrypted)]);

  return btoa(String.fromCharCode(...result));
}

export async function decrypt(encryptedText: string): Promise<string> {
  const decoder = new TextDecoder();
  const buffer = Uint8Array.from(atob(encryptedText), (c) => c.charCodeAt(0));

  const iv = buffer.slice(0, IV_LENGTH);
  const salt = buffer.slice(IV_LENGTH, IV_LENGTH + SALT_LENGTH);
  const encrypted = buffer.slice(IV_LENGTH + SALT_LENGTH);

  const key = await deriveKey(SECRET_KEY, salt);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: ALGORITHM.name,
      iv,
    },
    key,
    encrypted,
  );

  return decoder.decode(decrypted);
}
