/** Minimal platform contracts keep the static site free of runtime dependencies. */
export interface D1Result<T = Record<string, unknown>> {
  success: boolean;
  results: T[];
  meta: { changes?: number; last_row_id?: number; [key: string]: unknown };
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(column?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = Record<string, unknown>>(
    statements: D1PreparedStatement[],
  ): Promise<D1Result<T>[]>;
}
export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  SITE_DB?: D1Database;
  LOCAL_OWNER_PREVIEW?: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
  OWNER_EMAIL?: string;
}
export interface Visitor {
  id: string;
  isNew: boolean;
}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function json(
  body: unknown,
  status = 200,
  extraHeaders?: HeadersInit,
): Response {
  const headers = new Headers(extraHeaders);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'private, no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'same-origin');
  return new Response(JSON.stringify(body), { status, headers });
}
export function privateError(message: string, status = 400): Response {
  return json({ message }, status);
}
export function requireSameOriginPOST(request: Request): void {
  if (request.method !== 'POST') return;
  if (request.headers.get('Origin') !== new URL(request.url).origin) {
    throw new HttpError(403, 'Please send this request from the website.');
  }
  const fetchSite = request.headers.get('Sec-Fetch-Site');
  if (fetchSite && fetchSite !== 'same-origin') {
    throw new HttpError(403, 'Please send this request from the website.');
  }
}
export async function readJSON(
  request: Request,
): Promise<Record<string, unknown>> {
  if (
    !/^application\/json(?:\s*;|$)/i.test(
      request.headers.get('Content-Type') ?? '',
    )
  ) {
    throw new HttpError(415, 'Send the message as JSON.');
  }
  const maximum = 10_000;
  const length = request.headers.get('Content-Length');
  if (length && Number(length) > maximum)
    throw new HttpError(413, 'The message is too large.');
  if (!request.body) throw new HttpError(400, 'A message is required.');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        await reader.cancel();
        throw new HttpError(413, 'The message is too large.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    const body: unknown = JSON.parse(
      new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    );
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw new Error('Object required');
    return body as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'The message could not be read.');
  }
}
export function getVisitor(request: Request): Visitor {
  const cookie = (request.headers.get('Cookie') ?? '')
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('vg_visitor='));
  const candidate = cookie?.slice('vg_visitor='.length);
  if (candidate && UUID_PATTERN.test(candidate))
    return { id: candidate.toLowerCase(), isNew: false };
  return { id: crypto.randomUUID(), isNew: true };
}
export function withVisitorCookie(
  response: Response,
  request: Request,
  visitor: Visitor,
): Response {
  if (!visitor.isNew) return response;
  const headers = new Headers(response.headers);
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  headers.append(
    'Set-Cookie',
    `vg_visitor=${visitor.id}; HttpOnly; SameSite=Lax; Path=/api; Max-Age=15552000${secure}`,
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// This is a modest per-isolate burst guard, not a global anti-abuse service.
// IP addresses are never stored: short-lived buckets use an isolate-salted hash.
const buckets = new Map<string, { count: number; expires: number }>();
let burstSalt: string | undefined;
export async function checkBurst(
  request: Request,
  visitor: Visitor,
  scope: string,
  maximum = 20,
  windowMs = 60_000,
): Promise<void> {
  const now = Date.now();
  burstSalt ??= crypto.randomUUID();
  for (const [key, bucket] of buckets)
    if (bucket.expires <= now) buckets.delete(key);
  const identities = [`visitor:${visitor.id}`];
  const address = request.headers.get('CF-Connecting-IP');
  if (address) {
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(`${burstSalt}:${address}`),
    );
    const hash = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('');
    identities.push(`network:${hash}`);
  }
  if (buckets.size > 10_000)
    throw new HttpError(429, 'Too many requests. Please try again shortly.');
  for (const identity of identities) {
    const key = `${scope}:${identity}`;
    const bucket = buckets.get(key) ?? { count: 0, expires: now + windowMs };
    if (bucket.count >= maximum)
      throw new HttpError(429, 'Please wait a moment before trying again.');
    bucket.count += 1;
    buckets.set(key, bucket);
  }
}
