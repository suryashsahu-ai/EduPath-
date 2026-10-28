// Client-side validation. The backend enforces the same rules - this is for fast feedback.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateFullName(value) {
  const name = value.trim();
  if (!name) return 'Full name is required.';
  if (name.length < 2) return 'Full name must be at least 2 characters.';
  if (name.length > 100) return 'Full name must be 100 characters or fewer.';
  return '';
}

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return 'Email address is required.';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
  return '';
}

export const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'case', label: 'Upper and lower case letters', test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: 'number', label: 'At least one number', test: (p) => /\d/.test(p) },
];

export function validateNewPassword(value) {
  if (!value) return 'Password is required.';
  if (value.length > 128) return 'Password must be 128 characters or fewer.';
  if (PASSWORD_RULES.some((rule) => !rule.test(value))) {
    return 'Password must be at least 8 characters with upper case, lower case and a number.';
  }
  return '';
}

export function validateConfirmPassword(password, confirmation) {
  if (!confirmation) return 'Please confirm your password.';
  if (password !== confirmation) return 'Passwords do not match.';
  return '';
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

/** Returns { score: 0-4, label, rules: [{id, label, met}] }. */
export function getPasswordStrength(password) {
  const rules = PASSWORD_RULES.map((rule) => ({ id: rule.id, label: rule.label, met: rule.test(password) }));
  if (!password) return { score: 0, label: '', rules };

  const metCount = rules.filter((rule) => rule.met).length;
  const bonus = metCount === rules.length && password.length >= 12 && /[^A-Za-z0-9]/.test(password) ? 1 : 0;
  const score = Math.max(1, metCount) + bonus;
  return { score, label: STRENGTH_LABELS[score], rules };
}
