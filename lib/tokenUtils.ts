import crypto from 'crypto'
import bcrypt from 'bcryptjs'

/**
 * Generate a secure random token (32 bytes, hex-encoded)
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash a token using bcrypt (async)
 */
export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10)
}

/**
 * Verify a token against its hash
 */
export async function verifyToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash)
}

/**
 * Store token in localStorage with a bill_id key
 */
export function storeGuestToken(billId: string, token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`guest_token_${billId}`, token)
  }
}

/**
 * Retrieve token from localStorage
 */
export function getGuestToken(billId: string): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(`guest_token_${billId}`)
  }
  return null
}

/**
 * Clear token from localStorage
 */
export function clearGuestToken(billId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`guest_token_${billId}`)
  }
}
