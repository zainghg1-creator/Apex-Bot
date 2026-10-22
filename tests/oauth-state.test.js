'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createOAuthState, isValidOAuthState } = require('../oauth-state');

test('creates unpredictable OAuth state values with the expected length', () => {
  const first = createOAuthState();
  const second = createOAuthState();

  assert.match(first, /^[a-f0-9]{64}$/);
  assert.match(second, /^[a-f0-9]{64}$/);
  assert.notEqual(first, second);
});

test('accepts only the exact matching OAuth state', () => {
  const state = createOAuthState();

  assert.equal(isValidOAuthState(state, state), true);
  assert.equal(isValidOAuthState(state, createOAuthState()), false);
  assert.equal(isValidOAuthState(undefined, state), false);
  assert.equal(isValidOAuthState(state, undefined), false);
  assert.equal(isValidOAuthState('short', 'short'), false);
  assert.equal(isValidOAuthState('z'.repeat(64), 'z'.repeat(64)), false);
});
