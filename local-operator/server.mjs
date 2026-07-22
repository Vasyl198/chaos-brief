#!/usr/bin/env node
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CodexAppServerClient } from './codex-client.mjs';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const defaultPublicRoot = resolve(moduleDirectory, 'public');
const contentTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const publicOrigin = process.env.CHAOS_BRIEF_PUBLIC_ORIGIN || 'https://vasyl198.github.io';
const bridgeLifetimeMs = 30 * 60 * 1000;

function sendJson(response, status, value, extraHeaders = {}) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extraHeaders });
  response.end(JSON.stringify(value));
}

function securityHeaders() {
  return {
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'no-referrer',
    'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'"
  };
}

function isLocalOrigin(origin) {
  return !origin || /^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/.test(origin);
}

function publicCorsHeaders(origin, bridgeEnabled, request) {
  if (origin !== publicOrigin || !bridgeEnabled) return {};
  const headers = {
    'access-control-allow-origin': publicOrigin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-operator-token',
    'access-control-max-age': '300',
    'vary': 'Origin, Access-Control-Request-Private-Network'
  };
  if (request.headers['access-control-request-private-network'] === 'true') headers['access-control-allow-private-network'] = 'true';
  return headers;
}

function readJson(request, limit = 12_000) {
  return new Promise((resolvePromise, reject) => {
    let body = ''; let size = 0;
    request.setEncoding('utf8');
    request.on('data', (chunk) => { size += Buffer.byteLength(chunk); if (size > limit) reject(new Error('Request is too large.')); else body += chunk; });
    request.on('end', () => { try { resolvePromise(JSON.parse(body || '{}')); } catch { reject(new Error('Request must be valid JSON.')); } });
    request.on('error', reject);
  });
}

export function createLocalOperatorServer({ analyze, publicRoot = defaultPublicRoot } = {}) {
  const client = analyze ? null : new CodexAppServerClient();
  const analyzer = analyze || ((text) => client.analyze(text));
  const sessionToken = randomBytes(24).toString('hex');
  let bridgeExpiresAt = 0;
  let queue = Promise.resolve();
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || '127.0.0.1'}`);
    const origin = request.headers.origin;
    const bridgeEnabled = Date.now() < bridgeExpiresAt;
    const cors = publicCorsHeaders(origin, bridgeEnabled, request);
    const headers = { ...securityHeaders(), ...cors };

    if (request.method === 'OPTIONS') {
      if (origin === publicOrigin && bridgeEnabled) { response.writeHead(204, headers); response.end(); return; }
      return sendJson(response, 403, { error: 'Public bridge is not enabled for this origin.' }, securityHeaders());
    }

    if (url.pathname === '/api/session' && request.method === 'GET') {
      if (!isLocalOrigin(origin) && !(origin === publicOrigin && bridgeEnabled)) return sendJson(response, 403, { error: 'Public bridge is not enabled for this origin.' }, securityHeaders());
      return sendJson(response, 200, {
        token: sessionToken,
        mode: 'local-operator',
        codex: client?.started ? 'connected' : 'starts on first request',
        publicBridge: { enabled: bridgeEnabled, origin: publicOrigin, expiresAt: bridgeEnabled ? new Date(bridgeExpiresAt).toISOString() : null }
      }, headers);
    }

    if (url.pathname === '/api/bridge/enable' && request.method === 'POST') {
      if (!isLocalOrigin(origin) || request.headers['x-operator-token'] !== sessionToken) return sendJson(response, 403, { error: 'Only the local operator page can enable the public bridge.' }, securityHeaders());
      bridgeExpiresAt = Date.now() + bridgeLifetimeMs;
      return sendJson(response, 200, { enabled: true, origin: publicOrigin, expiresAt: new Date(bridgeExpiresAt).toISOString() }, securityHeaders());
    }

    if (url.pathname === '/api/bridge/disable' && request.method === 'POST') {
      if (!isLocalOrigin(origin) || request.headers['x-operator-token'] !== sessionToken) return sendJson(response, 403, { error: 'Only the local operator page can disable the public bridge.' }, securityHeaders());
      bridgeExpiresAt = 0;
      return sendJson(response, 200, { enabled: false, origin: publicOrigin, expiresAt: null }, securityHeaders());
    }

    if (url.pathname === '/api/analyze' && request.method === 'POST') {
      if (!isLocalOrigin(origin) && !(origin === publicOrigin && bridgeEnabled)) return sendJson(response, 403, { error: 'Cross-origin requests are not allowed.' }, securityHeaders());
      if (request.headers['x-operator-token'] !== sessionToken) return sendJson(response, 403, { error: 'Invalid local operator session.' }, headers);
      let body;
      try { body = await readJson(request); } catch (error) { return sendJson(response, 400, { error: error.message }, headers); }
      const text = typeof body.request === 'string' ? body.request.trim() : '';
      if (!text || text.length > 4000) return sendJson(response, 400, { error: 'Request must contain between 1 and 4000 characters.' }, headers);
      try {
        const work = queue.then(() => analyzer(text), () => analyzer(text));
        queue = work.catch(() => {});
        const result = await work;
        return sendJson(response, 200, result, headers);
      } catch (error) {
        return sendJson(response, 502, { error: error.message || 'Codex could not analyze this request.' }, headers);
      }
    }
    if (url.pathname.startsWith('/api/')) return sendJson(response, 404, { error: 'Not found.' }, headers);
    const relativePath = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\/+/, '');
    if (!['index.html', 'app.js', 'style.css', 'bridge.css'].includes(relativePath)) return sendJson(response, 404, { error: 'Not found.' }, headers);
    try {
      const content = await readFile(resolve(publicRoot, relativePath));
      response.writeHead(200, { 'content-type': contentTypes[extname(relativePath)] || 'application/octet-stream', 'cache-control': 'no-store', ...headers }); response.end(content);
    } catch { sendJson(response, 404, { error: 'Not found.' }, headers); }
  });
  server.on('close', () => client?.stop());
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.CHAOS_BRIEF_OPERATOR_PORT || 4183);
  createLocalOperatorServer().listen(port, '127.0.0.1', () => console.log(`Chaos Brief Local Operator: http://127.0.0.1:${port}`));
}
