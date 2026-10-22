'use strict';

const crypto = require('node:crypto');

const DEVELOPMENT_SECRET = 'development-only-secret-change-me';

function deriveKey(secret = process.env.SESSION_SECRET) {
  const value = secret || DEVELOPMENT_SECRET;
  return crypto.createHash('sha256').update(value, 'utf8').digest();
}

function encryptAccessToken(token, secret = process.env.SESSION_SECRET) {
  if (typeof token !== 'string' || token.length === 0) {
    throw new TypeError('OAuth access token must be a non-empty string');
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveKey(secret), iv);
  const ciphertext = Buffer.concat([
    cipher.update(token, 'utf8'),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  return [
    'v1',
    iv.toString('base64url'),
    tag.toString('base64url'),
    ciphertext.toString('base64url')
  ].join('.');
}

function decryptAccessToken(value, secret = process.env.SESSION_SECRET) {
  if (typeof value !== 'string') return null;

  const parts = value.split('.');
  if (parts.length !== 4 || parts[0] !== 'v1') return null;

  try {
    const iv = Buffer.from(parts[1], 'base64url');
    const tag = Buffer.from(parts[2], 'base64url');
    const ciphertext = Buffer.from(parts[3], 'base64url');
    if (iv.length !== 12 || tag.length !== 16 || ciphertext.length === 0) return null;

    const decipher = crypto.createDecipheriv('aes-256-gcm', deriveKey(secret), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final()
    ]).toString('utf8');
  } catch {
    return null;
  }
}

module.exports = { encryptAccessToken, decryptAccessToken };
