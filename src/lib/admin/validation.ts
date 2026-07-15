import { EMAIL_RE } from '@/lib/auth/validation';
import type { AdminRole } from './session';

export type AdminLoginInput = {
  email: string;
  password: string;
};

export function validateAdminLogin(input: AdminLoginInput): Partial<Record<keyof AdminLoginInput, string>> {
  const errors: Partial<Record<keyof AdminLoginInput, string>> = {};

  if (!EMAIL_RE.test(input.email)) errors.email = 'Enter a valid email address.';
  if (!input.password) errors.password = 'Enter your password.';

  return errors;
}

export type NewAdminInput = {
  email: string;
  password: string;
  role: AdminRole;
};

export function validateNewAdmin(input: NewAdminInput): Partial<Record<keyof NewAdminInput, string>> {
  const errors: Partial<Record<keyof NewAdminInput, string>> = {};

  if (!EMAIL_RE.test(input.email)) errors.email = 'Enter a valid email address.';
  if (input.password.length < 8) errors.password = 'Password must be at least 8 characters.';
  if (input.role !== 'admin' && input.role !== 'master_admin') errors.role = 'Invalid role.';

  return errors;
}

export type PackageInput = {
  name: string;
  tier: string;
  priceCents: number;
  description?: string;
};

export function validatePackage(input: PackageInput): Partial<Record<keyof PackageInput, string>> {
  const errors: Partial<Record<keyof PackageInput, string>> = {};

  if (!input.name.trim()) errors.name = 'Enter a package name.';
  if (!input.tier.trim()) errors.tier = 'Enter a tier (e.g. free, advanced).';
  if (!Number.isInteger(input.priceCents) || input.priceCents < 0) {
    errors.priceCents = 'Price must be a whole number of cents, 0 or more.';
  }

  return errors;
}
