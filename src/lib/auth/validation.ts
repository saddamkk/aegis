export type SignupInput = {
  name: string;
  org: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup(input: SignupInput): Partial<Record<keyof SignupInput, string>> {
  const errors: Partial<Record<keyof SignupInput, string>> = {};

  if (!input.name.trim()) errors.name = 'Enter your name.';
  if (!input.org.trim()) errors.org = 'Enter your company or organization.';
  if (!EMAIL_RE.test(input.email)) errors.email = 'Enter a valid email address.';
  if (input.password.length < 8) errors.password = 'Password must be at least 8 characters.';
  if (input.confirmPassword !== input.password) errors.confirmPassword = 'Passwords do not match.';

  return errors;
}

export function validateLogin(input: LoginInput): Partial<Record<keyof LoginInput, string>> {
  const errors: Partial<Record<keyof LoginInput, string>> = {};

  if (!EMAIL_RE.test(input.email)) errors.email = 'Enter a valid email address.';
  if (!input.password) errors.password = 'Enter your password.';

  return errors;
}
