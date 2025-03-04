// utils/validation.util.ts

import { z } from 'zod';

/**
 * Schema for validating an email address.
 */
export const emailSchema = z.string().email({
  message: "Invalid email address.",
});

/**
 * Schema for validating a phone number in E.164 format.
 */
export const phoneNumberSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, {
  message: "Phone number must be in E.164 format (e.g., +1234567890).",
});

/**
 * Schema for validating a username.
 * - Minimum length: 3 characters
 * - Maximum length: 20 characters
 * - Only letters, numbers, and underscores allowed.
 */
export const usernameSchema = z.string()
  .min(3, { message: "Username must be at least 3 characters long." })
  .max(20, { message: "Username cannot exceed 20 characters." })
  .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores." });

/**
 * Schema for validating a password.
 * - Minimum length: 8 characters
 * - Maximum length: 100 characters
 * - Must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.
 */
export const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters long." })
  .max(100, { message: "Password cannot exceed 100 characters." })
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    { message: "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&)." }
  );

/**
 * Composite schema for login information.
 * Some fields are optional depending on the context (email, username, phone).
 */
export const loginInfoSchema = z.object({
  email: emailSchema.optional(),
  username: usernameSchema.optional(),
  phone: phoneNumberSchema.optional(),
  password: passwordSchema,
});

/**
 * Utility validation functions that return true/false.
 */
export function validateEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch (e) {
    return false;
  }
}

export function validatePhoneNumber(phone: string): boolean {
  try {
    phoneNumberSchema.parse(phone);
    return true;
  } catch (e) {
    return false;
  }
}

export function validateUsername(username: string): boolean {
  try {
    usernameSchema.parse(username);
    return true;
  } catch (e) {
    return false;
  }
}

export function validatePassword(password: string): boolean {
  try {
    passwordSchema.parse(password);
    return true;
  } catch (e) {
    return false;
  }
}
