'use strict';

const crypto = require('node:crypto');

function createOAuthState() {
  return crypto.randomBytes(32).toString('hex');
}

function isValidOAuthState(received, expected) {
  if (
    typeof received !== 'string' ||
    typeof expected !== 'string' ||
    received.length !== 64 ||
    expected.length !== 64
  ) {
    return false;
  }

  const receivedBuffer = Buffer.from(received, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (receivedBuffer.length !== 32 || expectedBuffer.length !== 32) return false;
  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

module.exports = { createOAuthState, isValidOAuthState };
