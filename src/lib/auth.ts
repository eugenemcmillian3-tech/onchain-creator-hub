// Authentication Utilities - SIWE (Sign-In with Ethereum) implementation

import { ethers } from 'ethers'
import prisma from './db'

const ADMIN_WALLET_ADDRESS = process.env.ADMIN_WALLET_ADDRESS?.toLowerCase() || ''

/**
 * Generate a nonce for SIWE authentication
 * @param address The wallet address
 * @returns The generated nonce
 */
export async function generateNonce(address: string): Promise<string> {
  const nonce = ethers.randomBytes(32).toString('hex')
  
  // Store nonce in database with 1 hour expiry
  await prisma.nonce.upsert({
    where: { address: address.toLowerCase() },
    update: {
      nonce,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      used: false,
    },
    create: {
      address: address.toLowerCase(),
      nonce,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      used: false,
    },
  })

  return nonce
}

/**
 * Verify SIWE signature
 * @param address The wallet address
 * @param signature The signature to verify
 * @param nonce The nonce used in signing
 * @returns Object with success status and message
 */
export async function verifySignature(
  address: string,
  signature: string,
  nonce: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Get stored nonce
    const storedNonce = await prisma.nonce.findUnique({
      where: { address: address.toLowerCase() },
    })

    if (!storedNonce) {
      return { success: false, message: 'No nonce found for this address' }
    }

    if (storedNonce.used) {
      return { success: false, message: 'Nonce has already been used' }
    }

    if (storedNonce.expiresAt < new Date()) {
      return { success: false, message: 'Nonce has expired' }
    }

    if (storedNonce.nonce !== nonce) {
      return { success: false, message: 'Invalid nonce' }
    }

    // Verify signature using ethers
    const recoveredAddress = ethers.verifyMessage(
      `Sign in to Onchain Creator Hub\n\nNonce: ${nonce}`,
      signature
    )

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return { success: false, message: 'Invalid signature' }
    }

    // Mark nonce as used
    await prisma.nonce.update({
      where: { id: storedNonce.id },
      data: { used: true },
    })

    return { success: true, message: 'Signature verified' }
  } catch (error) {
    console.error('Signature verification error:', error)
    return { success: false, message: 'Signature verification failed' }
  }
}

/**
 * Check if an address is the admin wallet
 * @param address The wallet address to check
 * @returns boolean indicating if the address is admin
 */
export function isAdminWallet(address: string): boolean {
  if (!ADMIN_WALLET_ADDRESS) {
    console.warn('ADMIN_WALLET_ADDRESS not configured')
    return false
  }
  return address.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase()
}

/**
 * Create admin session data
 * @param address The admin wallet address
 * @returns Session data object
 */
export function createAdminSession(address: string) {
  return {
    address: address.toLowerCase(),
    role: 'admin',
    isAdmin: true,
    createdAt: Date.now(),
  }
}

/**
 * Parse session data from cookie value
 * @param cookieValue The cookie value to parse
 * @returns Session data or null if invalid
 */
export function parseSessionData(cookieValue: string | undefined) {
  try {
    if (!cookieValue) {
      return null
    }

    // Simple session parsing (in production, use proper JWT or encrypted session)
    const sessionData = Buffer.from(cookieValue, 'base64').toString('utf-8')
    return JSON.parse(sessionData)
  } catch {
    return null
  }
}

/**
 * Create session cookie value
 * @param sessionData The session data to encode
 * @returns Base64 encoded session string
 */
export function createSessionCookieValue(sessionData: object): string {
  return Buffer.from(JSON.stringify(sessionData)).toString('base64')
}

/**
 * Get session cookie options
 * @returns Cookie options object
 */
export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  }
}

/**
 * Verify admin session data
 * @param sessionData The session data to verify
 * @returns Object with success status and user data or error
 */
export async function verifyAdminSessionData(sessionData: any) {
  if (!sessionData) {
    return { success: false, error: 'No session found' }
  }

  if (sessionData.role !== 'admin') {
    return { success: false, error: 'Unauthorized' }
  }

  if (!isAdminWallet(sessionData.address)) {
    return { success: false, error: 'Invalid admin wallet' }
  }

  return { 
    success: true, 
    user: {
      address: sessionData.address,
      role: 'admin',
    }
  }
}

/**
 * Create SIWE message for signing
 * @param nonce The nonce to include in the message
 * @returns The formatted SIWE message
 */
export function createSiweMessage(nonce: string): string {
  return `Sign in to Onchain Creator Hub

This request will not trigger a blockchain transaction or cost any gas fees.

Nonce: ${nonce}`
}
