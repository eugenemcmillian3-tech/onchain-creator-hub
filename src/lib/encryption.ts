// Secret Encryption Utilities - AES-256 encryption for sensitive data

import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.SECRET_ENCRYPTION_KEY || 'default-32-byte-key-for-dev-only!'

/**
 * Encrypt a sensitive value
 * @param plainText The text to encrypt
 * @returns Object containing encrypted data and initialization vector
 */
export function encryptSecret(plainText: string): { encrypted: string; iv: string } {
  if (!plainText) {
    throw new Error('Cannot encrypt empty value')
  }

  const iv = CryptoJS.lib.WordArray.random(16).toString()
  const encrypted = CryptoJS.AES.encrypt(plainText, ENCRYPTION_KEY, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString()

  return {
    encrypted,
    iv,
  }
}

/**
 * Decrypt a sensitive value
 * @param encryptedData The encrypted data
 * @param iv The initialization vector used during encryption
 * @returns The decrypted plain text
 */
export function decryptSecret(encryptedData: string, iv: string): string {
  if (!encryptedData || !iv) {
    throw new Error('Invalid encrypted data or IV')
  }

  const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY, {
    iv: CryptoJS.enc.Hex.parse(iv),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  })

  return decrypted.toString(CryptoJS.enc.Utf8)
}

/**
 * Mask a secret for display (show only first 4 and last 4 characters)
 * @param secret The secret to mask
 * @returns Masked secret string
 */
export function maskSecret(secret: string): string {
  if (!secret || secret.length <= 8) {
    return '••••••••'
  }

  const firstFour = secret.substring(0, 4)
  const lastFour = secret.substring(secret.length - 4)
  return `${firstFour}••••••••${lastFour}`
}

/**
 * Validate encryption key is properly configured
 * @returns boolean indicating if encryption is properly configured
 */
export function isEncryptionConfigured(): boolean {
  const key = process.env.SECRET_ENCRYPTION_KEY
  if (!key || key === 'default-32-byte-key-for-dev-only!') {
    console.warn('WARNING: Using default encryption key. Set SECRET_ENCRYPTION_KEY in production!')
    return false
  }
  return key.length === 64 // 32 bytes = 64 hex characters
}

export type EncryptedSecret = {
  encrypted: string
  iv: string
}
