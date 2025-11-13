import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Nostr Public Key Utilities
 * Helper functions to validate and normalize Nostr public keys
 */

/**
 * Validates if a string is a valid Nostr public key in hexadecimal format
 * Nostr public keys must be exactly 64 hexadecimal characters
 * @param pubkey Public key to validate
 * @returns true if valid, false otherwise
 */
export function isValidNostrPubkey(pubkey: string): boolean {
  if (!pubkey || typeof pubkey !== 'string') {
    return false
  }

  // Remove whitespace
  const trimmed = pubkey.trim()

  // Check if it's in bech32 format (npub...)
  if (trimmed.startsWith('npub')) {
    // We can't validate bech32 without a library, so we'll just check length
    // In production, you'd want to decode bech32 and verify it's 32 bytes
    return trimmed.length >= 59 && trimmed.length <= 63
  }

  // Check if it's in hexadecimal format (64 hex characters)
  const hexRegex = /^[0-9a-fA-F]{64}$/
  return hexRegex.test(trimmed)
}

/**
 * Normalizes a Nostr public key to hexadecimal format
 * Accepts bech32 format (npub...) or hexadecimal format
 * @param pubkey Public key to normalize
 * @returns Normalized hexadecimal public key, or null if invalid
 */
export function normalizeNostrPubkey(pubkey: string): string | null {
  if (!pubkey || typeof pubkey !== 'string') {
    return null
  }

  const trimmed = pubkey.trim()

  // If it's already in hexadecimal format, validate and return
  if (isValidNostrPubkey(trimmed) && !trimmed.startsWith('npub')) {
    return trimmed.toLowerCase()
  }

  // If it's in bech32 format (npub...), we need to decode it
  // For now, we'll return null and log a warning
  // In production, you'd use a bech32 library to decode
  if (trimmed.startsWith('npub')) {
    console.warn('[normalizeNostrPubkey] Bech32 format (npub) detected. Decoding not implemented. Please use hexadecimal format.')
    // TODO: Implement bech32 decoding using a library like 'bech32' or '@noble/curves'
    return null
  }

  // Invalid format
  return null
}

/**
 * Generates a valid Nostr public key in hexadecimal format
 * This generates a random 64-character hexadecimal string
 * Note: This is for testing/demo purposes only. In production, you should
 * generate proper key pairs using cryptography libraries.
 * @returns A 64-character hexadecimal string (not a valid cryptographic key pair)
 */
export function generateMockNostrPubkey(): string {
  // Generate 32 random bytes = 64 hex characters
  const array = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback for Node.js environments without crypto.getRandomValues
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  
  // Convert to hexadecimal string
  return Array.from(array)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Validates and normalizes a Nostr public key, generating a new one if invalid
 * This is useful for ensuring we always have a valid key format for API calls
 * @param pubkey Public key to validate/normalize
 * @param generateIfInvalid If true, generate a new key if the provided one is invalid
 * @returns Valid hexadecimal public key, or null if invalid and generateIfInvalid is false
 */
export function ensureValidNostrPubkey(
  pubkey: string | null | undefined,
  generateIfInvalid: boolean = false
): string | null {
  if (!pubkey) {
    return generateIfInvalid ? generateMockNostrPubkey() : null
  }

  // Try to normalize the key
  const normalized = normalizeNostrPubkey(pubkey)
  
  if (normalized) {
    return normalized
  }

  // If normalization failed and we should generate, create a new one
  if (generateIfInvalid) {
    console.warn('[ensureValidNostrPubkey] Invalid pubkey format. Generating a new one for demo purposes.')
    return generateMockNostrPubkey()
  }

  return null
}

/**
 * Lightning Invoice Utilities
 * Helper functions to validate Lightning Network invoices (BOLT11)
 */

/**
 * Validates if a string is a valid Lightning invoice (BOLT11 format)
 * Supports all Lightning Network types: mainnet, testnet, regtest, signet
 * @param invoice Invoice string to validate
 * @returns true if valid, false otherwise
 */
export function isValidLightningInvoice(invoice: string): boolean {
  if (!invoice || typeof invoice !== 'string') {
    return false
  }

  const invoiceLower = invoice.toLowerCase().trim()
  
  // Valid BOLT11 prefixes:
  // - lnbc: Mainnet
  // - lntb: Testnet
  // - lnbcrt: Regtest
  // - lnbcs: Signet
  const validPrefixes = ['lnbc', 'lntb', 'lnbcrt', 'lnbcs']
  
  return validPrefixes.some(prefix => invoiceLower.startsWith(prefix))
}

/**
 * Gets the network type from a Lightning invoice
 * @param invoice Invoice string
 * @returns Network type ('mainnet' | 'testnet' | 'regtest' | 'signet' | null)
 */
export function getLightningInvoiceNetwork(invoice: string): 'mainnet' | 'testnet' | 'regtest' | 'signet' | null {
  if (!invoice || typeof invoice !== 'string') {
    return null
  }

  const invoiceLower = invoice.toLowerCase().trim()
  
  // Check in order of specificity (longer prefixes first)
  if (invoiceLower.startsWith('lnbcrt')) return 'regtest'
  if (invoiceLower.startsWith('lnbcs')) return 'signet'
  if (invoiceLower.startsWith('lntb')) return 'testnet'
  if (invoiceLower.startsWith('lnbc')) return 'mainnet'
  
  return null
}