// utils/crypto.util.ts

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// Configure the cost factor (salt rounds) via environment variable, with a default value of 12.
const SALT_ROUNDS: number = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10);

/**
 * Generates a random token.
 * @param length Number of bytes to generate (default: 32)
 * @returns A hex-encoded random token.
 */
export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hashes a password using bcrypt.
 * @param password The plain text password.
 * @returns A Promise that resolves to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new Error(`Error hashing password: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Verifies that a plain text password matches the hashed password.
 * @param password The plain text password.
 * @param hashedPassword The stored hashed password.
 * @returns A Promise that resolves to true if the password matches, false otherwise.
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error(`Error verifying password: ${error instanceof Error ? error.message : error}`);
  }
}
