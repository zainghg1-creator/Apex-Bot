'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { encryptAccessToken, decryptAccessToken } = require('../session-token');

const SECRET = 'test-session-secret-that-is-long-enough-123456';

test('encrypts OAuth tokens without exposing their plaintext', () => {
  const token = 'oauth-access-token-super-secret';
  const encrypted = encryptAccessToken(token, SECRET);

  assert.notEqual(encrypted, token);
  assert.equal(encrypted.includes(token), false);
  assert.equal(decryptAccessToken(encrypted, SECRET), token);
});

test('uses a fresh nonce for every encryption', () => {
  const token = 'same-token';
  const first = encryptAccessToken(token, SECRET);
  const second = encryptAccessToken(token, SECRET);

  assert.notEqual(first, second);
  assert.equal(decryptAccessToken(first, SECRET), token);
  assert.equal(decryptAccessToken(second, SECRET), token);
});

test('rejects tampered tokens and a different encryption key', () => {
  const encrypted = encryptAccessToken('oauth-access-token', SECRET);
  const parts = encrypted.split('.');
  parts[3] = (parts[3][0] === 'A' ? 'B' : 'A') + parts[3].slice(1);

  assert.equal(decryptAccessToken(parts.join('.'), SECRET), null);
  assert.equal(decryptAccessToken(encrypted, SECRET + '-wrong'), null);
});

test('handles missing or malformed encrypted session values safely', () => {
  assert.equal(decryptAccessToken(undefined, SECRET), null);
  assert.equal(decryptAccessToken('not-a-token', SECRET), null);
  assert.equal(decryptAccessToken('v1.a.b.c', SECRET), null);
  assert.throws(() => encryptAccessToken('', SECRET), /non-empty string/);
});
