'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { securityMiddleware, validateEnvironment } = require('../security-middleware');

function createRequest({
  path = '/',
  method = 'GET',
  ip = '127.0.0.1',
  session = null,
  accessToken = session?.accessToken,
  origin = undefined,
  host = 'apex.example',
  protocol = 'https'
} = {}) {
  return {
    path,
    method,
    ip,
    session,
    accessToken,
    protocol,
    get(name) {
      if (name.toLowerCase() === 'origin') return origin;
      if (name.toLowerCase() === 'host') return host;
      return undefined;
    }
  };
}

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    headers: {},
    removedHeaders: [],
    setHeader(name, value) {
      this.headers[name] = value;
    },
    removeHeader(name) {
      this.removedHeaders.push(name);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    sendStatus(code) {
      this.statusCode = code;
      return this;
    }
  };
}

test('adds baseline security headers to public requests', async () => {
  const req = createRequest({ path: '/' });
  const res = createResponse();
  let nextCalled = false;

  await securityMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(res.headers['X-Frame-Options'], 'DENY');
  assert.equal(res.headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
  assert.ok(res.removedHeaders.includes('X-Powered-By'));
});

test('rejects unauthenticated requests to guild-scoped API routes', async () => {
  const req = createRequest({
    path: '/api/guild/123456789012345678/config',
    ip: '127.0.0.2'
  });
  const res = createResponse();
  let nextCalled = false;

  await securityMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: 'not_authenticated' });
  assert.equal(nextCalled, false);
});

test('rejects unauthenticated state-changing API requests', async () => {
  const req = createRequest({
    path: '/api/test-action',
    method: 'POST',
    ip: '127.0.0.3'
  });
  const res = createResponse();
  let nextCalled = false;

  await securityMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { error: 'not_authenticated' });
  assert.equal(nextCalled, false);
});

test('rejects cross-origin writes even for a Discord administrator', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => [{
      id: '123456789012345678',
      owner: false,
      permissions: '8'
    }]
  });

  try {
    const req = createRequest({
      path: '/api/guild/123456789012345678/config',
      method: 'POST',
      ip: '127.0.0.4',
      session: { user: { id: 'test-admin-1' }, accessToken: 'test-token' },
      origin: 'https://attacker.example',
      host: 'apex.example'
    });
    const res = createResponse();
    let nextCalled = false;

    await securityMiddleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, { error: 'origin_not_allowed' });
    assert.equal(nextCalled, false);
  } finally {
    global.fetch = originalFetch;
  }
});

test('allows same-origin writes from a Discord administrator', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => [{
      id: '123456789012345679',
      owner: false,
      permissions: '8'
    }]
  });

  try {
    const req = createRequest({
      path: '/api/guild/123456789012345679/config',
      method: 'POST',
      ip: '127.0.0.5',
      session: { user: { id: 'test-admin-2' }, accessToken: 'test-token' },
      origin: 'https://apex.example',
      host: 'apex.example'
    });
    const res = createResponse();
    let nextCalled = false;

    await securityMiddleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 200);
    assert.equal(nextCalled, true);
  } finally {
    global.fetch = originalFetch;
  }
});


test('rejects state-changing API requests without an Origin header', async () => {
  const req = createRequest({
    path: '/api/test-action',
    method: 'POST',
    ip: '127.0.0.6',
    session: { user: { id: 'test-admin-3' }, accessToken: 'test-token' }
  });
  const res = createResponse();
  let nextCalled = false;

  await securityMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { error: 'origin_not_allowed' });
  assert.equal(nextCalled, false);
});

test('rejects users without Discord administrator permissions', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => [{
      id: '123456789012345681',
      owner: false,
      permissions: '2048'
    }]
  });

  try {
    const req = createRequest({
      path: '/api/guild/123456789012345681/config',
      ip: '127.0.0.7',
      session: { user: { id: 'test-member-1' }, accessToken: 'test-token' }
    });
    const res = createResponse();
    let nextCalled = false;

    await securityMiddleware(req, res, () => {
      nextCalled = true;
    });

    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, { error: 'not_guild_admin' });
    assert.equal(nextCalled, false);
  } finally {
    global.fetch = originalFetch;
  }
});


test('requires a strong session secret when NODE_ENV is missing', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousSecret = process.env.SESSION_SECRET;
  delete process.env.NODE_ENV;
  delete process.env.SESSION_SECRET;

  try {
    assert.throws(
      () => validateEnvironment(),
      /SESSION_SECRET muss in Production gesetzt sein/
    );
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = previousSecret;
  }
});

test('does not require a production secret in explicit development mode', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousSecret = process.env.SESSION_SECRET;
  process.env.NODE_ENV = 'development';
  delete process.env.SESSION_SECRET;

  try {
    assert.doesNotThrow(() => validateEnvironment());
  } finally {
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
    if (previousSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = previousSecret;
  }
});
