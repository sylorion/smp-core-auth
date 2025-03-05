// tests/utils/validation.util.test.ts

import { validateEmail, validatePhoneNumber, validateUsername, validatePassword, emailSchema, phoneNumberSchema, usernameSchema, passwordSchema } from '../../utils/validation.util';

describe('Validation Utility', () => {
  describe('Email Validation', () => {
    test.each([
      ['user@example.com', true],
      ['invalid-email', false],
      ['another.user@domain.co.uk', true],
      ['user@.com', false],
    ])('validateEmail("%s") should return %s', (email, expected) => {
      expect(validateEmail(email)).toBe(expected);
    });
  });

  describe('Phone Number Validation', () => {
    test.each([
      ['+1234567890', true],
      ['123456', false],
      ['+19876543210', true],
      ['+1(800)1234567', false],
    ])('validatePhoneNumber("%s") should return %s', (phone, expected) => {
      expect(validatePhoneNumber(phone)).toBe(expected);
    });
  });

  describe('Username Validation', () => {
    test.each([
      ['user_1', true],
      ['ab', false], // too short
      ['this_is_a_very_long_username_exceeding_limit', false],
      ['validUser123', true],
      ['invalid-user', false],
    ])('validateUsername("%s") should return %s', (username, expected) => {
      expect(validateUsername(username)).toBe(expected);
    });
  });

  describe('Password Validation', () => {
    test.each([
      ['Password@123', true],
      ['short1!', false], // too short
      ['nocapitalletters@123', false],
      ['NOLOWERCASE@123', false],
      ['NoSpecialChar123', false],
      ['ValidPass#1', true],
    ])('validatePassword("%s") should return %s', (password, expected) => {
      expect(validatePassword(password)).toBe(expected);
    });
  });

  // Testing Zod schema errors (using try/catch)
  test('emailSchema should throw error for invalid email', () => {
    expect(() => emailSchema.parse('invalid-email')).toThrow();
  });

  test('phoneNumberSchema should throw error for invalid phone number', () => {
    expect(() => phoneNumberSchema.parse('12345')).toThrow();
  });

  test('usernameSchema should throw error for invalid username', () => {
    expect(() => usernameSchema.parse('ab')).toThrow();
  });

  test('passwordSchema should throw error for invalid password', () => {
    expect(() => passwordSchema.parse('short')).toThrow();
  });

  // Many iterations for data-driven tests
  for (let i = 0; i < 20; i++) {
    test(`iteration ${i}: validate random email pattern`, () => {
      const email = `user${i}@example.com`;
      expect(validateEmail(email)).toBe(true);
    });
  }
});
