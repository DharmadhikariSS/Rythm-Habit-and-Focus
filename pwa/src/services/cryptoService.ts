import { DecryptedDiaryPayload } from '../types';

// Convert Uint8Array to Base64 string
function bufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.byteLength; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

// Convert Base64 string to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export class CryptoService {
  // Derive an AES-GCM CryptoKey using PBKDF2 from a user's secret PIN
  private static async deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const pinBuffer = enc.encode(pin);

    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      pinBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Hash a PIN for local verification
  public static async hashPin(pin: string, saltBase64: string): Promise<string> {
    const enc = new TextEncoder();
    const salt = base64ToBuffer(saltBase64);
    const pinBuffer = enc.encode(pin);
    const combined = new Uint8Array(salt.length + pinBuffer.length);
    combined.set(salt);
    combined.set(pinBuffer, salt.length);

    const hashBuffer = await window.crypto.subtle.digest('SHA-256', combined);
    return bufferToBase64(new Uint8Array(hashBuffer));
  }

  // Generate a random salt in base64
  public static generateSalt(): string {
    const salt = new Uint8Array(16);
    window.crypto.getRandomValues(salt);
    return bufferToBase64(salt);
  }

  // Encrypt a diary payload with the user's PIN
  public static async encrypt(
    payload: DecryptedDiaryPayload,
    pin: string
  ): Promise<{ ciphertext: string; salt: string; iv: string }> {
    const saltBytes = new Uint8Array(16);
    window.crypto.getRandomValues(saltBytes);

    const iv = new Uint8Array(12); // Standard 96-bit IV for AES-GCM
    window.crypto.getRandomValues(iv);

    const key = await this.deriveKey(pin, saltBytes);
    const enc = new TextEncoder();
    const encodedData = enc.encode(JSON.stringify(payload));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource,
      },
      key,
      encodedData
    );

    return {
      ciphertext: bufferToBase64(new Uint8Array(encryptedBuffer)),
      salt: bufferToBase64(saltBytes),
      iv: bufferToBase64(iv),
    };
  }

  // Decrypt a diary entry with the user's PIN
  public static async decrypt(
    ciphertextBase64: string,
    saltBase64: string,
    ivBase64: string,
    pin: string
  ): Promise<DecryptedDiaryPayload> {
    const saltBytes = base64ToBuffer(saltBase64);
    const iv = base64ToBuffer(ivBase64);
    const ciphertext = base64ToBuffer(ciphertextBase64);

    const key = await this.deriveKey(pin, saltBytes);

    try {
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as unknown as BufferSource,
        },
        key,
        ciphertext as unknown as BufferSource
      );

      const dec = new TextDecoder();
      const jsonString = dec.decode(decryptedBuffer);
      return JSON.parse(jsonString) as DecryptedDiaryPayload;
    } catch {
      throw new Error('Invalid PIN: Unable to decrypt entry.');
    }
  }
}
