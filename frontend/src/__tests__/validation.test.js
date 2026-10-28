import {
  getPasswordStrength,
  validateConfirmPassword,
  validateEmail,
  validateFullName,
  validateNewPassword,
} from '../utils/validation.js';

describe('validation helpers', () => {
  it('validates email', () => {
    expect(validateEmail('')).toMatch(/required/i);
    expect(validateEmail('nope')).toMatch(/valid email/i);
    expect(validateEmail('a@b')).toMatch(/valid email/i);
    expect(validateEmail(' asha@example.com ')).toBe('');
  });

  it('validates full name', () => {
    expect(validateFullName('  ')).toMatch(/required/i);
    expect(validateFullName('A')).toMatch(/at least 2/i);
    expect(validateFullName('Asha Verma')).toBe('');
  });

  it('validates new password rules', () => {
    expect(validateNewPassword('')).toMatch(/required/i);
    expect(validateNewPassword('short1A')).not.toBe('');
    expect(validateNewPassword('alllowercase1')).not.toBe('');
    expect(validateNewPassword('NoNumbersHere')).not.toBe('');
    expect(validateNewPassword('Sup3rSecret')).toBe('');
  });

  it('validates password confirmation', () => {
    expect(validateConfirmPassword('abc', '')).toMatch(/confirm/i);
    expect(validateConfirmPassword('abc', 'abd')).toMatch(/do not match/i);
    expect(validateConfirmPassword('abc', 'abc')).toBe('');
  });

  it('scores password strength', () => {
    expect(getPasswordStrength('').score).toBe(0);
    expect(getPasswordStrength('abc').label).toBe('Weak');
    expect(getPasswordStrength('abcdefgh1').label).toBe('Fair');
    expect(getPasswordStrength('Abcdefg1').label).toBe('Good');
    expect(getPasswordStrength('Abcdefghij1!').label).toBe('Strong');
  });
});
