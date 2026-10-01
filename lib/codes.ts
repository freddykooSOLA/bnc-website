import { randomBytes } from 'crypto';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** 產生不可猜測的參考編號，例如 BNC-E-7K2M9QPA。 */
export function makeRef(prefix: 'BNC-E' | 'BNC-S'): string {
  const bytes = randomBytes(8);
  let body = '';
  for (let i = 0; i < bytes.length; i += 1) {
    body += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `${prefix}-${body}`;
}

export function isRef(value: string, prefix: 'BNC-E' | 'BNC-S'): boolean {
  return new RegExp(`^${prefix}-[${ALPHABET}]{8}$`).test(value);
}

export function clip(value: unknown, max: number): string {
  return String(value ?? '').trim().slice(0, max);
}

export function hasAtLeastDigits(value: string, count: number): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= count && digits.length <= 20;
}
